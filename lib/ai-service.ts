import OpenAI from 'openai';
import { AIAnalysis, AIResponse, TicketPriority, TicketType, FAQ } from '@/types';
import { departments } from './departments';
import { searchFAQ } from './faq';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export class AIService {
  /**
   * Анализирует текст заявки и определяет категорию, приоритет, тип и отдел
   */
  static async analyzeTicket(text: string): Promise<AIAnalysis> {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback без API ключа
      return this.fallbackAnalysis(text);
    }

    try {
      const departmentList = departments.map(d => `${d.id}: ${d.name} (${d.description})`).join('\n');
      
      const prompt = `Проанализируй следующую заявку пользователя и определи:
1. Категорию (краткое описание проблемы)
2. Приоритет (low, medium, high, urgent)
3. Тип (question, issue, request, complaint, feedback)
4. Отдел из списка: ${departmentList}

Заявка: "${text}"

Ответь в формате JSON:
{
  "category": "краткое описание",
  "priority": "low|medium|high|urgent",
  "type": "question|issue|request|complaint|feedback",
  "departmentId": "id отдела",
  "confidence": 0.0-1.0
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты помощник для классификации заявок. Отвечай только валидным JSON без дополнительного текста.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const analysis = JSON.parse(content) as Omit<AIAnalysis, 'departmentName'> & { departmentId: string };
      
      const department = departments.find(d => d.id === analysis.departmentId);
      
      return {
        ...analysis,
        departmentId: analysis.departmentId,
        departmentName: department?.name || 'Общие вопросы',
        confidence: analysis.confidence || 0.7
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.fallbackAnalysis(text);
    }
  }

  /**
   * Генерирует ответ на вопрос пользователя с помощью ChatGPT
   */
  static async generateUserResponse(question: string, context?: {
    category?: string;
    type?: string;
    department?: string;
  }): Promise<AIResponse> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        answer: '',
        confidence: 0,
        shouldCloseTicket: false
      };
    }

    try {
      const contextInfo = context
        ? `\n\nКонтекст вопроса:\n- Категория: ${context.category || 'Не указана'}\n- Тип: ${context.type || 'Не указан'}\n- Отдел: ${context.department || 'Не указан'}`
        : '';

      const prompt = `Ты помощник службы поддержки. Пользователь задал вопрос: "${question}"${contextInfo}

Твоя задача:
1. Дать полезный, точный и дружелюбный ответ
2. Если это техническая проблема - предложи конкретные шаги решения
3. Если это вопрос о продукте/услуге - дай развернутую информацию
4. Если не уверен в ответе - предложи связаться со специалистом
5. Ответ должен быть на русском языке, вежливым и профессиональным

Сгенерируй ответ (только текст ответа, без дополнительных комментариев):`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты опытный оператор службы поддержки. Отвечай вежливо, профессионально и полезно. Всегда старайся помочь пользователю решить его проблему.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const answer = response.choices[0]?.message?.content?.trim() || '';
      
      if (!answer) {
        return {
          answer: '',
          confidence: 0,
          shouldCloseTicket: false
        };
      }

      // Определяем, является ли вопрос простым и можем ли мы уверенно ответить
      const confidencePrompt = `Проанализируй вопрос и ответ:

Вопрос: "${question}"
Ответ: "${answer}"

Оцени:
1. Является ли вопрос простым/стандартным? (да/нет)
2. Достаточно ли полный и точный ответ? (да/нет)
3. Нужна ли дополнительная информация от пользователя? (да/нет)
4. Может ли этот вопрос быть закрыт автоматически? (да/нет)

Ответь в формате JSON:
{
  "isSimple": true/false,
  "isComplete": true/false,
  "needsMoreInfo": true/false,
  "canAutoClose": true/false,
  "confidence": 0.0-1.0
}`;

      try {
        const confidenceResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Ты аналитик, который оценивает качество ответов службы поддержки. Отвечай только валидным JSON.'
            },
            {
              role: 'user',
              content: confidencePrompt
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
          max_tokens: 200
        });

        const confidenceData = JSON.parse(confidenceResponse.choices[0]?.message?.content || '{}');
        const confidence = confidenceData.confidence || 
          (confidenceData.canAutoClose && confidenceData.isComplete && !confidenceData.needsMoreInfo ? 0.8 : 0.6);

        return {
          answer,
          confidence: Math.min(confidence, 0.95), // Ограничиваем максимум
          shouldCloseTicket: confidence > 0.7 && confidenceData.canAutoClose !== false
        };
      } catch (error) {
        console.error('Confidence evaluation error:', error);
        // Fallback: простая эвристика
        const isSimpleQuestion = question.length < 200 && 
          !question.toLowerCase().includes('срочно') &&
          !question.toLowerCase().includes('критично') &&
          !question.toLowerCase().includes('не работает') &&
          answer.length > 50 &&
          !answer.toLowerCase().includes('не уверен') &&
          !answer.toLowerCase().includes('обратитесь') &&
          !answer.toLowerCase().includes('специалист');

        const confidence = isSimpleQuestion ? 0.75 : 0.6;

        return {
          answer,
          confidence,
          shouldCloseTicket: confidence > 0.7 && isSimpleQuestion
        };
      }
    } catch (error) {
      console.error('AI response generation error:', error);
      return {
        answer: '',
        confidence: 0,
        shouldCloseTicket: false
      };
    }
  }

  /**
   * Ищет ответ в FAQ и генерирует ответ
   */
  static async findAnswerInFAQ(question: string): Promise<AIResponse> {
    const faqResults = searchFAQ(question, 3);
    
    // Если есть совпадение в FAQ - используем его
    if (faqResults.length > 0) {
      const bestMatch = faqResults[0];
      
      if (!process.env.OPENAI_API_KEY) {
        return {
          answer: bestMatch.answer,
          confidence: 0.7,
          sourceFAQId: bestMatch.id,
          shouldCloseTicket: true
        };
      }

      try {
        const prompt = `Пользователь задал вопрос: "${question}"

Найденный ответ из базы знаний: "${bestMatch.answer}"

Сгенерируй дружелюбный и понятный ответ пользователю на основе найденной информации. 
Ответ должен быть на русском языке, вежливым и полным.

Ответ (только текст ответа, без дополнительных комментариев):`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Ты помощник службы поддержки. Отвечай вежливо и профессионально.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        });

        const answer = response.choices[0]?.message?.content || bestMatch.answer;
        const confidence = 0.85;

        return {
          answer: answer.trim(),
          confidence,
          sourceFAQId: bestMatch.id,
          shouldCloseTicket: confidence > 0.8
        };
      } catch (error) {
        console.error('AI FAQ error:', error);
        return {
          answer: bestMatch.answer,
          confidence: 0.7,
          sourceFAQId: bestMatch.id,
          shouldCloseTicket: true
        };
      }
    }

    // Если нет совпадения в FAQ, но есть API ключ - генерируем ответ через ChatGPT
    if (process.env.OPENAI_API_KEY) {
      return await this.generateUserResponse(question);
    }

    return {
      answer: '',
      confidence: 0,
      shouldCloseTicket: false
    };
  }

  /**
   * Генерирует варианты ответов для оператора с учетом контекста
   */
  static async generateResponseOptions(
    ticketDescription: string,
    conversationHistory: string[],
    count: number = 3,
    context?: {
      category?: string;
      priority?: string;
      type?: string;
      department?: string;
      title?: string;
    }
  ): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
      return [
        'Спасибо за обращение. Мы рассмотрим вашу заявку в ближайшее время.',
        'Понял вашу проблему. Давайте решим это вместе.',
        'Благодарим за обращение. Наш специалист свяжется с вами.'
      ];
    }

    try {
      const historyText = conversationHistory.length > 0 
        ? `\n\nИстория переписки:\n${conversationHistory.slice(-8).join('\n\n')}`
        : '';

      const contextInfo = context
        ? `\n\nКонтекст тикета:
- Тема: ${context.title || 'Не указана'}
- Категория: ${context.category || 'Не указана'}
- Приоритет: ${context.priority || 'Не указан'}
- Тип: ${context.type || 'Не указан'}
- Отдел: ${context.department || 'Не указан'}`
        : '';

      const prompt = `Ты опытный оператор службы поддержки. Проанализируй ситуацию и предложи ${count} варианта профессиональных ответов.

Исходная заявка: "${ticketDescription}"${contextInfo}${historyText}

Требования к ответам:
1. Учитывай контекст и историю переписки
2. Будь вежливым, профессиональным и понятным
3. Для срочных вопросов - более оперативный тон
4. Для технических проблем - предложи конкретные шаги
5. Для вопросов - дай развернутый ответ
6. Каждый ответ должен быть уникальным по подходу

Сгенерируй ${count} варианта ответов на русском языке.
Формат: просто список ответов, каждый с новой строки, без нумерации и маркеров.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты опытный оператор службы поддержки с отличными навыками общения. Генерируй профессиональные, вежливые и эффективные ответы, которые помогают решить проблему клиента.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content || '';
      const options = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Фильтруем пустые строки, нумерацию и маркеры
          return line.length > 10 && 
                 !line.match(/^\d+[\.\)]\s*/) &&
                 !line.match(/^[-•*]\s*/) &&
                 !line.toLowerCase().includes('вариант') &&
                 !line.toLowerCase().includes('ответ');
        })
        .slice(0, count);

      return options.length > 0 ? options : [
        'Спасибо за обращение. Мы рассмотрим вашу заявку в ближайшее время.'
      ];
    } catch (error) {
      console.error('AI response generation error:', error);
      return [
        'Спасибо за обращение. Мы рассмотрим вашу заявку в ближайшее время.'
      ];
    }
  }

  /**
   * Резюмирует переписку
   */
  static async summarizeConversation(messages: string[]): Promise<string> {
    if (messages.length === 0) return 'Нет сообщений для резюмирования.';

    if (!process.env.OPENAI_API_KEY) {
      return `Переписка содержит ${messages.length} сообщений. Основная тема: ${messages[0]?.substring(0, 100)}...`;
    }

    try {
      const conversationText = messages.join('\n\n');
      
      const prompt = `Резюмируй следующую переписку с клиентом. Выдели основные моменты, проблемы и решения.

Переписка:
${conversationText}

Резюме (краткое, на русском языке):`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты помощник для создания резюме переписки. Создавай краткие и информативные резюме.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      return response.choices[0]?.message?.content?.trim() || 'Не удалось создать резюме.';
    } catch (error) {
      console.error('AI summarization error:', error);
      return `Переписка содержит ${messages.length} сообщений.`;
    }
  }

  /**
   * Переводит текст между языками
   * Использует Google Translate для казахского, OpenAI для других языков
   */
  static async translateText(text: string, targetLanguage: string = 'en'): Promise<string> {
    // Для казахского языка используем Google Translate
    if (targetLanguage === 'kk') {
      try {
        const { translateWithGoogle } = await import('./google-translate');
        return await translateWithGoogle(text, 'kk');
      } catch (error) {
        console.error('Google Translate error, falling back to OpenAI:', error);
        // Fallback на OpenAI
      }
    }

    // Для других языков используем OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return text; // Fallback без перевода
    }

    try {
      const languageNames: { [key: string]: string } = {
        'en': 'английский',
        'ru': 'русский',
        'kk': 'казахский',
        'es': 'испанский',
        'fr': 'французский',
        'de': 'немецкий',
        'zh': 'китайский'
      };

      const targetLangName = languageNames[targetLanguage] || targetLanguage;

      const prompt = `Переведи следующий текст на ${targetLangName} язык. Сохрани стиль и тон оригинала.

Текст: "${text}"

Перевод:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты профессиональный переводчик. Переводи точно, сохраняя смысл и стиль.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content?.trim() || text;
    } catch (error) {
      console.error('AI translation error:', error);
      return text;
    }
  }

  /**
   * Fallback анализ без OpenAI
   */
  private static fallbackAnalysis(text: string): AIAnalysis {
    const lowerText = text.toLowerCase();
    let departmentId = 'general';
    let priority: TicketPriority = 'medium';
    let type: TicketType = 'question';
    let category = 'Общий вопрос';

    // Простая эвристика для определения отдела
    if (lowerText.includes('пароль') || lowerText.includes('войти') || lowerText.includes('логин') || 
        lowerText.includes('не работает') || lowerText.includes('ошибка') || lowerText.includes('баг')) {
      departmentId = 'tech';
      category = 'Техническая проблема';
      type = 'issue';
    } else if (lowerText.includes('купить') || lowerText.includes('цена') || lowerText.includes('заказ') || 
               lowerText.includes('товар') || lowerText.includes('продаж')) {
      departmentId = 'sales';
      category = 'Вопрос о продажах';
      type = 'question';
    } else if (lowerText.includes('оплата') || lowerText.includes('счет') || lowerText.includes('деньги') || 
               lowerText.includes('возврат') || lowerText.includes('refund')) {
      departmentId = 'billing';
      category = 'Финансовый вопрос';
      type = 'request';
    } else if (lowerText.includes('отпуск') || lowerText.includes('документ') || lowerText.includes('кадр')) {
      departmentId = 'hr';
      category = 'HR вопрос';
      type = 'question';
    }

    // Определение приоритета
    if (lowerText.includes('срочно') || lowerText.includes('urgent') || lowerText.includes('критично')) {
      priority = 'urgent';
    } else if (lowerText.includes('важно') || lowerText.includes('important')) {
      priority = 'high';
    } else if (lowerText.includes('неважно') || lowerText.includes('когда будет время')) {
      priority = 'low';
    }

    const department = departments.find(d => d.id === departmentId);

    return {
      category,
      priority,
      type,
      departmentId,
      departmentName: department?.name || 'Общие вопросы',
      confidence: 0.6
    };
  }
}


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
  /**
   * Определяет язык текста
   */
  private static detectLanguage(text: string): 'ru' | 'kk' {
    const lowerText = text.toLowerCase();
    
    // Казахские специфические символы и слова
    const kazakhIndicators = [
      'ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і',
      'қалай', 'не', 'қайда', 'қашан', 'керек', 'болады',
      'емес', 'жоқ', 'бар', 'біз', 'сіз', 'олар', 'мен',
      'сен', 'біздің', 'сіздің', 'олардың'
    ];
    
    const kazakhCount = kazakhIndicators.filter(indicator => 
      lowerText.includes(indicator)
    ).length;
    
    // Если найдено достаточно казахских индикаторов
    if (kazakhCount >= 2) {
      return 'kk';
    }
    
    return 'ru';
  }

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
      // Определяем язык вопроса
      const questionLanguage = this.detectLanguage(question);
      const targetLanguage = questionLanguage === 'kk' ? 'казахский' : 'русский';
      
      const contextInfo = context
        ? `\n\nКонтекст вопроса:\n- Категория: ${context.category || 'Не указана'}\n- Тип: ${context.type || 'Не указан'}\n- Отдел: ${context.department || 'Не указан'}`
        : '';

      const prompt = `Ты помощник службы поддержки. Пользователь задал вопрос: "${question}"${contextInfo}

КРИТИЧЕСКИ ВАЖНО:
- Отвечай ТОЛЬКО на вопросы про техническую поддержку, IT, продажи, бухгалтерию, HR или корпоративные вопросы
- Если вопрос философский, общий или не про работу/технику - верни ТОЛЬКО "OPERATOR_REQUIRED"
- Отвечай ТОЛЬКО если можешь дать ТОЧНЫЙ и ПОЛНЫЙ ответ на конкретный вопрос
- Если вопрос неясный, требует дополнительной информации или ты не уверен - верни "OPERATOR_REQUIRED"
- Если не можешь точно ответить - верни только текст: "OPERATOR_REQUIRED"
- Ответ должен быть на ${targetLanguage} языке (на том же языке, на котором задан вопрос)
- Ответ должен быть вежливым, профессиональным и ПОЛНОСТЬЮ отвечать на заданный вопрос

Сгенерируй ответ (только текст ответа, без дополнительных комментариев. Если не можешь точно ответить или вопрос не по теме - верни только "OPERATOR_REQUIRED"):`;

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
      
      // Если ИИ не может ответить - передаем оператору
      if (!answer || answer === 'OPERATOR_REQUIRED' || answer.toLowerCase().includes('operator_required')) {
        return {
          answer: '',
          confidence: 0,
          shouldCloseTicket: false
        };
      }

      // Определяем, является ли вопрос простым и можем ли мы уверенно ответить
      const confidencePrompt = `Проанализируй вопрос и ответ на релевантность и точность:

Вопрос: "${question}"
Ответ: "${answer}"

КРИТИЧЕСКИ ВАЖНО - оцени строго:
1. Отвечает ли ответ НАПРЯМУЮ на заданный вопрос? (да/нет)
2. Является ли ответ ТОЧНЫМ и ПОЛНЫМ? (да/нет)
3. Является ли вопрос простым/стандартным, на который можно дать точный ответ? (да/нет)
4. Нужна ли дополнительная информация от пользователя для ответа? (да/нет)
5. Может ли этот вопрос быть закрыт автоматически БЕЗ участия оператора? (да/нет)
6. Релевантен ли ответ теме вопроса? (да/нет)

Ответь в формате JSON:
{
  "isRelevant": true/false,
  "isAccurate": true/false,
  "isSimple": true/false,
  "isComplete": true/false,
  "needsMoreInfo": true/false,
  "canAutoClose": true/false,
  "confidence": 0.0-1.0
}

ВАЖНО: Если ответ не релевантен, неточен или неполон - установи canAutoClose в false и confidence < 0.7`;

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
        
        // Строгая проверка: отвечаем только если ответ релевантен, точен и полон
        const isRelevant = confidenceData.isRelevant !== false;
        const isAccurate = confidenceData.isAccurate !== false;
        const isComplete = confidenceData.isComplete !== false;
        const canAutoClose = confidenceData.canAutoClose === true;
        const needsMoreInfo = confidenceData.needsMoreInfo === true;
        
        // Вычисляем уверенность на основе всех факторов
        let confidence = confidenceData.confidence || 0.5;
        
        // Снижаем уверенность если ответ не релевантен или неточен
        if (!isRelevant || !isAccurate) {
          confidence = Math.min(confidence, 0.5);
        }
        
        // Повышаем уверенность только если все критерии выполнены
        if (isRelevant && isAccurate && isComplete && !needsMoreInfo && canAutoClose) {
          confidence = Math.max(confidence, 0.8);
        } else {
          // Если хоть один критерий не выполнен - снижаем уверенность
          confidence = Math.min(confidence, 0.6);
        }

        // Отвечаем автоматически только если уверенность > 0.8 И все критерии выполнены
        const shouldAutoClose = confidence > 0.8 && 
                                isRelevant && 
                                isAccurate && 
                                isComplete && 
                                !needsMoreInfo && 
                                canAutoClose;

        return {
          answer,
          confidence: Math.min(confidence, 0.95), // Ограничиваем максимум
          shouldCloseTicket: shouldAutoClose
        };
      } catch (error) {
        console.error('Confidence evaluation error:', error);
        // Fallback: строгая эвристика - не отвечаем автоматически если не уверены
        const hasUncertainty = answer.toLowerCase().includes('не уверен') ||
                              answer.toLowerCase().includes('обратитесь') ||
                              answer.toLowerCase().includes('специалист') ||
                              answer.toLowerCase().includes('уточните') ||
                              answer.toLowerCase().includes('дополнительная информация');
        
        const isSimpleQuestion = question.length < 200 && 
          !question.toLowerCase().includes('срочно') &&
          !question.toLowerCase().includes('критично') &&
          answer.length > 50 &&
          !hasUncertainty;

        // В fallback режиме не отвечаем автоматически - передаем оператору
        const confidence = isSimpleQuestion ? 0.65 : 0.4;

        return {
          answer,
          confidence,
          shouldCloseTicket: false // В fallback всегда передаем оператору
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
    
    // Определяем язык вопроса
    const questionLanguage = this.detectLanguage(question);
    const targetLanguage = questionLanguage === 'kk' ? 'казахский' : 'русский';
    
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
        // Сначала проверяем релевантность через ИИ
        const relevanceCheck = `Вопрос пользователя: "${question}"
Вопрос из базы знаний: "${bestMatch.question}"

Оцени, насколько эти вопросы связаны между собой. Ответь ТОЛЬКО "ДА" если вопросы связаны и найденный ответ можно использовать, или "НЕТ" если вопросы не связаны.

Ответ (только "ДА" или "НЕТ"):`;

        const relevanceResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Ты проверяешь релевантность вопросов. Отвечай только "ДА" или "НЕТ".'
            },
            {
              role: 'user',
              content: relevanceCheck
            }
          ],
          temperature: 0.1,
          max_tokens: 10
        });

        const isRelevant = relevanceResponse.choices[0]?.message?.content?.trim().toUpperCase().includes('ДА');
        
        // Если не релевантно - передаем оператору
        if (!isRelevant) {
          console.log('FAQ not relevant to question:', { question, faqQuestion: bestMatch.question });
          return {
            answer: '',
            confidence: 0,
            shouldCloseTicket: false
          };
        }

        const prompt = `Пользователь задал вопрос: "${question}"

Найденный ответ из базы знаний: "${bestMatch.answer}"

КРИТИЧЕСКИ ВАЖНО:
- Используй ТОЛЬКО информацию из найденного ответа
- Ответ должен ТОЧНО отвечать на заданный вопрос
- Если найденный ответ НЕ ОТВЕЧАЕТ на заданный вопрос - верни ТОЛЬКО "OPERATOR_REQUIRED"
- Если вопрос не про техническую поддержку, IT, продажи, бухгалтерию или HR - верни "OPERATOR_REQUIRED"
- Ответ должен быть на ${targetLanguage} языке (на том же языке, на котором задан вопрос)
- Ответ должен быть вежливым, профессиональным и ПОЛНОСТЬЮ отвечать на вопрос

Ответ (только текст ответа, без дополнительных комментариев. Если не можешь точно ответить - верни только "OPERATOR_REQUIRED"):`;

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
        
        // Если ИИ не может ответить - передаем оператору
        if (answer.trim() === 'OPERATOR_REQUIRED' || answer.toLowerCase().includes('operator_required')) {
          return {
            answer: '',
            confidence: 0,
            sourceFAQId: bestMatch.id,
            shouldCloseTicket: false
          };
        }
        
        // Для FAQ ответов уверенность выше, но все равно проверяем релевантность
        const confidence = 0.85;
        
        // Проверяем, что ответ релевантен вопросу
        const answerLower = answer.toLowerCase();
        const questionLower = question.toLowerCase();
        const answerIsRelevant = answerLower.length > 30 && 
                          (answerLower.includes(questionLower.split(' ')[0]) || 
                           questionLower.split(' ').some(word => word.length > 3 && answerLower.includes(word)));

        return {
          answer: answer.trim(),
          confidence: answerIsRelevant ? confidence : 0.6,
          sourceFAQId: bestMatch.id,
          shouldCloseTicket: answerIsRelevant && confidence > 0.8
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


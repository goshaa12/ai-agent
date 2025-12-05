import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';
import { ticketStore } from '@/lib/ticket-store';
import { Ticket, TicketMessage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, userId, userName, userEmail } = body;

    if (!title || !description || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Анализ заявки с помощью ИИ
    const analysis = await AIService.analyzeTicket(`${title}\n\n${description}`);

    // 2. Генерация ответа ChatGPT (проверяет FAQ и генерирует ответ если нужно)
    const faqResponse = await AIService.findAnswerInFAQ(description);
    
    // Если FAQ не дал ответ, но есть API ключ - генерируем ответ через ChatGPT
    // Это работает для всех вопросов, включая простые
    if (!faqResponse.answer && process.env.OPENAI_API_KEY) {
      const aiResponse = await AIService.generateUserResponse(description, {
        category: analysis.category,
        type: analysis.type,
        department: analysis.departmentName
      });
      
      // Используем сгенерированный ответ если он есть
      // Для простых вопросов (confidence > 0.7) ответ будет автоматически добавлен
      if (aiResponse.answer) {
        faqResponse.answer = aiResponse.answer;
        faqResponse.confidence = aiResponse.confidence;
        faqResponse.shouldCloseTicket = aiResponse.shouldCloseTicket;
      }
    }
    
    // Логируем для отладки
    console.log('Auto-response check:', {
      hasAnswer: !!faqResponse.answer,
      confidence: faqResponse.confidence,
      shouldClose: faqResponse.shouldCloseTicket,
      questionLength: description.length
    });

    // 3. Создание тикета
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const createdAtTime = Date.now();

    const ticket: Ticket = {
      id: ticketId,
      title,
      description,
      category: analysis.category,
      priority: analysis.priority,
      type: analysis.type,
      departmentId: analysis.departmentId,
      departmentName: analysis.departmentName,
      status: faqResponse.shouldCloseTicket ? 'closed' : 'open',
      userId,
      userName: userName || 'Пользователь',
      userEmail: userEmail || 'user@example.com',
      createdAt: now,
      updatedAt: now,
      messages: [],
      aiConfidence: analysis.confidence,
      autoResolved: faqResponse.shouldCloseTicket,
      // Метрики
      classificationAccuracy: analysis.confidence
    };

    // 4. Добавление начального сообщения от пользователя
    const userMessage: TicketMessage = {
      id: `msg-${Date.now()}-1`,
      ticketId,
      content: description,
      sender: 'user',
      senderName: userName || 'Пользователь',
      createdAt: now
    };
    ticket.messages.push(userMessage);

    // 5. Если ИИ уверен в ответе - добавляем автоматический ответ
    let firstResponseTime: number | undefined;
    let resolutionTime: number | undefined;
    
    if (faqResponse.shouldCloseTicket && faqResponse.answer) {
      const aiMessageTime = Date.now();
      const aiMessage: TicketMessage = {
        id: `msg-${Date.now()}-2`,
        ticketId,
        content: faqResponse.answer,
        sender: 'ai',
        senderName: 'AI Помощник',
        createdAt: new Date().toISOString()
      };
      ticket.messages.push(aiMessage);
      
      // Вычисляем время первого ответа (от создания до первого ответа ИИ/оператора)
      firstResponseTime = aiMessageTime - createdAtTime;
      ticket.firstResponseTime = firstResponseTime;
      
      // Если тикет автоматически закрыт, время решения = время первого ответа
      if (faqResponse.shouldCloseTicket) {
        resolutionTime = firstResponseTime;
        ticket.resolutionTime = resolutionTime;
      }
    }

    ticketStore.createTicket(ticket);

    // Подготовка метрик для ответа
    const metrics = {
      classificationAccuracy: ticket.classificationAccuracy,
      firstResponseTime: ticket.firstResponseTime,
      resolutionTime: ticket.resolutionTime,
      routingError: ticket.routingError
    };

    return NextResponse.json({
      ticket,
      aiAnalysis: analysis,
      autoResponse: faqResponse.shouldCloseTicket ? {
        answer: faqResponse.answer,
        confidence: faqResponse.confidence
      } : null,
      metrics
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


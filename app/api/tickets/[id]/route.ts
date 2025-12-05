import { NextRequest, NextResponse } from 'next/server';
import { ticketStore } from '@/lib/ticket-store';
import { TicketMessage } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = ticketStore.getTicket(id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Вычисляем метрики на лету
    const createdAtTime = new Date(ticket.createdAt).getTime();
    const now = Date.now();

    // Время первого ответа (от создания до первого ответа оператора/ИИ)
    let firstResponseTime = ticket.firstResponseTime;
    if (!firstResponseTime && ticket.messages.length > 1) {
      const firstResponse = ticket.messages.find(m => m.sender !== 'user');
      if (firstResponse) {
        firstResponseTime = new Date(firstResponse.createdAt).getTime() - createdAtTime;
      }
    }

    // Время решения (от создания до статуса resolved/closed)
    let resolutionTime = ticket.resolutionTime;
    if (!resolutionTime && (ticket.status === 'resolved' || ticket.status === 'closed')) {
      resolutionTime = now - createdAtTime;
    }

    // Обновляем метрики в тикете
    const updatedTicket = {
      ...ticket,
      classificationAccuracy: ticket.classificationAccuracy ?? ticket.aiConfidence,
      firstResponseTime,
      resolutionTime
    };

    // Подготовка метрик для ответа
    const metrics = {
      classificationAccuracy: updatedTicket.classificationAccuracy,
      firstResponseTime: updatedTicket.firstResponseTime,
      resolutionTime: updatedTicket.resolutionTime,
      routingError: updatedTicket.routingError
    };

    return NextResponse.json({ 
      ticket: updatedTicket,
      metrics
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const originalTicket = ticketStore.getTicket(id);

    if (!originalTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Проверяем изменение отдела (ошибка маршрутизации)
    let routingError = originalTicket.routingError;
    if (body.departmentId && body.departmentId !== originalTicket.departmentId) {
      routingError = {
        originalDepartmentId: originalTicket.departmentId,
        originalDepartmentName: originalTicket.departmentName,
        reason: 'Тикет был перенаправлен в другой отдел'
      };
    }

    // Вычисляем время решения, если статус изменился на resolved/closed
    let resolutionTime = originalTicket.resolutionTime;
    if ((body.status === 'resolved' || body.status === 'closed') && 
        originalTicket.status !== 'resolved' && originalTicket.status !== 'closed') {
      const createdAtTime = new Date(originalTicket.createdAt).getTime();
      resolutionTime = Date.now() - createdAtTime;
    }

    const updates = {
      ...body,
      routingError,
      resolutionTime: resolutionTime || originalTicket.resolutionTime
    };

    const updated = ticketStore.updateTicket(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Вычисляем метрики для ответа
    const createdAtTime = new Date(updated.createdAt).getTime();
    let firstResponseTime = updated.firstResponseTime;
    if (!firstResponseTime && updated.messages.length > 1) {
      const firstResponse = updated.messages.find(m => m.sender !== 'user');
      if (firstResponse) {
        firstResponseTime = new Date(firstResponse.createdAt).getTime() - createdAtTime;
      }
    }

    const metrics = {
      classificationAccuracy: updated.classificationAccuracy ?? updated.aiConfidence,
      firstResponseTime,
      resolutionTime: updated.resolutionTime,
      routingError: updated.routingError
    };

    return NextResponse.json({ 
      ticket: updated,
      metrics
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


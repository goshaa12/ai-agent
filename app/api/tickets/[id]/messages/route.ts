import { NextRequest, NextResponse } from 'next/server';
import { ticketStore } from '@/lib/ticket-store';
import { TicketMessage } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, sender, senderName } = body;

    if (!content || !sender || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message: TicketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticketId: id,
      content,
      sender,
      senderName,
      createdAt: new Date().toISOString()
    };

    const ticket = ticketStore.getTicket(id);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Вычисляем время первого ответа, если это первое сообщение от оператора/ИИ
    let firstResponseTime = ticket.firstResponseTime;
    if (!firstResponseTime && (sender === 'operator' || sender === 'ai')) {
      const createdAtTime = new Date(ticket.createdAt).getTime();
      const messageTime = Date.now();
      firstResponseTime = messageTime - createdAtTime;
    }

    ticketStore.addMessage(id, message);
    
    // Обновляем метрику времени первого ответа
    if (firstResponseTime && firstResponseTime !== ticket.firstResponseTime) {
      ticketStore.updateTicket(id, { firstResponseTime });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


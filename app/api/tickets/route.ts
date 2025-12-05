import { NextRequest, NextResponse } from 'next/server';
import { ticketStore } from '@/lib/ticket-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get('departmentId');

    const tickets = departmentId
      ? ticketStore.getTicketsByDepartment(departmentId)
      : ticketStore.getAllTickets();

    // Вычисляем метрики для каждого тикета
    const ticketsWithMetrics = tickets.map(ticket => {
      const createdAtTime = new Date(ticket.createdAt).getTime();
      const now = Date.now();

      // Время первого ответа
      let firstResponseTime = ticket.firstResponseTime;
      if (!firstResponseTime && ticket.messages.length > 1) {
        const firstResponse = ticket.messages.find(m => m.sender !== 'user');
        if (firstResponse) {
          firstResponseTime = new Date(firstResponse.createdAt).getTime() - createdAtTime;
        }
      }

      // Время решения
      let resolutionTime = ticket.resolutionTime;
      if (!resolutionTime && (ticket.status === 'resolved' || ticket.status === 'closed')) {
        resolutionTime = now - createdAtTime;
      }

      return {
        ...ticket,
        classificationAccuracy: ticket.classificationAccuracy ?? ticket.aiConfidence,
        firstResponseTime,
        resolutionTime
      };
    });

    return NextResponse.json({ tickets: ticketsWithMetrics });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { Ticket, TicketMessage } from '@/types';

// In-memory хранилище (в продакшене использовать БД)
// Используем глобальную переменную для сохранения данных между запросами в dev режиме
declare global {
  // eslint-disable-next-line no-var
  var __ticketStore: TicketStore | undefined;
}

class TicketStore {
  private tickets: Map<string, Ticket> = new Map();
  private messages: Map<string, TicketMessage[]> = new Map();

  createTicket(ticket: Ticket): Ticket {
    this.tickets.set(ticket.id, ticket);
    this.messages.set(ticket.id, ticket.messages || []);
    return ticket;
  }

  getTicket(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  getAllTickets(): Ticket[] {
    return Array.from(this.tickets.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getTicketsByDepartment(departmentId: string): Ticket[] {
    return this.getAllTickets().filter(t => t.departmentId === departmentId);
  }

  updateTicket(id: string, updates: Partial<Ticket>): Ticket | undefined {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const updated = {
      ...ticket,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.tickets.set(id, updated);
    return updated;
  }

  addMessage(ticketId: string, message: TicketMessage): void {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return;

    const messages = this.messages.get(ticketId) || [];
    messages.push(message);
    this.messages.set(ticketId, messages);

    ticket.messages = messages;
    ticket.updatedAt = new Date().toISOString();
    this.tickets.set(ticketId, ticket);
  }

  getMessages(ticketId: string): TicketMessage[] {
    return this.messages.get(ticketId) || [];
  }
}

// Singleton паттерн для сохранения данных между запросами
export const ticketStore = 
  globalThis.__ticketStore ?? 
  (globalThis.__ticketStore = new TicketStore());


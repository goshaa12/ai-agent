export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketType = 'question' | 'issue' | 'request' | 'complaint' | 'feedback';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Department {
  id: string;
  name: string;
  description: string;
  email?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  type: TicketType;
  departmentId: string;
  departmentName: string;
  status: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  aiConfidence?: number;
  autoResolved?: boolean;
  // Метрики
  classificationAccuracy?: number; // Точность классификации (aiConfidence)
  firstResponseTime?: number; // Время первого ответа в миллисекундах
  resolutionTime?: number; // Время решения в миллисекундах
  routingError?: {
    originalDepartmentId: string;
    originalDepartmentName: string;
    reason?: string;
  }; // Ошибка маршрутизации, если тикет был перенаправлен
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  sender: 'user' | 'operator' | 'ai';
  senderName: string;
  createdAt: string;
  translatedContent?: { [language: string]: string };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  language?: string;
}

export interface AIAnalysis {
  category: string;
  priority: TicketPriority;
  type: TicketType;
  departmentId: string;
  departmentName: string;
  confidence: number;
  suggestedResponse?: string;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sourceFAQId?: string;
  shouldCloseTicket: boolean;
}


'use client';

import { Ticket } from '@/types';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

const priorityColors = {
  low: 'bg-gray-700 text-gray-300',
  medium: 'bg-slate-700 text-slate-200',
  high: 'bg-orange-600 text-orange-100',
  urgent: 'bg-red-600 text-red-100'
};

const statusColors = {
  open: 'bg-green-600 text-green-100',
  in_progress: 'bg-yellow-600 text-yellow-100',
  resolved: 'bg-slate-700 text-slate-200',
  closed: 'bg-gray-700 text-gray-300'
};

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all cursor-pointer ${
        onClick ? '' : 'cursor-default'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white pr-2">{ticket.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority === 'low' ? 'Низкий' :
             ticket.priority === 'medium' ? 'Средний' :
             ticket.priority === 'high' ? 'Высокий' : 'Срочный'}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[ticket.status]}`}>
            {ticket.status === 'open' ? 'Открыт' :
             ticket.status === 'in_progress' ? 'В работе' :
             ticket.status === 'resolved' ? 'Решен' : 'Закрыт'}
          </span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{ticket.description}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex gap-4 flex-wrap">
          <span className="text-gray-400">📁 {ticket.departmentName}</span>
          <span className="text-gray-400">🏷️ {ticket.category}</span>
          {ticket.autoResolved && (
            <span className="text-green-400 font-medium">🤖 Автоответ</span>
          )}
        </div>
        <span className="text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  );
}


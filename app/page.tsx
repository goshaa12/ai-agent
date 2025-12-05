'use client';

import { useState, useEffect } from 'react';
import TicketForm from '@/components/TicketForm';
import TicketCard from '@/components/TicketCard';
import TicketDetail from '@/components/TicketDetail';
import FAQ from '@/components/FAQ';
import Modal from '@/components/Modal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ticket } from '@/types';

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'create' | 'list' | 'detail' | 'faq'>('create');
  const [filter, setFilter] = useState<string>('all');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title?: string;
    content: string;
    type?: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    content: ''
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleCreateTicket = async (formData: { title: string; description: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: `user-${Date.now()}`,
          userName: 'Пользователь',
          userEmail: 'user@example.com'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.ticket) {
        // Добавляем новую заявку в список сразу
        setTickets(prev => [data.ticket, ...prev]);
        setView('list');
        
        // Показать результат анализа ИИ с метриками
        const metrics = data.metrics || {};
        let metricsText = '';
        
        if (metrics.classificationAccuracy !== undefined) {
          metricsText += `\nТочность классификации: ${Math.round(metrics.classificationAccuracy * 100)}%`;
        }
        if (metrics.firstResponseTime !== undefined) {
          const minutes = Math.round(metrics.firstResponseTime / 60000);
          metricsText += `\nВремя первого ответа: ${minutes} мин`;
        }
        if (metrics.resolutionTime !== undefined) {
          const minutes = Math.round(metrics.resolutionTime / 60000);
          metricsText += `\nВремя решения: ${minutes} мин`;
        }
        if (metrics.routingError) {
          metricsText += `\n⚠️ Ошибка маршрутизации: перенаправлено из "${metrics.routingError.originalDepartmentName}"`;
        }

        if (data.autoResponse) {
          setModal({
            isOpen: true,
            title: t('modal.aiResponded'),
            content: `${t('modal.answer')} ${data.autoResponse.answer}\n\n${t('modal.confidence')} ${Math.round(data.autoResponse.confidence * 100)}%${metricsText}`,
            type: 'success'
          });
        } else {
          setModal({
            isOpen: true,
            title: t('modal.ticketCreated'),
            content: `${t('modal.department')} ${data.ticket.departmentName}\n${t('modal.priority')} ${data.ticket.priority}\n${t('modal.category')} ${data.ticket.category}${metricsText}`,
            type: 'success'
          });
        }
        
        // Также обновляем список с сервера для синхронизации
        await loadTickets();
      } else {
        setModal({
          isOpen: true,
          title: t('modal.error'),
          content: data.error || t('modal.error'),
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setModal({
        isOpen: true,
        title: t('modal.error'),
        content: t('modal.error'),
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketClick = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      const data = await response.json();
      setSelectedTicket(data.ticket);
      setView('detail');
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.departmentId === filter);

  return (
    <div className="min-h-screen bg-[#121212]">
      <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white font-mono">{t('nav.title')}</h1>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setView('create')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  view === 'create' 
                    ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/50' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('nav.create')}
              </button>
              <button
                onClick={() => {
                  setView('list');
                  setSelectedTicket(null);
                }}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  view === 'list' 
                    ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/50' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('nav.list')} ({tickets.length})
              </button>
              <button
                onClick={() => {
                  setView('faq');
                  setSelectedTicket(null);
                }}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  view === 'faq' 
                    ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/50' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('nav.faq')}
              </button>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => setLanguage('ru')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    language === 'ru'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => setLanguage('kk')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    language === 'kk'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  KZ
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-white">{t('create.title')}</h2>
              <p className="text-gray-400 mb-6 text-lg">
                {t('create.description')}
              </p>
              <TicketForm onSubmit={handleCreateTicket} isLoading={isLoading} />
            </div>
          </div>
        )}

        {view === 'list' && (
          <div>
            <div className="mb-6 flex gap-4 items-center flex-wrap">
              <h2 className="text-3xl font-bold text-white">{t('list.title')}</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
              >
                <option value="all">{t('list.filterAll')}</option>
                <option value="tech">{t('list.filterTech')}</option>
                <option value="sales">{t('list.filterSales')}</option>
                <option value="billing">{t('list.filterBilling')}</option>
                <option value="hr">{t('list.filterHr')}</option>
                <option value="general">{t('list.filterGeneral')}</option>
              </select>
            </div>
            {filteredTickets.length === 0 ? (
              <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                <p className="text-gray-400 text-lg">{t('list.empty')}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => handleTicketClick(ticket.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <FAQ />
          </div>
        )}

        {view === 'detail' && selectedTicket && (
          <div>
            <button
              onClick={() => {
                setView('list');
                setSelectedTicket(null);
              }}
              className="mb-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t('detail.back')}
            </button>
            <TicketDetail
              ticket={selectedTicket}
              onUpdate={() => {
                loadTickets();
                handleTicketClick(selectedTicket.id);
              }}
            />
          </div>
        )}
      </main>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        type={modal.type}
      >
        {modal.content}
      </Modal>
    </div>
  );
}
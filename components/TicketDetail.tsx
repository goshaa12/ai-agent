'use client';

import { useState, useEffect } from 'react';
import { Ticket, TicketMessage } from '@/types';
import Modal from '@/components/Modal';
import { useLanguage } from '@/contexts/LanguageContext';

interface TicketDetailProps {
  ticket: Ticket;
  onUpdate?: () => void;
}

export default function TicketDetail({ ticket, onUpdate }: TicketDetailProps) {
  const { t, language } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [showAITools, setShowAITools] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<{
    classificationAccuracy?: number;
    firstResponseTime?: number;
    resolutionTime?: number;
    routingError?: {
      originalDepartmentId: string;
      originalDepartmentName: string;
      reason?: string;
    };
  } | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title?: string;
    content: string;
    type?: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    content: ''
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          sender: 'operator',
          senderName: 'Оператор'
        })
      });

      if (response.ok) {
        setNewMessage('');
        // Обновляем метрики после отправки сообщения
        const metricsResponse = await fetch(`/api/tickets/${ticket.id}`);
        const metricsData = await metricsResponse.json();
        if (metricsData.metrics) {
          setMetrics(metricsData.metrics);
        }
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const generateAIResponses = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketDescription: ticket.description,
          conversationHistory: ticket.messages.map(m => `${m.senderName}: ${m.content}`),
          count: 3,
          ticketContext: {
            title: ticket.title,
            category: ticket.category,
            priority: ticket.priority,
            type: ticket.type,
            department: ticket.departmentName
          }
        })
      });

      const data = await response.json();
      setAiResponses(data.options || []);
    } catch (error) {
      console.error('Error generating responses:', error);
      setModal({
        isOpen: true,
        title: 'Ошибка',
        content: 'Ошибка при генерации ответов. Проверьте, что OPENAI_API_KEY настроен в .env.local',
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Автоматически генерируем подсказки при открытии тикета
  useEffect(() => {
    if (ticket && ticket.messages.length > 0 && aiResponses.length === 0) {
      generateAIResponses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id]);

  // Загрузка метрик при загрузке тикета
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticket.id}`);
        const data = await response.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };
    loadMetrics();
  }, [ticket.id]);

  const generateSummary = async () => {
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: ticket.messages.map(m => `${m.senderName}: ${m.content}`)
        })
      });

      const data = await response.json();
      setSummary(data.summary || '');
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const translateMessage = async (messageId: string, targetLang: 'ru' | 'kk') => {
    const message = ticket.messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          targetLanguage: targetLang
        })
      });

      const data = await response.json();
      // В реальном приложении сохранить перевод в сообщении
      const langName = targetLang === 'kk' ? 'казахский' : 'русский';
      setModal({
        isOpen: true,
        title: `${t('modal.translation')} ${langName}`,
        content: data.translated,
        type: 'info'
      });
    } catch (error) {
      console.error('Error translating:', error);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{ticket.title}</h2>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-md text-sm">
              {ticket.departmentName}
            </span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md text-sm">
              {ticket.category}
            </span>
            <span className="px-3 py-1 bg-purple-600 text-purple-100 rounded-md text-sm">
              {ticket.type}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAITools(!showAITools)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {t('detail.aiHelper')}
        </button>
      </div>

      {/* Метрики */}
      {(metrics || ticket.classificationAccuracy !== undefined || ticket.firstResponseTime !== undefined || ticket.resolutionTime !== undefined || ticket.routingError) && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">{t('metrics.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(metrics?.classificationAccuracy !== undefined || ticket.classificationAccuracy !== undefined) && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{t('metrics.classificationAccuracy')}</div>
                <div className="text-xl font-bold text-white">
                  {Math.round((metrics?.classificationAccuracy ?? ticket.classificationAccuracy ?? ticket.aiConfidence ?? 0) * 100)}%
                </div>
              </div>
            )}
            {(metrics?.firstResponseTime !== undefined || ticket.firstResponseTime !== undefined) && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{t('metrics.firstResponseTime')}</div>
                <div className="text-xl font-bold text-white">
                  {Math.round((metrics?.firstResponseTime ?? ticket.firstResponseTime ?? 0) / 60000)} {t('metrics.min')}
                </div>
              </div>
            )}
            {(metrics?.resolutionTime !== undefined || ticket.resolutionTime !== undefined) && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{t('metrics.resolutionTime')}</div>
                <div className="text-xl font-bold text-white">
                  {Math.round((metrics?.resolutionTime ?? ticket.resolutionTime ?? 0) / 60000)} {t('metrics.min')}
                </div>
              </div>
            )}
            {(metrics?.routingError || ticket.routingError) && (
              <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-700">
                <div className="text-xs text-orange-300 mb-1">{t('metrics.routingError')}</div>
                <div className="text-sm text-orange-200">
                  {t('metrics.routingErrorDesc')} "{metrics?.routingError?.originalDepartmentName ?? ticket.routingError?.originalDepartmentName}"
                </div>
                {(metrics?.routingError?.reason || ticket.routingError?.reason) && (
                  <div className="text-xs text-orange-300 mt-1">
                    {metrics?.routingError?.reason ?? ticket.routingError?.reason}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Подсказки ChatGPT - всегда видны */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-900/50 to-slate-900/50 rounded-lg border border-purple-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h3 className="font-semibold text-purple-200">{t('detail.chatgptHints')}</h3>
          </div>
          <button
            onClick={generateAIResponses}
            disabled={isGenerating}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? t('detail.generating') : t('detail.refresh')}
          </button>
        </div>
        
        {isGenerating && aiResponses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">{t('detail.generating')}</p>
          </div>
        ) : aiResponses.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-2">{t('detail.hintClick')}</p>
            {aiResponses.map((response, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-800 rounded-lg border border-purple-700 cursor-pointer hover:bg-gray-750 hover:border-purple-600 transition-all shadow-sm"
                onClick={() => setNewMessage(response)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold text-sm">{idx + 1}</span>
                  <p className="text-sm text-gray-300 flex-1">{response}</p>
                  <span className="text-xs text-purple-400">👆</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-2">Нажмите "Обновить" для генерации подсказок</p>
            <p className="text-xs text-gray-500">Убедитесь, что OPENAI_API_KEY настроен в .env.local</p>
          </div>
        )}
      </div>

      {showAITools && (
        <div className="mb-4 p-4 bg-purple-900/30 rounded-lg space-y-3 border border-purple-700">
          <div className="flex gap-2">
            <button
              onClick={generateSummary}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
            >
              {t('detail.summary')}
            </button>
          </div>
          {summary && (
            <div className="p-3 bg-gray-800 rounded border border-purple-700">
              <p className="text-sm font-medium mb-2 text-purple-200">📋 {t('detail.summary')}:</p>
              <p className="text-sm text-gray-300 whitespace-pre-line">{summary}</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">{t('detail.status')}</label>
        <select
          value={ticket.status}
          onChange={(e) => updateStatus(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
        >
          <option value="open">{t('detail.statusOpen')}</option>
          <option value="in_progress">{t('detail.statusInProgress')}</option>
          <option value="resolved">{t('detail.statusResolved')}</option>
          <option value="closed">{t('detail.statusClosed')}</option>
        </select>
      </div>

      <div className="mb-6 space-y-4">
        <h3 className="font-semibold text-lg text-white">{t('detail.conversation')}</h3>
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.sender === 'user'
                ? 'bg-slate-900/30 ml-4 border border-slate-700'
                : message.sender === 'ai'
                ? 'bg-green-900/30 mr-4 border border-green-700'
                : 'bg-gray-700 mr-4 border border-gray-600'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm text-gray-300">
                {message.sender === 'user' ? '👤' : message.sender === 'ai' ? '🤖' : '👨‍💼'} {message.senderName}
              </span>
              <div className="flex gap-2">
                {language === 'ru' && (
                  <button
                    onClick={() => translateMessage(message.id, 'kk')}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
                    title={t('detail.translate')}
                  >
                    KZ
                  </button>
                )}
                {language === 'kk' && (
                  <button
                    onClick={() => translateMessage(message.id, 'ru')}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
                    title={t('detail.translate')}
                  >
                    RU
                  </button>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleString(language === 'kk' ? 'kk-KZ' : 'ru-RU')}
                </span>
              </div>
            </div>
            <p className="text-gray-200">{message.content}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('detail.sendPlaceholder')}
            rows={3}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-medium"
          >
            {t('detail.send')}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t('detail.sendHint')}</p>
      </div>

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


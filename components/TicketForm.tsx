'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TicketFormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  isLoading?: boolean;
}

export default function TicketForm({ onSubmit, isLoading }: TicketFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onSubmit({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          {t('create.ticketTitle')}
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('create.ticketTitlePlaceholder')}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          {t('create.description')}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('create.descriptionPlaceholder')}
          rows={6}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          required
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !title.trim() || !description.trim()}
        className="w-full bg-slate-700 text-white py-3 px-4 rounded-lg hover:bg-slate-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-slate-700/30 hover:shadow-xl hover:shadow-slate-800/40"
      >
        {isLoading ? t('create.submitting') : t('create.submit')}
      </button>
    </form>
  );
}


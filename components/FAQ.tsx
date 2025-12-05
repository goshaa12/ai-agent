'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Не могу войти / забыл пароль',
    answer: 'Перейдите на портал сброса пароля: https://reset.company.com и восстановите доступ. Попробуйте войти через 1–2 минуты.'
  },
  {
    question: 'Не работает VPN / ошибка сертификата',
    answer: 'Выполните Log Out → Log In в GlobalProtect, обновите сертификат и перезагрузите компьютер. Если проблема не решилась — подключитесь к другой сети и повторите.'
  },
  {
    question: 'Проблемы с корпоративной почтой (Outlook)',
    answer: 'Перезапустите Outlook, очистите кэш, проверьте подключение к интернету. Если письма не приходят — удалите лишние письма для освобождения места.'
  },
  {
    question: 'Принтер не печатает',
    answer: 'Проверьте выбранный принтер, очистите очередь печати и перезагрузите компьютер. Убедитесь, что подключены к Wi-Fi CORP.'
  },
  {
    question: 'Нет доступа к сетевым дискам / корпоративным ресурсам',
    answer: 'Перезайдите в учетную запись (Sign Out → Sign In). Для удаленного доступа убедитесь, что включен VPN.'
  },
  {
    question: 'Компьютер работает медленно',
    answer: 'Закройте лишние приложения, перезагрузите компьютер и очистите временные файлы (%temp%). Если повторяется, обратитесь в IT.'
  }
];

export default function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-white">{t('faq.title')}</h2>
      <div className="space-y-3">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all hover:border-gray-600"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-slate-600 rounded-lg"
            >
              <span className="font-semibold text-white pr-4">{faq.question}</span>
              <span className="text-gray-400 text-xl flex-shrink-0 transition-transform duration-200">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 pt-0">
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


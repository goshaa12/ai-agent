import { FAQ } from '@/types';

export const faqDatabase: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Как сбросить пароль?',
    answer: 'Для сброса пароля перейдите на страницу входа и нажмите "Забыли пароль?". Вам будет отправлено письмо с инструкциями на указанный email.',
    category: 'tech',
    keywords: ['пароль', 'сброс', 'забыл', 'восстановление', 'password', 'reset'],
    language: 'ru'
  },
  {
    id: 'faq-2',
    question: 'Как изменить email?',
    answer: 'Для изменения email перейдите в настройки профиля, раздел "Контактная информация", и нажмите "Изменить email". Вам потребуется подтвердить новый email.',
    category: 'tech',
    keywords: ['email', 'почта', 'изменить', 'настройки', 'профиль'],
    language: 'ru'
  },
  {
    id: 'faq-3',
    question: 'Какие способы оплаты доступны?',
    answer: 'Мы принимаем оплату банковскими картами (Visa, MasterCard, МИР), банковскими переводами и электронными кошельками (ЮMoney, Qiwi).',
    category: 'billing',
    keywords: ['оплата', 'платеж', 'карта', 'способ', 'payment', 'метод'],
    language: 'ru'
  },
  {
    id: 'faq-4',
    question: 'Как вернуть товар?',
    answer: 'Для возврата товара свяжитесь с нашим отделом продаж в течение 14 дней с момента покупки. Пришлите номер заказа и причину возврата.',
    category: 'sales',
    keywords: ['возврат', 'товар', 'вернуть', 'refund', 'return'],
    language: 'ru'
  },
  {
    id: 'faq-5',
    question: 'Как оформить отпуск?',
    answer: 'Для оформления отпуска подайте заявление через корпоративный портал в разделе "HR" или обратитесь к вашему руководителю. Заявление должно быть подано минимум за 2 недели.',
    category: 'hr',
    keywords: ['отпуск', 'vacation', 'leave', 'заявление', 'hr'],
    language: 'ru'
  },
  {
    id: 'faq-6',
    question: 'Сайт не загружается',
    answer: 'Попробуйте очистить кэш браузера, отключить расширения или использовать другой браузер. Если проблема сохраняется, проверьте интернет-соединение или свяжитесь с технической поддержкой.',
    category: 'tech',
    keywords: ['сайт', 'не работает', 'не загружается', 'ошибка', 'site', 'down'],
    language: 'ru'
  },
  {
    id: 'faq-7',
    question: 'Где посмотреть статус заказа?',
    answer: 'Статус заказа можно посмотреть в личном кабинете в разделе "Мои заказы" или отследить по номеру заказа на странице отслеживания.',
    category: 'sales',
    keywords: ['заказ', 'статус', 'отследить', 'order', 'status', 'tracking'],
    language: 'ru'
  }
];

export function searchFAQ(query: string, limit: number = 5): FAQ[] {
  const lowerQuery = query.toLowerCase();
  const scored = faqDatabase.map(faq => {
    let score = 0;
    const questionLower = faq.question.toLowerCase();
    const answerLower = faq.answer.toLowerCase();
    
    // Exact match in question
    if (questionLower.includes(lowerQuery)) score += 10;
    
    // Keyword matches
    faq.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
    });
    
    // Answer contains query
    if (answerLower.includes(lowerQuery)) score += 2;
    
    return { faq, score };
  });
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.faq);
}


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
  },
  // Казахский язык FAQ
  {
    id: 'faq-kk-1',
    question: 'Құпия сөзді қалай қалпына келтіруге болады?',
    answer: 'Құпия сөзді қалпына келтіру үшін кіру бетіне өтіп, "Құпия сөзді ұмыттыңыз ба?" батырмасын басыңыз. Көрсетілген email-ге нұсқаулар бар хат жіберіледі.',
    category: 'tech',
    keywords: ['құпия сөз', 'қалпына келтіру', 'ұмыттым', 'password', 'reset', 'пароль'],
    language: 'kk'
  },
  {
    id: 'faq-kk-2',
    question: 'Email-ді қалай өзгертуге болады?',
    answer: 'Email-ді өзгерту үшін профиль параметрлеріне өтіп, "Байланыс ақпараты" бөлімінде "Email өзгерту" батырмасын басыңыз. Жаңа email-ді растау қажет болады.',
    category: 'tech',
    keywords: ['email', 'пошта', 'өзгерту', 'параметрлер', 'профиль'],
    language: 'kk'
  },
  {
    id: 'faq-kk-3',
    question: 'Қандай төлем әдістері қолжетімді?',
    answer: 'Біз банк карталарын (Visa, MasterCard), банк аударымдарын және электрондық әмияндарды (ЮMoney, Qiwi) қабылдаймыз.',
    category: 'billing',
    keywords: ['төлем', 'төлеу', 'карта', 'әдіс', 'payment', 'метод'],
    language: 'kk'
  },
  {
    id: 'faq-kk-4',
    question: 'Тауарды қалай қайтаруға болады?',
    answer: 'Тауарды қайтару үшін сатып алу күнінен бастап 14 күн ішінде сату бөлімімен байланысыңыз. Тапсырыс нөмірін және қайтару себебін жіберіңіз.',
    category: 'sales',
    keywords: ['қайтару', 'тауар', 'вернуть', 'refund', 'return'],
    language: 'kk'
  },
  {
    id: 'faq-kk-5',
    question: 'Демалысты қалай рәсімдеуге болады?',
    answer: 'Демалысты рәсімдеу үшін корпоративтік портал арқылы "HR" бөлімінде өтініш беріңіз немесе басшыңызға хабарласыңыз. Өтініш кем дегенде 2 апта бұрын берілуі керек.',
    category: 'hr',
    keywords: ['демалыс', 'vacation', 'leave', 'өтініш', 'hr'],
    language: 'kk'
  },
  {
    id: 'faq-kk-6',
    question: 'Сайт жүктеліп тұрмайды',
    answer: 'Браузер кэшін тазалап көріңіз, кеңейтулерді өшіріңіз немесе басқа браузерді пайдаланыңыз. Егер мәселе жалғасса, интернет байланысын тексеріңіз немесе техникалық қолдаумен байланысыңыз.',
    category: 'tech',
    keywords: ['сайт', 'жұмыс істемейді', 'жүктеліп тұрмайды', 'қате', 'site', 'down'],
    language: 'kk'
  },
  {
    id: 'faq-kk-7',
    question: 'Тапсырыс күйін қайдан көруге болады?',
    answer: 'Тапсырыс күйін жеке кабинетте "Менің тапсырыстарым" бөлімінде көруге немесе тапсырыс нөмірі бойынша бақылау бетінде қадағалауға болады.',
    category: 'sales',
    keywords: ['тапсырыс', 'күй', 'қадағалау', 'order', 'status', 'tracking'],
    language: 'kk'
  },
  {
    id: 'faq-kk-8',
    question: 'VPN жұмыс істемейді / сертификат қатесі',
    answer: 'GlobalProtect-те Log Out → Log In орындаңыз, сертификатты жаңартыңыз және компьютерді қайта қосыңыз. Егер мәселе шешілмесе — басқа желіге қосылып, қайталаңыз.',
    category: 'tech',
    keywords: ['vpn', 'сертификат', 'қате', 'жұмыс істемейді', 'globalprotect', 'желі'],
    language: 'kk'
  },
  {
    id: 'faq-kk-9',
    question: 'Корпоративтік поштамен мәселелер (Outlook)',
    answer: 'Outlook-ты қайта қосыңыз, кэшті тазалаңыз, интернет байланысын тексеріңіз. Егер хаттар келмесе — орын босатқыңыз келетін артық хаттарды жойыңыз.',
    category: 'tech',
    keywords: ['outlook', 'пошта', 'хат', 'кэш', 'қайта қосу', 'email'],
    language: 'kk'
  },
  {
    id: 'faq-kk-10',
    question: 'Принтер басып шығармайды',
    answer: 'Таңдалған принтерді тексеріңіз, басып шығару кезегін тазалаңыз және компьютерді қайта қосыңыз. Wi-Fi CORP-қа қосылғаныңызға көз жеткізіңіз.',
    category: 'tech',
    keywords: ['принтер', 'басып шығармайды', 'басып шығару', 'printer', 'wi-fi'],
    language: 'kk'
  },
  {
    id: 'faq-kk-11',
    question: 'Желілік дискілерге / корпоративтік ресурстарға қол жетпейді',
    answer: 'Тіркелгіге қайта кіріңіз (Sign Out → Sign In). Қашықтықтан қол жеткізу үшін VPN қосылғанына көз жеткізіңіз.',
    category: 'tech',
    keywords: ['желілік дискі', 'ресурс', 'қол жетпейді', 'vpn', 'тіркелгі', 'network'],
    language: 'kk'
  },
  {
    id: 'faq-kk-12',
    question: 'Компьютер баяу жұмыс істейді',
    answer: 'Артық қосымшаларды жабыңыз, компьютерді қайта қосыңыз және уақытша файлдарды тазалаңыз (%temp%). Егер қайталанатын болса, IT бөліміне хабарласыңыз.',
    category: 'tech',
    keywords: ['баяу', 'жұмыс істейді', 'қосымша', 'файл', 'temp', 'қайта қосу'],
    language: 'kk'
  },
  {
    id: 'faq-kk-13',
    question: 'Есепшілік есебін қалай алуға болады?',
    answer: 'Есепшілік есебін алу үшін есепшілік бөліміне хабарласыңыз. Сізге есепшілік есебі email арқылы немесе жеке кабинетте жіберіледі.',
    category: 'billing',
    keywords: ['есепшілік', 'есеп', 'invoice', 'төлем', 'есепшілік бөлімі'],
    language: 'kk'
  },
  {
    id: 'faq-kk-14',
    question: 'Жалақыны қашан төлейді?',
    answer: 'Жалақы әр айдың соңында төленеді. Нақты күндер туралы есепшілік бөлімінен немесе HR бөлімінен білуге болады.',
    category: 'billing',
    keywords: ['жалақы', 'төлем', 'salary', 'ақша', 'есепшілік'],
    language: 'kk'
  },
  {
    id: 'faq-kk-15',
    question: 'Жұмыс орнын қалай өзгертуге болады?',
    answer: 'Жұмыс орнын өзгерту үшін HR бөліміне өтініш беріңіз. Сізге қажетті құжаттар мен процедуралар туралы ақпарат беріледі.',
    category: 'hr',
    keywords: ['жұмыс орны', 'өзгерту', 'hr', 'өтініш', 'құжат'],
    language: 'kk'
  },
  {
    id: 'faq-kk-16',
    question: 'Қосымшаны қалай жүктеп алуға болады?',
    answer: 'Қосымшаны корпоративтік порталдан немесе IT бөлімінен алуға болады. Кейбір қосымшалар үшін басшының рұқсаты қажет.',
    category: 'tech',
    keywords: ['қосымша', 'жүктеп алу', 'application', 'software', 'it'],
    language: 'kk'
  },
  {
    id: 'faq-kk-17',
    question: 'Құжаттарды қайда қол қоюға болады?',
    answer: 'Құжаттарды корпоративтік порталда немесе HR бөлімінде қол қоюға болады. Кейбір құжаттар үшін электрондық қол қою қолданылады.',
    category: 'hr',
    keywords: ['құжат', 'қол қою', 'signature', 'hr', 'портал'],
    language: 'kk'
  },
  {
    id: 'faq-kk-18',
    question: 'Интернет жұмыс істемейді',
    answer: 'Интернет кабелін тексеріңіз, роутерді қайта қосыңыз. Егер мәселе жалғасса, IT бөліміне хабарласыңыз. Wi-Fi паролін де тексеріңіз.',
    category: 'tech',
    keywords: ['интернет', 'жұмыс істемейді', 'желі', 'wi-fi', 'роутер', 'internet'],
    language: 'kk'
  },
  {
    id: 'faq-kk-19',
    question: 'Тауардың бағасы қанша?',
    answer: 'Тауардың бағасын сату бөлімінен сұраңыз немесе веб-сайттағы каталогта қараңыз. Көп сатып алу үшін жеңілдіктер бар.',
    category: 'sales',
    keywords: ['баға', 'тауар', 'сатып алу', 'price', 'product', 'жеңілдік'],
    language: 'kk'
  },
  {
    id: 'faq-kk-20',
    question: 'Деректерді қалай сақтауға болады?',
    answer: 'Деректерді корпоративтік бұлтта немесе желілік дискіде сақтауға болады. Маңызды деректер үшін резервтік көшірме жасаңыз.',
    category: 'tech',
    keywords: ['деректер', 'сақтау', 'бұлт', 'желілік дискі', 'backup', 'data'],
    language: 'kk'
  }
];

/**
 * Определяет язык текста (простая эвристика)
 */
function detectLanguage(text: string): 'ru' | 'kk' {
  const lowerText = text.toLowerCase();
  
  // Казахские специфические символы и слова
  const kazakhIndicators = [
    'ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і',
    'қалай', 'не', 'қайда', 'қашан', 'керек', 'болады',
    'емес', 'жоқ', 'бар', 'біз', 'сіз', 'олар'
  ];
  
  const kazakhCount = kazakhIndicators.filter(indicator => 
    lowerText.includes(indicator)
  ).length;
  
  // Если найдено достаточно казахских индикаторов
  if (kazakhCount >= 2) {
    return 'kk';
  }
  
  return 'ru';
}

export function searchFAQ(query: string, limit: number = 5): FAQ[] {
  const lowerQuery = query.toLowerCase();
  const detectedLang = detectLanguage(query);
  
  // Исключаем философские и общие вопросы, которые не относятся к поддержке
  const excludedTopics = [
    'смысл жизни', 'в чем смысл', 'зачем жить', 'философия',
    'что такое жизнь', 'что такое любовь', 'что такое счастье',
    'өмірдің мағынасы', 'не үшін', 'философия', 'зачем',
    'почему', 'неге', 'не себепті', 'что есть', 'что такое'
  ];
  
  const isExcluded = excludedTopics.some(topic => lowerQuery.includes(topic));
  if (isExcluded) {
    return []; // Не ищем FAQ для таких вопросов
  }
  
  // Извлекаем ключевые слова из вопроса
  const questionWords = lowerQuery.split(/\s+/).filter(w => w.length > 3);
  
  const scored = faqDatabase.map(faq => {
    // Приоритет для FAQ на том же языке
    let score = faq.language === detectedLang ? 3 : 0;
    
    const questionLower = faq.question.toLowerCase();
    const answerLower = faq.answer.toLowerCase();
    const faqQuestionWords = questionLower.split(/\s+/).filter(w => w.length > 3);
    
    // Проверяем совпадение ключевых слов между вопросом и FAQ
    const commonWords = questionWords.filter(w => faqQuestionWords.includes(w));
    if (commonWords.length === 0) {
      // Если нет общих слов - проверяем ключевые слова FAQ
      let hasKeywordMatch = false;
      faq.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (lowerQuery.includes(keywordLower) && keywordLower.length > 3) {
          hasKeywordMatch = true;
        }
      });
      if (!hasKeywordMatch) {
        return { faq, score: 0 }; // Нет связи - не релевантно
      }
    }
    
    // Exact match in question - самый высокий приоритет
    if (questionLower.includes(lowerQuery) || lowerQuery.includes(questionLower.split(' ')[0])) {
      score += 20;
    }
    
    // Совпадение общих слов
    if (commonWords.length > 0) {
      score += commonWords.length * 5;
    }
    
    // Keyword matches - только если есть реальное совпадение
    let keywordMatches = 0;
    faq.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      // Проверяем, что ключевое слово действительно связано с вопросом
      if (lowerQuery.includes(keywordLower) && keywordLower.length > 3) {
        keywordMatches++;
        score += 5;
      }
    });
    
    // Если нет совпадений ключевых слов И нет общих слов - не релевантно
    if (keywordMatches === 0 && commonWords.length === 0 && score < 10) {
      score = 0; // Не релевантно
    }
    
    // Answer contains query - низкий приоритет
    if (answerLower.includes(lowerQuery)) score += 2;
    
    return { faq, score };
  });
  
  // Фильтруем только релевантные (score >= 8) - повысили порог
  return scored
    .filter(item => item.score >= 8) // Повышенный порог релевантности
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.faq);
}


export type Language = 'ru' | 'kk';

export const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Навигация
    'nav.title': '🤖 AI Система поддержки',
    'nav.create': 'Создать заявку',
    'nav.list': 'Все заявки',
    'nav.faq': 'FAQ',
    'nav.language': 'Язык',
    
    // Создание заявки
    'create.title': 'Создать новую заявку',
    'create.description': 'Опишите вашу проблему или вопрос. ИИ автоматически определит категорию, приоритет и направит заявку в нужный отдел.',
    'create.ticketTitle': 'Тема заявки',
    'create.ticketTitlePlaceholder': 'Кратко опишите проблему',
    'create.descriptionLabel': 'Описание',
    'create.descriptionPlaceholder': 'Подробно опишите вашу проблему или вопрос',
    'create.submit': 'Отправить заявку',
    'create.submitting': 'Отправка...',
    
    // Список заявок
    'list.title': 'Все заявки',
    'list.filterAll': 'Все отделы',
    'list.filterTech': 'Техническая поддержка',
    'list.filterSales': 'Отдел продаж',
    'list.filterBilling': 'Бухгалтерия',
    'list.filterHr': 'HR',
    'list.filterGeneral': 'Общие вопросы',
    'list.empty': 'Нет заявок',
    
    // Детали заявки
    'detail.back': '← Назад к списку',
    'detail.aiHelper': '🤖 AI Помощник',
    'detail.chatgptHints': 'Подсказки ChatGPT',
    'detail.refresh': 'Обновить',
    'detail.generating': 'Генерация...',
    'detail.hintClick': 'Нажмите на подсказку, чтобы использовать её как ответ:',
    'detail.summary': 'Резюме переписки',
    'detail.status': 'Статус:',
    'detail.statusOpen': 'Открыт',
    'detail.statusInProgress': 'В работе',
    'detail.statusResolved': 'Решен',
    'detail.statusClosed': 'Закрыт',
    'detail.conversation': 'Переписка:',
    'detail.sendPlaceholder': 'Введите ответ...',
    'detail.send': 'Отправить',
    'detail.sendHint': 'Ctrl+Enter для отправки',
    'detail.translate': 'Перевести',
    
    // Метрики
    'metrics.title': '📊 Метрики',
    'metrics.classificationAccuracy': 'Точность классификации',
    'metrics.firstResponseTime': 'Время первого ответа',
    'metrics.resolutionTime': 'Время решения',
    'metrics.routingError': '⚠️ Ошибка маршрутизации',
    'metrics.routingErrorDesc': 'Перенаправлено из',
    'metrics.min': 'мин',
    
    // Модальные окна
    'modal.aiResponded': 'ИИ автоматически ответил',
    'modal.ticketCreated': 'Заявка создана',
    'modal.error': 'Ошибка',
    'modal.translation': 'Перевод на',
    'modal.answer': 'Ответ:',
    'modal.confidence': 'Уверенность:',
    'modal.department': 'Отдел:',
    'modal.priority': 'Приоритет:',
    'modal.category': 'Категория:',
    
    // FAQ
    'faq.title': 'Часто задаваемые вопросы',
  },
  kk: {
    // Навигация
    'nav.title': '🤖 AI Қолдау жүйесі',
    'nav.create': 'Өтініш құру',
    'nav.list': 'Барлық өтініштер',
    'nav.faq': 'ЖҚС',
    'nav.language': 'Тіл',
    
    // Создание заявки
    'create.title': 'Жаңа өтініш құру',
    'create.description': 'Мәселеңізді немесе сұрағыңызды сипаттаңыз. AI автоматты түрде категорияны, басымдықты анықтайды және өтінішті қажетті бөлімге жібереді.',
    'create.ticketTitle': 'Өтініш тақырыбы',
    'create.ticketTitlePlaceholder': 'Мәселені қысқаша сипаттаңыз',
    'create.descriptionLabel': 'Сипаттама',
    'create.descriptionPlaceholder': 'Мәселеңізді немесе сұрағыңызды толығырақ сипаттаңыз',
    'create.submit': 'Өтініш жіберу',
    'create.submitting': 'Жіберілуде...',
    
    // Список заявок
    'list.title': 'Барлық өтініштер',
    'list.filterAll': 'Барлық бөлімдер',
    'list.filterTech': 'Техникалық қолдау',
    'list.filterSales': 'Сату бөлімі',
    'list.filterBilling': 'Есепшілік',
    'list.filterHr': 'HR',
    'list.filterGeneral': 'Жалпы сұрақтар',
    'list.empty': 'Өтініштер жоқ',
    
    // Детали заявки
    'detail.back': '← Тізімге оралу',
    'detail.aiHelper': '🤖 AI Көмекшісі',
    'detail.chatgptHints': 'ChatGPT кеңестері',
    'detail.refresh': 'Жаңарту',
    'detail.generating': 'Генерациялау...',
    'detail.hintClick': 'Жауап ретінде пайдалану үшін кеңеске басыңыз:',
    'detail.summary': 'Хаттаманың қорытындысы',
    'detail.status': 'Мәртебе:',
    'detail.statusOpen': 'Ашық',
    'detail.statusInProgress': 'Жұмыс істеуде',
    'detail.statusResolved': 'Шешілді',
    'detail.statusClosed': 'Жабылды',
    'detail.conversation': 'Хаттама:',
    'detail.sendPlaceholder': 'Жауап енгізіңіз...',
    'detail.send': 'Жіберу',
    'detail.sendHint': 'Жіберу үшін Ctrl+Enter',
    'detail.translate': 'Аудару',
    
    // Метрики
    'metrics.title': '📊 Метрикалар',
    'metrics.classificationAccuracy': 'Классификация дәлдігі',
    'metrics.firstResponseTime': 'Алғашқы жауап уақыты',
    'metrics.resolutionTime': 'Шешу уақыты',
    'metrics.routingError': '⚠️ Маршрутизация қатесі',
    'metrics.routingErrorDesc': 'Басқа бөлімге жіберілді',
    'metrics.min': 'мин',
    
    // Модальные окна
    'modal.aiResponded': 'AI автоматты түрде жауап берді',
    'modal.ticketCreated': 'Өтініш құрылды',
    'modal.error': 'Қате',
    'modal.translation': 'Аударма',
    'modal.answer': 'Жауап:',
    'modal.confidence': 'Сенімділік:',
    'modal.department': 'Бөлім:',
    'modal.priority': 'Басымдық:',
    'modal.category': 'Категория:',
    
    // FAQ
    'faq.title': 'Жиі қойылатын сұрақтар',
  }
};

export function getTranslation(key: string, language: Language): string {
  return translations[language][key] || translations.ru[key] || key;
}


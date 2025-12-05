import { Department } from '@/types';

export const departments: Department[] = [
  {
    id: 'tech',
    name: 'Техническая поддержка',
    description: 'Проблемы с программным обеспечением, оборудованием, сетью',
    email: 'tech@company.com'
  },
  {
    id: 'sales',
    name: 'Отдел продаж',
    description: 'Вопросы о продуктах, ценах, заказах',
    email: 'sales@company.com'
  },
  {
    id: 'billing',
    name: 'Бухгалтерия',
    description: 'Вопросы по счетам, оплате, возвратам',
    email: 'billing@company.com'
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Кадровые вопросы, отпуска, документы',
    email: 'hr@company.com'
  },
  {
    id: 'general',
    name: 'Общие вопросы',
    description: 'Общие вопросы и обращения',
    email: 'info@company.com'
  }
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}


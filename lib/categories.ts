import { Category } from './types';

export interface CategoryConfig {
  label: Category;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    label: 'Food',
    color: '#f97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: '🍔',
  },
  {
    label: 'Transportation',
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '🚗',
  },
  {
    label: 'Entertainment',
    color: '#8b5cf6',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: '🎬',
  },
  {
    label: 'Shopping',
    color: '#ec4899',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    icon: '🛍️',
  },
  {
    label: 'Bills',
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: '📄',
  },
  {
    label: 'Health',
    color: '#10b981',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    icon: '❤️',
  },
  {
    label: 'Other',
    color: '#6b7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: '📦',
  },
];

export const getCategoryConfig = (category: Category): CategoryConfig => {
  return CATEGORIES.find((c) => c.label === category) ?? CATEGORIES[CATEGORIES.length - 1];
};

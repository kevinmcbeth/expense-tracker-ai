import { Expense } from './types';

const STORAGE_KEY = 'expense-tracker-expenses';

export const loadExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : seedExpenses();
  } catch {
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

// ── Seed data so the app looks populated on first load ─────────────────────────

const today = new Date();
const d = (offsetDays: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().split('T')[0];
};

const seedExpenses = (): Expense[] => {
  const ts = new Date().toISOString();
  const expenses: Expense[] = [
    { id: 'seed-1', amount: 52.4, category: 'Food', description: 'Grocery run — Whole Foods', date: d(1), createdAt: ts, updatedAt: ts },
    { id: 'seed-2', amount: 18.5, category: 'Transportation', description: 'Uber to downtown', date: d(2), createdAt: ts, updatedAt: ts },
    { id: 'seed-3', amount: 14.99, category: 'Entertainment', description: 'Netflix subscription', date: d(3), createdAt: ts, updatedAt: ts },
    { id: 'seed-4', amount: 89.0, category: 'Shopping', description: 'New running shoes', date: d(4), createdAt: ts, updatedAt: ts },
    { id: 'seed-5', amount: 130.0, category: 'Bills', description: 'Electric bill', date: d(5), createdAt: ts, updatedAt: ts },
    { id: 'seed-6', amount: 35.6, category: 'Food', description: 'Dinner at Thai restaurant', date: d(6), createdAt: ts, updatedAt: ts },
    { id: 'seed-7', amount: 25.0, category: 'Health', description: 'Pharmacy — vitamins', date: d(7), createdAt: ts, updatedAt: ts },
    { id: 'seed-8', amount: 12.0, category: 'Transportation', description: 'Monthly bus pass top-up', date: d(10), createdAt: ts, updatedAt: ts },
    { id: 'seed-9', amount: 45.0, category: 'Entertainment', description: 'Concert tickets', date: d(12), createdAt: ts, updatedAt: ts },
    { id: 'seed-10', amount: 200.0, category: 'Shopping', description: 'Winter jacket', date: d(15), createdAt: ts, updatedAt: ts },
    { id: 'seed-11', amount: 60.0, category: 'Bills', description: 'Internet bill', date: d(18), createdAt: ts, updatedAt: ts },
    { id: 'seed-12', amount: 22.5, category: 'Food', description: 'Coffee & lunch', date: d(20), createdAt: ts, updatedAt: ts },
    { id: 'seed-13', amount: 150.0, category: 'Health', description: 'Gym membership — monthly', date: d(22), createdAt: ts, updatedAt: ts },
    { id: 'seed-14', amount: 8.99, category: 'Entertainment', description: 'Spotify subscription', date: d(25), createdAt: ts, updatedAt: ts },
    { id: 'seed-15', amount: 75.3, category: 'Food', description: 'Weekly groceries', date: d(28), createdAt: ts, updatedAt: ts },
    { id: 'seed-16', amount: 320.0, category: 'Bills', description: 'Rent — partial', date: d(30), createdAt: ts, updatedAt: ts },
    { id: 'seed-17', amount: 40.0, category: 'Shopping', description: 'Books from Amazon', date: d(33), createdAt: ts, updatedAt: ts },
    { id: 'seed-18', amount: 95.0, category: 'Transportation', description: 'Car insurance payment', date: d(35), createdAt: ts, updatedAt: ts },
    { id: 'seed-19', amount: 28.0, category: 'Food', description: 'Pizza night', date: d(38), createdAt: ts, updatedAt: ts },
    { id: 'seed-20', amount: 50.0, category: 'Other', description: 'Gift for a friend', date: d(40), createdAt: ts, updatedAt: ts },
  ];
  saveExpenses(expenses);
  return expenses;
};

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadExpenses, saveExpenses } from '@/lib/storage';
import { Category, Expense, ExpenseFilters } from '@/lib/types';
import { computeDashboardStats, generateId, todayISO } from '@/lib/utils';

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever expenses change
  useEffect(() => {
    if (isLoaded) saveExpenses(expenses);
  }, [expenses, isLoaded]);

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const addExpense = useCallback(
    (data: { amount: number; category: Category; description: string; date: string }) => {
      const now = new Date().toISOString();
      const expense: Expense = {
        id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [expense, ...prev]);
      return expense;
    },
    []
  );

  const updateExpense = useCallback(
    (id: string, data: Partial<Pick<Expense, 'amount' | 'category' | 'description' | 'date'>>) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        )
      );
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteMultiple = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setExpenses((prev) => prev.filter((e) => !set.has(e.id)));
  }, []);

  // ── Filtered + sorted view ──────────────────────────────────────────────────

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    if (filters.category !== 'All') {
      result = result.filter((e) => e.category === filters.category);
    }

    if (filters.dateFrom) {
      result = result.filter((e) => e.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((e) => e.date <= filters.dateTo);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (filters.sortBy === 'date') cmp = a.date.localeCompare(b.date);
      else if (filters.sortBy === 'amount') cmp = a.amount - b.amount;
      else if (filters.sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [expenses, filters]);

  const stats = useMemo(() => computeDashboardStats(expenses), [expenses]);

  const updateFilters = useCallback((partial: Partial<ExpenseFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  return {
    expenses,
    filteredExpenses,
    filters,
    stats,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultiple,
    updateFilters,
    resetFilters,
    todayISO,
  };
};

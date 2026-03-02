import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { Category, CategoryStats, DashboardStats, Expense, MonthlyStats } from './types';
import { CATEGORIES } from './categories';

// ── Formatting ────────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatMonth = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr + '-01'), 'MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd');

// ── ID generation ─────────────────────────────────────────────────────────────

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

// ── CSV export ────────────────────────────────────────────────────────────────

export const exportToCSV = (expenses: Expense[]): void => {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ── Stats computation ─────────────────────────────────────────────────────────

export const computeDashboardStats = (expenses: Expense[]): DashboardStats => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const totalAllTime = expenses.reduce((s, e) => s + e.amount, 0);

  const thisMonthExpenses = expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: thisMonthStart, end: thisMonthEnd })
  );
  const lastMonthExpenses = expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: lastMonthStart, end: lastMonthEnd })
  );

  const totalThisMonth = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalLastMonth = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyChange =
    totalLastMonth === 0 ? 0 : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  // Category stats
  const categoryTotals: Record<string, { total: number; count: number }> = {};
  for (const e of expenses) {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = { total: 0, count: 0 };
    categoryTotals[e.category].total += e.amount;
    categoryTotals[e.category].count++;
  }

  const categoryStats: CategoryStats[] = CATEGORIES.map((c) => ({
    category: c.label as Category,
    total: categoryTotals[c.label]?.total ?? 0,
    count: categoryTotals[c.label]?.count ?? 0,
    percentage: totalAllTime > 0 ? ((categoryTotals[c.label]?.total ?? 0) / totalAllTime) * 100 : 0,
  })).sort((a, b) => b.total - a.total);

  // Monthly stats — last 6 months
  const monthlyStats: MonthlyStats[] = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const month = format(d, 'yyyy-MM');
    const label = format(d, 'MMM yyyy');
    const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
    return {
      month,
      label,
      total: monthExpenses.reduce((s, e) => s + e.amount, 0),
      count: monthExpenses.length,
    };
  });

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return {
    totalAllTime,
    totalThisMonth,
    totalLastMonth,
    monthlyChange,
    categoryStats,
    monthlyStats,
    recentExpenses: sorted.slice(0, 5),
    expenseCount: expenses.length,
    averageExpense: expenses.length > 0 ? totalAllTime / expenses.length : 0,
  };
};

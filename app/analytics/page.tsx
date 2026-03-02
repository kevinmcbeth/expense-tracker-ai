'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useExpenses } from '@/hooks/useExpenses';
import { getCategoryConfig } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';
import CategoryBreakdown from '@/components/charts/CategoryBreakdown';
import { format, subMonths, parseISO } from 'date-fns';
import { Category } from '@/lib/types';

export default function AnalyticsPage() {
  const { expenses, stats, isLoaded } = useExpenses();
  const [selectedRange, setSelectedRange] = useState<3 | 6 | 12>(6);

  // Build monthly area chart data for selected range
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: selectedRange }, (_, i) => {
      const d = subMonths(now, selectedRange - 1 - i);
      const month = format(d, 'yyyy-MM');
      const label = format(d, 'MMM yy');
      const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
      const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
      return { month, label, total, count: monthExpenses.length };
    });
  }, [expenses, selectedRange]);

  // Top 5 most expensive individual expenses
  const topExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [expenses]
  );

  // Category totals for bar chart
  const categoryChartData = useMemo(
    () =>
      stats.categoryStats
        .filter((c) => c.total > 0)
        .map((c) => ({
          name: c.category,
          total: c.total,
          color: getCategoryConfig(c.category).color,
        })),
    [stats.categoryStats]
  );

  // Daily average for the current month
  const dailyAvg = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    return dayOfMonth > 0 ? stats.totalThisMonth / dayOfMonth : 0;
  }, [stats.totalThisMonth]);

  // Spending by day-of-week (all time)
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = Array(7).fill(0);
    expenses.forEach((e) => {
      const dow = parseISO(e.date).getDay();
      totals[dow] += e.amount;
    });
    return days.map((d, i) => ({ day: d, total: totals[i] }));
  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
          <p className="font-semibold text-gray-700">{label}</p>
          <p className="text-indigo-600 font-bold mt-0.5">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Deep insights into your spending habits</p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Daily Average (this month)', value: formatCurrency(dailyAvg) },
          { label: 'Weekly Average (this month)', value: formatCurrency(dailyAvg * 7) },
          { label: 'Biggest Single Expense', value: formatCurrency(topExpenses[0]?.amount ?? 0) },
          { label: 'Months Tracked', value: `${monthlyData.filter((m) => m.total > 0).length}` },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Area chart with range selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Spending Trend</h2>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {([3, 6, 12] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSelectedRange(n)}
                className={`px-3 py-1.5 font-medium transition-colors
                  ${selectedRange === n
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {n}M
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#colorTotal)" dot={{ fill: '#6366f1', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Spending by Category</h2>
          {categoryChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {categoryChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Day of week heatmap */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Spending by Day of Week</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dayOfWeekData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
              <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category breakdown with bars */}
        <CategoryBreakdown data={stats.categoryStats} />

        {/* Top expenses */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top 5 Largest Expenses</h2>
          {topExpenses.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No expenses yet.</p>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((e, i) => {
                const cfg = getCategoryConfig(e.category as Category);
                return (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{e.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${cfg.bgColor} ${cfg.textColor}`}>
                          {cfg.icon} {e.category}
                        </span>
                        <span className="text-xs text-gray-400">{format(parseISO(e.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(e.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

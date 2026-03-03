'use client';

import { useMemo, useState } from 'react';
import { subDays, startOfYear, parseISO, isAfter } from 'date-fns';
import { useExpenses } from '@/hooks/useExpenses';
import { getCategoryConfig } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';
import { Category } from '@/lib/types';

type TimeRange = 'all' | 'year' | '30d' | '7d';

const TIME_FILTERS: { label: string; value: TimeRange }[] = [
  { label: 'All time', value: 'all' },
  { label: 'This year', value: 'year' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 7 days', value: '7d' },
];

export default function TopCategoriesPage() {
  const { expenses, isLoaded } = useExpenses();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const filtered = useMemo(() => {
    if (timeRange === 'all') return expenses;
    const now = new Date();
    let cutoff: Date;
    if (timeRange === 'year') cutoff = startOfYear(now);
    else if (timeRange === '30d') cutoff = subDays(now, 30);
    else cutoff = subDays(now, 7);
    return expenses.filter((e) => isAfter(parseISO(e.date), cutoff));
  }, [expenses, timeRange]);

  const categoryStats = useMemo(() => {
    const grandTotal = filtered.reduce((s, e) => s + e.amount, 0);
    const map: Record<string, { total: number; count: number }> = {};
    for (const e of filtered) {
      if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
      map[e.category].total += e.amount;
      map[e.category].count++;
    }
    return Object.entries(map)
      .map(([category, { total, count }]) => ({
        category: category as Category,
        total,
        count,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const grandTotal = filtered.reduce((s, e) => s + e.amount, 0);
  const maxTotal = categoryStats[0]?.total ?? 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Top Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Spending breakdown by category</p>
      </div>

      {/* Time filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TIME_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTimeRange(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              timeRange === value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-500">Total spent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(grandTotal)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filtered.length}</p>
        </div>
      </div>

      {/* Category list */}
      {isLoaded && categoryStats.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No expenses in this period.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
          {categoryStats.map(({ category, total, count, percentage }, idx) => {
            const cfg = getCategoryConfig(category);
            const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
            return (
              <div key={category} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xl shrink-0">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-gray-900">{cfg.label}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-gray-400">{count} tx</span>
                        <span className="text-sm text-gray-400 w-10 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="font-semibold text-gray-900 w-24 text-right">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: cfg.color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

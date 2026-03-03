'use client';

import { useMemo, useState } from 'react';
import { subDays, startOfYear, parseISO, isAfter } from 'date-fns';
import { Search } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { getCategoryConfig } from '@/lib/categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Category } from '@/lib/types';

type TimeRange = 'all' | 'year' | '30d' | '7d';

const TIME_FILTERS: { label: string; value: TimeRange }[] = [
  { label: 'All time', value: 'all' },
  { label: 'This year', value: 'year' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 7 days', value: '7d' },
];

export default function TopVendorsPage() {
  const { expenses, isLoaded } = useExpenses();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (timeRange === 'all') return expenses;
    const now = new Date();
    let cutoff: Date;
    if (timeRange === 'year') cutoff = startOfYear(now);
    else if (timeRange === '30d') cutoff = subDays(now, 30);
    else cutoff = subDays(now, 7);
    return expenses.filter((e) => isAfter(parseISO(e.date), cutoff));
  }, [expenses, timeRange]);

  const vendors = useMemo(() => {
    const map: Record<
      string,
      { total: number; count: number; lastDate: string; categories: Record<string, number> }
    > = {};
    for (const e of filtered) {
      const key = e.description.trim();
      if (!map[key]) map[key] = { total: 0, count: 0, lastDate: e.date, categories: {} };
      map[key].total += e.amount;
      map[key].count++;
      if (e.date > map[key].lastDate) map[key].lastDate = e.date;
      map[key].categories[e.category] = (map[key].categories[e.category] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([name, { total, count, lastDate, categories }]) => {
        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0] as Category;
        return { name, total, count, lastDate, topCategory };
      })
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const displayVendors = useMemo(() => {
    if (!search.trim()) return vendors;
    const q = search.toLowerCase();
    return vendors.filter((v) => v.name.toLowerCase().includes(q));
  }, [vendors, search]);

  const grandTotal = filtered.reduce((s, e) => s + e.amount, 0);
  const maxTotal = displayVendors[0]?.total ?? 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Top Vendors</h1>
        <p className="text-sm text-gray-500 mt-1">
          Spending grouped by description — each unique description is treated as a vendor
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-500">Unique vendors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{vendors.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-500">Total spent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(grandTotal)}</p>
        </div>
      </div>

      {/* Vendor list */}
      {isLoaded && displayVendors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No vendors found.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
          {displayVendors.map(({ name, total, count, lastDate, topCategory }, idx) => {
            const cfg = getCategoryConfig(topCategory);
            const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
            return (
              <div key={name} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-gray-400 w-5 text-right shrink-0 pt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-gray-900 truncate">{name}</span>
                      <span className="font-semibold text-gray-900 ml-3 shrink-0">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bgColor} ${cfg.textColor}`}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {count} {count === 1 ? 'tx' : 'txs'}
                      </span>
                      <span className="text-xs text-gray-400">last: {formatDate(lastDate)}</span>
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

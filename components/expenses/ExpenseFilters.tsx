'use client';

import { Search, X, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { ExpenseFilters } from '@/lib/types';

interface FiltersProps {
  filters: ExpenseFilters;
  onChange: (partial: Partial<ExpenseFilters>) => void;
  onReset: () => void;
  resultCount: number;
}

export default function ExpenseFilterBar({ filters, onChange, onReset, resultCount }: FiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'All' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value as ExpenseFilters['category'] })}
            className="appearance-none pr-8 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.label} value={c.label}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Date from */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="From"
        />

        {/* Date to */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="To"
        />

        {/* Sort */}
        <div className="relative">
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [
                ExpenseFilters['sortBy'],
                ExpenseFilters['sortOrder'],
              ];
              onChange({ sortBy, sortOrder });
            }}
            className="appearance-none pr-8 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
          >
            <option value="date-desc">Date ↓ (newest)</option>
            <option value="date-asc">Date ↑ (oldest)</option>
            <option value="amount-desc">Amount ↓ (highest)</option>
            <option value="amount-asc">Amount ↑ (lowest)</option>
            <option value="category-asc">Category A→Z</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Results + reset */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{resultCount} {resultCount === 1 ? 'expense' : 'expenses'} found</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

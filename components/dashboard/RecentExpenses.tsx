'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import CategoryBadge from '@/components/ui/Badge';

export default function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Recent Expenses</h2>
        <Link
          href="/expenses"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">No expenses yet.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{e.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <CategoryBadge category={e.category} />
                  <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 shrink-0">
                {formatCurrency(e.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

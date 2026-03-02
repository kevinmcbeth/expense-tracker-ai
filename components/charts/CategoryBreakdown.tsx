'use client';

import { CategoryStats } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: CategoryStats[];
}

export default function CategoryBreakdown({ data }: Props) {
  const nonZero = data.filter((d) => d.total > 0);
  const maxTotal = Math.max(...nonZero.map((d) => d.total), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Category Breakdown</h2>
      {nonZero.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No expenses yet.</p>
      ) : (
        <div className="space-y-3">
          {nonZero.map((stat) => {
            const cfg = getCategoryConfig(stat.category);
            const barWidth = (stat.total / maxTotal) * 100;
            return (
              <div key={stat.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{cfg.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{stat.category}</span>
                    <span className="text-xs text-gray-400">({stat.count})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(stat.total)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1.5">
                      {stat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, backgroundColor: cfg.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

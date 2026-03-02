'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategoryStats } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: CategoryStats[];
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CategoryStats }>;
}) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700">{d.category}</p>
        <p className="text-gray-600">{formatCurrency(d.total)}</p>
        <p className="text-gray-400">{d.percentage.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ data }: Props) {
  const nonZero = data.filter((d) => d.total > 0);

  if (nonZero.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Spending by Category</h2>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={nonZero}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={44}
            paddingAngle={2}
          >
            {nonZero.map((entry) => (
              <Cell
                key={entry.category}
                fill={getCategoryConfig(entry.category).color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

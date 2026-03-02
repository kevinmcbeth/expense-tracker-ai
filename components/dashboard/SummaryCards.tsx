'use client';

import { TrendingUp, TrendingDown, DollarSign, ReceiptText, CalendarDays, BarChart3 } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  stats: DashboardStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const changeAbs = Math.abs(stats.monthlyChange);
  const isUp = stats.monthlyChange >= 0;

  const cards = [
    {
      label: 'Total Spent',
      value: formatCurrency(stats.totalAllTime),
      sub: `${stats.expenseCount} total expenses`,
      icon: DollarSign,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'This Month',
      value: formatCurrency(stats.totalThisMonth),
      sub: stats.totalLastMonth > 0
        ? `${isUp ? '▲' : '▼'} ${changeAbs.toFixed(1)}% vs last month`
        : 'No data last month',
      subColor: stats.totalLastMonth > 0 ? (isUp ? 'text-red-500' : 'text-green-500') : 'text-gray-400',
      icon: isUp ? TrendingUp : TrendingDown,
      color: isUp ? 'text-red-500' : 'text-green-500',
      bg: isUp ? 'bg-red-50' : 'bg-green-50',
    },
    {
      label: 'Last Month',
      value: formatCurrency(stats.totalLastMonth),
      sub: `${stats.monthlyStats[stats.monthlyStats.length - 2]?.count ?? 0} expenses`,
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Avg. Expense',
      value: formatCurrency(stats.averageExpense),
      sub: 'Per transaction',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Top Category',
      value: stats.categoryStats[0]?.category ?? '—',
      sub: stats.categoryStats[0]
        ? `${formatCurrency(stats.categoryStats[0].total)} spent`
        : 'No expenses yet',
      icon: ReceiptText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <div className={`${card.bg} p-1.5 rounded-lg`}>
              <card.icon size={14} className={card.color} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 truncate">{card.value}</p>
            <p className={`text-xs mt-0.5 ${(card as { subColor?: string }).subColor ?? 'text-gray-400'}`}>
              {card.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

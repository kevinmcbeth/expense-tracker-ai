'use client';

import { useState } from 'react';
import { Plus, ArrowUpFromLine } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import MonthlyBarChart from '@/components/charts/MonthlyBarChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import Modal from '@/components/ui/Modal';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExportModal from '@/components/export/ExportModal';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { expenses, stats, isLoaded, addExpense } = useExpenses();
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your spending at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700
                       rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <ArrowUpFromLine size={15} className="text-gray-500" />
            Export
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MonthlyBarChart data={stats.monthlyStats} />
        <CategoryPieChart data={stats.categoryStats} />
      </div>

      {/* Recent + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentExpenses expenses={stats.recentExpenses} />
        <CategoryBreakdownInline data={stats.categoryStats} />
      </div>

      {/* Export modal */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        expenses={expenses}
      />

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Expense">
        <ExpenseForm
          onSubmit={(data) => {
            addExpense(data);
            setAddOpen(false);
            toast.success('Expense added!');
          }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Inline category breakdown to avoid extra import for dashboard only
import { getCategoryConfig } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';
import { CategoryStats } from '@/lib/types';

function CategoryBreakdownInline({ data }: { data: CategoryStats[] }) {
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

'use client';

import { useState } from 'react';
import { Plus, Download, Trash2, Receipt } from 'lucide-react';
import { Expense } from '@/lib/types';
import { exportToCSV, formatCurrency } from '@/lib/utils';
import { useExpenses } from '@/hooks/useExpenses';
import Modal from '@/components/ui/Modal';
import ExpenseForm from './ExpenseForm';
import ExpenseItem from './ExpenseItem';
import ExpenseFilterBar from './ExpenseFilters';
import toast from 'react-hot-toast';

export default function ExpenseList() {
  const {
    filteredExpenses,
    filters,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultiple,
    updateFilters,
    resetFilters,
  } = useExpenses();

  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredExpenses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredExpenses.map((e) => e.id)));
    }
  };

  const handleBulkDelete = () => {
    deleteMultiple([...selected]);
    toast.success(`Deleted ${selected.size} expense${selected.size > 1 ? 's' : ''}`);
    setSelected(new Set());
    setBulkDeleteOpen(false);
  };

  const handleExport = () => {
    const toExport = selected.size > 0
      ? filteredExpenses.filter((e) => selected.has(e.id))
      : filteredExpenses;
    exportToCSV(toExport);
    toast.success(`Exported ${toExport.length} expense${toExport.length > 1 ? 's' : ''} to CSV`);
  };

  const totalFiltered = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Add Expense
        </button>

        {selected.size > 0 && (
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Delete {selected.size} selected
          </button>
        )}

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ml-auto"
        >
          <Download size={16} />
          Export{selected.size > 0 ? ` (${selected.size})` : ''} CSV
        </button>
      </div>

      {/* Filters */}
      <ExpenseFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        resultCount={filteredExpenses.length}
      />

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Receipt size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No expenses found</p>
            <p className="text-xs mt-1">Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <input
                type="checkbox"
                checked={selected.size === filteredExpenses.length && filteredExpenses.length > 0}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
              <div className="w-28 shrink-0">Date</div>
              <div className="flex-1">Description</div>
              <div className="hidden sm:block w-36 shrink-0">Category</div>
              <div className="w-24 text-right shrink-0">Amount</div>
              <div className="w-16 shrink-0" />
            </div>

            {/* Rows */}
            {filteredExpenses.map((expense: Expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                selected={selected.has(expense.id)}
                onToggle={toggleSelect}
                onUpdate={(id, data) => {
                  updateExpense(id, data);
                  toast.success('Expense updated');
                }}
                onDelete={(id) => {
                  deleteExpense(id);
                  toast.success('Expense deleted');
                }}
              />
            ))}

            {/* Footer total */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex-1 text-xs text-gray-500">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                {selected.size > 0 && ` · ${selected.size} selected`}
              </div>
              <div className="text-sm font-semibold text-gray-900">{formatCurrency(totalFiltered)}</div>
            </div>
          </>
        )}
      </div>

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

      {/* Bulk delete confirmation */}
      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Delete Expenses">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">{selected.size} expenses</span>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setBulkDeleteOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700"
            >
              Delete {selected.size}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

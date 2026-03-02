'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import CategoryBadge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ExpenseForm from './ExpenseForm';

interface ExpenseItemProps {
  expense: Expense;
  selected: boolean;
  onToggle: (id: string) => void;
  onUpdate: (id: string, data: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({
  expense,
  selected,
  onToggle,
  onUpdate,
  onDelete,
}: ExpenseItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group
          ${selected ? 'bg-indigo-50' : ''}`}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(expense.id)}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
        />

        {/* Date */}
        <div className="w-28 shrink-0 text-sm text-gray-500">{formatDate(expense.date)}</div>

        {/* Description + category */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
          <div className="mt-0.5 sm:hidden">
            <CategoryBadge category={expense.category} />
          </div>
        </div>

        {/* Category — hidden on small screens */}
        <div className="hidden sm:block w-36 shrink-0">
          <CategoryBadge category={expense.category} />
        </div>

        {/* Amount */}
        <div className="w-24 text-right shrink-0 text-sm font-semibold text-gray-900">
          {formatCurrency(expense.amount)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Expense">
        <ExpenseForm
          initial={expense}
          onSubmit={(data) => {
            onUpdate(expense.id, data);
            setEditOpen(false);
          }}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete Expense">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900">&ldquo;{expense.description}&rdquo;</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete(expense.id);
                setConfirmDelete(false);
              }}
              className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import { Category, Expense } from '@/lib/types';
import { todayISO } from '@/lib/utils';

interface FormData {
  amount: string;
  category: Category;
  description: string;
  date: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
}

interface ExpenseFormProps {
  initial?: Expense | null;
  onSubmit: (data: { amount: number; category: Category; description: string; date: string }) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Add Expense',
}: ExpenseFormProps) {
  const [form, setForm] = useState<FormData>({
    amount: initial ? String(initial.amount) : '',
    category: initial?.category ?? 'Food',
    description: initial?.description ?? '',
    date: initial?.date ?? todayISO(),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initial) {
      setForm({
        amount: String(initial.amount),
        category: initial.category,
        description: initial.description,
        date: initial.date,
      });
    }
  }, [initial]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0.';
    } else if (amt > 1_000_000) {
      errs.amount = 'Amount cannot exceed $1,000,000.';
    }
    if (!form.description.trim()) {
      errs.description = 'Description is required.';
    } else if (form.description.trim().length > 120) {
      errs.description = 'Description must be 120 characters or fewer.';
    }
    if (!form.date) {
      errs.date = 'Date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    });
  };

  const field = (key: keyof FormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => field('amount', e.target.value)}
            className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
              ${errors.amount ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}
              focus:ring-2`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => field('category', c.label)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all
                ${
                  form.category === c.label
                    ? `${c.bgColor} ${c.textColor} border-current ring-2 ring-offset-1`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="What was this expense for?"
          value={form.description}
          maxLength={120}
          onChange={(e) => field('description', e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
            ${errors.description ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}
            focus:ring-2`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-400">{form.description.length}/120</p>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.date}
          max={todayISO()}
          onChange={(e) => field('date', e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
            ${errors.date ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'}
            focus:ring-2`}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

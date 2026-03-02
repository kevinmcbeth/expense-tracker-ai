'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  X, Download, Loader2, FileSpreadsheet, Braces, FileText,
  Calendar, Tag, RotateCcw, ChevronDown, ChevronUp, CheckSquare, Square,
} from 'lucide-react';
import { format as dateFmt } from 'date-fns';
import toast from 'react-hot-toast';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES, getCategoryConfig } from '@/lib/categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportAsCSV, exportAsJSON, exportAsPDF } from '@/lib/exportService';

// ── Types ─────────────────────────────────────────────────────────────────────

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
}

// ── Format configuration ──────────────────────────────────────────────────────

const FORMATS: Array<{
  id: ExportFormat;
  label: string;
  subtitle: string;
  ext: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  activeBorderColor: string;
  activeRingColor: string;
}> = [
  {
    id: 'csv',
    label: 'CSV',
    subtitle: 'Spreadsheet compatible · Excel, Google Sheets',
    ext: '.csv',
    Icon: FileSpreadsheet,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    activeBorderColor: 'border-emerald-400',
    activeRingColor: 'ring-emerald-200',
  },
  {
    id: 'json',
    label: 'JSON',
    subtitle: 'Structured data · APIs, developers',
    ext: '.json',
    Icon: Braces,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    activeBorderColor: 'border-sky-400',
    activeRingColor: 'ring-sky-200',
  },
  {
    id: 'pdf',
    label: 'PDF',
    subtitle: 'Print-ready report · Branded layout',
    ext: '.pdf',
    Icon: FileText,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    activeBorderColor: 'border-rose-400',
    activeRingColor: 'ring-rose-200',
  },
];

const ALL_CATEGORIES = CATEGORIES.map((c) => c.label as Category);

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExportModal({ open, onClose, expenses }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(ALL_CATEGORIES)
  );
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [catSectionOpen, setCatSectionOpen] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset all state each time the modal opens
  useEffect(() => {
    if (open) {
      setExportFormat('csv');
      setDateFrom('');
      setDateTo('');
      setSelectedCategories(new Set(ALL_CATEGORIES));
      setFilename(`expenses-${dateFmt(new Date(), 'yyyy-MM-dd')}`);
      setLoading(false);
    }
  }, [open]);

  // Escape key closes the modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (dateFrom && e.date < dateFrom) return false;
        if (dateTo && e.date > dateTo) return false;
        if (!selectedCategories.has(e.category)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, dateFrom, dateTo, selectedCategories]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const previewRows = filteredExpenses.slice(0, 9);
  const activeFormat = FORMATS.find((f) => f.id === exportFormat)!;
  const allSelected = selectedCategories.size === ALL_CATEGORIES.length;
  const noneSelected = selectedCategories.size === 0;
  const hasDateFilter = dateFrom !== '' || dateTo !== '';
  const hasCategoryFilter = !allSelected;
  const activeFilterCount = (hasDateFilter ? 1 : 0) + (hasCategoryFilter ? 1 : 0);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  }, []);

  const handleExport = async () => {
    if (filteredExpenses.length === 0 || loading) return;
    setLoading(true);

    try {
      const name = filename.trim() || `expenses-${dateFmt(new Date(), 'yyyy-MM-dd')}`;
      const appliedFilters = {
        dateFrom,
        dateTo,
        categories: Array.from(selectedCategories).sort(),
      };

      if (exportFormat === 'csv') {
        await new Promise((r) => setTimeout(r, 400));
        exportAsCSV(filteredExpenses, name);
      } else if (exportFormat === 'json') {
        await new Promise((r) => setTimeout(r, 400));
        exportAsJSON(filteredExpenses, name);
      } else {
        await exportAsPDF(filteredExpenses, name, appliedFilters);
      }

      toast.success(
        `${filteredExpenses.length} expenses exported as ${exportFormat.toUpperCase()}`
      );
      onClose();
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
           style={{ maxHeight: 'min(92vh, 760px)' }}>

        {/* ── Modal header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Download size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Export Expenses</h2>
              <p className="text-xs text-indigo-200">
                {expenses.length} total records available
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Format selector ───────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Export Format
          </p>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map((fmt) => {
              const isActive = exportFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id)}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all text-left
                    ${isActive
                      ? `${fmt.activeBorderColor} ring-2 ${fmt.activeRingColor} bg-white shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                    }`}
                >
                  <div className={`${fmt.iconBg} p-2 rounded-lg shrink-0 mt-0.5`}>
                    <fmt.Icon size={17} className={fmt.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{fmt.label}</span>
                      <span className="text-xs text-gray-400 font-mono">{fmt.ext}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{fmt.subtitle}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main body: filters + preview ──────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left panel: Filters */}
          <div className="w-56 shrink-0 border-r border-gray-100 overflow-y-auto p-4 space-y-5 bg-gray-50/50">

            {/* Date range */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Range
                  </span>
                </div>
                {hasDateFilter && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                    className="flex items-center gap-0.5 text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    <RotateCcw size={10} /> Clear
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white
                               focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white
                               focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                </div>
              </div>
            </section>

            {/* Category filter */}
            <section>
              <button
                onClick={() => setCatSectionOpen((v) => !v)}
                className="w-full flex items-center justify-between mb-2.5 group"
              >
                <div className="flex items-center gap-1.5">
                  <Tag size={12} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categories
                  </span>
                  {hasCategoryFilter && (
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                      {selectedCategories.size}/{ALL_CATEGORIES.length}
                    </span>
                  )}
                </div>
                {catSectionOpen
                  ? <ChevronUp size={12} className="text-gray-400" />
                  : <ChevronDown size={12} className="text-gray-400" />
                }
              </button>

              {catSectionOpen && (
                <div className="space-y-1">
                  {/* Select all / none toggle */}
                  <button
                    onClick={() =>
                      setSelectedCategories(
                        allSelected ? new Set() : new Set(ALL_CATEGORIES)
                      )
                    }
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500
                               hover:bg-gray-100 transition-colors border border-dashed border-gray-200 mb-2"
                  >
                    {allSelected
                      ? <CheckSquare size={13} className="text-indigo-500" />
                      : <Square size={13} className="text-gray-400" />
                    }
                    <span className="font-medium">{allSelected ? 'Deselect all' : 'Select all'}</span>
                  </button>

                  {CATEGORIES.map((c) => {
                    const cat = c.label as Category;
                    const isOn = selectedCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs
                                    transition-colors text-left
                                    ${isOn
                                      ? 'bg-indigo-50 text-indigo-700'
                                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                    }`}
                      >
                        <span className={`shrink-0 ${isOn ? 'text-indigo-500' : 'text-gray-300'}`}>
                          {isOn
                            ? <CheckSquare size={13} />
                            : <Square size={13} />
                          }
                        </span>
                        <span>{c.icon}</span>
                        <span className="font-medium">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right panel: Preview */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Summary bar */}
            <div className="px-5 py-3 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-5">
                <div>
                  <span className="text-2xl font-extrabold text-gray-900">
                    {filteredExpenses.length}
                  </span>
                  <span className="text-sm text-gray-400 ml-1.5">
                    {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
                  </span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {formatCurrency(totalAmount)}
                  </span>
                  <span className="text-sm text-gray-400 ml-1.5">total</span>
                </div>

                {noneSelected && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                    No categories selected
                  </span>
                )}
                {!noneSelected && filteredExpenses.length === 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                    No results match filters
                  </span>
                )}
                {filteredExpenses.length > 0 && (
                  <span className="ml-auto text-xs text-gray-400">
                    Preview: {Math.min(9, filteredExpenses.length)} of {filteredExpenses.length} shown
                  </span>
                )}
              </div>
            </div>

            {/* Preview table */}
            <div className="flex-1 overflow-y-auto">
              {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300">
                  <FileText size={36} />
                  <p className="text-sm font-medium">No data to preview</p>
                  <p className="text-xs">Adjust your filters above</p>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-500 w-28">Date</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-500 w-36">Category</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-gray-500 w-24">Amount</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((e, i) => {
                      const cfg = getCategoryConfig(e.category);
                      return (
                        <tr
                          key={e.id}
                          className={`border-b border-gray-100 hover:bg-indigo-50/40 transition-colors
                            ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                            {formatDate(e.date)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${cfg.bgColor} ${cfg.textColor}`}>
                              {cfg.icon} {e.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 max-w-0">
                            <span className="block truncate">{e.description}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {filteredExpenses.length > 9 && (
                <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-100 text-xs text-indigo-600 font-medium">
                  + {filteredExpenses.length - 9} more rows — all {filteredExpenses.length} will be included in the export
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer: filename + actions ─────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-end gap-4">
            {/* Filename */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Filename
              </label>
              <div className="flex items-stretch">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-l-lg text-sm bg-white
                             focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="my-expenses"
                  disabled={loading}
                />
                <div className="flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-xs text-gray-500 font-mono whitespace-nowrap">
                  {activeFormat.ext}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium
                           text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading || filteredExpenses.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-lg text-sm font-semibold
                           text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed shadow-sm min-w-[152px] justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Exporting…</span>
                  </>
                ) : (
                  <>
                    <activeFormat.Icon size={15} />
                    <span>Export {filteredExpenses.length} rows</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

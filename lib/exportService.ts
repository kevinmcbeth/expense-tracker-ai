import { format } from 'date-fns';
import { Expense } from './types';

// ── Shared download helper ────────────────────────────────────────────────────

const triggerDownload = (content: string, filename: string, mime: string): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ── CSV ───────────────────────────────────────────────────────────────────────

export const exportAsCSV = (expenses: Expense[], filename: string): void => {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// ── JSON ──────────────────────────────────────────────────────────────────────

export const exportAsJSON = (expenses: Expense[], filename: string): void => {
  const payload = {
    exportedAt: new Date().toISOString(),
    count: expenses.length,
    total: parseFloat(expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)),
    expenses: expenses.map((e) => ({
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description,
    })),
  };
  triggerDownload(JSON.stringify(payload, null, 2), `${filename}.json`, 'application/json');
};

// ── PDF ───────────────────────────────────────────────────────────────────────

export const exportAsPDF = async (
  expenses: Expense[],
  filename: string,
  appliedFilters: { dateFrom: string; dateTo: string; categories: string[] }
): Promise<void> => {
  // Dynamic imports keep the bundle lean — jsPDF is only loaded when needed
  const { jsPDF } = await import('jspdf');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoTable = ((await import('jspdf-autotable')) as any).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const generatedAt = format(new Date(), 'MMM d, yyyy · h:mm a');

  // ── Header band ─────────────────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SpendWise', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Expense Report', 14, 21);

  doc.setFontSize(8);
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.text(`Generated: ${generatedAt}`, pageW - 14, 14, { align: 'right' });
  doc.text(`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`, pageW - 14, 21, {
    align: 'right',
  });

  // ── Summary section ──────────────────────────────────────────────────────────
  let y = 42;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const summaryItems: Array<[string, string]> = [
    ['Total Amount', `$${total.toFixed(2)}`],
    ['Records', `${expenses.length}`],
  ];

  if (appliedFilters.dateFrom || appliedFilters.dateTo) {
    const range = [appliedFilters.dateFrom, appliedFilters.dateTo].filter(Boolean).join(' → ');
    summaryItems.push(['Date Range', range]);
  }

  if (appliedFilters.categories.length < 7) {
    summaryItems.push(['Categories', appliedFilters.categories.join(', ')]);
  }

  summaryItems.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? 14 : 90;
    const row = y + Math.floor(i / 2) * 7;
    doc.setTextColor(107, 114, 128);
    doc.text(label + ':', col, row);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(value, col + 32, row);
    doc.setFont('helvetica', 'normal');
  });

  y += Math.ceil(summaryItems.length / 2) * 7 + 6;

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // ── Expense table ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text('TRANSACTIONS', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Category', 'Amount', 'Description']],
    body: expenses.map((e) => [
      e.date,
      e.category,
      `$${e.amount.toFixed(2)}`,
      e.description,
    ]),
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [31, 41, 55],
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 34 },
      2: { cellWidth: 24, halign: 'right' as const },
      3: { cellWidth: 'auto' as const },
    },
    // Page number footer on each page
    didDrawPage: (data: { pageNumber: number }) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
};

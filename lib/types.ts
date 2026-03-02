export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Health'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface ExpenseFilters {
  search: string;
  category: Category | 'All';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface CategoryStats {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  label: string; // e.g., "Jan 2025"
  total: number;
  count: number;
}

export interface DashboardStats {
  totalAllTime: number;
  totalThisMonth: number;
  totalLastMonth: number;
  monthlyChange: number;
  categoryStats: CategoryStats[];
  monthlyStats: MonthlyStats[];
  recentExpenses: Expense[];
  expenseCount: number;
  averageExpense: number;
}

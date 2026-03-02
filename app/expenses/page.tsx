import ExpenseList from '@/components/expenses/ExpenseList';

export default function ExpensesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage, filter, and export all your expenses
        </p>
      </div>
      <ExpenseList />
    </div>
  );
}

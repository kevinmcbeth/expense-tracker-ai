'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? 'SpendWise';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-700 text-sm font-semibold">U</span>
        </div>
      </div>
    </header>
  );
}

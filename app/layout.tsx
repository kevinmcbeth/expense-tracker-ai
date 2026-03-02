import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendWise — Expense Tracker',
  description: 'Track your personal expenses, visualize spending patterns, and manage your finances.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <AppShell>{children}</AppShell>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}

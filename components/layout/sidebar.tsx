'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, FileText, Settings, Tag, Wallet, Target, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/transactions', label: 'Transactions', icon: Wallet },
    { href: '/dashboard/budgets', label: 'Budgets', icon: Target },
    { href: '/dashboard/goals', label: 'Goals', icon: TrendingUp },
    { href: '/dashboard/categories', label: 'Categories', icon: Tag },
    { href: '/dashboard/reports', label: 'Reports', icon: FileText },
    { href: '/dashboard/ai-reports', label: 'AI Analysis', icon: Sparkles },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-background">
      <div className="flex items-center gap-2 h-16 px-6 border-b">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg">FinanceTracker</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t p-4">
        <Link
          href="/dashboard/add"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Link>
      </div>
    </aside>
  );
}

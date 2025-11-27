import { ReactNode } from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">FinanceTracker</span>
        </Link>
      </div>
      {children}
    </div>
  );
}


'use client';

import { SessionProvider } from 'next-auth/react';
import { RouteLoader } from '@/components/route-loader';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RouteLoader />
      {children}
    </SessionProvider>
  );
}

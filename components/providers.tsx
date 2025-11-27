'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { RouteLoader } from '@/components/route-loader';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <RouteLoader />
      {children}
    </ClerkProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/ui/loader';

let loadingTimeout: NodeJS.Timeout | null = null;

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Show loader immediately
    setIsLoading(true);

    // Hide loader after navigation completes
    loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}


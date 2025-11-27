'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader } from '@/components/ui/loader';

export function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loader when pathname changes
    setIsLoading(true);
    
    // Hide loader after a short delay to allow page to render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}


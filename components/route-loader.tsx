'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/ui/loader';

function RouteLoaderContent() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathnameRef = useRef(pathname);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Show loader immediately
      setLoading(true);
      prevPathnameRef.current = pathname;

      // Hide loader after navigation completes
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, 300);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pathname, searchParams]);

  // Also listen for link clicks to show loader immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = link.getAttribute('href');
        // Only show loader for internal links
        if (href && (href.startsWith('/') || href.startsWith(window.location.pathname))) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" text="Loading page..." />
    </div>
  );
}

export function RouteLoader() {
  return (
    <Suspense fallback={null}>
      <RouteLoaderContent />
    </Suspense>
  );
}


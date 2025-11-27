'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/ui/loader';

interface LinkWithLoaderProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LinkWithLoader({ href, children, className, onClick }: LinkWithLoaderProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    
    if (onClick) {
      onClick();
    }

    router.push(href);
    
    // Hide loader after navigation
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader size="lg" text="Loading..." />
        </div>
      )}
      <Link href={href} onClick={handleClick} className={className}>
        {children}
      </Link>
    </>
  );
}


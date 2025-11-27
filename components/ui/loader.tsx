import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loader({ className, size = 'md', text }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin h-4 w-4', className)} />;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader text={text} />
    </div>
  );
}


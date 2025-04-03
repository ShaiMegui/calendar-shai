import { ComponentProps, forwardRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SidebarTrigger = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg p-2 hover:bg-gray-100',
          className
        )}
        {...props}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );
  }
);
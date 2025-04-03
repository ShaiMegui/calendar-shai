import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const SidebarInset = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex-1 overflow-y-auto bg-gray-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
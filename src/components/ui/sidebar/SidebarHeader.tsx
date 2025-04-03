import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const SidebarHeader = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
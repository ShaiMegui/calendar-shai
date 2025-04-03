import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const SidebarContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const SidebarMenu = forwardRef<HTMLUListElement, ComponentProps<'ul'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn('space-y-1', className)}
        {...props}
      >
        {children}
      </ul>
    );
  }
);
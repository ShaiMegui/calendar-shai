import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const SidebarMenuItem = forwardRef<HTMLLIElement, ComponentProps<'li'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn('', className)}
        {...props}
      >
        {children}
      </li>
    );
  }
);
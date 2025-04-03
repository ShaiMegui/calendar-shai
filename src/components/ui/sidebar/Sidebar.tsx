import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends ComponentProps<'aside'> {
  collapsible?: 'icon' | 'responsive' | false;
  variant?: 'sidebar' | 'dialog';
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-screen flex-col overflow-y-auto border-r border-gray-200 bg-white',
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
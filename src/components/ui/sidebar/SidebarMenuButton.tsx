import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SidebarMenuButtonProps extends ComponentProps<'button'> {
  isActive?: boolean;
  asChild?: boolean;
}

export const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, children, isActive, asChild, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'flex w-full items-center rounded-lg px-3 py-2 hover:bg-gray-100',
          isActive && 'bg-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
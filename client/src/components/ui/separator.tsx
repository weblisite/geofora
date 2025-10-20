/**
 * Separator Component
 * Visual separator component
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = 'horizontal', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          className
        )}
        role="separator"
        aria-orientation={orientation}
      />
    );
  }
);

Separator.displayName = 'Separator';
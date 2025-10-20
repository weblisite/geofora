/**
 * Accessible Button Component
 * Enhanced button with accessibility features
 */

import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAccessibility } from './AccessibilityProvider';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  screenReaderText?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaLabel?: string;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    screenReaderText,
    ariaDescribedBy,
    ariaExpanded,
    ariaControls,
    ariaLabel,
    loading = false,
    loadingText = 'Loading...',
    className,
    disabled,
    ...props
  }, ref) => {
    const { announceToScreenReader, isKeyboardUser } = useAccessibility();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (screenReaderText) {
        announceToScreenReader(screenReaderText);
      }
      props.onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (screenReaderText) {
          announceToScreenReader(screenReaderText);
        }
        props.onKeyDown?.(e);
      }
    };

    return (
      <>
        <Button
          ref={ref}
          className={cn(
            isKeyboardUser && 'keyboard-nav',
            className
          )}
          disabled={disabled || loading}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-expanded={ariaExpanded}
          aria-controls={ariaControls}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              {loadingText}
            </>
          ) : (
            children
          )}
        </Button>
        {screenReaderText && (
          <span className="sr-only" aria-live="polite">
            {screenReaderText}
          </span>
        )}
      </>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

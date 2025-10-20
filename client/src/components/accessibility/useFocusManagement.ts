/**
 * Focus Management Hook
 * Provides utilities for managing focus in accessible applications
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface FocusTrapOptions {
  initialFocus?: boolean;
  returnFocus?: boolean;
  preventScroll?: boolean;
}

export function useFocusTrap(
  isActive: boolean,
  options: FocusTrapOptions = {}
) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const { isKeyboardUser } = useAccessibility();

  const {
    initialFocus = true,
    returnFocus = true,
    preventScroll = false,
  } = options;

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      // Allow escape to close modal/dialog
      const escapeEvent = new CustomEvent('escape-key');
      containerRef.current.dispatchEvent(escapeEvent);
    }
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    if (returnFocus) {
      previousActiveElement.current = document.activeElement;
    }

    // Set up focus trap
    document.addEventListener('keydown', trapFocus);

    // Focus the first focusable element
    if (initialFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', trapFocus);

      // Return focus to the previously focused element
      if (returnFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [isActive, trapFocus, initialFocus, returnFocus, getFocusableElements]);

  return containerRef;
}

export function useFocusManagement() {
  const { setFocus, announceToScreenReader } = useAccessibility();

  const focusElement = useCallback((elementId: string) => {
    setFocus(elementId);
  }, [setFocus]);

  const announceChange = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, [announceToScreenReader]);

  const createFocusableRef = useCallback((elementId: string) => {
    return (node: HTMLElement | null) => {
      if (node) {
        node.id = elementId;
        node.setAttribute('tabindex', '-1');
      }
    };
  }, []);

  return {
    focusElement,
    announceChange,
    createFocusableRef,
  };
}

export function useKeyboardNavigation() {
  const { isKeyboardUser } = useAccessibility();

  const handleKeyDown = useCallback((e: KeyboardEvent, handlers: Record<string, () => void>) => {
    if (!isKeyboardUser) return;

    const handler = handlers[e.key];
    if (handler) {
      e.preventDefault();
      handler();
    }
  }, [isKeyboardUser]);

  return {
    handleKeyDown,
    isKeyboardUser,
  };
}

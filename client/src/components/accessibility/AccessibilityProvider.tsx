/**
 * Accessibility Provider Component
 * Provides comprehensive accessibility features including:
 * - Screen reader support
 * - Keyboard navigation
 * - High contrast mode
 * - Focus management
 * - ARIA labels and roles
 * - Skip links
 * - Reduced motion preferences
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: (key: keyof AccessibilityPreferences, value: any) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocus: (elementId: string) => void;
  isKeyboardUser: boolean;
  skipToContent: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    screenReader: false,
    keyboardNavigation: false,
    focusVisible: false,
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    // Detect system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPreferences(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
    }));

    // Detect high contrast mode
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setPreferences(prev => ({
      ...prev,
      highContrast: highContrastQuery.matches,
    }));
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${preferences.fontSize}`);

    // Focus visible
    if (preferences.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [preferences]);

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const updatePreference = (key: keyof AccessibilityPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const setFocus = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const value: AccessibilityContextType = {
    preferences,
    updatePreference,
    announceToScreenReader,
    setFocus,
    isKeyboardUser,
    skipToContent,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AccessibilityStyles />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Accessibility Styles Component
function AccessibilityStyles() {
  return (
    <style jsx global>{`
      /* Screen reader only content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Skip links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
        border-radius: 4px;
      }

      .skip-link:focus {
        top: 6px;
      }

      /* High contrast mode */
      .high-contrast {
        --bg-primary: #000000;
        --bg-secondary: #1a1a1a;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --border-primary: #ffffff;
        --accent-primary: #ffff00;
      }

      .high-contrast button {
        border: 2px solid var(--border-primary);
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      .high-contrast button:hover,
      .high-contrast button:focus {
        background: var(--accent-primary);
        color: var(--bg-primary);
      }

      /* Reduced motion */
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      /* Font size adjustments */
      .font-small {
        font-size: 14px;
      }

      .font-medium {
        font-size: 16px;
      }

      .font-large {
        font-size: 18px;
      }

      /* Focus visible */
      .focus-visible *:focus {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
      }

      /* Keyboard navigation */
      .keyboard-nav button:focus,
      .keyboard-nav a:focus,
      .keyboard-nav input:focus,
      .keyboard-nav textarea:focus,
      .keyboard-nav select:focus {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
      }

      /* Focus management */
      .focus-trap {
        position: relative;
      }

      .focus-trap::before,
      .focus-trap::after {
        content: '';
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }

      /* ARIA live regions */
      [aria-live] {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      /* Error states */
      .error {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      .error:focus {
        outline-color: #dc2626;
      }

      /* Success states */
      .success {
        border-color: #16a34a;
        box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
      }

      .success:focus {
        outline-color: #16a34a;
      }
    `}</style>
  );
}

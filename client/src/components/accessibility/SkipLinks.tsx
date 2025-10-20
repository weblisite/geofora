/**
 * Skip Links Component
 * Provides skip navigation links for keyboard users
 */

import React from 'react';
import { Link } from 'wouter';
import { useAccessibility } from './AccessibilityProvider';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  const { setFocus } = useAccessibility();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    setFocus(targetId);
  };

  return (
    <Link href={href}>
      <a
        className={`skip-link ${className}`}
        onClick={handleClick}
        onFocus={(e) => {
          e.currentTarget.style.top = '6px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-40px';
        }}
      >
        {children}
      </a>
    </Link>
  );
}

export function SkipLinks() {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      <SkipLink href="#search">Skip to search</SkipLink>
      <SkipLink href="#footer">Skip to footer</SkipLink>
    </div>
  );
}

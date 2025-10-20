import React, { createContext, useContext, useEffect, useState } from 'react';

// Mobile Optimization Context
interface MobileOptimizationContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const MobileOptimizationContext = createContext<MobileOptimizationContextType | undefined>(undefined);

export function MobileOptimizationProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [touchDevice, setTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      const desktop = width >= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsDesktop(desktop);
      
      // Determine screen size
      if (mobile) {
        setScreenSize('mobile');
      } else if (tablet) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      // Determine orientation
      setOrientation(height > width ? 'portrait' : 'landscape');
      
      // Detect touch device
      setTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      // Detect reduced motion preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      
      // Detect dark mode preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(darkModeQuery.matches);
    };

    // Initial check
    updateScreenInfo();

    // Listen for changes
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    // Listen for preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    darkModeQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
      motionQuery.removeEventListener('change', handleMotionChange);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  // Apply mobile optimizations
  useEffect(() => {
    // Add mobile-specific classes to body
    if (isMobile) {
      document.body.classList.add('mobile-device');
    } else {
      document.body.classList.remove('mobile-device');
    }

    if (touchDevice) {
      document.body.classList.add('touch-device');
    } else {
      document.body.classList.remove('touch-device');
    }

    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isMobile, touchDevice, reducedMotion, darkMode]);

  const value: MobileOptimizationContextType = {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    orientation,
    touchDevice,
    reducedMotion,
    darkMode,
    setDarkMode
  };

  return (
    <MobileOptimizationContext.Provider value={value}>
      {children}
    </MobileOptimizationContext.Provider>
  );
}

export function useMobileOptimization() {
  const context = useContext(MobileOptimizationContext);
  if (context === undefined) {
    throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider');
  }
  return context;
}

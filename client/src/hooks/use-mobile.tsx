import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the current viewport is mobile sized
 * @param breakpoint The breakpoint in pixels below which the device is considered mobile (default: 768)
 * @returns A boolean indicating if the current viewport is mobile sized
 */
export function useMobile(breakpoint: number = 768): boolean {
  // Initialize with the current window width check
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    // Skip if window is not defined (SSR)
    if (typeof window === "undefined") return;
    
    // Handler to update state on window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Set the initial value
    handleResize();
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);
  
  return isMobile;
}

export default useMobile;
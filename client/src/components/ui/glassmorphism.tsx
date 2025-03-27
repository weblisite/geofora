import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassmorphismProps {
  children: ReactNode;
  className?: string;
  border?: boolean | "pulse" | "subtle" | "accent";
  glow?: boolean | "subtle" | "hover" | "pulse";
  interactive?: boolean;
  intensity?: "light" | "medium" | "heavy";
  variant?: "default" | "card" | "panel" | "nav";
}

export function Glassmorphism({
  children,
  className,
  border = false,
  glow = false,
  interactive = false,
  intensity = "medium",
  variant = "default",
}: GlassmorphismProps) {
  // Base classes
  const baseClasses = cn(
    "glass rounded-lg transition-all duration-300",
    // Intensity variations
    intensity === "light" && "bg-[rgba(30,31,53,0.4)] backdrop-blur-sm",
    intensity === "medium" && "bg-[rgba(30,31,53,0.65)] backdrop-blur-md",
    intensity === "heavy" && "bg-[rgba(30,31,53,0.8)] backdrop-blur-lg",
    
    // Variant specific styling
    variant === "card" && "p-4",
    variant === "panel" && "p-6",
    variant === "nav" && "px-4 py-2",
    
    // Interactive states
    interactive && "hover:bg-[rgba(35,36,60,0.8)] active:bg-[rgba(40,42,70,0.9)] cursor-pointer hover:-translate-y-1 active:translate-y-0",
    
    // Border variations
    border === true && "border-gradient",
    border === "pulse" && "border-gradient-pulse",
    border === "subtle" && "border-gradient-subtle",
    border === "accent" && "border-gradient-accent",
    
    // Glow variations
    glow === true && "shadow-glow",
    glow === "subtle" && "shadow-glow-subtle",
    glow === "hover" && "glow-on-hover",
    glow === "pulse" && "shadow-glow-pulse",
    
    className
  );

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent" | "subtle";
}

export function GradientText({
  children,
  className,
  variant = "default",
}: GradientTextProps) {
  const textClasses = cn(
    variant === "default" && "gradient-text",
    variant === "accent" && "gradient-text-accent",
    variant === "subtle" && "gradient-text-subtle",
    className
  );

  return <span className={textClasses}>{children}</span>;
}
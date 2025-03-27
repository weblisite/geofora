import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GlassmorphismProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  border?: boolean;
  glow?: boolean;
}

export const Glassmorphism = forwardRef<HTMLDivElement, GlassmorphismProps>(
  ({ className, children, border = false, glow = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          "glass rounded-xl",
          border && "gradient-border",
          glow && "shadow-glow",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Glassmorphism.displayName = "Glassmorphism";

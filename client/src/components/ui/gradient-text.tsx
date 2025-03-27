import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children?: React.ReactNode;
}

export const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        className={cn("gradient-text", className)}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GradientText.displayName = "GradientText";

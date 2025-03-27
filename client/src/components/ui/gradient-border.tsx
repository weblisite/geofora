import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GradientBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const GradientBorder = forwardRef<HTMLDivElement, GradientBorderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("gradient-border rounded-xl", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GradientBorder.displayName = "GradientBorder";

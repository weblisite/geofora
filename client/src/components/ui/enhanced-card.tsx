import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  className?: string;
  variant?: "default" | "highlight" | "accent" | "subtle";
  interactive?: boolean;
  borderStyle?: boolean | "pulse" | "subtle" | "accent";
  glowEffect?: boolean | "subtle" | "hover" | "pulse";
  intensity?: "light" | "medium" | "heavy";
}

export function EnhancedCard({
  title,
  description,
  children,
  footer,
  loading = false,
  className,
  variant = "default",
  interactive = false,
  borderStyle = false,
  glowEffect = false,
  intensity = "medium",
}: EnhancedCardProps) {
  // Set styling based on variant
  const getBorder = () => {
    if (borderStyle !== false) return borderStyle;
    
    if (variant === "highlight") return "pulse";
    if (variant === "accent") return "accent";
    if (variant === "subtle") return "subtle";
    return true;
  };
  
  const getGlow = () => {
    if (glowEffect !== false) return glowEffect;
    
    if (variant === "highlight") return "pulse";
    if (variant === "accent") return true;
    if (variant === "subtle") return "subtle";
    return false;
  };
  
  const getIntensity = () => {
    if (variant === "subtle") return "light";
    return intensity;
  };

  return (
    <Glassmorphism
      className={cn("overflow-hidden", className)}
      variant="card"
      border={getBorder()}
      glow={getGlow()}
      interactive={interactive}
      intensity={getIntensity()}
    >
      <CardHeader className="pb-2">
        {loading ? (
          <>
            <Skeleton className="h-6 w-[150px] mb-2" />
            {description && <Skeleton className="h-4 w-[250px]" />}
          </>
        ) : (
          <>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Glassmorphism>
  );
}

interface EnhancedCardGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

export function EnhancedCardGrid({
  children,
  className,
  columns = 3,
  gap = "md",
}: EnhancedCardGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };
  
  return (
    <div className={cn(
      "grid",
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Helper component for card actions
export function EnhancedCardAction({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

// Demo component
export function EnhancedCardDemo() {
  return (
    <EnhancedCardGrid>
      <EnhancedCard
        title="Default Card"
        description="A standard card with default styling"
        footer={<EnhancedCardAction><Button size="sm">Action</Button></EnhancedCardAction>}
      >
        <p className="text-sm text-muted-foreground">
          This card demonstrates the default styling with neutral border and subtle background.
        </p>
      </EnhancedCard>
      
      <EnhancedCard
        title="Highlight Card"
        description="With pulsing border and glow effects"
        variant="highlight"
        footer={<EnhancedCardAction><Button size="sm" variant="secondary">View Details</Button></EnhancedCardAction>}
      >
        <p className="text-sm text-muted-foreground">
          This card uses the highlight variant which includes animated pulsing border and glow effects to draw attention.
        </p>
      </EnhancedCard>
      
      <EnhancedCard
        title="Accent Card"
        description="With accent-colored borders"
        variant="accent"
        footer={<EnhancedCardAction><Button size="sm" variant="outline">Dismiss</Button></EnhancedCardAction>}
      >
        <p className="text-sm text-muted-foreground">
          This card uses accent colors for borders and subtle glow to indicate importance without animation.
        </p>
      </EnhancedCard>
      
      <EnhancedCard
        title="Interactive Card"
        description="Responds to hover and click events"
        interactive={true}
        borderStyle="subtle"
        footer={<EnhancedCardAction><Button size="sm" variant="ghost">More Info</Button></EnhancedCardAction>}
      >
        <p className="text-sm text-muted-foreground">
          This card is interactive, responding to hover and click events with transformation and subtle effects.
        </p>
      </EnhancedCard>
      
      <EnhancedCard
        title="Loading State"
        description="Card with loading indicators"
        loading={true}
      />
      
      <EnhancedCard
        title="Subtle Card"
        description="Light intensity with subtle effects"
        variant="subtle"
        footer={<EnhancedCardAction><Button size="sm" variant="link">Learn More</Button></EnhancedCardAction>}
      >
        <p className="text-sm text-muted-foreground">
          This card uses a lighter background intensity and subtle styling for less prominent content.
        </p>
      </EnhancedCard>
    </EnhancedCardGrid>
  );
}
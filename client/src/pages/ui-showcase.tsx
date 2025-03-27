import { Glassmorphism, GradientText } from "@/components/ui/glassmorphism";
import { EnhancedCard, EnhancedCardAction, EnhancedCardDemo, EnhancedCardGrid } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UIShowcasePage() {
  return (
    <div className="container mx-auto py-10 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          <GradientText>UI Component Showcase</GradientText>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A demonstration of the custom UI components with glassmorphism, gradient effects, and enhanced visual styling
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Glassmorphism Components</h2>
          <Button variant="outline">View Source</Button>
        </div>
        <p className="text-muted-foreground">
          The Glassmorphism component provides a frosted glass effect with customizable borders, glows, and intensity levels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Glassmorphism className="p-6">
            <h3 className="text-lg font-medium mb-2">Default Glass Panel</h3>
            <p className="text-sm text-muted-foreground">
              Basic glassmorphism effect with medium intensity and no special borders or effects.
            </p>
          </Glassmorphism>

          <Glassmorphism className="p-6" border={true} glow="subtle">
            <h3 className="text-lg font-medium mb-2">Gradient Border</h3>
            <p className="text-sm text-muted-foreground">
              Glassmorphism with a gradient border and subtle glow effect.
            </p>
          </Glassmorphism>

          <Glassmorphism className="p-6" border="pulse" glow="pulse">
            <h3 className="text-lg font-medium mb-2">Animated Effects</h3>
            <p className="text-sm text-muted-foreground">
              Glassmorphism with pulsing border and glow animations.
            </p>
          </Glassmorphism>

          <Glassmorphism className="p-6" variant="panel" intensity="light">
            <h3 className="text-lg font-medium mb-2">Light Intensity</h3>
            <p className="text-sm text-muted-foreground">
              Panel variant with lighter intensity for a more subtle effect.
            </p>
          </Glassmorphism>

          <Glassmorphism className="p-6" variant="panel" intensity="heavy" border="accent">
            <h3 className="text-lg font-medium mb-2">Heavy Intensity</h3>
            <p className="text-sm text-muted-foreground">
              Panel variant with heavier intensity and accent-colored border.
            </p>
          </Glassmorphism>

          <Glassmorphism className="p-6" interactive={true} glow="hover">
            <h3 className="text-lg font-medium mb-2">Interactive Panel</h3>
            <p className="text-sm text-muted-foreground">
              Interactive glassmorphism that responds to hover and click events.
            </p>
          </Glassmorphism>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gradient Text</h2>
          <Button variant="outline">View Source</Button>
        </div>
        <p className="text-muted-foreground">
          The GradientText component applies beautiful gradient effects to text elements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle><GradientText>Default Gradient</GradientText></CardTitle>
              <CardDescription>Blue to purple gradient</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The default gradient uses a blue to purple color transition for emphasis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><GradientText variant="accent">Accent Gradient</GradientText></CardTitle>
              <CardDescription>Purple to accent gradient</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The accent gradient uses the accent color for a distinct look.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><GradientText variant="subtle">Subtle Gradient</GradientText></CardTitle>
              <CardDescription>Lighter, more subtle gradient</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The subtle gradient uses lighter colors for a more restrained effect.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Enhanced Cards</h2>
          <Button variant="outline">View Source</Button>
        </div>
        <p className="text-muted-foreground">
          Enhanced cards combine glassmorphism with structured content layout and predefined variants.
        </p>

        <EnhancedCardDemo />
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Border and Glow Effects</h2>
          <Button variant="outline">View Source</Button>
        </div>
        <p className="text-muted-foreground">
          Various border and glow effects that can be applied to components.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="border-gradient rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Gradient Border</h3>
            <p className="text-sm text-muted-foreground">
              A gradient border that transitions between multiple colors.
            </p>
          </div>

          <div className="border-gradient-pulse rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Pulsing Border</h3>
            <p className="text-sm text-muted-foreground">
              A gradient border with a pulsing animation effect.
            </p>
          </div>

          <div className="border-gradient-subtle rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Subtle Border</h3>
            <p className="text-sm text-muted-foreground">
              A more subtle, transparent gradient border.
            </p>
          </div>

          <div className="border-gradient-accent rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Accent Border</h3>
            <p className="text-sm text-muted-foreground">
              A border using the accent color.
            </p>
          </div>

          <div className="shadow-glow rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Glow Effect</h3>
            <p className="text-sm text-muted-foreground">
              A box shadow glow effect that adds depth.
            </p>
          </div>

          <div className="shadow-glow-subtle rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Subtle Glow</h3>
            <p className="text-sm text-muted-foreground">
              A more subtle glow effect with less intensity.
            </p>
          </div>

          <div className="shadow-glow-pulse rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Pulsing Glow</h3>
            <p className="text-sm text-muted-foreground">
              A glow effect with a pulsing animation.
            </p>
          </div>

          <div className="glow-on-hover hover-lift rounded-lg p-6 bg-background">
            <h3 className="text-lg font-medium mb-2">Hover Glow & Lift</h3>
            <p className="text-sm text-muted-foreground">
              Combined hover effects with glow and slight elevation.
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center mt-20 py-10">
        <p className="text-muted-foreground">
          <GradientText variant="subtle">
            These components are available throughout the application for consistent design.
          </GradientText>
        </p>
      </footer>
    </div>
  );
}
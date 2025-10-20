/**
 * Accessibility Controls Component
 * Provides UI controls for accessibility preferences
 */

import React from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Type, 
  MousePointer, 
  Keyboard,
  SkipForward,
  Contrast,
  Move
} from 'lucide-react';

export function AccessibilityControls() {
  const { preferences, updatePreference, announceToScreenReader, skipToContent } = useAccessibility();

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    updatePreference(key, value);
    announceToScreenReader(`${key} setting updated`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your experience to make GEOFORA more accessible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="high-contrast" className="flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                High Contrast Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => handlePreferenceChange('highContrast', checked)}
              aria-describedby="high-contrast-description"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="font-size" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </Label>
              <p className="text-sm text-muted-foreground">
                Adjust text size for better readability
              </p>
            </div>
            <Select
              value={preferences.fontSize}
              onValueChange={(value) => handlePreferenceChange('fontSize', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Motion Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Move className="h-4 w-4" />
            Motion Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reduced-motion" className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                Reduced Motion
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimizes animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => handlePreferenceChange('reducedMotion', checked)}
              aria-describedby="reduced-motion-description"
            />
          </div>
        </div>

        <Separator />

        {/* Navigation Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Navigation Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="keyboard-navigation" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Enhanced Keyboard Navigation
              </Label>
              <p className="text-sm text-muted-foreground">
                Improves keyboard navigation experience
              </p>
            </div>
            <Switch
              id="keyboard-navigation"
              checked={preferences.keyboardNavigation}
              onCheckedChange={(checked) => handlePreferenceChange('keyboardNavigation', checked)}
              aria-describedby="keyboard-navigation-description"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="focus-visible" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Enhanced Focus Indicators
              </Label>
              <p className="text-sm text-muted-foreground">
                Makes focus indicators more visible
              </p>
            </div>
            <Switch
              id="focus-visible"
              checked={preferences.focusVisible}
              onCheckedChange={(checked) => handlePreferenceChange('focusVisible', checked)}
              aria-describedby="focus-visible-description"
            />
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SkipForward className="h-4 w-4" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={skipToContent}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Skip to main content"
            >
              <SkipForward className="h-4 w-4" />
              Skip to Content
            </Button>
            
            <Button
              onClick={() => {
                announceToScreenReader('Accessibility settings saved');
              }}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Announce current settings"
            >
              <Volume2 className="h-4 w-4" />
              Test Screen Reader
            </Button>
          </div>
        </div>

        {/* Screen Reader Support */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Screen Reader Support
          </h3>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              GEOFORA is optimized for screen readers and includes:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Semantic HTML structure</li>
              <li>ARIA labels and descriptions</li>
              <li>Live regions for dynamic content</li>
              <li>Skip links for navigation</li>
              <li>Keyboard shortcuts</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Accessibility Dashboard Component
 * Provides comprehensive accessibility management interface
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Keyboard, 
  Volume2, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Settings,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react';
import { AccessibilityControls } from './AccessibilityControls';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  element: string;
  severity: 'high' | 'medium' | 'low';
  fix?: string;
}

interface AccessibilityStats {
  totalIssues: number;
  errors: number;
  warnings: number;
  info: number;
  score: number;
  lastChecked: Date;
}

export function AccessibilityDashboard() {
  const { preferences } = useAccessibility();
  const [stats, setStats] = useState<AccessibilityStats>({
    totalIssues: 12,
    errors: 3,
    warnings: 5,
    info: 4,
    score: 85,
    lastChecked: new Date(),
  });

  const [issues] = useState<AccessibilityIssue[]>([
    {
      id: '1',
      type: 'error',
      message: 'Missing alt text on image',
      element: 'img[src="/logo.png"]',
      severity: 'high',
      fix: 'Add descriptive alt text to the image',
    },
    {
      id: '2',
      type: 'error',
      message: 'Form input missing label',
      element: 'input[name="email"]',
      severity: 'high',
      fix: 'Associate the input with a label element',
    },
    {
      id: '3',
      type: 'error',
      message: 'Button missing accessible name',
      element: 'button.submit-btn',
      severity: 'high',
      fix: 'Add aria-label or visible text to the button',
    },
    {
      id: '4',
      type: 'warning',
      message: 'Low color contrast ratio',
      element: '.text-muted',
      severity: 'medium',
      fix: 'Increase color contrast to meet WCAG guidelines',
    },
    {
      id: '5',
      type: 'warning',
      message: 'Missing focus indicator',
      element: 'a.nav-link',
      severity: 'medium',
      fix: 'Add visible focus styles for keyboard navigation',
    },
    {
      id: '6',
      type: 'warning',
      message: 'Heading structure skipped',
      element: 'h3',
      severity: 'medium',
      fix: 'Use proper heading hierarchy (h1 -> h2 -> h3)',
    },
    {
      id: '7',
      type: 'warning',
      message: 'Link text not descriptive',
      element: 'a[href="/page"]',
      severity: 'medium',
      fix: 'Use descriptive link text instead of "click here"',
    },
    {
      id: '8',
      type: 'warning',
      message: 'Missing language attribute',
      element: 'html',
      severity: 'medium',
      fix: 'Add lang attribute to the html element',
    },
    {
      id: '9',
      type: 'info',
      message: 'Consider adding skip links',
      element: 'body',
      severity: 'low',
      fix: 'Add skip navigation links for keyboard users',
    },
    {
      id: '10',
      type: 'info',
      message: 'Consider adding ARIA landmarks',
      element: 'main',
      severity: 'low',
      fix: 'Add ARIA landmark roles to page sections',
    },
    {
      id: '11',
      type: 'info',
      message: 'Consider adding live regions',
      element: '.status-message',
      severity: 'low',
      fix: 'Add aria-live regions for dynamic content',
    },
    {
      id: '12',
      type: 'info',
      message: 'Consider adding keyboard shortcuts',
      element: 'body',
      severity: 'low',
      fix: 'Add keyboard shortcuts for common actions',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const runAccessibilityCheck = () => {
    // Simulate accessibility check
    setStats(prev => ({
      ...prev,
      lastChecked: new Date(),
      score: Math.min(100, prev.score + 5),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accessibility Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and improve your forum's accessibility compliance
          </p>
        </div>
        <Button onClick={runAccessibilityCheck} className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Run Check
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.score}%</div>
            <p className="text-xs text-muted-foreground">
              Last checked: {stats.lastChecked.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.errors} errors, {stats.warnings} warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">
              High priority issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground">
              Medium priority issues
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Issues</CardTitle>
              <CardDescription>
                Issues found during the last accessibility check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start space-x-3 p-4 border rounded-lg"
                  >
                    {getTypeIcon(issue.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{issue.message}</h4>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Element: <code className="bg-muted px-1 rounded">{issue.element}</code>
                      </p>
                      {issue.fix && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Suggested Fix:</p>
                          <p className="text-sm text-blue-800">{issue.fix}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <AccessibilityControls />
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Report</CardTitle>
              <CardDescription>
                Comprehensive accessibility compliance report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">WCAG 2.1 Compliance</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Level A</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pass
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Level AA</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Partial
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Level AAA</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Fail
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Current Settings</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>High Contrast</span>
                      <span className={preferences.highContrast ? 'text-green-600' : 'text-gray-500'}>
                        {preferences.highContrast ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reduced Motion</span>
                      <span className={preferences.reducedMotion ? 'text-green-600' : 'text-gray-500'}>
                        {preferences.reducedMotion ? 'On' : 'Off'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Font Size</span>
                      <span className="capitalize">{preferences.fontSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Keyboard Navigation</span>
                      <span className={preferences.keyboardNavigation ? 'text-green-600' : 'text-gray-500'}>
                        {preferences.keyboardNavigation ? 'Enhanced' : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Analytics Reporting Component
 * Comprehensive reporting with export capabilities and scheduled reports
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Download, Calendar, Mail, FileText, BarChart3, PieChart, 
  LineChart, TrendingUp, Users, Eye, Target, Clock,
  Plus, Edit, Trash2, Send, Schedule
} from 'lucide-react';
import { useClerkAuth } from '@/hooks/use-clerk-auth';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  isActive: boolean;
  lastSent?: Date;
  nextScheduled?: Date;
}

interface ReportData {
  period: string;
  metrics: {
    visitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    conversionRate: number;
    avgSessionDuration: number;
  };
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
  }>;
  topSources: Array<{
    source: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    visitors: number;
    percentage: number;
  }>;
}

export default function AnalyticsReporting() {
  const { user } = useClerkAuth();
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [newReport, setNewReport] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    metrics: [],
    frequency: 'weekly',
    recipients: [],
    isActive: true,
  });

  // Fetch report templates
  const { data: reportTemplates, isLoading: templatesLoading } = useQuery<ReportTemplate[]>({
    queryKey: ['/api/analytics/report-templates'],
    queryFn: async () => [
      {
        id: '1',
        name: 'Weekly Performance Report',
        description: 'Comprehensive weekly analytics overview',
        metrics: ['visitors', 'pageViews', 'conversions', 'bounceRate'],
        frequency: 'weekly',
        recipients: ['admin@example.com', 'marketing@example.com'],
        isActive: true,
        lastSent: new Date(Date.now() - 86400000),
        nextScheduled: new Date(Date.now() + 6 * 86400000),
      },
      {
        id: '2',
        name: 'Monthly Executive Summary',
        description: 'High-level monthly metrics for executives',
        metrics: ['visitors', 'conversionRate', 'revenue'],
        frequency: 'monthly',
        recipients: ['ceo@example.com'],
        isActive: true,
        lastSent: new Date(Date.now() - 7 * 86400000),
        nextScheduled: new Date(Date.now() + 23 * 86400000),
      },
      {
        id: '3',
        name: 'Daily Traffic Monitor',
        description: 'Daily traffic and engagement metrics',
        metrics: ['visitors', 'pageViews', 'sessions'],
        frequency: 'daily',
        recipients: ['analytics@example.com'],
        isActive: false,
        lastSent: new Date(Date.now() - 2 * 86400000),
        nextScheduled: new Date(Date.now() + 86400000),
      },
    ],
  });

  // Fetch report data
  const { data: reportData, isLoading: dataLoading } = useQuery<ReportData>({
    queryKey: [`/api/analytics/report-data/${selectedPeriod}`],
    queryFn: async () => ({
      period: `${selectedPeriod} days`,
      metrics: {
        visitors: 15420,
        pageViews: 45680,
        sessions: 18920,
        bounceRate: 42.5,
        conversionRate: 2.8,
        avgSessionDuration: 3.2,
      },
      topPages: [
        { page: '/forum', views: 12540, uniqueViews: 8540, avgTimeOnPage: 4.2 },
        { page: '/dashboard', views: 8920, uniqueViews: 6230, avgTimeOnPage: 6.8 },
        { page: '/about', views: 4560, uniqueViews: 3890, avgTimeOnPage: 2.1 },
        { page: '/pricing', views: 3240, uniqueViews: 2890, avgTimeOnPage: 3.5 },
      ],
      topSources: [
        { source: 'Google', visitors: 6950, conversions: 156, conversionRate: 2.2 },
        { source: 'Direct', visitors: 4420, conversions: 98, conversionRate: 2.2 },
        { source: 'Facebook', visitors: 1680, conversions: 28, conversionRate: 1.7 },
        { source: 'Twitter', visitors: 1240, conversions: 19, conversionRate: 1.5 },
      ],
      geographicData: [
        { country: 'United States', visitors: 5420, percentage: 35.1 },
        { country: 'United Kingdom', visitors: 3210, percentage: 20.8 },
        { country: 'Canada', visitors: 2890, percentage: 18.7 },
        { country: 'Australia', visitors: 1560, percentage: 10.1 },
      ],
      deviceData: [
        { device: 'Desktop', visitors: 8540, percentage: 55.4 },
        { device: 'Mobile', visitors: 5230, percentage: 33.9 },
        { device: 'Tablet', visitors: 1650, percentage: 10.7 },
      ],
    }),
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const exportReport = (format: 'pdf' | 'csv' | 'json') => {
    // In production, this would generate and download the actual report
    console.log(`Exporting report as ${format}`);
  };

  const createReport = () => {
    // In production, this would create the report template
    console.log('Creating report:', newReport);
    setIsCreatingReport(false);
    setNewReport({
      name: '',
      description: '',
      metrics: [],
      frequency: 'weekly',
      recipients: [],
      isActive: true,
    });
  };

  const sendReport = (templateId: string) => {
    // In production, this would send the report
    console.log('Sending report:', templateId);
  };

  const toggleReportStatus = (templateId: string) => {
    // In production, this would toggle the report status
    console.log('Toggling report status:', templateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Reporting</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and export comprehensive analytics reports
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreatingReport(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        {/* Scheduled Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Report Templates List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Manage your automated report schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportTemplates?.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.frequency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{template.recipients.length} recipients</span>
                          {template.lastSent && (
                            <span>Last sent: {template.lastSent.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() => toggleReportStatus(template.id)}
                        />
                        <Button size="sm" variant="outline" onClick={() => sendReport(template.id)}>
                          <Send className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Report Overview</CardTitle>
                <CardDescription>Summary of your reporting activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Reports</span>
                    <span className="text-lg font-bold">
                      {reportTemplates?.filter(t => t.isActive).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Recipients</span>
                    <span className="text-lg font-bold">
                      {reportTemplates?.reduce((sum, t) => sum + t.recipients.length, 0) || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reports Sent This Month</span>
                    <span className="text-lg font-bold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Scheduled</span>
                    <span className="text-sm text-muted-foreground">
                      {reportTemplates?.[0]?.nextScheduled?.toLocaleDateString() || 'No reports scheduled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Data Tab */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Analytics Data</CardTitle>
                <CardDescription>Download your analytics data in various formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => exportReport('pdf')}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF Report
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('csv')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      CSV Data
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('json')}>
                      <FileText className="h-4 w-4 mr-2" />
                      JSON Data
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Include Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Traffic Data</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Conversion Data</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Source Data</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Geographic Data</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Period Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Current Period Summary</CardTitle>
                <CardDescription>Key metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Visitors</p>
                        <p className="text-2xl font-bold">{formatNumber(reportData?.metrics.visitors || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Page Views</p>
                        <p className="text-2xl font-bold">{formatNumber(reportData?.metrics.pageViews || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{formatPercentage(reportData?.metrics.conversionRate || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Session</p>
                        <p className="text-2xl font-bold">{formatDuration(reportData?.metrics.avgSessionDuration || 0)}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Top Pages</p>
                      <div className="space-y-1">
                        {reportData?.topPages.slice(0, 3).map((page, index) => (
                          <div key={page.page} className="flex justify-between text-sm">
                            <span>{page.page}</span>
                            <span>{formatNumber(page.views)} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Report Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Create and manage report templates</CardDescription>
            </CardHeader>
            <CardContent>
              {isCreatingReport ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={newReport.name}
                      onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea
                      id="report-description"
                      value={newReport.description}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      placeholder="Enter report description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={newReport.frequency}
                      onValueChange={(value) => setNewReport({ ...newReport, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipients (comma-separated emails)</Label>
                    <Input
                      value={newReport.recipients?.join(', ') || ''}
                      onChange={(e) => setNewReport({ 
                        ...newReport, 
                        recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                      })}
                      placeholder="admin@example.com, marketing@example.com"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newReport.isActive}
                      onCheckedChange={(checked) => setNewReport({ ...newReport, isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={createReport}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Report
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingReport(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Schedule className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Custom Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Create custom report templates to automate your analytics reporting
                  </p>
                  <Button onClick={() => setIsCreatingReport(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

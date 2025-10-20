/**
 * Enhanced Analytics Dashboard
 * Comprehensive analytics visualization with advanced charts and reporting
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ComposedChart, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Eye, MousePointerClick, Clock, 
  Globe, Smartphone, Monitor, Download, Calendar, Filter,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Activity, Target, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useClerkAuth } from '@/hooks/use-clerk-auth';

// Data interfaces
interface AnalyticsData {
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  organicTraffic: number;
  directTraffic: number;
  referralTraffic: number;
  socialTraffic: number;
}

interface TimeSeriesData {
  date: string;
  visitors: number;
  pageViews: number;
  sessions: number;
  conversions: number;
  revenue?: number;
}

interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
}

interface SourceData {
  source: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

interface ContentPerformance {
  page: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface ConversionFunnel {
  stage: string;
  visitors: number;
  conversionRate: number;
  dropOffRate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function EnhancedAnalyticsDashboard() {
  const { user } = useClerkAuth();
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics overview data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: [`/api/analytics/overview/${dateRange}`],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        visitors: 15420,
        pageViews: 45680,
        sessions: 18920,
        bounceRate: 42.5,
        avgSessionDuration: 3.2,
        conversionRate: 2.8,
        organicTraffic: 45.2,
        directTraffic: 28.7,
        referralTraffic: 15.3,
        socialTraffic: 10.8,
      };
    },
  });

  // Fetch time series data
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery<TimeSeriesData[]>({
    queryKey: [`/api/analytics/timeseries/${dateRange}`],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 1000) + 400,
          pageViews: Math.floor(Math.random() * 2000) + 800,
          sessions: Math.floor(Math.random() * 1200) + 500,
          conversions: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000,
        });
      }
      return data;
    },
  });

  // Fetch device data
  const { data: deviceData, isLoading: deviceLoading } = useQuery<DeviceData[]>({
    queryKey: [`/api/analytics/devices/${dateRange}`],
    queryFn: async () => [
      { device: 'Desktop', visitors: 8540, percentage: 55.4 },
      { device: 'Mobile', visitors: 5230, percentage: 33.9 },
      { device: 'Tablet', visitors: 1650, percentage: 10.7 },
    ],
  });

  // Fetch geographic data
  const { data: geoData, isLoading: geoLoading } = useQuery<GeographicData[]>({
    queryKey: [`/api/analytics/geography/${dateRange}`],
    queryFn: async () => [
      { country: 'United States', visitors: 5420, percentage: 35.1 },
      { country: 'United Kingdom', visitors: 3210, percentage: 20.8 },
      { country: 'Canada', visitors: 2890, percentage: 18.7 },
      { country: 'Australia', visitors: 1560, percentage: 10.1 },
      { country: 'Germany', visitors: 1340, percentage: 8.7 },
      { country: 'Others', visitors: 1000, percentage: 6.6 },
    ],
  });

  // Fetch source data
  const { data: sourceData, isLoading: sourceLoading } = useQuery<SourceData[]>({
    queryKey: [`/api/analytics/sources/${dateRange}`],
    queryFn: async () => [
      { source: 'Google', visitors: 6950, conversions: 156, conversionRate: 2.2 },
      { source: 'Direct', visitors: 4420, conversions: 98, conversionRate: 2.2 },
      { source: 'Facebook', visitors: 1680, conversions: 28, conversionRate: 1.7 },
      { source: 'Twitter', visitors: 1240, conversions: 19, conversionRate: 1.5 },
      { source: 'LinkedIn', visitors: 890, conversions: 12, conversionRate: 1.3 },
      { source: 'Others', visitors: 1240, conversions: 15, conversionRate: 1.2 },
    ],
  });

  // Fetch content performance data
  const { data: contentData, isLoading: contentLoading } = useQuery<ContentPerformance[]>({
    queryKey: [`/api/analytics/content/${dateRange}`],
    queryFn: async () => [
      { page: '/forum', views: 12540, uniqueViews: 8540, avgTimeOnPage: 4.2, bounceRate: 35.2 },
      { page: '/dashboard', views: 8920, uniqueViews: 6230, avgTimeOnPage: 6.8, bounceRate: 28.5 },
      { page: '/about', views: 4560, uniqueViews: 3890, avgTimeOnPage: 2.1, bounceRate: 45.8 },
      { page: '/pricing', views: 3240, uniqueViews: 2890, avgTimeOnPage: 3.5, bounceRate: 38.2 },
      { page: '/contact', views: 1890, uniqueViews: 1650, avgTimeOnPage: 1.8, bounceRate: 52.1 },
    ],
  });

  // Fetch conversion funnel data
  const { data: funnelData, isLoading: funnelLoading } = useQuery<ConversionFunnel[]>({
    queryKey: [`/api/analytics/funnel/${dateRange}`],
    queryFn: async () => [
      { stage: 'Visitors', visitors: 15420, conversionRate: 100, dropOffRate: 0 },
      { stage: 'Page Views', visitors: 12360, conversionRate: 80.1, dropOffRate: 19.9 },
      { stage: 'Sign Up', visitors: 2472, conversionRate: 16.0, dropOffRate: 64.1 },
      { stage: 'Trial', visitors: 1236, conversionRate: 8.0, dropOffRate: 8.0 },
      { stage: 'Purchase', visitors: 432, conversionRate: 2.8, dropOffRate: 5.2 },
    ],
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

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your forum performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData?.visitors || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+12.5%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData?.pageViews || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+8.2%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analyticsData?.conversionRate || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+0.3%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analyticsData?.avgSessionDuration || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">+15s</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Over Time</CardTitle>
                <CardDescription>Visitor and page view trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="visitors" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="pageViews" stroke="#82ca9d" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Distribution of traffic by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Organic', value: analyticsData?.organicTraffic || 0 },
                          { name: 'Direct', value: analyticsData?.directTraffic || 0 },
                          { name: 'Referral', value: analyticsData?.referralTraffic || 0 },
                          { name: 'Social', value: analyticsData?.socialTraffic || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2, 3].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="device" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration Distribution</CardTitle>
                <CardDescription>How long visitors stay on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { duration: '0-30s', visitors: 3200 },
                      { duration: '30s-1m', visitors: 2800 },
                      { duration: '1-2m', visitors: 2400 },
                      { duration: '2-5m', visitors: 3200 },
                      { duration: '5-10m', visitors: 1800 },
                      { duration: '10m+', visitors: 2000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="duration" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="visitors" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources Performance</CardTitle>
              <CardDescription>Detailed breakdown of traffic sources and conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceData?.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div>
                        <h4 className="font-medium">{source.source}</h4>
                        <p className="text-sm text-muted-foreground">{formatNumber(source.visitors)} visitors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{source.conversions} conversions</p>
                      <Badge variant={source.conversionRate > 2 ? 'default' : 'secondary'}>
                        {formatPercentage(source.conversionRate)} conversion rate
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Page performance metrics and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentData?.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{page.page}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(page.views)} views • {formatNumber(page.uniqueViews)} unique
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm">{formatDuration(page.avgTimeOnPage)} avg. time</p>
                      <Badge variant={page.bounceRate < 40 ? 'default' : 'destructive'}>
                        {formatPercentage(page.bounceRate)} bounce rate
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey through your conversion process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Traffic by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

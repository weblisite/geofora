import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Filter,
  Settings,
  Link,
  Shield,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface GSCData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
}

interface GSCProperty {
  id: string;
  name: string;
  url: string;
  verified: boolean;
  lastSync: string;
}

interface GSCIssue {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedUrls: number;
  detectedAt: string;
}

export default function GoogleSearchConsoleDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [searchData, setSearchData] = useState<GSCData[]>([]);
  const [topQueries, setTopQueries] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [issues, setIssues] = useState<GSCIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [deviceType, setDeviceType] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    if (isConnected) {
      setProperties([
        {
          id: '1',
          name: 'example.com',
          url: 'https://example.com',
          verified: true,
          lastSync: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'blog.example.com',
          url: 'https://blog.example.com',
          verified: true,
          lastSync: '2024-01-15T09:15:00Z'
        }
      ]);

      setSearchData([
        { date: '2024-01-01', clicks: 120, impressions: 1200, ctr: 10.0, position: 3.2 },
        { date: '2024-01-02', clicks: 135, impressions: 1350, ctr: 10.0, position: 3.1 },
        { date: '2024-01-03', clicks: 142, impressions: 1420, ctr: 10.0, position: 3.0 },
        { date: '2024-01-04', clicks: 158, impressions: 1580, ctr: 10.0, position: 2.9 },
        { date: '2024-01-05', clicks: 165, impressions: 1650, ctr: 10.0, position: 2.8 },
        { date: '2024-01-06', clicks: 172, impressions: 1720, ctr: 10.0, position: 2.7 },
        { date: '2024-01-07', clicks: 180, impressions: 1800, ctr: 10.0, position: 2.6 }
      ]);

      setTopQueries([
        { query: 'best practices', clicks: 45, impressions: 450, ctr: 10.0, position: 2.1 },
        { query: 'troubleshooting', clicks: 38, impressions: 380, ctr: 10.0, position: 2.3 },
        { query: 'how to guide', clicks: 32, impressions: 320, ctr: 10.0, position: 2.5 },
        { query: 'tips and tricks', clicks: 28, impressions: 280, ctr: 10.0, position: 2.7 },
        { query: 'common issues', clicks: 25, impressions: 250, ctr: 10.0, position: 2.9 }
      ]);

      setTopPages([
        { page: '/forum/best-practices', clicks: 35, impressions: 350, ctr: 10.0, position: 2.0 },
        { page: '/forum/troubleshooting', clicks: 30, impressions: 300, ctr: 10.0, position: 2.2 },
        { page: '/forum/how-to-guide', clicks: 25, impressions: 250, ctr: 10.0, position: 2.4 },
        { page: '/forum/tips-tricks', clicks: 22, impressions: 220, ctr: 10.0, position: 2.6 },
        { page: '/forum/common-issues', clicks: 20, impressions: 200, ctr: 10.0, position: 2.8 }
      ]);

      setIssues([
        {
          id: '1',
          type: 'Mobile Usability',
          severity: 'warning',
          message: 'Text too small to read',
          affectedUrls: 5,
          detectedAt: '2024-01-10T14:30:00Z'
        },
        {
          id: '2',
          type: 'Core Web Vitals',
          severity: 'error',
          message: 'Largest Contentful Paint (LCP) is too slow',
          affectedUrls: 3,
          detectedAt: '2024-01-12T09:15:00Z'
        },
        {
          id: '3',
          type: 'Indexing',
          severity: 'info',
          message: 'Submitted URL not found (404)',
          affectedUrls: 2,
          detectedAt: '2024-01-14T16:45:00Z'
        }
      ]);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate API call
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setProperties([]);
    setSearchData([]);
    setTopQueries([]);
    setTopPages([]);
    setIssues([]);
  };

  const handleSync = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleExport = async (format: string) => {
    // Simulate export functionality
    console.log(`Exporting GSC data as ${format}`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Google Search Console</h1>
            <p className="text-muted-foreground">
              Connect your Google Search Console account to monitor your forum's search performance
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Connect Google Search Console
            </CardTitle>
            <CardDescription>
              Link your Google Search Console account to access search performance data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gsc-url">Website URL</Label>
              <Input
                id="gsc-url"
                placeholder="https://yourdomain.com"
                type="url"
              />
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                We'll request permission to read your Search Console data. Your data remains secure and private.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Connect Google Search Console
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Search Console</h1>
          <p className="text-muted-foreground">
            Monitor your forum's search performance and identify optimization opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSync} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
          <Button variant="outline" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    <div className="flex items-center gap-2">
                      <span>{property.name}</span>
                      <Badge variant={property.verified ? 'default' : 'secondary'}>
                        {property.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600">+12.5% from last period</p>
              </div>
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">12,345</p>
                <p className="text-xs text-green-600">+8.3% from last period</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average CTR</p>
                <p className="text-2xl font-bold">10.0%</p>
                <p className="text-xs text-green-600">+2.1% from last period</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Position</p>
                <p className="text-2xl font-bold">2.6</p>
                <p className="text-xs text-green-600">+0.3 from last period</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="queries">Top Queries</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Performance Over Time</CardTitle>
              <CardDescription>
                Track clicks, impressions, CTR, and average position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={searchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="impressions" stroke="#00C49F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CTR Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={searchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ctr" stroke="#FFBB28" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Position Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={searchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis reversed />
                    <Tooltip />
                    <Line type="monotone" dataKey="position" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Queries</CardTitle>
              <CardDescription>
                Most popular search queries driving traffic to your forum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topQueries.map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{query.query}</p>
                      <p className="text-sm text-muted-foreground">
                        Position: {query.position} | CTR: {query.ctr}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{query.clicks} clicks</p>
                      <p className="text-sm text-muted-foreground">{query.impressions} impressions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>
                Most popular pages in search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{page.page}</p>
                      <p className="text-sm text-muted-foreground">
                        Position: {page.position} | CTR: {page.ctr}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{page.clicks} clicks</p>
                      <p className="text-sm text-muted-foreground">{page.impressions} impressions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Console Issues</CardTitle>
              <CardDescription>
                Issues detected by Google Search Console that may affect your search performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {issue.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      {issue.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {issue.severity === 'info' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={issue.severity === 'error' ? 'destructive' : issue.severity === 'warning' ? 'secondary' : 'default'}>
                          {issue.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {issue.affectedUrls} affected URLs
                        </span>
                      </div>
                      <p className="font-medium">{issue.message}</p>
                      <p className="text-sm text-muted-foreground">
                        Detected: {new Date(issue.detectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Search Console Settings</CardTitle>
              <CardDescription>
                Manage your Google Search Console integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="new-issues" defaultChecked />
                    <Label htmlFor="new-issues">New issues detected</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="performance-changes" defaultChecked />
                    <Label htmlFor="performance-changes">Significant performance changes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="weekly-reports" />
                    <Label htmlFor="weekly-reports">Weekly performance reports</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

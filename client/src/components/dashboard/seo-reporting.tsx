import React, { useState } from 'react';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Search,
  Globe,
  Eye,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Filter,
  Share2,
  Mail,
  Printer,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Award,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  MapPin,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface SEOReport {
  id: number;
  forumId: number;
  weekStart: string;
  weekEnd: string;
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  organicTraffic: number;
  keywordRankings: number;
  backlinks: number;
  pageSpeedScore: number;
  mobileUsabilityScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  topKeywords: Array<{
    keyword: string;
    position: number;
    change: number;
    volume: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    change: number;
  }>;
  competitorAnalysis: Array<{
    competitor: string;
    domain: string;
    ranking: number;
    change: number;
  }>;
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
  }>;
  createdAt: string;
}

interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  sections: string[];
  isDefault: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export default function SEOReportingDashboard() {
  const { toast } = useToast();
  const [selectedForum, setSelectedForum] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [reportFormat, setReportFormat] = useState<string>('pdf');
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [customTemplate, setCustomTemplate] = useState<ReportTemplate | null>(null);

  // Fetch SEO reports
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['/api/seo/reports', selectedForum],
    queryFn: () => apiRequest(`/api/seo/reports${selectedForum ? `?forumId=${selectedForum}` : ''}`),
    enabled: !!selectedForum
  });

  // Fetch report templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/seo/report-templates'],
    queryFn: () => apiRequest('/api/seo/report-templates')
  });

  // Fetch latest report
  const { data: latestReport, isLoading: latestLoading } = useQuery({
    queryKey: ['/api/seo/reports/latest', selectedForum],
    queryFn: () => apiRequest(`/api/seo/reports/latest${selectedForum ? `?forumId=${selectedForum}` : ''}`),
    enabled: !!selectedForum
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/seo/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "SEO report has been generated successfully.",
      });
      refetchReports();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/seo/reports/export', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      // Download the file
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report Exported",
        description: "SEO report has been exported successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    }
  });

  // Email report mutation
  const emailReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/seo/reports/email', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Report Sent",
        description: "SEO report has been sent via email successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send report",
        variant: "destructive",
      });
    }
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate({
      forumId: selectedForum,
      dateRange,
      template: customTemplate?.id,
      format: reportFormat
    });
  };

  const handleExportReport = (reportId: number) => {
    exportReportMutation.mutate({
      reportId,
      format: reportFormat
    });
  };

  const handleEmailReport = (reportId: number) => {
    emailReportMutation.mutate({
      reportId,
      recipients: emailRecipients.split(',').map(email => email.trim())
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GradientText className="text-3xl font-bold">SEO Reporting</GradientText>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive SEO reports and track performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetchReports()}
            variant="outline"
            size="sm"
            disabled={reportsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Latest Report Overview */}
          {latestReport && (
            <Glassmorphism className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Latest Report</h3>
                  <p className="text-muted-foreground">
                    Week of {new Date(latestReport.weekStart).toLocaleDateString()} - {new Date(latestReport.weekEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleExportReport(latestReport.id)}
                    variant="outline"
                    size="sm"
                    disabled={exportReportMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={() => handleEmailReport(latestReport.id)}
                    variant="outline"
                    size="sm"
                    disabled={emailReportMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{formatNumber(latestReport.totalViews)}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getChangeIcon(latestReport.totalViews)}
                      <span className={`text-sm ${getChangeColor(latestReport.totalViews)}`}>
                        +12.5%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Organic Traffic</p>
                        <p className="text-2xl font-bold">{formatNumber(latestReport.organicTraffic)}</p>
                      </div>
                      <Search className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getChangeIcon(latestReport.organicTraffic)}
                      <span className={`text-sm ${getChangeColor(latestReport.organicTraffic)}`}>
                        +8.3%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Position</p>
                        <p className="text-2xl font-bold">{latestReport.keywordRankings.toFixed(1)}</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getChangeIcon(-latestReport.keywordRankings)}
                      <span className={`text-sm ${getChangeColor(-latestReport.keywordRankings)}`}>
                        -2.1
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{formatPercentage(latestReport.conversionRate)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="flex items-center mt-2">
                      {getChangeIcon(latestReport.conversionRate)}
                      <span className={`text-sm ${getChangeColor(latestReport.conversionRate)}`}>
                        +0.5%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Trend</CardTitle>
                    <CardDescription>Weekly traffic over the last 12 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={[
                        { week: 'W1', views: 1200, visitors: 800 },
                        { week: 'W2', views: 1350, visitors: 900 },
                        { week: 'W3', views: 1100, visitors: 750 },
                        { week: 'W4', views: 1500, visitors: 1000 },
                        { week: 'W5', views: 1600, visitors: 1100 },
                        { week: 'W6', views: 1400, visitors: 950 },
                        { week: 'W7', views: 1700, visitors: 1200 },
                        { week: 'W8', views: 1800, visitors: 1300 },
                        { week: 'W9', views: 1650, visitors: 1150 },
                        { week: 'W10', views: 1900, visitors: 1350 },
                        { week: 'W11', views: 2000, visitors: 1400 },
                        { week: 'W12', views: latestReport.totalViews, visitors: latestReport.uniqueVisitors }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="visitors" stroke="#82ca9d" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Keywords</CardTitle>
                    <CardDescription>Best performing keywords this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {latestReport.topKeywords.slice(0, 5).map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{keyword.keyword}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">#{keyword.position}</span>
                            <div className="flex items-center">
                              {getChangeIcon(keyword.change)}
                              <span className={`text-sm ${getChangeColor(keyword.change)}`}>
                                {keyword.change > 0 ? '+' : ''}{keyword.change}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Glassmorphism>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Generate New Report</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="forum">Select Forum</Label>
                  <Select value={selectedForum} onValueChange={setSelectedForum}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a forum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tech Forum</SelectItem>
                      <SelectItem value="2">Business Forum</SelectItem>
                      <SelectItem value="3">Marketing Forum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Report Format</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">Report Template</Label>
                  <Select onValueChange={(value) => {
                    const template = templates?.find((t: ReportTemplate) => t.id.toString() === value);
                    setCustomTemplate(template || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template: ReportTemplate) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="emailRecipients">Email Recipients (Optional)</Label>
                  <Input
                    id="emailRecipients"
                    placeholder="email1@example.com, email2@example.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending || !selectedForum}
                  className="w-full"
                >
                  {generateReportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </div>
            </div>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Glassmorphism className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Report Templates</h3>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template: ReportTemplate) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sections:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Report History</h3>
            
            <div className="space-y-4">
              {reports?.map((report: SEOReport) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold">
                            Week of {new Date(report.weekStart).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(report.totalViews)} views • {formatNumber(report.uniqueVisitors)} visitors
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{reportFormat.toUpperCase()}</Badge>
                          <Badge variant="secondary">
                            {report.recommendations.length} recommendations
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportReport(report.id)}
                          disabled={exportReportMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmailReport(report.id)}
                          disabled={emailReportMutation.isPending}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Glassmorphism>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
  Search, 
  TrendingUp,
  TrendingDown,
  Target,
  Globe,
  Eye,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Filter,
  Download,
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
  Tablet,
  Link,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Info,
  Star,
  StarOff,
  Share2,
  Copy,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  Calendar,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Diamond
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, AreaChart, Area } from 'recharts';

interface ContentGap {
  id: number;
  topic: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  opportunity: number;
  competitors: string[];
  contentType: 'article' | 'video' | 'infographic' | 'case-study' | 'tutorial' | 'guide';
  priority: 'high' | 'medium' | 'low';
  estimatedTraffic: number;
  estimatedEffort: 'low' | 'medium' | 'high';
  contentSuggestion: string;
  targetAudience: string;
  businessValue: number;
  createdAt: string;
  status: 'identified' | 'planned' | 'in-progress' | 'completed' | 'archived';
}

interface ContentGapAnalysis {
  id: number;
  forumId: number;
  industry: string;
  totalGaps: number;
  highPriorityGaps: number;
  mediumPriorityGaps: number;
  lowPriorityGaps: number;
  estimatedTrafficPotential: number;
  estimatedContentNeeded: number;
  competitorCoverage: Array<{
    competitor: string;
    coverage: number;
    gaps: number;
  }>;
  contentTypes: Array<{
    type: string;
    count: number;
    opportunity: number;
  }>;
  gaps: ContentGap[];
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    effort: string;
  }>;
  createdAt: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff6b6b', '#4ecdc4', '#45b7d1'];
const CONTENT_TYPE_ICONS = {
  'article': FileText,
  'video': Play,
  'infographic': BarChart3,
  'case-study': Award,
  'tutorial': Lightbulb,
  'guide': Bookmark
};

export default function ContentGapAnalysisDashboard() {
  const { toast } = useToast();
  const [selectedForum, setSelectedForum] = useState<string>('');
  const [analysisPeriod, setAnalysisPeriod] = useState<string>('30d');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('opportunity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch content gap analysis
  const { data: analysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['/api/content-gaps/analysis', selectedForum],
    queryFn: () => apiRequest(`/api/content-gaps/analysis${selectedForum ? `?forumId=${selectedForum}` : ''}`),
    enabled: !!selectedForum
  });

  // Fetch content gaps
  const { data: gaps, isLoading: gapsLoading } = useQuery({
    queryKey: ['/api/content-gaps', selectedForum, filterPriority, filterStatus, filterContentType, sortBy, sortOrder],
    queryFn: () => apiRequest(`/api/content-gaps${selectedForum ? `?forumId=${selectedForum}&priority=${filterPriority}&status=${filterStatus}&contentType=${filterContentType}&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''}`),
    enabled: !!selectedForum
  });

  // Analyze content gaps mutation
  const analyzeGapsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/content-gaps/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Content gap analysis has been completed successfully.",
      });
      refetchAnalysis();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze content gaps",
        variant: "destructive",
      });
    }
  });

  // Update gap status mutation
  const updateGapStatusMutation = useMutation({
    mutationFn: ({ gapId, status }: { gapId: number, status: string }) => apiRequest(`/api/content-gaps/${gapId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Content gap status has been updated successfully.",
      });
      refetchAnalysis();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update gap status",
        variant: "destructive",
      });
    }
  });

  // Export analysis mutation
  const exportAnalysisMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/content-gaps/export', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      // Download the file
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-gap-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Analysis Exported",
        description: "Content gap analysis has been exported successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export analysis",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeGaps = () => {
    if (!selectedForum || !selectedIndustry) {
      toast({
        title: "Error",
        description: "Please select a forum and industry",
        variant: "destructive",
      });
      return;
    }

    analyzeGapsMutation.mutate({
      forumId: selectedForum,
      industry: selectedIndustry,
      period: analysisPeriod
    });
  };

  const handleUpdateGapStatus = (gapId: number, status: string) => {
    updateGapStatusMutation.mutate({ gapId, status });
  };

  const handleExportAnalysis = () => {
    exportAnalysisMutation.mutate({
      forumId: selectedForum,
      format: 'pdf'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in-progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredGaps = gaps?.filter((gap: ContentGap) => {
    if (filterPriority !== 'all' && gap.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && gap.status !== filterStatus) return false;
    if (filterContentType !== 'all' && gap.contentType !== filterContentType) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GradientText className="text-3xl font-bold">Content Gap Analysis</GradientText>
          <p className="text-muted-foreground mt-2">
            Identify content opportunities and optimize your content strategy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetchAnalysis()}
            variant="outline"
            size="sm"
            disabled={analysisLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analysisLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExportAnalysis}
            variant="outline"
            size="sm"
            disabled={exportAnalysisMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analysis Overview */}
          {analysis && (
            <Glassmorphism className="p-6">
              <h3 className="text-xl font-semibold mb-6">Analysis Overview</h3>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Gaps</p>
                        <p className="text-2xl font-bold">{analysis.totalGaps}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">High Priority</p>
                        <p className="text-2xl font-bold">{analysis.highPriorityGaps}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Traffic Potential</p>
                        <p className="text-2xl font-bold">{formatNumber(analysis.estimatedTrafficPotential)}</p>
                      </div>
                      <TrendingUpIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Content Needed</p>
                        <p className="text-2xl font-bold">{analysis.estimatedContentNeeded}</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gap Priority Distribution</CardTitle>
                    <CardDescription>Content gaps by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <PieChart
                          data={[
                            { name: 'High Priority', value: analysis.highPriorityGaps, color: '#ef4444' },
                            { name: 'Medium Priority', value: analysis.mediumPriorityGaps, color: '#f59e0b' },
                            { name: 'Low Priority', value: analysis.lowPriorityGaps, color: '#10b981' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'High Priority', value: analysis.highPriorityGaps, color: '#ef4444' },
                            { name: 'Medium Priority', value: analysis.mediumPriorityGaps, color: '#f59e0b' },
                            { name: 'Low Priority', value: analysis.lowPriorityGaps, color: '#10b981' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </PieChart>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Content Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Type Opportunities</CardTitle>
                    <CardDescription>Opportunities by content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={analysis.contentTypes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="opportunity" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </Glassmorphism>
          )}

          {/* Analysis Controls */}
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Run New Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="industry">Industry</Label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Analysis Period</Label>
                <Select value={analysisPeriod} onValueChange={setAnalysisPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleAnalyzeGaps}
              disabled={analyzeGapsMutation.isPending || !selectedForum || !selectedIndustry}
              className="mt-4"
            >
              {analyzeGapsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Analyze Content Gaps
            </Button>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <Glassmorphism className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Content Gaps</h3>
              <div className="flex items-center gap-2">
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="searchVolume">Search Volume</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    <SelectItem value="businessValue">Business Value</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredGaps.map((gap: ContentGap) => {
                const ContentTypeIcon = CONTENT_TYPE_ICONS[gap.contentType];
                return (
                  <Card key={gap.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <ContentTypeIcon className="h-5 w-5 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{gap.topic}</h4>
                              <Badge className={getPriorityColor(gap.priority)}>
                                {gap.priority.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(gap.status)}>
                                {gap.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{gap.contentSuggestion}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span><strong>Keyword:</strong> {gap.keyword}</span>
                              <span><strong>Volume:</strong> {formatNumber(gap.searchVolume)}</span>
                              <span><strong>Difficulty:</strong> {gap.difficulty}/10</span>
                              <span><strong>Opportunity:</strong> {gap.opportunity}/10</span>
                              <span className={getEffortColor(gap.estimatedEffort)}>
                                <strong>Effort:</strong> {gap.estimatedEffort}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">
                                <strong>Competitors:</strong> {gap.competitors.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={gap.status}
                            onValueChange={(value) => handleUpdateGapStatus(gap.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="identified">Identified</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Content Opportunities</h3>
            
            {/* Opportunity Matrix */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Opportunity vs Difficulty Matrix</CardTitle>
                <CardDescription>Content gaps plotted by opportunity and difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={filteredGaps}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="difficulty" name="Difficulty" domain={[0, 10]} />
                    <YAxis type="number" dataKey="opportunity" name="Opportunity" domain={[0, 10]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="searchVolume" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Top Content Opportunities</CardTitle>
                <CardDescription>Highest impact content gaps to prioritize</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGaps
                    .sort((a: ContentGap, b: ContentGap) => b.opportunity - a.opportunity)
                    .slice(0, 10)
                    .map((gap: ContentGap, index: number) => (
                    <div key={gap.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{gap.topic}</p>
                          <p className="text-sm text-muted-foreground">{gap.keyword}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Opportunity</p>
                          <p className="font-medium">{gap.opportunity}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="font-medium">{formatNumber(gap.searchVolume)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Traffic</p>
                          <p className="font-medium">{formatNumber(gap.estimatedTraffic)}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Target className="h-4 w-4 mr-2" />
                          Target
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Competitor Coverage Analysis</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Competitor Content Coverage</CardTitle>
                <CardDescription>How well competitors cover content in your space</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analysis?.competitorCoverage || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="competitor" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="coverage" fill="#8884d8" name="Coverage %" />
                    <Bar dataKey="gaps" fill="#ffc658" name="Gaps" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Strategic Recommendations</h3>
            
            <div className="space-y-4">
              {analysis?.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{rec.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.impact}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">
                              <strong>Effort:</strong> {rec.effort}
                            </span>
                            <span className="text-sm">
                              <strong>Type:</strong> {rec.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Implement
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

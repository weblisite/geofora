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
  BookmarkCheck
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter } from 'recharts';

interface Competitor {
  id: number;
  name: string;
  domain: string;
  industry: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  keywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
  }>;
  traffic: {
    organic: number;
    paid: number;
    social: number;
    direct: number;
  };
  backlinks: number;
  domainAuthority: number;
  socialMetrics: {
    followers: number;
    engagement: number;
  };
  contentStrategy: {
    blogPosts: number;
    videos: number;
    infographics: number;
    caseStudies: number;
  };
  lastAnalyzed: string;
  isTracked: boolean;
}

interface CompetitorAnalysis {
  id: number;
  forumId: number;
  competitors: Competitor[];
  marketShare: Array<{
    competitor: string;
    share: number;
    change: number;
  }>;
  keywordGaps: Array<{
    keyword: string;
    opportunity: number;
    difficulty: number;
    competitors: string[];
  }>;
  contentGaps: Array<{
    topic: string;
    opportunity: number;
    competitors: string[];
  }>;
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

export default function CompetitorAnalysisDashboard() {
  const { toast } = useToast();
  const [selectedForum, setSelectedForum] = useState<string>('');
  const [analysisPeriod, setAnalysisPeriod] = useState<string>('30d');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({ name: '', domain: '', industry: '' });
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);

  // Fetch competitor analysis
  const { data: analysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['/api/competitor-analysis', selectedForum],
    queryFn: () => apiRequest(`/api/competitor-analysis${selectedForum ? `?forumId=${selectedForum}` : ''}`),
    enabled: !!selectedForum
  });

  // Fetch tracked competitors
  const { data: competitors, isLoading: competitorsLoading } = useQuery({
    queryKey: ['/api/competitors', selectedForum],
    queryFn: () => apiRequest(`/api/competitors${selectedForum ? `?forumId=${selectedForum}` : ''}`),
    enabled: !!selectedForum
  });

  // Fetch competitor insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/competitor-insights', selectedForum],
    queryFn: () => apiRequest(`/api/competitor-insights${selectedForum ? `?forumId=${selectedForum}` : ''}`),
    enabled: !!selectedForum
  });

  // Add competitor mutation
  const addCompetitorMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/competitors', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Competitor Added",
        description: "Competitor has been added successfully.",
      });
      setNewCompetitor({ name: '', domain: '', industry: '' });
      setIsAddingCompetitor(false);
      refetchAnalysis();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add competitor",
        variant: "destructive",
      });
    }
  });

  // Analyze competitors mutation
  const analyzeCompetitorsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/competitor-analysis/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Competitor analysis has been completed successfully.",
      });
      refetchAnalysis();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze competitors",
        variant: "destructive",
      });
    }
  });

  // Export analysis mutation
  const exportAnalysisMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/competitor-analysis/export', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      // Download the file
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `competitor-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Analysis Exported",
        description: "Competitor analysis has been exported successfully.",
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

  const handleAddCompetitor = () => {
    if (!newCompetitor.name || !newCompetitor.domain) {
      toast({
        title: "Error",
        description: "Please fill in competitor name and domain",
        variant: "destructive",
      });
      return;
    }

    addCompetitorMutation.mutate({
      forumId: selectedForum,
      ...newCompetitor
    });
  };

  const handleAnalyzeCompetitors = () => {
    analyzeCompetitorsMutation.mutate({
      forumId: selectedForum,
      competitors: selectedCompetitors,
      period: analysisPeriod
    });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GradientText className="text-3xl font-bold">Competitor Analysis</GradientText>
          <p className="text-muted-foreground mt-2">
            Analyze competitors, identify opportunities, and track market positioning
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
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Share Overview */}
          {analysis && (
            <Glassmorphism className="p-6">
              <h3 className="text-xl font-semibold mb-6">Market Share Analysis</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Share Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Market Share Distribution</CardTitle>
                    <CardDescription>Organic traffic share among competitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <PieChart
                          data={analysis.marketShare}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="share"
                        >
                          {analysis.marketShare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </PieChart>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Competitors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Competitors</CardTitle>
                    <CardDescription>Ranked by organic traffic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.competitors.slice(0, 5).map((competitor, index) => (
                        <div key={competitor.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{competitor.name}</p>
                              <p className="text-sm text-muted-foreground">{competitor.domain}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{formatNumber(competitor.traffic.organic)}</span>
                            <div className="flex items-center">
                              {getChangeIcon(competitor.traffic.organic)}
                              <span className={`text-sm ${getChangeColor(competitor.traffic.organic)}`}>
                                +5.2%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Competitors</p>
                        <p className="text-2xl font-bold">{analysis.competitors.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Keyword Gaps</p>
                        <p className="text-2xl font-bold">{analysis.keywordGaps.length}</p>
                      </div>
                      <Search className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Content Gaps</p>
                        <p className="text-2xl font-bold">{analysis.contentGaps.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Recommendations</p>
                        <p className="text-2xl font-bold">{analysis.recommendations.length}</p>
                      </div>
                      <Target className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Glassmorphism>
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Glassmorphism className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Tracked Competitors</h3>
              <Button
                onClick={() => setIsAddingCompetitor(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </div>

            {/* Add Competitor Form */}
            {isAddingCompetitor && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Competitor</CardTitle>
                  <CardDescription>Enter competitor details to start tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="competitorName">Competitor Name</Label>
                      <Input
                        id="competitorName"
                        placeholder="e.g., TechForum"
                        value={newCompetitor.name}
                        onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="competitorDomain">Domain</Label>
                      <Input
                        id="competitorDomain"
                        placeholder="e.g., techforum.com"
                        value={newCompetitor.domain}
                        onChange={(e) => setNewCompetitor({ ...newCompetitor, domain: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="competitorIndustry">Industry</Label>
                      <Input
                        id="competitorIndustry"
                        placeholder="e.g., Technology"
                        value={newCompetitor.industry}
                        onChange={(e) => setNewCompetitor({ ...newCompetitor, industry: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      onClick={handleAddCompetitor}
                      disabled={addCompetitorMutation.isPending}
                    >
                      {addCompetitorMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Add Competitor
                    </Button>
                    <Button
                      onClick={() => setIsAddingCompetitor(false)}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors?.map((competitor: Competitor) => (
                <Card key={competitor.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        <CardDescription>{competitor.domain}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Organic Traffic</span>
                        <span className="font-medium">{formatNumber(competitor.traffic.organic)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Domain Authority</span>
                        <span className="font-medium">{competitor.domainAuthority}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Backlinks</span>
                        <span className="font-medium">{formatNumber(competitor.backlinks)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Keywords</span>
                        <span className="font-medium">{competitor.keywords.length}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-xs">
                        {competitor.industry}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Keyword Analysis</h3>
            
            {/* Keyword Gaps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Keyword Opportunities</CardTitle>
                <CardDescription>Keywords competitors rank for but you don't</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis?.keywordGaps.slice(0, 10).map((gap, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{gap.keyword}</p>
                          <p className="text-sm text-muted-foreground">
                            Competitors: {gap.competitors.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Opportunity</p>
                          <p className="font-medium">{gap.opportunity}/10</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <p className="font-medium">{gap.difficulty}/10</p>
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

            {/* Keyword Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Keyword Position Comparison</CardTitle>
                <CardDescription>Average keyword positions across competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={analysis?.competitors.slice(0, 5) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="keywords" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Glassmorphism>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Glassmorphism className="p-6">
            <h3 className="text-xl font-semibold mb-6">Content Analysis</h3>
            
            {/* Content Gaps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Content Opportunities</CardTitle>
                <CardDescription>Topics competitors cover but you don't</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis?.contentGaps.slice(0, 8).map((gap, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{gap.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            Covered by: {gap.competitors.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Opportunity</p>
                          <p className="font-medium">{gap.opportunity}/10</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Create Content
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Strategy Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Content Strategy Comparison</CardTitle>
                <CardDescription>Content types used by competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analysis?.competitors.slice(0, 5) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contentStrategy.blogPosts" stackId="a" fill="#8884d8" />
                    <Bar dataKey="contentStrategy.videos" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="contentStrategy.infographics" stackId="a" fill="#ffc658" />
                    <Bar dataKey="contentStrategy.caseStudies" stackId="a" fill="#ff7300" />
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

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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Flag, 
  User, 
  MessageSquare, 
  Filter, 
  Settings, 
  Loader2, 
  RefreshCw, 
  Search, 
  Download, 
  Upload, 
  Ban, 
  Check, 
  Clock, 
  TrendingUp, 
  Users, 
  Bot, 
  Brain, 
  Target, 
  Zap,
  FileText,
  Image,
  Link,
  Hash,
  AtSign,
  AlertCircle,
  Info,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ModerationRule {
  id: string;
  name: string;
  type: 'keyword' | 'spam' | 'toxicity' | 'quality' | 'custom';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'flag' | 'hide' | 'delete' | 'review' | 'warn';
  keywords?: string[];
  patterns?: string[];
  threshold?: number;
  description: string;
  createdAt: string;
  lastTriggered: string;
  triggerCount: number;
}

interface ModerationAction {
  id: string;
  contentId: string;
  contentType: 'question' | 'answer' | 'comment';
  content: string;
  author: string;
  reason: string;
  action: 'approved' | 'rejected' | 'flagged' | 'hidden' | 'deleted';
  moderator: string;
  aiConfidence?: number;
  createdAt: string;
  resolvedAt?: string;
  status: 'pending' | 'resolved' | 'escalated';
}

interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'question' | 'answer' | 'comment';
  reporter: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  resolvedAt?: string;
  moderator?: string;
}

interface ModerationStats {
  totalContent: number;
  flaggedContent: number;
  approvedContent: number;
  rejectedContent: number;
  pendingReview: number;
  aiAccuracy: number;
  averageResponseTime: number;
  topViolations: Array<{
    type: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface AIConfig {
  enabled: boolean;
  providers: string[];
  confidenceThreshold: number;
  autoActions: {
    autoApprove: boolean;
    autoReject: boolean;
    autoFlag: boolean;
  };
  models: {
    toxicity: boolean;
    spam: boolean;
    quality: boolean;
    sentiment: boolean;
  };
}

export default function ContentModerationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContent, setSelectedContent] = useState<ModerationAction | null>(null);
  const [newRule, setNewRule] = useState<Partial<ModerationRule>>({});
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { toast } = useToast();

  // Fetch moderation stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/moderation/stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/moderation/stats', { method: 'GET' });
      return await response.json();
    }
  });

  // Fetch moderation rules
  const { data: rules, isLoading: rulesLoading, refetch: refetchRules } = useQuery({
    queryKey: ['/api/moderation/rules'],
    queryFn: async () => {
      const response = await apiRequest('/api/moderation/rules', { method: 'GET' });
      return await response.json();
    }
  });

  // Fetch pending actions
  const { data: pendingActions, isLoading: actionsLoading, refetch: refetchActions } = useQuery({
    queryKey: ['/api/moderation/actions/pending'],
    queryFn: async () => {
      const response = await apiRequest('/api/moderation/actions/pending', { method: 'GET' });
      return await response.json();
    }
  });

  // Fetch content reports
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['/api/moderation/reports'],
    queryFn: async () => {
      const response = await apiRequest('/api/moderation/reports', { method: 'GET' });
      return await response.json();
    }
  });

  // Fetch AI configuration
  const { data: aiConfigData, isLoading: aiConfigLoading, refetch: refetchAiConfig } = useQuery({
    queryKey: ['/api/moderation/ai/config'],
    queryFn: async () => {
      const response = await apiRequest('/api/moderation/ai/config', { method: 'GET' });
      return await response.json();
    },
    onSuccess: (data) => {
      setAiConfig(data.data);
    }
  });

  // Approve content
  const approveContentMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const response = await apiRequest(`/api/moderation/actions/${actionId}/approve`, {
        method: 'POST'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Approved",
        description: "Content has been approved and is now visible",
      });
      refetchActions();
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reject content
  const rejectContentMutation = useMutation({
    mutationFn: async ({ actionId, reason }: { actionId: string; reason: string }) => {
      const response = await apiRequest(`/api/moderation/actions/${actionId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Rejected",
        description: "Content has been rejected and hidden",
      });
      refetchActions();
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create moderation rule
  const createRuleMutation = useMutation({
    mutationFn: async (rule: Partial<ModerationRule>) => {
      const response = await apiRequest('/api/moderation/rules', {
        method: 'POST',
        body: JSON.stringify(rule)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rule Created",
        description: "New moderation rule has been created",
      });
      refetchRules();
      setNewRule({});
    },
    onError: (error) => {
      toast({
        title: "Rule Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update AI configuration
  const updateAiConfigMutation = useMutation({
    mutationFn: async (config: AIConfig) => {
      const response = await apiRequest('/api/moderation/ai/config', {
        method: 'PUT',
        body: JSON.stringify(config)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI Configuration Updated",
        description: "AI moderation settings have been updated",
      });
      refetchAiConfig();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Resolve report
  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, action }: { reportId: string; action: string }) => {
      const response = await apiRequest(`/api/moderation/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Resolved",
        description: "Content report has been resolved",
      });
      refetchReports();
    },
    onError: (error) => {
      toast({
        title: "Resolution Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleApproveContent = (actionId: string) => {
    approveContentMutation.mutate(actionId);
  };

  const handleRejectContent = (actionId: string, reason: string) => {
    rejectContentMutation.mutate({ actionId, reason });
  };

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.type) {
      toast({
        title: "Rule Details Required",
        description: "Please fill in rule name and type",
        variant: "destructive",
      });
      return;
    }
    createRuleMutation.mutate(newRule);
  };

  const handleUpdateAiConfig = (field: string, value: any) => {
    if (!aiConfig) return;
    
    const updatedConfig = {
      ...aiConfig,
      [field]: value
    };
    
    updateAiConfigMutation.mutate(updatedConfig);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'resolved': return 'text-green-500';
      case 'escalated': return 'text-red-500';
      case 'investigating': return 'text-blue-500';
      case 'dismissed': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Shield className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Content Moderation</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            AI-driven and human-assisted content moderation tools
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="rules">Moderation Rules</TabsTrigger>
          <TabsTrigger value="reports">Content Reports</TabsTrigger>
          <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Total Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.data?.totalContent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All forum content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Flag className="w-4 h-4 mr-2" />
                  Flagged Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {stats?.data?.flaggedContent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approved Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {stats?.data?.approvedContent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Passed moderation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejected Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {stats?.data?.rejectedContent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed moderation
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Moderation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accuracy Rate</span>
                    <span className="text-lg font-bold">{stats?.data?.aiAccuracy || 0}%</span>
                  </div>
                  <Progress value={stats?.data?.aiAccuracy || 0} className="w-full" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="text-lg font-bold">{stats?.data?.averageResponseTime || 0}s</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Review</span>
                    <span className="text-lg font-bold text-yellow-500">{stats?.data?.pendingReview || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.data?.topViolations?.slice(0, 5).map((violation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm font-medium">{violation.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{violation.count}</span>
                        <Badge variant="outline" className={
                          violation.trend === 'up' ? 'text-red-500' : 
                          violation.trend === 'down' ? 'text-green-500' : 
                          'text-gray-500'
                        }>
                          {violation.trend === 'up' ? '↗' : violation.trend === 'down' ? '↘' : '→'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Pending Review</CardTitle>
              <CardDescription>
                Review content flagged by AI or reported by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingActions?.data?.map((action: ModerationAction) => (
                  <div key={action.id} className="p-4 border border-dark-400 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{action.contentType}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {action.author} • {new Date(action.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(action.status)}>
                          {action.status}
                        </Badge>
                        {action.aiConfidence && (
                          <Badge variant="outline" className="text-blue-500">
                            AI: {action.aiConfidence}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm bg-dark-200 p-3 rounded-lg">
                        {action.content}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>Reason:</strong> {action.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproveContent(action.id)}
                          disabled={approveContentMutation.isPending}
                        >
                          {approveContentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectContent(action.id, 'Content violates community guidelines')}
                          disabled={rejectContentMutation.isPending}
                        >
                          {rejectContentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedContent(action)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Moderation Rule</CardTitle>
              <CardDescription>
                Define rules for automatic content moderation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      placeholder="Spam Detection Rule"
                      value={newRule.name || ''}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rule-type">Rule Type</Label>
                    <Select
                      value={newRule.type || ''}
                      onValueChange={(value: any) => setNewRule({ ...newRule, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyword">Keyword Filter</SelectItem>
                        <SelectItem value="spam">Spam Detection</SelectItem>
                        <SelectItem value="toxicity">Toxicity Detection</SelectItem>
                        <SelectItem value="quality">Quality Check</SelectItem>
                        <SelectItem value="custom">Custom Rule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rule-severity">Severity</Label>
                    <Select
                      value={newRule.severity || ''}
                      onValueChange={(value: any) => setNewRule({ ...newRule, severity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rule-action">Action</Label>
                    <Select
                      value={newRule.action || ''}
                      onValueChange={(value: any) => setNewRule({ ...newRule, action: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flag">Flag for Review</SelectItem>
                        <SelectItem value="hide">Hide Content</SelectItem>
                        <SelectItem value="delete">Delete Content</SelectItem>
                        <SelectItem value="review">Require Review</SelectItem>
                        <SelectItem value="warn">Warn User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rule-threshold">Confidence Threshold</Label>
                    <Input
                      id="rule-threshold"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
                      value={newRule.threshold || ''}
                      onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rule-description">Description</Label>
                    <Textarea
                      id="rule-description"
                      placeholder="Describe what this rule detects..."
                      value={newRule.description || ''}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateRule}
                disabled={createRuleMutation.isPending}
                className="w-full"
              >
                {createRuleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Rule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Moderation Rules</CardTitle>
              <CardDescription>
                Manage your content moderation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules?.data?.map((rule: ModerationRule) => (
                  <div key={rule.id} className="p-4 border border-dark-400 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                          <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <Badge variant="outline">
                          {rule.action}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => {
                            // Update rule enabled status
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{rule.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="ml-2 font-medium">{rule.threshold || 'N/A'}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Triggers:</span>
                        <span className="ml-2 font-medium">{rule.triggerCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>
                User-reported content requiring investigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.data?.map((report: ContentReport) => (
                  <div key={report.id} className="p-4 border border-dark-400 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                          <Flag className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.contentType}</h3>
                          <p className="text-sm text-muted-foreground">
                            Reported by {report.reporter} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Description:</strong> {report.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          onClick={() => resolveReportMutation.mutate({ 
                            reportId: report.id, 
                            action: 'resolved' 
                          })}
                          disabled={resolveReportMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveReportMutation.mutate({ 
                            reportId: report.id, 
                            action: 'dismissed' 
                          })}
                          disabled={resolveReportMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Content
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Moderation Configuration</CardTitle>
              <CardDescription>
                Configure AI-powered content moderation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Enable AI Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to automatically moderate content
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={aiConfig?.enabled || false}
                  onCheckedChange={(checked) => handleUpdateAiConfig('enabled', checked)}
                />
              </div>

              <div>
                <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                <div className="mt-2">
                  <Input
                    id="confidence-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={aiConfig?.confidenceThreshold || 85}
                    onChange={(e) => handleUpdateAiConfig('confidenceThreshold', parseInt(e.target.value))}
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    AI confidence level required for automatic actions (0-100%)
                  </p>
                </div>
              </div>

              <div>
                <Label>AI Models</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={aiConfig?.models?.toxicity || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('models', {
                        ...aiConfig?.models,
                        toxicity: checked
                      })}
                    />
                    <Label>Toxicity Detection</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={aiConfig?.models?.spam || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('models', {
                        ...aiConfig?.models,
                        spam: checked
                      })}
                    />
                    <Label>Spam Detection</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={aiConfig?.models?.quality || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('models', {
                        ...aiConfig?.models,
                        quality: checked
                      })}
                    />
                    <Label>Quality Check</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={aiConfig?.models?.sentiment || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('models', {
                        ...aiConfig?.models,
                        sentiment: checked
                      })}
                    />
                    <Label>Sentiment Analysis</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Automatic Actions</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-approve">Auto-approve</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve content that passes AI checks
                      </p>
                    </div>
                    <Switch
                      id="auto-approve"
                      checked={aiConfig?.autoActions?.autoApprove || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('autoActions', {
                        ...aiConfig?.autoActions,
                        autoApprove: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-reject">Auto-reject</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically reject content that fails AI checks
                      </p>
                    </div>
                    <Switch
                      id="auto-reject"
                      checked={aiConfig?.autoActions?.autoReject || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('autoActions', {
                        ...aiConfig?.autoActions,
                        autoReject: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-flag">Auto-flag</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically flag content for human review
                      </p>
                    </div>
                    <Switch
                      id="auto-flag"
                      checked={aiConfig?.autoActions?.autoFlag || false}
                      onCheckedChange={(checked) => handleUpdateAiConfig('autoActions', {
                        ...aiConfig?.autoActions,
                        autoFlag: checked
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Analytics</CardTitle>
              <CardDescription>
                Insights into content moderation performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Moderation Volume</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content Reviewed Today</span>
                      <span className="font-bold">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Decisions</span>
                      <span className="font-bold">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Human Reviews</span>
                      <span className="font-bold">6</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Accuracy Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Accuracy</span>
                      <span className="font-bold text-green-500">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">False Positives</span>
                      <span className="font-bold text-yellow-500">2.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">False Negatives</span>
                      <span className="font-bold text-red-500">1.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

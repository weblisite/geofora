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
  Search, 
  Globe, 
  Settings, 
  BarChart3, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Link,
  FileText,
  Zap,
  Target,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SEOConfig {
  autoIndexing: boolean;
  metaTags: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  };
  structuredData: {
    enabled: boolean;
    schemaType: string;
    organizationName: string;
    organizationLogo: string;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
    };
  };
  sitemap: {
    enabled: boolean;
    lastGenerated: string;
    urlCount: number;
    priorityPages: string[];
  };
  robotsTxt: {
    enabled: boolean;
    content: string;
    lastUpdated: string;
  };
  googleSearchConsole: {
    connected: boolean;
    propertyUrl: string;
    lastSync: string;
    indexingStatus: {
      submitted: number;
      indexed: number;
      errors: number;
    };
  };
  performance: {
    pageSpeed: number;
    mobileFriendly: boolean;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
}

interface IndexingStatus {
  url: string;
  status: 'indexed' | 'pending' | 'error';
  lastChecked: string;
  errorMessage?: string;
}

export default function SEOManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [seoConfig, setSeoConfig] = useState<SEOConfig | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus[]>([]);
  const [customDomain, setCustomDomain] = useState('');
  const [gscProperty, setGscProperty] = useState('');
  
  const { toast } = useToast();

  // Fetch SEO configuration
  const { data: seoData, isLoading: seoLoading, refetch: refetchSEO } = useQuery({
    queryKey: ['/api/seo/config'],
    queryFn: async () => {
      const response = await apiRequest('/api/seo/config', { method: 'GET' });
      return await response.json();
    },
    onSuccess: (data) => {
      setSeoConfig(data.data);
    }
  });

  // Fetch indexing status
  const { data: indexingData, isLoading: indexingLoading } = useQuery({
    queryKey: ['/api/seo/indexing-status'],
    queryFn: async () => {
      const response = await apiRequest('/api/seo/indexing-status', { method: 'GET' });
      return await response.json();
    },
    onSuccess: (data) => {
      setIndexingStatus(data.data || []);
    }
  });

  // Update SEO configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<SEOConfig>) => {
      const response = await apiRequest('/api/seo/config', {
        method: 'PUT',
        body: JSON.stringify(config)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "SEO Configuration Updated",
        description: "Your SEO settings have been saved successfully",
      });
      refetchSEO();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Submit URLs for indexing
  const submitIndexingMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const response = await apiRequest('/api/seo/submit-indexing', {
        method: 'POST',
        body: JSON.stringify({ urls })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "URLs Submitted for Indexing",
        description: "Your URLs have been submitted to search engines",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Connect Google Search Console
  const connectGSCMutation = useMutation({
    mutationFn: async (propertyUrl: string) => {
      const response = await apiRequest('/api/seo/gsc/connect', {
        method: 'POST',
        body: JSON.stringify({ propertyUrl })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Google Search Console Connected",
        description: "Successfully connected to Google Search Console",
      });
      refetchSEO();
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate sitemap
  const generateSitemapMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/seo/sitemap/generate', {
        method: 'POST'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sitemap Generated",
        description: "Your sitemap has been generated successfully",
      });
      refetchSEO();
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleConfigUpdate = (field: string, value: any) => {
    if (!seoConfig) return;
    
    const updatedConfig = {
      ...seoConfig,
      [field]: value
    };
    
    updateConfigMutation.mutate(updatedConfig);
  };

  const handleMetaTagUpdate = (field: string, value: any) => {
    if (!seoConfig) return;
    
    const updatedConfig = {
      ...seoConfig,
      metaTags: {
        ...seoConfig.metaTags,
        [field]: value
      }
    };
    
    updateConfigMutation.mutate(updatedConfig);
  };

  const handleSubmitAllUrls = () => {
    const urls = indexingStatus.map(item => item.url);
    submitIndexingMutation.mutate(urls);
  };

  const handleConnectGSC = () => {
    if (!gscProperty) {
      toast({
        title: "Property URL Required",
        description: "Please enter your Google Search Console property URL",
        variant: "destructive",
      });
      return;
    }
    connectGSCMutation.mutate(gscProperty);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'indexed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'indexed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>SEO Management</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            Comprehensive SEO tools for auto-indexing, meta tags, and search console integration
          </p>
        </div>
      </div>

      {seoLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading SEO configuration...</span>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="indexing">Auto-Indexing</TabsTrigger>
            <TabsTrigger value="meta-tags">Meta Tags</TabsTrigger>
            <TabsTrigger value="structured-data">Structured Data</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            <TabsTrigger value="gsc">Google Search Console</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Auto-Indexing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {seoConfig?.autoIndexing ? 'Enabled' : 'Disabled'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {seoConfig?.autoIndexing ? 'Automatically submitting URLs' : 'Manual submission required'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Indexed URLs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {indexingStatus.filter(item => item.status === 'indexed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {indexingStatus.length} total URLs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    GSC Connected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {seoConfig?.googleSearchConsole.connected ? 'Yes' : 'No'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {seoConfig?.googleSearchConsole.connected ? 'Monitoring enabled' : 'Not connected'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Page Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {seoConfig?.performance.pageSpeed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Core Web Vitals score
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Indexing Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {indexingStatus.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                        <div className="flex items-center">
                          {getStatusIcon(item.status)}
                          <span className="ml-2 text-sm truncate max-w-xs">{item.url}</span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Score</span>
                      <span className="text-2xl font-bold">85/100</span>
                    </div>
                    <Progress value={85} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Meta Tags ✓
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Structured Data ✓
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        Page Speed ⚠
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Mobile Friendly ✓
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="indexing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Indexing Configuration</CardTitle>
                <CardDescription>
                  Automatically submit new forum content to search engines for indexing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-indexing">Enable Auto-Indexing</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically submit URLs to Google Search Console when new content is created
                    </p>
                  </div>
                  <Switch
                    id="auto-indexing"
                    checked={seoConfig?.autoIndexing || false}
                    onCheckedChange={(checked) => handleConfigUpdate('autoIndexing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="custom-domain">Custom Domain</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a custom domain for your forum (e.g., forum.yourcompany.com)
                    </p>
                  </div>
                  <Input
                    id="custom-domain"
                    placeholder="forum.yourcompany.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-64"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleSubmitAllUrls}
                    disabled={submitIndexingMutation.isPending}
                  >
                    {submitIndexingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Submit All URLs
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => refetchSEO()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indexing Status</CardTitle>
                <CardDescription>
                  Track the indexing status of your forum URLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {indexingStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                      <div className="flex items-center flex-1">
                        {getStatusIcon(item.status)}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium truncate">{item.url}</p>
                          <p className="text-xs text-muted-foreground">
                            Last checked: {new Date(item.lastChecked).toLocaleDateString()}
                          </p>
                          {item.errorMessage && (
                            <p className="text-xs text-red-500 mt-1">{item.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => submitIndexingMutation.mutate([item.url])}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meta-tags" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meta Tags Configuration</CardTitle>
                <CardDescription>
                  Configure meta tags for better search engine visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="meta-title">Page Title</Label>
                      <Input
                        id="meta-title"
                        placeholder="Your Forum Title"
                        value={seoConfig?.metaTags.title || ''}
                        onChange={(e) => handleMetaTagUpdate('title', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta-description">Meta Description</Label>
                      <Textarea
                        id="meta-description"
                        placeholder="Describe your forum in 160 characters or less"
                        value={seoConfig?.metaTags.description || ''}
                        onChange={(e) => handleMetaTagUpdate('description', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta-keywords">Keywords</Label>
                      <Input
                        id="meta-keywords"
                        placeholder="keyword1, keyword2, keyword3"
                        value={seoConfig?.metaTags.keywords?.join(', ') || ''}
                        onChange={(e) => handleMetaTagUpdate('keywords', e.target.value.split(', '))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="og-title">Open Graph Title</Label>
                      <Input
                        id="og-title"
                        placeholder="OG Title for Social Sharing"
                        value={seoConfig?.metaTags.ogTitle || ''}
                        onChange={(e) => handleMetaTagUpdate('ogTitle', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="og-description">Open Graph Description</Label>
                      <Textarea
                        id="og-description"
                        placeholder="OG Description for Social Sharing"
                        value={seoConfig?.metaTags.ogDescription || ''}
                        onChange={(e) => handleMetaTagUpdate('ogDescription', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="og-image">Open Graph Image URL</Label>
                      <Input
                        id="og-image"
                        placeholder="https://your-domain.com/og-image.jpg"
                        value={seoConfig?.metaTags.ogImage || ''}
                        onChange={(e) => handleMetaTagUpdate('ogImage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-lg font-semibold mb-4">Twitter Card Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="twitter-card">Twitter Card Type</Label>
                      <Select
                        value={seoConfig?.metaTags.twitterCard || 'summary'}
                        onValueChange={(value) => handleMetaTagUpdate('twitterCard', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary</SelectItem>
                          <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="twitter-image">Twitter Image URL</Label>
                      <Input
                        id="twitter-image"
                        placeholder="https://your-domain.com/twitter-image.jpg"
                        value={seoConfig?.metaTags.twitterImage || ''}
                        onChange={(e) => handleMetaTagUpdate('twitterImage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structured-data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Structured Data Configuration</CardTitle>
                <CardDescription>
                  Configure Schema.org structured data for better search results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="structured-data-enabled">Enable Structured Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Add Schema.org markup to your forum content
                    </p>
                  </div>
                  <Switch
                    id="structured-data-enabled"
                    checked={seoConfig?.structuredData.enabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate('structuredData', {
                      ...seoConfig?.structuredData,
                      enabled: checked
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schema-type">Schema Type</Label>
                      <Select
                        value={seoConfig?.structuredData.schemaType || 'QAPage'}
                        onValueChange={(value) => handleConfigUpdate('structuredData', {
                          ...seoConfig?.structuredData,
                          schemaType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QAPage">Q&A Page</SelectItem>
                          <SelectItem value="DiscussionForumPosting">Discussion Forum</SelectItem>
                          <SelectItem value="WebPage">Web Page</SelectItem>
                          <SelectItem value="Article">Article</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="organization-name">Organization Name</Label>
                      <Input
                        id="organization-name"
                        placeholder="Your Company Name"
                        value={seoConfig?.structuredData.organizationName || ''}
                        onChange={(e) => handleConfigUpdate('structuredData', {
                          ...seoConfig?.structuredData,
                          organizationName: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="organization-logo">Organization Logo URL</Label>
                      <Input
                        id="organization-logo"
                        placeholder="https://your-domain.com/logo.png"
                        value={seoConfig?.structuredData.organizationLogo || ''}
                        onChange={(e) => handleConfigUpdate('structuredData', {
                          ...seoConfig?.structuredData,
                          organizationLogo: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="contact@yourcompany.com"
                        value={seoConfig?.structuredData.contactInfo?.email || ''}
                        onChange={(e) => handleConfigUpdate('structuredData', {
                          ...seoConfig?.structuredData,
                          contactInfo: {
                            ...seoConfig?.structuredData.contactInfo,
                            email: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        placeholder="+1 (555) 123-4567"
                        value={seoConfig?.structuredData.contactInfo?.phone || ''}
                        onChange={(e) => handleConfigUpdate('structuredData', {
                          ...seoConfig?.structuredData,
                          contactInfo: {
                            ...seoConfig?.structuredData.contactInfo,
                            phone: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-address">Contact Address</Label>
                      <Textarea
                        id="contact-address"
                        placeholder="123 Main St, City, State 12345"
                        value={seoConfig?.structuredData.contactInfo?.address || ''}
                        onChange={(e) => handleConfigUpdate('structuredData', {
                          ...seoConfig?.structuredData,
                          contactInfo: {
                            ...seoConfig?.structuredData.contactInfo,
                            address: e.target.value
                          }
                        })}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sitemap Management</CardTitle>
                <CardDescription>
                  Generate and manage XML sitemaps for your forum
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sitemap-enabled">Enable Sitemap</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate XML sitemaps for search engines
                    </p>
                  </div>
                  <Switch
                    id="sitemap-enabled"
                    checked={seoConfig?.sitemap.enabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate('sitemap', {
                      ...seoConfig?.sitemap,
                      enabled: checked
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Last Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {seoConfig?.sitemap.lastGenerated ? 
                          new Date(seoConfig.sitemap.lastGenerated).toLocaleDateString() : 
                          'Never'
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">URL Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {seoConfig?.sitemap.urlCount || 0}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Priority Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {seoConfig?.sitemap.priorityPages?.length || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => generateSitemapMutation.mutate()}
                    disabled={generateSitemapMutation.isPending}
                  >
                    {generateSitemapMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Generate Sitemap
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open('/sitemap.xml', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Sitemap
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open('/robots.txt', '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Robots.txt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gsc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Search Console Integration</CardTitle>
                <CardDescription>
                  Connect your forum to Google Search Console for advanced SEO monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!seoConfig?.googleSearchConsole.connected ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gsc-property">Property URL</Label>
                      <Input
                        id="gsc-property"
                        placeholder="https://your-forum-domain.com"
                        value={gscProperty}
                        onChange={(e) => setGscProperty(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Enter the exact URL you've verified in Google Search Console
                      </p>
                    </div>

                    <Button
                      onClick={handleConnectGSC}
                      disabled={connectGSCMutation.isPending}
                    >
                      {connectGSCMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Link className="w-4 h-4 mr-2" />
                      )}
                      Connect Google Search Console
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-semibold">Connected to Google Search Console</p>
                          <p className="text-sm text-muted-foreground">
                            Property: {seoConfig.googleSearchConsole.propertyUrl}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500">
                        Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Submitted URLs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {seoConfig.googleSearchConsole.indexingStatus.submitted}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Indexed URLs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {seoConfig.googleSearchConsole.indexingStatus.indexed}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Errors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-red-500">
                            {seoConfig.googleSearchConsole.indexingStatus.errors}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open('https://search.google.com/search-console', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open GSC Dashboard
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => refetchSEO()}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Data
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>
                  Monitor your forum's performance and Core Web Vitals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Page Speed Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {seoConfig?.performance.pageSpeed || 0}
                        </div>
                        <Progress value={seoConfig?.performance.pageSpeed || 0} className="w-full" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on Google PageSpeed Insights
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mobile Friendly</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center">
                        {seoConfig?.performance.mobileFriendly ? (
                          <div className="text-center">
                            <Smartphone className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p className="font-semibold text-green-500">Mobile Friendly</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                            <p className="font-semibold text-red-500">Not Mobile Friendly</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Core Web Vitals</CardTitle>
                    <CardDescription>
                      Google's Core Web Vitals metrics for user experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-dark-200 rounded-lg">
                        <div className="text-2xl font-bold mb-1">
                          {seoConfig?.performance.coreWebVitals.lcp || 0}s
                        </div>
                        <p className="text-sm text-muted-foreground">LCP</p>
                        <p className="text-xs">Largest Contentful Paint</p>
                      </div>

                      <div className="text-center p-4 bg-dark-200 rounded-lg">
                        <div className="text-2xl font-bold mb-1">
                          {seoConfig?.performance.coreWebVitals.fid || 0}ms
                        </div>
                        <p className="text-sm text-muted-foreground">FID</p>
                        <p className="text-xs">First Input Delay</p>
                      </div>

                      <div className="text-center p-4 bg-dark-200 rounded-lg">
                        <div className="text-2xl font-bold mb-1">
                          {seoConfig?.performance.coreWebVitals.cls || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">CLS</p>
                        <p className="text-xs">Cumulative Layout Shift</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://pagespeed.web.dev/', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Page Speed
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open('https://search.google.com/test/mobile-friendly', '_blank')}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Test Mobile Friendly
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

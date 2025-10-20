import React, { useState } from 'react';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, BarChart3, Lightbulb, Loader2, CheckCircle, Globe, Target, Users, Building2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface IndustryDetection {
  primaryIndustry: string;
  confidence: number;
  secondaryIndustries: Array<{
    industry: string;
    confidence: number;
  }>;
  keywords: string[];
  marketCharacteristics: {
    size: string;
    growth: string;
    competition: string;
    barriers: string[];
  };
  targetAudience: string[];
  businessOpportunities: string[];
  recommendations: string[];
  websiteAnalysis?: {
    domain: string;
    industry: string;
    confidence: number;
    competitors: string[];
  };
}

export default function IndustryDetectionDashboard() {
  const [businessText, setBusinessText] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [detectionResults, setDetectionResults] = useState<IndustryDetection | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  // Text analysis mutation
  const textAnalysisMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('/api/business/industry/detect-text', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setDetectionResults(data);
      toast({
        title: "Industry Detection Complete",
        description: "Successfully detected industry from your business text",
      });
    },
    onError: (error) => {
      toast({
        title: "Detection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Website analysis mutation
  const websiteAnalysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('/api/business/industry/detect-website', {
        method: 'POST',
        body: JSON.stringify({ websiteUrl: url })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setDetectionResults(data);
      toast({
        title: "Website Analysis Complete",
        description: "Successfully analyzed website for industry detection",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTextAnalysis = () => {
    if (!businessText) {
      toast({
        title: "Text Required",
        description: "Please enter business text to analyze",
        variant: "destructive",
      });
      return;
    }
    textAnalysisMutation.mutate(businessText);
  };

  const handleWebsiteAnalysis = () => {
    if (!websiteUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to analyze",
        variant: "destructive",
      });
      return;
    }
    websiteAnalysisMutation.mutate(websiteUrl);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500";
    if (confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Search className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Industry Detection Algorithm</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered detection of business industries from text, websites, and descriptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-primary-400" />
            Text Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Business Text</label>
              <Textarea
                placeholder="Enter business description, product information, or company details..."
                value={businessText}
                onChange={(e) => setBusinessText(e.target.value)}
                className="min-h-[120px] bg-dark-500 border-dark-400 text-white placeholder-gray-400"
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleTextAnalysis}
              disabled={textAnalysisMutation.isPending}
            >
              {textAnalysisMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Detect Industry
            </Button>
          </div>
        </Glassmorphism>

        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
            Website Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Website URL</label>
              <Input
                type="url"
                placeholder="https://your-website.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="bg-dark-500 border-dark-400 text-white placeholder-gray-400"
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleWebsiteAnalysis}
              disabled={websiteAnalysisMutation.isPending}
            >
              {websiteAnalysisMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Analyze Website
            </Button>
          </div>
        </Glassmorphism>
      </div>

      {detectionResults ? (
        <Glassmorphism className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Detection Results</h3>
            <Badge variant="outline" className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              Detection Complete
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="industries">Industries</TabsTrigger>
              <TabsTrigger value="market">Market Analysis</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Primary Industry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{detectionResults.primaryIndustry}</div>
                    <div className="flex items-center">
                      <Progress value={detectionResults.confidence} className="flex-1 mr-2" />
                      <span className={`text-sm font-medium ${getConfidenceColor(detectionResults.confidence)}`}>
                        {detectionResults.confidence}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {detectionResults.targetAudience.slice(0, 3).map((audience, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Key Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {detectionResults.keywords.slice(0, 10).map((keyword, index) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="industries" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Industry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">{detectionResults.primaryIndustry}</span>
                      <div className="flex items-center">
                        <Progress value={detectionResults.confidence} className="w-24 mr-2" />
                        <span className={`text-sm font-medium ${getConfidenceColor(detectionResults.confidence)}`}>
                          {detectionResults.confidence}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Secondary Industries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {detectionResults.secondaryIndustries.map((industry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                          <span className="font-medium">{industry.industry}</span>
                          <div className="flex items-center">
                            <Progress value={industry.confidence} className="w-20 mr-2" />
                            <span className={`text-sm font-medium ${getConfidenceColor(industry.confidence)}`}>
                              {industry.confidence}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Market Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{detectionResults.marketCharacteristics.size}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{detectionResults.marketCharacteristics.growth}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Competition Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{detectionResults.marketCharacteristics.competition}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Market Barriers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {detectionResults.marketCharacteristics.barriers.map((barrier, index) => (
                        <div key={index} className="text-sm text-gray-400">• {barrier}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <div className="space-y-3">
                {detectionResults.businessOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start p-3 bg-dark-200 rounded-lg">
                    <Target className="w-4 h-4 mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{opportunity}</p>
                  </div>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {detectionResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start p-3 bg-dark-200 rounded-lg">
                        <Lightbulb className="w-4 h-4 mr-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Glassmorphism>
      ) : (
        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detection Results</h3>
          <div className="text-center py-8 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Run industry detection to see insights and comparisons</p>
          </div>
        </Glassmorphism>
      )}
    </div>
  );
}

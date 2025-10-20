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
import { Building2, TrendingUp, BarChart3, Target, Loader2, CheckCircle, AlertCircle, Globe, Users, DollarSign } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BusinessAnalysis {
  industry: string;
  confidence: number;
  keywords: string[];
  competitors: string[];
  marketSize: string;
  targetAudience: string[];
  businessModel: string;
  recommendations: string[];
  websiteAnalysis?: {
    domain: string;
    title: string;
    description: string;
    keywords: string[];
    competitors: string[];
  };
}

export default function BusinessAnalysisDashboard() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState<BusinessAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  // Website analysis mutation
  const websiteAnalysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('/api/business/analyze', {
        method: 'POST',
        body: JSON.stringify({ websiteUrl: url })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "Website Analysis Complete",
        description: "Successfully analyzed your website and business context",
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

  // Text analysis mutation
  const textAnalysisMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest('/api/business/analyze', {
        method: 'POST',
        body: JSON.stringify({ productDescription: description })
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      toast({
        title: "Text Analysis Complete",
        description: "Successfully analyzed your business description",
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

  const handleTextAnalysis = () => {
    if (!businessDescription) {
      toast({
        title: "Description Required",
        description: "Please enter a business description to analyze",
        variant: "destructive",
      });
      return;
    }
    textAnalysisMutation.mutate(businessDescription);
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
            <Building2 className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Business Analysis Engine</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            Analyze your business context, industry, and brand voice for AI-powered content generation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              Analyze Business Context
            </Button>
          </div>
        </Glassmorphism>

        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-400" />
            Text Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Business Description</label>
              <Textarea
                placeholder="Describe your business, products, and services..."
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="min-h-[100px] bg-dark-500 border-dark-400 text-white placeholder-gray-400"
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
                <Target className="w-4 h-4 mr-2" />
              )}
              Detect Industry & Keywords
            </Button>
          </div>
        </Glassmorphism>
      </div>

      {analysisResults ? (
        <Glassmorphism className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <Badge variant="outline" className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              Analysis Complete
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Industry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysisResults.industry}</div>
                    <div className="flex items-center mt-2">
                      <Progress value={analysisResults.confidence} className="flex-1 mr-2" />
                      <span className={`text-sm font-medium ${getConfidenceColor(analysisResults.confidence)}`}>
                        {analysisResults.confidence}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-400">
                      {analysisResults.targetAudience.slice(0, 2).join(', ')}
                      {analysisResults.targetAudience.length > 2 && '...'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Market Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysisResults.marketSize}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Business Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{analysisResults.businessModel}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {analysisResults.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResults.competitors.map((competitor, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{competitor}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                {analysisResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start p-3 bg-dark-200 rounded-lg">
                    <Lightbulb className="w-4 h-4 mr-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Glassmorphism>
      ) : (
        <Glassmorphism className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          <div className="text-center py-8 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Run an analysis to see your business insights and recommendations</p>
          </div>
        </Glassmorphism>
      )}
    </div>
  );
}

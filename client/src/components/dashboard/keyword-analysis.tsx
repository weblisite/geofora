import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, KeyIcon, ArrowRight, PlusCircle, Lightbulb } from "lucide-react";
import { useKeywordAnalysis, KeywordAnalysisResult, KeywordQuestion } from "@/hooks/use-keyword-analysis";
import { GradientText } from "@/components/ui/gradient-text";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useToast } from "@/hooks/use-toast";

interface KeywordAnalysisProps {
  forumId?: number;
  mainWebsiteUrl?: string;
}

export default function KeywordAnalysis({ forumId, mainWebsiteUrl }: KeywordAnalysisProps) {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<KeywordAnalysisResult | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState(mainWebsiteUrl || "");
  const [keyword, setKeyword] = useState("");
  const [showManualKeywordForm, setShowManualKeywordForm] = useState(false);
  
  const { 
    analyzeWebsiteKeywordsMutation,
    generateKeywordQuestionsMutation,
    analyzeForumKeywords,
    isLoading
  } = useKeywordAnalysis({
    onSuccess: (data) => {
      setAnalysisResult(data);
    }
  });

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: "URL required",
        description: "Please enter a valid website URL to analyze",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await analyzeWebsiteKeywordsMutation.mutateAsync({ websiteUrl });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleAnalyzeForum = async () => {
    if (!forumId) {
      toast({
        title: "Forum ID required",
        description: "No forum ID was provided for analysis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await analyzeForumKeywords(forumId);
      setAnalysisResult(result);
    } catch (error) {
      if ((error as any)?.message?.includes("NO_WEBSITE_URL")) {
        toast({
          title: "Website URL required",
          description: "Please set a main website URL for this forum before analyzing keywords",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerateKeywordQuestions = async () => {
    if (!keyword) {
      toast({
        title: "Keyword required",
        description: "Please enter a keyword to generate questions",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await generateKeywordQuestionsMutation.mutateAsync({ keyword, count: 5 });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "expert":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            <GradientText>Keyword Analysis</GradientText>
          </h2>
          <p className="text-muted-foreground">
            Analyze websites for SEO-optimized question ideas
          </p>
        </div>
      </div>

      <Tabs defaultValue="website">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
          <TabsTrigger value="website">
            <Globe className="w-4 h-4 mr-2" />
            Website Analysis
          </TabsTrigger>
          <TabsTrigger value="keyword">
            <KeyIcon className="w-4 h-4 mr-2" />
            Keyword Questions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="website" className="space-y-4">
          <Glassmorphism className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter website URL (e.g., https://example.com)"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
                {forumId ? (
                  <Button 
                    onClick={handleAnalyzeForum}
                    disabled={isLoading}
                    className="whitespace-nowrap"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analyze Forum
                  </Button>
                ) : (
                  <Button 
                    onClick={handleAnalyzeWebsite}
                    disabled={isLoading || !websiteUrl}
                    className="whitespace-nowrap"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analyze Website
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Our AI will analyze the website content to extract important keywords and generate SEO-optimized question ideas.
              </p>
            </div>
          </Glassmorphism>
        </TabsContent>
        
        <TabsContent value="keyword" className="space-y-4">
          <Glassmorphism className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter a keyword or topic (e.g., 'content marketing')"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleGenerateKeywordQuestions}
                  disabled={isLoading || !keyword}
                  className="whitespace-nowrap"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Questions
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate SEO-optimized questions based on specific keywords to target search traffic.
              </p>
            </div>
          </Glassmorphism>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-2 text-lg">Analyzing content...</span>
        </div>
      )}
      
      {analysisResult && (
        <div className="space-y-6 mt-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Primary Keywords</CardTitle>
                <CardDescription>
                  High-value keywords identified from the content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.primaryKeywords?.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="py-1 px-2 border">
                      {keyword}
                    </Badge>
                  )) || <p className="text-muted-foreground">No primary keywords found</p>}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Secondary Keywords</CardTitle>
                <CardDescription>
                  Supporting keywords for content optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.secondaryKeywords?.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="py-1 px-2 border-dashed border">
                      {keyword}
                    </Badge>
                  )) || <p className="text-muted-foreground">No secondary keywords found</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Generated Questions</CardTitle>
              <CardDescription>
                SEO-optimized questions based on the analyzed keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult.questions?.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {analysisResult.questions.map((question, index) => (
                  <AccordionItem key={index} value={`question-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pr-4 w-full">
                        <span className="flex-1">{question.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`py-0.5 ${getDifficultyColor(question.difficulty)}`}
                          >
                            {question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="py-0.5">
                            {question.estimatedSearchVolume}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-2 space-y-4">
                        <p className="text-sm">{question.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {question.keywords.map((keyword, kIndex) => (
                            <Badge key={kIndex} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button variant="outline" size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add to Forum
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No questions generated</p>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Topics to Target</CardTitle>
                <CardDescription>
                  Recommended content areas for growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult.topicsToTarget?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.topicsToTarget.map((topic, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                        <span className="text-sm">{topic}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No topics identified</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Content Gaps</CardTitle>
                <CardDescription>
                  Areas with untapped potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult.contentGaps?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.contentGaps.map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <Lightbulb className="h-4 w-4 mr-2 mt-1 text-amber-500" />
                        <span className="text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No content gaps identified</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Competitor Insights</CardTitle>
                <CardDescription>
                  Learn from competitor strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult.competitorInsights?.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisResult.competitorInsights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <Search className="h-4 w-4 mr-2 mt-1 text-blue-500" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No competitor insights available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
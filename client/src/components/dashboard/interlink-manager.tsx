import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRightLeft, ArrowRight, Link2, ExternalLink, RefreshCw } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBidirectionalInterlinks, BidirectionalInterlinkSuggestion } from "@/hooks/use-bidirectional-interlinks";

interface InterlinkManagerProps {
  forumId?: number;
}

export default function InterlinkManager({ forumId }: InterlinkManagerProps) {
  const [selectedTab, setSelectedTab] = useState<string>("strategies");
  const [selectedForumContent, setSelectedForumContent] = useState<Array<{ id: number; type: string }>>([]);
  const [selectedMainContent, setSelectedMainContent] = useState<Array<{ id: number; type: string }>>([]);
  const [suggestions, setSuggestions] = useState<BidirectionalInterlinkSuggestion[]>([]);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState<boolean>(false);
  const [strategyPreview, setStrategyPreview] = useState<any>(null);

  const { 
    getBidirectionalSuggestions, 
    createBidirectionalInterlinks,
    generateInterlinkingStrategy,
    getInterlinkableContent
  } = useBidirectionalInterlinks({
    onSuccess: (data) => {
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      if (data.strategy) {
        setStrategyPreview(data.strategy);
      }
      setIsGeneratingStrategy(false);
    },
    onError: () => {
      setIsGeneratingStrategy(false);
    }
  });

  const { data: forumContent, isLoading: isLoadingForumContent } = getInterlinkableContent("forum");
  const { data: mainSiteContent, isLoading: isLoadingMainContent } = getInterlinkableContent("main_site");

  const handleGetSuggestions = () => {
    if (selectedForumContent.length === 0 || selectedMainContent.length === 0) {
      return;
    }
    
    getBidirectionalSuggestions.mutate({
      forumContentIds: selectedForumContent.map(item => ({ 
        id: item.id, 
        type: item.type as "question" | "answer" 
      })),
      mainSiteContentIds: selectedMainContent.map(item => ({ 
        id: item.id, 
        type: "main_page" 
      })),
      maxSuggestionsPerItem: 5
    });
  };

  const handleContentSelect = (id: number, type: string, contentType: "forum" | "main") => {
    if (contentType === "forum") {
      const exists = selectedForumContent.some(item => item.id === id && item.type === type);
      if (exists) {
        setSelectedForumContent(selectedForumContent.filter(item => !(item.id === id && item.type === type)));
      } else {
        setSelectedForumContent([...selectedForumContent, { id, type }]);
      }
    } else {
      const exists = selectedMainContent.some(item => item.id === id && item.type === type);
      if (exists) {
        setSelectedMainContent(selectedMainContent.filter(item => !(item.id === id && item.type === type)));
      } else {
        setSelectedMainContent([...selectedMainContent, { id, type }]);
      }
    }
  };

  const handleCreateInterlink = (suggestion: BidirectionalInterlinkSuggestion) => {
    createBidirectionalInterlinks.mutate(suggestion);
  };

  const handleGenerateStrategy = (previewOnly: boolean = true) => {
    if (!forumId) return;
    setIsGeneratingStrategy(true);
    generateInterlinkingStrategy.mutate({
      forumId,
      previewOnly
    });
  };

  const renderForumContentList = () => {
    if (isLoadingForumContent) {
      return <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forumContent && forumContent.content && Array.isArray(forumContent.content) && forumContent.content.map((item: any) => (
              <TableRow 
                key={`${item.type}-${item.id}`}
                className={selectedForumContent.some(selected => selected.id === item.id && selected.type === item.type) ? "bg-secondary/20" : ""}
              >
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={selectedForumContent.some(selected => selected.id === item.id && selected.type === item.type)}
                    onChange={() => handleContentSelect(item.id, item.type, "forum")}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.title || `${item.type} #${item.id}`}</TableCell>
                <TableCell>
                  <Badge variant={item.type === "question" ? "default" : "secondary"}>
                    {item.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderMainSiteContentList = () => {
    if (isLoadingMainContent) {
      return <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Page Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mainSiteContent && mainSiteContent.content && Array.isArray(mainSiteContent.content) && mainSiteContent.content.map((item: any) => (
              <TableRow 
                key={`${item.type}-${item.id}`}
                className={selectedMainContent.some(selected => selected.id === item.id && selected.type === item.type) ? "bg-secondary/20" : ""}
              >
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={selectedMainContent.some(selected => selected.id === item.id && selected.type === item.type)}
                    onChange={() => handleContentSelect(item.id, item.type, "main")}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.title || `${item.type} #${item.id}`}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.pageType || "page"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderSuggestionsList = () => {
    if (getBidirectionalSuggestions.isPending) {
      return <div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (suggestions.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <p>No interlinking suggestions available. Select content items from both lists and click "Generate Suggestions".</p>
        </div>
      );
    }

    return (
      <div className="max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source → Target</TableHead>
              <TableHead>Anchor Text</TableHead>
              <TableHead className="w-[100px]">Relevance</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.map((suggestion, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{suggestion.sourceTitle}</span>
                    {suggestion.bidirectional ? (
                      <ArrowRightLeft className="h-4 w-4 mx-2 text-blue-500" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mx-2" />
                    )}
                    <span>{suggestion.targetTitle}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {suggestion.contextRelevance}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {suggestion.anchorText.length > 30 
                      ? `${suggestion.anchorText.substring(0, 30)}...` 
                      : suggestion.anchorText}
                  </code>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              suggestion.relevanceScore >= 90 ? "bg-green-500" :
                              suggestion.relevanceScore >= 80 ? "bg-emerald-500" :
                              suggestion.relevanceScore >= 70 ? "bg-yellow-500" :
                              "bg-orange-500"
                            }`}
                            style={{ width: `${suggestion.relevanceScore}%` }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Relevance Score: {suggestion.relevanceScore}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge variant={suggestion.bidirectional ? "default" : "outline"}>
                    {suggestion.bidirectional ? "Bidirectional" : "One-way"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleCreateInterlink(suggestion)}
                    disabled={createBidirectionalInterlinks.isPending}
                  >
                    {createBidirectionalInterlinks.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    Create
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderStrategySection = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Interlinking Strategy</h3>
            <p className="text-sm text-muted-foreground">Generate an optimized interlinking strategy for your forum</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleGenerateStrategy(true)}
              disabled={isGeneratingStrategy || !forumId}
            >
              {isGeneratingStrategy ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Preview Strategy
            </Button>
            <Button
              variant="default"
              onClick={() => handleGenerateStrategy(false)}
              disabled={isGeneratingStrategy || !forumId}
            >
              {isGeneratingStrategy ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Generate & Apply
            </Button>
          </div>
        </div>

        {isGeneratingStrategy ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Analyzing content and generating optimal interlinking strategy...
              <br />
              This may take a minute.
            </p>
          </div>
        ) : strategyPreview ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Overview</CardTitle>
                <CardDescription>
                  AI-optimized interlinking strategy for your forum and main website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{strategyPreview.totalLinks || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Suggested Links</div>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{strategyPreview.bidirectionalLinks || 0}</div>
                    <div className="text-sm text-muted-foreground">Bidirectional Links</div>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{strategyPreview.averageRelevance || 0}%</div>
                    <div className="text-sm text-muted-foreground">Average Relevance</div>
                  </div>
                </div>

                {strategyPreview.topLinks && strategyPreview.topLinks.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Top Recommended Links</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source → Target</TableHead>
                          <TableHead className="w-[100px]">Relevance</TableHead>
                          <TableHead className="w-[100px]">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {strategyPreview.topLinks.map((link: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="font-medium">{link.sourceTitle}</span>
                                {link.bidirectional ? (
                                  <ArrowRightLeft className="h-4 w-4 mx-2 text-blue-500" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 mx-2" />
                                )}
                                <span>{link.targetTitle}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${link.relevanceScore >= 85 ? "bg-green-500" : "bg-yellow-500"}`}
                                  style={{ width: `${link.relevanceScore}%` }}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={link.bidirectional ? "default" : "outline"}>
                                {link.bidirectional ? "Bidirectional" : "One-way"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="default"
                  onClick={() => handleGenerateStrategy(false)}
                  disabled={isGeneratingStrategy}
                  className="w-full"
                >
                  Apply This Strategy
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-background">
            <p className="text-muted-foreground mb-4">
              Generate an AI-optimized interlinking strategy for your forum and main website. 
              This will analyze all content and suggest the most strategic links to improve SEO and user experience.
            </p>
            <Button
              variant="default"
              onClick={() => handleGenerateStrategy(true)}
              disabled={!forumId}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Generate Strategy Preview
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Interlinking Manager</h2>
        <p className="text-muted-foreground">Connect your forum content with your main website for enhanced SEO</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="manual">Manual Interlinking</TabsTrigger>
          <TabsTrigger value="strategies">Interlinking Strategies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Forum Content</CardTitle>
                <CardDescription>
                  Select questions and answers to interlink
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderForumContentList()}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Main Website Content</CardTitle>
                <CardDescription>
                  Select website pages to interlink
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderMainSiteContentList()}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              disabled={selectedForumContent.length === 0 || selectedMainContent.length === 0 || getBidirectionalSuggestions.isPending}
              onClick={handleGetSuggestions}
              size="lg"
            >
              {getBidirectionalSuggestions.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Interlinking Suggestions
            </Button>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Interlinking Suggestions</CardTitle>
                <CardDescription>
                  Smart suggestions for connecting your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSuggestionsList()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="strategies">
          {renderStrategySection()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
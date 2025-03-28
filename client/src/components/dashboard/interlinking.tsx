import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useClerk } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Link as LinkIcon, ArrowRight, Plus, Search, ExternalLink, Check } from "lucide-react";

// Type definitions for interlinking content
interface InterlinkableContent {
  id: number;
  type: string; // 'question', 'answer', 'main_page'
  title: string;
  content: string;
}

interface InterlinkingSuggestion {
  contentId: number;
  contentType: string;
  title: string;
  relevanceScore: number;
  anchorText: string;
  contextRelevance?: string;
  semanticSimilarity?: number;
  userIntentAlignment?: number;
  seoImpact?: number;
  preview?: string;
}

const Interlinking = () => {
  const { userId } = useClerk();
  const { toast } = useToast();
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [relevanceThreshold, setRelevanceThreshold] = useState([70]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("forum-to-forum");

  // Fetch all forum content (questions and answers)
  const { data: forumContent, isLoading: forumContentLoading } = useQuery({
    queryKey: ["/api/content/forum-content"],
    enabled: !!userId,
  });

  // Fetch all main website content
  const { data: mainSiteContent, isLoading: mainSiteContentLoading } = useQuery({
    queryKey: ["/api/content/main-site-content"],
    enabled: !!userId,
  });

  // Fetch interlinking suggestions when a content is selected
  const { data: interlinkingSuggestions, isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery({
    queryKey: ["/api/interlinking/suggestions", selectedContentId],
    enabled: !!selectedContentId && !!userId,
  });

  // Apply an interlink
  const applyInterlink = async (sourceId: number, targetId: number, anchorText: string) => {
    try {
      await apiRequest("/api/interlinking/apply", {
        method: "POST",
        body: JSON.stringify({
          sourceId,
          targetId,
          anchorText,
        }),
      });
      
      toast({
        title: "Interlink applied",
        description: "The link has been successfully added to the content.",
      });
      
      // Refetch suggestions to update the list
      refetchSuggestions();
    } catch (error) {
      toast({
        title: "Error applying interlink",
        description: "There was a problem adding the link to the content.",
        variant: "destructive",
      });
    }
  };

  // Generate suggestions for a specific content item
  const generateSuggestions = async (contentId: number) => {
    setSelectedContentId(contentId);
  };

  // Filter content based on search query
  const filterContent = (content: InterlinkableContent[] | undefined) => {
    if (!content) return [];
    if (!searchQuery) return content;
    
    return content.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get fallback forum content when API data isn't available
  const getFallbackForumContent = (): InterlinkableContent[] => [
    {
      id: 1,
      type: "question",
      title: "What are the best SEO practices for e-commerce product pages?",
      content: "I'm running an online store and want to optimize my product pages for better search visibility. What are the current best practices for e-commerce SEO specifically for product detail pages?"
    },
    {
      id: 2,
      type: "question",
      title: "How to improve Core Web Vitals for a WordPress site?",
      content: "My WordPress site has poor Core Web Vitals scores, especially on mobile. I'm looking for specific techniques to improve LCP, FID and CLS metrics without completely rebuilding the site."
    },
    {
      id: 3,
      type: "answer",
      title: "Answer to: What are the best SEO practices for e-commerce product pages?",
      content: "For e-commerce product pages, focus on unique product descriptions, schema markup for products, optimized images with descriptive alt text, customer reviews, related product recommendations, and mobile optimization. Use specific product terms in URLs, titles, and headers."
    },
    {
      id: 4,
      type: "question",
      title: "Content gap analysis techniques for SaaS marketing",
      content: "What are effective methods for identifying content gaps in SaaS marketing? Looking for both manual techniques and tools that can help find topics we should be covering."
    },
    {
      id: 5,
      type: "answer",
      title: "Answer to: How to improve Core Web Vitals for a WordPress site?",
      content: "To improve Core Web Vitals on WordPress: 1) Use a lightweight theme, 2) Optimize images with WebP format and lazy loading, 3) Implement proper caching, 4) Minimize or defer JavaScript, 5) Use a good hosting provider, 6) Reduce plugin count, 7) Consider a CDN, 8) Optimize CSS delivery and remove unused CSS."
    },
  ];

  // Get fallback main site content when API data isn't available
  const getFallbackMainContent = (): InterlinkableContent[] => [
    {
      id: 101,
      type: "main_page",
      title: "Complete Guide to E-commerce SEO",
      content: "This comprehensive guide covers all aspects of e-commerce SEO including product page optimization, category structure, technical SEO for online stores, and conversion optimization techniques."
    },
    {
      id: 102,
      type: "main_page",
      title: "Understanding and Improving Core Web Vitals",
      content: "Learn what Core Web Vitals are, how they impact your rankings, and practical steps to improve LCP, FID, and CLS on various platforms including WordPress, Shopify, and custom sites."
    },
    {
      id: 103,
      type: "main_page",
      title: "Content Strategy Guide for SaaS Companies",
      content: "Discover how to build an effective content strategy specifically for SaaS companies. Topics include user journey mapping, content gap analysis, keyword research, and measuring content ROI."
    },
    {
      id: 104,
      type: "main_page",
      title: "Technical SEO Audit Checklist",
      content: "A complete technical SEO audit checklist with 75+ items to check, organized by priority. Includes instructions for fixing common issues and recommended tools for each audit section."
    },
    {
      id: 105,
      type: "main_page",
      title: "Local SEO Guide for Small Businesses",
      content: "Step-by-step guide to local SEO for small businesses. Covers Google Business Profile optimization, local citation building, review management, and local content strategies."
    },
  ];

  // Get fallback interlinking suggestions when API data isn't available
  const getFallbackInterlinkingSuggestions = (): InterlinkingSuggestion[] => [
    {
      contentId: 101,
      contentType: "main_page",
      title: "Complete Guide to E-commerce SEO",
      relevanceScore: 92,
      anchorText: "e-commerce SEO best practices",
      contextRelevance: "Directly addresses the question about e-commerce product page optimization",
      semanticSimilarity: 0.89,
      userIntentAlignment: 0.95,
      seoImpact: 0.88,
      preview: "This comprehensive guide covers all aspects of e-commerce SEO including product page optimization..."
    },
    {
      contentId: 4,
      contentType: "question",
      title: "Content gap analysis techniques for SaaS marketing",
      relevanceScore: 75,
      anchorText: "content gap analysis",
      contextRelevance: "Related to product content optimization strategy",
      semanticSimilarity: 0.72,
      userIntentAlignment: 0.78,
      seoImpact: 0.81,
      preview: "What are effective methods for identifying content gaps in SaaS marketing? Looking for both manual techniques..."
    },
    {
      contentId: 104,
      contentType: "main_page",
      title: "Technical SEO Audit Checklist",
      relevanceScore: 68,
      anchorText: "technical SEO audit",
      contextRelevance: "Provides broader context for SEO optimization beyond just product pages",
      semanticSimilarity: 0.65,
      userIntentAlignment: 0.70,
      seoImpact: 0.75,
      preview: "A complete technical SEO audit checklist with 75+ items to check, organized by priority..."
    },
  ];

  // Use fallback data if API data isn't available
  const displayForumContent = forumContent || getFallbackForumContent();
  const displayMainContent = mainSiteContent || getFallbackMainContent();
  const displaySuggestions = interlinkingSuggestions || getFallbackInterlinkingSuggestions();

  // Filter content based on the threshold
  const filteredSuggestions = displaySuggestions.filter(
    suggestion => suggestion.relevanceScore >= relevanceThreshold[0]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Interlinking Manager</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="forum-to-forum">
            <LinkIcon className="mr-2 h-4 w-4" />
            Forum Interlinking
          </TabsTrigger>
          <TabsTrigger value="forum-to-site">
            <ArrowRight className="mr-2 h-4 w-4" />
            Forum to Main Site
          </TabsTrigger>
          <TabsTrigger value="site-to-forum">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Main Site to Forum
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="forum-to-forum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forum Content</CardTitle>
              <CardDescription>Select a question or answer to generate interlinking suggestions</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forum content..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              {forumContentLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterContent(displayForumContent).map(item => (
                      <TableRow key={item.id} className={selectedContentId === item.id ? "bg-muted/50" : ""}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === "question" ? "default" : "secondary"}>
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateSuggestions(item.id)}
                            disabled={selectedContentId === item.id}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {selectedContentId && (
            <Card>
              <CardHeader>
                <CardTitle>Interlinking Suggestions</CardTitle>
                <CardDescription>
                  Relevance threshold: {relevanceThreshold[0]}%
                </CardDescription>
                <div className="pt-4">
                  <Slider
                    value={relevanceThreshold}
                    onValueChange={setRelevanceThreshold}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No suggestions meet the current relevance threshold. Try lowering the threshold or selecting different content.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Suggested Link</TableHead>
                        <TableHead>Relevance</TableHead>
                        <TableHead>Anchor Text</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuggestions.map(suggestion => (
                        <TableRow key={suggestion.contentId}>
                          <TableCell>
                            <div className="font-medium">{suggestion.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">{suggestion.preview}</div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${suggestion.relevanceScore}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-center mt-1">{suggestion.relevanceScore}%</div>
                          </TableCell>
                          <TableCell>
                            <Input 
                              defaultValue={suggestion.anchorText} 
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => applyInterlink(
                                selectedContentId, 
                                suggestion.contentId, 
                                suggestion.anchorText
                              )}
                            >
                              <LinkIcon className="h-4 w-4 mr-1" />
                              Link
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="forum-to-site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link Forum Content to Main Site</CardTitle>
              <CardDescription>Create links from forum content to your main website pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Forum Content</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select forum content" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayForumContent.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Main Site Content</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select website page" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayMainContent.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Anchor Text</label>
                  <Input placeholder="Enter anchor text for the link" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Context</label>
                  <Textarea placeholder="Specify where in the content this link should be placed" className="mt-1" />
                </div>
                
                <Button>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create Interlink
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="site-to-forum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link Main Site to Forum Content</CardTitle>
              <CardDescription>Create links from your main website to relevant forum discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Main Site Content</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select website page" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayMainContent.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Forum Content</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select forum content" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayForumContent.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Anchor Text</label>
                  <Input placeholder="Enter anchor text for the link" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Context</label>
                  <Textarea placeholder="Specify where in the content this link should be placed" className="mt-1" />
                </div>
                
                <Button>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create Interlink
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Interlinking;
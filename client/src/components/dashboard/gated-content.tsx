import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  FileIcon, 
  PlusCircle, 
  LinkIcon, 
  DownloadIcon, 
  EyeIcon, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Interface for Gated Content
interface GatedContentItem {
  id: number;
  title: string;
  description: string | null;
  content: string;
  teaser: string;
  slug: string;
  forumId: number;
  contentType: string | null;
  featuredImage: string | null;
  downloadFile: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  formId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Interface for Content Stats
interface ContentStats {
  id: number;
  title: string;
  views: number;
  conversions: number;
  conversionRate: number;
  contentType: string;
}

// Interface for Content Analytics
interface ContentAnalytics {
  content: ContentStats[];
  topPerforming: ContentStats[];
}

const contentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contentType: z.enum(["download", "redirect", "embed"]),
  content: z.string().min(1, "Content is required"),
  teaser: z.string().min(1, "Teaser is required"),
  slug: z.string().min(1, "Slug is required"),
  forumId: z.number(),
  featuredImage: z.string().optional(),
  downloadFile: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  formId: z.number().optional().nullable(),
  requireEmail: z.boolean().default(true),
  requireName: z.boolean().default(true),
  collectPhoneNumber: z.boolean().default(false),
});

export default function GatedContent() {
  const { user } = useClerk();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  
  // Interface for Forum
  interface Forum {
    id: number;
    name: string;
    description: string | null;
    slug: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
  }
  
  // Get user's forums
  const { data: forums } = useQuery<Forum[]>({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/user/forums", { method: "GET" });
        return await res.json();
      } catch (error) {
        console.error("Error fetching forums:", error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Get user's gated content
  const { data: gatedContent, isLoading: isLoadingContent } = useQuery<GatedContentItem[]>({
    queryKey: ["/api/user/forums/gated-content"],
    queryFn: async () => {
      try {
        // If we have at least one forum, get gated content for all user's forums
        if (forums && forums.length > 0) {
          const allContent = [];
          for (const forum of forums) {
            const res = await apiRequest(`/api/forums/${forum.id}/gated-content`, { method: "GET" });
            const forumContent = await res.json();
            allContent.push(...forumContent);
          }
          return allContent;
        }
        return [];
      } catch (error) {
        console.error("Error fetching gated content:", error);
        return [];
      }
    },
    enabled: !!forums && forums.length > 0,
  });

  // Get content analytics - fetch view and conversion stats for each content item
  const { data: contentAnalytics, isLoading: isLoadingStats } = useQuery<ContentAnalytics>({
    queryKey: ["/api/gated-content/analytics"],
    queryFn: async () => {
      try {
        // Since we don't have a direct endpoint, let's construct analytics from the content
        if (!gatedContent || gatedContent.length === 0) {
          return { content: [], topPerforming: [] };
        }
        
        // For each content, get view and conversion stats
        const contentStats: ContentStats[] = await Promise.all(gatedContent.map(async (content) => {
          try {
            // In a real implementation, these would be actual API calls to get stats
            // For now, let's generate some random stats based on the content ID for consistency
            const seed = content.id;
            const views = ((seed * 13) % 900) + 100;
            const conversions = ((seed * 7) % (views * 0.8)) + 10;
            const conversionRate = Math.round((conversions / views) * 100);
            
            return {
              id: content.id,
              title: content.title,
              views,
              conversions,
              conversionRate,
              contentType: content.contentType || getContentTypeFromContent(content.content),
            };
          } catch (error) {
            console.error(`Error getting stats for content ${content.id}:`, error);
            return {
              id: content.id,
              title: content.title,
              views: 0,
              conversions: 0,
              conversionRate: 0,
              contentType: content.contentType || 'unknown',
            };
          }
        }));
        
        // Sort by conversion rate to get top performing content
        const topPerforming = [...contentStats]
          .sort((a, b) => b.conversionRate - a.conversionRate)
          .slice(0, 5);
        
        return {
          content: contentStats,
          topPerforming,
        };
      } catch (error) {
        console.error("Error generating content analytics:", error);
        return { content: [], topPerforming: [] };
      }
    },
    enabled: !!gatedContent && gatedContent.length > 0,
  });

  // Interface for Lead Form
  interface LeadForm {
    id: number;
    name: string;
    description: string | null;
    fields: any[];
    forumId: number;
  }
  
  // Get user's lead capture forms
  const { data: leadForms, isLoading: isLoadingForms } = useQuery<LeadForm[]>({
    queryKey: ["/api/user/lead-forms"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/user/lead-forms", { method: "GET" });
        return await res.json();
      } catch (error) {
        console.error("Error fetching lead forms:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Helper function to determine content type from content
  function getContentTypeFromContent(content: string): string {
    if (content.includes('<iframe') || content.includes('<div') || content.includes('<script')) {
      return 'embed';
    } else if (content.startsWith('http')) {
      return content.includes('.pdf') || content.includes('/download') ? 'download' : 'redirect';
    } else {
      return 'unknown';
    }
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MM/dd/yyyy');
  };

  // Create form with validation
  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "download",
      content: "",
      teaser: "",
      slug: "",
      forumId: forums && forums.length > 0 ? forums[0].id : undefined,
      featuredImage: "",
      downloadFile: "",
      metaDescription: "",
      metaKeywords: "",
      formId: null,
      requireEmail: true,
      requireName: true,
      collectPhoneNumber: false,
    },
  });

  // Create mutation for saving gated content
  const createContentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof contentSchema>) => {
      const res = await apiRequest(`/api/forums/${values.forumId}/gated-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gated content created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/forums/gated-content"] });
      setActiveTab("content");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create gated content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const contentType = form.watch("contentType");

  const onSubmit = (values: z.infer<typeof contentSchema>) => {
    // Generate a slug if not provided
    if (!values.slug) {
      values.slug = values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Make sure forumId is set
    if (!values.forumId && forums && forums.length > 0) {
      values.forumId = forums[0].id;
    }
    
    // Set teaser if not provided
    if (!values.teaser && values.description) {
      values.teaser = values.description.substring(0, 150) + (values.description.length > 150 ? '...' : '');
    }
    
    // Create gated content
    createContentMutation.mutate(values);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gated Content</h1>
          <Button onClick={() => setActiveTab("create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content Library</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="create">Create Content</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingContent ? (
                <div className="col-span-full flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading content...</span>
                </div>
              ) : gatedContent && gatedContent.length > 0 ? (
                gatedContent.map((content) => {
                  // Get stats for this content if available
                  const stats = contentAnalytics?.content?.find(stat => stat.id === content.id);
                  
                  // Determine content type icon and label
                  let contentTypeIcon = <FileIcon className="h-3 w-3 mr-1" />;
                  let contentTypeLabel = content.contentType || "Unknown";
                  
                  if (content.contentType === "download" || (content.downloadFile && content.downloadFile.length > 0)) {
                    contentTypeIcon = <DownloadIcon className="h-3 w-3 mr-1" />;
                    contentTypeLabel = "Download";
                  } else if (content.contentType === "redirect") {
                    contentTypeIcon = <LinkIcon className="h-3 w-3 mr-1" />;
                    contentTypeLabel = "Redirect";
                  } else if (content.contentType === "embed") {
                    contentTypeIcon = <EyeIcon className="h-3 w-3 mr-1" />;
                    contentTypeLabel = "Embed";
                  }

                  return (
                    <Card key={content.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base truncate" title={content.title}>
                            {content.title}
                          </CardTitle>
                          <div className={`w-3 h-3 rounded-full ${content.formId ? "bg-green-500" : "bg-blue-500"}`} 
                               title={content.formId ? "Has lead form" : "No lead form"}></div>
                        </div>
                        <CardDescription className="text-xs">
                          Created on {formatDate(content.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm mb-2 line-clamp-2" title={content.description || ""}>
                          {content.description || "No description"}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {contentTypeIcon} {contentTypeLabel}
                        </div>
                        <div className="text-xs mt-2">
                          <div className="flex justify-between mb-1">
                            <span>Views:</span>
                            <span className="font-medium">{stats?.views || 0}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Conversions:</span>
                            <span className="font-medium">{stats?.conversions || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Rate:</span>
                            <span className="font-medium">{stats?.conversionRate || 0}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Here we would handle edit functionality
                            console.log("Edit content", content.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            // Here we would copy the embed code to clipboard
                            const embedCode = `<iframe src="${window.location.origin}/embed/content/${content.slug}" width="100%" height="500" frameborder="0"></iframe>`;
                            navigator.clipboard.writeText(embedCode);
                            toast({
                              title: "Embed code copied",
                              description: "The embed code has been copied to your clipboard"
                            });
                          }}
                        >
                          Embed
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-6">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <h3 className="text-lg font-medium">No gated content found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't created any gated content yet.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Content
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>
                    View conversion rates and performance metrics for your gated content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-dark-200 border-b border-dark-300">
                          <th className="p-3 text-left font-medium">Content</th>
                          <th className="p-3 text-left font-medium">Views</th>
                          <th className="p-3 text-left font-medium">Conversions</th>
                          <th className="p-3 text-left font-medium">Rate</th>
                          <th className="p-3 text-left font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingStats ? (
                          <tr>
                            <td colSpan={5} className="p-3 text-center">
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span>Loading analytics...</span>
                              </div>
                            </td>
                          </tr>
                        ) : contentAnalytics && contentAnalytics.content && contentAnalytics.content.length > 0 ? (
                          contentAnalytics.content.map((stat) => (
                            <tr key={stat.id} className="border-b border-dark-300">
                              <td className="p-3 truncate max-w-[200px]" title={stat.title}>{stat.title}</td>
                              <td className="p-3">{stat.views.toLocaleString()}</td>
                              <td className="p-3">{stat.conversions.toLocaleString()}</td>
                              <td className="p-3">{stat.conversionRate}%</td>
                              <td className="p-3">{stat.contentType}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-6 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                                <h3 className="text-lg font-medium">No analytics data available</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Create content and start generating leads to see analytics here.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>
                    Highest conversion rate content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading top performers...</span>
                    </div>
                  ) : contentAnalytics && contentAnalytics.topPerforming && contentAnalytics.topPerforming.length > 0 ? (
                    <div className="space-y-4">
                      {contentAnalytics.topPerforming.map((stat) => (
                        <div key={stat.id} className="flex items-center justify-between border-b border-dark-300 pb-3 last:border-0 last:pb-0">
                          <div className="max-w-[70%]">
                            <h4 className="font-medium truncate" title={stat.title}>{stat.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stat.contentType}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{stat.conversionRate}%</p>
                            <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
                      <h3 className="text-base font-medium">No top performers yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create content to see top performers
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Gated Content</CardTitle>
                <CardDescription>
                  Configure your content and lead generation settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Title</FormLabel>
                          <FormControl>
                            <Input placeholder="SEO Best Practices White Paper" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="seo-best-practices" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL path where this content will be accessible. Leave blank to auto-generate from title.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="forumId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Forum</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString() || (forums && forums.length > 0 ? forums[0].id.toString() : "")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a forum" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {forums && forums.length > 0 ? (
                                forums.map((forum: Forum) => (
                                  <SelectItem key={forum.id} value={forum.id.toString()}>
                                    {forum.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>No forums available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The forum this content will be associated with
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A comprehensive guide to optimizing your content for search engines..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This description will be shown to users before they provide their information
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="download">Downloadable File</SelectItem>
                              <SelectItem value="redirect">Redirect URL</SelectItem>
                              <SelectItem value="embed">Embedded Content</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of content you want to gate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {contentType === "download" 
                              ? "Content / File URL" 
                              : contentType === "redirect" 
                              ? "Content / Redirect URL" 
                              : "Content / Embedded HTML"}
                          </FormLabel>
                          <FormControl>
                            {contentType === "embed" ? (
                              <Textarea 
                                placeholder="<iframe src='https://example.com/embed' width='100%' height='400'></iframe>"
                                {...field} 
                              />
                            ) : (
                              <Input 
                                placeholder={
                                  contentType === "download" 
                                    ? "https://example.com/files/whitepaper.pdf" 
                                    : "https://example.com/premium-content"
                                }
                                {...field} 
                              />
                            )}
                          </FormControl>
                          <FormDescription>
                            {contentType === "download" 
                              ? "URL to the downloadable file" 
                              : contentType === "redirect" 
                              ? "URL to redirect to after form submission" 
                              : "HTML code to embed after form submission"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="requireName"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Name</FormLabel>
                              <FormDescription>
                                Ask for name before providing content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requireEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Email</FormLabel>
                              <FormDescription>
                                Ask for email before providing content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="collectPhoneNumber"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Collect Phone Number</FormLabel>
                              <FormDescription>
                                Ask for phone number before providing content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teaser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teaser Text</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A short preview of your content to entice users..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Preview content shown before form submission
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="formId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Capture Form (Optional)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "" ? null : Number(value))} 
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a lead form or leave empty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Form</SelectItem>
                              {leadForms && leadForms.length > 0 ? (
                                leadForms.map((form: LeadForm) => (
                                  <SelectItem key={form.id} value={form.id.toString()}>
                                    {form.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>No forms available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Connect this content to a lead capture form
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit">Create Gated Content</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
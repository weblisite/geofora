import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, FileText, Edit, Eye, Lock, FileUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Interface for Forum object
interface Forum {
  id: number;
  name: string;
  slug: string;
}

// Interface for Lead Form object
interface LeadCaptureForm {
  id: number;
  name: string;
  forumId: number;
}

// Interface for Gated Content object
interface GatedContent {
  id: number;
  title: string;
  slug: string;
  teaser: string;
  content: string;
  description: string | null;
  forumId: number;
  formId: number | null;
  featuredImage: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  contentType: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form schema for gated content
const contentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  teaser: z.string().min(20, "Teaser must be at least 20 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  description: z.string().optional().nullable(),
  forumId: z.number(),
  formId: z.number().optional().nullable(),
  featuredImage: z.string().url("Must be a valid URL").optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  contentType: z.string().default("article")
});

type ContentFormValues = z.infer<typeof contentSchema>;

export default function GatedContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [currentContent, setCurrentContent] = useState<GatedContent | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  // Query for forums
  const { data: forums, isLoading: isLoadingForums } = useQuery({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/forums");
      return await res.json();
    },
    enabled: !!user,
  });

  // Query for lead forms in selected forum (for the dropdown)
  const { data: leadForms, isLoading: isLoadingLeadForms } = useQuery({
    queryKey: ["/api/forums", selectedForumId, "lead-forms"],
    queryFn: async () => {
      if (!selectedForumId) return [];
      const res = await apiRequest("GET", `/api/forums/${selectedForumId}/lead-forms`);
      return await res.json();
    },
    enabled: !!selectedForumId,
  });

  // Query for gated content based on selected forum
  const { data: gatedContents, isLoading: isLoadingGatedContents } = useQuery({
    queryKey: ["/api/forums", selectedForumId, "gated-content"],
    queryFn: async () => {
      if (!selectedForumId) return [];
      const res = await apiRequest("GET", `/api/forums/${selectedForumId}/gated-content`);
      return await res.json();
    },
    enabled: !!selectedForumId,
  });

  // Query for selected gated content details
  const { data: contentDetails, isLoading: isLoadingContentDetails } = useQuery({
    queryKey: ["/api/gated-content", selectedContentId],
    queryFn: async () => {
      if (!selectedContentId) return null;
      const res = await apiRequest("GET", `/api/gated-content/${selectedContentId}`);
      return await res.json();
    },
    enabled: !!selectedContentId && !!user,
  });

  // Create gated content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: ContentFormValues) => {
      const res = await apiRequest("POST", `/api/forums/${data.forumId}/gated-content`, data);
      return await res.json();
    },
    onSuccess: () => {
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Gated content created successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "gated-content"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create gated content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update gated content mutation
  const updateContentMutation = useMutation({
    mutationFn: async (data: ContentFormValues & { id: number }) => {
      const { id, ...contentData } = data;
      const res = await apiRequest("PUT", `/api/gated-content/${id}`, contentData);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Gated content updated successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "gated-content"] });
      }
      if (selectedContentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/gated-content", selectedContentId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update gated content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete gated content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/gated-content/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gated content deleted successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "gated-content"] });
      }
      setSelectedContentId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete gated content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create form handler
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      slug: "",
      teaser: "",
      content: "",
      description: "",
      forumId: selectedForumId || 0,
      formId: null,
      featuredImage: null,
      metaDescription: null,
      metaKeywords: null,
      contentType: "article"
    },
  });

  // Edit form handler
  const editForm = useForm<ContentFormValues & { id: number }>({
    resolver: zodResolver(contentSchema.extend({ id: z.number() })),
    defaultValues: {
      id: 0,
      title: "",
      slug: "",
      teaser: "",
      content: "",
      description: "",
      forumId: 0,
      formId: null,
      featuredImage: null,
      metaDescription: null,
      metaKeywords: null,
      contentType: "article"
    },
  });

  // Effect to update the form default values when a forum is selected
  useEffect(() => {
    if (selectedForumId) {
      form.setValue("forumId", selectedForumId);
    }
  }, [selectedForumId, form]);

  // Effect to generate a slug based on the title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title") {
        const slug = value.title
          ?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-");
        form.setValue("slug", slug || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Effect to populate edit form when a content is selected for editing
  useEffect(() => {
    if (currentContent) {
      editForm.reset({
        id: currentContent.id,
        title: currentContent.title,
        slug: currentContent.slug,
        teaser: currentContent.teaser,
        content: currentContent.content,
        description: currentContent.description,
        forumId: currentContent.forumId,
        formId: currentContent.formId,
        featuredImage: currentContent.featuredImage,
        metaDescription: currentContent.metaDescription,
        metaKeywords: currentContent.metaKeywords,
        contentType: currentContent.contentType || "article"
      });
    }
  }, [currentContent, editForm]);

  // Handler for creating new gated content
  const onSubmit = (values: ContentFormValues) => {
    createContentMutation.mutate(values);
  };

  // Handler for updating gated content
  const onUpdate = (values: ContentFormValues & { id: number }) => {
    updateContentMutation.mutate(values);
  };

  // Handler for deleting gated content
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      deleteContentMutation.mutate(id);
    }
  };

  // Handle content selection
  const handleContentSelect = (contentId: number) => {
    setSelectedContentId(contentId);
    setActiveTab("preview");
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please login to access this page.</div>;
  }

  return (
    <div className="flex min-h-screen bg-dark-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gated Content Management</h1>
          <p className="text-gray-400">Create and manage premium content gated behind lead forms</p>
        </div>

        <div className="flex mb-6">
          <div className="mr-4 w-64">
            <Select
              value={selectedForumId?.toString() || ""}
              onValueChange={(value) => setSelectedForumId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a forum" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingForums ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading forums...</span>
                  </div>
                ) : (
                  forums?.map((forum: Forum) => (
                    <SelectItem key={forum.id} value={forum.id.toString()}>
                      {forum.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedForumId}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Gated Content
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - list of gated contents */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Gated Content</CardTitle>
                <CardDescription>Select content to manage</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingGatedContents ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading content...</span>
                  </div>
                ) : gatedContents?.length > 0 ? (
                  <div className="space-y-2">
                    {gatedContents.map((content: GatedContent) => (
                      <div
                        key={content.id}
                        className={`p-3 rounded-lg cursor-pointer ${
                          selectedContentId === content.id
                            ? "bg-primary-500/10 border border-primary-500/30"
                            : "hover:bg-dark-200 border border-dark-300"
                        }`}
                        onClick={() => handleContentSelect(content.id)}
                      >
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {content.description || content.teaser.substring(0, 60) + "..."}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Lock className="h-3 w-3 mr-1" />
                          <span className="mr-2">Created {formatDate(content.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedForumId ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No gated content found</p>
                    <p className="text-sm mt-2">Create your first gated content to generate leads</p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Content
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Select a forum to view gated content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right content - content details */}
          <div className="col-span-9">
            {selectedContentId ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{contentDetails?.title}</CardTitle>
                      <CardDescription>{contentDetails?.description || "No description"}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentContent(contentDetails);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedContentId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="preview">Content Preview</TabsTrigger>
                      <TabsTrigger value="teaser">Teaser</TabsTrigger>
                      <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview">
                      {isLoadingContentDetails ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading content details...</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {contentDetails?.featuredImage && (
                            <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                              <img 
                                src={contentDetails.featuredImage} 
                                alt={contentDetails.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center mb-6">
                            <div className="bg-primary-500/20 text-primary-500 px-3 py-1 rounded-full text-xs font-medium mr-2">
                              {contentDetails?.contentType || "Article"}
                            </div>
                            {contentDetails?.formId && (
                              <div className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <Lock className="h-3 w-3 mr-1" />
                                <span>Lead Form #{contentDetails.formId}</span>
                              </div>
                            )}
                          </div>

                          <h2 className="text-2xl font-bold">{contentDetails?.title}</h2>
                          
                          <div className="prose prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: contentDetails?.content || "" }} />
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="teaser">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Teaser Content</h3>
                          <p className="text-gray-400 mb-4">
                            This is what users will see before they submit the lead form
                          </p>
                          <div className="bg-dark-200 rounded-lg p-6">
                            <p className="mb-4">{contentDetails?.teaser}</p>
                            
                            <div className="border border-dark-300 rounded-lg p-4 bg-dark-300/30">
                              <h4 className="text-base font-medium mb-2">
                                <Lock className="h-4 w-4 inline mr-1" />
                                Unlock Full Content
                              </h4>
                              <p className="text-sm text-gray-400 mb-2">
                                Fill out the form below to access the complete content
                              </p>
                              <Button size="sm" variant="default" disabled>
                                Fill Lead Form to Access
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="seo">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">SEO Settings</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Slug</h4>
                                <p className="bg-dark-200 p-2 rounded">/{contentDetails?.slug}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">Content Type</h4>
                                <p className="bg-dark-200 p-2 rounded">
                                  {contentDetails?.contentType || "Article"}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-1">Meta Description</h4>
                              <p className="bg-dark-200 p-2 rounded">
                                {contentDetails?.metaDescription || "No meta description set"}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-1">Meta Keywords</h4>
                              <p className="bg-dark-200 p-2 rounded">
                                {contentDetails?.metaKeywords || "No meta keywords set"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Lock className="h-16 w-16 text-gray-400 opacity-20 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select Gated Content</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Choose content from the list or create new gated content
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)} disabled={!selectedForumId}>
                    <Plus className="mr-2 h-4 w-4" /> Create Gated Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create content modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Gated Content</DialogTitle>
              <DialogDescription>
                Create premium content that requires a lead form submission to access
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter content title" {...field} />
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-friendly-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the title (auto-generated)
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
                          placeholder="Brief description of this content"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teaser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teaser Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Preview content that will be visible before form submission"
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        This content will be shown to users before they fill out the lead form
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
                      <FormLabel>Full Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full content that will be accessible after form submission"
                          {...field}
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormDescription>
                        The complete content that will be accessible after lead form submission
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Form</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lead form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No lead form (public content)</SelectItem>
                          {isLoadingLeadForms ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading forms...</span>
                            </div>
                          ) : (
                            leadForms?.map((form: LeadCaptureForm) => (
                              <SelectItem key={form.id} value={form.id.toString()}>
                                {form.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a lead form that users must complete to access this content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL of an image to display with this content
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="whitepaper">Whitepaper</SelectItem>
                          <SelectItem value="ebook">E-Book</SelectItem>
                          <SelectItem value="case-study">Case Study</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of content you're creating
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO meta description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A description for search engines (max 160 characters recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="keyword1, keyword2, keyword3"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords for SEO
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createContentMutation.isPending}>
                    {createContentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Content
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit content modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Gated Content</DialogTitle>
              <DialogDescription>Update your gated content settings</DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter content title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-friendly-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of this content"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="teaser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teaser Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Preview content that will be visible before form submission"
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        This content will be shown to users before they fill out the lead form
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Full content that will be accessible after form submission"
                          {...field}
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormDescription>
                        The complete content that will be accessible after lead form submission
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="formId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Form</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a lead form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No lead form (public content)</SelectItem>
                          {isLoadingLeadForms ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading forms...</span>
                            </div>
                          ) : (
                            leadForms?.map((form: LeadCaptureForm) => (
                              <SelectItem key={form.id} value={form.id.toString()}>
                                {form.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a lead form that users must complete to access this content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        URL of an image to display with this content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select
                        value={field.value || "article"}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="whitepaper">Whitepaper</SelectItem>
                          <SelectItem value="ebook">E-Book</SelectItem>
                          <SelectItem value="case-study">Case Study</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of content you're creating
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO meta description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A description for search engines (max 160 characters recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="keyword1, keyword2, keyword3"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords for SEO
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateContentMutation.isPending}>
                    {updateContentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Content
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
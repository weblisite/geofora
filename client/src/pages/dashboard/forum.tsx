import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Globe, Edit, Server, Type, Palette, Link, Shield, AlertCircle, ExternalLink } from "lucide-react";
import DomainVerification from "@/components/dashboard/domain-verification";
import ForumPreviewCard from "@/components/dashboard/forum-preview-card";
import IntegrationGuide from "@/components/dashboard/integration-guide";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Forum = {
  id: number;
  name: string;
  slug: string;
  description: string;
  subdomain?: string; 
  customDomain?: string;
  themeColor: string;
  primaryFont: string;
  secondaryFont: string;
  headingFontSize: string;
  bodyFontSize: string;
  mainWebsiteUrl?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  createdAt: string;
  totalQuestions: number;
  totalAnswers: number;
  isVerified?: boolean;
};

export default function ForumManagementPage() {
  const [activeTab, setActiveTab] = useState("forums");
  const [forumFormVisible, setForumFormVisible] = useState(false);
  const [domainFormVisible, setDomainFormVisible] = useState<number | null>(null);
  const [editForumId, setEditForumId] = useState<number | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [domainToVerify, setDomainToVerify] = useState<{forumId: number, domain: string} | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    themeColor: "#3B82F6",
    primaryFont: "Inter",
    secondaryFont: "Roboto",
    headingFontSize: "1.5rem",
    bodyFontSize: "1rem",
    mainWebsiteUrl: "",
    isPublic: true,
    requiresApproval: false
  });
  
  // Domain form state
  const [domainData, setDomainData] = useState({
    subdomain: "",
    customDomain: ""
  });

  // Fetch forums
  const { data: forums, isLoading } = useQuery<Forum[]>({
    queryKey: ["/api/forums"]
  });
  
  // Create forum mutation
  const createForumMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("/api/forums", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Forum created",
        description: "Your forum has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      setForumFormVisible(false);
      resetFormData();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create forum: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update forum mutation
  const updateForumMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: typeof formData }) => {
      const response = await apiRequest(`/api/forums/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Forum updated",
        description: "Your forum has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      setForumFormVisible(false);
      setEditForumId(null);
      resetFormData();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update forum: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete forum mutation
  const deleteForumMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/forums/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Forum deleted",
        description: "The forum has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete forum: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update domain mutation
  const updateDomainMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: typeof domainData }) => {
      const response = await apiRequest(`/api/forums/${id}/domain`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain updated",
        description: "The domain settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
      setDomainFormVisible(null);
      setDomainData({ subdomain: "", customDomain: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update domain: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox/switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle domain form input changes
  const handleDomainInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDomainData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      themeColor: "#3B82F6",
      primaryFont: "Inter",
      secondaryFont: "Roboto",
      headingFontSize: "1.5rem",
      bodyFontSize: "1rem",
      mainWebsiteUrl: "",
      isPublic: true,
      requiresApproval: false
    });
  };

  // Handle edit forum
  const handleEditForum = (forum: Forum) => {
    setEditForumId(forum.id);
    setFormData({
      name: forum.name,
      slug: forum.slug,
      description: forum.description,
      themeColor: forum.themeColor,
      primaryFont: forum.primaryFont || "Inter",
      secondaryFont: forum.secondaryFont || "Roboto",
      headingFontSize: forum.headingFontSize || "1.5rem",
      bodyFontSize: forum.bodyFontSize || "1rem",
      mainWebsiteUrl: forum.mainWebsiteUrl || "",
      isPublic: forum.isPublic,
      requiresApproval: forum.requiresApproval
    });
    setForumFormVisible(true);
  };

  // Handle edit domain
  const handleEditDomain = (forum: Forum) => {
    setDomainFormVisible(forum.id);
    setDomainData({
      subdomain: forum.subdomain || "",
      customDomain: forum.customDomain || ""
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editForumId) {
      updateForumMutation.mutate({ id: editForumId, data: formData });
    } else {
      createForumMutation.mutate(formData);
    }
  };
  
  // Handle domain form submission
  const handleDomainSubmit = (e: React.FormEvent, forumId: number) => {
    e.preventDefault();
    updateDomainMutation.mutate({ id: forumId, data: domainData });
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!formData.slug || editForumId === null) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  }, [formData.name, editForumId]);

  // Use only real data from the database
  const forumsToDisplay: Forum[] = forums || [];

  // Forum creation form component
  const ForumForm = () => (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form column - takes 2/3 of the space */}
        <Glassmorphism className="p-6 rounded-lg lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {editForumId ? "Edit Forum" : "Create New Forum"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Forum Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g. Tech Discussion" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input 
                id="slug" 
                name="slug" 
                value={formData.slug} 
                onChange={handleInputChange} 
                placeholder="tech-discussion"
                required 
              />
              <p className="text-xs text-gray-400">
                This will be used in your forum URL: yourdomain.com/forum/{formData.slug || 'slug'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Describe what your forum is about..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="themeColor">Theme Color</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="themeColor" 
                  name="themeColor" 
                  type="color" 
                  value={formData.themeColor} 
                  onChange={handleInputChange} 
                  className="w-12 h-12 p-1 cursor-pointer"
                />
                <Input 
                  value={formData.themeColor} 
                  onChange={handleInputChange} 
                  name="themeColor"
                  className="w-32"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium pt-4 pb-1">Branding & Typography</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryFont">Primary Font</Label>
                <Input 
                  id="primaryFont" 
                  name="primaryFont" 
                  value={formData.primaryFont} 
                  onChange={handleInputChange} 
                  placeholder="Inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryFont">Secondary Font</Label>
                <Input 
                  id="secondaryFont" 
                  name="secondaryFont" 
                  value={formData.secondaryFont} 
                  onChange={handleInputChange} 
                  placeholder="Roboto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headingFontSize">Heading Font Size</Label>
                <Input 
                  id="headingFontSize" 
                  name="headingFontSize" 
                  value={formData.headingFontSize} 
                  onChange={handleInputChange} 
                  placeholder="1.5rem"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bodyFontSize">Body Font Size</Label>
                <Input 
                  id="bodyFontSize" 
                  name="bodyFontSize" 
                  value={formData.bodyFontSize} 
                  onChange={handleInputChange} 
                  placeholder="1rem"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mainWebsiteUrl">Main Website URL (for keyword scraping)</Label>
              <Input 
                id="mainWebsiteUrl" 
                name="mainWebsiteUrl" 
                value={formData.mainWebsiteUrl} 
                onChange={handleInputChange} 
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-400">
                We'll analyze your main website to generate relevant forum content and SEO optimizations
              </p>
            </div>
            
            <h3 className="text-lg font-medium pt-4 pb-1">Forum Settings</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isPublic" 
                  checked={formData.isPublic} 
                  onCheckedChange={(checked) => handleSwitchChange('isPublic', checked)} 
                />
                <Label htmlFor="isPublic">Public Forum</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="requiresApproval" 
                  checked={formData.requiresApproval} 
                  onCheckedChange={(checked) => handleSwitchChange('requiresApproval', checked)} 
                />
                <Label htmlFor="requiresApproval">Require Post Approval</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setForumFormVisible(false);
                  setEditForumId(null);
                  resetFormData();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createForumMutation.isPending || updateForumMutation.isPending}>
                {createForumMutation.isPending || updateForumMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    {editForumId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editForumId ? "Update Forum" : "Create Forum"
                )}
              </Button>
            </div>
          </form>
        </Glassmorphism>

        {/* Preview column - takes 1/3 of the space */}
        <div className="lg:col-span-1 h-fit sticky top-6">
          <ForumPreviewCard
            themeColor={formData.themeColor}
            primaryFont={formData.primaryFont}
            secondaryFont={formData.secondaryFont}
            headingFontSize={formData.headingFontSize}
            bodyFontSize={formData.bodyFontSize}
            forumName={formData.name || "Your Forum"}
          />
        </div>
      </div>
    </div>
  );

  // Domain settings form component
  const DomainForm = ({ forum }: { forum: Forum }) => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium mb-2">Domain & Integration Settings</h3>
      <p className="text-sm text-gray-400 mb-4">
        Configure how users will access your forum and how it integrates with your main website
      </p>
      
      {/* Integration guide component */}
      <IntegrationGuide 
        forumSlug={forum.slug}
        forumSubdomain={domainData.subdomain || forum.subdomain} 
        customDomain={domainData.customDomain || forum.customDomain}
      />
      
      <form onSubmit={(e) => handleDomainSubmit(e, forum.id)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="subdomain" className="flex items-center">
            <span className="mr-2">Subdomain</span>
            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">Recommended</span>
          </Label>
          <div className="flex items-center">
            <Input 
              id="subdomain" 
              name="subdomain" 
              value={domainData.subdomain} 
              onChange={handleDomainInputChange} 
              placeholder="mysubdomain" 
              className="rounded-r-none border-r-0"
            />
            <div className="bg-dark-400 text-gray-300 px-3 py-2 rounded-r-md border border-dark-400">
              .formai.repl.app
            </div>
          </div>
          <p className="text-xs text-gray-400">
            A subdomain gives your forum its own space while keeping your brand identity
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customDomain" className="flex items-center">
            <span className="mr-2">Custom Domain</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 rounded-full">Professional</span>
          </Label>
          <Input 
            id="customDomain" 
            name="customDomain" 
            value={domainData.customDomain} 
            onChange={handleDomainInputChange} 
            placeholder="forum.mydomain.com" 
          />
          <p className="text-xs text-gray-400">
            For complete branding control, use your own domain. You'll need to verify ownership via DNS.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-3 rounded-md my-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Subdirectory Integration
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Want to host the forum under a subdirectory like <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/forum/{forum.slug}</code>? See the integration guide above for proxy configuration instructions.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setDomainFormVisible(null)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateDomainMutation.isPending}
          >
            {updateDomainMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Updating...
              </>
            ) : 'Save Domain Settings'}
          </Button>
        </div>
      </form>
    </div>
  );

  // Function to handle domain verification
  const handleVerifyDomain = (forumId: number, customDomain: string) => {
    if (!customDomain) return;
    
    setDomainToVerify({
      forumId,
      domain: customDomain
    });
    setVerificationDialogOpen(true);
  };
  
  // Function to handle verification completion
  const handleVerificationComplete = () => {
    setVerificationDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/forums"] });
    toast({
      title: "Domain verification started",
      description: "The verification process has been initiated. It may take a few minutes to complete.",
    });
  };
  
  // Forum card component
  const ForumCard = ({ forum }: { forum: Forum }) => (
    <Glassmorphism key={forum.id} className="rounded-lg overflow-hidden">
      {domainFormVisible === forum.id ? (
        <DomainForm forum={forum} />
      ) : (
        <>
          <div className="p-6 border-b border-dark-300">
            <div className="flex justify-between">
              <h3 className="text-xl font-medium mb-1">{forum.name}</h3>
              <Badge variant={forum.isPublic ? "default" : "secondary"}>
                {forum.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="text-gray-400 mb-4">{forum.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 opacity-60" />
                <span>{forum.primaryFont || "Inter"}</span>
                <span className="mx-1">/</span>
                <span>{forum.secondaryFont || "Roboto"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 opacity-60" />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: forum.themeColor }}></div>
                <span>{forum.themeColor}</span>
              </div>
              {forum.mainWebsiteUrl && (
                <div className="flex items-center gap-2 col-span-2">
                  <Link className="w-4 h-4 opacity-60" />
                  <span className="truncate">{forum.mainWebsiteUrl}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Server className="w-3 h-3" />
                {forum.slug}
              </Badge>
              
              {forum.subdomain && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {forum.subdomain}.formai.repl.app
                </Badge>
              )}
              
              {forum.customDomain && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center gap-1 cursor-pointer" 
                        onClick={() => handleVerifyDomain(forum.id, forum.customDomain || '')}>
                        <Globe className="w-3 h-3" />
                        {forum.customDomain}
                        {!forum.isVerified && <AlertCircle className="w-3 h-3 ml-1 text-amber-500" />}
                        {forum.isVerified && <Shield className="w-3 h-3 ml-1 text-green-500" />}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {forum.isVerified 
                        ? "Verified domain - Click to manage DNS settings" 
                        : "Unverified domain - Click to verify ownership"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold">{forum.totalQuestions}</p>
                <p className="text-xs text-gray-400">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{forum.totalAnswers}</p>
                <p className="text-xs text-gray-400">Answers</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditDomain(forum)}
                className="flex items-center"
              >
                <Globe className="w-4 h-4 mr-1" />
                Domains
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditForum(forum)}
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${forum.name}"? This action cannot be undone.`)) {
                    deleteForumMutation.mutate(forum.id);
                  }
                }}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </Glassmorphism>
  );

  // Global settings component
  const GlobalSettings = () => (
    <Glassmorphism className="p-6 rounded-lg max-w-4xl">
      <h2 className="text-xl font-semibold mb-6">Global Forum Settings</h2>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>Control how users can register on your forums</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowRegistration">Allow User Registration</Label>
                  <p className="text-sm text-gray-400">Enable or disable new user registrations</p>
                </div>
                <Switch id="allowRegistration" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailVerification">Require Email Verification</Label>
                  <p className="text-sm text-gray-400">Users must verify their email to post</p>
                </div>
                <Switch id="emailVerification" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Manage how content is moderated across forums</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="aiModeration">AI Moderation</Label>
                  <p className="text-sm text-gray-400">Use AI to flag inappropriate content</p>
                </div>
                <Switch id="aiModeration" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="moderatorApproval">Moderator Approval</Label>
                  <p className="text-sm text-gray-400">Require moderators to approve posts</p>
                </div>
                <Switch id="moderatorApproval" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Configure SEO settings for your forums</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seoMetaDesc">Default Meta Description</Label>
                <Textarea 
                  id="seoMetaDesc" 
                  placeholder="Enter a default meta description for your forums..." 
                  className="h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Default Keywords</Label>
                <Textarea 
                  id="seoKeywords" 
                  placeholder="Enter comma-separated keywords for your forums..." 
                  className="h-20"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="structuredData">Enable Structured Data</Label>
                <p className="text-sm text-gray-400">Add schema markup for better SEO</p>
              </div>
              <Switch id="structuredData" defaultChecked />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </Glassmorphism>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forum Management</h1>
        
        <div className="flex items-center gap-4">
          {activeTab === "forums" && !forumFormVisible && (
            <Button onClick={() => setForumFormVisible(true)} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Forum
            </Button>
          )}
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="forums">My Forums</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="forums" className="space-y-6">
          {forumFormVisible ? (
            <ForumForm />
          ) : (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary-500 rounded-full"></div>
                </div>
              ) : forumsToDisplay.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-3">No forums yet</h3>
                  <p className="text-gray-400 mb-6">Create your first forum to get started</p>
                  <Button onClick={() => setForumFormVisible(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Forum
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {forumsToDisplay.map(forum => (
                    <ForumCard key={forum.id} forum={forum} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <GlobalSettings />
        </TabsContent>
      </Tabs>
      
      {/* Domain Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Domain Ownership</DialogTitle>
            <DialogDescription>
              To verify ownership of your domain, you'll need to add a DNS TXT record.
            </DialogDescription>
          </DialogHeader>
          {domainToVerify && (
            <DomainVerification 
              forumId={domainToVerify.forumId}
              domain={domainToVerify.domain}
              onVerificationComplete={handleVerificationComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
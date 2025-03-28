import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { 
  Globe, 
  Copy, 
  Check, 
  Code, 
  FileCode, 
  FileJson, 
  LoaderCircle,
  LockKeyhole,
  Webhook,
  History,
  FileText,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const webScriptSchema = z.object({
  domain: z.string().url("Please enter a valid URL"),
  selector: z.string().optional(),
  style: z.string().optional(),
  autoEmbed: z.boolean().default(true),
  position: z.enum(["top", "bottom", "left", "right", "overlay"]),
  active: z.boolean().default(true),
});

export default function Integration() {
  const { user } = useClerk();
  const [activeTab, setActiveTab] = useState("embed");
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});
  
  // Force scroll back to top when component mounts to prevent scroll issues
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Fetch integration statistics
  const { data: integrationStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/integration/stats"],
    enabled: !!user,
  });

  // Fetch webhook events
  const { data: webhookEvents, isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ["/api/integration/webhooks"],
    enabled: !!user,
  });
  
  // Fetch webhook event types
  const { data: webhookEventTypes = [], isLoading: isLoadingEventTypes } = useQuery({
    queryKey: ["/api/integration/event-types"],
    enabled: !!user,
  });

  // Create form with validation
  const form = useForm<z.infer<typeof webScriptSchema>>({
    resolver: zodResolver(webScriptSchema),
    defaultValues: {
      domain: "",
      selector: "",
      style: "",
      autoEmbed: true,
      position: "bottom",
      active: true,
    },
  });

  const onSubmit = (values: z.infer<typeof webScriptSchema>) => {
    console.log(values);
    // Here we would save the integration settings
  };

  // Function to handle copy to clipboard
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState({ ...copiedState, [key]: true });
    setTimeout(() => {
      setCopiedState({ ...copiedState, [key]: false });
    }, 2000);
  };

  // Sample embed code
  const sampleEmbedCode = `<script type="text/javascript">
  (function() {
    var fm = document.createElement('script');
    fm.type = 'text/javascript';
    fm.async = true;
    fm.src = 'https://forumAI.com/embed.js?id=12345';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(fm, s);
  })();
</script>`;

  // Sample API code
  const sampleApiCode = `fetch('https://forumAI.com/api/v1/questions', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;

  // Sample JSON response
  const sampleJsonResponse = `{
  "questions": [
    {
      "id": 1,
      "title": "How to optimize content for SEO?",
      "content": "I'm trying to improve my website's search ranking...",
      "user": {
        "id": 123,
        "username": "seo_expert"
      },
      "createdAt": "2023-07-15T14:23:45Z",
      "answers": 5,
      "views": 238
    },
    {
      "id": 2,
      "title": "Best practices for internal linking?",
      "content": "I'm wondering what the current best practices are...",
      "user": {
        "id": 456,
        "username": "content_creator"
      },
      "createdAt": "2023-07-14T09:12:33Z",
      "answers": 3,
      "views": 142
    }
  ],
  "pagination": {
    "total": 245,
    "page": 1,
    "perPage": 10
  }
}`;

  // Webhook event types are fetched from the API

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Integration</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sticky top-0 z-10 bg-[#0c0f1a]">
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="embed" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Embed Your Forum</CardTitle>
                    <CardDescription>
                      Add your ForumAI forum to any website with a simple script
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <div className="bg-dark-200 p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <pre>{sampleEmbedCode}</pre>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="absolute top-3 right-3" 
                        onClick={() => copyToClipboard(sampleEmbedCode, 'embed')}
                      >
                        {copiedState['embed'] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <Alert>
                      <FileCode className="h-4 w-4" />
                      <AlertTitle>Installation</AlertTitle>
                      <AlertDescription>
                        Add this script to your website's HTML just before the closing <code>&lt;/body&gt;</code> tag. 
                        The forum will automatically appear based on your configuration settings.
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertTitle>Domain Verification</AlertTitle>
                      <AlertDescription>
                        Your embed script will only work on domains you've verified in your settings.
                        Current verified domains: <Badge className="ml-1">yourdomain.com</Badge>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Embed Configuration</CardTitle>
                    <CardDescription>
                      Customize how your forum is embedded on your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="domain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Domain</FormLabel>
                              <FormControl>
                                <Input placeholder="https://yourdomain.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                The website domain where the forum will be embedded
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="selector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Selector (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="#forum-container or .forum-section" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormDescription>
                                  CSS selector where the forum should be injected
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="top">Top of Page</SelectItem>
                                    <SelectItem value="bottom">Bottom of Page</SelectItem>
                                    <SelectItem value="left">Left Sidebar</SelectItem>
                                    <SelectItem value="right">Right Sidebar</SelectItem>
                                    <SelectItem value="overlay">Overlay/Modal</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Where the forum should appear on the page
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom CSS (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder=".forum-container { max-height: 800px; }" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Add custom CSS to style the embedded forum
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <FormField
                            control={form.control}
                            name="autoEmbed"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Auto Embed</FormLabel>
                                  <FormDescription>
                                    Automatically embed forum on page load
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
                            name="active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Active Status</FormLabel>
                                  <FormDescription>
                                    Enable or disable this embed
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
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button type="submit">Save Configuration</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>How your embedded forum will look</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-dark-200 rounded-md flex items-center justify-center text-center p-4">
                      <div>
                        <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Your forum preview would appear here</p>
                        <p className="text-xs text-muted-foreground mt-1">Based on your current configuration</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Generate Preview</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Integration Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : !integrationStats ? (
                      <div className="text-center py-2 text-muted-foreground">
                        <p className="text-sm">No integration data available</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Embedded Views</span>
                          <span className="text-sm font-medium">{integrationStats.embeddedViews?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Engagement Rate</span>
                          <span className="text-sm font-medium">{integrationStats.engagementRate || '0'}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg. Time on Forum</span>
                          <span className="text-sm font-medium">{integrationStats.avgTimeOnForum || '0:00'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Questions via Embed</span>
                          <span className="text-sm font-medium">{integrationStats.questionsViaEmbed?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      API Documentation
                    </CardTitle>
                    <CardDescription>
                      Use our API to integrate ForumAI data into your applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        To use the ForumAI API, you need to include your API key in the Authorization header:
                      </p>
                      <div className="bg-dark-200 p-3 rounded-md font-mono text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Base URL</h3>
                      <div className="flex items-center">
                        <div className="bg-dark-200 p-3 rounded-md font-mono text-sm flex-grow mr-2">
                          https://forumAI.com/api/v1
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => copyToClipboard("https://forumAI.com/api/v1", 'baseUrl')}
                        >
                          {copiedState['baseUrl'] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Example Request</h3>
                      <div className="relative">
                        <div className="bg-dark-200 p-4 rounded-md font-mono text-sm overflow-x-auto">
                          <pre>{sampleApiCode}</pre>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-3 right-3" 
                          onClick={() => copyToClipboard(sampleApiCode, 'apiCode')}
                        >
                          {copiedState['apiCode'] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Example Response</h3>
                      <div className="relative">
                        <div className="bg-dark-200 p-4 rounded-md font-mono text-sm overflow-x-auto">
                          <pre>{sampleJsonResponse}</pre>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-3 right-3" 
                          onClick={() => copyToClipboard(sampleJsonResponse, 'jsonResponse')}
                        >
                          {copiedState['jsonResponse'] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <FileJson className="h-4 w-4" />
                      <AlertTitle>API Rate Limits</AlertTitle>
                      <AlertDescription>
                        Your current plan allows 1,000 requests per day and up to 60 requests per minute.
                        API usage statistics are available in your dashboard.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-center">
                      <Button>
                        View Full API Documentation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LockKeyhole className="h-5 w-5 mr-2" />
                      API Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-primary/20 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Production Key</h3>
                        <Badge>Active</Badge>
                      </div>
                      <div className="flex items-center">
                        <Input 
                          type="password"
                          value="••••••••••••••••••••••••••••••"
                          readOnly
                          className="font-mono text-sm mr-2 bg-dark-200"
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => copyToClipboard("YOUR_ACTUAL_API_KEY_WOULD_BE_HERE", 'apiKey')}
                        >
                          {copiedState['apiKey'] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: July 15, 2023 • Last used: Today
                      </p>
                    </div>

                    <div>
                      <Button variant="outline" className="w-full">
                        Generate New API Key
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ⚠️ This will invalidate your current key
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">API Usage</h3>
                      {isLoadingStats ? (
                        <>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-2.5 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </>
                      ) : !integrationStats?.apiCalls ? (
                        <div className="text-center py-2 text-muted-foreground">
                          <p className="text-sm">No API usage data available</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Today:</span>
                            <span>{integrationStats.apiCalls.daily || 0} / {integrationStats.apiLimits?.daily || 1000} requests</span>
                          </div>
                          <div className="w-full bg-dark-300 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ 
                                width: `${Math.min(((integrationStats.apiCalls.daily || 0) / (integrationStats.apiLimits?.daily || 1000)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Resets daily at midnight UTC
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 hover:bg-dark-200 rounded-md cursor-pointer">
                        <div className="font-medium">GET /questions</div>
                        <div className="text-xs text-muted-foreground">
                          List all questions with pagination
                        </div>
                      </div>
                      <div className="p-2 hover:bg-dark-200 rounded-md cursor-pointer">
                        <div className="font-medium">GET /questions/:id</div>
                        <div className="text-xs text-muted-foreground">
                          Get a single question by ID
                        </div>
                      </div>
                      <div className="p-2 hover:bg-dark-200 rounded-md cursor-pointer">
                        <div className="font-medium">POST /questions</div>
                        <div className="text-xs text-muted-foreground">
                          Create a new question
                        </div>
                      </div>
                      <div className="p-2 hover:bg-dark-200 rounded-md cursor-pointer">
                        <div className="font-medium">GET /answers</div>
                        <div className="text-xs text-muted-foreground">
                          List all answers with pagination
                        </div>
                      </div>
                      <div className="p-2 hover:bg-dark-200 rounded-md cursor-pointer">
                        <div className="font-medium">POST /answers</div>
                        <div className="text-xs text-muted-foreground">
                          Create a new answer
                        </div>
                      </div>
                      <Button variant="link" className="text-sm p-0 h-auto w-full text-right">
                        View all 14 endpoints
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Webhook className="h-5 w-5 mr-2" />
                      Webhooks
                    </CardTitle>
                    <CardDescription>
                      Configure webhooks to receive real-time notifications when events occur in your forum
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertTitle>How Webhooks Work</AlertTitle>
                      <AlertDescription>
                        Webhooks allow your application to receive real-time notifications when events occur in your forum.
                        When an event happens, we'll send a POST request to the URL you provide with details about the event.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label>Webhook URL</Label>
                        <div className="flex">
                          <Input
                            placeholder="https://your-server.com/webhook"
                            className="rounded-r-none"
                          />
                          <Button className="rounded-l-none">Save URL</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          The URL where webhook events will be sent
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <div className="flex">
                          <Input
                            type="password"
                            value="••••••••••••••••••••••••••••••"
                            readOnly
                            className="font-mono text-sm rounded-r-none bg-dark-200"
                          />
                          <Button 
                            variant="outline" 
                            className="rounded-l-none"
                            onClick={() => copyToClipboard("YOUR_WEBHOOK_SECRET_KEY_WOULD_BE_HERE", 'webhookSecret')}
                          >
                            {copiedState['webhookSecret'] ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use this secret to verify webhook requests are from ForumAI
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Webhook Events</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select the events you want to receive webhook notifications for:
                      </p>
                      <div className="space-y-3">
                        {webhookEventTypes.map((event) => (
                          <div key={event.id} className="flex items-center space-x-2">
                            <Switch id={event.id} />
                            <div>
                              <Label htmlFor={event.id} className="font-medium">{event.name}</Label>
                              <p className="text-xs text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertTitle>Test Your Webhook</AlertTitle>
                      <AlertDescription className="flex justify-between items-center">
                        <span>Send a test event to your webhook URL to verify it's working correctly.</span>
                        <Button size="sm">Send Test</Button>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Webhook Events</CardTitle>
                    <CardDescription>
                      Recent events sent to your webhook endpoint
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-dark-200 border-b border-dark-300">
                            <th className="p-3 text-left font-medium">Time</th>
                            <th className="p-3 text-left font-medium">Event Type</th>
                            <th className="p-3 text-left font-medium">Status</th>
                            <th className="p-3 text-left font-medium">Response</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingWebhooks ? (
                            <tr>
                              <td colSpan={4} className="p-3 text-center">Loading webhook events...</td>
                            </tr>
                          ) : (
                            Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i} className="border-b border-dark-300">
                                <td className="p-3 text-sm">
                                  {new Date(Date.now() - i * 1800000).toLocaleTimeString()}
                                </td>
                                <td className="p-3">
                                  {webhookEventTypes[i % webhookEventTypes.length].name}
                                </td>
                                <td className="p-3">
                                  <Badge variant={i % 4 !== 0 ? "default" : "destructive"}>
                                    {i % 4 !== 0 ? "Success" : "Failed"}
                                  </Badge>
                                </td>
                                <td className="p-3 text-sm">
                                  {i % 4 !== 0 ? "200 OK" : "Timeout"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <History className="mr-2 h-4 w-4" />
                      View Full Event History
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Example Webhook Payload</CardTitle>
                    <CardDescription>
                      This is an example of the data we'll send to your webhook URL
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-dark-200 p-4 rounded-md font-mono text-sm overflow-x-auto h-[400px] overflow-y-auto">
                      <pre>{JSON.stringify({
                        id: "evt_123456789",
                        type: "question.created",
                        created: new Date().toISOString(),
                        data: {
                          question: {
                            id: 123,
                            title: "How to implement webhooks?",
                            content: "I'm trying to set up webhook integration...",
                            userId: 456,
                            createdAt: new Date().toISOString(),
                            tags: ["integration", "webhook", "api"]
                          }
                        }
                      }, null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Webhook Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Verifying Webhooks</h3>
                      <p className="text-sm text-muted-foreground">
                        Each webhook request includes a signature in the <code>X-ForumAI-Signature</code> header.
                        You should verify this signature to ensure the request is from ForumAI.
                      </p>
                    </div>

                    <div className="bg-dark-200 p-3 rounded-md font-mono text-sm">
                      <pre>{`// Node.js example
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}`}</pre>
                    </div>

                    <Alert variant="destructive">
                      <AlertTitle>Security Note</AlertTitle>
                      <AlertDescription>
                        Never expose your webhook secret. Verify all incoming webhook requests before processing them.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Domain Verification</CardTitle>
                  <CardDescription>
                    Verify ownership of domains to use with ForumAI embeds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input placeholder="example.com" />
                    <Button>Verify</Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Verified Domains</h3>
                    <div className="rounded-md border">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          <span>yourdomain.com</span>
                        </div>
                        <Badge>Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          <span>blog.yourdomain.com</span>
                        </div>
                        <Badge>Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          <span>app.yourdomain.com</span>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTitle>How to Verify</AlertTitle>
                    <AlertDescription>
                      Add a DNS TXT record or upload a verification file to your domain to prove ownership.
                      <Button variant="link" className="p-0 h-auto text-sm">View instructions</Button>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CORS Settings</CardTitle>
                  <CardDescription>
                    Configure Cross-Origin Resource Sharing for API requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Allowed Origins</Label>
                    <Textarea 
                      placeholder="https://example.com
https://app.example.com"
                      className="font-mono text-sm"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter one origin per line. Use * for wildcard (not recommended for production).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Allowed Methods</Label>
                      <div className="space-y-1">
                        {["GET", "POST", "PUT", "DELETE", "PATCH"].map(method => (
                          <div key={method} className="flex items-center space-x-2">
                            <Checkbox id={`method-${method}`} defaultChecked={method !== "PATCH"} />
                            <label htmlFor={`method-${method}`} className="text-sm">{method}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Allow Credentials</Label>
                      <div className="flex items-center space-x-2">
                        <Switch id="allow-credentials" />
                        <Label htmlFor="allow-credentials">Enable cookies in CORS requests</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Only enable if your application needs to include credentials
                      </p>
                    </div>
                  </div>

                  <Button className="w-full">Save CORS Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Scripts</CardTitle>
                  <CardDescription>
                    Add custom JavaScript to your embedded forum
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Custom JavaScript</Label>
                    <Textarea 
                      placeholder="// Your custom JavaScript here
document.addEventListener('DOMContentLoaded', function() {
  console.log('Forum loaded!');
});"
                      className="font-mono text-sm"
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      This script will be executed when your forum loads in the embedded context
                    </p>
                  </div>

                  <Alert>
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                      Custom scripts have full access to the forum DOM. Use with caution and avoid including sensitive information.
                    </AlertDescription>
                  </Alert>

                  <Button className="w-full">Save Custom Script</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Additional configuration options for your integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Custom Domain</h3>
                        <p className="text-sm text-muted-foreground">
                          Use your own domain for forum embeds
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Single Sign-On</h3>
                        <p className="text-sm text-muted-foreground">
                          Enable SSO for embedded forums
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Content Security Policy</h3>
                        <p className="text-sm text-muted-foreground">
                          Strict CSP for enhanced security
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Rate Limiting</h3>
                        <p className="text-sm text-muted-foreground">
                          Custom rate limits for API endpoints
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Button className="w-full">Save Advanced Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// The Label and Checkbox components are now imported from @/components/ui/label and @/components/ui/checkbox

// The Select, SelectContent, SelectItem, SelectTrigger, and SelectValue components
// are now imported from @/components/ui/select
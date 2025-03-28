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
import { useQuery } from "@tanstack/react-query";
import { FileIcon, PlusCircle, LinkIcon, DownloadIcon, EyeIcon, GitBranchIcon } from "lucide-react";

const contentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contentType: z.enum(["download", "redirect", "embed"]),
  contentValue: z.string().min(1, "Content is required"),
  requireEmail: z.boolean().default(true),
  requireName: z.boolean().default(true),
  collectPhoneNumber: z.boolean().default(false),
  requiredLeadForm: z.string().optional(),
  active: z.boolean().default(true),
});

export default function GatedContent() {
  const { user } = useClerk();
  const [activeTab, setActiveTab] = useState("content");
  
  // Sample data for demonstration
  const { data: gatedContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ["/api/gated-content"],
    enabled: !!user,
  });

  const { data: contentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/gated-content/stats"],
    enabled: !!user,
  });

  const { data: leadForms, isLoading: isLoadingForms } = useQuery({
    queryKey: ["/api/lead-forms"],
    enabled: !!user,
  });

  // Create form with validation
  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "download",
      contentValue: "",
      requireEmail: true,
      requireName: true,
      collectPhoneNumber: false,
      active: true,
    },
  });

  const contentType = form.watch("contentType");

  const onSubmit = (values: z.infer<typeof contentSchema>) => {
    console.log(values);
    // Here we would save the gated content to the database
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
                <p>Loading content...</p>
              ) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">SEO White Paper {i + 1}</CardTitle>
                        <div className={`w-3 h-3 rounded-full ${i % 3 === 0 ? "bg-green-500" : "bg-blue-500"}`}></div>
                      </div>
                      <CardDescription className="text-xs">Created on {new Date().toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm mb-2">
                        A comprehensive guide to optimizing your content for search engines and driving organic traffic.
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {i % 3 === 0 ? (
                          <><DownloadIcon className="h-3 w-3 mr-1" /> Download</>
                        ) : i % 3 === 1 ? (
                          <><LinkIcon className="h-3 w-3 mr-1" /> Redirect</>
                        ) : (
                          <><EyeIcon className="h-3 w-3 mr-1" /> Embed</>
                        )}
                      </div>
                      <div className="text-xs mt-2">
                        <div className="flex justify-between mb-1">
                          <span>Views:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 1000)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Conversions:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 500)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 100)}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="default" size="sm">Embed</Button>
                    </CardFooter>
                  </Card>
                ))
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
                            <td colSpan={5} className="p-3 text-center">Loading analytics...</td>
                          </tr>
                        ) : (
                          Array.from({ length: 10 }).map((_, i) => (
                            <tr key={i} className="border-b border-dark-300">
                              <td className="p-3">SEO White Paper {i + 1}</td>
                              <td className="p-3">{Math.floor(Math.random() * 1000)}</td>
                              <td className="p-3">{Math.floor(Math.random() * 500)}</td>
                              <td className="p-3">{Math.floor(Math.random() * 100)}%</td>
                              <td className="p-3">
                                {i % 3 === 0 ? "Download" : i % 3 === 1 ? "Redirect" : "Embed"}
                              </td>
                            </tr>
                          ))
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
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-dark-300 pb-3 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-medium">SEO White Paper {i + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            {i % 3 === 0 ? "Download" : i % 3 === 1 ? "Redirect" : "Embed"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Math.floor(Math.random() * 100)}%</p>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      name="contentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {contentType === "download" 
                              ? "File URL" 
                              : contentType === "redirect" 
                              ? "Redirect URL" 
                              : "Embedded Content HTML"}
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
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Status</FormLabel>
                              <FormDescription>
                                Enable or disable this content
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

                    <FormField
                      control={form.control}
                      name="requiredLeadForm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Use Existing Lead Form (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a lead form or leave empty to create new" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Create New Form</SelectItem>
                              <SelectItem value="form1">Newsletter Signup</SelectItem>
                              <SelectItem value="form2">Product Demo Request</SelectItem>
                              <SelectItem value="form3">Contact Form</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            You can use an existing lead form instead of creating new fields
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
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  emailRequired: z.boolean().default(true),
  nameRequired: z.boolean().default(true),
  phoneRequired: z.boolean().default(false),
  companyRequired: z.boolean().default(false),
  thankYouMessage: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export default function LeadCapture() {
  const { user } = useClerk();
  const [activeTab, setActiveTab] = useState("forms");
  
  // Sample data for demonstration
  const { data: leadForms, isLoading: isLoadingForms } = useQuery({
    queryKey: ["/api/lead-forms"],
    enabled: !!user,
  });

  const { data: leads, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["/api/leads"],
    enabled: !!user,
  });

  // Create form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      emailRequired: true,
      nameRequired: true,
      phoneRequired: false,
      companyRequired: false,
      thankYouMessage: "Thank you for your submission!",
      redirectUrl: "",
      active: true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Here we would save the form to the database
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lead Capture</h1>
          <Button onClick={() => setActiveTab("create")}>Create New Form</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forms">Lead Forms</TabsTrigger>
            <TabsTrigger value="leads">Captured Leads</TabsTrigger>
            <TabsTrigger value="create">Create Form</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingForms ? (
                <p>Loading forms...</p>
              ) : (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Newsletter Signup</CardTitle>
                        <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? "bg-green-500" : "bg-red-500"}`}></div>
                      </div>
                      <CardDescription>Created on {new Date().toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Submissions:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 100)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Conversion Rate:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 100)}%</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Fields:</span>
                          <span className="font-medium">Email, Name{i % 2 === 0 ? ", Phone" : ""}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="default" size="sm">Embed</Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Captured Leads</CardTitle>
                <CardDescription>
                  View and export leads captured from your forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-200 border-b border-dark-300">
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Form</th>
                        <th className="p-3 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingLeads ? (
                        <tr>
                          <td colSpan={4} className="p-3 text-center">Loading leads...</td>
                        </tr>
                      ) : (
                        Array.from({ length: 10 }).map((_, i) => (
                          <tr key={i} className="border-b border-dark-300">
                            <td className="p-3">John Doe {i + 1}</td>
                            <td className="p-3">john.doe{i + 1}@example.com</td>
                            <td className="p-3">Newsletter Signup</td>
                            <td className="p-3">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export CSV</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <span className="text-sm">Page 1 of 5</span>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Lead Capture Form</CardTitle>
                <CardDescription>
                  Configure the fields and settings for your lead capture form
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
                          <FormLabel>Form Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Newsletter Signup" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be displayed as the title of your form
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
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Subscribe to our newsletter for the latest updates"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nameRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Name Field</FormLabel>
                              <FormDescription>
                                Require name on the form
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
                        name="emailRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Field</FormLabel>
                              <FormDescription>
                                Require email on the form
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
                        name="phoneRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Phone Field</FormLabel>
                              <FormDescription>
                                Require phone number on the form
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
                        name="companyRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Company Field</FormLabel>
                              <FormDescription>
                                Require company name on the form
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
                      name="thankYouMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thank You Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Thank you for your submission!"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            This message will be displayed after form submission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redirectUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/thank-you"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Redirect users to this URL after form submission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Form Status</FormLabel>
                            <FormDescription>
                              Enable or disable this form
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

                    <div className="flex justify-end">
                      <Button type="submit">Create Form</Button>
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
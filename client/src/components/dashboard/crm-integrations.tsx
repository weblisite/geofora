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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowUpRight, Clipboard, RefreshCw, CheckCircle2, Database, ListFilter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const integrationSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  apiKey: z.string().min(1, "API key is required"),
  active: z.boolean().default(true),
  syncContacts: z.boolean().default(true),
  syncLeads: z.boolean().default(true),
  autoSync: z.boolean().default(false),
  mappedFields: z.record(z.string()).optional(),
});

export default function CRMIntegrations() {
  const { user } = useClerk();
  const [activeTab, setActiveTab] = useState("integrations");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  
  // Sample data for demonstration
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["/api/crm-integrations"],
    enabled: !!user,
  });

  const { data: syncHistory, isLoading: isLoadingSyncHistory } = useQuery({
    queryKey: ["/api/crm-integrations/sync-history"],
    enabled: !!user,
  });

  // Create form with validation
  const form = useForm<z.infer<typeof integrationSchema>>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      provider: "",
      apiKey: "",
      active: true,
      syncContacts: true,
      syncLeads: true,
      autoSync: false,
    },
  });

  const onSubmit = (values: z.infer<typeof integrationSchema>) => {
    console.log(values);
    // Here we would save the integration to the database
  };

  // Simplified mock CRM providers for the demo
  const crmProviders = [
    { id: "hubspot", name: "HubSpot", icon: "🟧", fields: ["Email", "First Name", "Last Name", "Company", "Phone"] },
    { id: "salesforce", name: "Salesforce", icon: "🟦", fields: ["Email", "Name", "Company", "Phone", "Industry", "Status"] },
    { id: "zoho", name: "Zoho CRM", icon: "🟫", fields: ["Email", "First Name", "Last Name", "Organization", "Phone"] },
    { id: "pipedrive", name: "Pipedrive", icon: "🟩", fields: ["Email", "Name", "Organization", "Phone", "Title"] },
    { id: "mailchimp", name: "Mailchimp", icon: "🐵", fields: ["Email", "FNAME", "LNAME", "ADDRESS", "PHONE"] },
    { id: "activecampaign", name: "ActiveCampaign", icon: "🟪", fields: ["Email", "FirstName", "LastName", "Phone", "Company"] },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">CRM Integrations</h1>
          <Button onClick={() => setActiveTab("connect")}>Connect New CRM</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Active Integrations</TabsTrigger>
            <TabsTrigger value="sync">Sync History</TabsTrigger>
            <TabsTrigger value="connect">Connect CRM</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="pt-4">
            {!selectedIntegration ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoadingIntegrations ? (
                  <p>Loading integrations...</p>
                ) : (
                  crmProviders.slice(0, 3).map((provider) => (
                    <Card key={provider.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{provider.icon}</span>
                            <CardTitle>{provider.name}</CardTitle>
                          </div>
                          <Badge variant={provider.id === "hubspot" ? "default" : "secondary"}>
                            {provider.id === "hubspot" ? "Active" : "Connected"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between mb-1">
                            <span>Last Sync:</span>
                            <span className="font-medium">
                              {provider.id === "hubspot" ? "10 minutes ago" : 
                               provider.id === "salesforce" ? "2 hours ago" : 
                               "3 days ago"}
                            </span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Leads Synced:</span>
                            <span className="font-medium">
                              {provider.id === "hubspot" ? "342" : 
                               provider.id === "salesforce" ? "156" : 
                               "89"}
                            </span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Status:</span>
                            <span className="flex items-center font-medium text-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Healthy
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedIntegration(provider.id)}
                        >
                          Manage
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="flex items-center"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync Now
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedIntegration(null)}
                    className="mr-4"
                  >
                    Back to Integrations
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {crmProviders.find(p => p.id === selectedIntegration)?.name} Integration
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Integration Settings</CardTitle>
                        <CardDescription>
                          Configure your {crmProviders.find(p => p.id === selectedIntegration)?.name} integration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form className="space-y-4">
                            <FormField
                              control={form.control}
                              name="apiKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>API Key</FormLabel>
                                  <div className="flex">
                                    <FormControl>
                                      <Input 
                                        type="password" 
                                        value="●●●●●●●●●●●●●●●●●●●●"
                                        readOnly
                                        className="rounded-r-none"
                                      />
                                    </FormControl>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      className="rounded-l-none"
                                    >
                                      <Clipboard className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormDescription>
                                    Your {crmProviders.find(p => p.id === selectedIntegration)?.name} API key is securely stored
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Active Status</FormLabel>
                                      <FormDescription>
                                        Enable or disable this integration
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={true}
                                        disabled
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="autoSync"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Auto Sync</FormLabel>
                                      <FormDescription>
                                        Automatically sync data every hour
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={selectedIntegration === "hubspot"}
                                        disabled
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="syncContacts"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Sync Contacts</FormLabel>
                                    <FormDescription>
                                      Sync captured leads to {crmProviders.find(p => p.id === selectedIntegration)?.name} contacts
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={true}
                                      disabled
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="syncLeads"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Sync Leads</FormLabel>
                                    <FormDescription>
                                      Sync captured leads to {crmProviders.find(p => p.id === selectedIntegration)?.name} leads
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={true}
                                      disabled
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="destructive">
                                Disconnect
                              </Button>
                              <Button type="button" variant="default">
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Field Mapping</CardTitle>
                        <CardDescription>
                          Map your form fields to {crmProviders.find(p => p.id === selectedIntegration)?.name} fields
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {["Email", "First Name", "Last Name", "Phone", "Company"].map((field) => (
                              <div key={field} className="flex items-center justify-between border p-3 rounded-md">
                                <div className="font-medium">{field}</div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <span>→</span>
                                  <span className="ml-2">
                                    {crmProviders.find(p => p.id === selectedIntegration)?.fields.find(f => 
                                      f.toLowerCase().includes(field.toLowerCase().replace(" ", ""))
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button type="button" variant="outline" className="w-full">
                            <ListFilter className="h-4 w-4 mr-2" />
                            Edit Field Mapping
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sync Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Last Sync</span>
                            <span className="text-sm font-medium">10 minutes ago</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Status</span>
                            <span className="text-sm font-medium flex items-center text-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Healthy
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Leads Synced</span>
                            <span className="text-sm font-medium">342</span>
                          </div>
                          <Button type="button" className="w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start border-b border-dark-300 pb-3 last:border-0 last:pb-0">
                              <div className="text-xs text-muted-foreground w-24">
                                {new Date(Date.now() - i * 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="text-sm">
                                {i === 0 ? "Synced 5 new leads" : 
                                 i === 1 ? "Updated 2 contact records" : 
                                 i === 2 ? "Automatic sync completed" : 
                                 i === 3 ? "Field mapping updated" : 
                                 "Manual sync initiated"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sync" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>
                  Recent synchronization activities with your CRM platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-200 border-b border-dark-300">
                        <th className="p-3 text-left font-medium">Date & Time</th>
                        <th className="p-3 text-left font-medium">CRM</th>
                        <th className="p-3 text-left font-medium">Action</th>
                        <th className="p-3 text-left font-medium">Records</th>
                        <th className="p-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingSyncHistory ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-center">Loading sync history...</td>
                        </tr>
                      ) : (
                        Array.from({ length: 10 }).map((_, i) => (
                          <tr key={i} className="border-b border-dark-300">
                            <td className="p-3">{new Date(Date.now() - i * 3600000).toLocaleString()}</td>
                            <td className="p-3">
                              {i % 3 === 0 ? "HubSpot" : i % 3 === 1 ? "Salesforce" : "Zoho CRM"}
                            </td>
                            <td className="p-3">
                              {i % 4 === 0 ? "Auto Sync" : i % 4 === 1 ? "Manual Sync" : i % 4 === 2 ? "Contact Update" : "Lead Creation"}
                            </td>
                            <td className="p-3">{Math.floor(Math.random() * 20) + 1}</td>
                            <td className="p-3">
                              <Badge variant={i % 5 !== 0 ? "default" : "destructive"}>
                                {i % 5 !== 0 ? "Success" : "Failed"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export Log</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <span className="text-sm">Page 1 of 3</span>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="connect" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect a New CRM</CardTitle>
                <CardDescription>
                  Integrate your forum with a CRM platform to synchronize leads and contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Integration Note</AlertTitle>
                      <AlertDescription>
                        You'll need an API key from your CRM provider to complete the integration. 
                        Please ensure you have the necessary permissions to create API connections.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRM Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select CRM provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {crmProviders.map(provider => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  <div className="flex items-center">
                                    <span className="mr-2">{provider.icon}</span>
                                    <span>{provider.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your CRM platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("provider") && (
                      <>
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your API key" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter your {crmProviders.find(p => p.id === form.watch("provider"))?.name} API key
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto font-normal text-primary ml-1"
                                  type="button"
                                >
                                  <span>Find my API key</span>
                                  <ArrowUpRight className="h-3 w-3 ml-1" />
                                </Button>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="syncContacts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Sync to Contacts</FormLabel>
                                  <FormDescription>
                                    Add forum leads to CRM contacts
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
                            name="syncLeads"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Sync to Leads</FormLabel>
                                  <FormDescription>
                                    Add forum leads to CRM leads
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
                          name="autoSync"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Automatic Sync</FormLabel>
                                <FormDescription>
                                  Automatically sync data hourly
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
                      </>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit">Connect CRM</Button>
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
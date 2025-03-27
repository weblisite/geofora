import { useState, useEffect } from "react";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Plus, RefreshCw, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

// Interface for Forum object
interface Forum {
  id: number;
  name: string;
  slug: string;
}

// Interface for CRM Integration object
interface CrmIntegration {
  id: number;
  provider: string;
  forumId: number;
  apiKey: string | null;
  apiSecret: string | null;
  isActive: boolean | null;
  listId: string | null;
  webhookUrl: string | null;
  mappingRules: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form schema for CRM integration
const integrationSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  forumId: z.number(),
  apiKey: z.string().optional().nullable(),
  apiSecret: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  listId: z.string().optional().nullable(),
  webhookUrl: z.string().url("Must be a valid URL").optional().nullable(),
  mappingRules: z.string().optional().nullable(),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

// CRM provider options
const crmProviders = [
  { value: "mailchimp", label: "Mailchimp" },
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
  { value: "activecampaign", label: "ActiveCampaign" },
  { value: "zapier", label: "Zapier" },
  { value: "webhooks", label: "Custom Webhooks" },
];

export default function CrmIntegrationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [currentIntegration, setCurrentIntegration] = useState<CrmIntegration | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Query for forums
  const { data: forums, isLoading: isLoadingForums } = useQuery({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/forums");
      return await res.json();
    },
    enabled: !!user,
  });

  // Query for CRM integrations based on selected forum
  const { data: crmIntegrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["/api/forums", selectedForumId, "crm-integrations"],
    queryFn: async () => {
      if (!selectedForumId) return [];
      const res = await apiRequest(`/api/forums/${selectedForumId}/crm-integrations`);
      return await res.json();
    },
    enabled: !!selectedForumId,
  });

  // Create CRM integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormValues) => {
      const res = await apiRequest(`/api/forums/${data.forumId}/crm-integrations`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "CRM integration created successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "crm-integrations"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create CRM integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update CRM integration mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormValues & { id: number }) => {
      const { id, ...integrationData } = data;
      const res = await apiRequest(`/api/crm-integrations/${id}`, {
        method: "PUT",
        body: JSON.stringify(integrationData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "CRM integration updated successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "crm-integrations"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update CRM integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete CRM integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/crm-integrations/${id}`, {
        method: "DELETE",
        headers: {} // Adding empty headers to fix type issue
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CRM integration deleted successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "crm-integrations"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete CRM integration: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create form handler
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      provider: "",
      forumId: selectedForumId || 0,
      apiKey: null,
      apiSecret: null,
      isActive: true,
      listId: null,
      webhookUrl: null,
      mappingRules: JSON.stringify({
        email: "email",
        firstName: "firstName",
        lastName: "lastName",
      }, null, 2),
    },
  });

  // Edit form handler
  const editForm = useForm<IntegrationFormValues & { id: number }>({
    resolver: zodResolver(integrationSchema.extend({ id: z.number() })),
    defaultValues: {
      id: 0,
      provider: "",
      forumId: 0,
      apiKey: null,
      apiSecret: null,
      isActive: true,
      listId: null,
      webhookUrl: null,
      mappingRules: null,
    },
  });

  // Effect to update the form default values when a forum is selected
  useEffect(() => {
    if (selectedForumId) {
      form.setValue("forumId", selectedForumId);
    }
  }, [selectedForumId, form]);

  // Effect to populate edit form when an integration is selected for editing
  useEffect(() => {
    if (currentIntegration) {
      editForm.reset({
        id: currentIntegration.id,
        provider: currentIntegration.provider,
        forumId: currentIntegration.forumId,
        apiKey: currentIntegration.apiKey,
        apiSecret: currentIntegration.apiSecret,
        isActive: currentIntegration.isActive || true,
        listId: currentIntegration.listId,
        webhookUrl: currentIntegration.webhookUrl,
        mappingRules: currentIntegration.mappingRules,
      });
    }
  }, [currentIntegration, editForm]);

  // Effect to update form fields based on selected provider
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "provider") {
        // Reset specific fields when provider changes
        if (value.provider === "webhooks") {
          form.setValue("apiKey", null);
          form.setValue("apiSecret", null);
          form.setValue("listId", null);
        } else if (value.provider === "zapier") {
          form.setValue("apiSecret", null);
          form.setValue("listId", null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Handler for creating a new CRM integration
  const onSubmit = (values: IntegrationFormValues) => {
    createIntegrationMutation.mutate(values);
  };

  // Handler for updating a CRM integration
  const onUpdate = (values: IntegrationFormValues & { id: number }) => {
    updateIntegrationMutation.mutate(values);
  };

  // Handler for deleting a CRM integration
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this integration?")) {
      deleteIntegrationMutation.mutate(id);
    }
  };

  // Parse mapping rules from JSON string
  const parseMappingRules = (mappingRules: string | null) => {
    if (!mappingRules) return {};
    try {
      return JSON.parse(mappingRules);
    } catch (e) {
      return {};
    }
  };

  // Helper to render form fields based on selected provider
  const renderProviderFields = (provider: string, formInstance: any) => {
    switch (provider) {
      case "mailchimp":
        return (
          <>
            <FormField
              control={formInstance.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Mailchimp API key" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Your Mailchimp API key. Find this in your Mailchimp account settings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formInstance.control}
              name="listId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Mailchimp list/audience ID" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>The ID of the list/audience to add subscribers to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "hubspot":
        return (
          <>
            <FormField
              control={formInstance.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter HubSpot API key" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Your HubSpot API key</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "salesforce":
        return (
          <>
            <FormField
              control={formInstance.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Salesforce consumer key" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formInstance.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumer Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter Salesforce consumer secret" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "activecampaign":
        return (
          <>
            <FormField
              control={formInstance.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter ActiveCampaign API key" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formInstance.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ActiveCampaign API URL" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Your account's API URL (e.g., https://youraccount.api-us1.com)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formInstance.control}
              name="listId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter list ID (optional)" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "zapier":
        return (
          <>
            <FormField
              control={formInstance.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zapier Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Zapier webhook URL" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>The webhook URL generated by your Zapier zap</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "webhooks":
        return (
          <>
            <FormField
              control={formInstance.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter webhook URL" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>The endpoint that will receive lead submission data</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please login to access this page.</div>;
  }

  return (
    <div className="flex min-h-screen bg-dark-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CRM Integrations</h1>
          <p className="text-gray-400">Connect your lead capture forms to external CRM systems</p>
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
            <Plus className="mr-2 h-4 w-4" /> Add CRM Integration
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CRM Integrations</CardTitle>
            <CardDescription>Manage your CRM and webhook integrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingIntegrations ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading integrations...</span>
              </div>
            ) : crmIntegrations?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crmIntegrations.map((integration: CrmIntegration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="font-medium">{integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}</div>
                        <div className="text-xs text-gray-500">
                          {integration.provider === "webhooks" || integration.provider === "zapier"
                            ? integration.webhookUrl
                            : integration.provider === "salesforce"
                            ? "Connected via API"
                            : integration.listId
                            ? `List ID: ${integration.listId}`
                            : "API Connected"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {integration.isActive ? (
                          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {integration.lastSyncedAt ? (
                          formatDate(integration.lastSyncedAt)
                        ) : (
                          <span className="text-gray-400 text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(integration.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentIntegration(integration);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(integration.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : selectedForumId ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">No CRM Integrations</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  You haven't set up any CRM integrations yet. Connect your lead forms to your
                  favorite CRM system or use webhooks to send data to other services.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add CRM Integration
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Select a forum to view CRM integrations</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create integration modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add CRM Integration</DialogTitle>
              <DialogDescription>
                Connect your forum to external CRM systems to manage leads
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM Provider</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CRM provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {crmProviders.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              {provider.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the CRM system you want to integrate with
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("provider") && renderProviderFields(form.watch("provider"), form)}

                <FormField
                  control={form.control}
                  name="mappingRules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Mapping</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter JSON mapping rules"
                          {...field}
                          value={field.value || ""}
                          className="font-mono text-sm h-40"
                        />
                      </FormControl>
                      <FormDescription>
                        JSON mapping of form fields to CRM fields (e.g., {"{"} "email": "email", "firstName": "first_name" {"}"})
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Whether this integration is currently active and syncing data
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

                <div className="bg-yellow-500/10 text-yellow-400 p-4 rounded-lg border border-yellow-500/20 text-sm">
                  <AlertTriangle className="h-4 w-4 inline-block mr-2" />
                  <span>
                    Make sure you've set up the correct permissions and API access in your CRM system before creating this integration.
                  </span>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createIntegrationMutation.isPending}>
                    {createIntegrationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Integration
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit integration modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit CRM Integration</DialogTitle>
              <DialogDescription>
                Update your CRM integration settings
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM Provider</FormLabel>
                      <FormControl>
                        <Input disabled value={field.value} />
                      </FormControl>
                      <FormDescription>
                        Provider cannot be changed after creation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {editForm.watch("provider") && renderProviderFields(editForm.watch("provider"), editForm)}

                <FormField
                  control={editForm.control}
                  name="mappingRules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Mapping</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter JSON mapping rules"
                          {...field}
                          value={field.value || ""}
                          className="font-mono text-sm h-40"
                        />
                      </FormControl>
                      <FormDescription>
                        JSON mapping of form fields to CRM fields
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Whether this integration is currently active and syncing data
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

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateIntegrationMutation.isPending}>
                    {updateIntegrationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Integration
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
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

// Interface for Lead Capture Form object
interface LeadCaptureForm {
  id: number;
  name: string;
  description: string | null;
  forumId: number;
  formFields: string;
  submitButtonText: string | null;
  redirectUrl: string | null;
  isActive: boolean | null;
  emailFieldLabel: string | null;
  successMessage: string | null;
  createdAt: string;
  updatedAt: string;
  gatedContentId: number | null;
}

// Interface for Lead Submission
interface LeadSubmission {
  id: number;
  email: string;
  formId: number;
  formData: string;
  firstName: string | null;
  lastName: string | null;
  isExported: boolean | null;
  createdAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  formName?: string; // For displaying the form name
}

// Interface for Lead Form with Stats
interface LeadFormStats {
  id: number;
  name: string;
  description: string | null;
  submissions: number;
  views: number;
  conversionRate: number;
  fields: string[];
  isActive: boolean;
  createdAt: string;
}

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  forumId: z.number().optional(), // This will be filled based on user's forums
  formFields: z.string(),
  nameRequired: z.boolean().default(true),
  emailRequired: z.boolean().default(true),
  phoneRequired: z.boolean().default(false),
  companyRequired: z.boolean().default(false),
  submitButtonText: z.string().optional(),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  active: z.boolean().default(true), // Alias for isActive for backward compatibility
  emailFieldLabel: z.string().optional(),
  successMessage: z.string().optional(),
  thankYouMessage: z.string().optional(), // Alias for successMessage
  gatedContentId: z.number().optional().nullable(),
});

export default function LeadCapture() {
  const { user } = useClerk();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("forms");
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Query for user's forums
  const { data: forums } = useQuery({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/forums", { method: "GET" });
      return await res.json();
    },
    enabled: !!user,
  });

  // Query for lead forms
  const { data: leadForms, isLoading: isLoadingForms } = useQuery({
    queryKey: ["/api/user/lead-forms"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/user/lead-forms", { method: "GET" });
        const forms = await res.json();
        
        // Map the data to include stats
        return forms.map((form: LeadCaptureForm) => {
          // Parse form fields to get field names
          let fields: string[] = [];
          try {
            const parsedFields = JSON.parse(form.formFields);
            fields = parsedFields.map((field: any) => field.label || field.name);
          } catch (e) {
            fields = ["Email"];
          }
          
          // For each form, we'll need to query stats from a separate endpoint
          // This would ideally be included in the original API response
          return {
            id: form.id,
            name: form.name,
            description: form.description,
            submissions: 0, // These will be updated with real data
            views: 0,
            conversionRate: 0,
            fields,
            isActive: form.isActive !== null ? form.isActive : true,
            createdAt: form.createdAt
          };
        });
      } catch (error) {
        console.error("Error fetching lead forms:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Query for form stats (separate query to get stats for each form)
  const { data: formStats } = useQuery({
    queryKey: ["/api/lead-forms/stats"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/lead-forms/stats", { method: "GET" });
        return await res.json();
      } catch (error) {
        console.error("Error fetching form stats:", error);
        return [];
      }
    },
    enabled: !!user && !!leadForms && leadForms.length > 0,
  });

  // Update form stats if both leadForms and formStats are available
  const formsWithStats: LeadFormStats[] = leadForms && formStats
    ? leadForms.map((form: any) => {
        const stats = formStats.find((stat: any) => stat.formId === form.id) || {};
        return {
          ...form,
          submissions: stats.submissions || 0,
          views: stats.views || 0,
          conversionRate: stats.conversionRate || 0
        };
      })
    : [];

  // Query for lead submissions (paginated)
  const { data: leadsResponse, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["/api/leads", page, pageSize, selectedFormId],
    queryFn: async () => {
      try {
        // Construct API endpoint with query parameters
        let endpoint = `/api/user/submissions?page=${page}&limit=${pageSize}`;
        if (selectedFormId) {
          endpoint += `&formId=${selectedFormId}`;
        }
        
        const res = await apiRequest(endpoint, { method: "GET" });
        return await res.json();
      } catch (error) {
        console.error("Error fetching leads:", error);
        return { data: [], total: 0, totalPages: 0 };
      }
    },
    enabled: !!user && activeTab === "leads",
  });

  // Extract leads and pagination info
  const leads = leadsResponse?.data || [];
  const totalPages = leadsResponse?.totalPages || 1;

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("/api/lead-forms", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead capture form created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/lead-forms"] });
      setActiveTab("forms");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      forumId: forums && forums.length > 0 ? forums[0].id : undefined,
      formFields: JSON.stringify([
        { name: "email", label: "Email", type: "email", required: true },
        { name: "firstName", label: "First Name", type: "text", required: false },
        { name: "lastName", label: "Last Name", type: "text", required: false },
      ]),
      nameRequired: true,
      emailRequired: true,
      phoneRequired: false,
      companyRequired: false,
      submitButtonText: "Submit",
      redirectUrl: "",
      isActive: true,
      active: true,
      emailFieldLabel: "Email",
      successMessage: "Thank you for your submission!",
      thankYouMessage: "Thank you for your submission!",
      gatedContentId: null,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Make sure forumId is set
    if (!values.forumId && forums && forums.length > 0) {
      values.forumId = forums[0].id;
    }
    
    // Transform the form values to match the backend expected format
    // Handle the different field names between UI and backend
    const formData = {
      ...values,
      // Use successMessage as the canonical field, but also include thankYouMessage for compatibility
      successMessage: values.successMessage || values.thankYouMessage,
      // Use isActive as the canonical field, but also include active for compatibility
      isActive: values.isActive !== undefined ? values.isActive : values.active,
      // Update formFields based on the UI toggle fields
      formFields: updateFormFieldsFromToggles(values)
    };
    
    createFormMutation.mutate(formData);
  };
  
  // Function to update form fields based on toggle settings
  const updateFormFieldsFromToggles = (values: z.infer<typeof formSchema>): string => {
    try {
      // Parse the current form fields
      const currentFields = JSON.parse(values.formFields);
      
      // Make sure email field is always included
      let fields = [
        { 
          name: "email", 
          label: values.emailFieldLabel || "Email", 
          type: "email", 
          required: values.emailRequired 
        }
      ];
      
      // Add name fields if required
      if (values.nameRequired) {
        fields.push(
          { name: "firstName", label: "First Name", type: "text", required: true },
          { name: "lastName", label: "Last Name", type: "text", required: false }
        );
      }
      
      // Add phone field if required
      if (values.phoneRequired) {
        fields.push(
          { name: "phone", label: "Phone Number", type: "tel", required: true }
        );
      }
      
      // Add company field if required
      if (values.companyRequired) {
        fields.push(
          { name: "company", label: "Company Name", type: "text", required: true }
        );
      }
      
      // If there are already custom fields in the current fields, preserve them
      const customFields = currentFields.filter((field: any) => 
        !["email", "firstName", "lastName", "phone", "company"].includes(field.name)
      );
      
      return JSON.stringify([...fields, ...customFields]);
    } catch (e) {
      // If there's an error parsing the formFields, return a default structure
      console.error("Error updating form fields:", e);
      return JSON.stringify([
        { name: "email", label: "Email", type: "email", required: true }
      ]);
    }
  };

  // Function to handle export
  const handleExport = async (formId: number) => {
    try {
      toast({
        title: "Export Started",
        description: "We're preparing your CSV export...",
      });
      
      const res = await apiRequest(`/api/lead-forms/${formId}/export`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: "Export Complete",
          description: "Your leads have been exported successfully.",
        });
        
        // Create and trigger download of CSV
        if (data.csvUrl) {
          const link = document.createElement('a');
          link.href = data.csvUrl;
          link.setAttribute('download', `leads-${formId}-${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your leads.",
        variant: "destructive",
      });
    }
  };

  // Parse form fields from JSON string
  const parseFormFields = (formFields: string): string[] => {
    try {
      const fields = JSON.parse(formFields);
      return fields.map((field: any) => field.label || field.name);
    } catch (e) {
      return ["Email"];
    }
  };

  // Parse form data from JSON string
  const parseFormData = (formData: string): Record<string, string> => {
    try {
      return JSON.parse(formData);
    } catch (e) {
      return {};
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please login to access this page.</div>;
  }

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
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <p>Loading forms...</p>
                </div>
              ) : formsWithStats && formsWithStats.length > 0 ? (
                formsWithStats.map((form) => (
                  <Card key={form.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{form.name}</CardTitle>
                        <div className={`w-3 h-3 rounded-full ${form.isActive ? "bg-green-500" : "bg-red-500"}`}></div>
                      </div>
                      <CardDescription>Created on {formatDate(form.createdAt)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Submissions:</span>
                          <span className="font-medium">{form.submissions}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Conversion Rate:</span>
                          <span className="font-medium">{form.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Fields:</span>
                          <span className="font-medium">{form.fields.join(", ")}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Navigate to edit page or open edit modal
                          toast({
                            title: "Edit Form",
                            description: "Form editing functionality is coming soon.",
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          // Copy embed code to clipboard
                          const embedCode = `<script src="${window.location.origin}/embed-form.js?id=${form.id}"></script>`;
                          navigator.clipboard.writeText(embedCode);
                          toast({
                            title: "Embed Code Copied",
                            description: "The form embed code has been copied to your clipboard.",
                          });
                        }}
                      >
                        Embed
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                  <p className="mb-4">No lead forms found</p>
                  <Button onClick={() => setActiveTab("create")}>Create your first form</Button>
                </div>
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
                          <td colSpan={4} className="p-3 text-center">
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span>Loading leads...</span>
                            </div>
                          </td>
                        </tr>
                      ) : leads && leads.length > 0 ? (
                        leads.map((lead: LeadSubmission) => {
                          const formData = parseFormData(lead.formData);
                          return (
                            <tr key={lead.id} className="border-b border-dark-300">
                              <td className="p-3">
                                {lead.firstName || formData.firstName || "—"} {lead.lastName || formData.lastName || ""}
                              </td>
                              <td className="p-3">{lead.email}</td>
                              <td className="p-3">
                                {lead.formName || 
                                  (formsWithStats?.find(f => f.id === lead.formId)?.name || `Form #${lead.formId}`)}
                              </td>
                              <td className="p-3">{formatDate(lead.createdAt)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400">
                            No lead submissions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleExport(selectedFormId || 0)}
                  disabled={!leads || leads.length === 0}
                >
                  Export CSV
                </Button>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">Page {page} of {totalPages || 1}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
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
                      name="name"
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
                      name="successMessage"
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
                      name="isActive"
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
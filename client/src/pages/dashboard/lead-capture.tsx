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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, FileText, Eye, Download, Edit, BarChart2, Inbox } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Interface for Forum object
interface Forum {
  id: number;
  name: string;
  slug: string;
}

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

// Interface for Lead Form with Stats
interface LeadCaptureFormWithStats extends LeadCaptureForm {
  views: number;
  submissions: number;
  conversionRate: number;
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
}

// Form schema for lead capture form
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  forumId: z.number(),
  formFields: z.string(),
  submitButtonText: z.string().optional(),
  redirectUrl: z.string().url("Invalid URL").optional().nullable(),
  isActive: z.boolean().default(true),
  emailFieldLabel: z.string().optional(),
  successMessage: z.string().optional(),
  gatedContentId: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeadCapturePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [currentForm, setCurrentForm] = useState<LeadCaptureForm | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("forms");

  // Query for forums
  const { data: forums, isLoading: isLoadingForums } = useQuery({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/forums", { method: "GET" });
      return await res.json();
    },
    enabled: !!user,
  });

  // Query for lead forms based on selected forum
  const { data: leadForms, isLoading: isLoadingLeadForms } = useQuery({
    queryKey: ["/api/forums", selectedForumId, "lead-forms"],
    queryFn: async () => {
      if (!selectedForumId) return [];
      const res = await apiRequest(`/api/forums/${selectedForumId}/lead-forms`, { method: "GET" });
      return await res.json();
    },
    enabled: !!selectedForumId,
  });

  // Query for submissions for selected form
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["/api/lead-forms", selectedFormId, "submissions"],
    queryFn: async () => {
      if (!selectedFormId) return [];
      const res = await apiRequest(`/api/lead-forms/${selectedFormId}/submissions`, { method: "GET" });
      return await res.json();
    },
    enabled: !!selectedFormId && activeTab === "submissions",
  });

  // Query for form with statistics
  const { data: formStats, isLoading: isLoadingFormStats } = useQuery({
    queryKey: ["/api/lead-forms", selectedFormId],
    queryFn: async () => {
      if (!selectedFormId) return null;
      const res = await apiRequest(`/api/lead-forms/${selectedFormId}`, { method: "GET" });
      return await res.json();
    },
    enabled: !!selectedFormId,
  });
  
  // Query for recent submissions across all forms
  const { data: recentSubmissions, isLoading: isLoadingRecentSubmissions } = useQuery({
    queryKey: ["/api/user/recent-submissions"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/recent-submissions", { method: "GET" });
      return await res.json();
    },
    enabled: !!user,
  });

  // Create lead form mutation
  const createLeadFormMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest(`/api/forums/${data.forumId}/lead-forms`, { 
        method: "POST", 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' } 
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Lead capture form created successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "lead-forms"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create lead form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update lead form mutation
  const updateLeadFormMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      const { id, ...formData } = data;
      const res = await apiRequest(`/api/lead-forms/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Lead capture form updated successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "lead-forms"] });
      }
      if (selectedFormId) {
        queryClient.invalidateQueries({ queryKey: ["/api/lead-forms", selectedFormId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update lead form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete lead form mutation
  const deleteLeadFormMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/lead-forms/${id}`, { 
        method: "DELETE" 
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead capture form deleted successfully",
      });
      if (selectedForumId) {
        queryClient.invalidateQueries({ queryKey: ["/api/forums", selectedForumId, "lead-forms"] });
      }
      setSelectedFormId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete lead form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Export submissions mutation
  const exportSubmissionsMutation = useMutation({
    mutationFn: async (formId: number) => {
      const res = await apiRequest(`/api/lead-forms/${formId}/export`, {
        method: "POST"
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submissions exported successfully",
      });
      if (selectedFormId) {
        queryClient.invalidateQueries({ queryKey: ["/api/lead-forms", selectedFormId, "submissions"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to export submissions: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create form handler
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      forumId: selectedForumId || 0,
      formFields: JSON.stringify([
        { name: "email", label: "Email", type: "email", required: true },
        { name: "firstName", label: "First Name", type: "text", required: false },
        { name: "lastName", label: "Last Name", type: "text", required: false },
      ]),
      submitButtonText: "Submit",
      redirectUrl: null,
      isActive: true,
      emailFieldLabel: "Email",
      successMessage: "Thank you for your submission!",
      gatedContentId: null,
    },
  });

  // Edit form handler
  const editForm = useForm<FormValues & { id: number }>({
    resolver: zodResolver(formSchema.extend({ id: z.number() })),
    defaultValues: {
      id: 0,
      name: "",
      description: "",
      forumId: 0,
      formFields: "",
      submitButtonText: "",
      redirectUrl: null,
      isActive: true,
      emailFieldLabel: "",
      successMessage: "",
      gatedContentId: null,
    },
  });

  // Effect to update the form default values when a forum is selected
  useEffect(() => {
    if (selectedForumId) {
      form.setValue("forumId", selectedForumId);
    }
  }, [selectedForumId, form]);

  // Effect to populate edit form when a form is selected for editing
  useEffect(() => {
    if (currentForm) {
      editForm.reset({
        id: currentForm.id,
        name: currentForm.name,
        description: currentForm.description || "",
        forumId: currentForm.forumId,
        formFields: currentForm.formFields,
        submitButtonText: currentForm.submitButtonText || "",
        redirectUrl: currentForm.redirectUrl,
        isActive: currentForm.isActive || true,
        emailFieldLabel: currentForm.emailFieldLabel || "",
        successMessage: currentForm.successMessage || "",
        gatedContentId: currentForm.gatedContentId,
      });
    }
  }, [currentForm, editForm]);

  // Handler for creating a new lead form
  const onSubmit = (values: FormValues) => {
    createLeadFormMutation.mutate(values);
  };

  // Handler for updating a lead form
  const onUpdate = (values: FormValues & { id: number }) => {
    updateLeadFormMutation.mutate(values);
  };

  // Handler for deleting a lead form
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      deleteLeadFormMutation.mutate(id);
    }
  };

  // Handler for exporting submissions
  const handleExport = (formId: number) => {
    exportSubmissionsMutation.mutate(formId);
  };

  // Handle form selection and tab changes
  const handleFormSelect = (formId: number) => {
    setSelectedFormId(formId);
    setActiveTab("overview");
  };

  // Parse form fields from JSON string
  const parseFormFields = (formFields: string) => {
    try {
      return JSON.parse(formFields);
    } catch (e) {
      return [];
    }
  };

  // Parse form data from JSON string
  const parseFormData = (formData: string) => {
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
    <div className="flex min-h-screen bg-dark-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lead Capture Management</h1>
          <p className="text-gray-400">Create and manage lead capture forms and view submissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-64">
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
            className="flex items-center justify-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Lead Form
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left sidebar - list of forms */}
          <div className="col-span-1 md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Lead Forms</CardTitle>
                <CardDescription>Select a form to manage</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeadForms ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading forms...</span>
                  </div>
                ) : leadForms?.length > 0 ? (
                  <div className="space-y-2">
                    {leadForms.map((form: LeadCaptureForm) => (
                      <div
                        key={form.id}
                        className={`p-3 rounded-lg cursor-pointer ${
                          selectedFormId === form.id
                            ? "bg-primary-500/10 border border-primary-500/30"
                            : "hover:bg-dark-200 border border-dark-300"
                        }`}
                        onClick={() => handleFormSelect(form.id)}
                      >
                        <div className="font-medium">{form.name}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {form.description || "No description"}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="mr-2">Created {formatDate(form.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedForumId ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No lead forms found</p>
                    <p className="text-sm mt-2">Create your first lead form to start capturing leads</p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Form
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Select a forum to view lead forms</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right content - form details or recent submissions */}
          <div className="col-span-1 md:col-span-9">
            {!selectedFormId ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Recent submissions across all your forms</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRecentSubmissions ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading recent submissions...</span>
                    </div>
                  ) : recentSubmissions?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Form</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="hidden sm:table-cell">Name</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentSubmissions.map((submission: LeadSubmission & { formName: string }) => (
                            <TableRow key={submission.id}>
                              <TableCell>
                                <div className="font-medium">{submission.formName}</div>
                              </TableCell>
                              <TableCell>
                                <div>{submission.email}</div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {`${submission.firstName || ""} ${submission.lastName || ""}`.trim() || "N/A"}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {formatDate(submission.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Inbox className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No submissions yet</p>
                      <p className="text-sm mt-2">Create forms and start capturing leads to see submissions here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{formStats?.name}</CardTitle>
                      <CardDescription>{formStats?.description || "No description"}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentForm(formStats);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedFormId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="submissions">Submissions</TabsTrigger>
                      <TabsTrigger value="code">Embed Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      {isLoadingFormStats ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading form details...</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardDescription>Views</CardDescription>
                                <CardTitle className="text-2xl">{formStats?.views || 0}</CardTitle>
                              </CardHeader>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardDescription>Submissions</CardDescription>
                                <CardTitle className="text-2xl">{formStats?.submissions || 0}</CardTitle>
                              </CardHeader>
                            </Card>
                            <Card>
                              <CardHeader className="pb-2">
                                <CardDescription>Conversion Rate</CardDescription>
                                <CardTitle className="text-2xl">
                                  {formStats?.conversionRate
                                    ? `${(formStats.conversionRate * 100).toFixed(2)}%`
                                    : "0%"}
                                </CardTitle>
                              </CardHeader>
                            </Card>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium mb-2">Form Fields</h3>
                            <div className="bg-dark-200 rounded-lg p-4">
                              {formStats?.formFields ? (
                                <div className="space-y-3">
                                  {parseFormFields(formStats.formFields).map(
                                    (field: any, index: number) => (
                                      <div key={index} className="flex items-center">
                                        <div className="bg-dark-300 rounded px-2 py-1 mr-2 text-sm">
                                          {field.type}
                                        </div>
                                        <div>
                                          <span className="font-medium">{field.label}</span>
                                          {field.required && (
                                            <span className="text-red-500 ml-1">*</span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400">No form fields defined</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium mb-2">Form Settings</h3>
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-gray-400">Submit Button Text:</span>
                                  <p>{formStats?.submitButtonText || "Submit"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Status:</span>
                                  <p>
                                    {formStats?.isActive ? (
                                      <span className="text-green-500">Active</span>
                                    ) : (
                                      <span className="text-red-500">Inactive</span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Success Message:</span>
                                  <p>{formStats?.successMessage || "Thank you for your submission!"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Redirect URL:</span>
                                  <p>{formStats?.redirectUrl || "None"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="submissions">
                      {isLoadingSubmissions ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading submissions...</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-medium">Form Submissions</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(selectedFormId)}
                              disabled={!submissions?.length}
                            >
                              <Download className="h-4 w-4 mr-2" /> Export
                            </Button>
                          </div>

                          {submissions?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden sm:table-cell">Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {submissions.map((submission: LeadSubmission) => (
                                    <TableRow key={submission.id}>
                                      <TableCell className="font-medium">
                                        <div>{submission.email}</div>
                                        <div className="text-xs text-gray-500 sm:hidden">
                                          {`${submission.firstName || ""} ${submission.lastName || ""}`.trim() || "N/A"}
                                        </div>
                                        <div className="text-xs text-gray-500 md:hidden">
                                          {formatDate(submission.createdAt)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="hidden sm:table-cell">
                                        {`${submission.firstName || ""} ${submission.lastName || ""}`.trim() ||
                                          "N/A"}
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell">{formatDate(submission.createdAt)}</TableCell>
                                      <TableCell>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              View Data
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Submission Data</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-2">
                                              {Object.entries(parseFormData(submission.formData)).map(
                                                ([key, value]) => (
                                                  <div key={key}>
                                                    <span className="font-medium">{key}: </span>
                                                    <span>{String(value)}</span>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </TableCell>
                                      <TableCell>
                                        {submission.isExported ? (
                                          <span className="text-green-500">Exported</span>
                                        ) : (
                                          <span className="text-yellow-500">New</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                              <p>No submissions yet</p>
                              <p className="text-sm mt-2">
                                Submissions will appear here once users fill out your form
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="code">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Embed Code</h3>
                          <p className="text-gray-400 mb-4">
                            Use this code to embed the lead capture form on your website
                          </p>
                          <div className="bg-dark-200 rounded-lg p-4 font-mono text-sm">
                            {`<script src="${window.location.origin}/embed/lead-form.js" data-form-id="${selectedFormId}"></script>`}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `<script src="${window.location.origin}/embed/lead-form.js" data-form-id="${selectedFormId}"></script>`
                              );
                              toast({
                                title: "Copied",
                                description: "Embed code copied to clipboard",
                              });
                            }}
                          >
                            Copy Code
                          </Button>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">API Endpoint</h3>
                          <p className="text-gray-400 mb-4">
                            You can also submit directly to the API endpoint
                          </p>
                          <div className="bg-dark-200 rounded-lg p-4 font-mono text-sm">
                            {`${window.location.origin}/api/lead-forms/${selectedFormId}/submissions`}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/api/lead-forms/${selectedFormId}/submissions`
                              );
                              toast({
                                title: "Copied",
                                description: "API endpoint copied to clipboard",
                              });
                            }}
                          >
                            Copy Endpoint
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <BarChart2 className="h-16 w-16 text-gray-400 opacity-20 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a Lead Form</h3>
                  <p className="text-gray-400 text-center mb-4">
                    Choose a lead form from the list to view details and submissions
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)} disabled={!selectedForumId}>
                    <Plus className="mr-2 h-4 w-4" /> Create Lead Form
                  </Button>
                </CardContent>
              </Card>
            )
          </div>
        </div>

        {/* Create form modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Lead Capture Form</DialogTitle>
              <DialogDescription>
                Create a new lead capture form to collect visitor information
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter form name" {...field} />
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
                          placeholder="Enter a description for this form"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submitButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submit Button Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Submit" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailFieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Field Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="successMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Success Message</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Thank you for your submission!"
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
                        Where to redirect users after successful submission
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
                          Whether this form is currently active and collecting submissions
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
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLeadFormMutation.isPending}>
                    {createLeadFormMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Form
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit form modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Lead Capture Form</DialogTitle>
              <DialogDescription>Update your lead capture form settings</DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter form name" {...field} />
                      </FormControl>
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
                          placeholder="Enter a description for this form"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="submitButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submit Button Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Submit" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="emailFieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Field Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="successMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Success Message</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Thank you for your submission!"
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
                        Where to redirect users after successful submission
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
                          Whether this form is currently active and collecting submissions
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
                  <Button type="submit" disabled={updateLeadFormMutation.isPending}>
                    {updateLeadFormMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Form
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
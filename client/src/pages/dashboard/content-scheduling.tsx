import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Pencil, Plus, Trash2, Send } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SectionGenerator } from "@/components/section-generator";

// Types
interface Forum {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ContentSchedule {
  id: number;
  forumId: number;
  forum: Forum;
  userId: number;
  title: string;
  description: string | null;
  keyword: string;
  categoryId: number | null;
  category?: Category;
  agentType: string | null;
  contentType: string;
  questionCount: number | null;
  scheduledFor: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  questionsGenerated?: number;
  answersGenerated?: number;
  questionIds: string | null;
}

// Form schema
const scheduleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  forumId: z.coerce.number({
    required_error: "Please select a forum"
  }),
  categoryId: z.coerce.number().optional(),
  keyword: z.string().min(2, "Keyword must be at least 2 characters"),
  contentType: z.string().default("questions"),
  agentType: z.string().default("intermediate"),
  questionCount: z.coerce.number().min(1).max(20).default(5),
  scheduledFor: z.date({
    required_error: "Please select a date to schedule"
  }),
  status: z.string().default("scheduled")
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function ContentSchedulingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] = useState<ContentSchedule | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [publishingId, setPublishingId] = useState<number | null>(null);

  // Queries to fetch data
  const { data: forums } = useQuery({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/forums");
      return await res.json();
    },
    enabled: !!user
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("/api/categories");
      return await res.json();
    }
  });

  const { data: schedules, isLoading, refetch } = useQuery({
    queryKey: ["/api/content-schedules"],
    queryFn: async () => {
      const res = await apiRequest("/api/content-schedules");
      return await res.json();
    },
    enabled: !!user
  });

  const { data: upcomingSchedules, isLoading: isLoadingUpcoming, refetch: refetchUpcoming } = useQuery({
    queryKey: ["/api/content-schedules/upcoming"],
    queryFn: async () => {
      const res = await apiRequest("/api/content-schedules/upcoming");
      return await res.json();
    },
    enabled: !!user
  });

  // Default form values
  const defaultValues: Partial<ScheduleFormValues> = {
    contentType: "questions",
    agentType: "intermediate",
    questionCount: 5,
    status: "scheduled",
    scheduledFor: new Date(Date.now() + 86400000) // Tomorrow
  };

  // Create form
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: defaultValues
  });

  // Reset form when opening the dialog in create mode
  useEffect(() => {
    if (!isEditMode && openDialog) {
      form.reset(defaultValues);
    }
  }, [isEditMode, openDialog, form]);

  // Set form values when editing
  useEffect(() => {
    if (isEditMode && selectedSchedule) {
      form.reset({
        ...selectedSchedule,
        forumId: selectedSchedule.forumId,
        categoryId: selectedSchedule.categoryId || undefined,
        scheduledFor: new Date(selectedSchedule.scheduledFor),
        questionCount: selectedSchedule.questionCount || 5,
        status: selectedSchedule.status || "scheduled",
        agentType: selectedSchedule.agentType || "intermediate",
        description: selectedSchedule.description || ""
      });
    }
  }, [isEditMode, selectedSchedule, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      const res = await apiRequest("/api/content-schedules", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          scheduledFor: data.scheduledFor.toISOString()
        })
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules/upcoming"] });
      toast({
        title: "Schedule created",
        description: "Content schedule has been created successfully."
      });
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest(`/api/content-schedules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...updateData,
          scheduledFor: updateData.scheduledFor.toISOString()
        })
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules/upcoming"] });
      toast({
        title: "Schedule updated",
        description: "Content schedule has been updated successfully."
      });
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/content-schedules/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules/upcoming"] });
      toast({
        title: "Schedule deleted",
        description: "Content schedule has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (data: { id: number, count: number, difficulty: string }) => {
      const res = await apiRequest(`/api/content-schedules/${data.id}/publish`, {
        method: "POST",
        body: JSON.stringify({
          count: data.count,
          difficulty: data.difficulty
        })
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules/upcoming"] });
      toast({
        title: "Content published",
        description: `Successfully published ${data.questionsCreated} questions.`
      });
      setPublishingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to publish content",
        description: error.message,
        variant: "destructive"
      });
      setPublishingId(null);
    }
  });

  // Handle create/edit form submission
  const onSubmit = (values: ScheduleFormValues) => {
    if (isEditMode && selectedSchedule) {
      updateMutation.mutate({ ...values, id: selectedSchedule.id });
    } else {
      createMutation.mutate(values);
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { variant: "default" | "outline" | "secondary" | "destructive", label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      published: { variant: "default", label: "Published" },
      cancelled: { variant: "destructive", label: "Cancelled" }
    };

    const statusInfo = status && status in statusMap 
      ? statusMap[status] 
      : { variant: "outline" as const, label: "Unknown" };
    
    return (
      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
    );
  };

  // Function to handle edit button click
  const handleEdit = (schedule: ContentSchedule) => {
    setSelectedSchedule(schedule);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  // Function to handle delete button click
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this content schedule?")) {
      deleteMutation.mutate(id);
    }
  };

  // Function to handle publish button click
  const handlePublish = (id: number) => {
    setPublishingId(id);
    const schedule = schedules?.find((s: ContentSchedule) => s.id === id);
    publishMutation.mutate({
      id,
      count: schedule?.questionCount || 5,
              difficulty: schedule?.agentType || "intermediate"
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Scheduling</h1>
          <p className="text-muted-foreground">
            Plan and automate your forum content with AI-powered scheduling
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditMode(false);
              setSelectedSchedule(null);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Content Schedule" : "Create Content Schedule"}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update your content schedule settings below."
                  : "Set up automated content publishing for your forum."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for this schedule" {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter a description" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="forumId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forum</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select forum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {forums?.map((forum: Forum) => (
                              <SelectItem key={forum.id} value={forum.id.toString()}>
                                {forum.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: Category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="keyword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Keyword</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the primary keyword to target" {...field} />
                      </FormControl>
                      <FormDescription>
                        This keyword will be used to generate SEO-optimized questions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="questions">Questions</SelectItem>
                            <SelectItem value="questions_and_answers">Questions & Answers</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="agentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Agent</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || "intermediate"}
                          value={field.value || "intermediate"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AI agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                            <SelectItem value="smart">Smart</SelectItem>
                            <SelectItem value="genius">Genius</SelectItem>
                            <SelectItem value="intelligent">Intelligent</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledFor"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Schedule Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "scheduled"}
                        value={field.value || "scheduled"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? (
                      "Saving..."
                    ) : isEditMode ? (
                      "Update Schedule"
                    ) : (
                      "Create Schedule"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Glassmorphism className="p-4 mb-6">
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All Schedules</TabsTrigger>
            <TabsTrigger value="generate-section">Generate Section</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="pt-4">
            <h3 className="text-xl font-semibold mb-4">Upcoming Content</h3>
            {isLoadingUpcoming ? (
              <p>Loading schedules...</p>
            ) : upcomingSchedules?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingSchedules.map((schedule: ContentSchedule) => (
                  <Card key={schedule.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{schedule.title}</CardTitle>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <CardDescription>
                        {schedule.forum.name} • {formatDate(new Date(schedule.scheduledFor))}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm"><strong>Keyword:</strong> {schedule.keyword}</p>
                      <p className="text-sm"><strong>Questions:</strong> {schedule.questionCount || 5}</p>
                      {schedule.description && (
                        <p className="text-sm mt-2 line-clamp-2">{schedule.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(schedule)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                      {schedule.status === "scheduled" && new Date(schedule.scheduledFor) <= new Date() && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handlePublish(schedule.id)}
                          disabled={publishingId === schedule.id && publishMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" /> 
                          {publishingId === schedule.id && publishMutation.isPending 
                            ? "Publishing..." 
                            : "Publish Now"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No upcoming content schedules</p>
                <Button onClick={() => {
                  setIsEditMode(false);
                  setSelectedSchedule(null);
                  setOpenDialog(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Create Schedule
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="pt-4">
            <h3 className="text-xl font-semibold mb-4">All Content Schedules</h3>
            {isLoading ? (
              <p>Loading schedules...</p>
            ) : schedules?.length > 0 ? (
              <Table>
                <TableCaption>A list of all your content schedules</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Forum</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule: ContentSchedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.title}</TableCell>
                      <TableCell>{schedule.forum.name}</TableCell>
                      <TableCell>{schedule.keyword}</TableCell>
                      <TableCell>{formatDate(new Date(schedule.scheduledFor))}</TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>
                        {schedule.status === "published" 
                          ? `${schedule.questionsGenerated || 0} created` 
                          : schedule.questionCount || 5}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(schedule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {schedule.status === "scheduled" && new Date(schedule.scheduledFor) <= new Date() && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handlePublish(schedule.id)}
                              disabled={publishingId === schedule.id}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No content schedules found</p>
                <Button onClick={() => {
                  setIsEditMode(false);
                  setSelectedSchedule(null);
                  setOpenDialog(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Create Schedule
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="generate-section" className="pt-4">
            <h3 className="text-xl font-semibold mb-4">Generate Complete Section</h3>
            <p className="text-muted-foreground mb-6">
              Generate a full section of SEO-optimized content including multiple related questions and answers
            </p>
            
            <SectionGenerator forums={forums} />
          </TabsContent>
        </Tabs>
      </Glassmorphism>
    </div>
  );
}
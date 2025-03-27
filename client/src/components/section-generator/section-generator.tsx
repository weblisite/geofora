import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types
interface Forum {
  id: number;
  name: string;
  slug: string;
}

// Form schema
const sectionGeneratorSchema = z.object({
  forumId: z.coerce.number({
    required_error: "Please select a forum"
  }),
  sectionTitle: z.string().min(3, "Section title must be at least 3 characters"),
  keywordFocus: z.string().min(2, "Keyword focus must be at least 2 characters"),
  questionCount: z.coerce.number().min(1).max(10).default(5),
  questionPersona: z.enum(["beginner", "intermediate", "expert", "moderator"]).default("expert"),
  answerPersona: z.enum(["beginner", "intermediate", "expert", "moderator"]).default("expert"),
  generateAnswers: z.boolean().default(true),
  schedulePublication: z.boolean().default(false),
  scheduledDate: z.date().optional()
});

type SectionGeneratorFormValues = z.infer<typeof sectionGeneratorSchema>;

interface SectionGeneratorProps {
  forums: Forum[];
  onSuccess?: () => void;
}

export function SectionGenerator({ forums, onSuccess }: SectionGeneratorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Default form values
  const defaultValues: Partial<SectionGeneratorFormValues> = {
    questionCount: 5,
    questionPersona: "expert",
    answerPersona: "expert",
    generateAnswers: true,
    schedulePublication: false
  };

  // Create form
  const form = useForm<SectionGeneratorFormValues>({
    resolver: zodResolver(sectionGeneratorSchema),
    defaultValues: defaultValues
  });

  // Watch schedulePublication to conditionally show date picker
  const schedulePublication = form.watch("schedulePublication");
  
  // If schedulePublication is true but scheduledDate is not set, set it to tomorrow
  if (schedulePublication && !form.getValues("scheduledDate")) {
    form.setValue("scheduledDate", new Date(Date.now() + 86400000)); // Tomorrow
  }

  // Generate section mutation
  const generateSectionMutation = useMutation({
    mutationFn: async (data: SectionGeneratorFormValues) => {
      setIsGenerating(true);
      
      // If scheduling but no date provided, set to tomorrow
      if (data.schedulePublication && !data.scheduledDate) {
        data.scheduledDate = new Date(Date.now() + 86400000);
      }
      
      const res = await apiRequest(`/api/forums/${data.forumId}/generate-section-content`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          scheduledDate: data.scheduledDate ? data.scheduledDate.toISOString() : undefined
        })
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content-schedules/upcoming"] });
      
      toast({
        title: "Section content generated",
        description: `Successfully created ${data.questions.length} questions${data.answers.length ? ` and ${data.answers.length} answers` : ''}${data.contentSchedule ? ' and scheduled for publication' : ''}.`,
      });
      
      form.reset(defaultValues);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      toast({
        title: "Failed to generate section content",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: SectionGeneratorFormValues) => {
    generateSectionMutation.mutate(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Section Content</CardTitle>
        <CardDescription>
          Create an entire section of SEO-optimized questions and answers for your forum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="sectionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter section title" {...field} />
                  </FormControl>
                  <FormDescription>
                    The title for this content section
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="keywordFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword Focus</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter main keyword or topic" {...field} />
                  </FormControl>
                  <FormDescription>
                    The primary SEO keyword or topic for this section
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={10} 
                        placeholder="5" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                      />
                    </FormControl>
                    <FormDescription>
                      How many questions to generate (1-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="generateAnswers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Generate Answers</FormLabel>
                      <FormDescription>
                        Also generate AI answers for each question
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="questionPersona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Persona</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select persona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (Basic)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Moderate)</SelectItem>
                        <SelectItem value="expert">Expert (Advanced)</SelectItem>
                        <SelectItem value="moderator">Moderator (Neutral)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Knowledge level for question generation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="answerPersona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer Persona</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select persona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (Basic)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Moderate)</SelectItem>
                        <SelectItem value="expert">Expert (Advanced)</SelectItem>
                        <SelectItem value="moderator">Moderator (Neutral)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Knowledge level for answer generation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="schedulePublication"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Schedule Publication</FormLabel>
                    <FormDescription>
                      Schedule this content for future publication
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {schedulePublication && (
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Publication Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
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
                    <FormDescription>
                      When this content will be published
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Content...
                </>
              ) : (
                "Generate Section Content"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Badge } from "@/components/ui/badge";

const sectionFormSchema = z.object({
  forumId: z.coerce.number({
    required_error: "Please select a forum",
  }),
  keyword: z.string().min(2, {
    message: "Keyword must be at least 2 characters.",
  }),
  title: z.string().min(5, {
    message: "Title must be at least 5 characters."
  }),
  description: z.string().optional(),
  questionCount: z.coerce.number().min(1).max(20).default(5),
  answerCount: z.coerce.number().min(1).max(20).default(3),
  agentType: z.enum(["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"]).default("expert"),
  relatedKeywordsCount: z.coerce.number().min(0).max(10).default(3),
  contentDepth: z.coerce.number().min(1).max(10).default(5),
});

type SectionFormValues = z.infer<typeof sectionFormSchema>;

interface Forum {
  id: number;
  name: string;
  slug: string;
}

interface Question {
  title: string;
  content: string;
  keywords: string[];
  estimatedSearchVolume: string;
  difficulty: "beginner" | "intermediate" | "expert";
}

interface Answer {
  content: string;
  agentType: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator";
  questionTitle: string;
}

interface ContentSection {
  title: string;
  description: string;
  questions: Question[];
  answers: Answer[];
  relatedKeywords: string[];
  searchEstimates: {
    totalVolume: string;
    difficultyAverage: number;
    rankingPotential: string;
  };
}

interface SectionGeneratorProps {
  forums: Forum[];
}

export function SectionGenerator({ forums }: SectionGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("generated-content");
  const [generatedSection, setGeneratedSection] = useState<ContentSection | null>(null);
  
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      forumId: 0,
      keyword: "",
      title: "",
      description: "",
      questionCount: 5,
      answerCount: 3,
      agentType: "expert",
      relatedKeywordsCount: 3,
      contentDepth: 5,
    },
  });
  
  const generateMutation = useMutation({
    mutationFn: async (data: SectionFormValues) => {
      const res = await apiRequest("POST", "/api/ai/generate-section", data);
      const result = await res.json();
      return result;
    },
    onSuccess: (data: ContentSection) => {
      setGeneratedSection(data);
      setActiveTab("generated-content");
      toast({
        title: "Section generated successfully",
        description: `Generated ${data.questions.length} questions and ${data.answers.length} answers.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating section",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!generatedSection) return null;
      
      const data = {
        ...form.getValues(),
        section: generatedSection
      };
      
      const res = await apiRequest("POST", "/api/content/publish-section", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Section published successfully",
        description: "All questions and answers have been published to your forum."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error publishing section",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: SectionFormValues) => {
    generateMutation.mutate(values);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="forumId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forum</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a forum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {forums.map((forum) => (
                          <SelectItem key={forum.id} value={forum.id.toString()}>
                            {forum.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the forum to generate content for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Keyword</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. digital marketing strategy" {...field} />
                    </FormControl>
                    <FormDescription>
                      The main keyword to optimize the section for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Complete Guide to Digital Marketing Strategy" {...field} />
                    </FormControl>
                    <FormDescription>
                      Title for this content section
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
                    <FormLabel>Section Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this section should cover" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Additional context to guide the AI
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions ({field.value})</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={20}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        How many questions to generate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="answerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answers per Question ({field.value})</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={20}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Answers to generate per question
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="agentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer Agent</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an agent" />
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
                      <FormDescription>
                        Expertise level for the generated answers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relatedKeywordsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Keywords ({field.value})</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional keywords to target
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="contentDepth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Depth ({field.value}/10)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Controls how detailed the answers will be
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Section...
                  </>
                ) : "Generate Complete Section"}
              </Button>
            </form>
          </Form>
        </div>
        
        <div>
          {!generatedSection ? (
            <div className="h-full flex items-center justify-center p-8 text-center border rounded-lg border-dashed">
              <div>
                <h3 className="text-xl font-semibold mb-2">No Generated Content Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Fill out the form to generate a complete section of SEO-optimized content
                </p>
              </div>
            </div>
          ) : (
            <Glassmorphism className="p-4">
              <Tabs defaultValue="generated-content" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="generated-content">Content</TabsTrigger>
                  <TabsTrigger value="seo-metrics">SEO Metrics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="generated-content" className="space-y-4 pt-4">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{generatedSection.title}</h3>
                    {generatedSection.description && (
                      <p className="text-muted-foreground mt-1">{generatedSection.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Generated Questions ({generatedSection.questions.length})</h4>
                    <div className="space-y-3">
                      {generatedSection.questions.slice(0, 3).map((question, idx) => (
                        <Card key={idx}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{question.title}</CardTitle>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {question.keywords.slice(0, 3).map((keyword, kidx) => (
                                <Badge key={kidx} variant="outline">{keyword}</Badge>
                              ))}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm line-clamp-2">{question.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {generatedSection.questions.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{generatedSection.questions.length - 3} more questions
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Generated Answers ({generatedSection.answers.length})</h4>
                    <div className="space-y-3">
                      {generatedSection.answers.slice(0, 2).map((answer, idx) => (
                        <Card key={idx}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{answer.questionTitle}</CardTitle>
                            <CardDescription>
                              <Badge>{answer.agentType}</Badge>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm line-clamp-3">{answer.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {generatedSection.answers.length > 2 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{generatedSection.answers.length - 2} more answers
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      onClick={() => publishMutation.mutate()}
                      disabled={publishMutation.isPending}
                    >
                      {publishMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing Section...
                        </>
                      ) : "Publish Section to Forum"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="seo-metrics" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Est. Search Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{generatedSection.searchEstimates.totalVolume}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Difficulty</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{generatedSection.searchEstimates.difficultyAverage}/100</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Ranking Potential</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{generatedSection.searchEstimates.rankingPotential}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Keywords</CardTitle>
                      <CardDescription>Keywords that are semantically related to your primary keyword</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {generatedSection.relatedKeywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Statistics</CardTitle>
                      <CardDescription>Metrics for the generated content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Questions:</span>
                        <span className="font-medium">{generatedSection.questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Answers:</span>
                        <span className="font-medium">{generatedSection.answers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Question Length:</span>
                        <span className="font-medium">
                          {Math.round(generatedSection.questions.reduce((acc, q) => 
                            acc + q.content.length, 0) / generatedSection.questions.length)} chars
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Answer Length:</span>
                        <span className="font-medium">
                          {Math.round(generatedSection.answers.reduce((acc, a) => 
                            acc + a.content.length, 0) / generatedSection.answers.length)} chars
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Glassmorphism>
          )}
        </div>
      </div>
    </div>
  );
}
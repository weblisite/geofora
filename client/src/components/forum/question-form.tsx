import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAI } from "@/hooks/use-ai";
import { FORUM_CATEGORIES } from "@/lib/constants";

const questionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(200, "Title cannot exceed 200 characters"),
  content: z.string().min(20, "Content must be at least 20 characters long"),
  categoryId: z.coerce.number(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function QuestionForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState<null | {
    keywords: string[];
    suggestions: string[];
    score: number;
  }>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { analyzeSeo } = useAI({
    onSuccess: (data) => {
      // Transform the API response to match our UI needs
      const keywords = [...(data.secondaryKeywords || [])];
      if (data.primaryKeyword) {
        keywords.unshift(data.primaryKeyword);
      }
      
      setSeoAnalysis({
        keywords: keywords,
        suggestions: data.improvementTips || [],
        score: data.seoScore || 0
      });
      setSeoScore(data.seoScore || 0);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      toast({
        title: "SEO Analysis Error",
        description: error.message,
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  });

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: 2, // Default to "Product Features"
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      return apiRequest("/api/questions", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      toast({
        title: "Question submitted",
        description: "Your question has been posted successfully",
      });
      navigate(`/forum/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit question: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: QuestionFormValues) => {
    setIsSubmitting(true);
    createQuestionMutation.mutate(data);
  };
  
  const handleSeoAnalysis = () => {
    const title = form.getValues("title");
    const content = form.getValues("content");
    
    if (title.length < 5 || content.length < 20) {
      toast({
        title: "Cannot analyze SEO",
        description: "Please provide a longer title and content for SEO analysis",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    analyzeSeo.mutate({ title, content });
  };

  // Get SEO score color
  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Glassmorphism className="gradient-border rounded-xl overflow-hidden shadow-glow">
      <div className="p-6 border-b border-dark-300">
        <div className="flex items-center space-x-3 mb-4">
          <Button 
            variant="ghost" 
            className="p-0 text-primary-400 hover:text-primary-300"
            onClick={() => navigate("/forum")}
          >
            <span className="material-icons">arrow_back</span>
          </Button>
          <h3 className="text-2xl font-semibold">Ask a Question</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={"2"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-dark-300 border-dark-400 focus:border-primary-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-200 border-dark-400">
                      {FORUM_CATEGORIES.filter(cat => cat.id !== 1).map((category) => (
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

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., What's the most effective way to implement AI-driven content strategies?" 
                      className="bg-dark-300 border-dark-400 focus:border-primary-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide specific details about your question..."
                      className="bg-dark-300 border-dark-400 focus:border-primary-500 min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* SEO Analysis Tool */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center text-sm"
                onClick={handleSeoAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Analyzing SEO...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">search</span>
                    Analyze SEO Potential
                  </>
                )}
              </Button>
              
              {seoAnalysis && (
                <div className="mt-4 bg-dark-300/50 p-4 rounded-lg border border-dark-400">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">SEO Analysis Results</h4>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">SEO Score:</span>
                      <span className={`text-lg font-bold ${getSeoScoreColor(seoScore)}`}>
                        {seoScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">SEO Potential</span>
                    </div>
                    <Progress value={seoScore} className="h-2" />
                  </div>
                  
                  {seoAnalysis.keywords.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-2">Detected Keywords</h5>
                      <div className="flex flex-wrap gap-2">
                        {seoAnalysis.keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="bg-dark-400">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {seoAnalysis.suggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Optimization Suggestions</h5>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        {seoAnalysis.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate("/forum")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Posting...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">send</span>
                    Post Question
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Glassmorphism>
  );
}

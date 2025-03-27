import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAI } from "@/hooks/use-ai";
import { QuestionWithDetails } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const answerSchema = z.object({
  content: z.string().min(20, "Answer must be at least 20 characters long"),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

interface AnswerFormProps {
  questionId: number;
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>("expert");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // States for interlinking
  const [interlinkingSuggestions, setInterlinkingSuggestions] = useState<Array<{
    questionId: number;
    title: string;
    relevanceScore: number;
    anchorText: string;
  }>>([]);
  const [isAnalyzingLinks, setIsAnalyzingLinks] = useState(false);

  // Get AI helpers
  const { generateAnswer, generateInterlinking } = useAI({
    onSuccess: (data) => {
      if (typeof data === 'string') {
        // Handle answer generation success
        form.setValue("content", data);
        setIsGeneratingAI(false);
        toast({
          title: "AI Answer Generated",
          description: `A ${selectedPersona}-level answer has been generated.`,
        });
      } else if (Array.isArray(data)) {
        // Handle interlinking suggestions success
        setInterlinkingSuggestions(data);
        setIsAnalyzingLinks(false);
        toast({
          title: "Interlinking Analysis Complete",
          description: `Found ${data.length} relevant interlinking suggestions.`,
        });
      }
    },
    onError: (error) => {
      setIsGeneratingAI(false);
      setIsAnalyzingLinks(false);
      toast({
        title: "AI Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Fetch question data for AI answer generation
  const { data: question } = useQuery<QuestionWithDetails>({
    queryKey: [`/api/questions/${questionId}`],
    enabled: !!questionId,
  });

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      content: "",
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (data: AnswerFormValues) => {
      return apiRequest(`/api/questions/${questionId}/answers`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          questionId,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${questionId}/answers`] });
      form.reset();
      toast({
        title: "Answer submitted",
        description: "Your answer has been posted successfully",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit answer: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: AnswerFormValues) => {
    setIsSubmitting(true);
    createAnswerMutation.mutate(data);
  };
  
  // Handler for AI answer generation
  const handleGenerateAIAnswer = () => {
    if (!question) return;
    
    setIsGeneratingAI(true);
    generateAnswer.mutate({ 
      questionTitle: question.title, 
      questionContent: question.content,
      personaType: selectedPersona as "beginner" | "intermediate" | "expert" | "moderator" 
    });
  };
  
  // Handler for interlinking analysis
  const handleInterlinkAnalysis = () => {
    const content = form.getValues("content");
    
    if (content.length < 20) {
      toast({
        title: "Cannot analyze interlinking",
        description: "Please provide at least 20 characters of content for analysis",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzingLinks(true);
    generateInterlinking.mutate({ content });
  };
  
  // Apply a suggested interlink to the answer content
  const applyInterlink = (suggestion: { anchorText: string; questionId: number; title: string }) => {
    const content = form.getValues("content");
    const linkText = `[${suggestion.anchorText}](/forum/${suggestion.questionId})`;
    
    // Simple replacement - in a real app, you might want to use a more sophisticated approach
    // to avoid replacing only part of a word or inside markdown links
    const newContent = content.replace(suggestion.anchorText, linkText);
    form.setValue("content", newContent);
    
    toast({
      title: "Link Applied",
      description: `Added link to "${suggestion.title}"`,
    });
  };

  return (
    <div className="p-6">
      <h4 className="text-lg font-medium mb-4">Your Answer</h4>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Glassmorphism className="p-4 rounded-lg border border-dark-400">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Share your expertise..."
                      className="w-full bg-transparent border-0 text-gray-300 text-sm p-2 focus:outline-none focus:ring-0 min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4 border-t border-dark-400">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">format_bold</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">format_italic</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">format_list_bulleted</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">link</span>
                </button>
                <button className="p-2 rounded text-gray-400 hover:text-white hover:bg-dark-300">
                  <span className="material-icons text-sm">image</span>
                </button>
              </div>

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
                  "Post Answer"
                )}
              </Button>
            </div>
          </Glassmorphism>
        </form>
      </Form>

      {/* AI Answer Generator */}
      <Glassmorphism className="mt-6 p-4 rounded-lg border border-secondary-900/30 bg-secondary-900/10">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium mb-1 flex items-center">
              <span className="material-icons text-sm mr-1 text-primary-400">smart_toy</span>
              AI Answer Generator
            </h5>
            <p className="text-xs text-gray-400">
              Let our AI generate a response based on your preferred expertise level
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedPersona}
              onValueChange={setSelectedPersona}
              disabled={isGeneratingAI}
            >
              <SelectTrigger className="w-[140px] h-8 px-2 text-xs border border-dark-400 bg-dark-800">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border border-dark-400">
                <SelectItem value="beginner" className="text-xs">Beginner</SelectItem>
                <SelectItem value="intermediate" className="text-xs">Intermediate</SelectItem>
                <SelectItem value="expert" className="text-xs">Expert</SelectItem>
                <SelectItem value="moderator" className="text-xs">Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateAIAnswer}
              disabled={isGeneratingAI || !question}
              className="h-8 text-xs"
            >
              {isGeneratingAI ? (
                <>
                  <span className="material-icons animate-spin mr-1 text-xs">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-icons mr-1 text-xs">auto_awesome</span>
                  Generate Answer
                </>
              )}
            </Button>
          </div>
        </div>
      </Glassmorphism>
      
      {/* Interlinking Analysis */}
      <Glassmorphism className="mt-4 p-4 rounded-lg border border-primary-900/30 bg-primary-900/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h5 className="text-sm font-medium mb-1 flex items-center">
              <span className="material-icons text-sm mr-1 text-secondary-400">link</span>
              SEO Interlinking Analysis
            </h5>
            <p className="text-xs text-gray-400">
              Find internal link opportunities to boost SEO and keep users engaged
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleInterlinkAnalysis}
            disabled={isAnalyzingLinks || form.getValues("content").length < 20}
            className="h-8 text-xs"
          >
            {isAnalyzingLinks ? (
              <>
                <span className="material-icons animate-spin mr-1 text-xs">refresh</span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-icons mr-1 text-xs">travel_explore</span>
                Find Link Opportunities
              </>
            )}
          </Button>
        </div>
        
        {interlinkingSuggestions.length > 0 && (
          <div className="mt-3 max-h-[200px] overflow-y-auto">
            <div className="text-xs text-gray-400 mb-2">Suggested interlinking opportunities:</div>
            <div className="space-y-2">
              {interlinkingSuggestions
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-dark-300/50 p-2 rounded-md border border-dark-400"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-xs font-medium truncate">{suggestion.title}</span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary-900/50 text-primary-300">
                          {suggestion.relevanceScore}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        <span className="font-mono bg-dark-400 px-1 py-0.5 rounded text-gray-300">{suggestion.anchorText}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-xs"
                      onClick={() => applyInterlink(suggestion)}
                    >
                      <span className="material-icons text-xs mr-1">add_link</span>
                      Apply
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Glassmorphism>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          By posting, you agree to our <a href="#" className="text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-400 hover:underline">Community Guidelines</a>.
        </p>
      </div>
    </div>
  );
}

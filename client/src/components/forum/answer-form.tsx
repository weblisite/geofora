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
  
  // Get AI helpers
  const { generateAnswer } = useAI({
    onSuccess: (data) => {
      form.setValue("content", data);
      setIsGeneratingAI(false);
      toast({
        title: "AI Answer Generated",
        description: `A ${selectedPersona}-level answer has been generated.`,
      });
    },
    onError: () => {
      setIsGeneratingAI(false);
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

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          By posting, you agree to our <a href="#" className="text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-400 hover:underline">Community Guidelines</a>.
        </p>
      </div>
    </div>
  );
}

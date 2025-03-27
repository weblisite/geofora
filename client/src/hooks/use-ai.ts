import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PersonaType = "beginner" | "intermediate" | "expert" | "moderator";

interface UseAIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAI(options?: UseAIOptions) {
  const { toast } = useToast();
  const defaultOptions = {
    onSuccess: (data: any) => data,
    onError: (error: Error) => {
      toast({
        title: "AI Error",
        description: `Failed to process AI request: ${error.message}`,
        variant: "destructive",
      });
    },
    ...options,
  };

  // Generate AI content based on prompt and persona
  const generateContent = useMutation({
    mutationFn: async ({ prompt, personaType }: { prompt: string; personaType: PersonaType }) => {
      const response = await apiRequest("/api/ai/generate-content", {
        method: "POST",
        body: JSON.stringify({ prompt, personaType }),
      }) as any;
      return response.content;
    },
    onSuccess: defaultOptions.onSuccess,
    onError: defaultOptions.onError,
  });

  // Generate SEO-optimized questions
  const generateSeoQuestions = useMutation({
    mutationFn: async ({ 
      topic, 
      count = 5, 
      personaType = "beginner" 
    }: { 
      topic: string; 
      count?: number; 
      personaType?: PersonaType 
    }) => {
      const response = await apiRequest("/api/ai/generate-seo-questions", {
        method: "POST",
        body: JSON.stringify({ topic, count, personaType }),
      }) as any;
      return response.questions;
    },
    onSuccess: defaultOptions.onSuccess,
    onError: defaultOptions.onError,
  });

  // Analyze question for SEO optimization
  const analyzeSeo = useMutation({
    mutationFn: async ({ 
      title, 
      content 
    }: { 
      title: string; 
      content: string;
    }) => {
      const response = await apiRequest("/api/ai/analyze-seo", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      }) as any;
      return response;
    },
    onSuccess: defaultOptions.onSuccess,
    onError: defaultOptions.onError,
  });

  // Generate an AI answer to a question
  const generateAnswer = useMutation({
    mutationFn: async ({ 
      questionTitle, 
      questionContent,
      personaType = "expert" 
    }: { 
      questionTitle: string;
      questionContent: string;
      personaType?: PersonaType 
    }) => {
      const response = await apiRequest("/api/ai/generate-answer", {
        method: "POST",
        body: JSON.stringify({ questionTitle, questionContent, personaType }),
      }) as any;
      return response;
    },
    onSuccess: defaultOptions.onSuccess,
    onError: defaultOptions.onError,
  });

  // Generate interlinking suggestions for content
  const generateInterlinking = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await apiRequest("/api/ai/generate-interlinking", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      
      // Return the suggestions array from the response
      return response.suggestions || [];
    },
    onSuccess: (data) => {
      if (defaultOptions.onSuccess) {
        defaultOptions.onSuccess(data);
      }
    },
    onError: defaultOptions.onError,
  });

  return {
    generateContent,
    generateSeoQuestions,
    analyzeSeo,
    generateAnswer,
    generateInterlinking,
  };
}
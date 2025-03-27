import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type KeywordDifficulty = "beginner" | "intermediate" | "expert";

export interface KeywordQuestion {
  title: string;
  content: string;
  keywords: string[];
  difficulty: KeywordDifficulty;
  estimatedSearchVolume: string;
}

export interface KeywordAnalysisResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  questions: KeywordQuestion[];
  topicsToTarget: string[];
  contentGaps: string[];
  competitorInsights: string[];
}

interface UseKeywordAnalysisOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useKeywordAnalysis(options?: UseKeywordAnalysisOptions) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mutation for analyzing a website URL for keywords
  const analyzeWebsiteKeywordsMutation = useMutation<
    KeywordAnalysisResult, 
    Error, 
    { websiteUrl: string, questionCount?: number }
  >({
    mutationFn: async ({ websiteUrl, questionCount }) => {
      const data = await apiRequest("/api/ai/analyze-website-keywords", {
        method: "POST",
        body: JSON.stringify({ websiteUrl, questionCount }),
      });
      return data as KeywordAnalysisResult;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze website keywords",
        description: error.message,
        variant: "destructive",
      });
      options?.onError?.(error);
    },
  });

  // Mutation for generating keyword optimized questions
  const generateKeywordQuestionsMutation = useMutation<
    { questions: KeywordQuestion[] },
    Error,
    { keyword: string, count?: number, difficulty?: KeywordDifficulty }
  >({
    mutationFn: async ({ keyword, count, difficulty }) => {
      const data = await apiRequest("/api/ai/generate-keyword-questions", {
        method: "POST",
        body: JSON.stringify({ keyword, count, difficulty }),
      });
      return data as { questions: KeywordQuestion[] };
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate keyword questions",
        description: error.message,
        variant: "destructive",
      });
      options?.onError?.(error);
    },
  });

  // Function to analyze keywords for a specific forum
  const analyzeForumKeywords = async (forumId: number): Promise<KeywordAnalysisResult> => {
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/forums/${forumId}/analyze-keywords`, {
        method: "POST",
      });
      options?.onSuccess?.(data);
      return data as KeywordAnalysisResult;
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Failed to analyze forum keywords",
        description: err.message,
        variant: "destructive",
      });
      options?.onError?.(err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeWebsiteKeywordsMutation,
    generateKeywordQuestionsMutation,
    analyzeForumKeywords,
    isLoading: isLoading || analyzeWebsiteKeywordsMutation.isPending || generateKeywordQuestionsMutation.isPending,
  };
}
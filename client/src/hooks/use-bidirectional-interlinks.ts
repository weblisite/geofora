import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Interface for bidirectional interlinking suggestions
export interface BidirectionalInterlinkSuggestion {
  sourceId: number;
  sourceType: string;
  sourceTitle: string;
  targetId: number;
  targetType: string;
  targetTitle: string;
  anchorText: string;
  relevanceScore: number;
  contextRelevance: string;
  bidirectional: boolean;
}

interface UseBidirectionalInterlinksOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for managing bidirectional interlinking between forum content and main website
 */
export function useBidirectionalInterlinks(options?: UseBidirectionalInterlinksOptions) {
  const { toast } = useToast();
  const defaultOptions = {
    onSuccess: (data: any) => data,
    onError: (error: Error) => {
      toast({
        title: "Bidirectional Interlinking Error",
        description: `Failed to process interlinking request: ${error.message}`,
        variant: "destructive",
      });
    },
    ...options,
  };

  // Get bidirectional interlinking suggestions between forum content and main site
  const getBidirectionalSuggestions = useMutation({
    mutationFn: async ({
      forumContentIds,
      mainSiteContentIds,
      maxSuggestionsPerItem = 3
    }: {
      forumContentIds: Array<{ id: number; type: "question" | "answer" }>;
      mainSiteContentIds: Array<{ id: number; type: "main_page" }>;
      maxSuggestionsPerItem?: number;
    }) => {
      return apiRequest("/api/interlinks/bidirectional", {
        method: "POST",
        body: JSON.stringify({
          forumContentIds,
          mainSiteContentIds,
          maxSuggestionsPerItem
        }),
      });
    },
    onSuccess: defaultOptions.onSuccess,
    onError: defaultOptions.onError,
  });

  // Create multiple interlinks from a bidirectional suggestion
  const createBidirectionalInterlinks = useMutation({
    mutationFn: async (suggestion: BidirectionalInterlinkSuggestion) => {
      const interlinks = [];
      
      // Forward link (source -> target)
      const forwardLink = await apiRequest("/api/interlinks", {
        method: "POST",
        body: JSON.stringify({
          sourceType: suggestion.sourceType,
          sourceId: suggestion.sourceId,
          targetType: suggestion.targetType,
          targetId: suggestion.targetId,
          anchorText: suggestion.anchorText,
          relevanceScore: suggestion.relevanceScore,
          automatic: true
        }),
      });
      
      interlinks.push(forwardLink);
      
      // If bidirectional, create reverse link as well
      if (suggestion.bidirectional) {
        // For the reverse link, we need to find an appropriate anchor text
        // This would be better if done on the server, but for simplicity we'll use the target title
        const anchorText = suggestion.sourceTitle.substring(0, 40);
        
        const reverseLink = await apiRequest("/api/interlinks", {
          method: "POST",
          body: JSON.stringify({
            sourceType: suggestion.targetType,
            sourceId: suggestion.targetId,
            targetType: suggestion.sourceType,
            targetId: suggestion.sourceId,
            anchorText: anchorText,
            relevanceScore: suggestion.relevanceScore,
            automatic: true
          }),
        });
        
        interlinks.push(reverseLink);
      }
      
      return interlinks;
    },
    onSuccess: (data) => {
      // Invalidate both source and target interlinks
      queryClient.invalidateQueries({ 
        queryKey: ["/api/interlinks"] 
      });
      defaultOptions.onSuccess(data);
    },
    onError: defaultOptions.onError,
  });

  // Generate optimal interlinking strategy between forum and main site
  const generateInterlinkingStrategy = useMutation({
    mutationFn: async ({
      forumId,
      previewOnly = false
    }: {
      forumId: number;
      previewOnly?: boolean;
    }) => {
      return apiRequest("/api/interlinks/strategy", {
        method: "POST",
        body: JSON.stringify({
          forumId,
          previewOnly
        }),
      });
    },
    onSuccess: (data) => {
      if (!data.previewOnly) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/interlinks"] 
        });
      }
      defaultOptions.onSuccess(data);
    },
    onError: defaultOptions.onError,
  });

  // Get content suitable for interlinking from either forum or main site
  const getInterlinkableContent = (source: "forum" | "main_site", limit: number = 20) =>
    useQuery({
      queryKey: ["/api/interlinks/content", source, limit],
      enabled: !!source,
    });

  return {
    getBidirectionalSuggestions,
    createBidirectionalInterlinks,
    generateInterlinkingStrategy,
    getInterlinkableContent
  };
}
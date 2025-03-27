import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ContentInterlink, InsertContentInterlink, MainSitePage } from "@shared/schema";

interface UseInterlinksOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useInterlinks(options?: UseInterlinksOptions) {
  const { toast } = useToast();
  const defaultOptions = {
    onSuccess: (data: any) => data,
    onError: (error: Error) => {
      toast({
        title: "Interlinking Error",
        description: `Failed to process interlinking request: ${error.message}`,
        variant: "destructive",
      });
    },
    ...options,
  };

  // Get all main site pages
  const getAllMainSitePages = useQuery({
    queryKey: ["/api/main-pages"],
  });

  // Get a main site page by ID with its links
  const getMainSitePage = (id: number) => 
    useQuery({
      queryKey: ["/api/main-pages", id],
      enabled: !!id,
    });

  // Get a main site page by slug
  const getMainSitePageBySlug = (slug: string) =>
    useQuery({
      queryKey: ["/api/main-pages/by-slug", slug],
      enabled: !!slug,
    });

  // Create a new main site page
  const createMainSitePage = useMutation({
    mutationFn: async (pageData: Omit<InsertContentInterlink, "id">) => {
      return await apiRequest("/api/main-pages", {
        method: "POST",
        body: JSON.stringify(pageData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/main-pages"] });
      defaultOptions.onSuccess(data);
    },
    onError: defaultOptions.onError,
  });

  // Create a new content interlink
  const createContentInterlink = useMutation({
    mutationFn: async (interlink: Omit<InsertContentInterlink, "id">) => {
      return await apiRequest("/api/interlinks", {
        method: "POST",
        body: JSON.stringify(interlink),
      });
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: [
          "/api/interlinks/source", 
          data.sourceType, 
          data.sourceId
        ] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [
          "/api/interlinks/target", 
          data.targetType, 
          data.targetId
        ]
      });
      defaultOptions.onSuccess(data);
    },
    onError: defaultOptions.onError,
  });

  // Get interlinks for a source
  const getSourceInterlinks = (sourceType: string, sourceId: number) =>
    useQuery({
      queryKey: ["/api/interlinks/source", sourceType, sourceId],
      enabled: !!sourceType && !!sourceId,
    });

  // Get interlinks for a target
  const getTargetInterlinks = (targetType: string, targetId: number) =>
    useQuery({
      queryKey: ["/api/interlinks/target", targetType, targetId],
      enabled: !!targetType && !!targetId,
    });

  // Get relevant content for interlinking
  const getRelevantContent = (contentType: string, contentId: number, limit: number = 5) =>
    useQuery({
      queryKey: ["/api/interlinks/relevant", contentType, contentId, limit],
      enabled: !!contentType && !!contentId,
    });

  return {
    getAllMainSitePages,
    getMainSitePage,
    getMainSitePageBySlug,
    createMainSitePage,
    createContentInterlink,
    getSourceInterlinks,
    getTargetInterlinks,
    getRelevantContent,
  };
}
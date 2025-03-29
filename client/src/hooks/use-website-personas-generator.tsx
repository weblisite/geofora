import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Props for the useWebsitePersonasGenerator hook
 */
interface UseWebsitePersonasGeneratorProps {
  initialWebsiteUrl?: string;
  initialPersonaCount?: number;
  onWebsiteUrlChange?: (url: string) => void;
  onPersonaCountChange?: (count: number) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

/**
 * Custom hook for generating AI personas from website content
 */
export function useWebsitePersonasGenerator({
  initialWebsiteUrl = '',
  initialPersonaCount = 3,
  onWebsiteUrlChange,
  onPersonaCountChange,
  onGeneratingChange
}: UseWebsitePersonasGeneratorProps = {}) {
  // Use separate internal state if no external state handlers provided
  const [internalIsGenerating, setInternalIsGenerating] = useState(false);
  const [internalWebsiteUrl, setInternalWebsiteUrl] = useState(initialWebsiteUrl);
  const [internalPersonaCount, setInternalPersonaCount] = useState(initialPersonaCount);
  
  // Helper functions to update both internal state and call external handlers if provided
  const setIsGenerating = (value: boolean) => {
    setInternalIsGenerating(value);
    if (onGeneratingChange) onGeneratingChange(value);
  };
  
  const setWebsiteUrl = (value: string) => {
    setInternalWebsiteUrl(value);
    if (onWebsiteUrlChange) onWebsiteUrlChange(value);
  };
  
  const setPersonaCount = (value: number) => {
    setInternalPersonaCount(value);
    if (onPersonaCountChange) onPersonaCountChange(value);
  };
  
  // Use external state if handler is provided, otherwise use internal state
  const isGenerating = onGeneratingChange ? false : internalIsGenerating;
  const websiteUrl = onWebsiteUrlChange ? initialWebsiteUrl : internalWebsiteUrl;
  const personaCount = onPersonaCountChange ? initialPersonaCount : internalPersonaCount;
  
  const queryClient = useQueryClient();

  /**
   * Generate AI personas from the website content
   */
  const generatePersonasFromWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: 'Website URL required',
        description: 'Please enter a valid website URL to generate personas.',
        variant: 'destructive',
      });
      return;
    }

    // Simple URL validation
    try {
      new URL(websiteUrl);
    } catch (e) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL (e.g., https://example.com).',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await apiRequest('/api/ai-personas/generate', {
        method: 'POST',
        body: JSON.stringify({
          websiteUrl,
          count: personaCount, // Make sure the parameter is named correctly
        }),
      });

      // Invalidate the AI personas cache to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/ai-personas'] });
      
      const data = await result.json();

      toast({
        title: 'Personas generated',
        description: `Successfully created ${data.length || data.count || 'multiple'} AI personas based on website content.`,
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate personas from website.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    websiteUrl,
    setWebsiteUrl,
    personaCount,
    setPersonaCount,
    isGenerating,
    generatePersonasFromWebsite,
  };
}
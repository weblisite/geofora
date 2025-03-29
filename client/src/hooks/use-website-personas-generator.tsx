import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Custom hook for generating AI personas from website content
 */
export function useWebsitePersonasGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [personaCount, setPersonaCount] = useState(3);
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

      toast({
        title: 'Personas generated',
        description: `Successfully created ${result.length} AI personas based on website content.`,
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
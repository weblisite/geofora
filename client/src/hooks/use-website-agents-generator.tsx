import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Props for the useWebsiteAgentsGenerator hook
 */
interface UseWebsiteAgentsGeneratorProps {
  initialWebsiteUrl?: string;
  initialAgentCount?: number;
  onWebsiteUrlChange?: (url: string) => void;
  onAgentCountChange?: (count: number) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

/**
 * Custom hook for generating AI agents from website content
 */
export function useWebsiteAgentsGenerator({
  initialWebsiteUrl = '',
  initialAgentCount = 3,
  onWebsiteUrlChange,
  onAgentCountChange,
  onGeneratingChange
}: UseWebsiteAgentsGeneratorProps = {}) {
  // Use separate internal state if no external state handlers provided
  const [internalIsGenerating, setInternalIsGenerating] = useState(false);
  const [internalWebsiteUrl, setInternalWebsiteUrl] = useState(initialWebsiteUrl);
  const [internalAgentCount, setInternalAgentCount] = useState(initialAgentCount);
  
  // Helper functions to update both internal state and call external handlers if provided
  const setIsGenerating = (value: boolean) => {
    setInternalIsGenerating(value);
    if (onGeneratingChange) onGeneratingChange(value);
  };
  
  const setWebsiteUrl = (value: string) => {
    setInternalWebsiteUrl(value);
    if (onWebsiteUrlChange) onWebsiteUrlChange(value);
  };
  
  const setAgentCount = (value: number) => {
    setInternalAgentCount(value);
    if (onAgentCountChange) onAgentCountChange(value);
  };
  
  // Use external state if handler is provided, otherwise use internal state
  const isGenerating = onGeneratingChange ? false : internalIsGenerating;
  const websiteUrl = onWebsiteUrlChange ? initialWebsiteUrl : internalWebsiteUrl;
  const agentCount = onAgentCountChange ? initialAgentCount : internalAgentCount;
  
  const queryClient = useQueryClient();

  /**
   * Generate AI agents from the website content
   */
  const generateAgentsFromWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: 'Website URL required',
        description: 'Please enter a valid website URL to generate agents.',
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
      const result = await apiRequest('/api/ai-agents/generate', {
        method: 'POST',
        body: JSON.stringify({
          websiteUrl,
          count: agentCount, // Make sure the parameter is named correctly
        }),
      });

      // Invalidate the AI agents cache to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agents'] });
      
      const data = await result.json();

      toast({
        title: 'Agents generated',
        description: `Successfully created ${data.length || data.count || 'multiple'} AI agents based on website content.`,
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate agents from website.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    websiteUrl,
    setWebsiteUrl,
    agentCount,
    setAgentCount,
    isGenerating,
    generateAgentsFromWebsite,
  };
}
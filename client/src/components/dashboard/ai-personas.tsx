import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, Users, Zap, TrendingUp, BarChart3, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AIProvider {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  rateLimits: {
    tokensPerMinute: number;
    requestsPerMinute: number;
  };
  capabilities: {
    supportsStreaming: boolean;
    supportsVision: boolean;
  };
}

interface AIPersona {
  id: number;
  name: string;
  era: string;
  provider: string;
  model: string;
  knowledgeLevel: string;
  personality: string;
  useCase: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

interface BusinessAnalysis {
  industry: string;
  confidence: number;
  keywords: string[];
  brandVoice: string;
  targetAudience: string;
  competitiveAdvantage: string;
}

interface TemporalDialogue {
  id: string;
  title: string;
  participants: string[];
  messages: Array<{
    persona: string;
    content: string;
    timestamp: string;
  }>;
  status: 'active' | 'completed' | 'paused';
}

export default function AIPersonasDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [activeTab, setActiveTab] = useState('personas');

  // Fetch AI Providers
  const { data: aiProviders, isLoading: providersLoading } = useQuery<AIProvider[]>({
    queryKey: ['/api/ai/providers'],
    queryFn: async () => {
      const res = await apiRequest('/api/ai/providers', { method: 'GET' });
      const data = await res.json();
      return data.data || [];
    },
  });

  // Fetch AI Personas
  const { data: aiPersonas, isLoading: personasLoading } = useQuery<AIPersona[]>({
    queryKey: ['/api/personas'],
    queryFn: async () => {
      const res = await apiRequest('/api/personas', { method: 'GET' });
      const data = await res.json();
      return data.data || [];
    },
  });

  // Fetch Business Analysis
  const { data: businessAnalysis, isLoading: analysisLoading } = useQuery<BusinessAnalysis>({
    queryKey: ['/api/business-analysis/current'],
    queryFn: async () => {
      const res = await apiRequest('/api/business-analysis/current', { method: 'GET' });
      return await res.json();
    },
  });

  // Fetch Temporal Dialogues
  const { data: temporalDialogues, isLoading: dialoguesLoading } = useQuery<TemporalDialogue[]>({
    queryKey: ['/api/temporal-dialogue/list'],
    queryFn: async () => {
      const res = await apiRequest('/api/temporal-dialogue/list', { method: 'GET' });
      return await res.json();
    },
  });

  // Generate Temporal Dialogue
  const generateDialogueMutation = useMutation({
    mutationFn: async (data: { topic: string; personas: string[] }) => {
      const res = await apiRequest('/api/temporal-dialogue/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/temporal-dialogue/list'] });
      toast({
        title: 'Success',
        description: 'Temporal dialogue generated successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate temporal dialogue.',
        variant: 'destructive',
      });
    },
  });

  // Analyze Business
  const analyzeBusinessMutation = useMutation({
    mutationFn: async (data: { website: string; description: string }) => {
      const res = await apiRequest('/api/business-analysis/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-analysis/current'] });
      toast({
        title: 'Success',
        description: 'Business analysis completed!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to analyze business.',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateDialogue = () => {
    const topic = (document.getElementById('dialogue-topic') as HTMLInputElement)?.value;
    const selectedPersonas = aiPersonas?.filter(p => p.active).map(p => p.name) || [];
    
    if (!topic) {
      toast({
        title: 'Error',
        description: 'Please enter a topic for the dialogue.',
        variant: 'destructive',
      });
      return;
    }

    generateDialogueMutation.mutate({
      topic,
      personas: selectedPersonas,
    });
  };

  const handleAnalyzeBusiness = () => {
    const website = (document.getElementById('business-website') as HTMLInputElement)?.value;
    const description = (document.getElementById('business-description') as HTMLTextAreaElement)?.value;
    
    if (!website || !description) {
      toast({
        title: 'Error',
        description: 'Please enter both website and description.',
        variant: 'destructive',
      });
      return;
    }

    analyzeBusinessMutation.mutate({
      website,
      description,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Personas & Business Analysis</h2>
          <p className="text-gray-600">Manage AI personas and analyze your business context</p>
        </div>
        <Badge variant="outline" className="text-sm">
          GEOFORA Multi-Model Intelligence
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="personas">AI Personas</TabsTrigger>
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
          <TabsTrigger value="analysis">Business Analysis</TabsTrigger>
          <TabsTrigger value="dialogues">Temporal Dialogues</TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personasLoading ? (
              <div className="col-span-full flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading personas...</span>
              </div>
            ) : (
              aiPersonas?.map((persona) => (
                <Card key={persona.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{persona.displayName || persona.name || 'Unknown'}</CardTitle>
                      <Badge variant={persona.active ? 'default' : 'secondary'}>
                        {persona.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{persona.description || 'No description available'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Brain className="h-4 w-4 mr-2" />
                        {persona.personality || 'Not specified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {persona.expertise || 'Not specified'}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Usage: {persona.usageCount || 0}</span>
                        <span className="text-gray-600">Rating: {persona.rating ? persona.rating.toFixed(1) : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providersLoading ? (
              <div className="col-span-full flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading providers...</span>
              </div>
            ) : (
              aiProviders?.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{provider.displayName}</CardTitle>
                      <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Zap className="h-4 w-4 mr-2" />
                        {provider.rateLimits?.tokensPerMinute || 'N/A'} tokens/min
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {provider.rateLimits?.requestsPerMinute || 'N/A'} requests/min
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Settings className="h-4 w-4 mr-2" />
                        {provider.capabilities?.supportsStreaming ? 'Streaming' : 'No Streaming'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Analysis</CardTitle>
              <CardDescription>Analyze your business context for AI content generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-website">Website URL</Label>
                  <Input
                    id="business-website"
                    placeholder="https://your-website.com"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="business-description">Business Description</Label>
                  <Textarea
                    id="business-description"
                    placeholder="Describe your business, products, and services..."
                    rows={3}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAnalyzeBusiness}
                disabled={analyzeBusinessMutation.isPending}
                className="w-full"
              >
                {analyzeBusinessMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Business
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {businessAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Industry</Label>
                    <p className="text-sm font-medium">{businessAnalysis.industry}</p>
                    <p className="text-xs text-gray-600">Confidence: {(businessAnalysis.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <Label>Brand Voice</Label>
                    <p className="text-sm">{businessAnalysis.brandVoice}</p>
                  </div>
                </div>
                <div>
                  <Label>Target Keywords</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {businessAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <p className="text-sm">{businessAnalysis.targetAudience}</p>
                </div>
                <div>
                  <Label>Competitive Advantage</Label>
                  <p className="text-sm">{businessAnalysis.competitiveAdvantage}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dialogues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Temporal Dialogue</CardTitle>
              <CardDescription>Create multi-era conversations between AI personas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dialogue-topic">Dialogue Topic</Label>
                <Input
                  id="dialogue-topic"
                  placeholder="e.g., Future of AI in Healthcare"
                />
              </div>
              <Button 
                onClick={handleGenerateDialogue}
                disabled={generateDialogueMutation.isPending}
                className="w-full"
              >
                {generateDialogueMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Generate Dialogue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {dialoguesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dialogues...</span>
              </div>
            ) : (
              temporalDialogues?.map((dialogue) => (
                <Card key={dialogue.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{dialogue.title}</CardTitle>
                      <Badge variant={dialogue.status === 'active' ? 'default' : 'secondary'}>
                        {dialogue.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Participants: {dialogue.participants.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dialogue.messages.map((message, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {message.persona}
                            </Badge>
                            <span className="text-xs text-gray-500">{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

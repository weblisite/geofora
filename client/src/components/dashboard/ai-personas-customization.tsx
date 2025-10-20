import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  TestTube, 
  Users, 
  Brain, 
  MessageSquare, 
  Target,
  Zap,
  Settings,
  Copy,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface AIPersona {
  id: string;
  name: string;
  description: string;
  personality: string;
  expertise: string[];
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational';
  knowledgeLevel: 'beginner' | 'intermediate' | 'expert';
  responseLength: 'short' | 'medium' | 'long';
  brandVoice: string;
  customPrompts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PersonaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Partial<AIPersona>;
}

const personaTemplates: PersonaTemplate[] = [
  {
    id: 'tech-expert',
    name: 'Tech Expert',
    description: 'Knowledgeable technology professional',
    category: 'Technology',
    template: {
      personality: 'Analytical and detail-oriented with deep technical knowledge',
      expertise: ['Technology', 'Software Development', 'AI/ML'],
      tone: 'professional',
      knowledgeLevel: 'expert',
      responseLength: 'medium',
      brandVoice: 'Technical expertise with clear explanations'
    }
  },
  {
    id: 'business-consultant',
    name: 'Business Consultant',
    description: 'Strategic business advisor',
    category: 'Business',
    template: {
      personality: 'Strategic thinker with business acumen',
      expertise: ['Business Strategy', 'Marketing', 'Operations'],
      tone: 'authoritative',
      knowledgeLevel: 'expert',
      responseLength: 'long',
      brandVoice: 'Professional insights with actionable recommendations'
    }
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Helpful customer service representative',
    category: 'Support',
    template: {
      personality: 'Empathetic and solution-focused',
      expertise: ['Customer Service', 'Problem Solving', 'Communication'],
      tone: 'friendly',
      knowledgeLevel: 'intermediate',
      responseLength: 'medium',
      brandVoice: 'Helpful and understanding with clear solutions'
    }
  },
  {
    id: 'marketing-specialist',
    name: 'Marketing Specialist',
    description: 'Creative marketing professional',
    category: 'Marketing',
    template: {
      personality: 'Creative and data-driven',
      expertise: ['Digital Marketing', 'Content Strategy', 'Branding'],
      tone: 'conversational',
      knowledgeLevel: 'expert',
      responseLength: 'medium',
      brandVoice: 'Creative insights with data-backed recommendations'
    }
  }
];

export default function AIPersonasCustomization() {
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testQuestion, setTestQuestion] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const queryClient = useQueryClient();

  // Fetch AI personas
  const { data: personas = [], isLoading: personasLoading } = useQuery({
    queryKey: ['/api/ai-personas'],
    queryFn: async () => {
      const response = await fetch('/api/ai-personas');
      if (!response.ok) throw new Error('Failed to fetch personas');
      return response.json();
    }
  });

  // Create persona mutation
  const createPersonaMutation = useMutation({
    mutationFn: async (personaData: Partial<AIPersona>) => {
      const response = await fetch('/api/ai-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaData)
      });
      if (!response.ok) throw new Error('Failed to create persona');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-personas'] });
      toast.success('AI Persona created successfully');
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create persona: ${error.message}`);
    }
  });

  // Update persona mutation
  const updatePersonaMutation = useMutation({
    mutationFn: async ({ id, ...personaData }: Partial<AIPersona> & { id: string }) => {
      const response = await fetch(`/api/ai-personas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaData)
      });
      if (!response.ok) throw new Error('Failed to update persona');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-personas'] });
      toast.success('AI Persona updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update persona: ${error.message}`);
    }
  });

  // Delete persona mutation
  const deletePersonaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/ai-personas/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete persona');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-personas'] });
      toast.success('AI Persona deleted successfully');
      setSelectedPersona(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete persona: ${error.message}`);
    }
  });

  // Test persona mutation
  const testPersonaMutation = useMutation({
    mutationFn: async ({ personaId, question }: { personaId: string; question: string }) => {
      const response = await fetch('/api/ai-personas/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, question })
      });
      if (!response.ok) throw new Error('Failed to test persona');
      return response.json();
    },
    onSuccess: (data) => {
      setTestResponse(data.response);
      toast.success('Persona test completed');
    },
    onError: (error) => {
      toast.error(`Failed to test persona: ${error.message}`);
    }
  });

  const handleCreatePersona = (template?: PersonaTemplate) => {
    const newPersona: Partial<AIPersona> = {
      name: '',
      description: '',
      personality: '',
      expertise: [],
      tone: 'professional',
      knowledgeLevel: 'intermediate',
      responseLength: 'medium',
      brandVoice: '',
      customPrompts: [],
      isActive: true,
      ...template?.template
    };
    setSelectedPersona(newPersona as AIPersona);
    setIsCreating(true);
  };

  const handleSavePersona = () => {
    if (!selectedPersona) return;

    if (isCreating) {
      createPersonaMutation.mutate(selectedPersona);
    } else {
      updatePersonaMutation.mutate(selectedPersona);
    }
  };

  const handleTestPersona = () => {
    if (!selectedPersona?.id || !testQuestion) return;
    testPersonaMutation.mutate({ personaId: selectedPersona.id, question: testQuestion });
  };

  const handleDeletePersona = () => {
    if (!selectedPersona?.id) return;
    if (confirm('Are you sure you want to delete this persona?')) {
      deletePersonaMutation.mutate(selectedPersona.id);
    }
  };

  const addCustomPrompt = () => {
    if (!selectedPersona) return;
    setSelectedPersona({
      ...selectedPersona,
      customPrompts: [...selectedPersona.customPrompts, '']
    });
  };

  const updateCustomPrompt = (index: number, value: string) => {
    if (!selectedPersona) return;
    const updatedPrompts = [...selectedPersona.customPrompts];
    updatedPrompts[index] = value;
    setSelectedPersona({
      ...selectedPersona,
      customPrompts: updatedPrompts
    });
  };

  const removeCustomPrompt = (index: number) => {
    if (!selectedPersona) return;
    const updatedPrompts = selectedPersona.customPrompts.filter((_, i) => i !== index);
    setSelectedPersona({
      ...selectedPersona,
      customPrompts: updatedPrompts
    });
  };

  const addExpertise = (expertise: string) => {
    if (!selectedPersona || selectedPersona.expertise.includes(expertise)) return;
    setSelectedPersona({
      ...selectedPersona,
      expertise: [...selectedPersona.expertise, expertise]
    });
  };

  const removeExpertise = (expertise: string) => {
    if (!selectedPersona) return;
    setSelectedPersona({
      ...selectedPersona,
      expertise: selectedPersona.expertise.filter(e => e !== expertise)
    });
  };

  if (personasLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AI personas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Personas Customization</h1>
          <p className="text-muted-foreground">
            Define and fine-tune AI personas to match your brand voice and expertise
          </p>
        </div>
        <Button onClick={() => handleCreatePersona()} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Persona
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personas List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Personas
              </CardTitle>
              <CardDescription>
                Manage your AI personas and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {personas.map((persona: AIPersona) => (
                <div
                  key={persona.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPersona?.id === persona.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedPersona(persona);
                    setIsCreating(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">{persona.name}</span>
                      {persona.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPersona(persona);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {persona.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {persona.expertise.slice(0, 3).map((exp) => (
                      <Badge key={exp} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                    {persona.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{persona.expertise.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {personas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI personas created yet</p>
                  <p className="text-sm">Create your first persona to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Templates
              </CardTitle>
              <CardDescription>
                Start with pre-built persona templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {personaTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCreatePersona(template)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Persona Editor */}
        <div className="lg:col-span-2">
          {selectedPersona ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {isCreating ? 'Create New Persona' : 'Edit Persona'}
                    </CardTitle>
                    <CardDescription>
                      Configure your AI persona's behavior and characteristics
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isCreating && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeletePersona}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button onClick={handleSavePersona} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="personality">Personality</TabsTrigger>
                    <TabsTrigger value="prompts">Custom Prompts</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Persona Name</Label>
                        <Input
                          id="name"
                          value={selectedPersona.name}
                          onChange={(e) => setSelectedPersona({
                            ...selectedPersona,
                            name: e.target.value
                          })}
                          placeholder="e.g., Tech Expert, Business Consultant"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tone">Communication Tone</Label>
                        <Select
                          value={selectedPersona.tone}
                          onValueChange={(value: any) => setSelectedPersona({
                            ...selectedPersona,
                            tone: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="authoritative">Authoritative</SelectItem>
                            <SelectItem value="conversational">Conversational</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={selectedPersona.description}
                        onChange={(e) => setSelectedPersona({
                          ...selectedPersona,
                          description: e.target.value
                        })}
                        placeholder="Brief description of this persona's role and expertise"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brandVoice">Brand Voice</Label>
                      <Textarea
                        id="brandVoice"
                        value={selectedPersona.brandVoice}
                        onChange={(e) => setSelectedPersona({
                          ...selectedPersona,
                          brandVoice: e.target.value
                        })}
                        placeholder="Describe how this persona should represent your brand voice"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="knowledgeLevel">Knowledge Level</Label>
                        <Select
                          value={selectedPersona.knowledgeLevel}
                          onValueChange={(value: any) => setSelectedPersona({
                            ...selectedPersona,
                            knowledgeLevel: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responseLength">Response Length</Label>
                        <Select
                          value={selectedPersona.responseLength}
                          onValueChange={(value: any) => setSelectedPersona({
                            ...selectedPersona,
                            responseLength: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                            <SelectItem value="medium">Medium (1-2 paragraphs)</SelectItem>
                            <SelectItem value="long">Long (detailed responses)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Areas of Expertise</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedPersona.expertise.map((exp) => (
                          <Badge key={exp} variant="secondary" className="gap-1">
                            {exp}
                            <button
                              onClick={() => removeExpertise(exp)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add expertise area"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value) {
                                addExpertise(value);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add expertise area"]') as HTMLInputElement;
                            const value = input?.value.trim();
                            if (value) {
                              addExpertise(value);
                              input.value = '';
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={selectedPersona.isActive}
                        onCheckedChange={(checked) => setSelectedPersona({
                          ...selectedPersona,
                          isActive: checked
                        })}
                      />
                      <Label htmlFor="isActive">Active Persona</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="personality">Personality Description</Label>
                      <Textarea
                        id="personality"
                        value={selectedPersona.personality}
                        onChange={(e) => setSelectedPersona({
                          ...selectedPersona,
                          personality: e.target.value
                        })}
                        placeholder="Describe the persona's personality traits, communication style, and behavioral characteristics"
                        rows={6}
                      />
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        The personality description helps the AI understand how to behave and respond in character. 
                        Be specific about traits, communication style, and any unique characteristics.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="prompts" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Custom Prompts</h3>
                        <p className="text-sm text-muted-foreground">
                          Add custom prompts to guide the persona's responses
                        </p>
                      </div>
                      <Button onClick={addCustomPrompt} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prompt
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedPersona.customPrompts.map((prompt, index) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={prompt}
                            onChange={(e) => updateCustomPrompt(index, e.target.value)}
                            placeholder="Enter a custom prompt for this persona"
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomPrompt(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {selectedPersona.customPrompts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No custom prompts added yet</p>
                        <p className="text-sm">Add prompts to guide the persona's responses</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Test Persona</h3>
                        <p className="text-sm text-muted-foreground">
                          Test how your persona responds to different questions
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testQuestion">Test Question</Label>
                        <Textarea
                          id="testQuestion"
                          value={testQuestion}
                          onChange={(e) => setTestQuestion(e.target.value)}
                          placeholder="Enter a question to test the persona's response"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleTestPersona}
                        disabled={!testQuestion || !selectedPersona.id || testPersonaMutation.isPending}
                        className="gap-2"
                      >
                        <TestTube className="h-4 w-4" />
                        {testPersonaMutation.isPending ? 'Testing...' : 'Test Persona'}
                      </Button>

                      {testResponse && (
                        <div className="space-y-2">
                          <Label>Persona Response</Label>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="whitespace-pre-wrap">{testResponse}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Persona</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose an AI persona from the list to edit its configuration, or create a new one.
                </p>
                <Button onClick={() => handleCreatePersona()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Persona
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Persona Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{personas.length}</div>
              <div className="text-sm text-muted-foreground">Total Personas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {personas.filter((p: AIPersona) => p.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Personas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {personas.reduce((acc: number, p: AIPersona) => acc + p.expertise.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Expertise Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {personas.reduce((acc: number, p: AIPersona) => acc + p.customPrompts.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Custom Prompts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useWebsiteAgentsGenerator } from "@/hooks/use-website-agents-generator";
import { 
  Brain, 
  FolderEdit, 
  Settings2, 
  Circle, 
  BarChart3, 
  MessageSquare, 
  Sparkles,
  Trash2,
  Pencil,
  Save,
  Plus,
  Globe,
  Info,
  Loader2,
  Link2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

// Define TypeScript interfaces
interface Agent {
  id: number;
  name: string;
  description: string;
  personality: string;
  expertise: "beginner" | "intermediate" | "expert" | "smart" | "genius" | "intelligent" | "moderator";
  tone: string;
  responseLength: number;
  active: boolean;
  usageCount: number;
  rating?: number;
  responseTime?: number;
  completionRate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSubscription {
  plan: "starter" | "professional" | "enterprise";
  status: string;
  planActiveUntil: Date | null;
}

interface AgentStats {
  totalUsage: number;
  avgRating: number;
  topPerforming: Agent[];
}

// Zod schema for validation
const agentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  personality: z.string().min(1, "Personality is required"),
  expertise: z.enum(["beginner", "intermediate", "expert", "smart", "genius", "intelligent", "moderator"]),
  tone: z.string().min(1, "Tone is required"),
  responseLength: z.number().min(1).max(5),
  active: z.boolean().default(true),
});

export default function AIAgents() {
  const { user } = useClerk();
  const [activeTab, setActiveTab] = useState("agents");
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  
  // Query client for mutations
  const queryClient = useQueryClient();
  
  // State for website URL and agent generation
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState<boolean>(false);
  const [agentLimit, setAgentLimit] = useState<number>(20); // Default to Starter plan
  const [remainingAgents, setRemainingAgents] = useState<number>(20);
  const [agentCount, setAgentCount] = useState<number>(5); // Default number of agents to generate
  
  // Get user's subscription details
  const { data: userSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["/api/user/subscription"],
    enabled: !!user
  }) as { 
    data: UserSubscription | undefined, 
    isLoading: boolean 
  };
  
  // Update agent limits when subscription data changes
  useEffect(() => {
    if (userSubscription) {
      // Set agent limits based on subscription plan
      if (userSubscription.plan === "professional") {
        setAgentLimit(100);
      } else if (userSubscription.plan === "enterprise") {
        setAgentLimit(Infinity);
      } else {
        setAgentLimit(20); // Starter plan default
      }
    }
  }, [userSubscription]);
  
  // Get user's AI agents
  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["/api/ai-agents"],
    enabled: !!user
  }) as {
    data: Agent[] | undefined,
    isLoading: boolean
  };
  
  // Update remaining agents count when data changes
  useEffect(() => {
    if (agents && agentLimit !== Infinity) {
      setRemainingAgents(Math.max(0, agentLimit - agents.length));
    }
  }, [agents, agentLimit]);

  const { data: agentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/ai-agents/stats"],
    enabled: !!user
  }) as {
    data: AgentStats | undefined,
    isLoading: boolean
  };
  
  // Mutation for creating a new agent
  const createAgentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof agentSchema>) => {
      return await apiRequest("/api/ai-agents", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-agents"] });
      toast({
        title: "Agent created",
        description: "Your new AI agent has been created successfully.",
      });
      form.reset();
      setActiveTab("agents");
    },
    onError: (error) => {
      toast({
        title: "Error creating agent",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for generating agents from a website
  const generateAgentsMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest("/api/ai-agents/generate", {
        method: "POST",
        body: JSON.stringify({ websiteUrl: url })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-agents"] });
      toast({
        title: "Agents generated",
        description: "AI agents based on your website content have been created successfully.",
      });
      setWebsiteUrl("");
      setShowGenerateDialog(false);
      setActiveTab("agents");
    },
    onError: (error) => {
      toast({
        title: "Error generating agents",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  // Create form with validation
  const form = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      personality: "",
      expertise: "intermediate",
      tone: "",
      responseLength: 3,
      active: true,
    },
  });

  const onSubmit = (values: z.infer<typeof agentSchema>) => {
    createAgentMutation.mutate(values);
  };
  
  // Handle website agent generation
  const handleGenerateAgents = () => {
    if (!websiteUrl) {
      toast({
        title: "Website URL required",
        description: "Please enter a valid website URL to generate agents.",
        variant: "destructive",
      });
      return;
    }
    
    if (agents && agentLimit !== Infinity && agents.length >= agentLimit) {
      toast({
        title: "Agent limit reached",
        description: `You've reached your plan's limit of ${agentLimit} agents. Upgrade your plan to create more.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    generateAgentsMutation.mutate(websiteUrl);
  };
  
  // Use our custom hook for website-based agent generation with the existing state variables
  const {
    generateAgentsFromWebsite
  } = useWebsiteAgentsGenerator({
    initialWebsiteUrl: websiteUrl,
    initialAgentCount: agentCount,
    onWebsiteUrlChange: setWebsiteUrl,
    onAgentCountChange: setAgentCount,
    onGeneratingChange: setIsGenerating
  });

  // Handle website-based agent generation from the new tab
  const handleGenerateFromWebsite = () => {
    // Check if there's enough room for the requested number of agents
    if (agentLimit !== Infinity && agents) {
      const availableSlots = agentLimit - agents.length;
      if (availableSlots <= 0) {
        toast({
          title: "Agent limit reached",
          description: `You've reached your plan's limit of ${agentLimit} agents. Upgrade your plan to create more.`,
          variant: "destructive",
        });
        return;
      }
      
      if (agentCount > availableSlots) {
        toast({
          title: "Agent limit will be exceeded",
          description: `You only have space for ${availableSlots} more agents. Reducing the count accordingly.`,
        });
        // Adjust the count to the available slots
        setAgentCount(availableSlots);
      }
    }
    
    // Call the generate function from our custom hook
    generateAgentsFromWebsite();
  };

  // Use data from the agents API
  const aiAgentList: Agent[] = agents || [];

  // Personality options
  const personalityOptions = [
    "Friendly", "Professional", "Analytical", "Creative", "Engaging",
    "Humorous", "Empathetic", "Direct", "Detailed", "Supportive"
  ];

  // Tone options 
  const toneOptions = [
    "Casual", "Formal", "Enthusiastic", "Neutral", "Authoritative",
    "Educational", "Persuasive", "Informative", "Conversational", "Technical"
  ];

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <Button onClick={() => setActiveTab("create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
            <TabsTrigger value="create">Create Agent</TabsTrigger>
            <TabsTrigger value="generate">Generate from Website</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="pt-4">
            {!selectedAgent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingAgents ? (
                  <p>Loading agents...</p>
                ) : (
                  aiAgentList.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Brain className="mr-2 h-5 w-5 text-primary" /> 
                            {agent.name}
                          </CardTitle>
                          <Badge variant={agent.active ? "default" : "secondary"}>
                            {agent.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>{agent.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between mb-1">
                            <span>Expertise:</span>
                            <span className="font-medium capitalize">{agent.expertise}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Personality:</span>
                            <span className="font-medium">{agent.personality}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Tone:</span>
                            <span className="font-medium">{agent.tone}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Usage:</span>
                            <span className="font-medium">{agent.usageCount} answers</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedAgent(agent.id)}
                        >
                          <Settings2 className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="flex items-center"
                          onClick={() => window.open(`/forum?ai=${agent.id}`, '_blank')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedAgent(null)}
                    className="mr-4"
                  >
                    Back to Agents
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {aiAgentList.find(p => p.id === selectedAgent)?.name}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle>Agent Configuration</CardTitle>
                          <Badge variant="default">
                            <Circle className="fill-current h-2 w-2 mr-1" /> Live
                          </Badge>
                        </div>
                        <CardDescription>
                          Configure how this AI agent behaves and responds to forum questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Agent Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      defaultValue={aiAgentList.find(p => p.id === selectedAgent)?.name}
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      defaultValue={aiAgentList.find(p => p.id === selectedAgent)?.description}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Brief description of this agent's purpose and expertise
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="expertise"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expertise Level</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={aiAgentList.find(p => p.id === selectedAgent)?.expertise}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select expertise level" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                        <SelectItem value="smart">Smart</SelectItem>
                                        <SelectItem value="genius">Genius</SelectItem>
                                        <SelectItem value="intelligent">Intelligent</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      The level of expertise this agent will demonstrate
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="personality"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Personality</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={aiAgentList.find(p => p.id === selectedAgent)?.personality}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select personality" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {personalityOptions.map(option => (
                                          <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      The personality traits this agent will exhibit
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="tone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Communication Tone</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={aiAgentList.find(p => p.id === selectedAgent)?.tone}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select tone" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {toneOptions.map(option => (
                                          <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      The communication tone this agent will use
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="responseLength"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Response Length</FormLabel>
                                    <FormControl>
                                      <div className="pt-2">
                                        <Slider
                                          defaultValue={[aiAgentList.find(p => p.id === selectedAgent)?.responseLength || 3]}
                                          max={5}
                                          min={1}
                                          step={1}
                                          onValueChange={(vals) => field.onChange(vals[0])}
                                        />
                                      </div>
                                    </FormControl>
                                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                      <span>Concise</span>
                                      <span>Average</span>
                                      <span>Detailed</span>
                                    </div>
                                    <FormDescription className="pt-2">
                                      How detailed this agent's responses will be
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="active"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active Status</FormLabel>
                                    <FormDescription>
                                      Enable or disable this AI agent
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={aiAgentList.find(p => p.id === selectedAgent)?.active}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-between pt-2">
                              <Button type="button" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Agent
                              </Button>
                              <div className="space-x-2">
                                <Button type="button" variant="outline">
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Adjust Prompt
                                </Button>
                                <Button type="button">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Answers Generated</span>
                            <span className="text-sm font-medium">
                              {aiAgentList.find(p => p.id === selectedAgent)?.usageCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">User Rating</span>
                            <span className="text-sm font-medium">4.7 / 5</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Avg. Response Time</span>
                            <span className="text-sm font-medium">2.4 seconds</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Completion Rate</span>
                            <span className="text-sm font-medium">98%</span>
                          </div>
                          <Button type="button" className="w-full">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Full Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sample Response</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-dark-200 p-3 rounded-md text-sm">
                          <p className="text-muted-foreground mb-2">Question:</p>
                          <p className="mb-4">What's the difference between on-page and off-page SEO?</p>
                          
                          <p className="text-muted-foreground mb-2">Response by {aiAgentList.find(p => p.id === selectedAgent)?.name}:</p>
                          <p>
                            On-page SEO involves optimizing elements within your website, such as content quality, keyword usage, meta tags, and site structure. Off-page SEO focuses on external factors like backlinks, social signals, and brand mentions that improve your site's authority and reputation in the eyes of search engines.
                            {aiAgentList.find(p => p.id === selectedAgent)?.responseLength! > 3 && 
                              " Both are crucial for a comprehensive SEO strategy, with on-page giving you direct control and off-page building your site's credibility through external validation."}
                          </p>
                        </div>
                        <Button type="button" className="w-full mt-4">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Sample Responses
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>
                    Comparative metrics across AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-dark-200 border-b border-dark-300">
                          <th className="p-3 text-left font-medium">Agent</th>
                          <th className="p-3 text-left font-medium">Usage</th>
                          <th className="p-3 text-left font-medium">Rating</th>
                          <th className="p-3 text-left font-medium">Response Time</th>
                          <th className="p-3 text-left font-medium">Completion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingStats ? (
                          <tr>
                            <td colSpan={5} className="p-3 text-center">Loading stats...</td>
                          </tr>
                        ) : (
                          aiAgentList.map((agent) => (
                            <tr key={agent.id} className="border-b border-dark-300">
                              <td className="p-3">
                                <div className="flex items-center">
                                  <Brain className="h-4 w-4 mr-2 text-primary" />
                                  {agent.name}
                                </div>
                              </td>
                              <td className="p-3">{agent.usageCount}</td>
                              <td className="p-3">{agent.rating?.toFixed(1) || '4.5'} / 5</td>
                              <td className="p-3">{agent.responseTime?.toFixed(1) || '2.0'}s</td>
                              <td className="p-3">{agent.completionRate || 98}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Agent</CardTitle>
                  <CardDescription>Based on user satisfaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-10 w-10 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        #1
                      </div>
                    </div>
                    {/* Get the agent with highest rating */}
                    {aiAgentList.length > 0 ? (
                      <>
                        <h3 className="text-lg font-semibold mb-1">
                          {aiAgentList
                            .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.name || "AI Agent"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {aiAgentList
                            .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.expertise || "Expert"} level
                        </p>
                        
                        <div className="w-full space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">User Rating</span>
                            <span className="text-sm font-medium">
                              {aiAgentList
                                .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.rating?.toFixed(1) || "4.5"} / 5
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Answers</span>
                            <span className="text-sm font-medium">
                              {aiAgentList
                                .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.usageCount || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Completion Rate</span>
                            <span className="text-sm font-medium">
                              {aiAgentList
                                .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.completionRate || 98}%
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-1">No Agents Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Create your first AI agent</p>
                        
                        <div className="w-full space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">User Rating</span>
                            <span className="text-sm font-medium">- / 5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Answers</span>
                            <span className="text-sm font-medium">0</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Completion Rate</span>
                            <span className="text-sm font-medium">-</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      if (aiAgentList.length > 0) {
                        // Get the top performer and set it as the selected agent
                        const topPerformer = aiAgentList.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
                        setSelectedAgent(topPerformer?.id);
                        setActiveTab("agents");
                      } else {
                        // If no agents, go to create tab
                        setActiveTab("create");
                      }
                    }}
                  >
                    <FolderEdit className="h-4 w-4 mr-2" />
                    {aiAgentList.length > 0 ? "Manage Agent" : "Create Agent"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create New AI Agent</CardTitle>
                  <CardDescription>
                    Configure a new AI personality to answer forum questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agent Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g. Technical Support Specialist" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for this AI agent
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="E.g. An expert AI that specializes in resolving technical issues and providing detailed troubleshooting steps."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description of this agent's purpose and expertise
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="expertise"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expertise Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select expertise level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="expert">Expert</SelectItem>
                                  <SelectItem value="smart">Smart</SelectItem>
                                  <SelectItem value="genius">Genius</SelectItem>
                                  <SelectItem value="intelligent">Intelligent</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The level of expertise this agent will demonstrate
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="personality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personality</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select personality" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {personalityOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The personality traits this agent will exhibit
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Communication Tone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select tone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {toneOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The communication tone this agent will use
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="responseLength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Response Length</FormLabel>
                              <FormControl>
                                <div className="pt-2">
                                  <Slider
                                    defaultValue={[field.value]}
                                    max={5}
                                    min={1}
                                    step={1}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                  />
                                </div>
                              </FormControl>
                              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>Concise</span>
                                <span>Average</span>
                                <span>Detailed</span>
                              </div>
                              <FormDescription className="pt-2">
                                How detailed this agent's responses will be
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Status</FormLabel>
                              <FormDescription>
                                Enable this AI agent immediately after creation
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("agents")}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createAgentMutation.isPending}
                        >
                          {createAgentMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create Agent
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Generate from Website</CardTitle>
                  <CardDescription>
                    Create AI agents based on your website content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pb-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI will analyze your website's content and generate tailored agents 
                      based on the keywords and topics found in your content.
                    </p>
                    
                    {userSubscription && (
                      <Alert className="mb-4">
                        <Globe className="h-4 w-4" />
                        <AlertTitle className="ml-2">Your Plan: {userSubscription.plan}</AlertTitle>
                        <AlertDescription>
                          {agentLimit === Infinity ? (
                            "You can create unlimited AI agents"
                          ) : (
                            <>
                              You can create up to <span className="font-semibold">{agentLimit}</span> AI agents
                              {agents && (
                                <> ({remainingAgents} remaining)</>
                              )}
                            </>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="https://yourwebsite.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      <Button 
                        onClick={() => setShowGenerateDialog(true)}
                        disabled={isGenerating || !websiteUrl}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your website URL to analyze content and generate agents
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Generated Agents Include:</h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-primary" />
                        Keyword-based expertise focus
                      </li>
                      <li className="flex items-center">
                        <Link2 className="h-4 w-4 mr-2 text-primary" />
                        Optimized for your content topics
                      </li>
                      <li className="flex items-center">
                        <Settings2 className="h-4 w-4 mr-2 text-primary" />
                        Fully configurable after creation
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Generate Agents Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate AI Agents</DialogTitle>
                  <DialogDescription>
                    Our AI will analyze your website and create tailored AI agents based on your content.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Website URL:</p>
                    <p className="text-sm">{websiteUrl}</p>
                  </div>
                  
                  {agentLimit !== Infinity && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">AI Agents remaining:</p>
                      <p className="text-sm">{remainingAgents} of {agentLimit}</p>
                    </div>
                  )}
                  
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      What happens next?
                    </AlertTitle>
                    <AlertDescription>
                      We'll analyze your website content and create multiple AI agents based on your 
                      content topics and keywords. This process may take a minute or two.
                    </AlertDescription>
                  </Alert>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGenerateDialog(false)}
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateAgents}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate Agents</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="generate" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Generate AI Agents from Website</CardTitle>
                  <CardDescription>
                    Create multiple AI agents based on keywords from your website content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">How it works</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Enter your website URL</li>
                        <li>Our AI analyzes your website to extract relevant keywords</li>
                        <li>We generate specialized agents based on those keywords</li>
                        <li>Agents are automatically added to your account</li>
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input 
                          id="websiteUrl" 
                          placeholder="https://example.com" 
                          value={websiteUrl} 
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter the full URL including https://
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agentCount">Number of Agents</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="agentCount"
                            min={1}
                            max={20}
                            step={1}
                            value={[agentCount]}
                            onValueChange={(values) => setAgentCount(values[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-medium">{agentCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {userSubscription?.plan === 'professional' 
                            ? 'Your Professional plan allows up to 100 total agents'
                            : userSubscription?.plan === 'enterprise' 
                              ? 'Your Enterprise plan has unlimited agents'
                              : 'Your Starter plan allows up to 20 total agents'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm">
                        <span className="font-medium">Current agents:</span> {aiAgentList.length} 
                        {userSubscription?.plan && (
                          <span className="ml-1">
                            / {userSubscription.plan === 'professional' 
                                ? '100' 
                                : userSubscription.plan === 'enterprise' 
                                  ? 'Unlimited' 
                                  : '20'}
                          </span>
                        )}
                      </div>
                      <Button 
                        onClick={handleGenerateFromWebsite} 
                        disabled={isGenerating || !websiteUrl}
                        className="min-w-[150px]"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Agents
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About Website Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Benefit from your website content</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI extracts keywords and topics from your website and creates AI agents with
                      expertise in those areas, ensuring your AI-generated content is on-brand and relevant.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Agent variety</h3>
                    <p className="text-sm text-muted-foreground">
                      Generated agents will have different expertise levels, personalities, and tones
                      to give you a diverse team of AI assistants.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Optimize for SEO</h3>
                    <p className="text-sm text-muted-foreground">
                      Each agent is specialized in topics relevant to your business, helping you 
                      create content that aligns with your SEO strategy.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg border">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-primary" />
                      Pro Tip
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      For best results, use your main website URL. The more content your site has, the more
                      diverse the generated agents will be.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
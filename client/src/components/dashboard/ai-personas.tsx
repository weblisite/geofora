import { useState } from "react";
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

const personaSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  personality: z.string().min(1, "Personality is required"),
  expertise: z.enum(["beginner", "intermediate", "expert"]),
  tone: z.string().min(1, "Tone is required"),
  responseLength: z.number().min(1).max(5),
  active: z.boolean().default(true),
});

export default function AIPersonas() {
  const { user } = useClerk();
  const [activeTab, setActiveTab] = useState("personas");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  
  // Query client for mutations
  const queryClient = useQueryClient();
  
  // State for website URL and persona generation
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState<boolean>(false);
  const [personaLimit, setPersonaLimit] = useState<number>(20); // Default to Starter plan
  const [remainingPersonas, setRemainingPersonas] = useState<number>(20);
  const [personaCount, setPersonaCount] = useState<number>(5); // Default number of personas to generate
  
  // Get user's subscription details
  const { data: userSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["/api/user/subscription"],
    enabled: !!user,
    onSuccess: (data) => {
      // Set persona limits based on subscription plan
      if (data?.plan === "professional") {
        setPersonaLimit(100);
      } else if (data?.plan === "enterprise") {
        setPersonaLimit(Infinity);
      } else {
        setPersonaLimit(20); // Starter plan default
      }
    }
  });
  
  // Get user's AI personas
  const { data: personas, isLoading: isLoadingPersonas } = useQuery({
    queryKey: ["/api/ai-personas"],
    enabled: !!user,
    onSuccess: (data) => {
      // Calculate remaining personas
      if (data && personaLimit !== Infinity) {
        setRemainingPersonas(Math.max(0, personaLimit - data.length));
      }
    }
  });

  const { data: personaStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/ai-personas/stats"],
    enabled: !!user,
  });
  
  // Mutation for creating a new persona
  const createPersonaMutation = useMutation({
    mutationFn: (data: z.infer<typeof personaSchema>) => {
      return apiRequest("/api/ai-personas", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-personas"] });
      toast({
        title: "Persona created",
        description: "Your new AI persona has been created successfully.",
      });
      form.reset();
      setActiveTab("personas");
    },
    onError: (error) => {
      toast({
        title: "Error creating persona",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for generating personas from a website
  const generatePersonasMutation = useMutation({
    mutationFn: (url: string) => {
      return apiRequest("/api/ai-personas/generate", "POST", { websiteUrl: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-personas"] });
      toast({
        title: "Personas generated",
        description: "AI personas based on your website content have been created successfully.",
      });
      setWebsiteUrl("");
      setShowGenerateDialog(false);
      setActiveTab("personas");
    },
    onError: (error) => {
      toast({
        title: "Error generating personas",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  // Create form with validation
  const form = useForm<z.infer<typeof personaSchema>>({
    resolver: zodResolver(personaSchema),
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

  const onSubmit = (values: z.infer<typeof personaSchema>) => {
    createPersonaMutation.mutate(values);
  };
  
  // Handle website persona generation
  const handleGeneratePersonas = () => {
    if (!websiteUrl) {
      toast({
        title: "Website URL required",
        description: "Please enter a valid website URL to generate personas.",
        variant: "destructive",
      });
      return;
    }
    
    if (personas && personaLimit !== Infinity && personas.length >= personaLimit) {
      toast({
        title: "Persona limit reached",
        description: `You've reached your plan's limit of ${personaLimit} personas. Upgrade your plan to create more.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    generatePersonasMutation.mutate(websiteUrl);
  };
  
  // Handle website-based persona generation from the new tab
  const handleGenerateFromWebsite = () => {
    if (!websiteUrl) {
      toast({
        title: "Website URL required",
        description: "Please enter a valid website URL to generate personas.",
        variant: "destructive",
      });
      return;
    }
    
    if (personas && personaLimit !== Infinity && personas.length >= personaLimit) {
      toast({
        title: "Persona limit reached",
        description: `You've reached your plan's limit of ${personaLimit} personas. Upgrade your plan to create more.`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if there's enough room for the requested number of personas
    if (personaLimit !== Infinity && personas) {
      const availableSlots = personaLimit - personas.length;
      if (personaCount > availableSlots) {
        toast({
          title: "Persona limit will be exceeded",
          description: `You only have space for ${availableSlots} more personas. Reducing the count accordingly.`,
        });
        // Adjust the count to the available slots
        setPersonaCount(availableSlots);
      }
    }
    
    setIsGenerating(true);
    
    // Pass the websiteUrl and count to the API
    generatePersonasMutation.mutate(websiteUrl);
  };

  // Sample AI personas for the demo
  const aiPersonaList = [
    { 
      id: "tech-expert", 
      name: "Tech Expert", 
      description: "A tech-savvy AI persona for answering technical questions", 
      expertise: "expert",
      personality: "Analytical",
      tone: "Professional",
      responseLength: 4,
      active: true,
      usageCount: 253
    },
    { 
      id: "friendly-helper", 
      name: "Friendly Helper", 
      description: "A approachable AI persona for new users", 
      expertise: "beginner",
      personality: "Friendly",
      tone: "Casual",
      responseLength: 2,
      active: true,
      usageCount: 328
    },
    { 
      id: "marketing-specialist", 
      name: "Marketing Specialist", 
      description: "A marketing-focused AI persona for SEO and content", 
      expertise: "expert",
      personality: "Creative",
      tone: "Persuasive",
      responseLength: 3,
      active: true,
      usageCount: 194
    },
    { 
      id: "seo-guru", 
      name: "SEO Guru", 
      description: "An AI expert in search engine optimization", 
      expertise: "expert",
      personality: "Detailed",
      tone: "Informative",
      responseLength: 5,
      active: true,
      usageCount: 217
    }
  ];

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
          <h1 className="text-2xl font-bold">AI Personas</h1>
          <Button onClick={() => setActiveTab("create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Persona
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
            <TabsTrigger value="create">Create Persona</TabsTrigger>
            <TabsTrigger value="generate">Generate from Website</TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="pt-4">
            {!selectedPersona ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingPersonas ? (
                  <p>Loading personas...</p>
                ) : (
                  aiPersonaList.map((persona) => (
                    <Card key={persona.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Brain className="mr-2 h-5 w-5 text-primary" /> 
                            {persona.name}
                          </CardTitle>
                          <Badge variant={persona.active ? "default" : "secondary"}>
                            {persona.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>{persona.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between mb-1">
                            <span>Expertise:</span>
                            <span className="font-medium capitalize">{persona.expertise}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Personality:</span>
                            <span className="font-medium">{persona.personality}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Tone:</span>
                            <span className="font-medium">{persona.tone}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Usage:</span>
                            <span className="font-medium">{persona.usageCount} answers</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedPersona(persona.id)}
                        >
                          <Settings2 className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="flex items-center"
                          onClick={() => window.open(`/forum?ai=${persona.id}`, '_blank')}
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
                    onClick={() => setSelectedPersona(null)}
                    className="mr-4"
                  >
                    Back to Personas
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {aiPersonaList.find(p => p.id === selectedPersona)?.name}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle>Persona Configuration</CardTitle>
                          <Badge variant="default">
                            <Circle className="fill-current h-2 w-2 mr-1" /> Live
                          </Badge>
                        </div>
                        <CardDescription>
                          Configure how this AI persona behaves and responds to forum questions
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
                                  <FormLabel>Persona Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      defaultValue={aiPersonaList.find(p => p.id === selectedPersona)?.name}
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
                                      defaultValue={aiPersonaList.find(p => p.id === selectedPersona)?.description}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Brief description of this persona's purpose and expertise
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
                                      defaultValue={aiPersonaList.find(p => p.id === selectedPersona)?.expertise}
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
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      The level of expertise this persona will demonstrate
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
                                      defaultValue={aiPersonaList.find(p => p.id === selectedPersona)?.personality}
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
                                      The personality traits this persona will exhibit
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
                                      defaultValue={aiPersonaList.find(p => p.id === selectedPersona)?.tone}
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
                                      The communication tone this persona will use
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
                                          defaultValue={[aiPersonaList.find(p => p.id === selectedPersona)?.responseLength || 3]}
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
                                      How detailed this persona's responses will be
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
                                      Enable or disable this AI persona
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={aiPersonaList.find(p => p.id === selectedPersona)?.active}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-between pt-2">
                              <Button type="button" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Persona
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
                              {aiPersonaList.find(p => p.id === selectedPersona)?.usageCount}
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
                          
                          <p className="text-muted-foreground mb-2">Response by {aiPersonaList.find(p => p.id === selectedPersona)?.name}:</p>
                          <p>
                            On-page SEO involves optimizing elements within your website, such as content quality, keyword usage, meta tags, and site structure. Off-page SEO focuses on external factors like backlinks, social signals, and brand mentions that improve your site's authority and reputation in the eyes of search engines.
                            {aiPersonaList.find(p => p.id === selectedPersona)?.responseLength! > 3 && 
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
                  <CardTitle>Persona Performance</CardTitle>
                  <CardDescription>
                    Comparative metrics across AI personas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-dark-200 border-b border-dark-300">
                          <th className="p-3 text-left font-medium">Persona</th>
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
                          aiPersonaList.map((persona) => (
                            <tr key={persona.id} className="border-b border-dark-300">
                              <td className="p-3">
                                <div className="flex items-center">
                                  <Brain className="h-4 w-4 mr-2 text-primary" />
                                  {persona.name}
                                </div>
                              </td>
                              <td className="p-3">{persona.usageCount}</td>
                              <td className="p-3">{(Math.random() * (5 - 4) + 4).toFixed(1)} / 5</td>
                              <td className="p-3">{(Math.random() * (4 - 1) + 1).toFixed(1)}s</td>
                              <td className="p-3">{Math.floor(Math.random() * (100 - 95) + 95)}%</td>
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
                  <CardTitle>Top Performing Persona</CardTitle>
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
                    <h3 className="text-lg font-semibold mb-1">Friendly Helper</h3>
                    <p className="text-sm text-muted-foreground mb-4">Beginner level</p>
                    
                    <div className="w-full space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">User Rating</span>
                        <span className="text-sm font-medium">4.9 / 5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Answers</span>
                        <span className="text-sm font-medium">328</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Positive Feedback</span>
                        <span className="text-sm font-medium">93%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <FolderEdit className="h-4 w-4 mr-2" />
                    Manage Persona
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create New AI Persona</CardTitle>
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
                            <FormLabel>Persona Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g. Technical Support Specialist" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for this AI persona
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
                              A brief description of this persona's purpose and expertise
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
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The level of expertise this persona will demonstrate
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
                                The personality traits this persona will exhibit
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
                                The communication tone this persona will use
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
                                How detailed this persona's responses will be
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
                                Enable this AI persona immediately after creation
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
                        <Button type="button" variant="outline" onClick={() => setActiveTab("personas")}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPersonaMutation.isPending}
                        >
                          {createPersonaMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create Persona
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
                    Create AI personas based on your website content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pb-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI will analyze your website's content and generate tailored personas 
                      based on the keywords and topics found in your content.
                    </p>
                    
                    {userSubscription && (
                      <Alert className="mb-4">
                        <Globe className="h-4 w-4" />
                        <AlertTitle className="ml-2">Your Plan: {userSubscription.plan}</AlertTitle>
                        <AlertDescription>
                          {personaLimit === Infinity ? (
                            "You can create unlimited AI personas"
                          ) : (
                            <>
                              You can create up to <span className="font-semibold">{personaLimit}</span> AI personas
                              {personas && (
                                <> ({remainingPersonas} remaining)</>
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
                      Enter your website URL to analyze content and generate personas
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Generated Personas Include:</h3>
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
            
            {/* Generate Personas Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate AI Personas</DialogTitle>
                  <DialogDescription>
                    Our AI will analyze your website and create tailored AI personas based on your content.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Website URL:</p>
                    <p className="text-sm">{websiteUrl}</p>
                  </div>
                  
                  {personaLimit !== Infinity && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">AI Personas remaining:</p>
                      <p className="text-sm">{remainingPersonas} of {personaLimit}</p>
                    </div>
                  )}
                  
                  <Alert>
                    <AlertTitle className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      What happens next?
                    </AlertTitle>
                    <AlertDescription>
                      We'll analyze your website content and create multiple AI personas based on your 
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
                    onClick={handleGeneratePersonas}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate Personas</>
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
                  <CardTitle>Generate AI Personas from Website</CardTitle>
                  <CardDescription>
                    Create multiple AI personas based on keywords from your website content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">How it works</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Enter your website URL</li>
                        <li>Our AI analyzes your website to extract relevant keywords</li>
                        <li>We generate specialized personas based on those keywords</li>
                        <li>Personas are automatically added to your account</li>
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
                        <Label htmlFor="personaCount">Number of Personas</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="personaCount"
                            min={1}
                            max={20}
                            step={1}
                            value={[personaCount]}
                            onValueChange={(values) => setPersonaCount(values[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-medium">{personaCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {userSubscription?.plan === 'professional' 
                            ? 'Your Professional plan allows up to 100 total personas'
                            : userSubscription?.plan === 'enterprise' 
                              ? 'Your Enterprise plan has unlimited personas'
                              : 'Your Starter plan allows up to 20 total personas'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm">
                        <span className="font-medium">Current personas:</span> {aiPersonaList.length} 
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
                            Generate Personas
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
                      Our AI extracts keywords and topics from your website and creates AI personas with
                      expertise in those areas, ensuring your AI-generated content is on-brand and relevant.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Persona variety</h3>
                    <p className="text-sm text-muted-foreground">
                      Generated personas will have different expertise levels, personalities, and tones
                      to give you a diverse team of AI assistants.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Optimize for SEO</h3>
                    <p className="text-sm text-muted-foreground">
                      Each persona is specialized in topics relevant to your business, helping you 
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
                      diverse the generated personas will be.
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
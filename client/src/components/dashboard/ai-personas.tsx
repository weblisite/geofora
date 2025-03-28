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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
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
  Plus
} from "lucide-react";

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
  
  // Sample data for demonstration
  const { data: personas, isLoading: isLoadingPersonas } = useQuery({
    queryKey: ["/api/ai-personas"],
    enabled: !!user,
  });

  const { data: personaStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/ai-personas/stats"],
    enabled: !!user,
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
    console.log(values);
    // Here we would save the persona to the database
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
            <TabsTrigger value="create">Create Persona</TabsTrigger>
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
            <Card>
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
                      <Button type="submit">Create Persona</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
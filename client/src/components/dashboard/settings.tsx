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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClerk } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Globe, 
  Shield, 
  Bell, 
  CreditCard, 
  Paintbrush, 
  LogOut,
  Users,
  Mail,
  Eye,
  KeyRound,
  UserX,
  ArrowLeft,
  Check,
  AlertTriangle,
  Pencil
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const userSettingsSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  notifyAnswers: z.boolean().default(true),
  notifyMentions: z.boolean().default(true),
  notifyNewsletter: z.boolean().default(false),
  theme: z.enum(["system", "light", "dark"]),
  emailVisibility: z.enum(["public", "registered", "private"]),
});

const forumSettingsSchema = z.object({
  name: z.string().min(2, "Forum name must be at least 2 characters"),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"),
  enableAI: z.boolean().default(true),
  moderationLevel: z.enum(["low", "medium", "high"]),
  allowGuestQuestions: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
});

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("account");
  
  // User settings form
  const userForm = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      displayName: user?.fullName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      bio: "",
      notifyAnswers: true,
      notifyMentions: true,
      notifyNewsletter: false,
      theme: "system",
      emailVisibility: "registered",
    },
  });

  // Forum settings form
  const forumForm = useForm<z.infer<typeof forumSettingsSchema>>({
    resolver: zodResolver(forumSettingsSchema),
    defaultValues: {
      name: "ForumAI",
      description: "A community-driven question and answer platform",
      primaryColor: "#3B82F6",
      enableAI: true,
      moderationLevel: "medium",
      allowGuestQuestions: false,
      requireApproval: false,
    },
  });

  const onUserSubmit = (values: z.infer<typeof userSettingsSchema>) => {
    console.log(values);
    // Here we would save the user settings to the database
  };

  const onForumSubmit = (values: z.infer<typeof forumSettingsSchema>) => {
    console.log(values);
    // Here we would save the forum settings to the database
  };

  // Team member mock data
  const teamMembers = [
    { 
      id: 1, 
      name: "Jane Cooper", 
      email: "jane@example.com", 
      role: "Owner", 
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    { 
      id: 2, 
      name: "Robert Fox", 
      email: "robert@example.com", 
      role: "Admin", 
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e"
    },
    { 
      id: 3, 
      name: "Esther Howard", 
      email: "esther@example.com", 
      role: "Moderator", 
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f"
    }
  ];

  // Subscription plan mock data
  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      description: "Basic forum functionality",
      price: "$0",
      features: [
        "Up to 100 questions",
        "Up to 1,000 answers",
        "Basic AI features",
        "1 admin user"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      description: "Advanced features for growing communities",
      price: "$49/month",
      features: [
        "Unlimited questions and answers",
        "Advanced AI features",
        "Priority support",
        "Custom branding",
        "Up to 5 team members"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      price: "Custom",
      features: [
        "Unlimited everything",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "Unlimited team members"
      ]
    }
  ];

  // Export data types
  const exportTypes = [
    { id: "questions", name: "Questions", count: 124 },
    { id: "answers", name: "Answers", count: 562 },
    { id: "users", name: "Users", count: 38 },
    { id: "media", name: "Media Files", count: 17 }
  ];

  return (
    <div className="container mx-auto pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="account" className="flex items-center">
              <User className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center">
              <Globe className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Forum</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center">
              <Users className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center">
              <Shield className="h-4 w-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your account information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                            <AvatarFallback>
                              {user?.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-medium">{user?.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                            <div className="pt-2">
                              <Button variant="outline" size="sm">Change Photo</Button>
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={userForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This is how your name will appear publicly
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={userForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" disabled={!!user?.primaryEmailAddress} />
                              </FormControl>
                              <FormDescription>
                                {user?.primaryEmailAddress ? 
                                  "To change your email, update it in your Clerk account settings" :
                                  "Your email for notifications and account recovery"
                                }
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={userForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell others a bit about yourself..."
                                  className="min-h-[100px]"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={userForm.control}
                          name="emailVisibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Visibility</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select email visibility" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="public">Public (visible to everyone)</SelectItem>
                                  <SelectItem value="registered">Registered Users Only</SelectItem>
                                  <SelectItem value="private">Private (only visible to you)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Control who can see your email address
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button type="submit">Save Profile Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Control which notifications you receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form className="space-y-4">
                        <FormField
                          control={userForm.control}
                          name="notifyAnswers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Answer Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications when your questions receive answers
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

                        <FormField
                          control={userForm.control}
                          name="notifyMentions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Mention Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications when you're mentioned in questions or answers
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

                        <FormField
                          control={userForm.control}
                          name="notifyNewsletter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Newsletter</FormLabel>
                                <FormDescription>
                                  Receive occasional newsletter with updates and tips
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

                        <div className="flex justify-end">
                          <Button type="button" onClick={userForm.handleSubmit(onUserSubmit)}>
                            Save Notification Settings
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Password</h3>
                        <Button variant="ghost" size="sm" className="h-8">Change</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last changed: 2 months ago
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <Badge variant="outline">Not Enabled</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Shield className="h-4 w-4 mr-2" />
                        Setup 2FA
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Login Sessions</h3>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center my-2">
                          <Badge variant="secondary" className="mr-2">Current</Badge>
                          <span>Chrome on Windows</span>
                          <span className="ml-auto text-xs text-muted-foreground">Now</span>
                        </div>
                        <div className="flex items-center my-2">
                          <span>Safari on iPhone</span>
                          <span className="ml-auto text-xs text-muted-foreground">2 days ago</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-1">
                        Manage Sessions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Paintbrush className="h-5 w-5 mr-2" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form>
                        <FormField
                          control={userForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-3 gap-4"
                                >
                                  <div>
                                    <RadioGroupItem
                                      value="light"
                                      id="light"
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor="light"
                                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-dark-200 hover:text-white peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                                    >
                                      <div className="mb-2 rounded-md bg-white p-1 w-8 h-8"></div>
                                      Light
                                    </Label>
                                  </div>
                                  <div>
                                    <RadioGroupItem
                                      value="dark"
                                      id="dark"
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor="dark"
                                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-dark-200 hover:text-white peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                                    >
                                      <div className="mb-2 rounded-md bg-dark-500 p-1 w-8 h-8"></div>
                                      Dark
                                    </Label>
                                  </div>
                                  <div>
                                    <RadioGroupItem
                                      value="system"
                                      id="system"
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor="system"
                                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-dark-200 hover:text-white peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary"
                                    >
                                      <div className="mb-2 rounded-md bg-gradient-to-r from-white to-dark-500 p-1 w-8 h-8"></div>
                                      System
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormDescription>
                                Choose your preferred theme
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={userForm.handleSubmit(onUserSubmit)}
                        >
                          Save Appearance
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader className="text-destructive">
                    <CardTitle className="flex items-center">
                      <UserX className="h-5 w-5 mr-2" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Deactivate Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Temporarily deactivate your account
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forum" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Forum Settings
                    </CardTitle>
                    <CardDescription>
                      Configure your forum's general settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...forumForm}>
                      <form onSubmit={forumForm.handleSubmit(onForumSubmit)} className="space-y-6">
                        <FormField
                          control={forumForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Forum Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                The main title of your forum
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={forumForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="A brief description of your forum..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                A short description that appears on search engines and social media
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={forumForm.control}
                          name="primaryColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Color</FormLabel>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-md border" 
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormDescription>
                                The main accent color for your forum (hex format)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <FormField
                            control={forumForm.control}
                            name="enableAI"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">AI Features</FormLabel>
                                  <FormDescription>
                                    Enable AI-powered answers and content
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

                          <FormField
                            control={forumForm.control}
                            name="allowGuestQuestions"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Guest Questions</FormLabel>
                                  <FormDescription>
                                    Allow unregistered users to ask questions
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
                        </div>

                        <FormField
                          control={forumForm.control}
                          name="moderationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moderation Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select moderation level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low (Allow most content)</SelectItem>
                                  <SelectItem value="medium">Medium (Balanced moderation)</SelectItem>
                                  <SelectItem value="high">High (Strict content filtering)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How strictly content should be moderated
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={forumForm.control}
                          name="requireApproval"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Require Content Approval</FormLabel>
                                <FormDescription>
                                  Questions must be approved by moderators before appearing publicly
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

                        <div className="flex justify-end">
                          <Button type="submit">Save Forum Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Custom Domain
                    </CardTitle>
                    <CardDescription>
                      Connect your forum to a custom domain
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertTitle>Current Domain</AlertTitle>
                      <AlertDescription className="flex justify-between items-center">
                        <span className="font-mono">forum-ai-abcd123.replit.app</span>
                        <Badge>Default</Badge>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label>Custom Domain</Label>
                        <div className="flex">
                          <Input
                            placeholder="yourdomain.com"
                            className="rounded-r-none"
                          />
                          <Button className="rounded-l-none">Connect</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter your domain to connect it to your forum (requires Pro plan)
                        </p>
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Domain Setup</AlertTitle>
                        <AlertDescription>
                          After connecting, you'll need to add DNS records to point your domain to our servers.
                          Detailed instructions will be provided.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meta Title</Label>
                      <Input placeholder="ForumAI - Community Forum" />
                      <p className="text-xs text-muted-foreground">
                        The title shown in search engine results
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea placeholder="A community-driven question and answer platform..." />
                      <p className="text-xs text-muted-foreground">
                        The description shown in search engine results
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-row items-center justify-between">
                        <Label>Indexing</Label>
                        <Switch defaultChecked />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Allow search engines to index your forum
                      </p>
                    </div>

                    <Button className="w-full">Save SEO Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Forum Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Questions</span>
                        <span className="text-sm font-medium">124</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Answers</span>
                        <span className="text-sm font-medium">562</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Users</span>
                        <span className="text-sm font-medium">38</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Views</span>
                        <span className="text-sm font-medium">12,865</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">AI Answers</span>
                        <span className="text-sm font-medium">91</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg. Response Time</span>
                        <span className="text-sm font-medium">4.3 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>
                      Export forum data to CSV or JSON format
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border divide-y">
                        {exportTypes.map(type => (
                          <div key={type.id} className="flex justify-between items-center p-3">
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-xs text-muted-foreground">{type.count} items</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">CSV</Button>
                              <Button size="sm" variant="outline">JSON</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full">
                        Export All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Team Members
                      </CardTitle>
                      <Button size="sm">
                        Invite Member
                      </Button>
                    </div>
                    <CardDescription>
                      Manage your team and their permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="bg-dark-200 p-3 border-b grid grid-cols-5 text-sm font-medium">
                        <div className="col-span-2">User</div>
                        <div>Role</div>
                        <div>Status</div>
                        <div className="text-right">Actions</div>
                      </div>
                      <div className="divide-y">
                        {teamMembers.map(member => (
                          <div key={member.id} className="p-3 grid grid-cols-5 items-center">
                            <div className="col-span-2 flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                            <div>
                              <Badge variant={
                                member.role === "Owner" ? "default" : 
                                member.role === "Admin" ? "secondary" : "outline"
                              }>
                                {member.role}
                              </Badge>
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/10">
                                Active
                              </Badge>
                            </div>
                            <div className="text-right">
                              <Button variant="ghost" size="sm" disabled={member.role === "Owner"}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="text-sm text-muted-foreground">
                      3 of 5 team members (Pro plan)
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Roles
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No pending invitations</p>
                    </div>
                    <Button className="w-full">
                      Send New Invitation
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium">Owner</div>
                      <p className="text-sm text-muted-foreground">
                        Full access to all settings and permissions
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="font-medium">Admin</div>
                      <p className="text-sm text-muted-foreground">
                        Can manage content, users, and some settings
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="font-medium">Moderator</div>
                      <p className="text-sm text-muted-foreground">
                        Can moderate content and manage users
                      </p>
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      Edit Permission Levels
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex">
                          <div className="w-9 flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-primary mt-2 mx-auto"></div>
                            {i < 3 && <div className="h-full w-px bg-border mx-auto"></div>}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm">
                              {["Jane Cooper invited Robert Fox", 
                                "Esther Howard changed role to Moderator", 
                                "Robert Fox accepted invitation",
                                "Jane Cooper updated forum settings"][i]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(Date.now() - i * 86400000 * 2).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="link" className="w-full mt-2 text-sm">
                      View Full Activity Log
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription and billing settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border rounded-lg bg-dark-200">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Pro Plan</h3>
                        <p className="text-muted-foreground">$49/month</p>
                        <Badge className="mt-2">Active</Badge>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <Button variant="outline">
                          Change Plan
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Plan Features</h3>
                      <ul className="space-y-2">
                        {[
                          "Unlimited questions and answers",
                          "Advanced AI features",
                          "Priority support",
                          "Custom branding",
                          "Up to 5 team members"
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Plan Usage</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Questions</span>
                            <span>124 / Unlimited</span>
                          </div>
                          <div className="w-full h-2 bg-dark-200 rounded-full">
                            <div className="h-2 bg-primary rounded-full" style={{ width: '12%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Team Members</span>
                            <span>3 / 5</span>
                          </div>
                          <div className="w-full h-2 bg-dark-200 rounded-full">
                            <div className="h-2 bg-primary rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>AI Responses</span>
                            <span>91 / 500</span>
                          </div>
                          <div className="w-full h-2 bg-dark-200 rounded-full">
                            <div className="h-2 bg-primary rounded-full" style={{ width: '18%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Manage your payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-6 bg-sky-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-xs text-muted-foreground">Expires 12/25</p>
                          </div>
                        </div>
                        <Badge>Default</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Update
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Add New
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-dark-200 border-b border-dark-300">
                            <th className="p-3 text-left font-medium">Date</th>
                            <th className="p-3 text-left font-medium">Amount</th>
                            <th className="p-3 text-left font-medium">Status</th>
                            <th className="p-3 text-left font-medium">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-dark-300">
                              <td className="p-3">
                                {new Date(Date.now() - i * 30 * 86400000).toLocaleDateString()}
                              </td>
                              <td className="p-3">$49.00</td>
                              <td className="p-3">
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/10">
                                  Paid
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <p className="text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <p className="text-sm">Acme Corporation</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Address</Label>
                      <p className="text-sm">123 Business St<br />Suite 200<br />San Francisco, CA 94107</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Tax ID</Label>
                      <p className="text-sm">US123456789</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Update Billing Information
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {subscriptionPlans.map((plan) => (
                        <div 
                          key={plan.id} 
                          className={`p-3 border rounded-md ${plan.id === 'pro' ? 'border-primary bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{plan.name}</div>
                            <div>{plan.price}</div>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          {plan.id === 'pro' && (
                            <Badge className="mt-2">Current Plan</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full">
                      Compare Plans
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      If you have any questions about your billing or subscription, our support team is here to help.
                    </p>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <KeyRound className="h-5 w-5 mr-2" />
                      API Access
                    </CardTitle>
                    <CardDescription>
                      Manage API keys and access for integration with other services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertTitle>API Documentation</AlertTitle>
                      <AlertDescription>
                        Our API allows you to integrate ForumAI with your existing systems and applications.
                        <Button variant="link" className="px-0 py-0 h-auto font-normal">
                          View API Documentation
                        </Button>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="p-4 border border-primary/20 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Production API Key</h3>
                          <Badge>Active</Badge>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            type="password"
                            value="••••••••••••••••••••••••••••••"
                            readOnly
                            className="font-mono text-sm mr-2"
                          />
                          <Button variant="outline" size="sm">
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: July 15, 2023 • Last used: Today
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1">
                          Regenerate Key
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Create Test Key
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">API Permissions</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="text-sm">Read Questions & Answers</div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="text-sm">Create Questions & Answers</div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="text-sm">User Management</div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="text-sm">Analytics Access</div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="text-sm">Settings Management</div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <AlertTitle>Rate Limits</AlertTitle>
                      <AlertDescription>
                        Your current plan allows 1,000 requests per day and up to 60 requests per minute.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save API Settings</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data & Privacy</CardTitle>
                    <CardDescription>
                      Manage data retention and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Data Retention</h3>
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <div className="font-medium">User Data</div>
                          <p className="text-sm text-muted-foreground">
                            How long to retain user data after account deletion
                          </p>
                        </div>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <div className="font-medium">Content Data</div>
                          <p className="text-sm text-muted-foreground">
                            How long to retain deleted questions and answers
                          </p>
                        </div>
                        <Select defaultValue="forever">
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                            <SelectItem value="forever">Forever</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <div className="font-medium">Analytics Data</div>
                          <p className="text-sm text-muted-foreground">
                            How long to retain analytics and usage data
                          </p>
                        </div>
                        <Select defaultValue="365">
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                            <SelectItem value="730">2 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Privacy Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-sm">User Profile Visibility</div>
                            <div className="text-xs text-muted-foreground">
                              Allow users to control profile visibility
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-sm">Anonymous Questions</div>
                            <div className="text-xs text-muted-foreground">
                              Allow users to ask questions anonymously
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-sm">Content Indexing</div>
                            <div className="text-xs text-muted-foreground">
                              Allow search engines to index content
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-sm">Usage Analytics</div>
                            <div className="text-xs text-muted-foreground">
                              Collect anonymous usage statistics
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save Privacy Settings</Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Database</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Database Size</span>
                        <span className="text-sm font-medium">128 MB</span>
                      </div>
                      <div className="w-full h-2 bg-dark-200 rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        128 MB of 512 MB used (25%)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Backup & Restore</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage database backups and restoration points
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1">
                          Create Backup
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Restore
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Performance</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-dark-200 rounded-md text-center">
                          <div className="text-sm text-muted-foreground">Avg Query</div>
                          <div className="font-medium">24 ms</div>
                        </div>
                        <div className="p-2 bg-dark-200 rounded-md text-center">
                          <div className="text-sm text-muted-foreground">Connections</div>
                          <div className="font-medium">12 / 50</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Import & Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Import Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Import questions and answers from other platforms
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">Stack Overflow</Button>
                        <Button variant="outline" size="sm">Discourse</Button>
                        <Button variant="outline" size="sm">WordPress</Button>
                        <Button variant="outline" size="sm">Custom CSV</Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Export Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Export your forum content in various formats
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">JSON</Button>
                        <Button variant="outline" size="sm">CSV</Button>
                        <Button variant="outline" size="sm">XML</Button>
                        <Button variant="outline" size="sm">Markdown</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader className="text-destructive">
                    <CardTitle>Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Reset Forum</h3>
                      <p className="text-sm text-muted-foreground">
                        Delete all questions and answers, but keep users and settings
                      </p>
                      <Button variant="destructive" size="sm" className="w-full">
                        Reset Content
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Delete Forum</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete the entire forum and all data
                      </p>
                      <Button variant="destructive" size="sm" className="w-full">
                        Delete Forum
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// The Label component is now imported from @/components/ui/label
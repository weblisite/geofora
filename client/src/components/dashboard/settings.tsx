import { useState, useEffect } from "react";
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
import { useClerkAuth } from "@/hooks/use-clerk-auth";
import { useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { PLAN_INFO, POLAR_PLAN_IDS, POLAR_CHECKOUT_LINKS, getSubscriptionUrl } from "@shared/polar-service";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
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
  Pencil,
  Download,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

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
  const { user } = useClerkAuth();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState("account");
  
  // Force scroll back to top when component mounts to prevent scroll issues
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
      name: "GeoFora",
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
    <div className="w-full">
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 sticky top-0 z-10 bg-[#0c0f1a]">
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
                                  Receive occasional newsletters with tips and updates
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
                          <Button type="submit">Save Notification Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserX className="h-5 w-5 mr-2" />
                      Account Deletion
                    </CardTitle>
                    <CardDescription>
                      Delete your account and all associated data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Account deletion is permanent and cannot be undone. All your data, including questions, answers, and forums will be permanently removed.
                      </AlertDescription>
                    </Alert>
                    <Button variant="destructive" className="w-full">
                      Delete Account Permanently
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Paintbrush className="h-5 w-5 mr-2" />
                      Theme Settings
                    </CardTitle>
                    <CardDescription>
                      Customize your interface appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form className="space-y-4">
                        <FormField
                          control={userForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme Preference</FormLabel>
                              <div className="space-y-2 pt-2">
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col gap-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="system" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      System Default
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="light" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Light
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="dark" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Dark
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button type="submit">Save Theme Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <KeyRound className="h-5 w-5 mr-2" />
                      Security
                    </CardTitle>
                    <CardDescription>
                      Manage your security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (user?.id) {
                          window.open(`https://accounts.clerk.dev/user/security?user_id=${user.id}`, '_blank');
                        }
                      }}
                    >
                      Manage 2FA Settings
                    </Button>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <p className="text-sm text-muted-foreground">Change your password</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (user?.id) {
                          window.open(`https://accounts.clerk.dev/user/security?user_id=${user.id}`, '_blank');
                        }
                      }}
                    >
                      Change Password
                    </Button>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label>Active Sessions</Label>
                      <p className="text-sm text-muted-foreground">Manage devices where you're logged in</p>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (user?.id) {
                          window.open(`https://accounts.clerk.dev/user/security?user_id=${user.id}`, '_blank');
                        }
                      }}
                    >
                      View Active Sessions
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => signOut(() => window.location.href = "/")}
                    >
                      Sign Out of All Devices
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="pt-4">
            {/* Add query for subscription data */}
            {(() => {
              const { userId } = useAuth();
              
              // Query subscription data from our API
              const { data: subscription, isLoading: isLoadingSubscription, error: subscriptionError } = useQuery({
                queryKey: ['/api/users/subscription'],
                enabled: !!userId
              });
              
              // Query billing history from our API
              const { data: billingHistory, isLoading: isLoadingBilling, error: billingError } = useQuery({
                queryKey: ['/api/users/billing-history'],
                enabled: !!userId
              });
              
              // Helper function to get price and interval display
              const getPriceDisplay = (planId) => {
                if (!planId) return "Free";
                
                const planInfo = Object.values(PLAN_INFO).find(p => p.id === planId);
                return planInfo ? planInfo.price : "Custom";
              };
              
              // Helper function to get plan name
              const getPlanName = (planType) => {
                switch (planType) {
                  case 'starter': return 'Starter Plan';
                  case 'professional': return 'Professional Plan';
                  case 'enterprise': return 'Enterprise Plan';
                  default: return 'Free Plan';
                }
              };
              
              // Helper function to handle upgrading or changing plan
              const handleChangePlan = async (planType) => {
                if (!userId) {
                  toast({
                    title: "Authentication required",
                    description: "Please sign in to change your subscription plan.",
                    variant: "destructive"
                  });
                  return;
                }
                
                try {
                  // Use direct checkout links to Polar.sh
                  let checkoutUrl;
                  switch(planType) {
                    case 'starter':
                      checkoutUrl = "https://buy.polar.sh/polar_cl_saQVhkF5OgG3xuhn3eZm5G3gQUA0rAx17BHB43INwPN";
                      break;
                    case 'professional':
                      checkoutUrl = "https://buy.polar.sh/polar_cl_oCymEewojyAWOZOHjZJRC1PQGo0ES0Tu2eeVh1S3N6Y";
                      break;
                    case 'enterprise':
                      checkoutUrl = "https://buy.polar.sh/polar_cl_bXNvmdougqf83av9fFAH1DA6y3ghNMzf5Kzwy38RLVX";
                      break;
                    default:
                      throw new Error("Invalid plan type");
                  }
                  
                  // Store user plan selection in database
                  await apiRequest('/api/users/select-plan', {
                    method: 'POST',
                    body: JSON.stringify({
                      userId,
                      planType,
                      isTrial: false
                    })
                  });
                  
                  // Open the Polar checkout page in a new tab
                  window.open(checkoutUrl, '_blank');
                } catch (error) {
                  console.error("Error redirecting to subscription page:", error);
                  toast({
                    title: "Error",
                    description: "Failed to redirect to subscription page. Please try again.",
                    variant: "destructive"
                  });
                }
              };
              
              // Helper to format date
              const formatDate = (dateString) => {
                if (!dateString) return "N/A";
                const date = new Date(dateString);
                return date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              };
              
              return (
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
                        {isLoadingSubscription ? (
                          <div className="flex justify-center p-6">
                            <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                          </div>
                        ) : subscriptionError ? (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>Failed to load subscription data. Please try again.</AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border rounded-lg bg-dark-200">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">
                                  {getPlanName(subscription?.plan)}
                                </h3>
                                <p className="text-muted-foreground">
                                  {getPriceDisplay(subscription?.plan)}
                                </p>
                                <Badge className="mt-2">
                                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                                {subscription?.planActiveUntil && (
                                  <p className="text-xs mt-2 text-muted-foreground">
                                    Renewal date: {formatDate(subscription.planActiveUntil)}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 sm:mt-0">
                                <Button 
                                  variant="outline"
                                  onClick={() => handleChangePlan(
                                    subscription?.plan === 'starter' 
                                      ? 'professional' 
                                      : 'enterprise'
                                  )}
                                >
                                  {subscription?.plan === 'starter' ? 'Upgrade' : 'Change Plan'}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h3 className="font-medium">Plan Features</h3>
                              <ul className="space-y-2">
                                {(subscription?.plan && PLAN_INFO[subscription.plan]?.features || []).map((feature, i) => (
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
                                    <span>AI Personas</span>
                                    <span>{subscription?.plan === 'starter' ? '0 / 20' : 
                                          subscription?.plan === 'professional' ? '0 / 100' : 
                                          '0 / Unlimited'}</span>
                                  </div>
                                  <div className="w-full h-2 bg-dark-200 rounded-full">
                                    <div className="h-2 bg-primary rounded-full" style={{ width: '0%' }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1 text-sm">
                                    <span>AI Answers</span>
                                    <span>{subscription?.plan === 'starter' ? '0 / 10,000' : 
                                          subscription?.plan === 'professional' ? '0 / 50,000' : 
                                          '0 / Unlimited'}</span>
                                  </div>
                                  <div className="w-full h-2 bg-dark-200 rounded-full">
                                    <div className="h-2 bg-primary rounded-full" style={{ width: '0%' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="font-medium">Manage Subscription</h3>
                              <div className="space-y-2">
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start"
                                  onClick={() => handleChangePlan(
                                    subscription?.plan === 'starter' 
                                      ? 'professional' 
                                      : 'enterprise'
                                  )}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  {subscription?.plan === 'starter' ? 'Upgrade Plan' : 'Change Plan'}
                                </Button>
                                
                                {subscription?.details?.hosted_portal_url && (
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => window.open(subscription.details.hosted_portal_url, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Manage Subscription
                                  </Button>
                                )}
                                
                                {subscription?.details?.cancel_url && (
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-destructive hover:text-destructive"
                                    onClick={() => window.open(subscription.details.cancel_url, '_blank')}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Cancel Subscription
                                  </Button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingBilling ? (
                          <div className="flex justify-center p-6">
                            <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                          </div>
                        ) : billingError ? (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>Failed to load billing history. Please try again.</AlertDescription>
                          </Alert>
                        ) : billingHistory?.length === 0 ? (
                          <p className="text-center py-6 text-muted-foreground">No billing history available</p>
                        ) : (
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
                                {billingHistory?.map((invoice, i) => (
                                  <tr key={i} className="border-b border-dark-300">
                                    <td className="p-3">
                                      {formatDate(invoice.created_at || invoice.timestamp)}
                                    </td>
                                    <td className="p-3">
                                      {invoice.amount_formatted || `$${invoice.amount ? (invoice.amount / 100).toFixed(2) : "0.00"}`}
                                    </td>
                                    <td className="p-3">
                                      <Badge 
                                        variant="outline" 
                                        className={`${
                                          invoice.status === 'paid' || invoice.status === 'succeeded' 
                                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/10' 
                                            : invoice.status === 'unpaid' || invoice.status === 'failed'
                                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/10'
                                            : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10'
                                        }`}
                                      >
                                        {invoice.status === 'paid' || invoice.status === 'succeeded' 
                                          ? 'Paid' 
                                          : invoice.status === 'unpaid' || invoice.status === 'failed'
                                          ? 'Failed'
                                          : 'Pending'}
                                      </Badge>
                                    </td>
                                    <td className="p-3">
                                      {invoice.hosted_url || invoice.receipt_url || invoice.invoice_url ? (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => window.open(
                                            invoice.hosted_url || invoice.receipt_url || invoice.invoice_url, 
                                            '_blank'
                                          )}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                      ) : (
                                        <Button variant="ghost" size="sm" disabled>
                                          <Eye className="h-4 w-4 mr-1" />
                                          N/A
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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
                          <p className="text-sm">{user?.fullName || "Not provided"}</p>
                        </div>
                        
                        {subscription?.details?.billing_portal_url && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(subscription.details.billing_portal_url, '_blank')}
                          >
                            Update Billing Information
                          </Button>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Available Plans</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {Object.entries(PLAN_INFO).map(([planId, plan]) => (
                            <div 
                              key={planId} 
                              className={`p-3 border rounded-md ${subscription?.plan === planId ? 'border-primary bg-primary/5' : ''}`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{plan.name}</div>
                                <div>{plan.price}</div>
                              </div>
                              <p className="text-sm text-muted-foreground">{plan.description || ""}</p>
                              {subscription?.plan === planId && (
                                <Badge className="mt-2">Current Plan</Badge>
                              )}
                              {subscription?.plan !== planId && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => {
                                    // Direct Polar.sh checkout links
                                    let checkoutUrl;
                                    if (planId === 'starter' || planId === POLAR_PLAN_IDS.starter) {
                                      checkoutUrl = "https://buy.polar.sh/polar_cl_saQVhkF5OgG3xuhn3eZm5G3gQUA0rAx17BHB43INwPN";
                                    } else if (planId === 'professional' || planId === POLAR_PLAN_IDS.professional) {
                                      checkoutUrl = "https://buy.polar.sh/polar_cl_oCymEewojyAWOZOHjZJRC1PQGo0ES0Tu2eeVh1S3N6Y";
                                    } else if (planId === 'enterprise' || planId === POLAR_PLAN_IDS.enterprise) {
                                      checkoutUrl = "https://buy.polar.sh/polar_cl_bXNvmdougqf83av9fFAH1DA6y3ghNMzf5Kzwy38RLVX";
                                    }
                                    
                                    // Open checkout in new tab
                                    if (checkoutUrl) {
                                      window.open(checkoutUrl, '_blank');
                                    }
                                  }}
                                >
                                  {subscription?.plan === 'starter' && planId === 'professional' ? 'Upgrade' : 
                                   subscription?.plan === 'starter' && planId === 'enterprise' ? 'Upgrade' : 
                                   subscription?.plan === 'professional' && planId === 'enterprise' ? 'Upgrade' : 'Select Plan'}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
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
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.location.href = "mailto:support@cmofy.com"}
                        >
                          Contact Support
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })()}
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
                      Manage your forum details and configuration
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
                                This is the main title of your forum
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
                                  placeholder="Describe what your forum is about..."
                                  className="min-h-[100px]"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                A brief description of your forum's purpose
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
                                  className="h-10 w-10 rounded border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormDescription>
                                The main accent color for your forum (hex value)
                              </FormDescription>
                              <FormMessage />
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
                      <Shield className="h-5 w-5 mr-2" />
                      Content Moderation
                    </CardTitle>
                    <CardDescription>
                      Manage moderation settings for your forum
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...forumForm}>
                      <form className="space-y-6">
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
                                  <SelectItem value="low">Low - Basic filter for spam</SelectItem>
                                  <SelectItem value="medium">Medium - Filter spam and offensive content</SelectItem>
                                  <SelectItem value="high">High - Strict moderation for all content</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How strictly should content be moderated
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
                                <FormLabel className="text-base">Require Post Approval</FormLabel>
                                <FormDescription>
                                  Require moderator approval before posts become visible
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
                                <FormLabel className="text-base">Allow Guest Questions</FormLabel>
                                <FormDescription>
                                  Allow unregistered users to post questions
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
                          <Button type="submit">Save Moderation Settings</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Settings</CardTitle>
                    <CardDescription>
                      Configure your forum's custom domain
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Domain</Label>
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-dark-200">
                        <p className="text-sm font-medium">forum-ai.example.com</p>
                        <Badge variant="outline">Default</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Domain</Label>
                      <Input placeholder="forum.yourdomain.com" />
                      <FormDescription>
                        Enter your custom domain to use for your forum
                      </FormDescription>
                    </div>

                    <Button className="w-full">
                      Set Custom Domain
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>
                      Optimize your forum for search engines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Meta Title</Label>
                      <Input placeholder="GeoFora - Your Community Forum" />
                    </div>

                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea 
                        placeholder="A community-driven question and answer platform with AI-enhanced responses."
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Meta Keywords</Label>
                      <Input placeholder="forum, community, questions, answers, AI" />
                    </div>

                    <div className="flex justify-end">
                      <Button>Save SEO Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      Manage who has access to your forum
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">Current Team</h3>
                        <p className="text-sm text-muted-foreground">
                          {teamMembers.length} members
                        </p>
                      </div>
                      <Button variant="outline">
                        Invite Member
                      </Button>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-dark-200 border-b border-dark-300">
                            <th className="p-3 text-left font-medium">User</th>
                            <th className="p-3 text-left font-medium">Role</th>
                            <th className="p-3 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamMembers.map((member) => (
                            <tr key={member.id} className="border-b border-dark-300">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback>
                                      {member.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={member.role === "Owner" ? "default" : "outline"}>
                                  {member.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {member.role !== "Owner" && (
                                    <>
                                      <Button variant="ghost" size="sm">
                                        Change Role
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                        Remove
                                      </Button>
                                    </>
                                  )}
                                  {member.role === "Owner" && (
                                    <p className="text-xs text-muted-foreground">
                                      Cannot modify owner
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>
                      Manage invitations that haven't been accepted yet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 text-center text-muted-foreground">
                      <p>No pending invitations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Roles</CardTitle>
                    <CardDescription>
                      Configure permission levels for team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Owner</h3>
                          <p className="text-sm text-muted-foreground">
                            Full control over all settings
                          </p>
                        </div>
                        <Badge>1 member</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Admin</h3>
                          <p className="text-sm text-muted-foreground">
                            Can manage content and users
                          </p>
                        </div>
                        <Badge>1 member</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Moderator</h3>
                          <p className="text-sm text-muted-foreground">
                            Can moderate content only
                          </p>
                        </div>
                        <Badge>1 member</Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      Customize Roles
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Invite by Email</CardTitle>
                    <CardDescription>
                      Send invitations to new team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input placeholder="colleague@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select defaultValue="moderator">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Message</Label>
                      <Textarea 
                        placeholder="Optional message to include in the invitation"
                        className="h-20"
                      />
                    </div>

                    <Button className="w-full">
                      Send Invitation
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
                      <Globe className="h-5 w-5 mr-2" />
                      API Access
                    </CardTitle>
                    <CardDescription>
                      Manage your API access and tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        API keys have full access to your account. Never share your API keys in public repositories or client-side code.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex gap-2">
                        <Input value="••••••••••••••••••••••••••••••" readOnly className="font-mono" />
                        <Button variant="outline">Copy</Button>
                        <Button variant="outline">Regenerate</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">API Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how to use our API to build integrations with your forum
                      </p>
                      <Button variant="outline" className="w-full">
                        View Documentation
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="h-5 w-5 mr-2" />
                      Data Export
                    </CardTitle>
                    <CardDescription>
                      Export your forum data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Export Type</h3>
                      <RadioGroup defaultValue="all" className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all" className="font-normal cursor-pointer">
                            <div>All Data</div>
                            <p className="text-sm text-muted-foreground">
                              Export all forum data including questions, answers, users, and settings
                            </p>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="selective" id="selective" />
                          <Label htmlFor="selective" className="font-normal cursor-pointer">
                            <div>Selective Export</div>
                            <p className="text-sm text-muted-foreground">
                              Choose specific data to export
                            </p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Select Data Types</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {exportTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <input type="checkbox" id={type.id} className="w-4 h-4" />
                            <Label htmlFor={type.id} className="font-normal cursor-pointer">
                              {type.name} ({type.count})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Export Format</h3>
                      <Select defaultValue="json">
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full">
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
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
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Privacy Settings</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <div className="font-medium">Analytics Cookies</div>
                            <p className="text-sm text-muted-foreground">
                              Allow usage analytics tracking
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <div className="font-medium">User Profiling</div>
                            <p className="text-sm text-muted-foreground">
                              Allow personalization based on user behavior
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      Save Privacy Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Settings</CardTitle>
                    <CardDescription>
                      Configure AI-related features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={forumForm.control}
                      name="enableAI"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable AI Features</FormLabel>
                            <FormDescription>
                              Use AI to enhance forum functionality
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

                    <div className="space-y-2">
                      <h3 className="font-medium">AI Model Selection</h3>
                      <Select defaultValue="gpt4">
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt4">GPT-4 (Recommended)</SelectItem>
                          <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude">Claude Instant</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select which AI model to use for generating responses
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">AI Response Settings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Response Temperature</Label>
                          <span className="text-sm">0.7</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Lower values are more focused, higher values are more creative
                        </p>
                      </div>
                    </div>

                    <Button className="w-full">
                      Save AI Settings
                    </Button>
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
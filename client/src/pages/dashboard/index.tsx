import { useState, lazy, Suspense, useEffect } from "react";
import { Link, useLocation } from "wouter";
import StatsCard from "@/components/dashboard/stats-card";
import TrafficChart from "@/components/dashboard/traffic-chart";
import AIActivity from "@/components/dashboard/ai-activity";
import AIPanel from "@/components/dashboard/ai-panel";
import TopContent from "@/components/dashboard/top-content";
import Sidebar from "@/components/dashboard/sidebar";
import MobileNav from "@/components/dashboard/mobile-nav";
import TrafficAnalysis from "@/components/dashboard/traffic-analysis";
import Conversions from "@/components/dashboard/conversions";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutDashboard, Lightbulb, LineChart, MousePointerClick, Zap, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import ForumManagementPage from "./forum";
import { useSubscriptionCheck } from "@/hooks/use-subscription-check";

// Lazy load components to improve initial load time
const KeywordAnalysis = lazy(() => import("@/components/dashboard/keyword-analysis"));
const Interlinking = lazy(() => import("@/components/dashboard/interlinking"));
const Analytics = lazy(() => import("@/components/dashboard/analytics"));
const LeadCapture = lazy(() => import("@/components/dashboard/lead-capture"));
const CRMIntegrations = lazy(() => import("@/components/dashboard/crm-integrations"));
const AIAgents = lazy(() => import("@/components/dashboard/ai-agents"));
const Integration = lazy(() => import("@/components/dashboard/integration"));
const Settings = lazy(() => import("@/components/dashboard/settings"));

// New PRD components
const AIPersonasDashboard = lazy(() => import("@/components/dashboard/ai-personas"));
const DataExportDashboard = lazy(() => import("@/components/dashboard/data-export"));
const SetupFeeManagement = lazy(() => import("@/components/dashboard/setup-fee"));
const BusinessAnalysisDashboard = lazy(() => import("@/components/dashboard/business-analysis"));
const IndustryDetectionDashboard = lazy(() => import("@/components/dashboard/industry-detection"));
const SEOManagementDashboard = lazy(() => import("@/components/dashboard/seo-management"));
const CustomDomainSetupDashboard = lazy(() => import("@/components/dashboard/custom-domain-setup"));
const ContentModerationDashboard = lazy(() => import("@/components/dashboard/content-moderation"));
const AIPersonasCustomizationDashboard = lazy(() => import("@/components/dashboard/ai-personas-customization"));
const MultilingualSupportDashboard = lazy(() => import("@/components/dashboard/multilingual-support"));
const CustomAITrainingDashboard = lazy(() => import("@/components/dashboard/custom-ai-training"));
const WebhookSystemDashboard = lazy(() => import("@/components/dashboard/webhook-system"));
const AccessibilityDashboard = lazy(() => import("@/components/dashboard/accessibility-dashboard"));
const EnhancedAnalyticsDashboard = lazy(() => import("@/components/dashboard/enhanced-analytics"));
const AnalyticsReportingDashboard = lazy(() => import("@/components/dashboard/analytics-reporting"));
const RealTimeAnalyticsDashboard = lazy(() => import("@/components/dashboard/realtime-analytics"));
const SEOReportingDashboard = lazy(() => import("@/components/dashboard/seo-reporting"));
const CompetitorAnalysisDashboard = lazy(() => import("@/components/dashboard/competitor-analysis"));
const ContentGapAnalysisDashboard = lazy(() => import("@/components/dashboard/content-gap-analysis"));
const GoogleSearchConsoleDashboard = lazy(() => import("@/components/dashboard/google-search-console"));
const BrandVoiceDashboard = lazy(() => import("@/components/dashboard/brand-voice"));

// Define the stats type
interface DashboardStats {
  questions: {
    total: number;
    trend: string;
    trendPositive: boolean;
  };
  answers: {
    total: number;
    trend: string;
    trendPositive: boolean;
  };
  traffic: {
    total: number;
    trend: string;
    trendPositive: boolean;
  };
  conversions: {
    total: number;
    trend: string;
    trendPositive: boolean;
  };
}

export default function DashboardPage() {
  const [location] = useLocation();
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [prevLocation, setPrevLocation] = useState(location);
  
  // Check if user has an active subscription, redirect to billing page if not
  const { isActive, isLoading: isLoadingSubscription } = useSubscriptionCheck();
  
  // Effect to track location changes and invalidate queries when navigating back to a tab
  useEffect(() => {
    // If location has changed, we're navigating to a different tab
    if (location !== prevLocation) {
      // Store current location path pattern (for example: /dashboard/forum => forum)
      const currentSection = location.split('/').pop();
      
      // Invalidate relevant queries based on the section we're navigating to
      if (currentSection) {
        // Invalidate specific queries related to this section
        const queryKeys = getQueryKeysForSection(currentSection);
        
        // Invalidate each relevant query key
        queryKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
        
        // Also force refetch of dashboard stats when returning to main dashboard
        if (location === '/dashboard') {
          queryClient.invalidateQueries({ queryKey: [`/api/analytics/dashboard-stats/${dateRange}`] });
        }
      }
      
      // Update previous location
      setPrevLocation(location);
    }
  }, [location, prevLocation, dateRange]);
  
  // Helper function to determine which query keys should be invalidated for each section
  const getQueryKeysForSection = (section: string): string[] => {
    switch (section) {
      case 'forum':
        return ['/api/forum/questions', '/api/forum/answers', '/api/forum/categories'];
      case 'interlinking':
        return ['/api/interlinking', '/api/interlinking/stats'];
      case 'keyword-analysis':
        return ['/api/keywords', '/api/keywords/analysis'];
      case 'lead-capture':
        return ['/api/leads', '/api/forms'];
      case 'crm':
        return ['/api/crm', '/api/crm/contacts', '/api/crm/activities'];
      case 'analytics':
        return ['/api/analytics/traffic', '/api/analytics/daily-traffic', '/api/analytics/sources', '/api/analytics/devices', '/api/analytics/geographic'];
      case 'integration':
        return ['/api/integration/stats', '/api/integration/webhooks', '/api/integration/event-types', '/api/integration/api-resources'];
      case 'agents':
        return ['/api/ai-agents', '/api/ai-agents/stats'];
      case 'settings':
        return ['/api/settings', '/api/user/profile'];
      case 'business-analysis':
        return ['/api/business/analyze', '/api/business-analysis/current'];
      case 'industry-detection':
        return ['/api/business/industry/detect-text', '/api/business/industry/detect-website'];
      case 'seo-management':
        return ['/api/seo/config', '/api/seo/indexing-status', '/api/seo/sitemap'];
      case 'custom-domain-setup':
        return ['/api/domains', '/api/subdomains', '/api/domains/ssl', '/api/domains/redirects'];
        case 'content-moderation':
          return ['/api/moderation/stats', '/api/moderation/rules', '/api/moderation/actions', '/api/moderation/reports'];
        case 'ai-personas':
          return ['/api/ai-personas', '/api/ai-personas/test'];
        case 'multilingual-support':
          return ['/api/languages', '/api/translation-configs', '/api/translations/recent', '/api/translations/test', '/api/translations/bulk'];
        case 'custom-ai-training':
          return ['/api/custom-models', '/api/training-datasets', '/api/training-jobs', '/api/custom-models/test'];
        case 'webhook-system':
          return ['/api/webhooks', '/api/webhook-events', '/api/webhook-tests'];
        case 'accessibility':
          return ['/api/accessibility/stats', '/api/accessibility/issues', '/api/accessibility/report'];
        case 'enhanced-analytics':
          return ['/api/analytics/overview', '/api/analytics/timeseries', '/api/analytics/devices', '/api/analytics/geography', '/api/analytics/sources', '/api/analytics/content', '/api/analytics/funnel'];
        case 'analytics-reporting':
          return ['/api/analytics/report-templates', '/api/analytics/report-data'];
        case 'realtime-analytics':
          return ['/api/analytics/realtime'];
        case 'seo-reporting':
          return ['/api/seo/reports', '/api/seo/reports/latest', '/api/seo/report-templates'];
        case 'competitor-analysis':
          return ['/api/competitor-analysis', '/api/competitors', '/api/competitor-insights'];
        case 'content-gap-analysis':
          return ['/api/content-gaps/analysis', '/api/content-gaps', '/api/content-gaps/export'];
        case 'google-search-console':
          return ['/api/gsc/status', '/api/gsc/properties', '/api/gsc/performance', '/api/gsc/queries', '/api/gsc/pages', '/api/gsc/issues', '/api/gsc/overview'];
        case 'brand-voice':
          return ['/api/brand-voice', '/api/brand-voice/config'];
      default:
        return [];
    }
  };
  
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: [`/api/analytics/dashboard-stats/${dateRange}`],
  });

  // Only use actual data from the database
  const displayStats = stats;

  // Loading component for all lazy-loaded sections
  const LoadingComponent = () => (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="ml-2 text-lg">Loading content...</span>
    </div>
  );

  // Determine which content to render based on the URL path
  const renderDashboardContent = () => {
    // Different pages based on the URL path
    if (location === "/dashboard/forum") {
      return <ForumManagementPage />;
    } else if (location === "/dashboard/interlinking") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <Interlinking />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/keyword-analysis") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <KeywordAnalysis />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/lead-capture") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <LeadCapture />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/crm") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <CRMIntegrations />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/agents") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <AIAgents />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/analytics") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <Analytics />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/integration") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <Integration />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/settings") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <Settings />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/traffic-analysis") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <TrafficAnalysis />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/conversions") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <Conversions />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/ai-personas") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <AIPersonasDashboard />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/data-export") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <DataExportDashboard />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/setup-fee") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <SetupFeeManagement />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/business-analysis") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <BusinessAnalysisDashboard />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/industry-detection") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <IndustryDetectionDashboard />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/seo-management") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <SEOManagementDashboard />
          </Suspense>
        </div>
      );
    } else if (location === "/dashboard/custom-domain-setup") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <CustomDomainSetupDashboard />
          </Suspense>
        </div>
      );
        } else if (location === "/dashboard/content-moderation") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <ContentModerationDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/ai-personas") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <AIPersonasCustomizationDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/multilingual-support") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <MultilingualSupportDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/custom-ai-training") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <CustomAITrainingDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/webhook-system") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <WebhookSystemDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/accessibility") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <AccessibilityDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/enhanced-analytics") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <EnhancedAnalyticsDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/analytics-reporting") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <AnalyticsReportingDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/realtime-analytics") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <RealTimeAnalyticsDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/seo-reporting") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <SEOReportingDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/competitor-analysis") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <CompetitorAnalysisDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/content-gap-analysis") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <ContentGapAnalysisDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/google-search-console") {
          return (
            <div className="p-6">
              <Suspense fallback={<LoadingComponent />}>
                <GoogleSearchConsoleDashboard />
              </Suspense>
            </div>
          );
        } else if (location === "/dashboard/brand-voice") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <BrandVoiceDashboard />
          </Suspense>
        </div>
      );
    }
    
    // Overview page (main dashboard)
    return (
      <>
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-300">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold mr-6">Dashboard</h1>
            
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                // When changing tabs, invalidate relevant queries
                if (value === "overview") {
                  queryClient.invalidateQueries({ queryKey: [`/api/analytics/dashboard-stats/${dateRange}`] });
                } else if (value === "ai") {
                  queryClient.invalidateQueries({ queryKey: ['/api/ai/activity'] });
                } else if (value === "traffic") {
                  queryClient.invalidateQueries({ queryKey: [
                    '/api/analytics/traffic',
                    '/api/analytics/daily-traffic', 
                    '/api/analytics/sources', 
                    '/api/analytics/devices'
                  ] });
                } else if (value === "conversions") {
                  queryClient.invalidateQueries({ queryKey: ['/api/analytics/conversions'] });
                }
                
                setActiveTab(value);
              }} 
              className="hidden md:block"
            >
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Multi-Model AI
                </TabsTrigger>
                <TabsTrigger value="traffic" className="flex items-center">
                  <LineChart className="w-4 h-4 mr-1" />
                  GEO Analytics
                </TabsTrigger>
                <TabsTrigger value="conversions" className="flex items-center">
                  <MousePointerClick className="w-4 h-4 mr-1" />
                  Data Export
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium border-dark-400 bg-dark-300 hover:bg-dark-400"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span>Last {dateRange === "30d" ? "30" : dateRange === "7d" ? "7" : "90"} Days</span>
            </Button>
            
            <div className="relative">
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                  userButtonTrigger: "flex items-center space-x-1 text-white"
                }
              }} />
            </div>
          </div>
        </header>
        
        {/* Mobile Tabs */}
        <div className="md:hidden border-b border-dark-300 px-4 py-2">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              // When changing tabs on mobile, invalidate relevant queries - same logic as desktop
              if (value === "overview") {
                queryClient.invalidateQueries({ queryKey: [`/api/analytics/dashboard-stats/${dateRange}`] });
              } else if (value === "ai") {
                queryClient.invalidateQueries({ queryKey: ['/api/ai/activity'] });
              } else if (value === "traffic") {
                queryClient.invalidateQueries({ queryKey: [
                  '/api/analytics/traffic',
                  '/api/analytics/daily-traffic', 
                  '/api/analytics/sources', 
                  '/api/analytics/devices'
                ] });
              } else if (value === "conversions") {
                queryClient.invalidateQueries({ queryKey: ['/api/analytics/conversions'] });
              }
              
              setActiveTab(value);
            }}
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="flex flex-col items-center py-2">
                <LayoutDashboard className="w-4 h-4 mb-1" />
                <span className="text-xs">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex flex-col items-center py-2">
                <Lightbulb className="w-4 h-4 mb-1" />
                <span className="text-xs">Multi-Model AI</span>
              </TabsTrigger>
              <TabsTrigger value="traffic" className="flex flex-col items-center py-2">
                <LineChart className="w-4 h-4 mb-1" />
                <span className="text-xs">GEO Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="conversions" className="flex flex-col items-center py-2">
                <MousePointerClick className="w-4 h-4 mb-1" />
                <span className="text-xs">Data Export</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </main>
      </>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case "overview":
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoading ? (
                <>
                  <div className="p-4 rounded-lg border border-dark-400 animate-pulse h-32"></div>
                  <div className="p-4 rounded-lg border border-dark-400 animate-pulse h-32"></div>
                  <div className="p-4 rounded-lg border border-dark-400 animate-pulse h-32"></div>
                  <div className="p-4 rounded-lg border border-dark-400 animate-pulse h-32"></div>
                </>
              ) : displayStats && 
                 displayStats.questions && 
                 displayStats.answers &&
                 displayStats.traffic &&
                 displayStats.conversions ? (
                <>
                  <StatsCard
                    title="AI Providers Active"
                    value={displayStats.questions.total.toLocaleString()}
                    trend={{
                      value: displayStats.questions.trend,
                      positive: displayStats.questions.trendPositive,
                    }}
                    icon="psychology"
                    color="primary"
                  />
                  
                  <StatsCard
                    title="AI Personas Deployed"
                    value={displayStats.answers.total.toLocaleString()}
                    trend={{
                      value: displayStats.answers.trend,
                      positive: displayStats.answers.trendPositive,
                    }}
                    icon="smart_toy"
                    color="secondary"
                  />
                  
                  <StatsCard
                    title="Data Exports Generated"
                    value={displayStats.traffic.total.toLocaleString()}
                    trend={{
                      value: displayStats.traffic.trend,
                      positive: displayStats.traffic.trendPositive,
                    }}
                    icon="cloud_download"
                    color="accent"
                  />
                  
                  <StatsCard
                    title="GEO Influence Score"
                    value={displayStats.conversions.total.toLocaleString()}
                    trend={{
                      value: displayStats.conversions.trend,
                      positive: displayStats.conversions.trendPositive,
                    }}
                    icon="trending_up"
                    color="primary"
                  />
                </>
              ) : (
                <div className="col-span-full text-center p-4">
                  <p className="text-muted-foreground">No dashboard statistics available. Please check your database connection.</p>
                </div>
              )}
            </div>
            
            {/* GEOFORA Overview Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-lg p-6 border border-primary-500/30">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                    <span className="material-icons text-white text-sm">psychology</span>
                  </div>
                  <h2 className="text-xl font-bold">
                    <GradientText>Generative Engine Optimization</GradientText>
                  </h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Influence AI training datasets for long-term discovery. Your content shapes how future AI models understand your industry.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="material-icons text-white text-xs">smart_toy</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">8 AI Personas</div>
                      <div className="text-xs text-gray-400">Temporal dialogues across eras</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center">
                      <span className="material-icons text-white text-xs">psychology</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">6 AI Providers</div>
                      <div className="text-xs text-gray-400">Multi-model intelligence</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                      <span className="material-icons text-white text-xs">cloud_download</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Data Export</div>
                      <div className="text-xs text-gray-400">Anonymized AI training data</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart and AI Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <TrafficChart />
              </div>
              
              <div className="lg:col-span-1">
                <AIActivity />
              </div>
            </div>
            
            {/* Top Performing Content */}
            <TopContent />
          </>
        );
      case "ai":
        return <AIPanel />;
      case "traffic":
        return <TrafficAnalysis />;
      case "conversions":
        return <Conversions />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0f1a]">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-hidden md:pt-0 pt-14 relative">
        <div className="absolute inset-0 overflow-y-auto">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
}

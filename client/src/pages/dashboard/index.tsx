import { useState, lazy, Suspense } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutDashboard, Lightbulb, LineChart, MousePointerClick, Zap, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import ForumManagementPage from "./forum";

// Lazy load components to improve initial load time
const KeywordAnalysis = lazy(() => import("@/components/dashboard/keyword-analysis"));
const Interlinking = lazy(() => import("@/components/dashboard/interlinking"));
const Analytics = lazy(() => import("@/components/dashboard/analytics"));
const LeadCapture = lazy(() => import("@/components/dashboard/lead-capture"));
const GatedContent = lazy(() => import("@/components/dashboard/gated-content"));
const CRMIntegrations = lazy(() => import("@/components/dashboard/crm-integrations"));
const AIPersonas = lazy(() => import("@/components/dashboard/ai-personas"));
const Integration = lazy(() => import("@/components/dashboard/integration"));
const Settings = lazy(() => import("@/components/dashboard/settings"));

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
    } else if (location === "/dashboard/gated-content") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <GatedContent />
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
    } else if (location === "/dashboard/personas") {
      return (
        <div className="p-6">
          <Suspense fallback={<LoadingComponent />}>
            <AIPersonas />
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
    }
    
    // Overview page (main dashboard)
    return (
      <>
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-300">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold mr-6">Dashboard</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  AI Tools
                </TabsTrigger>
                <TabsTrigger value="traffic" className="flex items-center">
                  <LineChart className="w-4 h-4 mr-1" />
                  Traffic Analysis
                </TabsTrigger>
                <TabsTrigger value="conversions" className="flex items-center">
                  <MousePointerClick className="w-4 h-4 mr-1" />
                  Conversions
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="flex flex-col items-center py-2">
                <LayoutDashboard className="w-4 h-4 mb-1" />
                <span className="text-xs">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex flex-col items-center py-2">
                <Lightbulb className="w-4 h-4 mb-1" />
                <span className="text-xs">AI Tools</span>
              </TabsTrigger>
              <TabsTrigger value="traffic" className="flex flex-col items-center py-2">
                <LineChart className="w-4 h-4 mb-1" />
                <span className="text-xs">Traffic</span>
              </TabsTrigger>
              <TabsTrigger value="conversions" className="flex flex-col items-center py-2">
                <MousePointerClick className="w-4 h-4 mb-1" />
                <span className="text-xs">Conversions</span>
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
                    title="Total Questions"
                    value={displayStats.questions.total.toLocaleString()}
                    trend={{
                      value: displayStats.questions.trend,
                      positive: displayStats.questions.trendPositive,
                    }}
                    icon="help"
                    color="primary"
                  />
                  
                  <StatsCard
                    title="Total Answers"
                    value={displayStats.answers.total.toLocaleString()}
                    trend={{
                      value: displayStats.answers.trend,
                      positive: displayStats.answers.trendPositive,
                    }}
                    icon="question_answer"
                    color="secondary"
                  />
                  
                  <StatsCard
                    title="Forum Traffic"
                    value={displayStats.traffic.total.toLocaleString()}
                    trend={{
                      value: displayStats.traffic.trend,
                      positive: displayStats.traffic.trendPositive,
                    }}
                    icon="visibility"
                    color="accent"
                  />
                  
                  <StatsCard
                    title="Lead Conversions"
                    value={displayStats.conversions.total.toLocaleString()}
                    trend={{
                      value: displayStats.conversions.trend,
                      positive: displayStats.conversions.trendPositive,
                    }}
                    icon="person_add"
                    color="primary"
                  />
                </>
              ) : (
                <div className="col-span-full text-center p-4">
                  <p className="text-muted-foreground">No dashboard statistics available. Please check your database connection.</p>
                </div>
              )}
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

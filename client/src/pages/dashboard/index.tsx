import { useState } from "react";
import { Link, useLocation } from "wouter";
import StatsCard from "@/components/dashboard/stats-card";
import TrafficChart from "@/components/dashboard/traffic-chart";
import AIActivity from "@/components/dashboard/ai-activity";
import AIPanel from "@/components/dashboard/ai-panel";
import TopContent from "@/components/dashboard/top-content";
import Sidebar from "@/components/dashboard/sidebar";
import MobileNav from "@/components/dashboard/mobile-nav";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutDashboard, Lightbulb, LineChart, MousePointerClick, Zap } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import ForumManagementPage from "./forum";

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

  // Generate fallback stats when API data isn't available
  const getFallbackStats = (): DashboardStats => ({
    questions: {
      total: 1247,
      trend: "+14.2% vs last month",
      trendPositive: true,
    },
    answers: {
      total: 5893,
      trend: "+23.5% vs last month",
      trendPositive: true,
    },
    traffic: {
      total: 78400,
      trend: "+35.7% vs last month",
      trendPositive: true,
    },
    conversions: {
      total: 1892,
      trend: "+18.9% vs last month",
      trendPositive: true,
    },
  });

  // Use fallback stats if API data isn't available
  const displayStats = stats || getFallbackStats();

  // Determine which content to render based on the URL path
  const renderDashboardContent = () => {
    // Different pages based on the URL path
    if (location === "/dashboard/forum") {
      return <ForumManagementPage />;
    } else if (location === "/dashboard/interlinking") {
      return <h1 className="p-6 text-xl font-semibold">Interlinking</h1>;
    } else if (location === "/dashboard/keyword-analysis") {
      return <h1 className="p-6 text-xl font-semibold">Keyword Analysis</h1>;
    } else if (location === "/dashboard/lead-capture") {
      return <h1 className="p-6 text-xl font-semibold">Lead Capture</h1>;
    } else if (location === "/dashboard/gated-content") {
      return <h1 className="p-6 text-xl font-semibold">Gated Content</h1>;
    } else if (location === "/dashboard/crm") {
      return <h1 className="p-6 text-xl font-semibold">CRM Integrations</h1>;
    } else if (location === "/dashboard/personas") {
      return <h1 className="p-6 text-xl font-semibold">AI Personas</h1>;
    } else if (location === "/dashboard/analytics") {
      return <h1 className="p-6 text-xl font-semibold">Analytics</h1>;
    } else if (location === "/dashboard/integration") {
      return <h1 className="p-6 text-xl font-semibold">Integration</h1>;
    } else if (location === "/dashboard/settings") {
      return <h1 className="p-6 text-xl font-semibold">Settings</h1>;
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
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0f1a]">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 flex flex-col overflow-hidden md:pt-0 pt-14">
        {renderDashboardContent()}
      </div>
    </div>
  );
}

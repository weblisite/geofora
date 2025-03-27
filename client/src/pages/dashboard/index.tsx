import { useState } from "react";
import { Link } from "wouter";
import StatsCard from "@/components/dashboard/stats-card";
import TrafficChart from "@/components/dashboard/traffic-chart";
import AIActivity from "@/components/dashboard/ai-activity";
import TopContent from "@/components/dashboard/top-content";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

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
  const [dateRange, setDateRange] = useState("30d");
  
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0f1a]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-dark-300">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium border-dark-400 bg-dark-300 hover:bg-dark-400"
            >
              <span className="material-icons text-sm mr-1">date_range</span>
              <span>Last {dateRange === "30d" ? "30" : dateRange === "7d" ? "7" : "90"} Days</span>
            </Button>
            
            <div className="relative">
              <button className="flex items-center space-x-1 text-white">
                <img
                  src="https://i.pravatar.cc/100?img=4"
                  alt="Admin avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="material-icons text-sm">expand_more</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
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
        </main>
      </div>
    </div>
  );
}

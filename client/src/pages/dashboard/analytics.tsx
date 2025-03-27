import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AuthContext, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUp, ArrowRight, ArrowDown, ExternalLink, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import { formatNumber } from "@/lib/utils";

// Interface for Forum
interface Forum {
  id: number;
  name: string;
  slug: string;
}

// Interface for Dashboard Stats
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
  leads: {
    total: number;
    trend: string;
    trendPositive: boolean;
  };
  formConversions: {
    total: number;
    trend: string;
    trendPositive: boolean;
  };
  searchRankings: {
    average: number;
    trend: string;
    trendPositive: boolean;
  };
  clickThroughRate: {
    percentage: number;
    trend: string;
    trendPositive: boolean;
  };
}

// Interface for Traffic Data
interface TrafficData {
  name: string;
  value: number;
  date?: string;
}

// Interface for Time Period Stats
interface TrafficStats {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgTimeOnSite: string;
  bounceRate: number;
  trafficSources: TrafficData[];
  trafficByPage: {
    page: string;
    views: number;
    change: number;
  }[];
  referrers: {
    source: string;
    visits: number;
    conversion: number;
  }[];
}

// Interface for Top Content Item
interface TopContentItem {
  id: number;
  title: string;
  views: number;
  answers: number;
  conversions: number;
  ranking: string;
  position: number;
  change: number;
}

// Interface for SEO Ranking Item
interface SeoRankingItem {
  id: number;
  keyword: string;
  position: number;
  previousPosition: number;
  change: number;
  url: string;
  searchVolume: number;
  difficulty: number;
}

// Interface for Conversion Funnel
interface ConversionStep {
  name: string;
  value: number;
  percentage: number;
}

// Interface for Referral Traffic
interface ReferralTraffic {
  source: string;
  visits: number;
  conversions: number;
  conversionRate: number;
  change: number;
}

// Interface for Device Distribution
interface DeviceData {
  name: string;
  value: number;
}

// Interface for Geographic Data
interface GeographicData {
  country: string;
  visits: number;
  percentage: number;
}

// Time periods for filtering
const timePeriods = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

export default function AnalyticsPage() {
  // Use try-catch to handle any auth context errors
  let user = null;
  try {
    const { user: authUser } = useAuth();
    user = authUser;
  } catch (error) {
    console.error("Auth error:", error);
    // Continue with user as null, which will show the login message
  }
  const { toast } = useToast();
  const [selectedForumId, setSelectedForumId] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Query for forums
  const { data: forums, isLoading: isLoadingForums } = useQuery({
    queryKey: ["/api/user/forums"],
    queryFn: async () => {
      const res = await apiRequest("/api/user/forums", {
        method: "GET"
      });
      return await res.json();
    },
    enabled: !!user,
  });

  // Query for dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/analytics/dashboard-stats", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest(`/api/analytics/dashboard-stats/${timePeriod}${forumParam}`, {
        method: "GET"
      });
      return await res.json();
    },
  });

  // Query for traffic data
  const { data: trafficData, isLoading: isLoadingTraffic } = useQuery({
    queryKey: ["/api/analytics/traffic", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest(`/api/analytics/traffic/${timePeriod}${forumParam}`, {
        method: "GET"
      });
      return await res.json();
    },
  });

  // Query for daily traffic data
  const { data: dailyTrafficData, isLoading: isLoadingDailyTraffic } = useQuery({
    queryKey: ["/api/analytics/traffic/daily", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest(`/api/analytics/traffic/daily?period=${timePeriod}${forumParam}`, {
        method: "GET"
      });
      return await res.json();
    },
  });

  // Query for top content
  const { data: topContent, isLoading: isLoadingTopContent } = useQuery({
    queryKey: ["/api/analytics/top-content", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest(`/api/analytics/top-content?period=${timePeriod}${forumParam}`, {
        method: "GET"
      });
      return await res.json();
    },
  });

  // Query for SEO rankings
  const { data: seoRankings, isLoading: isLoadingSeoRankings } = useQuery({
    queryKey: ["/api/analytics/seo-rankings", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest(`/api/analytics/seo-rankings?period=${timePeriod}${forumParam}`, {
        method: "GET"
      });
      return await res.json();
    },
  });

  // Query for conversion funnel data
  const { data: conversionFunnel, isLoading: isLoadingConversionFunnel } = useQuery({
    queryKey: ["/api/analytics/conversion-funnel", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest("GET", `/api/analytics/conversion-funnel?period=${timePeriod}${forumParam}`);
      return await res.json();
    },
  });

  // Query for referral traffic
  const { data: referralTraffic, isLoading: isLoadingReferralTraffic } = useQuery({
    queryKey: ["/api/analytics/referral-traffic", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest("GET", `/api/analytics/referral-traffic?period=${timePeriod}${forumParam}`);
      return await res.json();
    },
  });

  // Query for device distribution
  const { data: deviceData, isLoading: isLoadingDeviceData } = useQuery({
    queryKey: ["/api/analytics/device-distribution", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest("GET", `/api/analytics/device-distribution?period=${timePeriod}${forumParam}`);
      return await res.json();
    },
  });

  // Query for geographic data
  const { data: geoData, isLoading: isLoadingGeoData } = useQuery({
    queryKey: ["/api/analytics/geographic-data", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest("GET", `/api/analytics/geographic-data?period=${timePeriod}${forumParam}`);
      return await res.json();
    },
  });

  // Query for lead capture stats
  const { data: leadStats, isLoading: isLoadingLeadStats } = useQuery({
    queryKey: ["/api/analytics/lead-capture-stats", timePeriod, selectedForumId],
    queryFn: async () => {
      const forumParam = selectedForumId ? `&forumId=${selectedForumId}` : "";
      const res = await apiRequest("GET", `/api/analytics/lead-capture-stats?period=${timePeriod}${forumParam}`);
      return await res.json();
    },
  });

  // Function to render trend indicator
  const renderTrend = (trend: string, isPositive: boolean) => {
    const color = isPositive ? "text-green-500" : "text-red-500";
    const arrow = isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    return (
      <div className={`flex items-center ${color}`}>
        {arrow}
        <span className="ml-1">{trend}</span>
      </div>
    );
  };

  // Function to generate chart colors
  const getChartColors = (count: number) => {
    const baseColors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
      "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d0ed57"
    ];
    return Array(count).fill(0).map((_, i) => baseColors[i % baseColors.length]);
  };

  // Function to handle CSV downloads for data export
  const handleDataExport = (dataType: string) => {
    let dataToExport: any[] = [];
    let headers: string[] = [];
    
    switch (dataType) {
      case "traffic":
        dataToExport = dailyTrafficData || [];
        headers = ["date", "visits", "uniqueVisitors", "pageViews"];
        break;
      case "content":
        dataToExport = topContent || [];
        headers = ["title", "views", "answers", "conversions", "ranking", "position"];
        break;
      case "seo":
        dataToExport = seoRankings || [];
        headers = ["keyword", "position", "previousPosition", "change", "url", "searchVolume", "difficulty"];
        break;
      case "leads":
        dataToExport = leadStats?.formStats || [];
        headers = ["formName", "views", "submissions", "conversionRate"];
        break;
    }

    if (dataToExport.length === 0) {
      toast({
        title: "Export failed",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    // Convert data to CSV
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle strings with commas by wrapping in quotes
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"`
            : value;
        }).join(",")
      )
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${dataType}-${timePeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please login to access this page.</div>;
  }

  return (
    <div className="flex min-h-screen bg-dark-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">
            Comprehensive analytics for forum performance, traffic, and SEO
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <div className="w-64">
              <Select
                value={selectedForumId?.toString() || ""}
                onValueChange={(value) => setSelectedForumId(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Forums" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Forums</SelectItem>
                  {isLoadingForums ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading forums...</span>
                    </div>
                  ) : (
                    forums?.map((forum: Forum) => (
                      <SelectItem key={forum.id} value={forum.id.toString()}>
                        {forum.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select
                value={timePeriod}
                onValueChange={(value) => setTimePeriod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic & Engagement</TabsTrigger>
            <TabsTrigger value="seo">SEO Performance</TabsTrigger>
            <TabsTrigger value="conversions">Conversions & Leads</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Traffic</CardDescription>
                      <CardTitle className="text-2xl">{formatNumber(dashboardStats?.traffic?.total || 0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats?.traffic && renderTrend(
                        dashboardStats.traffic.trend,
                        dashboardStats.traffic.trendPositive
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Questions</CardDescription>
                      <CardTitle className="text-2xl">{formatNumber(dashboardStats?.questions?.total || 0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats?.questions && renderTrend(
                        dashboardStats.questions.trend,
                        dashboardStats.questions.trendPositive
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Leads Generated</CardDescription>
                      <CardTitle className="text-2xl">{formatNumber(dashboardStats?.leads?.total || 0)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats?.leads && renderTrend(
                        dashboardStats.leads.trend,
                        dashboardStats.leads.trendPositive
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg. Search Position</CardDescription>
                      <CardTitle className="text-2xl">{dashboardStats?.searchRankings?.average?.toFixed(1) || "N/A"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats?.searchRankings && renderTrend(
                        dashboardStats.searchRankings.trend,
                        dashboardStats.searchRankings.trendPositive
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Traffic Over Time</CardTitle>
                      <CardDescription>Visits and page views over the selected period</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isLoadingDailyTraffic ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={dailyTrafficData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="visits"
                              stroke="#8884d8"
                              fillOpacity={1}
                              fill="url(#colorVisits)"
                            />
                            <Area
                              type="monotone"
                              dataKey="pageViews"
                              stroke="#82ca9d"
                              fillOpacity={1}
                              fill="url(#colorPageViews)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Top Content Performance</CardTitle>
                      <CardDescription>Most viewed content and metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTopContent ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(topContent || []).slice(0, 5).map((item: TopContentItem) => (
                            <div key={item.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
                              <div className="w-2/3">
                                <div className="font-medium truncate">{item.title}</div>
                                <div className="text-xs text-gray-400">
                                  {item.views} views • {item.answers} answers
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="text-sm">{item.ranking}</div>
                                <div className={`text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                  {item.change > 0 ? (
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                  ) : item.change < 0 ? (
                                    <ArrowDown className="h-3 w-3 mr-1" />
                                  ) : (
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                  )}
                                  {Math.abs(item.change)} positions
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Traffic Sources</CardTitle>
                      <CardDescription>Where your visitors are coming from</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isLoadingTraffic ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={trafficData?.trafficSources || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(trafficData?.trafficSources || []).map((entry: TrafficData, index: number) => (
                                <Cell key={`cell-${index}`} fill={getChartColors(10)[index % 10]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Conversion Funnel</CardTitle>
                      <CardDescription>From visitors to leads</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isLoadingConversionFunnel ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={conversionFunnel || []}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip 
                              formatter={(value, name, props) => {
                                return [
                                  `${value} (${props.payload.percentage}%)`,
                                  name
                                ];
                              }}
                            />
                            <Bar dataKey="value" fill="#8884d8">
                              {(conversionFunnel || []).map((entry: ConversionStep, index: number) => (
                                <Cell key={`cell-${index}`} fill={getChartColors(10)[index % 5]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Device Distribution</CardTitle>
                      <CardDescription>Traffic by device type</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isLoadingDeviceData ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deviceData || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(deviceData || []).map((entry: DeviceData, index: number) => (
                                <Cell key={`cell-${index}`} fill={getChartColors(10)[index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Traffic & Engagement Tab */}
          <TabsContent value="traffic">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Visits</CardDescription>
                  <CardTitle className="text-2xl">{formatNumber(trafficData?.totalVisits || 0)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Unique Visitors</CardDescription>
                  <CardTitle className="text-2xl">{formatNumber(trafficData?.uniqueVisitors || 0)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Page Views</CardDescription>
                  <CardTitle className="text-2xl">{formatNumber(trafficData?.pageViews || 0)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Bounce Rate</CardDescription>
                  <CardTitle className="text-2xl">{(trafficData?.bounceRate || 0).toFixed(1)}%</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Detailed Traffic Analytics</CardTitle>
                    <CardDescription>Visits, unique visitors, and page views over time</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDataExport("traffic")}>
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent className="h-96">
                  {isLoadingDailyTraffic ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyTrafficData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="visits" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="uniqueVisitors" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="pageViews" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages by Traffic</CardTitle>
                  <CardDescription>Pages with the most views in the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTraffic ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead className="text-right">Views</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(trafficData?.trafficByPage || []).map((page, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium truncate max-w-xs">{page.page}</TableCell>
                            <TableCell className="text-right">{formatNumber(page.views)}</TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  page.change > 0
                                    ? "text-green-500"
                                    : page.change < 0
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }
                              >
                                {page.change > 0 ? "+" : ""}
                                {page.change}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referral Traffic</CardTitle>
                  <CardDescription>Top referring sources and their conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingReferralTraffic ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Visits</TableHead>
                          <TableHead className="text-right">Conv. Rate</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(referralTraffic || []).map((source: ReferralTraffic, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{source.source}</TableCell>
                            <TableCell className="text-right">{formatNumber(source.visits)}</TableCell>
                            <TableCell className="text-right">{(source.conversionRate * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  source.change > 0
                                    ? "text-green-500"
                                    : source.change < 0
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }
                              >
                                {source.change > 0 ? "+" : ""}
                                {source.change}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Traffic by country or region</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingGeoData ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Country</TableHead>
                          <TableHead className="text-right">Visits</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(geoData || []).map((country: GeographicData, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{country.country}</TableCell>
                            <TableCell className="text-right">{formatNumber(country.visits)}</TableCell>
                            <TableCell className="text-right">{(country.percentage * 100).toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forum to Website Conversion</CardTitle>
                  <CardDescription>Traffic flow between forum and main website</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingTraffic ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Forum to Website</span>
                        </div>
                        <div className="w-8"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Website to Forum</span>
                        </div>
                      </div>
                      
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart
                          data={trafficData?.crossSiteTraffic || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatNumber(value as number)} />
                          <Legend />
                          <Bar dataKey="forumToWebsite" name="Forum to Website" fill="#3b82f6" />
                          <Bar dataKey="websiteToForum" name="Website to Forum" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Performance Tab */}
          <TabsContent value="seo">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Position</CardDescription>
                  <CardTitle className="text-2xl">{dashboardStats?.searchRankings?.average?.toFixed(1) || "N/A"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.searchRankings && renderTrend(
                    dashboardStats.searchRankings.trend,
                    dashboardStats.searchRankings.trendPositive
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Organic CTR</CardDescription>
                  <CardTitle className="text-2xl">{dashboardStats?.clickThroughRate?.percentage?.toFixed(1) || 0}%</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.clickThroughRate && renderTrend(
                    dashboardStats.clickThroughRate.trend,
                    dashboardStats.clickThroughRate.trendPositive
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top 10 Keywords</CardDescription>
                  <CardTitle className="text-2xl">{seoRankings?.topTenCount || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Keywords with Movement</CardDescription>
                  <CardTitle className="text-2xl">{seoRankings?.movingKeywordsCount || 0}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Keyword Rankings</CardTitle>
                    <CardDescription>Position tracking for your target keywords</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDataExport("seo")}>
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingSeoRankings ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead className="text-center">Position</TableHead>
                          <TableHead className="text-center">Change</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead className="text-right">Search Volume</TableHead>
                          <TableHead className="text-right">Difficulty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(seoRankings?.rankings || []).map((keyword: SeoRankingItem) => (
                          <TableRow key={keyword.id}>
                            <TableCell className="font-medium">{keyword.keyword}</TableCell>
                            <TableCell className="text-center">{keyword.position}</TableCell>
                            <TableCell className="text-center">
                              <span
                                className={
                                  keyword.change > 0
                                    ? "text-green-500"
                                    : keyword.change < 0
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }
                              >
                                {keyword.change > 0 ? "+" : ""}
                                {keyword.change}
                              </span>
                            </TableCell>
                            <TableCell className="truncate max-w-xs">
                              <div className="flex items-center">
                                <span className="truncate mr-1">{keyword.url}</span>
                                <ExternalLink className="h-3 w-3 inline text-gray-400" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{formatNumber(keyword.searchVolume)}</TableCell>
                            <TableCell className="text-right">{keyword.difficulty}/100</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking Position Distribution</CardTitle>
                  <CardDescription>Number of keywords by position range</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingSeoRankings ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={seoRankings?.positionDistribution || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Keywords" fill="#8884d8">
                          {(seoRankings?.positionDistribution || []).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                index === 0 ? "#22c55e" : // 1-3 positions (green)
                                index === 1 ? "#84cc16" : // 4-10 positions (light green)
                                index === 2 ? "#eab308" : // 11-20 positions (yellow)
                                index === 3 ? "#f97316" : // 21-50 positions (orange)
                                "#ef4444"                 // 50+ positions (red)
                              } 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ranking Changes Over Time</CardTitle>
                  <CardDescription>Historical position data for top keywords</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingSeoRankings ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={seoRankings?.historicalRankings || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis reversed />
                        <Tooltip />
                        <Legend />
                        {(seoRankings?.topKeywords || []).map((keyword, index) => (
                          <Line
                            key={index}
                            type="monotone"
                            dataKey={keyword}
                            stroke={getChartColors(10)[index]}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversions & Leads Tab */}
          <TabsContent value="conversions">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Leads</CardDescription>
                  <CardTitle className="text-2xl">{formatNumber(dashboardStats?.leads?.total || 0)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.leads && renderTrend(
                    dashboardStats.leads.trend,
                    dashboardStats.leads.trendPositive
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Form Conversion Rate</CardDescription>
                  <CardTitle className="text-2xl">{dashboardStats?.formConversions?.total || 0}%</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.formConversions && renderTrend(
                    dashboardStats.formConversions.trend,
                    dashboardStats.formConversions.trendPositive
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Forum to Website CTR</CardDescription>
                  <CardTitle className="text-2xl">{leadStats?.forumToWebsiteCTR?.toFixed(1) || 0}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Gated Content Downloads</CardDescription>
                  <CardTitle className="text-2xl">{formatNumber(leadStats?.gatedContentDownloads || 0)}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Lead Capture Form Performance</CardTitle>
                    <CardDescription>Views, submissions, and conversion rates for each form</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDataExport("leads")}>
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingLeadStats ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Form Name</TableHead>
                          <TableHead className="text-right">Views</TableHead>
                          <TableHead className="text-right">Submissions</TableHead>
                          <TableHead className="text-right">Conversion Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(leadStats?.formStats || []).map((form, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{form.formName}</TableCell>
                            <TableCell className="text-right">{formatNumber(form.views)}</TableCell>
                            <TableCell className="text-right">{formatNumber(form.submissions)}</TableCell>
                            <TableCell className="text-right">{(form.conversionRate * 100).toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Generation Over Time</CardTitle>
                  <CardDescription>Form submissions and conversion rates</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingLeadStats ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={leadStats?.leadsTrend || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="submissions"
                          name="Submissions"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="conversionRate"
                          name="Conv. Rate (%)"
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forum to Main Site Conversion Funnel</CardTitle>
                  <CardDescription>Tracking user journey across platforms</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingLeadStats ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={leadStats?.forumToWebsiteFunnel || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [
                              `${formatNumber(value as number)} (${props.payload.percentage}%)`,
                              name
                            ];
                          }}
                        />
                        <Bar dataKey="value" name="Users" fill="#8884d8">
                          {(leadStats?.forumToWebsiteFunnel || []).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getChartColors(5)[index]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
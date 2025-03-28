import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useClerk } from "@clerk/clerk-react";

const Analytics = () => {
  const { userId } = useClerk();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch traffic data
  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: [`/api/analytics/traffic/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch daily traffic data
  const { data: dailyTrafficData, isLoading: dailyTrafficLoading } = useQuery({
    queryKey: [`/api/analytics/daily-traffic/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch top content data
  const { data: topContentData, isLoading: topContentLoading } = useQuery({
    queryKey: [`/api/analytics/top-content/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch SEO rankings data
  const { data: seoRankingsData, isLoading: seoRankingsLoading } = useQuery({
    queryKey: [`/api/analytics/seo-rankings/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch conversion funnel data
  const { data: conversionData, isLoading: conversionLoading } = useQuery({
    queryKey: [`/api/analytics/conversion-funnel/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch referral traffic data
  const { data: referralData, isLoading: referralLoading } = useQuery({
    queryKey: [`/api/analytics/referral-traffic/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch device distribution data
  const { data: deviceData, isLoading: deviceLoading } = useQuery({
    queryKey: [`/api/analytics/device-distribution/${dateRange}`],
    enabled: !!userId,
  });

  // Fetch user engagement metrics
  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: [`/api/analytics/user-engagement/${dateRange}`],
    enabled: !!userId,
  });

  // Export data to CSV
  const exportData = async (dataType: string) => {
    try {
      const response = await apiRequest(`/api/analytics/export/${dataType}/${dateRange}`, {
        method: "GET",
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${dataType}-${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      
      toast({
        title: "Export successful",
        description: `Data exported to ${dataType}-${dateRange}.csv`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    }
  };

  // Fallback data when API data isn't available
  const getFallbackTrafficData = () => [
    { date: "Jan", organic: 4000, direct: 2400, referral: 1200, social: 800 },
    { date: "Feb", organic: 5000, direct: 2700, referral: 1300, social: 900 },
    { date: "Mar", organic: 6000, direct: 3000, referral: 1400, social: 1000 },
    { date: "Apr", organic: 7000, direct: 3200, referral: 1500, social: 1100 },
    { date: "May", organic: 8000, direct: 3500, referral: 1600, social: 1200 },
    { date: "Jun", organic: 9000, direct: 3800, referral: 1700, social: 1300 },
    { date: "Jul", organic: 10000, direct: 4000, referral: 1800, social: 1400 },
  ];

  const getFallbackDailyTrafficData = () => [
    { day: "Mon", views: 2400, sessions: 1400, users: 800 },
    { day: "Tue", views: 2200, sessions: 1300, users: 750 },
    { day: "Wed", views: 2800, sessions: 1600, users: 900 },
    { day: "Thu", views: 3000, sessions: 1800, users: 1000 },
    { day: "Fri", views: 2900, sessions: 1700, users: 950 },
    { day: "Sat", views: 1800, sessions: 1000, users: 600 },
    { day: "Sun", views: 1600, sessions: 900, users: 500 },
  ];

  const getFallbackTopContentData = () => [
    {
      id: 1,
      title: "Best Practices for SEO Optimization in 2023",
      views: 12500,
      sessions: 8700,
      conversions: 320,
      bounceRate: "23%",
      avgTimeOnPage: "4:32",
    },
    {
      id: 2,
      title: "How to Improve Website Performance and Core Web Vitals",
      views: 9800,
      sessions: 7200,
      conversions: 285,
      bounceRate: "28%",
      avgTimeOnPage: "3:45",
    },
    {
      id: 3,
      title: "Content Marketing Strategies for SaaS Companies",
      views: 8500,
      sessions: 6300,
      conversions: 210,
      bounceRate: "31%",
      avgTimeOnPage: "3:12",
    },
    {
      id: 4,
      title: "The Complete Guide to Technical SEO",
      views: 7300,
      sessions: 5500,
      conversions: 190,
      bounceRate: "26%",
      avgTimeOnPage: "5:10",
    },
    {
      id: 5,
      title: "Understanding Google's Latest Algorithm Update",
      views: 6800,
      sessions: 4900,
      conversions: 165,
      bounceRate: "29%",
      avgTimeOnPage: "3:58",
    },
  ];

  const getFallbackSeoRankingsData = () => [
    { keyword: "SEO optimization guide", position: 3, change: 2, searchVolume: 8500, difficulty: 65 },
    { keyword: "Website performance best practices", position: 5, change: -1, searchVolume: 6200, difficulty: 58 },
    { keyword: "Content marketing for B2B", position: 2, change: 4, searchVolume: 4800, difficulty: 62 },
    { keyword: "Technical SEO audit", position: 8, change: 0, searchVolume: 5300, difficulty: 70 },
    { keyword: "Google algorithm updates 2023", position: 4, change: 1, searchVolume: 9200, difficulty: 75 },
    { keyword: "SEO tools comparison", position: 7, change: -2, searchVolume: 7100, difficulty: 60 },
    { keyword: "Link building strategies", position: 6, change: 3, searchVolume: 6800, difficulty: 72 },
    { keyword: "Local SEO guide", position: 9, change: -3, searchVolume: 5500, difficulty: 55 },
    { keyword: "Voice search optimization", position: 11, change: 2, searchVolume: 4200, difficulty: 68 },
    { keyword: "Mobile SEO best practices", position: 8, change: 1, searchVolume: 6900, difficulty: 64 },
  ];

  const getFallbackConversionData = () => [
    { stage: "Visitors", value: 100000 },
    { stage: "Engaged", value: 45000 },
    { stage: "Leads", value: 18000 },
    { stage: "Qualified", value: 9000 },
    { stage: "Converted", value: 3600 },
  ];

  const getFallbackReferralData = () => [
    { source: "Google", sessions: 42500, conversions: 1250, conversionRate: "2.94%" },
    { source: "Direct", sessions: 18700, conversions: 720, conversionRate: "3.85%" },
    { source: "Facebook", sessions: 12300, conversions: 305, conversionRate: "2.48%" },
    { source: "Twitter", sessions: 8500, conversions: 185, conversionRate: "2.18%" },
    { source: "LinkedIn", sessions: 7200, conversions: 280, conversionRate: "3.89%" },
    { source: "Bing", sessions: 4800, conversions: 95, conversionRate: "1.98%" },
    { source: "Reddit", sessions: 3900, conversions: 85, conversionRate: "2.18%" },
    { source: "Yahoo", sessions: 2100, conversions: 42, conversionRate: "2.00%" },
    { source: "DuckDuckGo", sessions: 1800, conversions: 38, conversionRate: "2.11%" },
    { source: "Other", sessions: 5400, conversions: 110, conversionRate: "2.04%" },
  ];

  const getFallbackDeviceData = () => [
    { name: "Desktop", value: 52 },
    { name: "Mobile", value: 38 },
    { name: "Tablet", value: 10 },
  ];

  const getFallbackEngagementData = () => [
    { metric: "Pages Per Session", value: 3.7, trend: "+0.5", positive: true },
    { metric: "Avg. Session Duration", value: "4:25", trend: "+0:32", positive: true },
    { metric: "Bounce Rate", value: "38%", trend: "-3%", positive: true },
    { metric: "Return Visitor Rate", value: "42%", trend: "+5%", positive: true },
    { metric: "Engagement Rate", value: "64%", trend: "+7%", positive: true },
  ];

  // Use fallback data if API data isn't available
  const displayTrafficData = trafficData || getFallbackTrafficData();
  const displayDailyTrafficData = dailyTrafficData || getFallbackDailyTrafficData();
  const displayTopContentData = topContentData || getFallbackTopContentData();
  const displaySeoRankingsData = seoRankingsData || getFallbackSeoRankingsData();
  const displayConversionData = conversionData || getFallbackConversionData();
  const displayReferralData = referralData || getFallbackReferralData();
  const displayDeviceData = deviceData || getFallbackDeviceData();
  const displayEngagementData = engagementData || getFallbackEngagementData();

  // Colors for charts
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportData(activeTab)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Traffic by source over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={displayTrafficData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="organic" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="direct" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="referral" stackId="1" stroke="#ffc658" fill="#ffc658" />
                      <Area type="monotone" dataKey="social" stackId="1" stroke="#ff8042" fill="#ff8042" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User device breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayDeviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {displayDeviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Daily Traffic</CardTitle>
                <CardDescription>Views, sessions, and users by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayDailyTrafficData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#8884d8" />
                      <Bar dataKey="sessions" fill="#82ca9d" />
                      <Bar dataKey="users" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey through conversion stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={displayConversionData}
                      margin={{ top: 10, right: 30, left: 50, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {displayConversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Key engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {displayEngagementData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">{item.metric}</div>
                        <div className="text-2xl font-bold">{item.value}</div>
                      </div>
                      <div className={`flex items-center ${item.positive ? 'text-green-500' : 'text-red-500'}`}>
                        {item.positive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
                        <span>{item.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="traffic" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Sessions and conversions by referral source</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayReferralData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.source}</TableCell>
                        <TableCell className="text-right">{item.sessions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.conversions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.conversionRate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Traffic Over Time</CardTitle>
                <CardDescription>Traffic trends by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={displayTrafficData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="organic" stroke="#8884d8" />
                      <Line type="monotone" dataKey="direct" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="referral" stroke="#ffc658" />
                      <Line type="monotone" dataKey="social" stroke="#ff8042" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Content pieces by performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                    <TableHead className="text-right">Avg. Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTopContentData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-right">{item.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.sessions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.conversions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.bounceRate}</TableCell>
                      <TableCell className="text-right">{item.avgTimeOnPage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Rankings</CardTitle>
              <CardDescription>Top keyword positions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-right">Position</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Search Volume</TableHead>
                    <TableHead className="text-right">Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySeoRankingsData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.keyword}</TableCell>
                      <TableCell className="text-right">{item.position}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.change > 0 ? 'text-green-500' : item.change < 0 ? 'text-red-500' : 'text-gray-500'}>
                          {item.change > 0 ? `+${item.change}` : item.change}
                          {item.change > 0 ? <ArrowUp className="inline ml-1 h-4 w-4" /> : 
                           item.change < 0 ? <ArrowDown className="inline ml-1 h-4 w-4" /> : 
                           <ArrowRight className="inline ml-1 h-4 w-4" />}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.searchVolume.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.difficulty}/100</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Conversion Funnel Analysis</CardTitle>
                <CardDescription>User journey through the conversion process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayConversionData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {displayConversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funnel Stage</TableHead>
                        <TableHead className="text-right">Users</TableHead>
                        <TableHead className="text-right">Conversion Rate</TableHead>
                        <TableHead className="text-right">Drop-off Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayConversionData.map((item, index) => {
                        const previousValue = index > 0 ? displayConversionData[index - 1].value : item.value;
                        const conversionRate = index > 0 
                          ? `${((item.value / previousValue) * 100).toFixed(2)}%` 
                          : "100%";
                        const dropoffRate = index > 0 
                          ? `${(((previousValue - item.value) / previousValue) * 100).toFixed(2)}%` 
                          : "0%";
                          
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.stage}</TableCell>
                            <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{conversionRate}</TableCell>
                            <TableCell className="text-right">{dropoffRate}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Key user interaction statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {displayEngagementData.map((item, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">{item.metric}</div>
                        <div className={`flex items-center ${item.positive ? 'text-green-500' : 'text-red-500'}`}>
                          {item.positive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
                          <span>{item.trend}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User sessions by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayDeviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {displayDeviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
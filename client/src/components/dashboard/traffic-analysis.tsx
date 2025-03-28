import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart } from "recharts";
import { 
  Line, 
  Bar, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  CalendarRange, 
  Globe, 
  MousePointerClick, 
  Smartphone, 
  Clock, 
  TrendingUp,
  ExternalLink,
  ArrowRight,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data for graphs
const trafficData = [
  { name: "Jan", organic: 4000, direct: 2400, referral: 1200, social: 800 },
  { name: "Feb", organic: 3000, direct: 1398, referral: 1500, social: 1000 },
  { name: "Mar", organic: 2000, direct: 9800, referral: 2000, social: 1200 },
  { name: "Apr", organic: 2780, direct: 3908, referral: 1800, social: 1500 },
  { name: "May", organic: 1890, direct: 4800, referral: 2400, social: 1700 },
  { name: "Jun", organic: 2390, direct: 3800, referral: 2800, social: 2000 },
  { name: "Jul", organic: 3490, direct: 4300, referral: 3000, social: 2200 },
];

const dailyTrafficData = [
  { name: "Mon", pageviews: 1200, visitors: 800 },
  { name: "Tue", pageviews: 1400, visitors: 950 },
  { name: "Wed", pageviews: 1800, visitors: 1100 },
  { name: "Thu", pageviews: 1600, visitors: 980 },
  { name: "Fri", pageviews: 1500, visitors: 920 },
  { name: "Sat", pageviews: 1100, visitors: 700 },
  { name: "Sun", pageviews: 900, visitors: 600 },
];

const deviceData = [
  { name: "Mobile", value: 45 },
  { name: "Desktop", value: 35 },
  { name: "Tablet", value: 20 },
];

const geoData = [
  { name: "United States", value: 42 },
  { name: "United Kingdom", value: 15 },
  { name: "Canada", value: 12 },
  { name: "Australia", value: 8 },
  { name: "Germany", value: 7 },
  { name: "Others", value: 16 },
];

const sourceData = [
  { name: "Google", value: 4200 },
  { name: "Direct", value: 2800 },
  { name: "Twitter", value: 1500 },
  { name: "Facebook", value: 1200 },
  { name: "Reddit", value: 900 },
  { name: "Others", value: 1300 },
];

const sessionData = [
  { name: "0-30s", value: 25 },
  { name: "30s-2m", value: 35 },
  { name: "2m-5m", value: 20 },
  { name: "5m-15m", value: 15 },
  { name: "15m+", value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TrafficAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30");

  // Fetch traffic data
  const { data: trafficStats } = useQuery({
    queryKey: [`/api/analytics/traffic-data/${dateRange}`],
  });

  // Fetch daily traffic data
  const { data: dailyStats } = useQuery({
    queryKey: [`/api/analytics/daily-traffic/${dateRange}`],
  });

  // Fetch device distribution
  const { data: deviceStats } = useQuery({
    queryKey: [`/api/analytics/device-distribution/${dateRange}`],
  });

  // Fetch geographic data 
  const { data: geoStats } = useQuery({
    queryKey: [`/api/analytics/geographic-data/${dateRange}`],
  });

  // Fetch session duration data
  const { data: sessionStats } = useQuery({
    queryKey: [`/api/analytics/session-duration/${dateRange}`],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Traffic Analysis</h2>
          <p className="text-muted-foreground">Analyze your forum's traffic patterns and sources</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <CalendarRange className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
          
          <Button variant="outline">
            <ArrowRight className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Visits
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78,432</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+16.2%</span> vs previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Page Views
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234,568</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+24.5%</span> vs previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unique Visitors
                </CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42,897</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+12.8%</span> vs previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Session
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3:24</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+0:42</span> vs previous period
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sourceData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" background={{ fill: "#2d2d3d" }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Traffic Trend</CardTitle>
                <CardDescription>Daily traffic over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyTrafficData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pageviews"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="visitors" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top regions by traffic</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={geoData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {geoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Session Duration</CardTitle>
                <CardDescription>How long users stay</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sessionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Breakdown of traffic channels over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trafficData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="organic" stroke="#8884d8" />
                  <Line type="monotone" dataKey="direct" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="referral" stroke="#ffc658" />
                  <Line type="monotone" dataKey="social" stroke="#ff7300" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>Sites sending the most traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "google.com", value: "42.3%", change: "+12.4%" },
                    { name: "reddit.com", value: "15.7%", change: "+8.2%" },
                    { name: "twitter.com", value: "12.5%", change: "+5.7%" },
                    { name: "facebook.com", value: "9.2%", change: "-3.1%" },
                    { name: "linkedin.com", value: "8.4%", change: "+15.2%" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">{item.value}</span>
                        <span className={item.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Search Keywords</CardTitle>
                <CardDescription>Top organic search terms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { keyword: "seo optimized forum questions", volume: "5,240", position: "3" },
                    { keyword: "ai forum platform", volume: "3,780", position: "2" },
                    { keyword: "best lead capture forum", volume: "2,430", position: "1" },
                    { keyword: "keyword optimized q&a", volume: "1,890", position: "5" },
                    { keyword: "content interlinking strategy", volume: "1,650", position: "4" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{item.keyword}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{item.volume}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-xs">
                          #{item.position}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="behavior" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Flow</CardTitle>
                <CardDescription>How users navigate through your forum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center p-2 bg-dark-200 rounded-md">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary">1</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Landing Page</h4>
                      <p className="text-sm text-muted-foreground">42% of sessions start here</p>
                    </div>
                  </div>
                  
                  <div className="w-0.5 h-6 bg-dark-300 self-center"></div>
                  
                  <div className="flex items-center p-2 bg-dark-200 rounded-md">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary">2</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Topic Browse</h4>
                      <p className="text-sm text-muted-foreground">68% continue to this page</p>
                    </div>
                  </div>
                  
                  <div className="w-0.5 h-6 bg-dark-300 self-center"></div>
                  
                  <div className="flex items-center p-2 bg-dark-200 rounded-md">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary">3</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Question Detail</h4>
                      <p className="text-sm text-muted-foreground">54% continue to this page</p>
                    </div>
                  </div>
                  
                  <div className="w-0.5 h-6 bg-dark-300 self-center"></div>
                  
                  <div className="flex items-center p-2 bg-dark-200 rounded-md">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary">4</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Answer Submission</h4>
                      <p className="text-sm text-muted-foreground">23% convert to this action</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>How users interact with your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg. Pages per Session</span>
                      <span className="font-medium">3.7</span>
                    </div>
                    <div className="h-2 bg-dark-300 rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: "74%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bounce Rate</span>
                      <span className="font-medium">32.4%</span>
                    </div>
                    <div className="h-2 bg-dark-300 rounded-full">
                      <div className="h-full bg-yellow-600 rounded-full" style={{ width: "32.4%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg. Time on Page</span>
                      <span className="font-medium">2:45</span>
                    </div>
                    <div className="h-2 bg-dark-300 rounded-full">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: "68%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Return Visitor Rate</span>
                      <span className="font-medium">42.8%</span>
                    </div>
                    <div className="h-2 bg-dark-300 rounded-full">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "42.8%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Question Rate</span>
                      <span className="font-medium">8.3%</span>
                    </div>
                    <div className="h-2 bg-dark-300 rounded-full">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: "8.3%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pages" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Pages with the most traffic and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-300">
                        <th className="text-left font-medium py-2 px-4">Page</th>
                        <th className="text-center font-medium py-2 px-4">Views</th>
                        <th className="text-center font-medium py-2 px-4">Avg. Time</th>
                        <th className="text-center font-medium py-2 px-4">Bounce</th>
                        <th className="text-center font-medium py-2 px-4">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-300">
                      {[
                        { 
                          page: "How to optimize forum questions for SEO?",
                          views: "5,432",
                          time: "4:25",
                          bounce: "24%",
                          conversion: "8.7%"
                        },
                        { 
                          page: "Best practices for content interlinking",
                          views: "4,782",
                          time: "5:12",
                          bounce: "18%",
                          conversion: "12.3%"
                        },
                        { 
                          page: "AI-powered forum platforms comparison",
                          views: "3,954",
                          time: "3:47",
                          bounce: "27%",
                          conversion: "7.8%"
                        },
                        { 
                          page: "How to increase lead capture on forums?",
                          views: "3,218",
                          time: "6:03",
                          bounce: "14%",
                          conversion: "15.2%"
                        },
                        { 
                          page: "Advanced keyword techniques for content",
                          views: "2,871",
                          time: "4:38",
                          bounce: "22%",
                          conversion: "9.1%"
                        },
                      ].map((item, i) => (
                        <tr key={i}>
                          <td className="py-2 px-4">
                            <div className="flex items-center">
                              <span className="ml-2 line-clamp-1">{item.page}</span>
                            </div>
                          </td>
                          <td className="text-center py-2 px-4">{item.views}</td>
                          <td className="text-center py-2 px-4">{item.time}</td>
                          <td className="text-center py-2 px-4">{item.bounce}</td>
                          <td className="text-center py-2 px-4">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
                              {item.conversion}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing 5 of 147 pages
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  CalendarRange, 
  Users, 
  Mail, 
  Clipboard, 
  Download,
  ArrowRight,
  Calendar,
  TrendingUp,
  MousePointerClick,
  FileText,
  UserPlus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Bar, 
  Line, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Define interfaces for our data structures
interface ConversionTrend {
  name: string;
  leads: number;
  subscriptions: number;
  downloads: number;
}

interface FunnelStage {
  name: string;
  value: number;
  percentage: string;
  stage: string;
  count: string;
}

interface LeadCapture {
  name: string;
  email: string;
  source: string;
  interest: string;
  date: string;
}

interface LeadCaptureStats {
  recentLeads: LeadCapture[];
  formMetrics: {
    views: number;
    starts: number;
    completions: number;
    qualifiedLeads: number;
    convertedCustomers: number;
  };
  formPerformance: {
    name: string;
    views: string;
    submissions: string;
    rate: string;
    trend: string;
  }[];
}

interface ConversionStats {
  trends: ConversionTrend[];
  funnelStages: FunnelStage[];
  metrics: {
    visitorToLeadRate: string;
    leadToCustomerRate: string;
    overallConversionRate: string;
    funnelDropOff: string;
  };
  optimization: {
    step: string;
    opportunity: string;
    impact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Conversions() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30");

  // Fetch conversion stats
  const { data: conversionStats, isLoading: isLoadingConversions } = useQuery<ConversionStats>({
    queryKey: [`/api/analytics/conversion-funnel/${dateRange}`],
  });

  // Fetch lead capture stats
  const { data: leadCaptureStats, isLoading: isLoadingLeadCapture } = useQuery<LeadCaptureStats>({
    queryKey: [`/api/analytics/lead-capture-stats/${dateRange}`],
  });
  
  // Define interface for conversion rate data
  interface ConversionRateData {
    name: string;
    rate: number;
  }

  // Fetch conversion rate data
  const { data: conversionRateData, isLoading: isLoadingConversionRate } = useQuery<ConversionRateData[]>({
    queryKey: [`/api/analytics/content-performance-metrics/${dateRange}`],
  });
  
  // Define types for the lead source data
  interface LeadSource {
    name: string;
    value: number;
  }

  // Fetch lead sources data
  const { data: leadSourceData, isLoading: isLoadingLeadSources } = useQuery<LeadSource[]>({
    queryKey: [`/api/analytics/lead-capture-sources/${dateRange}`],
  });
  
  // Fetch top converting content
  const { data: topConvertingContent, isLoading: isLoadingTopContent } = useQuery({
    queryKey: [`/api/analytics/top-performing-content/${dateRange}`],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Conversions</h2>
          <p className="text-muted-foreground">Monitor lead generation and conversion metrics</p>
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
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Capture</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="content">Converting Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Leads
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,892</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+18.9%</span> vs previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.7%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+0.5%</span> vs previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Content Downloads
                </CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">845</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+24.2%</span> vs previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Subscribers
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500">+12.8%</span> vs previous period
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Conversion Trends</CardTitle>
                <CardDescription>Lead generation over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {isLoadingConversions ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                      <span>Loading trend data...</span>
                    </div>
                  ) : !conversionStats?.trends || conversionStats.trends.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>No conversion trend data available</p>
                    </div>
                  ) : (
                    <LineChart
                      data={conversionStats.trends}
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
                        dataKey="leads"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="downloads" stroke="#ffc658" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey to conversion</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {isLoadingConversions ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                      <span>Loading funnel data...</span>
                    </div>
                  ) : !conversionStats?.funnelStages || conversionStats.funnelStages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>No funnel data available</p>
                    </div>
                  ) : (
                    <BarChart
                      data={conversionStats.funnelStages}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={140} />
                      <Tooltip
                        contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => [`${value.toLocaleString()} users`, '']}
                      />
                      <Bar dataKey="value" fill="#8884d8">
                        {conversionStats.funnelStages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where leads are coming from</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {isLoadingLeadSources ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                      <span>Loading lead source data...</span>
                    </div>
                  ) : !leadSourceData || leadSourceData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>No lead source data available</p>
                    </div>
                  ) : (
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Daily Conversion Rate</CardTitle>
                <CardDescription>Percentage of visitors who convert</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {isLoadingConversionRate ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                      <span>Loading conversion rate data...</span>
                    </div>
                  ) : !conversionRateData || conversionRateData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>No conversion rate data available</p>
                    </div>
                  ) : (
                    <BarChart
                      data={conversionRateData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => [`${value}%`, 'Conversion Rate']}
                      />
                      <Bar dataKey="rate" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Capture Performance</CardTitle>
                <CardDescription>Form completions and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeadCapture ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                    <span>Loading lead capture data...</span>
                  </div>
                ) : !leadCaptureStats?.formMetrics ? (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    <p>No lead capture data available</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Form Views</span>
                        <span className="font-medium">{leadCaptureStats.formMetrics.views.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-dark-300 rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: "100%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>+24.5% vs previous</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Form Starts</span>
                        <span className="font-medium">{leadCaptureStats.formMetrics.starts.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-dark-300 rounded-full">
                        <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${(leadCaptureStats.formMetrics.starts / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>+18.3% vs previous</span>
                        <span>{(leadCaptureStats.formMetrics.starts / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Form Completions</span>
                        <span className="font-medium">{leadCaptureStats.formMetrics.completions.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-dark-300 rounded-full">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(leadCaptureStats.formMetrics.completions / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>+21.2% vs previous</span>
                        <span>{(leadCaptureStats.formMetrics.completions / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Qualified Leads</span>
                        <span className="font-medium">{leadCaptureStats.formMetrics.qualifiedLeads.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-dark-300 rounded-full">
                        <div className="h-full bg-yellow-600 rounded-full" style={{ width: `${(leadCaptureStats.formMetrics.qualifiedLeads / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>+15.8% vs previous</span>
                        <span>{(leadCaptureStats.formMetrics.qualifiedLeads / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Converted Customers</span>
                        <span className="font-medium">{leadCaptureStats.formMetrics.convertedCustomers.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-dark-300 rounded-full">
                        <div className="h-full bg-red-600 rounded-full" style={{ width: `${(leadCaptureStats.formMetrics.convertedCustomers / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>+8.7% vs previous</span>
                        <span>{(leadCaptureStats.formMetrics.convertedCustomers / leadCaptureStats.formMetrics.views * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Lead Form Performance</CardTitle>
                <CardDescription>Conversion rates by form type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-300">
                        <th className="text-left font-medium py-2 px-4">Form Type</th>
                        <th className="text-center font-medium py-2 px-4">Views</th>
                        <th className="text-center font-medium py-2 px-4">Submissions</th>
                        <th className="text-center font-medium py-2 px-4">Conv. Rate</th>
                        <th className="text-center font-medium py-2 px-4">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-300">
                      {isLoadingLeadCapture ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                              <span>Loading form performance data...</span>
                            </div>
                          </td>
                        </tr>
                      ) : !leadCaptureStats?.formPerformance || leadCaptureStats.formPerformance.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <p className="text-muted-foreground">No form performance data available</p>
                          </td>
                        </tr>
                      ) : (
                        leadCaptureStats.formPerformance.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-4">
                              <div className="flex items-center">
                                <span className="ml-2">{item.name}</span>
                              </div>
                            </td>
                            <td className="text-center py-2 px-4">{item.views}</td>
                            <td className="text-center py-2 px-4">{item.submissions}</td>
                            <td className="text-center py-2 px-4">{item.rate}</td>
                            <td className="text-center py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.trend.startsWith("+") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                              }`}>
                                {item.trend}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recently Captured Leads</CardTitle>
              <CardDescription>Latest additions to your lead database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-300">
                      <th className="text-left font-medium py-2 px-4">Name</th>
                      <th className="text-left font-medium py-2 px-4">Email</th>
                      <th className="text-left font-medium py-2 px-4">Source</th>
                      <th className="text-left font-medium py-2 px-4">Interest</th>
                      <th className="text-center font-medium py-2 px-4">Date</th>
                      <th className="text-center font-medium py-2 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-300">
                    {isLoadingLeadCapture ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                            <span>Loading lead data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : !leadCaptureStats?.recentLeads || leadCaptureStats.recentLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <p className="text-muted-foreground">No recent leads available</p>
                        </td>
                      </tr>
                    ) : (
                      leadCaptureStats.recentLeads.map((item: LeadCapture, i: number) => (
                        <tr key={i}>
                        <td className="py-2 px-4">
                          <div className="font-medium">{item.name}</div>
                        </td>
                        <td className="py-2 px-4 text-sm">{item.email}</td>
                        <td className="py-2 px-4 text-sm">{item.source}</td>
                        <td className="py-2 px-4">
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {item.interest}
                          </span>
                        </td>
                        <td className="text-center py-2 px-4 text-sm text-muted-foreground">{item.date}</td>
                        <td className="text-center py-2 px-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="funnel" className="pt-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Conversion Funnel Visualization</CardTitle>
                  <CardDescription>Track user journey through your conversion path</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <div className="h-full flex flex-col justify-center">
                    <div className="flex flex-col items-center">
                      {isLoadingConversions ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-primary rounded-full mr-2"></div>
                          <span>Loading funnel data...</span>
                        </div>
                      ) : !conversionStats?.funnelStages || conversionStats.funnelStages.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <p>No funnel data available</p>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col space-y-4">
                          {conversionStats.funnelStages.map((item: FunnelStage, i: number, arr: FunnelStage[]) => (
                            <div key={i} className="w-full">
                              <div 
                                className="bg-primary/80 text-white text-center py-3 rounded-t-lg mx-auto"
                                style={{ 
                                  width: `${100 - (i * (100 / arr.length))}%`,
                                  opacity: 1 - (i * 0.15)
                                }}
                              >
                                <div className="font-medium">{item.stage}</div>
                                <div className="flex justify-center items-center gap-3">
                                  <span>{item.count}</span>
                                  <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                                    {item.percentage}
                                  </span>
                                </div>
                              </div>
                            
                              {i < arr.length - 1 && (
                                <div className="w-0 h-0 mx-auto" 
                                  style={{ 
                                    borderLeft: `${25 - (i * 4)}px solid transparent`,
                                    borderRight: `${25 - (i * 4)}px solid transparent`,
                                    borderTop: '15px solid rgba(var(--primary), 0.8)',
                                    opacity: 0.8 - (i * 0.1),
                                    filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))'
                                  }}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Funnel Analysis</CardTitle>
                  <CardDescription>Key conversion metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Visitor to Lead Rate</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">4.8%</div>
                        <div className="text-sm text-emerald-500">+0.7% vs previous</div>
                      </div>
                      <p className="text-xs text-muted-foreground">720 leads from 15,000 visitors</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Lead to Customer Rate</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">29.9%</div>
                        <div className="text-sm text-emerald-500">+3.2% vs previous</div>
                      </div>
                      <p className="text-xs text-muted-foreground">215 customers from 720 leads</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Overall Conversion Rate</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">1.4%</div>
                        <div className="text-sm text-emerald-500">+0.3% vs previous</div>
                      </div>
                      <p className="text-xs text-muted-foreground">215 customers from 15,000 visitors</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Funnel Drop-off</h3>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">57.3%</div>
                        <div className="text-sm text-emerald-500">-3.4% vs previous</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Biggest drop: Engaged to Lead Form</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Funnel Optimization Opportunities</CardTitle>
                <CardDescription>Insights to improve conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: "Engaged to Lead Form",
                      opportunity: "Add in-content CTAs throughout forum threads",
                      impact: "High",
                      effort: "Medium",
                    },
                    {
                      step: "Lead Form to Completion",
                      opportunity: "Simplify lead form from 6 fields to 4 fields",
                      impact: "Medium",
                      effort: "Low",
                    },
                    {
                      step: "Forum Visitor to Engagement",
                      opportunity: "Implement personalized content recommendations",
                      impact: "High",
                      effort: "High",
                    },
                    {
                      step: "Lead to Customer",
                      opportunity: "Improve lead nurturing email sequence",
                      impact: "Medium",
                      effort: "Medium",
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-4 border border-dark-300 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium">Optimize: {item.step}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.opportunity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <span className="text-xs mr-1">Impact:</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.impact === "High" 
                                ? "bg-emerald-500/20 text-emerald-400" 
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {item.impact}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs mr-1">Effort:</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.effort === "Low" 
                                ? "bg-emerald-500/20 text-emerald-400" 
                                : item.effort === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}>
                              {item.effort}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="pt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Converting Content</CardTitle>
                <CardDescription>Forum content with highest conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-300">
                        <th className="text-left font-medium py-2 px-4">Content</th>
                        <th className="text-center font-medium py-2 px-4">Views</th>
                        <th className="text-center font-medium py-2 px-4">Lead Captures</th>
                        <th className="text-center font-medium py-2 px-4">Conv. Rate</th>
                        <th className="text-center font-medium py-2 px-4">Type</th>
                        <th className="text-center font-medium py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-300">
                      {[
                        { 
                          title: "Top 10 SEO Strategies for Forum Content",
                          views: "3,428",
                          leads: "254",
                          rate: "7.4%",
                          type: "Gated Guide"
                        },
                        { 
                          title: "How to Optimize Questions for Voice Search",
                          views: "2,892",
                          leads: "186",
                          rate: "6.4%",
                          type: "Forum Thread"
                        },
                        { 
                          title: "AI-Powered Content Creation Masterclass",
                          views: "2,145",
                          leads: "167",
                          rate: "7.8%",
                          type: "Webinar"
                        },
                        { 
                          title: "Keyword Analysis Tutorial: Advanced Techniques",
                          views: "1,876",
                          leads: "132",
                          rate: "7.0%",
                          type: "Video Tutorial"
                        },
                        { 
                          title: "Conversion Rate Optimization for Forums",
                          views: "1,654",
                          leads: "112",
                          rate: "6.8%",
                          type: "Case Study"
                        },
                      ].map((item, i) => (
                        <tr key={i}>
                          <td className="py-2 px-4">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">{item.title}</span>
                            </div>
                          </td>
                          <td className="text-center py-2 px-4">{item.views}</td>
                          <td className="text-center py-2 px-4">{item.leads}</td>
                          <td className="text-center py-2 px-4">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
                              {item.rate}
                            </span>
                          </td>
                          <td className="text-center py-2 px-4">
                            <span className="px-2 py-1 bg-dark-300 rounded-full text-xs">
                              {item.type}
                            </span>
                          </td>
                          <td className="text-center py-2 px-4">
                            <Button variant="ghost" size="sm" className="h-8">
                              <MousePointerClick className="h-3 w-3 mr-1" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Magnet Performance</CardTitle>
                  <CardDescription>Downloadable content conversion metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        title: "SEO Checklist Template",
                        downloads: 347,
                        convRate: "12.4%",
                        trend: "+5.2%"
                      },
                      {
                        title: "Keyword Research Guide",
                        downloads: 284,
                        convRate: "10.8%",
                        trend: "+3.7%"
                      },
                      {
                        title: "Forum Optimization Playbook",
                        downloads: 215,
                        convRate: "9.2%",
                        trend: "+7.8%"
                      },
                      {
                        title: "Content Calendar Template",
                        downloads: 178,
                        convRate: "7.6%",
                        trend: "-1.2%"
                      },
                      {
                        title: "AI Prompts Collection",
                        downloads: 154,
                        convRate: "8.3%",
                        trend: "+4.5%"
                      }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="flex items-center mt-1">
                            <Download className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{item.downloads} downloads</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.convRate}</div>
                          <div className={`text-xs ${
                            item.trend.startsWith("+") ? "text-emerald-500" : "text-red-500"
                          }`}>
                            {item.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Topic Analysis</CardTitle>
                  <CardDescription>Which topics drive the most conversions</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "SEO", value: 8.4 },
                        { name: "AI Tools", value: 7.8 },
                        { name: "Content", value: 6.5 },
                        { name: "Analytics", value: 5.9 },
                        { name: "Keyword", value: 7.2 },
                        { name: "Forums", value: 8.1 },
                        { name: "Traffic", value: 6.7 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{ background: "#1e1e2d", borderColor: "#2d2d3d" }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => [`${value}%`, 'Conversion Rate']}
                      />
                      <Bar dataKey="value" fill="#8884d8">
                        {[0, 1, 2, 3, 4, 5, 6].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
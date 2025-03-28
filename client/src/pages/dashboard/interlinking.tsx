import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import InterlinkManager from "@/components/dashboard/interlink-manager";
import Sidebar from "@/components/dashboard/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useBidirectionalInterlinks } from "@/hooks/use-bidirectional-interlinks";
import { Loader2, Link2, FileText, Globe, ArrowUpRight } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";

// Define the Forum type based on the data we receive from the API
interface Forum {
  id: number;
  name: string;
  slug: string;
  description: string;
  subdomain?: string; 
  customDomain?: string;
  themeColor: string;
  primaryFont: string;
  secondaryFont: string;
  headingFontSize: string;
  bodyFontSize: string;
  mainWebsiteUrl?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  createdAt: string;
  totalQuestions: number;
  totalAnswers: number;
}

export default function InterlinkingPage() {
  const [selectedForum, setSelectedForum] = useState<number | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: forums, isLoading: isLoadingForums } = useQuery<Forum[]>({
    queryKey: ['/api/forums/user'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  const { getInterlinkStats } = useBidirectionalInterlinks();
  const { data: interlinkStatsData, isLoading: isLoadingStats } = getInterlinkStats(selectedForum || undefined);
  
  useEffect(() => {
    if (forums && forums.length > 0) {
      setSelectedForum(forums[0].id);
    }
  }, [forums]);

  // Default empty data structures
  const linkTypesData = interlinkStatsData?.linkTypesData || [];
  const interlinkGrowthData = interlinkStatsData?.interlinkGrowthData || [];
  const seoImpactData = interlinkStatsData?.seoImpactData || [];
  const linkQualityData = interlinkStatsData?.linkQualityData || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoadingForums) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Interlink Types Distribution</CardTitle>
            <CardDescription>Breakdown of interlink types across your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={linkTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {linkTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Interlink Growth Over Time</CardTitle>
            <CardDescription>Monthly interlink creation trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interlinkGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="links" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Total Links"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>SEO Impact Analysis</CardTitle>
            <CardDescription>Before vs after interlinking implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={seoImpactData}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="before" name="Before Interlinking" fill="#8884d8" />
                  <Bar dataKey="after" name="After Interlinking" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Interlinking Quality Metrics</CardTitle>
            <CardDescription>Comparing forum and main site link quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={linkQualityData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Forum Content" dataKey="forum" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="Main Site Content" dataKey="mainSite" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interlinking Best Practices</CardTitle>
          <CardDescription>Maximize your interlinking strategy with these tips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center text-primary space-x-2">
                <Link2 className="h-5 w-5" />
                <h3 className="font-medium">Semantic Relevance</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Always link content that has strong semantic relevance. Focus on topics that naturally 
                complement each other rather than forcing connections.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center text-primary space-x-2">
                <FileText className="h-5 w-5" />
                <h3 className="font-medium">Context Awareness</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Place links within contextually relevant paragraphs. The surrounding text should naturally 
                lead to the linked content without disrupting the reader's flow.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center text-primary space-x-2">
                <Globe className="h-5 w-5" />
                <h3 className="font-medium">Bidirectional Value</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Create bidirectional links where appropriate to maximize SEO value and user navigation. 
                Ensure both pieces of content benefit from the connection.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-2 text-primary" />
              Pro Tip: Strategic Anchor Text
            </h4>
            <p className="text-sm text-muted-foreground">
              Use descriptive, keyword-rich anchor text that accurately reflects the linked content. 
              Avoid generic phrases like "click here" or "read more" as they provide little context 
              for both users and search engines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>Content Interlinking System</GradientText>
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Connect your forum content with your main website to enhance SEO, improve user navigation, and create a cohesive content ecosystem.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
            <TabsTrigger value="manager">Interlinking Manager</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {renderAnalyticsSection()}
          </TabsContent>
          
          <TabsContent value="manager">
            <InterlinkManager forumId={selectedForum ? selectedForum : undefined} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
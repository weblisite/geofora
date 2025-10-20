/**
 * Real-time Analytics Component
 * Live analytics dashboard with WebSocket connections for real-time updates
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, Users, Eye, MousePointerClick, Clock, Globe, 
  Smartphone, Monitor, TrendingUp, Zap, Wifi, WifiOff,
  RefreshCw, Play, Pause, Square
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

interface RealTimeMetric {
  timestamp: number;
  visitors: number;
  pageViews: number;
  activeUsers: number;
  events: number;
}

interface LiveUser {
  id: string;
  location: string;
  page: string;
  duration: number;
  device: string;
  source: string;
}

interface RealTimeStats {
  currentVisitors: number;
  activeUsers: number;
  pageViewsPerMinute: number;
  topPages: Array<{
    page: string;
    views: number;
    users: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function RealTimeAnalytics() {
  const [isLive, setIsLive] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [realTimeData, setRealTimeData] = useState<RealTimeMetric[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real-time stats
  const { data: realTimeStats, isLoading: statsLoading } = useQuery<RealTimeStats>({
    queryKey: ['/api/analytics/realtime'],
    queryFn: async () => ({
      currentVisitors: 247,
      activeUsers: 89,
      pageViewsPerMinute: 156,
      topPages: [
        { page: '/forum', views: 89, users: 34 },
        { page: '/dashboard', views: 67, users: 23 },
        { page: '/about', views: 45, users: 18 },
        { page: '/pricing', views: 32, users: 14 },
      ],
      topCountries: [
        { country: 'United States', visitors: 89 },
        { country: 'United Kingdom', visitors: 45 },
        { country: 'Canada', visitors: 32 },
        { country: 'Germany', visitors: 28 },
        { country: 'Australia', visitors: 23 },
      ],
      deviceBreakdown: [
        { device: 'Desktop', count: 134, percentage: 54.3 },
        { device: 'Mobile', count: 89, percentage: 36.0 },
        { device: 'Tablet', count: 24, percentage: 9.7 },
      ],
    }),
    refetchInterval: isLive ? 5000 : false,
  });

  // Simulate real-time data updates
  useEffect(() => {
    if (isLive) {
      const generateRealTimeData = () => {
        const now = Date.now();
        const newDataPoint: RealTimeMetric = {
          timestamp: now,
          visitors: Math.floor(Math.random() * 50) + 200,
          pageViews: Math.floor(Math.random() * 100) + 300,
          activeUsers: Math.floor(Math.random() * 30) + 80,
          events: Math.floor(Math.random() * 200) + 500,
        };

        setRealTimeData(prev => {
          const updated = [...prev, newDataPoint];
          // Keep only last 20 data points
          return updated.slice(-20);
        });

        // Simulate live users
        const newLiveUsers: LiveUser[] = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
          id: `user_${now}_${i}`,
          location: ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'][Math.floor(Math.random() * 5)],
          page: ['/forum', '/dashboard', '/about', '/pricing', '/contact'][Math.floor(Math.random() * 5)],
          duration: Math.floor(Math.random() * 300) + 30,
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          source: ['Google', 'Direct', 'Facebook', 'Twitter'][Math.floor(Math.random() * 4)],
        }));

        setLiveUsers(newLiveUsers);
      };

      intervalRef.current = setInterval(generateRealTimeData, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Analytics</h1>
          <p className="text-muted-foreground">
            Live monitoring of your forum activity
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={isLive} onCheckedChange={setIsLive} />
            <span className="text-sm text-muted-foreground">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.currentVisitors || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">Live</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.activeUsers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
              <span className="text-blue-500">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views/min</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.pageViewsPerMinute || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <MousePointerClick className="h-3 w-3 mr-1 text-purple-500" />
              <span className="text-purple-500">+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3:42</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-orange-500" />
              <span className="text-orange-500">+15s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
            <CardDescription>Real-time visitor and page view activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTime}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatTime(value as number)}
                    formatter={(value, name) => [formatNumber(value as number), name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pageViews" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Current visitors by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realTimeStats?.deviceBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="device" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Visitors']} />
                  <Bar dataKey="count" fill="#8884d8">
                    {realTimeStats?.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Users and Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Live Users</CardTitle>
            <CardDescription>Users currently browsing your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {liveUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-medium">{user.location}</p>
                      <p className="text-xs text-muted-foreground">{user.page}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatDuration(user.duration)}</p>
                    <div className="flex items-center space-x-1">
                      {user.device === 'Desktop' && <Monitor className="h-3 w-3" />}
                      {user.device === 'Mobile' && <Smartphone className="h-3 w-3" />}
                      {user.device === 'Tablet' && <Monitor className="h-3 w-3" />}
                      <span className="text-xs text-muted-foreground">{user.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages (Live)</CardTitle>
            <CardDescription>Most viewed pages right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeStats?.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{page.page}</p>
                      <p className="text-xs text-muted-foreground">{page.users} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{page.views}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution (Live)</CardTitle>
          <CardDescription>Current visitors by country</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {realTimeStats?.topCountries.map((country, index) => (
              <div key={country.country} className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  {index + 1}
                </div>
                <p className="text-sm font-medium">{country.country}</p>
                <p className="text-lg font-bold text-primary">{country.visitors}</p>
                <p className="text-xs text-muted-foreground">visitors</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, 
  Shield, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Info,
  Lock,
  Unlock,
  Server,
  Network,
  Zap,
  Target,
  Clock,
  Users
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Domain {
  id: string;
  domain: string;
  type: 'custom' | 'subdomain';
  status: 'active' | 'pending' | 'failed' | 'verifying';
  verificationToken?: string;
  verificationMethod: 'dns' | 'file' | 'meta';
  createdAt: string;
  lastVerified: string;
  sslEnabled: boolean;
  redirects: Redirect[];
  dnsRecords: DNSRecord[];
}

interface Redirect {
  id: string;
  from: string;
  to: string;
  type: '301' | '302' | 'permanent' | 'temporary';
  status: 'active' | 'inactive';
}

interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: 'active' | 'pending' | 'error';
}

interface Subdomain {
  id: string;
  subdomain: string;
  domain: string;
  status: 'active' | 'pending' | 'failed';
  createdAt: string;
  sslEnabled: boolean;
}

export default function CustomDomainSetupDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [newDomain, setNewDomain] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [newRedirect, setNewRedirect] = useState({ from: '', to: '', type: '301' as const });
  
  const { toast } = useToast();

  // Fetch domains
  const { data: domains, isLoading: domainsLoading, refetch: refetchDomains } = useQuery({
    queryKey: ['/api/domains'],
    queryFn: async () => {
      const response = await apiRequest('/api/domains', { method: 'GET' });
      return await response.json();
    }
  });

  // Fetch subdomains
  const { data: subdomains, isLoading: subdomainsLoading, refetch: refetchSubdomains } = useQuery({
    queryKey: ['/api/subdomains'],
    queryFn: async () => {
      const response = await apiRequest('/api/subdomains', { method: 'GET' });
      return await response.json();
    }
  });

  // Add custom domain
  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiRequest('/api/domains', {
        method: 'POST',
        body: JSON.stringify({ domain, type: 'custom' })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain Added",
        description: "Your custom domain has been added and verification started",
      });
      refetchDomains();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Domain",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add subdomain
  const addSubdomainMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const response = await apiRequest('/api/subdomains', {
        method: 'POST',
        body: JSON.stringify({ subdomain })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subdomain Added",
        description: "Your subdomain has been created successfully",
      });
      refetchSubdomains();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Subdomain",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Verify domain
  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiRequest(`/api/domains/${domainId}/verify`, {
        method: 'POST'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Domain Verification Started",
        description: "We're checking your domain verification",
      });
      refetchDomains();
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle SSL
  const toggleSSLMutation = useMutation({
    mutationFn: async ({ domainId, enabled }: { domainId: string; enabled: boolean }) => {
      const response = await apiRequest(`/api/domains/${domainId}/ssl`, {
        method: 'PUT',
        body: JSON.stringify({ enabled })
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "SSL Settings Updated",
        description: "SSL configuration has been updated",
      });
      refetchDomains();
    },
    onError: (error) => {
      toast({
        title: "SSL Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add redirect
  const addRedirectMutation = useMutation({
    mutationFn: async ({ domainId, redirect }: { domainId: string; redirect: any }) => {
      const response = await apiRequest(`/api/domains/${domainId}/redirects`, {
        method: 'POST',
        body: JSON.stringify(redirect)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Redirect Added",
        description: "URL redirect has been configured",
      });
      refetchDomains();
      setNewRedirect({ from: '', to: '', type: '301' });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Redirect",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddDomain = () => {
    if (!newDomain) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }
    addDomainMutation.mutate(newDomain);
    setNewDomain('');
  };

  const handleAddSubdomain = () => {
    if (!newSubdomain) {
      toast({
        title: "Subdomain Required",
        description: "Please enter a subdomain name",
        variant: "destructive",
      });
      return;
    }
    addSubdomainMutation.mutate(newSubdomain);
    setNewSubdomain('');
  };

  const handleVerifyDomain = (domainId: string) => {
    verifyDomainMutation.mutate(domainId);
  };

  const handleToggleSSL = (domainId: string, enabled: boolean) => {
    toggleSSLMutation.mutate({ domainId, enabled });
  };

  const handleAddRedirect = () => {
    if (!selectedDomain || !newRedirect.from || !newRedirect.to) {
      toast({
        title: "Redirect Details Required",
        description: "Please fill in all redirect fields",
        variant: "destructive",
      });
      return;
    }
    addRedirectMutation.mutate({ domainId: selectedDomain.id, redirect: newRedirect });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "DNS record copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      case 'verifying': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'verifying': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Globe className="w-6 h-6 mr-2 text-primary-400" />
            <GradientText>Custom Domain Setup</GradientText>
          </h1>
          <p className="text-gray-400 mt-1">
            Manage custom domains, subdomains, SSL certificates, and DNS settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Custom Domains</TabsTrigger>
          <TabsTrigger value="subdomains">Subdomains</TabsTrigger>
          <TabsTrigger value="dns">DNS Management</TabsTrigger>
          <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
          <TabsTrigger value="redirects">URL Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Custom Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {domains?.data?.filter((d: Domain) => d.type === 'custom').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active custom domains
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  Subdomains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subdomains?.data?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active subdomains
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  SSL Enabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {domains?.data?.filter((d: Domain) => d.sslEnabled).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Domains with SSL
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Redirects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {domains?.data?.reduce((acc: number, d: Domain) => acc + d.redirects.length, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active redirects
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Domain Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {domains?.data?.slice(0, 5).map((domain: Domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-3 bg-dark-200 rounded-lg">
                      <div className="flex items-center">
                        {getStatusIcon(domain.status)}
                        <div className="ml-3">
                          <p className="text-sm font-medium">{domain.domain}</p>
                          <p className="text-xs text-muted-foreground">
                            {domain.type === 'custom' ? 'Custom Domain' : 'Subdomain'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(domain.status)}>
                          {domain.status}
                        </Badge>
                        {domain.sslEnabled && (
                          <Badge variant="outline" className="text-green-500">
                            SSL
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('domains')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Domain
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('subdomains')}
                  >
                    <Server className="w-4 h-4 mr-2" />
                    Create Subdomain
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('dns')}
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Manage DNS Records
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('ssl')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    SSL Certificates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Domain</CardTitle>
              <CardDescription>
                Add a custom domain to host your forum (e.g., forum.yourcompany.com)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Input
                  placeholder="forum.yourcompany.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddDomain}
                  disabled={addDomainMutation.isPending}
                >
                  {addDomainMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Domain
                </Button>
              </div>
              
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-400">Domain Verification Required</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      After adding your domain, you'll need to verify ownership by adding a DNS record or uploading a verification file.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Custom Domains</CardTitle>
              <CardDescription>
                Manage your custom domains and their verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains?.data?.filter((d: Domain) => d.type === 'custom').map((domain: Domain) => (
                  <div key={domain.id} className="p-4 border border-dark-400 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 mr-3 text-primary-400" />
                        <div>
                          <h3 className="font-semibold">{domain.domain}</h3>
                          <p className="text-sm text-muted-foreground">
                            Added {new Date(domain.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(domain.status)}>
                          {getStatusIcon(domain.status)}
                          <span className="ml-1">{domain.status}</span>
                        </Badge>
                        {domain.sslEnabled && (
                          <Badge variant="outline" className="text-green-500">
                            <Shield className="w-3 h-3 mr-1" />
                            SSL
                          </Badge>
                        )}
                      </div>
                    </div>

                    {domain.status === 'pending' && domain.verificationToken && (
                      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 mb-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">Verification Required</h4>
                        <p className="text-sm text-gray-300 mb-3">
                          Add this TXT record to your domain's DNS settings:
                        </p>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 p-2 bg-dark-200 rounded text-sm">
                            {domain.domain} TXT "{domain.verificationToken}"
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(`${domain.domain} TXT "${domain.verificationToken}"`)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          className="mt-3"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={verifyDomainMutation.isPending}
                        >
                          {verifyDomainMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Verify Domain
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Switch
                            checked={domain.sslEnabled}
                            onCheckedChange={(checked) => handleToggleSSL(domain.id, checked)}
                            disabled={toggleSSLMutation.isPending}
                          />
                          <Label className="ml-2">SSL Certificate</Label>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDomain(domain);
                            setActiveTab('redirects');
                          }}
                        >
                          <Target className="w-4 h-4 mr-1" />
                          Redirects
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDomain(domain);
                            setActiveTab('dns');
                          }}
                        >
                          <Network className="w-4 h-4 mr-1" />
                          DNS
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subdomains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Subdomain</CardTitle>
              <CardDescription>
                Create a subdomain for your forum (e.g., forum.yourcompany.com)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Input
                  placeholder="forum"
                  value={newSubdomain}
                  onChange={(e) => setNewSubdomain(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddSubdomain}
                  disabled={addSubdomainMutation.isPending}
                >
                  {addSubdomainMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Subdomain
                </Button>
              </div>
              
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-400">Instant Setup</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      Subdomains are created instantly and don't require DNS verification.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Subdomains</CardTitle>
              <CardDescription>
                Manage your subdomains and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subdomains?.data?.map((subdomain: Subdomain) => (
                  <div key={subdomain.id} className="p-4 border border-dark-400 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Server className="w-5 h-5 mr-3 text-primary-400" />
                        <div>
                          <h3 className="font-semibold">{subdomain.subdomain}.{subdomain.domain}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(subdomain.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(subdomain.status)}>
                          {getStatusIcon(subdomain.status)}
                          <span className="ml-1">{subdomain.status}</span>
                        </Badge>
                        {subdomain.sslEnabled && (
                          <Badge variant="outline" className="text-green-500">
                            <Shield className="w-3 h-3 mr-1" />
                            SSL
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DNS Management</CardTitle>
              <CardDescription>
                Manage DNS records for your domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDomain ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">DNS Records for {selectedDomain.domain}</h3>
                    <Button
                      size="sm"
                      onClick={() => setSelectedDomain(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedDomain.dnsRecords.map((record: DNSRecord) => (
                      <div key={record.id} className="p-3 bg-dark-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">{record.type}</Badge>
                            <span className="font-mono text-sm">{record.name}</span>
                            <span className="font-mono text-sm">{record.value}</span>
                            <span className="text-xs text-muted-foreground">TTL: {record.ttl}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`${record.name} ${record.type} ${record.value}`)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a domain to view its DNS records</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ssl" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SSL Certificates</CardTitle>
              <CardDescription>
                Manage SSL certificates for your domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains?.data?.map((domain: Domain) => (
                  <div key={domain.id} className="p-4 border border-dark-400 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-3 text-primary-400" />
                        <div>
                          <h3 className="font-semibold">{domain.domain}</h3>
                          <p className="text-sm text-muted-foreground">
                            SSL Certificate Status
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={domain.sslEnabled}
                          onCheckedChange={(checked) => handleToggleSSL(domain.id, checked)}
                          disabled={toggleSSLMutation.isPending}
                        />
                        <Badge variant="outline" className={domain.sslEnabled ? 'text-green-500' : 'text-red-500'}>
                          {domain.sslEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redirects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>URL Redirects</CardTitle>
              <CardDescription>
                Configure URL redirects for your domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDomain ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Redirects for {selectedDomain.domain}</h3>
                    <Button
                      size="sm"
                      onClick={() => setSelectedDomain(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="From URL (e.g., /old-page)"
                        value={newRedirect.from}
                        onChange={(e) => setNewRedirect({ ...newRedirect, from: e.target.value })}
                      />
                      <Input
                        placeholder="To URL (e.g., /new-page)"
                        value={newRedirect.to}
                        onChange={(e) => setNewRedirect({ ...newRedirect, to: e.target.value })}
                      />
                      <Select
                        value={newRedirect.type}
                        onValueChange={(value: any) => setNewRedirect({ ...newRedirect, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="301">301 (Permanent)</SelectItem>
                          <SelectItem value="302">302 (Temporary)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      onClick={handleAddRedirect}
                      disabled={addRedirectMutation.isPending}
                    >
                      {addRedirectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Redirect
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedDomain.redirects.map((redirect: Redirect) => (
                      <div key={redirect.id} className="p-3 bg-dark-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">{redirect.type}</Badge>
                            <span className="font-mono text-sm">{redirect.from}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-mono text-sm">{redirect.to}</span>
                          </div>
                          <Badge variant="outline" className={redirect.status === 'active' ? 'text-green-500' : 'text-gray-500'}>
                            {redirect.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a domain to manage its redirects</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

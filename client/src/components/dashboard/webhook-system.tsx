import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  TestTube, 
  Copy, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Activity,
  Clock,
  Shield,
  Key,
  Globe,
  Code,
  Play,
  Pause,
  Stop,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  headers: Record<string, string>;
  lastDelivery?: {
    timestamp: string;
    status: 'success' | 'failed';
    responseTime: number;
    statusCode: number;
  };
  deliveryStats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    avgResponseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  deliveredAt?: string;
  error?: string;
  createdAt: string;
}

interface WebhookTest {
  id: string;
  webhookId: string;
  testPayload: any;
  status: 'pending' | 'success' | 'failed';
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    responseTime: number;
  };
  error?: string;
  createdAt: string;
}

const availableEvents = [
  { id: 'question.created', name: 'Question Created', description: 'Triggered when a new question is generated' },
  { id: 'response.generated', name: 'Response Generated', description: 'Triggered when an AI response is created' },
  { id: 'forum.updated', name: 'Forum Updated', description: 'Triggered when forum settings are modified' },
  { id: 'analytics.updated', name: 'Analytics Updated', description: 'Triggered when analytics data is refreshed' },
  { id: 'user.registered', name: 'User Registered', description: 'Triggered when a new user registers' },
  { id: 'subscription.changed', name: 'Subscription Changed', description: 'Triggered when subscription plan changes' },
  { id: 'content.moderated', name: 'Content Moderated', description: 'Triggered when content is moderated' },
  { id: 'custom.model.trained', name: 'Custom Model Trained', description: 'Triggered when custom model training completes' },
  { id: 'translation.completed', name: 'Translation Completed', description: 'Triggered when bulk translation finishes' },
  { id: 'seo.indexed', name: 'SEO Indexed', description: 'Triggered when content is indexed by search engines' }
];

export default function WebhookSystem() {
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testPayload, setTestPayload] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const queryClient = useQueryClient();

  // Fetch webhooks
  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery({
    queryKey: ['/api/webhooks'],
    queryFn: async () => {
      const response = await fetch('/api/webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return response.json();
    }
  });

  // Fetch webhook events
  const { data: webhookEvents = [] } = useQuery({
    queryKey: ['/api/webhook-events'],
    queryFn: async () => {
      const response = await fetch('/api/webhook-events');
      if (!response.ok) throw new Error('Failed to fetch webhook events');
      return response.json();
    }
  });

  // Fetch webhook tests
  const { data: webhookTests = [] } = useQuery({
    queryKey: ['/api/webhook-tests'],
    queryFn: async () => {
      const response = await fetch('/api/webhook-tests');
      if (!response.ok) throw new Error('Failed to fetch webhook tests');
      return response.json();
    }
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (webhookData: Partial<WebhookConfig>) => {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });
      if (!response.ok) throw new Error('Failed to create webhook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast.success('Webhook created successfully');
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create webhook: ${error.message}`);
    }
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, ...webhookData }: Partial<WebhookConfig> & { id: string }) => {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });
      if (!response.ok) throw new Error('Failed to update webhook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast.success('Webhook updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update webhook: ${error.message}`);
    }
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete webhook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast.success('Webhook deleted successfully');
      setSelectedWebhook(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete webhook: ${error.message}`);
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async ({ webhookId, payload }: { webhookId: string; payload: any }) => {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });
      if (!response.ok) throw new Error('Failed to test webhook');
      return response.json();
    },
    onSuccess: (data) => {
      setTestResponse(JSON.stringify(data, null, 2));
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-tests'] });
      toast.success('Webhook test completed');
    },
    onError: (error) => {
      toast.error(`Failed to test webhook: ${error.message}`);
    }
  });

  // Retry failed webhook mutation
  const retryWebhookMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/webhook-events/${eventId}/retry`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to retry webhook');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-events'] });
      toast.success('Webhook retry initiated');
    },
    onError: (error) => {
      toast.error(`Failed to retry webhook: ${error.message}`);
    }
  });

  const handleCreateWebhook = () => {
    const newWebhook: Partial<WebhookConfig> = {
      name: '',
      url: '',
      events: [],
      secret: generateSecret(),
      isActive: true,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      headers: {},
      deliveryStats: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        avgResponseTime: 0
      }
    };
    setSelectedWebhook(newWebhook as WebhookConfig);
    setIsCreating(true);
  };

  const handleSaveWebhook = () => {
    if (!selectedWebhook) return;

    if (isCreating) {
      createWebhookMutation.mutate(selectedWebhook);
    } else {
      updateWebhookMutation.mutate(selectedWebhook);
    }
  };

  const handleDeleteWebhook = () => {
    if (!selectedWebhook?.id) return;
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteWebhookMutation.mutate(selectedWebhook.id);
    }
  };

  const handleTestWebhook = () => {
    if (!selectedWebhook?.id || !testPayload) return;
    try {
      const payload = JSON.parse(testPayload);
      testWebhookMutation.mutate({ webhookId: selectedWebhook.id, payload });
    } catch (error) {
      toast.error('Invalid JSON payload');
    }
  };

  const generateSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const addEvent = (eventId: string) => {
    if (!selectedWebhook || selectedWebhook.events.includes(eventId)) return;
    setSelectedWebhook({
      ...selectedWebhook,
      events: [...selectedWebhook.events, eventId]
    });
  };

  const removeEvent = (eventId: string) => {
    if (!selectedWebhook) return;
    setSelectedWebhook({
      ...selectedWebhook,
      events: selectedWebhook.events.filter(e => e !== eventId)
    });
  };

  const addHeader = () => {
    if (!selectedWebhook) return;
    setSelectedWebhook({
      ...selectedWebhook,
      headers: { ...selectedWebhook.headers, '': '' }
    });
  };

  const updateHeader = (key: string, value: string) => {
    if (!selectedWebhook) return;
    const newHeaders = { ...selectedWebhook.headers };
    if (value === '') {
      delete newHeaders[key];
    } else {
      newHeaders[key] = value;
    }
    setSelectedWebhook({
      ...selectedWebhook,
      headers: newHeaders
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (webhooksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading webhooks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook System</h1>
          <p className="text-muted-foreground">
            Configure webhooks for real-time integrations and event notifications
          </p>
        </div>
        <Button onClick={handleCreateWebhook} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Webhook
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Manage your webhook configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhooks.map((webhook: WebhookConfig) => (
                <div
                  key={webhook.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWebhook?.id === webhook.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedWebhook(webhook);
                    setIsCreating(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Webhook className="h-4 w-4" />
                      <span className="font-medium">{webhook.name}</span>
                      {webhook.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWebhook(webhook);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {webhook.url}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {webhook.events.length} events
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {webhook.deliveryStats.successfulDeliveries}/{webhook.deliveryStats.totalDeliveries} success
                    </Badge>
                  </div>
                </div>
              ))}
              
              {webhooks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webhooks configured yet</p>
                  <p className="text-sm">Create your first webhook to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {webhookEvents.slice(0, 5).map((event: WebhookEvent) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{event.eventType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        event.status === 'delivered' ? 'default' :
                        event.status === 'failed' ? 'destructive' :
                        event.status === 'retrying' ? 'secondary' :
                        'outline'
                      } className="text-xs">
                        {event.status}
                      </Badge>
                      {event.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryWebhookMutation.mutate(event.id)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {event.error && (
                    <p className="text-xs text-destructive mt-1">{event.error}</p>
                  )}
                </div>
              ))}
              {webhookEvents.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Webhook Editor */}
        <div className="lg:col-span-2">
          {selectedWebhook ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {isCreating ? 'Create New Webhook' : 'Edit Webhook'}
                    </CardTitle>
                    <CardDescription>
                      Configure webhook settings and event subscriptions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isCreating && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteWebhook}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button onClick={handleSaveWebhook} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Webhook Name</Label>
                        <Input
                          id="name"
                          value={selectedWebhook.name}
                          onChange={(e) => setSelectedWebhook({
                            ...selectedWebhook,
                            name: e.target.value
                          })}
                          placeholder="e.g., My App Webhook"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="url">Webhook URL</Label>
                        <Input
                          id="url"
                          value={selectedWebhook.url}
                          onChange={(e) => setSelectedWebhook({
                            ...selectedWebhook,
                            url: e.target.value
                          })}
                          placeholder="https://your-app.com/webhooks/geofora"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secret">Webhook Secret</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secret"
                          type={showSecret ? "text" : "password"}
                          value={selectedWebhook.secret}
                          onChange={(e) => setSelectedWebhook({
                            ...selectedWebhook,
                            secret: e.target.value
                          })}
                          placeholder="Webhook secret for verification"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedWebhook.secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWebhook({
                            ...selectedWebhook,
                            secret: generateSecret()
                          })}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={selectedWebhook.isActive}
                        onCheckedChange={(checked) => setSelectedWebhook({
                          ...selectedWebhook,
                          isActive: checked
                        })}
                      />
                      <Label htmlFor="isActive">Active Webhook</Label>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        The webhook secret is used to verify that requests come from GEOFORA. 
                        Store this securely and use it to verify webhook signatures.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="events" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Event Subscriptions</h3>
                        <p className="text-sm text-muted-foreground">
                          Select which events should trigger this webhook
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedWebhook.events.map((eventId) => {
                        const event = availableEvents.find(e => e.id === eventId);
                        return (
                          <div key={eventId} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{event?.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {event?.description}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeEvent(eventId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedWebhook.events.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No events subscribed</p>
                        <p className="text-sm">Select events from the list below</p>
                      </div>
                    )}

                    {/* Available Events */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Available Events</h4>
                      <div className="space-y-2">
                        {availableEvents.filter(e => !selectedWebhook.events.includes(e.id)).map((event) => (
                          <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => addEvent(event.id)}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{event.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {event.description}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Retry Policy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxRetries">Max Retries</Label>
                          <Input
                            id="maxRetries"
                            type="number"
                            value={selectedWebhook.retryPolicy.maxRetries}
                            onChange={(e) => setSelectedWebhook({
                              ...selectedWebhook,
                              retryPolicy: {
                                ...selectedWebhook.retryPolicy,
                                maxRetries: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                          <Input
                            id="retryDelay"
                            type="number"
                            value={selectedWebhook.retryPolicy.retryDelay}
                            onChange={(e) => setSelectedWebhook({
                              ...selectedWebhook,
                              retryPolicy: {
                                ...selectedWebhook.retryPolicy,
                                retryDelay: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backoffMultiplier">Backoff Multiplier</Label>
                          <Input
                            id="backoffMultiplier"
                            type="number"
                            step="0.1"
                            value={selectedWebhook.retryPolicy.backoffMultiplier}
                            onChange={(e) => setSelectedWebhook({
                              ...selectedWebhook,
                              retryPolicy: {
                                ...selectedWebhook.retryPolicy,
                                backoffMultiplier: parseFloat(e.target.value)
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Custom Headers</h3>
                        <Button onClick={addHeader} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Header
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(selectedWebhook.headers).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <Input
                              placeholder="Header name"
                              value={key}
                              onChange={(e) => {
                                const newHeaders = { ...selectedWebhook.headers };
                                delete newHeaders[key];
                                if (e.target.value) {
                                  newHeaders[e.target.value] = value;
                                }
                                setSelectedWebhook({
                                  ...selectedWebhook,
                                  headers: newHeaders
                                });
                              }}
                            />
                            <Input
                              placeholder="Header value"
                              value={value}
                              onChange={(e) => updateHeader(key, e.target.value)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateHeader(key, '')}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Test Webhook</h3>
                        <p className="text-sm text-muted-foreground">
                          Send a test payload to verify your webhook endpoint
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testPayload">Test Payload (JSON)</Label>
                        <Textarea
                          id="testPayload"
                          value={testPayload}
                          onChange={(e) => setTestPayload(e.target.value)}
                          placeholder='{"event": "test", "data": {"message": "Hello World"}}'
                          rows={6}
                        />
                      </div>

                      <Button
                        onClick={handleTestWebhook}
                        disabled={!testPayload || testWebhookMutation.isPending}
                        className="gap-2"
                      >
                        <TestTube className="h-4 w-4" />
                        {testWebhookMutation.isPending ? 'Testing...' : 'Test Webhook'}
                      </Button>

                      {testResponse && (
                        <div className="space-y-2">
                          <Label>Test Response</Label>
                          <div className="p-4 bg-muted rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap">{testResponse}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Webhook className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Webhook</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Choose a webhook from the list to edit its configuration, or create a new one.
                </p>
                <Button onClick={handleCreateWebhook} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Webhook Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{webhooks.length}</div>
              <div className="text-sm text-muted-foreground">Total Webhooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {webhooks.filter((w: WebhookConfig) => w.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Webhooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{webhookEvents.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {webhookEvents.filter((e: WebhookEvent) => e.status === 'delivered').length}
              </div>
              <div className="text-sm text-muted-foreground">Successful Deliveries</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Download, Upload, Shield, Eye, EyeOff, FileText, Database, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DataExport {
  id: string;
  name: string;
  description: string;
  format: 'json' | 'csv' | 'xml';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordsCount: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

interface AnonymizedData {
  id: number;
  dataType: string;
  originalContent: string;
  anonymizedContent: string;
  anonymizationMethod: string;
  exportStatus: 'pending' | 'exported' | 'failed';
  exportedAt?: string;
  aiProviderId: number;
}

interface ConsentRecord {
  id: number;
  consentType: string;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  aiProviderId: number;
}

export default function DataExportDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('exports');
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'xml'>('json');

  // Fetch Data Exports
  const { data: dataExports, isLoading: exportsLoading } = useQuery<DataExport[]>({
    queryKey: ['/api/data-export/list'],
    queryFn: async () => {
      const res = await apiRequest('/api/data-export/list', { method: 'GET' });
      return await res.json();
    },
  });

  // Fetch Anonymized Data
  const { data: anonymizedData, isLoading: anonymizedLoading } = useQuery<AnonymizedData[]>({
    queryKey: ['/api/data-export/anonymized'],
    queryFn: async () => {
      const res = await apiRequest('/api/data-export/anonymized', { method: 'GET' });
      return await res.json();
    },
  });

  // Fetch Consent Records
  const { data: consentRecords, isLoading: consentLoading } = useQuery<ConsentRecord[]>({
    queryKey: ['/api/privacy/consent-records'],
    queryFn: async () => {
      const res = await apiRequest('/api/privacy/consent-records', { method: 'GET' });
      return await res.json();
    },
  });

  // Create Data Export
  const createExportMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; format: string; includePersonalData: boolean }) => {
      const res = await apiRequest('/api/data-export/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-export/list'] });
      toast({
        title: 'Success',
        description: 'Data export created successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create data export.',
        variant: 'destructive',
      });
    },
  });

  // Update Consent
  const updateConsentMutation = useMutation({
    mutationFn: async (data: { consentType: string; granted: boolean; aiProviderId: number }) => {
      const res = await apiRequest('/api/privacy/update-consent', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/privacy/consent-records'] });
      toast({
        title: 'Success',
        description: 'Consent updated successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update consent.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateExport = () => {
    const name = (document.getElementById('export-name') as HTMLInputElement)?.value;
    const description = (document.getElementById('export-description') as HTMLTextAreaElement)?.value;
    const includePersonalData = (document.getElementById('include-personal-data') as HTMLInputElement)?.checked;
    
    if (!name || !description) {
      toast({
        title: 'Error',
        description: 'Please enter both name and description.',
        variant: 'destructive',
      });
      return;
    }

    createExportMutation.mutate({
      name,
      description,
      format: selectedFormat,
      includePersonalData: includePersonalData || false,
    });
  };

  const handleConsentChange = (consentType: string, granted: boolean, aiProviderId: number) => {
    updateConsentMutation.mutate({
      consentType,
      granted,
      aiProviderId,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Export & Privacy</h2>
          <p className="text-gray-600">Manage data exports and privacy consent for AI training</p>
        </div>
        <Badge variant="outline" className="text-sm">
          GDPR Compliant
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="exports">Data Exports</TabsTrigger>
          <TabsTrigger value="anonymized">Anonymized Data</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="analytics">Export Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Export</CardTitle>
              <CardDescription>Export anonymized data for AI provider training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="export-name">Export Name</Label>
                  <Input
                    id="export-name"
                    placeholder="e.g., Q&A Dataset Export"
                  />
                </div>
                <div>
                  <Label htmlFor="export-format">Format</Label>
                  <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="export-description">Description</Label>
                <Textarea
                  id="export-description"
                  placeholder="Describe what data will be exported..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="include-personal-data" />
                <Label htmlFor="include-personal-data" className="text-sm">
                  Include anonymized personal data (PII will be removed)
                </Label>
              </div>
              <Button 
                onClick={handleCreateExport}
                disabled={createExportMutation.isPending}
                className="w-full"
              >
                {createExportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Export...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Exports</h3>
            {exportsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading exports...</span>
              </div>
            ) : (
              dataExports?.map((exportItem) => (
                <Card key={exportItem.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{exportItem.name}</CardTitle>
                      <Badge variant={getStatusColor(exportItem.status)}>
                        {exportItem.status}
                      </Badge>
                    </div>
                    <CardDescription>{exportItem.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-600">Format</Label>
                        <p className="font-medium">{exportItem.format.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Records</Label>
                        <p className="font-medium">{exportItem.recordsCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Created</Label>
                        <p className="font-medium">{new Date(exportItem.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Completed</Label>
                        <p className="font-medium">
                          {exportItem.completedAt ? new Date(exportItem.completedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {exportItem.downloadUrl && (
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href={exportItem.downloadUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="anonymized" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Anonymized Data Records</h3>
            {anonymizedLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading anonymized data...</span>
              </div>
            ) : (
              anonymizedData?.map((data) => (
                <Card key={data.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{data.dataType}</CardTitle>
                      <Badge variant={data.exportStatus === 'exported' ? 'default' : 'outline'}>
                        {data.exportStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-600">Original Content</Label>
                        <div className="p-3 bg-gray-50 rounded-md text-sm">
                          {data.originalContent.substring(0, 200)}...
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-600">Anonymized Content</Label>
                        <div className="p-3 bg-green-50 rounded-md text-sm">
                          {data.anonymizedContent.substring(0, 200)}...
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Method</Label>
                          <p className="font-medium">{data.anonymizationMethod}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Provider ID</Label>
                          <p className="font-medium">{data.aiProviderId}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Exported</Label>
                          <p className="font-medium">
                            {data.exportedAt ? new Date(data.exportedAt).toLocaleDateString() : 'Not exported'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing Consent</CardTitle>
              <CardDescription>Manage your consent for data sharing with AI providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading consent records...</span>
                  </div>
                ) : (
                  consentRecords?.map((consent) => (
                    <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{consent.consentType}</h4>
                        <p className="text-sm text-gray-600">Provider ID: {consent.aiProviderId}</p>
                        <p className="text-sm text-gray-600">
                          {consent.granted ? 'Granted' : 'Not granted'} on{' '}
                          {consent.grantedAt ? new Date(consent.grantedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={consent.granted}
                          onCheckedChange={(checked) => 
                            handleConsentChange(consent.consentType, checked as boolean, consent.aiProviderId)
                          }
                        />
                        <Label className="text-sm">
                          {consent.granted ? 'Granted' : 'Not Granted'}
                        </Label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dataExports?.length || 0}</div>
                <p className="text-sm text-gray-600">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Records Exported</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataExports?.reduce((sum, exp) => sum + exp.recordsCount, 0).toLocaleString() || 0}
                </div>
                <p className="text-sm text-gray-600">Total records</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Anonymized Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{anonymizedData?.length || 0}</div>
                <p className="text-sm text-gray-600">Ready for export</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

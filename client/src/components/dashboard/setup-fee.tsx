import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SETUP_FEE_CONFIG, POLAR_CHECKOUT_LINKS } from '@shared/polar-service';

interface SetupFee {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  stripeSessionId?: string;
  polarOrderId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
}

export default function SetupFeeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch Setup Fees
  const { data: setupFees, isLoading: feesLoading } = useQuery<SetupFee[]>({
    queryKey: ['/api/setup-fees'],
    queryFn: async () => {
      const res = await apiRequest('/api/setup-fees', { method: 'GET' });
      return await res.json();
    },
  });

  // Fetch Payment Methods
  const { data: paymentMethods, isLoading: methodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      const res = await apiRequest('/api/payment-methods', { method: 'GET' });
      return await res.json();
    },
  });

  // Create Setup Fee Payment
  const createPaymentMutation = useMutation({
    mutationFn: async (data: { paymentMethodId?: string; savePaymentMethod: boolean }) => {
      const res = await apiRequest('/api/setup-fees/create-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/setup-fees'] });
        toast({
          title: 'Success',
          description: 'Setup fee payment processed successfully!',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to process setup fee payment.',
        variant: 'destructive',
      });
    },
  });

  // Retry Failed Payment
  const retryPaymentMutation = useMutation({
    mutationFn: async (feeId: number) => {
      const res = await apiRequest(`/api/setup-fees/${feeId}/retry`, {
        method: 'POST',
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/setup-fees'] });
        toast({
          title: 'Success',
          description: 'Payment retry initiated successfully!',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to retry payment.',
        variant: 'destructive',
      });
    },
  });

  const handlePaySetupFee = (paymentMethodId?: string) => {
    createPaymentMutation.mutate({
      paymentMethodId,
      savePaymentMethod: !paymentMethodId,
    });
  };

  const handleRetryPayment = (feeId: number) => {
    retryPaymentMutation.mutate(feeId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const currentFee = setupFees?.find(fee => fee.status === 'pending' || fee.status === 'failed');
  const paidFee = setupFees?.find(fee => fee.status === 'paid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Setup Fee Management</h2>
          <p className="text-gray-600">Manage your one-time $1,000 setup fee for GEOFORA platform access</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Required for All Plans
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Setup Fee Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatAmount(SETUP_FEE_CONFIG.AMOUNT, SETUP_FEE_CONFIG.CURRENCY)}</div>
                <p className="text-sm text-gray-600">One-time payment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {currentFee ? getStatusIcon(currentFee.status) : <CheckCircle className="h-5 w-5 text-green-500" />}
                  <span className="font-medium">
                    {currentFee ? currentFee.status.charAt(0).toUpperCase() + currentFee.status.slice(1) : 'Paid'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {currentFee ? 'Setup fee pending' : 'Setup fee completed'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Platform Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {paidFee ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  <span className="font-medium">
                    {paidFee ? 'Active' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {paidFee ? 'Full platform access' : 'Setup fee required'}
                </p>
              </CardContent>
            </Card>
          </div>

          {!paidFee && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Fee Required:</strong> A one-time setup fee of {formatAmount(SETUP_FEE_CONFIG.AMOUNT, SETUP_FEE_CONFIG.CURRENCY)} is required to access the GEOFORA platform. 
                This fee covers platform initialization, AI provider configuration, and account setup.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          {!paidFee ? (
            <Card>
              <CardHeader>
                <CardTitle>Pay Setup Fee</CardTitle>
                <CardDescription>
                  Complete your setup fee payment to access the GEOFORA platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Setup Fee</span>
                      <span>{formatAmount(SETUP_FEE_CONFIG.AMOUNT, SETUP_FEE_CONFIG.CURRENCY)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total</span>
                      <span>{formatAmount(SETUP_FEE_CONFIG.AMOUNT, SETUP_FEE_CONFIG.CURRENCY)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Payment Methods</h4>
                  
                  {methodsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading payment methods...</span>
                    </div>
                  ) : paymentMethods && paymentMethods.length > 0 ? (
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5" />
                            <div>
                              <p className="font-medium">
                                {method.brand?.toUpperCase()} •••• {method.last4}
                              </p>
                              <p className="text-sm text-gray-600">
                                Expires {method.expMonth}/{method.expYear}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handlePaySetupFee(method.id)}
                            disabled={createPaymentMutation.isPending}
                            size="sm"
                          >
                            {createPaymentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Pay Now'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">Complete your $1,000 setup fee payment</p>
                      <a
                        href={POLAR_CHECKOUT_LINKS.setupFee}
                        className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-glow"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Setup Fee via Polar.sh
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Setup Fee Paid</CardTitle>
                <CardDescription>
                  Your setup fee has been successfully processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Payment Completed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Amount Paid</Label>
                      <p className="font-medium">{formatAmount(paidFee.amount, paidFee.currency)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Paid On</Label>
                      <p className="font-medium">{new Date(paidFee.paidAt!).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment History</h3>
            {feesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading payment history...</span>
              </div>
            ) : setupFees && setupFees.length > 0 ? (
              setupFees.map((fee) => (
                <Card key={fee.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Setup Fee #{fee.id}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(fee.status)}>
                          {fee.status}
                        </Badge>
                        {fee.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryPayment(fee.id)}
                            disabled={retryPaymentMutation.isPending}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-600">Amount</Label>
                        <p className="font-medium">{formatAmount(fee.amount, fee.currency)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Created</Label>
                        <p className="font-medium">{new Date(fee.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Paid</Label>
                        <p className="font-medium">
                          {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : 'Not paid'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Payment ID</Label>
                        <p className="font-medium font-mono text-xs">
                          {fee.paymentIntentId || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No payment history found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {methodsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading payment methods...</span>
                </div>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">
                            {method.brand?.toUpperCase()} •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.expMonth}/{method.expYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Default</Badge>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No payment methods saved</p>
                  <Button variant="outline">
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

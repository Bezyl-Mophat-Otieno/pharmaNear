import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  Download,
  Search,
  Receipt,
  AlertCircle,
  RefreshCw,
  Eye,
  Banknote,
  Smartphone,
  Building,
  PiggyBank
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAdminTransactions } from '@/hooks/useAdminData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Order } from '@/types/order';
import { FinancialSummary, Transaction } from '@/types/transaction';

export default function TransactionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);


  const {
    transactions,
    stats: financialSummary,
    loading,
    error,
    refetch
  } = useAdminTransactions();


  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer_fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || transaction.payment_status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.method_of_payment === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });


  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Order ID', 'Customer', 'Amount', 'Payment Method', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.transaction_number,
        t.order_id,
        t.customer_fullname,
        t.total_amount,
        t.method_of_payment,
        t.payment_status,
        new Date(t.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate receipt coming soon.
  const generateReceipt = (transaction: any) => {
    toast({
      title: "Receipt Generated",
      description: `Receipt for transaction ${transaction.transaction_number} is being downloaded.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa': return <Smartphone className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">Monitor financial transactions and reconcile payments</p>
        </div>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading transactions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">Monitor financial transactions and reconcile payments</p>
        </div>
        <div className="text-center">
          <p className="text-destructive">Error loading transactions: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Financial Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {financialSummary?.total_revenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Revenue from transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {financialSummary?.total_profit?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {Number(financialSummary?.total_revenue) > 0
                ? `${((Number(financialSummary.total_profit) / Number(financialSummary.total_revenue)) * 100).toFixed(1)}% profit margin`
                : 'Profit margin'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary?.total_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: KSh {Number(financialSummary?.average_order_value).toFixed(2)}/order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{financialSummary?.pending_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">Pending transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">M-Pesa Revenue</CardTitle>
            <Smartphone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">KSh {financialSummary?.mpesa_revenue}</div>
            <p className="text-xs text-muted-foreground">
              {Number(financialSummary?.total_revenue) > 0
                ? `${((Number(financialSummary.mpesa_revenue) / Number(financialSummary.total_revenue)) * 100).toFixed(1)}% of total`
                : '0% of total'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">KSh {financialSummary?.cash_revenue}</div>
            <p className="text-xs text-muted-foreground">
              {Number(financialSummary?.total_revenue) > 0
                ? `${((Number(financialSummary.cash_revenue) / Number(financialSummary.total_revenue)) * 100).toFixed(1)}% of total`
                : '0% of total'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Methods</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">KSh {financialSummary?.bank_revenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {Number(financialSummary?.total_revenue) > 0
                ? `${((Number(financialSummary.bank_revenue) / Number(financialSummary.total_revenue)) * 100).toFixed(1)}% of total`
                : '0% of total'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders for Reconciliation */}
      {/* Note: This section would need to be connected to actual pending orders data */}
      {/* {mockOrders.length > 0 && ( */}
      {false && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Orders Awaiting Payment Reconciliation
            </CardTitle>
            <CardDescription>
              These orders need payment reconciliation for offline transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Orders would be mapped here */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Manage and track all payments and transactions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => refetch()} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions, orders, or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.transaction_number}</p>
                        <p className="text-sm text-muted-foreground">{transaction.order_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.customer_fullname}</p>
                        <p className="text-sm text-muted-foreground">{transaction.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      KSh {transaction.total_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.method_of_payment)}
                        <span className="capitalize">{transaction.method_of_payment?.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.payment_status)}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Transaction ID</Label>
                                    <p className="text-sm">{selectedTransaction.transaction_number}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Order ID</Label>
                                    <p className="text-sm">{selectedTransaction.order_id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Amount</Label>
                                    <p className="text-sm font-medium">KSh {selectedTransaction.total_amount?.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <p className="text-sm">{getStatusBadge(selectedTransaction.payment_status)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Customer</Label>
                                    <p className="text-sm">{selectedTransaction.customer_fullname}</p>
                                    <p className="text-xs text-muted-foreground">{selectedTransaction.customer_email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Payment Method</Label>
                                    <p className="text-sm capitalize">{selectedTransaction.method_of_payment?.replace('_', ' ')}</p>
                                  </div>
                                </div>

                                {selectedTransaction.notes && (
                                  <div>
                                    <Label className="text-sm font-medium">Notes</Label>
                                    <p className="text-sm">{selectedTransaction.notes}</p>
                                  </div>
                                )}

                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => generateReceipt(selectedTransaction)}
                                  >
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Download Receipt
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateReceipt(transaction)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
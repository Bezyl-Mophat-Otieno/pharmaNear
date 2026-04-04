import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminOrders } from '@/hooks/useAdminData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, Download, Eye, Delete, Calendar, Package, CreditCard, Truck, DollarSign } from 'lucide-react';
import { downloadReceipt, OrderDetails } from '@/utils/receiptUtils';
import AdminPaymentModal from '@/components/admin/AdminPaymentModal';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';
import { DataPagination } from '@/components/ui/data-pagination';



const OrderManagement = () => {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  const {
    orders,
    loading,
    error,
    updateOrderStatus,
    cancelOrder,
    updatePaymentStatus,
    page, totalPages, total, pageSize, goToPage,
  } = useAdminOrders();

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      toast({
        title: "Order Updated",
        description: `Order ${orderId} status updated to ${newStatus}`,
      });
      setSelectedOrder(updatedOrder)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (order: Order) => {
    try {
      await cancelOrder(order.orderId);
      toast({
        title: "Order Cancelled",
        description: `Order ${order.orderNumber} Cancelled.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    try {
      const updatedOrder = await updatePaymentStatus(orderId, newPaymentStatus);
      toast({
        title: "Payment Status Updated",
        description: `Order ${orderId} payment status updated to ${newPaymentStatus}`,
      });
      setSelectedOrder(updatedOrder)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReceipt = (order: Order) => {
    const orderDetails: OrderDetails = {
      orderId: order.orderId,
      customerName: order.customerInfo.name,
      customerEmail: order.customerInfo.email,
      items: order.items.map(item => ({
        name: item.product.name,
        price: item.unitPrice,
        quantity: item.quantity
      })),
      total: order.total,
      date: new Date(order.createdAt).toLocaleDateString(),
      shippingAddress: order.customerInfo.address
    };
    downloadReceipt(orderDetails);
  };

  const handlePaymentComplete = async (transactionData: any) => {
    if (!selectedOrder) return;

    try {
      await updatePaymentStatus(selectedOrder.orderId, 'paid');
      setIsPaymentModalOpen(false);
      toast({
        title: "Payment Processed",
        description: "Payment has been successfully recorded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading orders..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <div className="text-center">
          <p className="text-destructive">Error loading orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {orderStats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPaymentFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({total > 0 ? total : filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerInfo.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customerInfo.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell className="font-semibold">
                    KSh {order.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(order)}
                        disabled={order.paymentStatus !== 'paid'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelOrder(order)}
                        disabled={order.status === 'cancelled' || order.status === 'completed' || order.status === 'delivered'}
                      >
                        Cancel Order <Delete className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataPagination page={page} totalPages={totalPages} total={total} limit={pageSize} onPageChange={goToPage} />
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="status">Status Management</TabsTrigger>
                  <TabsTrigger value="customer">Customer Info</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div><strong>Order ID:</strong> {selectedOrder.orderId}</div>
                        <div><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                        <div><strong>Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                        <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>KSh {(selectedOrder.total - (selectedOrder.shippingCost || 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>KSh {(selectedOrder.shippingCost || 0).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>KSh {selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <span className="font-medium">{item.product.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>KSh {item.unitPrice.toLocaleString()}</TableCell>
                              <TableCell className="font-semibold">
                                KSh {item.subtotal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="status" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Update Order Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Order Status</label>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(value: OrderStatus) => handleUpdateOrderStatus(selectedOrder.orderId, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem disabled value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-sm font-medium mb-3 block">Payment Management</label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Payment Status</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedOrder.paymentMethod && `Method: ${selectedOrder.paymentMethod}`}
                              </p>
                            </div>
                            {getPaymentBadge(selectedOrder.paymentStatus)}
                          </div>

                          {selectedOrder.paymentStatus === 'pending' && (
                            <Button
                              onClick={() => {
                                setIsPaymentModalOpen(true);
                              }}
                              className="w-full"
                              size="lg"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Process Payment
                            </Button>
                          )}

                          {selectedOrder.paymentStatus !== 'pending' && (
                            <Select
                              value={selectedOrder.paymentStatus}
                              onValueChange={(value: PaymentStatus) => handleUpdatePaymentStatus(selectedOrder.orderId, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Update payment status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadReceipt(selectedOrder)}
                          disabled={selectedOrder.paymentStatus !== 'paid'}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Name:</strong> {selectedOrder.customerInfo.name}</div>
                      <div><strong>Email:</strong> {selectedOrder.customerInfo.email}</div>
                      <div><strong>Phone:</strong> {selectedOrder.customerInfo.phone}</div>
                      <div><strong>Delivery Address:</strong> {selectedOrder.customerInfo.address}</div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {selectedOrder && (
        <AdminPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={selectedOrder}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default OrderManagement;
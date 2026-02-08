
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Home, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import { downloadReceipt, OrderDetails } from '@/utils/receiptUtils';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { items, total, clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Get order details from localStorage or context
    const savedOrder = localStorage.getItem(`order-${orderId}`);
    if (savedOrder) {
      setOrderDetails(JSON.parse(savedOrder));
    } else {
      // Create order details from current cart
      const details: OrderDetails = {
        orderId: orderId || 'ORDER-' + Date.now(),
        customerName: 'Customer', // This should come from checkout form
        customerEmail: 'customer@example.com', // This should come from checkout form
        items: items.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        total,
        date: new Date().toLocaleDateString(),
        shippingAddress: 'Default Address' // This should come from checkout form
      };
      setOrderDetails(details);
      localStorage.setItem(`order-${orderId}`, JSON.stringify(details));
    }
    
    // Clear the cart after order confirmation
    clearCart();
  }, [orderId, items, total, clearCart]);

  const handleDownloadReceipt = () => {
    if (orderDetails) {
      downloadReceipt(orderDetails);
    }
  };

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-playfair font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your purchase</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Order ID</p>
                <p className="text-muted-foreground">{orderDetails.orderId}</p>
              </div>
              <div>
                <p className="font-medium">Date</p>
                <p className="text-muted-foreground">{orderDetails.date}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>KSh {orderDetails.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleDownloadReceipt} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;

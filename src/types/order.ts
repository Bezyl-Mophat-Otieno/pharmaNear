export interface OrderItem {
    product: {
      productId: string;
      name: string;
      price: number;
      images: string[];
    };
    unitPrice: number;
    quantity: number;
    subtotal: number;
}
export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  customerInfo: CustomerInfo;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  shippingCost?: number; // We are yet to factor in shipping costs for now it's 0 Ksh.
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type PaymentStatus ='pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'mpesa' | 'card' | 'cash' | 'other';
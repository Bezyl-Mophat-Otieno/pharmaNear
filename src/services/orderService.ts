import api from '@/lib/api';
import { ApiResponse } from '@/types';
import { Order, PaymentStatus } from '@/types/order';


export const orderService = {
  // Create order
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    customerInfo: Order['customerInfo'];
    paymentMethod?: string;
  }): Promise<ApiResponse> {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  async getUserOrders(): Promise<ApiResponse> {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get order by ID
  async getOrder(id: string): Promise<ApiResponse> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Admin: Get all orders
  async getAllOrders(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Admin: Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<ApiResponse> {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Admin: Update payment status
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<ApiResponse> {
    const response = await api.patch(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  },

  // Admin: Cancel order
  async cancelOrder(id: string, reason?: string): Promise<ApiResponse> {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};
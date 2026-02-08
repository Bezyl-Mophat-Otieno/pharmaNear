import { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { ApiResponse } from '@/types';
import { Order } from '@/types/order';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: ApiResponse = await orderService.getUserOrders();
      if (response.success && response.data) {
        setOrders(response.data as Order[]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: {
    items: Array<{ productId: string; quantity: number }>;
    customerInfo: Order['customerInfo'];
    paymentMethod?: string;
  }) => {
    try {
      const response: ApiResponse = await orderService.createOrder(orderData);
      if (response.success && response.data) {
        const newOrder = response.data as Order;
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      }
      throw new Error(response.message || 'Failed to create order');
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response: ApiResponse = await orderService.cancelOrder(orderId);
      if (response.success && response.data) {
        const updatedOrder = response.data as Order;
        setOrders(prev => prev.map(order => 
          order.orderId === orderId ? updatedOrder : order
        ));
        return updatedOrder;
      }
      throw new Error(response.message || 'Failed to cancel order');
    } catch (err) {
      console.error('Error cancelling order:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    cancelOrder,
  };
};

export const useOrder = (id: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response: ApiResponse = await orderService.getOrder(id);
      if (response.success && response.data) {
        setOrder(response.data as Order);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch order');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
};
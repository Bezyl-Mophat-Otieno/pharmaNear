import api from '@/lib/api';
import { PaymentStats, Transaction } from '@/types/transaction';
import { ApiResponse } from '@/types';

export const transactionService = {
  // Get all transactions with filtering
  async getTransactions(params?: {
    status?: string;
    transactionType?: string;
    methodOfPayment?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.transactionType) queryParams.append('transactionType', params.transactionType);
    if (params?.methodOfPayment) queryParams.append('methodOfPayment', params.methodOfPayment);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/transactions?${queryParams.toString()}`);
    return response.data;
  },

  // Get transaction by ID
  async getTransaction(id: string): Promise<ApiResponse> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Get transactions by order ID
  async getTransactionsByOrderId(orderId: string): Promise<ApiResponse> {
    const response = await api.get(`/transactions/order/${orderId}`);
    return response.data;
  },

  // Create manual transaction (for cash/offline payments)
  async createTransaction(transactionData: {
    orderId: string;
    customerFullname: string;
    customerEmail: string;
    customerPhone?: string;
    methodOfPayment: string;
    transactionType?: string;
    totalAmount: number;
    totalAmountReceived?: number;
    notes?: string;
  }): Promise<ApiResponse> {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Update transaction status
  async updateTransactionStatus(id: string, status: string): Promise<ApiResponse> {
    const response = await api.patch(`/transactions/${id}/status`, { status });
    return response.data;
  },

  // Reconcile transaction
  async reconcileTransaction(id: string, notes?: string): Promise<ApiResponse> {
    const response = await api.patch(`/transactions/${id}/reconcile`, { notes });
    return response.data;
  },

  // Create refund transaction
  async createRefund(id: string, refundAmount: number, reason: string): Promise<ApiResponse> {
    const response = await api.post(`/transactions/${id}/refund`, { refundAmount, reason });
    return response.data;
  },

  // Get transaction statistics
  async getTransactionStats(): Promise<ApiResponse> {
    const response = await api.get('/transactions/stats/overview');
    return response.data;
  },

  // Export transactions to CSV
  async exportTransactions(dateRange?: { from: string; to: string }): Promise<Blob> {
    const params = dateRange ? `?from=${dateRange.from}&to=${dateRange.to}` : '';
    const response = await api.get(`/transactions/export${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Process M-Pesa payment
  async processMpesaPayment(paymentData: {
    orderId: string;
    amount: number;
    phoneNumber: string;
  }): Promise<{ checkoutRequestId: string }> {
    const response = await api.post('/payments/mpesa/stk-push', paymentData);
    return response.data;
  },

  // Check M-Pesa payment status
  async checkMpesaPaymentStatus(checkoutRequestId: string): Promise<Transaction> {
    const response = await api.get(`/payments/mpesa/status/${checkoutRequestId}`);
    return response.data;
  },
};
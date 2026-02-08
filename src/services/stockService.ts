import api from '@/lib/api';
import { ApiResponse } from '@/types';

export interface StockProduct {
  product_id: string;
  name: string;
  slug: string;
  stock: number;
  low_stock_threshold: number;
  total_sold: number;
  selling_price: number;
  buying_price: number;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StockStats {
  total_products: number;
  out_of_stock_count: number;
  low_stock_count: number;
  healthy_stock_count: number;
  total_stock_units: number;
  average_stock_per_product: number;
}

export const stockService = {
  // Get all products with stock information
  async getStockData(params?: {
    search?: string;
    categoryId?: string;
    status?: 'all' | 'out-of-stock' | 'low-stock' | 'in-stock';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/stock?${queryParams.toString()}`);
    return response.data;
  },

  // Get stock statistics
  async getStockStats(): Promise<ApiResponse> {
    const response = await api.get('/stock/stats');
    return response.data;
  },

  // Get low stock products
  async getLowStockProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/stock/low?${queryParams.toString()}`);
    return response.data;
  },

  // Get out of stock products
  async getOutOfStockProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/stock/out?${queryParams.toString()}`);
    return response.data;
  },

  // Get top selling products
  async getTopSellingProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/stock/top-sellers?${queryParams.toString()}`);
    return response.data;
  },

  // Update product stock
  async updateProductStock(productId: string, newStock: number, reason?: string): Promise<ApiResponse> {
    const response = await api.patch(`/stock/${productId}`, { newStock, reason });
    return response.data;
  },

  // Restock product (add to existing stock)
  async restockProduct(productId: string, quantity: number, reason?: string): Promise<ApiResponse> {
    const response = await api.patch(`/stock/${productId}/restock`, { quantity, reason });
    return response.data;
  },
};
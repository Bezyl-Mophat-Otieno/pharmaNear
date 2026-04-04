import api from '@/lib/api';
import { ApiResponse } from '@/types';
import { Product } from '@/types/product';

export const productService = {
  // Get all products
  async getProducts(): Promise<ApiResponse> {
    const response = await api.get('/products');
    return response.data;
  },

  async getAdminProducts(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await api.get(`/products/admin?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get product by ID
  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<ApiResponse> {
    const response = await api.get(`/products?category=${category}`);
    return response.data;
  },

  // Search products
  async searchProducts(
    query: string,
    options?: {
      latitude?: number;
      longitude?: number;
      page?: number;
      limit?: number;
      // secondary filters
      business_id?: string;
      requires_prescription?: boolean;
      category_id?: string;
      manufacturer?: string
    }
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({ search: query });
    if (options?.latitude  !== undefined) params.set('latitude',  String(options.latitude));
    if (options?.longitude !== undefined) params.set('longitude', String(options.longitude));
    if (options?.page      !== undefined) params.set('page',      String(options.page));
    if (options?.limit     !== undefined) params.set('limit',     String(options.limit));
    if (options?.business_id)             params.set('business_id', options.business_id);
    if (options?.requires_prescription !== undefined)
      params.set('requires_prescription', String(options.requires_prescription));
    if (options?.category_id)             params.set('category_id', options.category_id);
    if (options?.manufacturer)            params.set('manufacturer', options.manufacturer);

    const response = await api.get(`/products/search?${params.toString()}`);
    return response.data;
  },

  // Admin: Create product
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await api.post('/products', product);
    return response.data;
  },
    async uploadImage(file: FormData): Promise<ApiResponse> {
    const response = await api.post(`/uploads/images`, file, { headers: { 'Content-Type': 'multipart/form-data' }});
    return response.data;
  },


  // Admin: Update product
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  // Admin: Delete product
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  // Admin: Update stock
  async updateStock(id: string, stock: number): Promise<Product> {
    const response = await api.patch(`/products/${id}/stock`, { stock });
    return response.data;
  },

  // Upload product images
  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    
    const response = await api.post('/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrls;
  },
};
import api from '@/lib/api';
import { ApiResponse } from '@/types';
import { Product } from '@/types/product';

export const productService = {
  // Get all products
  async getProducts(): Promise<ApiResponse> {
    const response = await api.get('/products');
    return response.data;
  },

    async getAdminProducts(): Promise<ApiResponse> {
    const response = await api.get('/products/admin');
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
    options?: { latitude?: number; longitude?: number }
  ): Promise<ApiResponse> {
    let url = `/products/search?search=${query}`;
    
    if (options?.latitude !== undefined && options?.longitude !== undefined) {
      url += `&latitude=${options.latitude}&longitude=${options.longitude}`;
    }
    
    const response = await api.get(url);
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
import api from '@/lib/api';
import { ApiResponse } from '@/types';
export interface SellerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface SellerData {
  businessName: string;
  businessType?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}
export interface SellerDocument {
  id: string;
  name: string;
  type: 'ppb_license' | 'business_permit';
  url: string;
  uploadedAt: string;
}
export type SellerStatus = 'pending' | 'approved' | 'rejected';

export interface Seller {
  id: string;
  businessName: string;
  businessType?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: SellerStatus;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  documents: SellerDocument[];
  rejectionReason?: string;
  rejectedDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface SellerStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}
export const sellerService = {
  async registerSeller(data: SellerRegistrationData): Promise<ApiResponse> {
    const response = await api.post('/auth/register?role=seller', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  async verifyEmail(email: string, token: string): Promise<ApiResponse> {
    const response = await api.post('/auth/verify-email', { email, token });
    return response.data;
  },
  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
  async registerSellersBusiness(data: SellerData, userId: string): Promise<ApiResponse> {
    const response = await api.post(`/sellers?userId=${userId}`, data);
    return response.data;
  },
  async uploadDocument(file: FormData, type: 'ppb_license' | 'business_permit', userId: string): Promise<ApiResponse> {
    const response = await api.post(`/sellers/upload/documents?type=${type}&userId=${userId}`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async submitOnboarding(payload: {
    userId: string;
    seller: SellerData;
    documents: { ppbLicense?: string; businessPermit?: string };
  }): Promise<ApiResponse> {
    const response = await api.post('/sellers/onboard', payload);
    return response.data;
  },

    async getSellers(params?: {
      status?: SellerStatus;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }): Promise<{ data: Seller[]; stats: SellerStats; total: number }> {
      const response = await api.get('/sellers/admin', { params });
      return response.data;
    },
    async getSeller(id: string): Promise<Seller> {
      const response = await api.get(`/sellers/${id}`);
      return response.data.data;
    },
    async updateSeller(id: string, data: Partial<Seller>): Promise<Seller> {
      const response = await api.put(`/admin/sellers/${id}`, data);
      return response.data.data;
    },
    async deleteSeller(id: string): Promise<ApiResponse> {
      const response = await api.delete(`/admin/sellers/${id}`);
      return response.data;
    },
    async approveSeller(id: string, documentIds: string[]): Promise<Seller> {
      const response = await api.post(`/admin/sellers/${id}/approve`, { documentIds });
      return response.data.data;
    },
    async rejectSeller(id: string, data: {
      reason: string;
      rejectedDocumentIds: string[];
    }): Promise<Seller> {
      const response = await api.post(`/admin/sellers/${id}/reject`, data);
      return response.data.data;
    },
};
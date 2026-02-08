import api from '@/lib/api';
import { ApiResponse } from '@/types';
export type BusinessStatus = 'pending' | 'approved' | 'rejected';
export interface BusinessDocument {
  id: string;
  name: string;
  type: 'ppb_license' | 'business_permit';
  url: string;
  uploadedAt: string;
}
export interface Business {
  id: string;
  businessName: string;
  businessType?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: BusinessStatus;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  documents: BusinessDocument[];
  rejectionReason?: string;
  rejectedDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface BusinessStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}
export const businessService = {
  async getBusinesses(params?: {
    status?: BusinessStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Business[]; stats: BusinessStats; total: number }> {
    const response = await api.get('/admin/businesses', { params });
    return response.data;
  },
  async getBusiness(id: string): Promise<Business> {
    const response = await api.get(`/admin/businesses/${id}`);
    return response.data.data;
  },
  async updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
    const response = await api.put(`/admin/businesses/${id}`, data);
    return response.data.data;
  },
  async deleteBusiness(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/admin/businesses/${id}`);
    return response.data;
  },
  async approveBusiness(id: string, documentIds: string[]): Promise<Business> {
    const response = await api.post(`/admin/businesses/${id}/approve`, { documentIds });
    return response.data.data;
  },
  async rejectBusiness(id: string, data: {
    reason: string;
    rejectedDocumentIds: string[];
  }): Promise<Business> {
    const response = await api.post(`/admin/businesses/${id}/reject`, data);
    return response.data.data;
  },
};
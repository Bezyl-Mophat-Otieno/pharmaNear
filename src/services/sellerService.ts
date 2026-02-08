import api from '@/lib/api';
import { ApiResponse } from '@/types';
export interface SellerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface BusinessData {
  businessName: string;
  businessType?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}
export const sellerService = {
  async register(data: SellerRegistrationData): Promise<ApiResponse> {
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
  async submitBusiness(data: BusinessData): Promise<ApiResponse> {
    const response = await api.post('/businesses', data);
    return response.data;
  },
  async uploadDocument(file: FormData): Promise<ApiResponse> {
    const response = await api.post('/uploads', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async submitOnboarding(payload: {
    userId: string;
    business: BusinessData;
    documents: { ppbLicense?: string; businessPermit?: string };
  }): Promise<ApiResponse> {
    const response = await api.post('/sellers/onboard', payload);
    return response.data;
  },
};
import api, { API_BASE_URL } from '@/lib/api';
import { ApiResponse } from '@/types';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'superadmin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}


export const uploadService = {
  async upload(file: FormData): Promise<ApiResponse> {
    const response = await api.post(`/uploads`, file, { headers: { 'Content-Type': 'multipart/form-data' }});
    return response.data;
  },

  
};
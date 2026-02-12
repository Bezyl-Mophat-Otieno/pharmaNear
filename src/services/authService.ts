import api from '@/lib/api';
import { ApiResponse, RoleEnum } from '@/types';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: 'customer' | 'admin' | 'seller';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  // User login
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Admin login
  async adminLogin(credentials: LoginCredentials): Promise<ApiResponse> {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },

  // Register user
  async registerUser(data: RegisterData, role=RoleEnum.ADMIN): Promise<ApiResponse> {
    const response = await api.post(`/auth/register?role=${role}`, data);
    return response.data;
  },

  async resetPassword(email: string, password: string): Promise<ApiResponse> {
    const response = await api.post('/auth/reset-password', { email, password });
    return response.data;
  },

  // Fetch all admins
  async fetchAllAdmins(): Promise<ApiResponse> {
    const response = await api.get(`/users?role=${RoleEnum.ADMIN}`);
    return response.data;
  },
  // Fetch all users
  async fetchAllUsers(): Promise<ApiResponse> {
    const response = await api.get('/users?role=user');
    return response.data;
  },

  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Google OAuth login
  async googleLogin(): Promise<ApiResponse> {
    // For Google OAuth, you might need to handle this differently
    // This is a placeholder - adjust based on your OAuth implementation
    const response = await api.get('/auth/google/login');
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};
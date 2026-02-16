import axios from 'axios';
import { toast } from '@/hooks/use-toast';

export const API_BASE_URL = import.meta.env.VITE_PUBLIC_BEEQ_API_URL

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast({
            title: "Authentication Error",
            description: "Please enter valid credentials and try again",
            variant: "destructive",
          });
          break;
        case 403:
          toast({
            title: "Access Denied",
            description: "You don't have permission to perform this action",
            variant: "destructive",
          });
          break;
        case 404:
          toast({
            title: "Not Found",
            description: "The requested resource was not found",
            variant: "destructive",
          });
          break;
          case 302:
            toast({
              title: "Redirect",
              description: "Redirecting to login",
              variant: "destructive",
            });
            break;
          case 409: 
            toast({
              title: "Conflict",
              description: data?.message || "Conflict occurred. Please try again.",
              variant: "destructive",
            });
            break;
        case 500:
          toast({
            title: "Server Error",
            description: "Something went wrong on our end. Please try again later",
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "Error",
            description: data?.message || "An unexpected error occurred",
            variant: "destructive",
          });
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      // Network error
      toast({
        title: "Network Error",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
    } else {
      // Other error
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

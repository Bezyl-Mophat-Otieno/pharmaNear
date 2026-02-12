import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/services/authService';
import { useLocation } from 'react-router-dom';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  signIn: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = (location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller')) && !location.pathname.endsWith('/login');


  // Re-check auth when navigating to admin routes
  useEffect(() => {
    if (isAdminRoute && !user) {
      checkAuthStatus();
    }
  }, [isAdminRoute, user]);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const response = await authService.googleLogin();
      if (response.success && response.data) {
        const user = response.data as User;
        setUser(user);
      } else {
        throw new Error(response.message || 'Google sign in failed');
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const signIn = async (user: User) => {
    setUser(user);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    signIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
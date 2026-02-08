import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

export const useAuthTokenCheck = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const checkTokenExpiry = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await authService.getCurrentUser();
      if (!response.success) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
        
        await signOut();
      }
    } catch (error) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
        
        await signOut()
      
      }
  }, [user, signOut, toast]);

  useEffect(() => {
    if (!user) return;

    // Check token validity every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    // Also check when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, checkTokenExpiry]);

  return { checkTokenExpiry };
};
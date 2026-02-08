import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoleEnum } from '@/types';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to admin login if not authenticated
        navigate('/admin/login', { replace: true });
      } else if (![RoleEnum.ADMIN, RoleEnum.SUPERADMIN].includes(user.role)) {
        // Redirect to home if user is not admin
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || ![RoleEnum.ADMIN, RoleEnum.SUPERADMIN].includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
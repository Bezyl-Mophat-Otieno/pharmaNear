import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoleEnum } from '@/types';

interface TenantuthGuardProps {
  children: React.ReactNode;
}

export function TenantAuthGuard({ children }: TenantuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to tenant login if not authenticated
        navigate('/tenant/login', { replace: true });
      } else if (![RoleEnum.TENANT, RoleEnum.ADMIN].includes(user.role)) {
        // Redirect to home if user is not tenant
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

  if (!user || ![RoleEnum.TENANT, RoleEnum.ADMIN].includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
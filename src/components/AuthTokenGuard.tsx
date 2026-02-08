import { useAuthTokenCheck } from '@/hooks/useAuthTokenCheck';

interface AuthTokenGuardProps {
  children: React.ReactNode;
}

export function AuthTokenGuard({ children }: AuthTokenGuardProps) {
  useAuthTokenCheck();
  return <>{children}</>;
}
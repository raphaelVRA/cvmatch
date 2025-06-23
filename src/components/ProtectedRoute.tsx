
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  accountType?: 'candidate' | 'company';
}

const ProtectedRoute = ({ children, accountType }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    
    if (!loading && user && profile && accountType && profile.account_type !== accountType) {
      navigate('/');
    }
  }, [user, profile, loading, navigate, accountType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (accountType && profile?.account_type !== accountType) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  accountType?: 'candidate' | 'company';
  allowTrial?: boolean;
}

const ProtectedRoute = ({ children, accountType, allowTrial = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !allowTrial) {
      navigate('/auth');
    }
    
    if (!loading && user && profile && accountType && profile.account_type !== accountType) {
      navigate('/');
    }
  }, [user, profile, loading, navigate, accountType, allowTrial]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user && !allowTrial) {
    return null;
  }

  if (user && accountType && profile?.account_type !== accountType) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

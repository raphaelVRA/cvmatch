
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface QuotaLimits {
  candidate: number;
  company: number;
}

const QUOTA_LIMITS: QuotaLimits = {
  candidate: 3,
  company: 10
};

export const useQuota = () => {
  const { user, profile, getMonthlyUsage } = useAuth();
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsage = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      const currentUsage = await getMonthlyUsage();
      setUsage(currentUsage);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsage();
  }, [user, profile]);

  const checkQuota = (): boolean => {
    if (!profile) return false;
    
    const limit = QUOTA_LIMITS[profile.account_type as keyof QuotaLimits];
    const hasQuota = usage < limit;
    
    if (!hasQuota) {
      toast({
        title: "Quota dépassé",
        description: `Vous avez atteint votre limite mensuelle de ${limit} analyses. Passez au plan Pro pour plus d'analyses.`,
        variant: "destructive",
      });
    }
    
    return hasQuota;
  };

  const getQuotaInfo = () => {
    if (!profile) return { used: 0, limit: 0, remaining: 0 };
    
    const limit = QUOTA_LIMITS[profile.account_type as keyof QuotaLimits];
    const remaining = Math.max(0, limit - usage);
    
    return {
      used: usage,
      limit,
      remaining
    };
  };

  return {
    usage,
    loading,
    checkQuota,
    getQuotaInfo,
    refreshUsage: fetchUsage
  };
};

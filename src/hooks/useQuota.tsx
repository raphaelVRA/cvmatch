
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
  const { user, profile, getMonthlyUsage, hasUsedFreeTrial, useFreeTrial } = useAuth();
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
    // Si l'utilisateur n'est pas connecté, vérifier l'essai gratuit
    if (!user) {
      if (hasUsedFreeTrial) {
        toast({
          title: "Essai gratuit utilisé",
          description: "Créez un compte pour continuer à utiliser CVMatch avec 3 analyses gratuites par mois.",
          variant: "destructive",
        });
        return false;
      }
      // Permettre l'essai gratuit
      return true;
    }
    
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

  const consumeQuota = () => {
    if (!user && !hasUsedFreeTrial) {
      useFreeTrial();
    }
  };

  const getQuotaInfo = () => {
    if (!user) {
      return {
        used: hasUsedFreeTrial ? 1 : 0,
        limit: 1,
        remaining: hasUsedFreeTrial ? 0 : 1,
        isTrial: true
      };
    }
    
    if (!profile) return { used: 0, limit: 0, remaining: 0, isTrial: false };
    
    const limit = QUOTA_LIMITS[profile.account_type as keyof QuotaLimits];
    const remaining = Math.max(0, limit - usage);
    
    return {
      used: usage,
      limit,
      remaining,
      isTrial: false
    };
  };

  return {
    usage,
    loading,
    checkQuota,
    getQuotaInfo,
    refreshUsage: fetchUsage,
    consumeQuota
  };
};

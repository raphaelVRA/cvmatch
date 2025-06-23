
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Target } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useSubscription();
  const { toast } = useToast();
  const plan = searchParams.get('plan');

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      await checkSubscription();
      toast({
        title: "Paiement réussi !",
        description: `Votre abonnement ${plan} est maintenant actif.`,
      });
    };

    refreshSubscription();
  }, [plan, checkSubscription, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Paiement réussi !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              Votre abonnement {plan && plan.charAt(0).toUpperCase() + plan.slice(1)} est maintenant actif.
            </p>
            <p className="text-sm text-gray-500">
              Vous pouvez maintenant profiter de toutes les fonctionnalités premium.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/candidate')}
              className="w-full"
            >
              Commencer l'analyse
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;

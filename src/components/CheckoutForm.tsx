
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag } from "lucide-react";

interface CheckoutFormProps {
  planType: 'startup' | 'business';
  onClose: () => void;
}

const CheckoutForm = ({ planType, onClose }: CheckoutFormProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState<{code: string, discount: number} | null>(null);
  const { toast } = useToast();

  const planDetails = {
    startup: { name: "Startup", price: 29, features: ["50 analyses/mois", "5 postes"] },
    business: { name: "Business", price: 99, features: ["200 analyses/mois", "Postes illimités"] }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Code promo invalide",
          description: "Ce code promo n'existe pas ou a expiré.",
          variant: "destructive",
        });
        return;
      }

      // Check validity and usage
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast({
          title: "Code promo expiré",
          description: "Ce code promo a expiré.",
          variant: "destructive",
        });
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({
          title: "Code promo épuisé",
          description: "Ce code promo a atteint sa limite d'utilisation.",
          variant: "destructive",
        });
        return;
      }

      setPromoApplied({ code: data.code, discount: data.discount_percent });
      toast({
        title: "Code promo appliqué !",
        description: `Réduction de ${data.discount_percent}% appliquée.`,
      });
    } catch (error) {
      console.error("Error validating promo code:", error);
      toast({
        title: "Erreur",
        description: "Impossible de valider le code promo.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType,
          promoCode: promoApplied?.code || null
        }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de créer la session de paiement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = planDetails[planType].price;
  const discountedPrice = promoApplied 
    ? Math.round(currentPrice * (1 - promoApplied.discount / 100))
    : currentPrice;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Plan {planDetails[planType].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="space-y-2">
            {promoApplied && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold line-through text-gray-400">
                  {currentPrice}€
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  -{promoApplied.discount}%
                </Badge>
              </div>
            )}
            <div className="text-3xl font-bold">
              {discountedPrice}€<span className="text-lg font-normal">/mois</span>
            </div>
          </div>
          <ul className="text-sm text-gray-600 mt-4 space-y-1">
            {planDetails[planType].features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="promo">Code promo (optionnel)</Label>
            <div className="flex space-x-2">
              <Input
                id="promo"
                placeholder="WELCOME50"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!promoApplied}
              />
              {!promoApplied ? (
                <Button 
                  variant="outline" 
                  onClick={validatePromoCode}
                  disabled={!promoCode.trim()}
                >
                  <Tag className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPromoApplied(null);
                    setPromoCode("");
                  }}
                >
                  ✕
                </Button>
              )}
            </div>
          </div>

          {promoApplied && (
            <div className="text-sm text-green-600 font-medium">
              Code "{promoApplied.code}" appliqué - {promoApplied.discount}% de réduction
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handleCheckout} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Payer ${discountedPrice}€/mois`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;

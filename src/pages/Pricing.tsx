
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Target, ArrowLeft, Zap, Users, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import CheckoutForm from "@/components/CheckoutForm";

const pricingPlans = [
  {
    name: "Candidat",
    price: "Gratuit",
    description: "Pour tester et améliorer votre CV",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    popular: false,
    planType: "free" as const,
    features: [
      "3 analyses de CV par mois",
      "Score de compatibilité détaillé",
      "Suggestions d'amélioration",
      "Analyse des mots-clés",
      "Comparaison avec 10+ types de postes"
    ],
    limitations: [
      "Limité à 3 analyses/mois",
      "Pas d'historique des analyses"
    ],
    cta: "Commencer gratuitement",
    link: "/candidate"
  },
  {
    name: "Startup",
    price: "29€",
    priceDetail: "/mois",
    description: "Pour les petites équipes et startups",
    icon: Zap,
    color: "from-green-500 to-green-600",
    popular: true,
    planType: "startup" as const,
    features: [
      "50 analyses de CV par mois",
      "Jusqu'à 5 postes différents",
      "Classement automatique des candidats",
      "Export des résultats PDF",
      "Historique des analyses",
      "Support email prioritaire"
    ],
    limitations: [],
    cta: "Essai gratuit 14 jours",
    link: "/company"
  },
  {
    name: "Business",
    price: "99€",
    priceDetail: "/mois",
    description: "Pour les entreprises en croissance",
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    popular: false,
    planType: "business" as const,
    features: [
      "200 analyses de CV par mois",
      "Postes illimités",
      "Intégration API disponible",
      "Rapports détaillés et analytics",
      "Gestion d'équipe (5 utilisateurs)",
      "Formation et onboarding inclus",
      "Support téléphonique dédié"
    ],
    limitations: [],
    cta: "Démo personnalisée",
    link: "/contact"
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, openCustomerPortal } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'startup' | 'business' | null>(null);

  const handlePlanClick = (plan: typeof pricingPlans[0]) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (plan.planType === 'free') {
      window.location.href = '/candidate';
      return;
    }

    if (plan.planType === 'startup' || plan.planType === 'business') {
      setSelectedPlan(plan.planType);
    }
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CVMatch
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              {user && subscription.plan !== 'free' && (
                <Button variant="outline" onClick={handleManageSubscription}>
                  Gérer mon abonnement
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            💰 Tarifs transparents et adaptés
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Que vous soyez candidat en recherche d'emploi ou recruteur, nous avons la solution adaptée à vos besoins. 
            Commencez gratuitement et évoluez selon votre usage.
          </p>
          {user && subscription.plan !== 'free' && (
            <div className="mt-6">
              <Badge className="bg-green-100 text-green-800">
                Plan actuel: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = user && subscription.plan === plan.planType;
            
            return (
              <Card 
                key={index} 
                className={`relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'scale-105 ring-2 ring-green-500' : ''
                } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      ⭐ Plus populaire
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Votre plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <div className="py-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price}
                      {plan.priceDetail && (
                        <span className="text-lg font-normal text-gray-600">{plan.priceDetail}</span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 text-lg">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-500">Limitations :</p>
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div key={limitationIndex} className="flex items-start space-x-2">
                          <span className="text-orange-500 text-sm">•</span>
                          <span className="text-sm text-gray-600">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    className={`w-full py-6 text-lg ${
                      isCurrentPlan 
                        ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                        : plan.popular 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                          : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                    onClick={() => handlePlanClick(plan)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plan actuel' : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Questions fréquentes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Puis-je changer de plan ?
                </h3>
                <p className="text-gray-600">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                  Les changements prennent effet immédiatement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Y a-t-il une période d'engagement ?
                </h3>
                <p className="text-gray-600">
                  Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment 
                  depuis votre espace client.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Les données sont-elles sécurisées ?
                </h3>
                <p className="text-gray-600">
                  Absolument. Nous utilisons un chiffrement de niveau bancaire et ne conservons 
                  les CV que le temps nécessaire à l'analyse.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Proposez-vous des remises volume ?
                </h3>
                <p className="text-gray-600">
                  Oui, nous proposons des tarifs préférentiels pour les gros volumes. 
                  Contactez-nous pour un devis personnalisé.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Prêt à révolutionner votre recrutement ?
              </h3>
              <p className="text-blue-100 mb-6">
                Rejoignez des centaines d'entreprises qui font confiance à CVMatch 
                pour optimiser leur processus de recrutement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link to="/candidate">Tester gratuitement</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/company">Demander une démo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finaliser votre abonnement</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <CheckoutForm 
              planType={selectedPlan} 
              onClose={() => setSelectedPlan(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;

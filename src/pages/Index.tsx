
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Target, BarChart3, Users, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CVMatch
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/candidate" className="text-gray-600 hover:text-blue-600 transition-colors">
                Candidats
              </Link>
              <Link to="/company" className="text-gray-600 hover:text-blue-600 transition-colors">
                Entreprises
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Tarifs
              </Link>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Link to="/auth">Connexion</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
              🚀 L'outil d'analyse CV nouvelle génération
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Analysez et matchez vos CV en quelques secondes
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              CVMatch révolutionne le recrutement en analysant automatiquement la compatibilité entre les CV et vos offres d'emploi. 
              Gagnez du temps, trouvez les meilleurs profils.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6" asChild>
                <Link to="/candidate">
                  <Upload className="w-5 h-5 mr-2" />
                  Tester mon CV (Gratuit)
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50" asChild>
                <Link to="/company">
                  <Users className="w-5 h-5 mr-2" />
                  Solution Entreprise
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Un processus simple et efficace en 3 étapes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">1. Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-gray-600">
                  Uploadez votre CV ou vos CVs candidats en format PDF. Notre système les analyse instantanément.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">2. Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-gray-600">
                  Sélectionnez le poste visé ou décrivez votre besoin. L'IA analyse la compatibilité.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">3. Résultats</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-gray-600">
                  Obtenez un score détaillé, les points forts et les axes d'amélioration.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Pourquoi choisir CVMatch ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Analyse précise</h3>
                    <p className="text-gray-600">
                      Notre algorithme analyse les mots-clés, compétences et expériences pour un matching optimal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Résultats instantanés</h3>
                    <p className="text-gray-600">
                      Obtenez vos résultats en quelques secondes, pas en heures.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Pour tous</h3>
                    <p className="text-gray-600">
                      Candidats et recruteurs trouvent leur compte avec nos solutions adaptées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Démarrez dès maintenant</h3>
              <p className="text-blue-100 mb-6">
                Rejoignez les milliers d'utilisateurs qui font confiance à CVMatch pour optimiser leur recrutement.
              </p>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full" asChild>
                <Link to="/candidate">
                  Tester gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">CVMatch</h1>
              </div>
              <p className="text-gray-400">
                L'outil d'analyse CV nouvelle génération pour candidats et recruteurs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/candidate" className="hover:text-white transition-colors">Candidats</Link></li>
                <li><Link to="/company" className="hover:text-white transition-colors">Entreprises</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CVMatch. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

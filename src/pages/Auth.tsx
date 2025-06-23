
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Target, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    accountType: "candidate"
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation de l'authentification
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isLogin) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur CVMatch !",
      });
    } else {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Compte créé avec succès",
        description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
      });
    }

    setIsLoading(false);
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Fonctionnalité à venir",
      description: `La connexion via ${provider} sera bientôt disponible.`,
    });
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
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">
                {isLogin ? "Connexion" : "Inscription"}
              </CardTitle>
              <CardDescription className="text-lg">
                {isLogin 
                  ? "Connectez-vous à votre compte CVMatch" 
                  : "Créez votre compte CVMatch gratuit"
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          placeholder="John"
                          required={!isLogin}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          placeholder="Doe"
                          required={!isLogin}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accountType">Type de compte</Label>
                      <select
                        id="accountType"
                        value={formData.accountType}
                        onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="candidate">Candidat</option>
                        <option value="company">Entreprise</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="votre@email.com"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        required={!isLogin}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6 text-lg"
                >
                  {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer mon compte")}
                </Button>
              </form>

              {isLogin && (
                <div className="text-center">
                  <Button variant="link" className="text-blue-600">
                    Mot de passe oublié ?
                  </Button>
                </div>
              )}

              <Separator />

              {/* Social Login */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full py-6"
                  onClick={() => handleSocialLogin("Google")}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full py-6"
                  onClick={() => handleSocialLogin("LinkedIn")}
                >
                  <svg className="w-5 h-5 mr-2" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continuer avec LinkedIn
                </Button>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-gray-600">
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                  <Button 
                    variant="link" 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 p-1 ml-1"
                  >
                    {isLogin ? "S'inscrire" : "Se connecter"}
                  </Button>
                </p>
              </div>

              {!isLogin && (
                <div className="text-center text-sm text-gray-500">
                  En créant un compte, vous acceptez nos{" "}
                  <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                    Conditions d'utilisation
                  </Button>{" "}
                  et notre{" "}
                  <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                    Politique de confidentialité
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;

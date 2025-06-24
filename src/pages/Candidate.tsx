
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Target, BarChart3, CheckCircle, XCircle, ArrowLeft, TrendingUp, Award, AlertTriangle, Shield, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { JobPositionSelector } from "@/components/JobPositionSelector";
import { simulateDetailedAnalysis } from "@/utils/cvAnalysis";
import { getJobPositionById } from "@/data/jobPositions";

const Candidate = () => {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      toast({
        title: "CV uploadé avec succès",
        description: `${file.name} est prêt pour l'analyse.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF.",
        variant: "destructive",
      });
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile || !selectedPosition) return;
    
    setIsAnalyzing(true);
    
    // Simulation d'analyse avec le nouveau système
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const result = simulateDetailedAnalysis(selectedFile.name, selectedPosition);
      setAnalysisResult(result);
      setStep(3);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'analyse du CV.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setStep(1);
    setSelectedFile(null);
    setSelectedPosition("");
    setAnalysisResult(null);
  };

  const selectedJob = getJobPositionById(selectedPosition);

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return "text-green-600 bg-green-100";
      case 'medium': return "text-orange-600 bg-orange-100";
      case 'low': return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getConfidenceText = (level: string) => {
    switch (level) {
      case 'high': return "Analyse très fiable";
      case 'medium': return "Analyse modérément fiable";
      case 'low': return "Analyse peu fiable - Profil inadapté";
      default: return "Non défini";
    }
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
            <div className="text-center text-gray-600">
              {step === 1 && "Upload de votre CV"}
              {step === 2 && "Sélection du poste"}
              {step === 3 && "Analyse avancée"}
            </div>
          </div>

          {/* Step 1: File Upload */}
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Uploadez votre CV</CardTitle>
                <CardDescription className="text-lg">
                  Analyse IA avancée avec détection d'incohérences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <Label htmlFor="cv-upload" className="cursor-pointer">
                    <span className="text-xl font-medium text-gray-700">
                      Cliquez pour sélectionner votre CV
                    </span>
                    <br />
                    <span className="text-gray-500">Format PDF uniquement</span>
                  </Label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!selectedFile}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg py-6"
                >
                  Continuer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Position Selection */}
          {step === 2 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Choisissez le poste visé</CardTitle>
                <CardDescription className="text-lg">
                  Analyse précise parmi 25+ métiers spécialisés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="position" className="text-lg font-medium">
                    Type de poste
                  </Label>
                  <div className="mt-2">
                    <JobPositionSelector 
                      value={selectedPosition} 
                      onValueChange={setSelectedPosition}
                      showCategory={true}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 py-6"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={handleAnalysis}
                    disabled={!selectedPosition || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6"
                  >
                    {isAnalyzing ? (
                      <>
                        <BarChart3 className="w-5 h-5 mr-2 animate-spin" />
                        Analyse IA en cours...
                      </>
                    ) : (
                      "Analyser mon CV"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results */}
          {step === 3 && analysisResult && selectedJob && (
            <div className="space-y-6">
              {/* Score principal avec niveau de confiance */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <CardTitle className="text-3xl">Score de compatibilité</CardTitle>
                    <Badge className={`${getConfidenceColor(analysisResult.confidenceLevel)} text-sm`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getConfidenceText(analysisResult.confidenceLevel)}
                    </Badge>
                  </div>
                  <div className="text-6xl font-bold mb-4">{analysisResult.score}%</div>
                  <Progress value={analysisResult.score} className="w-full bg-white/20" />
                  <p className="text-blue-100 mt-2">Pour le poste : {selectedJob.title}</p>
                </CardHeader>
              </Card>

              {/* Alertes d'incohérence */}
              {analysisResult.warningFlags && analysisResult.warningFlags.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-800 mb-2">Alertes détectées par l'IA</h3>
                        <ul className="text-red-700 space-y-1">
                          {analysisResult.warningFlags.map((warning: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Détails du score avec nouvelles métriques */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.breakdown.keywordScore}%</div>
                    <div className="text-sm text-gray-600">Compétences</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{analysisResult.breakdown.experienceScore}%</div>
                    <div className="text-sm text-gray-600">Expérience</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{analysisResult.breakdown.educationScore}%</div>
                    <div className="text-sm text-gray-600">Formation</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-indigo-600">{analysisResult.breakdown.coherenceScore}%</div>
                    <div className="text-sm text-gray-600">Cohérence profil</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Building className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-teal-600">{analysisResult.breakdown.sectorScore}%</div>
                    <div className="text-sm text-gray-600">Pertinence secteur</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{analysisResult.breakdown.certificationScore}%</div>
                    <div className="text-sm text-gray-600">Certifications</div>
                  </CardContent>
                </Card>
              </div>

              {/* Mots-clés */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Compétences identifiées ({analysisResult.matchedKeywords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.matchedKeywords.slice(0, 12).map((keyword: string) => (
                        <Badge key={keyword} className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600">
                      <XCircle className="w-6 h-6 mr-2" />
                      Compétences à développer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.slice(0, 8).map((keyword: string) => (
                        <Badge key={keyword} variant="secondary" className="bg-orange-100 text-orange-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Points forts et améliorations */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-green-600">Points forts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-orange-600">Recommandations IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Target className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={resetAnalysis} variant="outline" className="flex-1 py-6">
                  Analyser un autre CV
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6" asChild>
                  <Link to="/pricing">
                    Débloquer plus d'analyses
                  </Link>
                </Button>
              </div>

              {/* Limitation */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <p className="text-orange-800 text-center">
                    <strong>Analyses restantes ce mois : 2/3</strong> - 
                    <Link to="/pricing" className="text-orange-600 hover:underline ml-1">
                      Passez au plan Pro pour plus d'analyses
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Candidate;

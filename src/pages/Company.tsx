import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Upload, Target, ArrowLeft, Users, BarChart3, Download, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { JobPositionSelector } from "@/components/JobPositionSelector";
import { CVAnalysisResult } from "@/components/CVAnalysisResult";
import { simulateDetailedAnalysis } from "@/utils/cvAnalysis";
import { getJobPositionById } from "@/data/jobPositions";

const Company = () => {
  const [step, setStep] = useState(1);
  const [jobData, setJobData] = useState({
    positionId: "",
    customTitle: "",
    description: "",
    requirements: "",
    keywords: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleJobDataSubmit = () => {
    if (!jobData.positionId && !jobData.customTitle) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un poste ou saisir un titre personnalisé.",
        variant: "destructive",
      });
      return;
    }
    if (!jobData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir la description du poste.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === "application/pdf");
      setUploadedFiles(pdfFiles);
      toast({
        title: "CV uploadés",
        description: `${pdfFiles.length} CV(s) prêt(s) pour l'analyse.`,
      });
    }
  };

  const handleAnalysis = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Simulation d'analyse avec le nouveau système
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    try {
      const results = uploadedFiles.map((file) => {
        // Utilise le poste sélectionné ou un poste par défaut
        const positionId = jobData.positionId || 'dev-fullstack';
        return simulateDetailedAnalysis(file.name, positionId);
      });
      
      // Trier par score et ajouter le rang
      results.sort((a, b) => b.score - a.score);
      const resultsWithRank = results.map((result, index) => ({
        ...result,
        rank: index + 1,
        experience: `${Math.floor(Math.random() * 8) + 2} ans`,
        education: index % 2 === 0 ? "Master" : "Licence",
        summary: `Candidat avec un profil ${result.score >= 80 ? 'excellent' : result.score >= 65 ? 'très bon' : result.score >= 50 ? 'correct' : 'inadapté'} pour ce poste.`
      }));
      
      setAnalysisResults(resultsWithRank);
      setStep(3);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'analyse des CV.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setStep(1);
    setJobData({ positionId: "", customTitle: "", description: "", requirements: "", keywords: "" });
    setUploadedFiles([]);
    setAnalysisResults([]);
  };

  const selectedJob = getJobPositionById(jobData.positionId);
  const jobTitle = selectedJob?.title || jobData.customTitle || "Poste personnalisé";

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
              {step === 1 && "Description du poste"}
              {step === 2 && "Upload des CV"}
              {step === 3 && "Analyse IA avancée"}
            </div>
          </div>

          {/* Step 1: Job Description */}
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Décrivez votre poste</CardTitle>
                <CardDescription className="text-lg">
                  Choisissez parmi 25+ métiers prédéfinis ou créez un poste personnalisé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="position" className="text-lg font-medium">
                    Type de poste
                  </Label>
                  <div className="mt-2">
                    <JobPositionSelector 
                      value={jobData.positionId} 
                      onValueChange={(value) => setJobData({...jobData, positionId: value})}
                      showCategory={true}
                    />
                  </div>
                </div>

                <div className="text-center text-gray-500">
                  OU
                </div>

                <div>
                  <Label htmlFor="customTitle" className="text-lg font-medium">
                    Titre personnalisé
                  </Label>
                  <Input
                    id="customTitle"
                    value={jobData.customTitle}
                    onChange={(e) => setJobData({...jobData, customTitle: e.target.value})}
                    placeholder="Ex: Développeur Blockchain Senior"
                    className="mt-2 h-12 text-lg"
                    disabled={!!jobData.positionId}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg font-medium">
                    Description du poste *
                  </Label>
                  <Textarea
                    id="description"
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                    placeholder="Décrivez les missions principales, l'équipe, l'environnement de travail..."
                    className="mt-2 min-h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-lg font-medium">
                    Exigences et qualifications
                  </Label>
                  <Textarea
                    id="requirements"
                    value={jobData.requirements}
                    onChange={(e) => setJobData({...jobData, requirements: e.target.value})}
                    placeholder="Formation requise, années d'expérience, compétences obligatoires..."
                    className="mt-2 min-h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords" className="text-lg font-medium">
                    Mots-clés importants supplémentaires
                  </Label>
                  <Input
                    id="keywords"
                    value={jobData.keywords}
                    onChange={(e) => setJobData({...jobData, keywords: e.target.value})}
                    placeholder="Ex: Blockchain, Solidity, Web3 (séparés par des virgules)"
                    className="mt-2 h-12"
                  />
                </div>

                <Button 
                  onClick={handleJobDataSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg py-6"
                >
                  Continuer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: CV Upload */}
          {step === 2 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Uploadez les CV</CardTitle>
                <CardDescription className="text-lg">
                  Sélectionnez tous les CV à analyser (format PDF)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <Label htmlFor="cv-upload" className="cursor-pointer">
                    <span className="text-xl font-medium text-gray-700">
                      Cliquez pour sélectionner les CV
                    </span>
                    <br />
                    <span className="text-gray-500">Plusieurs fichiers PDF acceptés</span>
                  </Label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-lg">CV uploadés ({uploadedFiles.length})</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <Users className="w-6 h-6 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-green-800">{file.name}</p>
                            <p className="text-sm text-green-600">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                    disabled={uploadedFiles.length === 0 || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6"
                  >
                    {isAnalyzing ? (
                      <>
                        <BarChart3 className="w-5 h-5 mr-2 animate-spin" />
                        Analyse IA en cours...
                      </>
                    ) : (
                      `Analyser ${uploadedFiles.length} CV(s)`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results avec nouveau composant */}
          {step === 3 && analysisResults.length > 0 && (
            <div className="space-y-6">
              {/* Header avec actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Classement IA des candidats</h2>
                  <p className="text-gray-600">Pour le poste : <strong>{jobTitle}</strong></p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter PDF
                  </Button>
                  <Button onClick={resetAnalysis} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Nouvelle analyse
                  </Button>
                </div>
              </div>

              {/* Statistiques améliorées */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {analysisResults.length}
                    </div>
                    <div className="text-gray-600">CV analysés</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analysisResults.filter(r => r.score >= 80).length}
                    </div>
                    <div className="text-gray-600">Profils excellents</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {Math.round(analysisResults.reduce((sum, r) => sum + r.score, 0) / analysisResults.length)}%
                    </div>
                    <div className="text-gray-600">Score moyen</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {analysisResults.filter(r => r.warningFlags && r.warningFlags.length > 0).length}
                    </div>
                    <div className="text-gray-600">Alertes détectées</div>
                  </CardContent>
                </Card>
              </div>

              {/* Liste des candidats avec nouveau composant */}
              <div className="space-y-4">
                {analysisResults.map((result, index) => (
                  <CVAnalysisResult 
                    key={index} 
                    result={{...result, rank: index + 1}} 
                    jobTitle={jobTitle}
                  />
                ))}
              </div>

              {/* Limitation */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <p className="text-orange-800 text-center">
                    <strong>Analyses restantes ce mois : 7/10</strong> - 
                    <Link to="/pricing" className="text-orange-600 hover:underline ml-1">
                      Augmentez votre limite avec le plan Pro
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

export default Company;

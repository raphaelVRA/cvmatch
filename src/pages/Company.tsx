
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Target, ArrowLeft, Users, BarChart3, Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Company = () => {
  const [step, setStep] = useState(1);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    requirements: "",
    keywords: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleJobDataSubmit = () => {
    if (!jobData.title || !jobData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au minimum le titre et la description du poste.",
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
    
    // Simulation d'analyse
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Résultats simulés
    const results = uploadedFiles.map((file, index) => ({
      fileName: file.name,
      score: Math.floor(Math.random() * 40) + 60, // Score entre 60-100
      matchedKeywords: ["React", "JavaScript", "Leadership", "Agile"].slice(0, Math.floor(Math.random() * 4) + 1),
      missingKeywords: ["Docker", "AWS", "Python"].slice(0, Math.floor(Math.random() * 3) + 1),
      summary: `Candidat avec ${Math.floor(Math.random() * 8) + 2} ans d'expérience. Profil ${index % 2 === 0 ? 'senior' : 'junior'} avec de bonnes compétences techniques.`,
      experience: `${Math.floor(Math.random() * 8) + 2} ans`,
      education: index % 2 === 0 ? "Master" : "Licence",
      rank: index + 1
    }));
    
    // Trier par score
    results.sort((a, b) => b.score - a.score);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    setAnalysisResults(results);
    setIsAnalyzing(false);
    setStep(3);
  };

  const resetAnalysis = () => {
    setStep(1);
    setJobData({ title: "", description: "", requirements: "", keywords: "" });
    setUploadedFiles([]);
    setAnalysisResults([]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
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
              {step === 1 && "Description du poste"}
              {step === 2 && "Upload des CV"}
              {step === 3 && "Classement des candidats"}
            </div>
          </div>

          {/* Step 1: Job Description */}
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Décrivez votre poste</CardTitle>
                <CardDescription className="text-lg">
                  Plus la description est précise, meilleur sera le matching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">
                    Titre du poste *
                  </Label>
                  <Input
                    id="title"
                    value={jobData.title}
                    onChange={(e) => setJobData({...jobData, title: e.target.value})}
                    placeholder="Ex: Développeur Full Stack Senior"
                    className="mt-2 h-12 text-lg"
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
                    Mots-clés importants
                  </Label>
                  <Input
                    id="keywords"
                    value={jobData.keywords}
                    onChange={(e) => setJobData({...jobData, keywords: e.target.value})}
                    placeholder="Ex: React, Node.js, PostgreSQL, Docker (séparés par des virgules)"
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

                <Separator />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Récapitulatif du poste</h3>
                  <p className="text-blue-700"><strong>Titre :</strong> {jobData.title}</p>
                  {jobData.keywords && (
                    <p className="text-blue-700 mt-1">
                      <strong>Mots-clés :</strong> {jobData.keywords}
                    </p>
                  )}
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
                    disabled={uploadedFiles.length === 0 || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6"
                  >
                    {isAnalyzing ? (
                      <>
                        <BarChart3 className="w-5 h-5 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      `Analyser ${uploadedFiles.length} CV(s)`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results */}
          {step === 3 && analysisResults.length > 0 && (
            <div className="space-y-6">
              {/* Header avec actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Classement des candidats</h2>
                  <p className="text-gray-600">Pour le poste : <strong>{jobData.title}</strong></p>
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

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

              {/* Liste des candidats */}
              <div className="space-y-4">
                {analysisResults.map((result, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                              #{result.rank}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{result.fileName}</h3>
                              <p className="text-gray-600">{result.experience} • {result.education}</p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{result.summary}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-600">Compétences matchées :</span>
                            {result.matchedKeywords.map((keyword: string) => (
                              <Badge key={keyword} className="bg-green-100 text-green-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          
                          {result.missingKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm font-medium text-gray-600">À développer :</span>
                              {result.missingKeywords.map((keyword: string) => (
                                <Badge key={keyword} variant="secondary" className="bg-orange-100 text-orange-800">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center space-y-3 lg:items-end">
                          <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir le CV
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

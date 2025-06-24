
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Target, TrendingUp, Award, Eye, Shield, Building } from "lucide-react";
import { AnalysisResult } from "@/utils/cvAnalysis";

interface CVAnalysisResultProps {
  result: AnalysisResult & { fileName: string };
  jobTitle: string;
}

export const CVAnalysisResult = ({ result, jobTitle }: CVAnalysisResultProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 65) return "text-blue-600 bg-blue-50";
    if (score >= 50) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

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
      case 'high': return "Analyse fiable";
      case 'medium': return "Analyse modérée";
      case 'low': return "Analyse incertaine";
      default: return "Non défini";
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header avec nom et confiance */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{result.fileName}</h3>
                <p className="text-gray-600">Pour le poste : {jobTitle}</p>
              </div>
              <Badge className={`${getConfidenceColor(result.confidenceLevel)} border-0`}>
                <Shield className="w-3 h-3 mr-1" />
                {getConfidenceText(result.confidenceLevel)}
              </Badge>
            </div>

            {/* Alertes d'incohérence */}
            {result.warningFlags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Alertes détectées</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {result.warningFlags.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown détaillé des scores */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  Compétences
                </span>
                <span className="font-medium">{result.breakdown.keywordScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Award className="w-4 h-4 text-green-500 mr-1" />
                  Expérience
                </span>
                <span className="font-medium">{result.breakdown.experienceScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  Formation
                </span>
                <span className="font-medium">{result.breakdown.educationScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mr-1" />
                  Cohérence
                </span>
                <span className="font-medium">{result.breakdown.coherenceScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Building className="w-4 h-4 text-teal-500 mr-1" />
                  Secteur
                </span>
                <span className="font-medium">{result.breakdown.sectorScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 text-orange-500 mr-1" />
                  Certifs
                </span>
                <span className="font-medium">{result.breakdown.certificationScore}%</span>
              </div>
            </div>

            {/* Compétences identifiées */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-sm font-medium text-gray-600">Points forts :</span>
                {result.matchedKeywords.slice(0, 6).map((keyword) => (
                  <Badge key={keyword} className="bg-green-100 text-green-800 text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              {result.missingKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-sm font-medium text-gray-600">À développer :</span>
                  {result.missingKeywords.slice(0, 4).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Recommandations */}
            {result.improvements.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-800 mb-2">Recommandations principales</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {result.improvements.slice(0, 3).map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <Target className="w-3 h-3 text-blue-500 mr-1 mt-1 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Score principal */}
          <div className="flex flex-col items-center space-y-3 lg:items-end lg:min-w-[120px]">
            <div className={`text-4xl font-bold px-4 py-3 rounded-lg text-center ${getScoreColor(result.score)}`}>
              {result.score}%
            </div>
            <Progress value={result.score} className="w-24" />
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              <Eye className="w-4 h-4 mr-1" />
              Détail complet
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

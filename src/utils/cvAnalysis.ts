
import { JobPosition, getJobPositionById } from '@/data/jobPositions';

export interface AnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  experienceMatch: number;
  educationMatch: number;
  breakdown: {
    keywordScore: number;
    experienceScore: number;
    educationScore: number;
    certificationScore: number;
  };
}

export const calculateCVScore = (
  jobPosition: JobPosition,
  cvData: {
    text: string;
    experience?: string;
    education?: string;
    certifications?: string[];
  }
): AnalysisResult => {
  const cvText = cvData.text.toLowerCase();
  
  // Analyse des mots-clés
  const allKeywords = [
    ...jobPosition.keywords.required,
    ...jobPosition.keywords.preferred,
    ...jobPosition.keywords.technical,
    ...jobPosition.keywords.soft
  ];

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  allKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // Score des mots-clés (pondéré selon l'importance)
  let keywordScore = 0;
  const requiredMatched = jobPosition.keywords.required.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const preferredMatched = jobPosition.keywords.preferred.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const technicalMatched = jobPosition.keywords.technical.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const softMatched = jobPosition.keywords.soft.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;

  keywordScore = (
    (requiredMatched / jobPosition.keywords.required.length) * 40 +
    (preferredMatched / jobPosition.keywords.preferred.length) * 30 +
    (technicalMatched / jobPosition.keywords.technical.length) * 20 +
    (softMatched / jobPosition.keywords.soft.length) * 10
  );

  // Score d'expérience
  let experienceScore = 0;
  if (cvData.experience) {
    const expMatch = cvData.experience.match(/(\d+)/);
    const yearsExp = expMatch ? parseInt(expMatch[0]) : 0;
    
    if (yearsExp >= jobPosition.experience.preferred) {
      experienceScore = 100;
    } else if (yearsExp >= jobPosition.experience.min) {
      experienceScore = 60 + ((yearsExp - jobPosition.experience.min) / 
        (jobPosition.experience.preferred - jobPosition.experience.min)) * 40;
    } else {
      experienceScore = Math.min(50, (yearsExp / jobPosition.experience.min) * 50);
    }
  } else {
    experienceScore = 30; // Score par défaut si pas d'info
  }

  // Score d'éducation
  let educationScore = 0;
  if (cvData.education) {
    const educationLower = cvData.education.toLowerCase();
    const hasMatchingEducation = jobPosition.education.some(edu => 
      educationLower.includes(edu.toLowerCase())
    );
    educationScore = hasMatchingEducation ? 100 : 50;
  } else {
    educationScore = 50; // Score par défaut
  }

  // Score de certifications
  let certificationScore = 0;
  if (jobPosition.certifications && cvData.certifications) {
    const matchingCerts = jobPosition.certifications.filter(cert =>
      cvData.certifications!.some(cvCert => 
        cvCert.toLowerCase().includes(cert.toLowerCase())
      )
    );
    certificationScore = jobPosition.certifications.length > 0 ? 
      (matchingCerts.length / jobPosition.certifications.length) * 100 : 0;
  } else {
    certificationScore = jobPosition.certifications ? 0 : 100; // Pas de malus si pas de certifs requises
  }

  // Score final pondéré
  const finalScore = Math.round(
    keywordScore * jobPosition.scoreWeights.keywords +
    experienceScore * jobPosition.scoreWeights.experience +
    educationScore * jobPosition.scoreWeights.education +
    certificationScore * jobPosition.scoreWeights.certifications
  );

  // Génération des points forts et améliorations
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (keywordScore > 70) {
    strengths.push("Excellente maîtrise des compétences techniques requises");
  } else if (keywordScore < 40) {
    improvements.push("Développer les compétences techniques spécifiques au poste");
  }

  if (experienceScore > 80) {
    strengths.push("Expérience très solide dans le domaine");
  } else if (experienceScore < 50) {
    improvements.push("Acquérir plus d'expérience dans le secteur");
  }

  if (educationScore > 80) {
    strengths.push("Formation adaptée au poste");
  } else {
    improvements.push("Envisager une formation complémentaire");
  }

  if (certificationScore > 70) {
    strengths.push("Certifications reconnues dans le domaine");
  } else if (jobPosition.certifications && certificationScore < 30) {
    improvements.push("Obtenir les certifications pertinentes");
  }

  // Ajout de conseils spécifiques selon les mots-clés manquants
  const criticalMissing = jobPosition.keywords.required.filter(k => 
    !cvText.includes(k.toLowerCase())
  );
  if (criticalMissing.length > 0) {
    improvements.push(`Acquérir une expérience en: ${criticalMissing.slice(0, 3).join(', ')}`);
  }

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 8), // Limiter pour l'affichage
    strengths,
    improvements,
    experienceMatch: Math.round(experienceScore),
    educationMatch: Math.round(educationScore),
    breakdown: {
      keywordScore: Math.round(keywordScore),
      experienceScore: Math.round(experienceScore),
      educationScore: Math.round(educationScore),
      certificationScore: Math.round(certificationScore)
    }
  };
};

export const simulateDetailedAnalysis = (
  fileName: string,
  jobPositionId: string
): AnalysisResult & { fileName: string } => {
  const jobPosition = getJobPositionById(jobPositionId);
  if (!jobPosition) {
    throw new Error("Position not found");
  }

  // Simulation de données CV
  const mockCvData = {
    text: generateMockCVText(jobPosition),
    experience: `${Math.floor(Math.random() * 8) + 1} ans`,
    education: jobPosition.education[Math.floor(Math.random() * jobPosition.education.length)],
    certifications: jobPosition.certifications ? 
      [jobPosition.certifications[0]] : undefined
  };

  const result = calculateCVScore(jobPosition, mockCvData);
  
  return {
    ...result,
    fileName
  };
};

const generateMockCVText = (jobPosition: JobPosition): string => {
  // Simulation plus réaliste en incluant aléatoirement des mots-clés
  const includeKeywords = [
    ...jobPosition.keywords.required.filter(() => Math.random() > 0.2),
    ...jobPosition.keywords.preferred.filter(() => Math.random() > 0.4),
    ...jobPosition.keywords.technical.filter(() => Math.random() > 0.5),
    ...jobPosition.keywords.soft.filter(() => Math.random() > 0.6)
  ];

  return includeKeywords.join(" ").toLowerCase();
};

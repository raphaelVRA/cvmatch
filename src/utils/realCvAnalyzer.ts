
import { JobPosition, getJobPositionById } from '@/data/jobPositions';
import { ExtractedCVData } from './pdfExtractor';

export interface RealAnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  experienceMatch: number;
  educationMatch: number;
  profileCoherence: number;
  sectorRelevance: number;
  breakdown: {
    keywordScore: number;
    experienceScore: number;
    educationScore: number;
    certificationScore: number;
    coherenceScore: number;
    sectorScore: number;
  };
  warningFlags: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  extractedInfo: ExtractedCVData['extractedInfo'];
}

export const analyzeRealCV = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): RealAnalysisResult => {
  console.log(`[Real CV Analyzer] Starting real analysis for ${jobPosition.title}`);
  console.log(`[Real CV Analyzer] CV text length: ${cvData.text.length} characters`);
  console.log(`[Real CV Analyzer] Extracted skills:`, cvData.extractedInfo.skills);
  
  // Analyse des mots-clés basée sur les vraies données
  const keywordAnalysis = analyzeRealKeywords(cvData, jobPosition);
  
  // Analyse de l'expérience réelle
  const experienceScore = analyzeRealExperience(cvData, jobPosition);
  
  // Analyse de l'éducation réelle
  const educationScore = analyzeRealEducation(cvData, jobPosition);
  
  // Analyse des certifications réelles
  const certificationScore = analyzeRealCertifications(cvData, jobPosition);
  
  // Analyse de cohérence et secteur
  const coherenceScore = analyzeRealCoherence(cvData, jobPosition);
  const sectorScore = analyzeRealSector(cvData, jobPosition);
  
  // Calcul du score final pondéré
  const finalScore = calculateWeightedScore({
    keywordScore: keywordAnalysis.score,
    experienceScore,
    educationScore,
    certificationScore,
    coherenceScore,
    sectorScore
  }, jobPosition);
  
  // Génération des alertes
  const warningFlags = generateRealWarnings(
    keywordAnalysis.score,
    experienceScore,
    educationScore,
    coherenceScore,
    cvData
  );
  
  // Niveau de confiance
  const confidenceLevel = calculateRealConfidence(
    keywordAnalysis.score,
    experienceScore,
    educationScore,
    warningFlags.length,
    cvData.text.length
  );
  
  // Génération du feedback
  const { strengths, improvements } = generateRealFeedback(
    keywordAnalysis,
    experienceScore,
    educationScore,
    cvData,
    jobPosition
  );
  
  console.log(`[Real CV Analyzer] Final score: ${Math.round(finalScore)}%`);
  
  return {
    score: Math.round(finalScore),
    matchedKeywords: keywordAnalysis.matched,
    missingKeywords: keywordAnalysis.missing,
    strengths,
    improvements,
    experienceMatch: Math.round(experienceScore),
    educationMatch: Math.round(educationScore),
    profileCoherence: Math.round(coherenceScore),
    sectorRelevance: Math.round(sectorScore),
    breakdown: {
      keywordScore: Math.round(keywordAnalysis.score),
      experienceScore: Math.round(experienceScore),
      educationScore: Math.round(educationScore),
      certificationScore: Math.round(certificationScore),
      coherenceScore: Math.round(coherenceScore),
      sectorScore: Math.round(sectorScore)
    },
    warningFlags,
    confidenceLevel,
    extractedInfo: cvData.extractedInfo
  };
};

const analyzeRealKeywords = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): { score: number; matched: string[]; missing: string[] } => {
  const cvText = cvData.text.toLowerCase();
  const extractedSkills = cvData.extractedInfo.skills.map(s => s.toLowerCase());
  
  const allJobKeywords = [
    ...jobPosition.keywords.required,
    ...jobPosition.keywords.preferred,
    ...jobPosition.keywords.technical,
    ...jobPosition.keywords.soft
  ];
  
  const matched: string[] = [];
  const missing: string[] = [];
  
  console.log(`[Keyword Analysis] Analyzing ${allJobKeywords.length} job keywords`);
  console.log(`[Keyword Analysis] CV has ${extractedSkills.length} extracted skills`);
  
  allJobKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Vérification directe dans le texte ou dans les compétences extraites
    const foundInText = cvText.includes(keywordLower);
    const foundInSkills = extractedSkills.some(skill => 
      skill.includes(keywordLower) || keywordLower.includes(skill)
    );
    
    // Vérification avec synonymes et variations
    const foundWithVariations = checkKeywordVariations(keywordLower, cvText, extractedSkills);
    
    if (foundInText || foundInSkills || foundWithVariations) {
      matched.push(keyword);
      console.log(`[Keyword Analysis] ✓ Found: ${keyword}`);
    } else {
      missing.push(keyword);
      console.log(`[Keyword Analysis] ✗ Missing: ${keyword}`);
    }
  });
  
  // Calcul du score avec pondération
  let score = 0;
  if (allJobKeywords.length > 0) {
    const baseScore = (matched.length / allJobKeywords.length) * 100;
    
    // Bonus pour compétences requises
    const requiredMatches = jobPosition.keywords.required.filter(k => 
      matched.includes(k)
    ).length;
    const requiredBonus = requiredMatches / Math.max(1, jobPosition.keywords.required.length) * 20;
    
    // Bonus pour compétences techniques
    const technicalMatches = jobPosition.keywords.technical.filter(k => 
      matched.includes(k)
    ).length;
    const technicalBonus = technicalMatches / Math.max(1, jobPosition.keywords.technical.length) * 15;
    
    score = Math.min(100, baseScore + requiredBonus + technicalBonus);
  }
  
  console.log(`[Keyword Analysis] Score: ${score}% (${matched.length}/${allJobKeywords.length})`);
  
  return {
    score,
    matched: matched.slice(0, 15),
    missing: missing.slice(0, 10)
  };
};

const checkKeywordVariations = (
  keyword: string,
  cvText: string,
  extractedSkills: string[]
): boolean => {
  // Dictionnaire de synonymes étendu
  const synonyms: Record<string, string[]> = {
    'javascript': ['js', 'node.js', 'nodejs', 'ecmascript'],
    'python': ['py', 'python3'],
    'react': ['reactjs', 'react.js'],
    'angular': ['angularjs', 'angular.js'],
    'développement': ['dev', 'développeur', 'programmer', 'coder'],
    'base de données': ['bdd', 'database', 'db'],
    'intelligence artificielle': ['ia', 'ai', 'machine learning', 'ml'],
    'gestion de projet': ['chef de projet', 'project manager', 'scrum master'],
    'communication': ['relationnel', 'présentation'],
    'leadership': ['management', 'encadrement', 'direction'],
    'analyse': ['analytique', 'business analyst'],
    'conception': ['design', 'architecture', 'modélisation']
  };
  
  const variations = synonyms[keyword] || [];
  
  return variations.some(variation => 
    cvText.includes(variation) || 
    extractedSkills.some(skill => skill.includes(variation))
  );
};

const analyzeRealExperience = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): number => {
  console.log(`[Experience Analysis] Analyzing real experience`);
  console.log(`[Experience Analysis] Found ${cvData.extractedInfo.experience.length} experience entries`);
  
  const cvText = cvData.text.toLowerCase();
  let experienceYears = 0;
  
  // Extraction des années d'expérience depuis le texte
  const experiencePatterns = [
    /(\d+)\s*ans?\s*d[''']expérience/gi,
    /(\d+)\s*années?\s*d[''']expérience/gi,
    /expérience\s*:\s*(\d+)\s*ans?/gi,
    /(\d+)\s*years?\s*experience/gi,
    /(\d+)\s*ans?\s*en\s*tant\s*que/gi
  ];
  
  for (const pattern of experiencePatterns) {
    const matches = cvText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const numberMatch = match.match(/\d+/);
        if (numberMatch) {
          experienceYears = Math.max(experienceYears, parseInt(numberMatch[0]));
        }
      });
    }
  }
  
  // Si pas trouvé directement, estimer à partir des dates d'expérience
  if (experienceYears === 0 && cvData.extractedInfo.experience.length > 0) {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    cvData.extractedInfo.experience.forEach(exp => {
      const yearMatches = exp.match(/\b(20\d{2}|19\d{2})\b/g);
      if (yearMatches) {
        years.push(...yearMatches.map(y => parseInt(y)));
      }
    });
    
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      experienceYears = Math.max(0, currentYear - minYear);
    }
  }
  
  console.log(`[Experience Analysis] Estimated experience: ${experienceYears} years`);
  console.log(`[Experience Analysis] Job requires: ${jobPosition.experience.min}-${jobPosition.experience.preferred} years`);
  
  // Calcul du score basé sur l'expérience
  let score = 30; // Score de base
  
  if (experienceYears >= jobPosition.experience.preferred) {
    score = 85 + Math.min(15, (experienceYears - jobPosition.experience.preferred) * 2);
  } else if (experienceYears >= jobPosition.experience.min) {
    const ratio = (experienceYears - jobPosition.experience.min) / 
      Math.max(1, jobPosition.experience.preferred - jobPosition.experience.min);
    score = 60 + (ratio * 25);
  } else if (experienceYears > 0) {
    score = Math.max(25, (experienceYears / Math.max(1, jobPosition.experience.min)) * 50);
  }
  
  // Bonus pour expérience pertinente
  const relevantKeywords = [
    jobPosition.category,
    ...jobPosition.keywords.required.slice(0, 3)
  ];
  
  const relevantBonus = relevantKeywords.filter(keyword => 
    cvData.extractedInfo.experience.some(exp => 
      exp.toLowerCase().includes(keyword.toLowerCase())
    )
  ).length * 5;
  
  score = Math.min(100, score + relevantBonus);
  
  console.log(`[Experience Analysis] Final score: ${score}%`);
  return score;
};

const analyzeRealEducation = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): number => {
  console.log(`[Education Analysis] Analyzing real education`);
  console.log(`[Education Analysis] Found ${cvData.extractedInfo.education.length} education entries`);
  
  const educationText = cvData.extractedInfo.education.join(' ').toLowerCase() + ' ' + cvData.text.toLowerCase();
  
  // Vérification des formations requises exactes
  const exactMatches = jobPosition.education.filter(edu => 
    educationText.includes(edu.toLowerCase())
  );
  
  if (exactMatches.length > 0) {
    console.log(`[Education Analysis] Found exact match: ${exactMatches[0]}`);
    return 90;
  }
  
  // Analyse du niveau d'éducation
  const educationLevels = {
    'doctorat': 100, 'phd': 100, 'doctorate': 100,
    'master': 85, 'm2': 85, 'mba': 85, 'ingénieur': 85,
    'licence': 70, 'bachelor': 70, 'l3': 70,
    'bts': 60, 'dut': 60, 'but': 60,
    'bac': 45, 'baccalauréat': 45
  };
  
  let levelScore = 40;
  Object.entries(educationLevels).forEach(([level, score]) => {
    if (educationText.includes(level)) {
      levelScore = Math.max(levelScore, score);
      console.log(`[Education Analysis] Found education level: ${level} (score: ${score})`);
    }
  });
  
  // Analyse de la pertinence du domaine
  const domainScore = analyzeEducationDomain(educationText, jobPosition.category);
  
  const finalScore = (levelScore * 0.7) + (domainScore * 0.3);
  
  console.log(`[Education Analysis] Level: ${levelScore}, Domain: ${domainScore}, Final: ${finalScore}`);
  return Math.round(finalScore);
};

const analyzeEducationDomain = (education: string, jobCategory: string): number => {
  const domainKeywords = {
    'tech': ['informatique', 'computer science', 'ingénieur logiciel', 'développement', 'numérique'],
    'healthcare': ['médecine', 'santé', 'infirmier', 'médical', 'pharmacie'],
    'engineering': ['ingénieur', 'mécanique', 'électrique', 'industriel', 'génie'],
    'finance': ['finance', 'comptabilité', 'gestion', 'économie', 'banque'],
    'marketing': ['marketing', 'communication', 'commerce', 'publicité'],
    'design': ['design', 'art', 'créatif', 'graphisme', 'architecture'],
    'sales': ['commerce', 'vente', 'business', 'négociation'],
    'hr': ['ressources humaines', 'psychologie', 'gestion', 'droit social'],
    'management': ['gestion', 'management', 'business', 'administration']
  };
  
  const relevantKeywords = domainKeywords[jobCategory as keyof typeof domainKeywords] || [];
  const matches = relevantKeywords.filter(keyword => education.includes(keyword));
  
  if (matches.length === 0) return 40;
  
  return Math.min(100, (matches.length / relevantKeywords.length) * 80 + 20);
};

const analyzeRealCertifications = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): number => {
  if (!jobPosition.certifications || jobPosition.certifications.length === 0) {
    return 60; // Score neutre si aucune certification requise
  }
  
  const cvCertifications = cvData.extractedInfo.certifications.map(c => c.toLowerCase());
  const requiredCertifications = jobPosition.certifications.map(c => c.toLowerCase());
  
  const matches = requiredCertifications.filter(cert =>
    cvCertifications.some(cvCert => 
      cvCert.includes(cert) || cert.includes(cvCert)
    )
  );
  
  if (matches.length === 0) return 30;
  
  return Math.min(100, (matches.length / requiredCertifications.length) * 70 + 30);
};

const analyzeRealCoherence = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): number => {
  // Analyse de cohérence basée sur la correspondance entre compétences, expérience et poste
  const skillsRelevance = cvData.extractedInfo.skills.filter(skill => 
    jobPosition.keywords.required.some(req => 
      skill.toLowerCase().includes(req.toLowerCase()) ||
      req.toLowerCase().includes(skill.toLowerCase())
    )
  ).length;
  
  const experienceRelevance = cvData.extractedInfo.experience.filter(exp =>
    jobPosition.keywords.required.some(req =>
      exp.toLowerCase().includes(req.toLowerCase())
    )
  ).length;
  
  const skillsScore = skillsRelevance / Math.max(1, cvData.extractedInfo.skills.length) * 100;
  const expScore = experienceRelevance / Math.max(1, cvData.extractedInfo.experience.length) * 100;
  
  return Math.round((skillsScore + expScore) / 2);
};

const analyzeRealSector = (
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): number => {
  const sectorKeywords = {
    'tech': ['startup', 'scale-up', 'éditeur logiciel', 'tech', 'digital', 'saas'],
    'healthcare': ['hôpital', 'clinique', 'chu', 'ehpad', 'centre de soins'],
    'engineering': ['industrie', 'manufacture', 'bureau d\'études', 'production'],
    'finance': ['banque', 'assurance', 'cabinet comptable', 'audit'],
    'marketing': ['agence', 'communication', 'média', 'publicité'],
    'design': ['studio', 'agence créative', 'design'],
    'sales': ['commercial', 'distribution', 'retail'],
    'hr': ['cabinet rh', 'recrutement', 'conseil rh'],
    'management': ['conseil', 'stratégie', 'transformation']
  };
  
  const jobSectorKeywords = sectorKeywords[jobPosition.category as keyof typeof sectorKeywords] || [];
  const cvText = cvData.text.toLowerCase();
  
  const matches = jobSectorKeywords.filter(keyword => 
    cvText.includes(keyword.toLowerCase())
  ).length;
  
  return Math.min(100, (matches / Math.max(1, jobSectorKeywords.length)) * 80 + 20);
};

const calculateWeightedScore = (
  scores: {
    keywordScore: number;
    experienceScore: number;
    educationScore: number;
    certificationScore: number;
    coherenceScore: number;
    sectorScore: number;
  },
  jobPosition: JobPosition
): number => {
  const weightedScore = (
    scores.keywordScore * jobPosition.scoreWeights.keywords +
    scores.experienceScore * jobPosition.scoreWeights.experience +
    scores.educationScore * jobPosition.scoreWeights.education +
    scores.certificationScore * jobPosition.scoreWeights.certifications
  );
  
  // Ajustements contextuels
  let finalScore = weightedScore;
  
  if (scores.coherenceScore > 80) finalScore += 5;
  else if (scores.coherenceScore < 30) finalScore -= 15;
  
  if (scores.sectorScore > 70) finalScore += 3;
  else if (scores.sectorScore < 25) finalScore -= 10;
  
  return Math.max(5, Math.min(100, finalScore));
};

const generateRealWarnings = (
  keywordScore: number,
  experienceScore: number,
  educationScore: number,
  coherenceScore: number,
  cvData: ExtractedCVData
): string[] => {
  const warnings: string[] = [];
  
  if (coherenceScore < 25) warnings.push("Profil inadapté au domaine du poste");
  if (keywordScore < 30) warnings.push("Compétences techniques insuffisantes pour le poste");
  if (experienceScore < 35) warnings.push("Expérience professionnelle insuffisante");
  if (educationScore < 40) warnings.push("Formation non alignée avec les exigences");
  if (cvData.extractedInfo.skills.length < 3) warnings.push("Peu de compétences techniques identifiées");
  if (cvData.text.length < 500) warnings.push("CV très court, informations insuffisantes");
  
  return warnings;
};

const calculateRealConfidence = (
  keywordScore: number,
  experienceScore: number,
  educationScore: number,
  warningCount: number,
  textLength: number
): 'high' | 'medium' | 'low' => {
  const avgScore = (keywordScore + experienceScore + educationScore) / 3;
  
  if (warningCount >= 3 || avgScore < 35 || textLength < 300) return 'low';
  if (warningCount >= 1 || avgScore < 65 || textLength < 800) return 'medium';
  return 'high';
};

const generateRealFeedback = (
  keywordAnalysis: { score: number; matched: string[]; missing: string[] },
  experienceScore: number,
  educationScore: number,
  cvData: ExtractedCVData,
  jobPosition: JobPosition
): { strengths: string[]; improvements: string[] } => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  // Forces basées sur les vraies données
  if (keywordAnalysis.score > 70) {
    strengths.push(`Excellente maîtrise des compétences requises (${keywordAnalysis.matched.length} compétences identifiées)`);
  }
  if (experienceScore > 75) {
    strengths.push("Expérience professionnelle très adaptée au poste");
  }
  if (educationScore > 80) {
    strengths.push("Formation parfaitement alignée avec les exigences");
  }
  if (cvData.extractedInfo.skills.length > 15) {
    strengths.push("Profil technique très riche avec de nombreuses compétences");
  }
  if (cvData.extractedInfo.languages.length > 2) {
    strengths.push(`Profil multilingue (${cvData.extractedInfo.languages.length} langues détectées)`);
  }
  if (cvData.extractedInfo.certifications.length > 0) {
    strengths.push(`Certifications professionnelles valorisantes (${cvData.extractedInfo.certifications.length})`);
  }
  
  // Améliorations basées sur les manques réels
  if (keywordAnalysis.score < 50) {
    improvements.push(`Développer les compétences clés manquantes : ${keywordAnalysis.missing.slice(0, 3).join(', ')}`);
  }
  if (experienceScore < 50) {
    improvements.push("Acquérir plus d'expérience dans le domaine ciblé");
  }
  if (educationScore < 60) {
    improvements.push("Envisager une formation complémentaire spécialisée");
  }
  if (cvData.extractedInfo.skills.length < 8) {
    improvements.push("Enrichir le profil avec plus de compétences techniques");
  }
  if (keywordAnalysis.missing.length > 8) {
    improvements.push("Se former sur les technologies et méthodes spécifiques au poste");
  }
  
  return { strengths, improvements };
};


import { JobPosition, getJobPositionById } from '@/data/jobPositions';

export interface AnalysisResult {
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
}

// Domaines de compétences avec scoring intelligent
const SKILL_DOMAINS = {
  'tech': {
    keywords: ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'api', 'database', 'sql', 'mongodb', 'postgresql', 'html', 'css', 'typescript', 'ci/cd', 'devops', 'microservices', 'machine learning', 'ai', 'tensorflow', 'pytorch', 'développement', 'programmation', 'logiciel', 'système', 'informatique', 'algorithme', 'frontend', 'backend', 'fullstack', 'web', 'mobile', 'application'],
    coreKeywords: ['programmation', 'développement', 'informatique', 'logiciel', 'code'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical', 'manual-labor'],
    weakIncompatible: ['finance-traditional']
  },
  'healthcare': {
    keywords: ['soins', 'patient', 'médical', 'infirmier', 'hôpital', 'clinique', 'urgences', 'chirurgie', 'pharmacologie', 'hygiène', 'protocole', 'stérilisation', 'injection', 'perfusion', 'surveillance', 'réanimation', 'bloc opératoire', 'gériatrie', 'pédiatrie', 'santé', 'médecine', 'thérapie', 'diagnostic', 'traitement', 'pathologie', 'anatomie', 'physiologie'],
    coreKeywords: ['soins', 'patient', 'médical', 'santé', 'infirmier'],
    weight: 1.0,
    strongIncompatible: ['tech', 'engineering-mechanical'],
    weakIncompatible: ['marketing', 'sales']
  },
  'engineering': {
    keywords: ['ingénieur', 'ingénierie', 'mécanique', 'électrique', 'civil', 'industriel', 'génie', 'conception', 'calcul', 'simulation', 'cad', 'autocad', 'solidworks', 'matlab', 'prototypage', 'essais', 'qualité', 'process', 'production', 'maintenance', 'technique', 'r&d', 'recherche'],
    coreKeywords: ['ingénieur', 'ingénierie', 'technique', 'conception'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical'],
    weakIncompatible: ['marketing', 'hr']
  },
  'finance': {
    keywords: ['comptabilité', 'bilan', 'budget', 'fiscalité', 'audit', 'tva', 'excel', 'sap', 'sage', 'consolidation', 'reporting', 'analyse financière', 'dcf', 'risk management', 'bloomberg', 'trading', 'investment', 'banque', 'assurance', 'crédit', 'finance'],
    coreKeywords: ['comptabilité', 'finance', 'budget', 'fiscal'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical'],
    weakIncompatible: ['tech-pure']
  },
  'marketing': {
    keywords: ['seo', 'sem', 'google ads', 'facebook ads', 'analytics', 'réseaux sociaux', 'content marketing', 'brand', 'storytelling', 'crm', 'email marketing', 'growth hacking', 'conversion', 'communication', 'publicité', 'campagne', 'digital', 'marketing'],
    coreKeywords: ['marketing', 'communication', 'publicité', 'digital'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical', 'engineering-mechanical'],
    weakIncompatible: []
  },
  'design': {
    keywords: ['photoshop', 'illustrator', 'figma', 'sketch', 'ux', 'ui', 'wireframe', 'prototype', 'design thinking', 'user research', 'typography', 'branding', 'identity', 'créatif', 'graphisme', 'design'],
    coreKeywords: ['design', 'ux', 'ui', 'créatif'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical', 'finance-traditional'],
    weakIncompatible: []
  },
  'sales': {
    keywords: ['vente', 'prospection', 'négociation', 'crm', 'salesforce', 'lead generation', 'closing', 'account management', 'business development', 'partnership', 'commercial', 'client'],
    coreKeywords: ['vente', 'commercial', 'négociation', 'client'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical'],
    weakIncompatible: []
  },
  'hr': {
    keywords: ['recrutement', 'sourcing', 'entretien', 'rh', 'paie', 'formation', 'talent', 'sirh', 'droit du travail', 'relations sociales', 'assessment', 'ressources humaines'],
    coreKeywords: ['recrutement', 'rh', 'ressources humaines'],
    weight: 1.0,
    strongIncompatible: ['healthcare-clinical'],
    weakIncompatible: ['tech-pure']
  },
  'management': {
    keywords: ['leadership', 'équipe', 'projet', 'scrum', 'agile', 'planning', 'budget', 'stratégie', 'management', 'coaching', 'pmp', 'gantt', 'gestion', 'direction', 'manager', 'chef'],
    coreKeywords: ['management', 'leadership', 'équipe', 'gestion'],
    weight: 0.8,
    strongIncompatible: [],
    weakIncompatible: []
  }
};

// Mapping amélioré des catégories de postes
const JOB_CATEGORY_DOMAINS = {
  'tech': ['tech', 'management'],
  'healthcare': ['healthcare'],
  'engineering': ['engineering', 'management'],
  'finance': ['finance', 'management'],
  'marketing': ['marketing', 'design'],
  'design': ['design', 'marketing'],
  'sales': ['sales', 'management'],
  'hr': ['hr', 'management'],
  'management': ['management'],
  'operations': ['management', 'engineering'],
  'consulting': ['management'],
  'legal': ['management'],
  'education': ['management']
};

// Analyse intelligente des mots-clés avec pondération
const analyzeKeywords = (cvText: string, jobPosition: JobPosition): {
  score: number;
  matched: string[];
  missing: string[];
} => {
  const allKeywords = [
    ...jobPosition.keywords.required,
    ...jobPosition.keywords.preferred,
    ...jobPosition.keywords.technical,
    ...jobPosition.keywords.soft
  ];

  const matched: string[] = [];
  const missing: string[] = [];

  // Analyse avec variations et synonymes
  allKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const variations = getKeywordVariations(keywordLower);
    
    const isFound = variations.some(variation => 
      cvText.includes(variation) || 
      cvText.includes(variation.replace(/\s+/g, '')) ||
      fuzzyMatch(cvText, variation)
    );
    
    if (isFound) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  // Scoring pondéré par importance
  const requiredMatched = jobPosition.keywords.required.filter(k => 
    matched.includes(k)
  ).length;
  const requiredTotal = jobPosition.keywords.required.length;
  
  const preferredMatched = jobPosition.keywords.preferred.filter(k => 
    matched.includes(k)
  ).length;
  const preferredTotal = jobPosition.keywords.preferred.length;
  
  const technicalMatched = jobPosition.keywords.technical.filter(k => 
    matched.includes(k)
  ).length;
  const technicalTotal = jobPosition.keywords.technical.length;
  
  const softMatched = jobPosition.keywords.soft.filter(k => 
    matched.includes(k)
  ).length;
  const softTotal = jobPosition.keywords.soft.length;

  // Calcul du score avec bonus/malus
  let score = 0;
  
  if (requiredTotal > 0) {
    const requiredRatio = requiredMatched / requiredTotal;
    score += requiredRatio * 50; // 50% du score pour les compétences requises
    
    // Bonus si plus de 80% des compétences requises
    if (requiredRatio >= 0.8) score += 10;
    // Malus si moins de 30% des compétences requises
    if (requiredRatio < 0.3) score -= 15;
  }
  
  if (preferredTotal > 0) {
    score += (preferredMatched / preferredTotal) * 25; // 25% du score
  }
  
  if (technicalTotal > 0) {
    score += (technicalMatched / technicalTotal) * 20; // 20% du score
  }
  
  if (softTotal > 0) {
    score += (softMatched / softTotal) * 5; // 5% du score
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    matched,
    missing: missing.slice(0, 8)
  };
};

// Génère des variations d'un mot-clé
const getKeywordVariations = (keyword: string): string[] => {
  const variations = [keyword];
  
  // Variations courantes
  const synonyms: Record<string, string[]> = {
    'javascript': ['js', 'javascript', 'node', 'nodejs'],
    'react': ['reactjs', 'react.js'],
    'python': ['py', 'python3'],
    'développement': ['dev', 'developpement', 'développeur', 'developer'],
    'gestion': ['management', 'pilotage'],
    'équipe': ['team', 'groupe'],
    'projet': ['project', 'projets'],
    'base de données': ['bdd', 'database', 'db'],
    'intelligence artificielle': ['ia', 'ai', 'machine learning'],
    'expérience': ['exp', 'experience', 'années'],
  };

  if (synonyms[keyword]) {
    variations.push(...synonyms[keyword]);
  }

  return variations;
};

// Matching flou pour détecter des mots similaires
const fuzzyMatch = (text: string, keyword: string): boolean => {
  if (keyword.length < 4) return false;
  
  const words = text.split(/\s+/);
  return words.some(word => {
    if (word.length < 4) return false;
    
    // Calcul de distance de Levenshtein simplifiée
    const maxDistance = Math.floor(Math.max(word.length, keyword.length) * 0.2);
    return levenshteinDistance(word.toLowerCase(), keyword.toLowerCase()) <= maxDistance;
  });
};

// Distance de Levenshtein simplifiée
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Analyse de cohérence du profil améliorée
const analyzeProfileCoherence = (cvText: string, jobPosition: JobPosition): number => {
  const jobDomains = JOB_CATEGORY_DOMAINS[jobPosition.category as keyof typeof JOB_CATEGORY_DOMAINS] || [];
  const primaryDomain = jobDomains[0];
  
  if (!primaryDomain || !SKILL_DOMAINS[primaryDomain as keyof typeof SKILL_DOMAINS]) {
    return 50; // Score neutre si pas de domaine défini
  }
  
  const domainInfo = SKILL_DOMAINS[primaryDomain as keyof typeof SKILL_DOMAINS];
  
  // Analyse des compétences du domaine principal
  let relevantSkillsFound = 0;
  let coreSkillsFound = 0;
  
  domainInfo.keywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      relevantSkillsFound++;
    }
  });
  
  domainInfo.coreKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      coreSkillsFound++;
    }
  });
  
  // Score de base basé sur la présence de compétences pertinentes
  let coherenceScore = (relevantSkillsFound / domainInfo.keywords.length) * 100;
  
  // Bonus important pour les compétences clés
  const coreBonus = (coreSkillsFound / domainInfo.coreKeywords.length) * 30;
  coherenceScore += coreBonus;
  
  // Analyse des incompatibilités fortes
  let strongIncompatibilityPenalty = 0;
  domainInfo.strongIncompatible.forEach(incompatibleDomain => {
    const incompatibleInfo = SKILL_DOMAINS[incompatibleDomain as keyof typeof SKILL_DOMAINS];
    if (incompatibleInfo) {
      const incompatibleSkills = incompatibleInfo.keywords.filter(keyword => 
        cvText.includes(keyword.toLowerCase())
      ).length;
      
      if (incompatibleSkills > 3) {
        strongIncompatibilityPenalty += incompatibleSkills * 5;
      }
    }
  });
  
  // Analyse des incompatibilités faibles
  let weakIncompatibilityPenalty = 0;
  domainInfo.weakIncompatible.forEach(incompatibleDomain => {
    const incompatibleInfo = SKILL_DOMAINS[incompatibleDomain as keyof typeof SKILL_DOMAINS];
    if (incompatibleInfo) {
      const incompatibleSkills = incompatibleInfo.keywords.filter(keyword => 
        cvText.includes(keyword.toLowerCase())
      ).length;
      
      if (incompatibleSkills > 5) {
        weakIncompatibilityPenalty += incompatibleSkills * 2;
      }
    }
  });
  
  coherenceScore -= (strongIncompatibilityPenalty + weakIncompatibilityPenalty);
  
  return Math.max(0, Math.min(100, coherenceScore));
};

// Analyse de pertinence sectorielle améliorée
const analyzeSectorRelevance = (cvText: string, jobPosition: JobPosition): number => {
  const sectorKeywords = {
    'tech': ['startup', 'scale-up', 'éditeur logiciel', 'ess', 'tech', 'digital', 'numérique', 'informatique', 'web', 'application', 'plateforme', 'api', 'saas'],
    'healthcare': ['hôpital', 'clinique', 'cabinet médical', 'chu', 'ehpad', 'centre de soins', 'maison de santé', 'laboratoire médical', 'pharmacie'],
    'engineering': ['bureau d\'études', 'industrie', 'usine', 'manufacture', 'r&d', 'laboratoire', 'centre technique', 'ingénierie'],
    'finance': ['banque', 'assurance', 'audit', 'cabinet comptable', 'finance', 'investment', 'bourse', 'asset management'],
    'marketing': ['agence', 'communication', 'publicité', 'média', 'marketing', 'événementiel', 'relations publiques'],
    'design': ['studio', 'agence créative', 'design', 'architecture', 'création', 'graphisme'],
    'sales': ['commercial', 'vente', 'distribution', 'retail', 'business development'],
    'hr': ['rh', 'ressources humaines', 'recrutement', 'conseil rh', 'formation'],
    'management': ['direction', 'management', 'conseil', 'stratégie', 'transformation']
  };
  
  const experienceKeywords = {
    'tech': ['développeur', 'ingénieur logiciel', 'devops', 'data scientist', 'product manager', 'cto', 'tech lead'],
    'healthcare': ['infirmier', 'médecin', 'aide-soignant', 'pharmacien', 'kinésithérapeute', 'sage-femme'],
    'engineering': ['ingénieur', 'technicien', 'chef de projet', 'responsable qualité', 'r&d'],
    'finance': ['comptable', 'auditeur', 'analyste financier', 'contrôleur de gestion', 'trader'],
    'marketing': ['chef de produit', 'community manager', 'traffic manager', 'brand manager'],
    'design': ['designer', 'ux designer', 'directeur artistique', 'graphiste', 'architecte'],
    'sales': ['commercial', 'account manager', 'business developer', 'key account'],
    'hr': ['recruteur', 'rh', 'chargé de formation', 'responsable paie'],
    'management': ['manager', 'directeur', 'chef d\'équipe', 'responsable', 'consultant']
  };
  
  const jobSectorKeywords = sectorKeywords[jobPosition.category as keyof typeof sectorKeywords] || [];
  const jobExperienceKeywords = experienceKeywords[jobPosition.category as keyof typeof experienceKeywords] || [];
  
  let sectorMatches = 0;
  let experienceMatches = 0;
  let contextualMatches = 0;
  
  // Analyse des secteurs d'activité
  jobSectorKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      sectorMatches++;
      
      // Bonus si le secteur est mentionné avec de l'expérience
      if (cvText.includes(`expérience ${keyword}`) || 
          cvText.includes(`${keyword} depuis`) || 
          cvText.includes(`ans ${keyword}`)) {
        contextualMatches++;
      }
    }
  });
  
  // Analyse des expériences métier
  jobExperienceKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      experienceMatches++;
    }
  });
  
  // Calcul du score
  const sectorScore = (sectorMatches / Math.max(1, jobSectorKeywords.length)) * 40;
  const experienceScore = (experienceMatches / Math.max(1, jobExperienceKeywords.length)) * 50;
  const contextualBonus = contextualMatches * 5;
  
  const totalScore = sectorScore + experienceScore + contextualBonus;
  
  return Math.min(100, totalScore);
};

// Analyse d'expérience améliorée
const analyzeExperience = (cvData: { text: string; experience?: string }, jobPosition: JobPosition): number => {
  let experienceScore = 50; // Score de base
  
  if (cvData.experience) {
    const expMatch = cvData.experience.match(/(\d+)/);
    const yearsExp = expMatch ? parseInt(expMatch[0]) : 0;
    
    if (yearsExp >= jobPosition.experience.preferred) {
      experienceScore = 90 + Math.min(10, (yearsExp - jobPosition.experience.preferred) * 2);
    } else if (yearsExp >= jobPosition.experience.min) {
      const ratio = (yearsExp - jobPosition.experience.min) / 
        Math.max(1, jobPosition.experience.preferred - jobPosition.experience.min);
      experienceScore = 70 + (ratio * 20);
    } else if (yearsExp > 0) {
      experienceScore = Math.max(30, (yearsExp / jobPosition.experience.min) * 60);
    } else {
      experienceScore = 25;
    }
  }
  
  // Bonus pour expérience pertinente mentionnée dans le texte
  const experienceKeywords = [
    `${jobPosition.experience.min} ans`,
    `${jobPosition.experience.preferred} ans`,
    'expérience',
    'années',
    'senior',
    'junior'
  ];
  
  const experienceBonus = experienceKeywords.filter(keyword => 
    cvData.text.includes(keyword.toLowerCase())
  ).length * 3;
  
  return Math.min(100, experienceScore + experienceBonus);
};

// Analyse d'éducation améliorée
const analyzeEducation = (cvData: { education?: string }, jobPosition: JobPosition): number => {
  if (!cvData.education) return 40; // Score de base sans information
  
  const educationLower = cvData.education.toLowerCase();
  
  // Vérification exacte des formations requises
  const exactMatch = jobPosition.education.some(edu => 
    educationLower.includes(edu.toLowerCase())
  );
  
  if (exactMatch) {
    return 95;
  }
  
  // Analyse du niveau d'éducation
  let levelScore = 0;
  if (educationLower.includes('doctorat') || educationLower.includes('phd')) {
    levelScore = 95;
  } else if (educationLower.includes('master') || educationLower.includes('m2') || educationLower.includes('ingénieur')) {
    levelScore = 85;
  } else if (educationLower.includes('licence') || educationLower.includes('bachelor')) {
    levelScore = 75;
  } else if (educationLower.includes('bts') || educationLower.includes('dut')) {
    levelScore = 65;
  } else if (educationLower.includes('bac')) {
    levelScore = 50;
  } else {
    levelScore = 40;
  }
  
  // Analyse de la pertinence du domaine
  const domainRelevance = analyzEducationDomainRelevance(educationLower, jobPosition.category);
  
  return Math.min(100, (levelScore * 0.6) + (domainRelevance * 0.4));
};

// Analyse de la pertinence du domaine d'éducation
const analyzEducationDomainRelevance = (education: string, jobCategory: string): number => {
  const domainKeywords = {
    'tech': ['informatique', 'computer science', 'ingénieur logiciel', 'développement', 'numérique', 'tech'],
    'healthcare': ['médecine', 'santé', 'infirmier', 'médical', 'pharmacie', 'kinésithérapie'],
    'engineering': ['ingénieur', 'mécanique', 'électrique', 'industriel', 'génie', 'technique'],
    'finance': ['finance', 'comptabilité', 'gestion', 'économie', 'banque', 'audit'],
    'marketing': ['marketing', 'communication', 'commerce', 'gestion', 'business'],
    'design': ['design', 'art', 'créatif', 'graphisme', 'architecture', 'esthétique'],
    'sales': ['commerce', 'vente', 'business', 'gestion', 'marketing'],
    'hr': ['ressources humaines', 'psychologie', 'gestion', 'droit social'],
    'management': ['gestion', 'management', 'business', 'administration', 'commerce']
  };
  
  const relevantKeywords = domainKeywords[jobCategory as keyof typeof domainKeywords] || [];
  const matches = relevantKeywords.filter(keyword => education.includes(keyword)).length;
  
  if (matches === 0) {
    // Vérification d'incompatibilité forte
    const incompatibleDomains = {
      'tech': ['médecine', 'santé', 'médical'],
      'healthcare': ['informatique', 'ingénieur logiciel', 'développement'],
      'engineering': ['médecine', 'santé', 'communication'],
      'finance': ['médecine', 'santé', 'art'],
      'marketing': ['médecine', 'ingénieur mécanique'],
      'design': ['médecine', 'comptabilité'],
      'sales': ['médecine', 'ingénieur'],
      'hr': ['médecine', 'ingénieur mécanique'],
      'management': []
    };
    
    const incompatibleKeywords = incompatibleDomains[jobCategory as keyof typeof incompatibleDomains] || [];
    const incompatibleMatches = incompatibleKeywords.filter(keyword => education.includes(keyword)).length;
    
    if (incompatibleMatches > 0) {
      return 10; // Forte incompatibilité
    }
    
    return 50; // Neutre
  }
  
  return Math.min(100, (matches / relevantKeywords.length) * 100 + 20);
};

// Détection des flags d'alerte améliorée
const detectWarningFlags = (
  cvText: string, 
  jobPosition: JobPosition, 
  coherenceScore: number, 
  sectorScore: number,
  educationScore: number,
  keywordScore: number
): string[] => {
  const warnings: string[] = [];
  
  // Cohérence du profil
  if (coherenceScore < 20) {
    warnings.push("Profil complètement inadapté au domaine requis");
  } else if (coherenceScore < 40) {
    warnings.push("Profil peu adapté au domaine requis");
  }
  
  // Expérience sectorielle
  if (sectorScore < 15) {
    warnings.push("Aucune expérience détectée dans le secteur");
  } else if (sectorScore < 35) {
    warnings.push("Expérience sectorielle limitée");
  }
  
  // Formation
  if (educationScore < 25) {
    warnings.push("Formation non alignée avec les exigences");
  }
  
  // Compétences techniques
  if (keywordScore < 20) {
    warnings.push("Compétences techniques insuffisantes");
  }
  
  // Compétences requises manquantes
  const requiredMatched = jobPosition.keywords.required.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const requiredRatio = requiredMatched / Math.max(1, jobPosition.keywords.required.length);
  
  if (requiredRatio < 0.3) {
    warnings.push("Majorité des compétences requises manquantes");
  }
  
  return warnings;
};

// Calcul du niveau de confiance
const calculateConfidenceLevel = (
  coherenceScore: number, 
  sectorScore: number, 
  warningFlags: string[],
  educationScore: number,
  keywordScore: number
): 'high' | 'medium' | 'low' => {
  const avgScore = (coherenceScore + sectorScore + educationScore + keywordScore) / 4;
  
  if (warningFlags.length >= 3 || avgScore < 30) return 'low';
  if (warningFlags.length >= 1 || avgScore < 60) return 'medium';
  return 'high';
};

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
  
  // Analyse des mots-clés avec nouvel algorithme
  const keywordAnalysis = analyzeKeywords(cvText, jobPosition);
  
  // Analyse de l'expérience
  const experienceScore = analyzeExperience(cvData, jobPosition);
  
  // Analyse de l'éducation
  const educationScore = analyzeEducation(cvData, jobPosition);
  
  // Score de certifications
  let certificationScore = 60; // Score neutre par défaut
  if (jobPosition.certifications && jobPosition.certifications.length > 0) {
    if (cvData.certifications && cvData.certifications.length > 0) {
      const matchingCerts = jobPosition.certifications.filter(cert =>
        cvData.certifications!.some(cvCert => 
          cvCert.toLowerCase().includes(cert.toLowerCase())
        )
      );
      certificationScore = (matchingCerts.length / jobPosition.certifications.length) * 100;
      if (matchingCerts.length > 0) certificationScore += 20; // Bonus pour avoir des certifications
    } else {
      certificationScore = 40; // Malus si certifications requises mais absentes
    }
  }
  
  // Analyses avancées
  const coherenceScore = analyzeProfileCoherence(cvText, jobPosition);
  const sectorScore = analyzeSectorRelevance(cvText, jobPosition);
  
  // Détection des alertes
  const warningFlags = detectWarningFlags(
    cvText, 
    jobPosition, 
    coherenceScore, 
    sectorScore, 
    educationScore,
    keywordAnalysis.score
  );
  
  // Niveau de confiance
  const confidenceLevel = calculateConfidenceLevel(
    coherenceScore, 
    sectorScore, 
    warningFlags, 
    educationScore,
    keywordAnalysis.score
  );
  
  // Calcul du score final avec pondération intelligente
  const baseScore = (
    keywordAnalysis.score * jobPosition.scoreWeights.keywords +
    experienceScore * jobPosition.scoreWeights.experience +
    educationScore * jobPosition.scoreWeights.education +
    certificationScore * jobPosition.scoreWeights.certifications
  );
  
  // Ajustements basés sur la cohérence et la pertinence sectorielle
  let finalScore = baseScore;
  
  // Bonus pour cohérence élevée
  if (coherenceScore > 80) {
    finalScore += 5;
  } else if (coherenceScore < 30) {
    finalScore -= 15; // Malus pour incohérence
  }
  
  // Bonus pour pertinence sectorielle
  if (sectorScore > 70) {
    finalScore += 5;
  } else if (sectorScore < 20) {
    finalScore -= 10;
  }
  
  // Malus pour alertes multiples
  if (warningFlags.length >= 3) {
    finalScore -= 20;
  } else if (warningFlags.length >= 1) {
    finalScore -= 5;
  }
  
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // Génération des recommandations
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  if (keywordAnalysis.score > 70) {
    strengths.push("Bonnes compétences techniques identifiées");
  }
  if (experienceScore > 80) {
    strengths.push("Expérience très adaptée au poste");
  }
  if (educationScore > 80) {
    strengths.push("Formation excellente pour le poste");
  }
  if (coherenceScore > 70) {
    strengths.push("Profil cohérent avec le domaine");
  }
  if (sectorScore > 70) {
    strengths.push("Bonne connaissance du secteur");
  }
  
  if (keywordAnalysis.score < 40) {
    improvements.push("Développer les compétences techniques spécifiques");
  }
  if (experienceScore < 50) {
    improvements.push("Acquérir plus d'expérience dans le domaine");
  }
  if (educationScore < 50) {
    improvements.push("Formation complémentaire recommandée");
  }
  if (coherenceScore < 40) {
    improvements.push("Repositionner le CV vers le domaine ciblé");
  }
  if (sectorScore < 30) {
    improvements.push("Acquérir une expérience sectorielle");
  }
  
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
    confidenceLevel
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

  // Génération de CV simulé plus réaliste
  const mockCvData = generateRealisticMockCVData(jobPosition, fileName);
  const result = calculateCVScore(jobPosition, mockCvData);
  
  return {
    ...result,
    fileName
  };
};

// Génération de CV simulé améliorée
const generateRealisticMockCVData = (jobPosition: JobPosition, fileName: string) => {
  const category = jobPosition.category;
  const profileType = determineProfileType(fileName);
  
  // Détermine la compatibilité du profil avec le poste
  const compatibility = calculateProfileCompatibility(profileType, category);
  
  let cvText = '';
  let education = '';
  let experience = `${Math.floor(Math.random() * 8) + 2} ans`;
  
  // Génération du texte CV basé sur la compatibilité
  if (compatibility.level === 'high') {
    // Profil très compatible - ajoute beaucoup de compétences pertinentes
    const relevantSkills = [
      ...jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.8)),
      ...jobPosition.keywords.preferred.slice(0, Math.floor(jobPosition.keywords.preferred.length * 0.6)),
      ...jobPosition.keywords.technical.slice(0, Math.floor(jobPosition.keywords.technical.length * 0.7))
    ];
    cvText = relevantSkills.join(' ').toLowerCase();
    education = jobPosition.education[0] || getEducationForProfile(profileType || 'generic');
    
    // Ajoute des compétences du domaine du profil
    if (profileType && SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS]) {
      const profileSkills = SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS].keywords.slice(0, 15);
      cvText += ' ' + profileSkills.join(' ').toLowerCase();
    }
    
  } else if (compatibility.level === 'medium') {
    // Profil moyennement compatible - quelques compétences communes
    const relevantSkills = [
      ...jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.4)),
      ...jobPosition.keywords.preferred.slice(0, Math.floor(jobPosition.keywords.preferred.length * 0.3))
    ];
    cvText = relevantSkills.join(' ').toLowerCase();
    education = getEducationForProfile(profileType || 'generic');
    
    // Ajoute quelques compétences du profil original
    if (profileType && SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS]) {
      const profileSkills = SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS].keywords.slice(0, 8);
      cvText += ' ' + profileSkills.join(' ').toLowerCase();
    }
    
  } else {
    // Profil incompatible - principalement des compétences du profil original
    if (profileType && SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS]) {
      const profileSkills = SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS].keywords.slice(0, 20);
      cvText = profileSkills.join(' ').toLowerCase();
    }
    
    // Très peu de compétences communes
    const fewRelevantSkills = jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.1));
    cvText += ' ' + fewRelevantSkills.join(' ').toLowerCase();
    education = getEducationForProfile(profileType || 'generic');
  }
  
  return {
    text: cvText,
    experience,
    education,
    certifications: compatibility.level === 'high' && jobPosition.certifications ? 
      [jobPosition.certifications[0]] : undefined
  };
};

// Calcule la compatibilité entre un profil et une catégorie de poste
const calculateProfileCompatibility = (profileType: string | null, jobCategory: string): {
  level: 'high' | 'medium' | 'low';
  reason: string;
} => {
  if (!profileType) {
    return { level: 'medium', reason: 'Generic profile' };
  }
  
  // Compatibilités directes
  const directMatches: Record<string, string[]> = {
    'tech': ['tech'],
    'healthcare': ['healthcare'],
    'engineering': ['engineering'],
    'finance': ['finance'],
    'marketing': ['marketing', 'design'],
    'design': ['design', 'marketing'],
    'sales': ['sales'],
    'hr': ['hr'],
    'management': ['management']
  };
  
  // Compatibilités partielles
  const partialMatches: Record<string, string[]> = {
    'tech': ['management'],
    'engineering': ['management', 'tech'],
    'finance': ['management'],
    'marketing': ['sales', 'management'],
    'design': ['tech'],
    'sales': ['marketing', 'management'],
    'hr': ['management'],
    'management': ['tech', 'engineering', 'finance', 'marketing', 'sales', 'hr']
  };
  
  // Incompatibilités fortes
  const strongIncompatibilities: Record<string, string[]> = {
    'tech': ['healthcare'],
    'healthcare': ['tech', 'engineering', 'finance', 'marketing', 'design', 'sales', 'hr'],
    'engineering': ['healthcare', 'marketing', 'hr'],
    'finance': ['healthcare', 'design'],
    'marketing': ['healthcare', 'engineering'],
    'design': ['healthcare', 'finance'],
    'sales': ['healthcare'],
    'hr': ['healthcare', 'engineering']
  };
  
  const directMatch = directMatches[jobCategory]?.includes(profileType);
  const partialMatch = partialMatches[jobCategory]?.includes(profileType);
  const strongIncompatibility = strongIncompatibilities[jobCategory]?.includes(profileType);
  
  if (directMatch) {
    return { level: 'high', reason: 'Direct match' };
  } else if (partialMatch) {
    return { level: 'medium', reason: 'Partial compatibility' };
  } else if (strongIncompatibility) {
    return { level: 'low', reason: 'Strong incompatibility' };
  } else {
    return { level: 'medium', reason: 'Neutral compatibility' };
  }
};

// Détermine le type de profil basé sur le nom du fichier
const determineProfileType = (fileName: string): string | null => {
  const nameLower = fileName.toLowerCase();
  
  if (nameLower.includes('ingenieur') || nameLower.includes('engineer') || nameLower.includes('technique')) {
    return 'engineering';
  }
  if (nameLower.includes('dev') || nameLower.includes('tech') || nameLower.includes('informatique') || nameLower.includes('programmeur')) {
    return 'tech';
  }
  if (nameLower.includes('infirmier') || nameLower.includes('medic') || nameLower.includes('sante') || nameLower.includes('soignant')) {
    return 'healthcare';
  }
  if (nameLower.includes('finance') || nameLower.includes('compta') || nameLower.includes('audit') || nameLower.includes('comptable')) {
    return 'finance';
  }
  if (nameLower.includes('market') || nameLower.includes('comm') || nameLower.includes('pub')) {
    return 'marketing';
  }
  if (nameLower.includes('design') || nameLower.includes('ux') || nameLower.includes('graph') || nameLower.includes('creatif')) {
    return 'design';
  }
  if (nameLower.includes('commercial') || nameLower.includes('vente') || nameLower.includes('sales')) {
    return 'sales';
  }
  if (nameLower.includes('rh') || nameLower.includes('hr') || nameLower.includes('recrutement')) {
    return 'hr';
  }
  if (nameLower.includes('manager') || nameLower.includes('chef') || nameLower.includes('directeur')) {
    return 'management';
  }
  
  return null;
};

// Retourne une éducation cohérente avec le type de profil
const getEducationForProfile = (profileType: string): string => {
  const educationMap = {
    'engineering': 'École d\'ingénieur',
    'tech': 'Master Informatique',
    'healthcare': 'Diplôme d\'État Infirmier',
    'finance': 'Master Finance',
    'marketing': 'Master Marketing',
    'design': 'École de Design',
    'sales': 'École de Commerce',
    'hr': 'Master RH',
    'management': 'École de Management',
    'generic': 'Master Gestion'
  };
  
  return educationMap[profileType as keyof typeof educationMap] || 'Master';
};

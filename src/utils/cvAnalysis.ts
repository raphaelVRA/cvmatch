
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

// Domaines de compétences avec leurs mots-clés associés
const SKILL_DOMAINS = {
  'tech': {
    keywords: ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'api', 'database', 'sql', 'mongodb', 'postgresql', 'html', 'css', 'typescript', 'ci/cd', 'devops', 'microservices', 'machine learning', 'ai', 'tensorflow', 'pytorch'],
    weight: 1.0
  },
  'healthcare': {
    keywords: ['soins', 'patient', 'médical', 'infirmier', 'hôpital', 'clinique', 'urgences', 'chirurgie', 'pharmacologie', 'hygiène', 'protocole', 'stérilisation', 'injection', 'perfusion', 'surveillance', 'réanimation', 'bloc opératoire', 'gériatrie', 'pédiatrie'],
    weight: 1.0
  },
  'finance': {
    keywords: ['comptabilité', 'bilan', 'budget', 'fiscalité', 'audit', 'tva', 'excel', 'sap', 'sage', 'consolidation', 'reporting', 'analyse financière', 'dcf', 'risk management', 'bloomberg', 'trading', 'investment'],
    weight: 1.0
  },
  'marketing': {
    keywords: ['seo', 'sem', 'google ads', 'facebook ads', 'analytics', 'réseaux sociaux', 'content marketing', 'brand', 'storytelling', 'crm', 'email marketing', 'growth hacking', 'conversion'],
    weight: 1.0
  },
  'design': {
    keywords: ['photoshop', 'illustrator', 'figma', 'sketch', 'ux', 'ui', 'wireframe', 'prototype', 'design thinking', 'user research', 'typography', 'branding', 'identity'],
    weight: 1.0
  },
  'sales': {
    keywords: ['vente', 'prospection', 'négociation', 'crm', 'salesforce', 'lead generation', 'closing', 'account management', 'business development', 'partnership'],
    weight: 1.0
  },
  'hr': {
    keywords: ['recrutement', 'sourcing', 'entretien', 'rh', 'paie', 'formation', 'talent', 'sirh', 'droit du travail', 'relations sociales', 'assessment'],
    weight: 1.0
  },
  'management': {
    keywords: ['leadership', 'équipe', 'projet', 'scrum', 'agile', 'planning', 'budget', 'stratégie', 'management', 'coaching', 'pmp', 'gantt'],
    weight: 1.0
  }
};

// Mapping des catégories de postes vers les domaines de compétences
const JOB_CATEGORY_DOMAINS = {
  'tech': ['tech', 'management'],
  'healthcare': ['healthcare'],
  'finance': ['finance', 'management'],
  'marketing': ['marketing', 'design'],
  'design': ['design', 'marketing'],
  'sales': ['sales', 'management'],
  'hr': ['hr', 'management'],
  'management': ['management'],
  'operations': ['management'],
  'consulting': ['management'],
  'legal': ['management'],
  'education': ['management']
};

// Analyse la cohérence du profil avec le poste
const analyzeProfileCoherence = (cvText: string, jobPosition: JobPosition): number => {
  const jobDomains = JOB_CATEGORY_DOMAINS[jobPosition.category as keyof typeof JOB_CATEGORY_DOMAINS] || [];
  
  let relevantSkillsFound = 0;
  let irrelevantSkillsFound = 0;
  
  // Compter les compétences pertinentes
  jobDomains.forEach(domain => {
    const domainSkills = SKILL_DOMAINS[domain as keyof typeof SKILL_DOMAINS];
    if (domainSkills) {
      domainSkills.keywords.forEach(keyword => {
        if (cvText.includes(keyword.toLowerCase())) {
          relevantSkillsFound++;
        }
      });
    }
  });
  
  // Compter les compétences non pertinentes (autres domaines)
  Object.entries(SKILL_DOMAINS).forEach(([domain, skills]) => {
    if (!jobDomains.includes(domain)) {
      skills.keywords.forEach(keyword => {
        if (cvText.includes(keyword.toLowerCase())) {
          irrelevantSkillsFound++;
        }
      });
    }
  });
  
  // Calcul du score de cohérence
  const totalSkills = relevantSkillsFound + irrelevantSkillsFound;
  if (totalSkills === 0) return 50; // Score neutre si pas de compétences détectées
  
  const coherenceRatio = relevantSkillsFound / totalSkills;
  return Math.min(100, coherenceRatio * 100);
};

// Analyse la pertinence sectorielle
const analyzeSectorRelevance = (cvText: string, jobPosition: JobPosition): number => {
  const sectorKeywords = {
    'tech': ['développement', 'programmation', 'logiciel', 'application', 'système', 'informatique', 'digital', 'numérique'],
    'healthcare': ['santé', 'médical', 'hôpital', 'clinique', 'cabinet', 'centre de soins', 'établissement de santé'],
    'finance': ['banque', 'assurance', 'finance', 'comptabilité', 'audit', 'cabinet comptable', 'société de gestion'],
    'marketing': ['agence', 'communication', 'publicité', 'marketing', 'digital', 'média', 'brand'],
    'design': ['agence', 'studio', 'création', 'design', 'graphisme', 'web design', 'ux'],
    'sales': ['commercial', 'vente', 'business', 'développement commercial', 'account'],
    'hr': ['ressources humaines', 'rh', 'recrutement', 'talent', 'formation'],
    'management': ['direction', 'management', 'chef', 'responsable', 'manager', 'directeur']
  };
  
  const jobSectorKeywords = sectorKeywords[jobPosition.category as keyof typeof sectorKeywords] || [];
  
  let sectorMatches = 0;
  jobSectorKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      sectorMatches++;
    }
  });
  
  return Math.min(100, (sectorMatches / Math.max(1, jobSectorKeywords.length)) * 100);
};

// Détecte les flags d'alerte
const detectWarningFlags = (
  cvText: string, 
  jobPosition: JobPosition, 
  coherenceScore: number, 
  sectorScore: number
): string[] => {
  const warnings: string[] = [];
  
  // Incohérence majeure de profil
  if (coherenceScore < 30) {
    warnings.push("Profil très éloigné du domaine requis");
  }
  
  // Manque d'expérience sectorielle
  if (sectorScore < 20) {
    warnings.push("Aucune expérience détectée dans le secteur");
  }
  
  // Détection de domaines incompatibles
  const incompatibleDomains = {
    'healthcare': ['tech', 'finance', 'marketing'],
    'tech': ['healthcare'],
    'finance': ['healthcare', 'design'],
    'design': ['healthcare', 'finance']
  };
  
  const jobCategory = jobPosition.category;
  const incompatible = incompatibleDomains[jobCategory as keyof typeof incompatibleDomains] || [];
  
  incompatible.forEach(domain => {
    const domainSkills = SKILL_DOMAINS[domain as keyof typeof SKILL_DOMAINS];
    if (domainSkills) {
      const skillsFound = domainSkills.keywords.filter(keyword => 
        cvText.includes(keyword.toLowerCase())
      ).length;
      
      if (skillsFound > 3) {
        warnings.push(`Profil orienté ${domain}, incompatible avec ${jobCategory}`);
      }
    }
  });
  
  return warnings;
};

// Calcul du niveau de confiance
const calculateConfidenceLevel = (
  coherenceScore: number, 
  sectorScore: number, 
  warningFlags: string[]
): 'high' | 'medium' | 'low' => {
  if (warningFlags.length > 2 || coherenceScore < 40) return 'low';
  if (warningFlags.length > 0 || coherenceScore < 70 || sectorScore < 50) return 'medium';
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
  
  // Analyse des mots-clés avec pondération intelligente
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

  // Score des mots-clés avec pondération améliorée
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

  // Pondération plus stricte pour les compétences requises
  const keywordScore = Math.min(100, (
    (requiredMatched / Math.max(1, jobPosition.keywords.required.length)) * 50 +
    (preferredMatched / Math.max(1, jobPosition.keywords.preferred.length)) * 25 +
    (technicalMatched / Math.max(1, jobPosition.keywords.technical.length)) * 15 +
    (softMatched / Math.max(1, jobPosition.keywords.soft.length)) * 10
  ));

  // Score d'expérience amélioré
  let experienceScore = 0;
  if (cvData.experience) {
    const expMatch = cvData.experience.match(/(\d+)/);
    const yearsExp = expMatch ? parseInt(expMatch[0]) : 0;
    
    if (yearsExp >= jobPosition.experience.preferred) {
      experienceScore = 100;
    } else if (yearsExp >= jobPosition.experience.min) {
      const ratio = (yearsExp - jobPosition.experience.min) / 
        Math.max(1, jobPosition.experience.preferred - jobPosition.experience.min);
      experienceScore = 70 + (ratio * 30);
    } else if (yearsExp > 0) {
      experienceScore = Math.min(60, (yearsExp / jobPosition.experience.min) * 60);
    } else {
      experienceScore = 20;
    }
  } else {
    experienceScore = 20;
  }

  // Score d'éducation avec vérification de pertinence
  let educationScore = 0;
  if (cvData.education) {
    const educationLower = cvData.education.toLowerCase();
    const hasMatchingEducation = jobPosition.education.some(edu => 
      educationLower.includes(edu.toLowerCase())
    );
    
    if (hasMatchingEducation) {
      educationScore = 100;
    } else {
      // Vérification de la cohérence du niveau d'éducation
      const hasHigherEducation = educationLower.includes('master') || 
                                educationLower.includes('doctorat') ||
                                educationLower.includes('ingénieur');
      const requiresHigherEd = jobPosition.education.some(edu => 
        edu.toLowerCase().includes('master') || 
        edu.toLowerCase().includes('doctorat') ||
        edu.toLowerCase().includes('ingénieur')
      );
      
      if (hasHigherEducation && requiresHigherEd) {
        educationScore = 70;
      } else if (!requiresHigherEd) {
        educationScore = 60;
      } else {
        educationScore = 30;
      }
    }
  } else {
    educationScore = 30;
  }

  // Score de certifications
  let certificationScore = 0;
  if (jobPosition.certifications && jobPosition.certifications.length > 0) {
    if (cvData.certifications && cvData.certifications.length > 0) {
      const matchingCerts = jobPosition.certifications.filter(cert =>
        cvData.certifications!.some(cvCert => 
          cvCert.toLowerCase().includes(cert.toLowerCase())
        )
      );
      certificationScore = (matchingCerts.length / jobPosition.certifications.length) * 100;
    } else {
      certificationScore = 0;
    }
  } else {
    certificationScore = 100; // Pas de malus si pas de certifications requises
  }

  // Analyses avancées
  const coherenceScore = analyzeProfileCoherence(cvText, jobPosition);
  const sectorScore = analyzeSectorRelevance(cvText, jobPosition);
  const warningFlags = detectWarningFlags(cvText, jobPosition, coherenceScore, sectorScore);
  const confidenceLevel = calculateConfidenceLevel(coherenceScore, sectorScore, warningFlags);

  // Calcul du score final avec pondération avancée
  let baseScore = (
    keywordScore * jobPosition.scoreWeights.keywords +
    experienceScore * jobPosition.scoreWeights.experience +
    educationScore * jobPosition.scoreWeights.education +
    certificationScore * jobPosition.scoreWeights.certifications
  );

  // Application des malus pour incohérence
  const coherencePenalty = Math.max(0, (50 - coherenceScore) / 2);
  const sectorPenalty = Math.max(0, (30 - sectorScore) / 3);
  
  const finalScore = Math.max(0, Math.min(100, 
    baseScore - coherencePenalty - sectorPenalty
  ));

  // Génération des recommandations intelligentes
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (coherenceScore > 80) {
    strengths.push("Profil parfaitement aligné avec le domaine");
  } else if (coherenceScore < 40) {
    improvements.push("Reorienter le CV vers les compétences du domaine ciblé");
  }

  if (keywordScore > 70) {
    strengths.push("Excellente maîtrise des compétences techniques");
  } else if (keywordScore < 40) {
    improvements.push("Développer les compétences techniques spécifiques");
  }

  if (experienceScore > 80) {
    strengths.push("Expérience très solide et pertinente");
  } else if (experienceScore < 50) {
    improvements.push("Acquérir plus d'expérience dans le secteur");
  }

  if (sectorScore > 70) {
    strengths.push("Bonne connaissance du secteur d'activité");
  } else if (sectorScore < 30) {
    improvements.push("Se familiariser avec l'environnement sectoriel");
  }

  // Conseils spécifiques selon les compétences manquantes critiques
  const criticalMissing = jobPosition.keywords.required.filter(k => 
    !cvText.includes(k.toLowerCase())
  );
  if (criticalMissing.length > jobPosition.keywords.required.length * 0.5) {
    improvements.push(`Compétences critiques manquantes: ${criticalMissing.slice(0, 3).join(', ')}`);
  }

  return {
    score: Math.round(finalScore),
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 8),
    strengths,
    improvements,
    experienceMatch: Math.round(experienceScore),
    educationMatch: Math.round(educationScore),
    profileCoherence: Math.round(coherenceScore),
    sectorRelevance: Math.round(sectorScore),
    breakdown: {
      keywordScore: Math.round(keywordScore),
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

  // Simulation plus réaliste avec cohérence
  const mockCvData = {
    text: generateRealisticMockCVText(jobPosition, fileName),
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

// Génération de CV simulé plus réaliste avec cohérence
const generateRealisticMockCVText = (jobPosition: JobPosition, fileName: string): string => {
  const category = jobPosition.category;
  
  // Probabilité d'avoir des compétences pertinentes selon le nom du fichier
  const isProbablyRelevant = fileName.toLowerCase().includes(category) || 
                            fileName.toLowerCase().includes(jobPosition.title.toLowerCase().split(' ')[0]);
  
  const relevanceProbability = isProbablyRelevant ? 0.8 : 0.3;
  
  // Sélection intelligente des mots-clés
  const selectedKeywords: string[] = [];
  
  // Ajouter des compétences du bon domaine avec forte probabilité
  const jobDomains = JOB_CATEGORY_DOMAINS[category as keyof typeof JOB_CATEGORY_DOMAINS] || [];
  jobDomains.forEach(domain => {
    const domainSkills = SKILL_DOMAINS[domain as keyof typeof SKILL_DOMAINS];
    if (domainSkills) {
      domainSkills.keywords.forEach(keyword => {
        if (Math.random() < relevanceProbability) {
          selectedKeywords.push(keyword);
        }
      });
    }
  });
  
  // Ajouter quelques compétences du job position
  jobPosition.keywords.required.forEach(keyword => {
    if (Math.random() < relevanceProbability) {
      selectedKeywords.push(keyword);
    }
  });
  
  jobPosition.keywords.preferred.forEach(keyword => {
    if (Math.random() < relevanceProbability * 0.7) {
      selectedKeywords.push(keyword);
    }
  });
  
  // Ajouter potentiellement des compétences non pertinentes
  if (!isProbablyRelevant) {
    const randomDomains = Object.keys(SKILL_DOMAINS).filter(d => !jobDomains.includes(d));
    const randomDomain = randomDomains[Math.floor(Math.random() * randomDomains.length)];
    const randomSkills = SKILL_DOMAINS[randomDomain as keyof typeof SKILL_DOMAINS];
    
    if (randomSkills) {
      randomSkills.keywords.slice(0, 5).forEach(keyword => {
        if (Math.random() < 0.6) {
          selectedKeywords.push(keyword);
        }
      });
    }
  }
  
  return selectedKeywords.join(" ").toLowerCase();
};

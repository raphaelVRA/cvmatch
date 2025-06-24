
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
    keywords: ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'docker', 'kubernetes', 'aws', 'azure', 'git', 'api', 'database', 'sql', 'mongodb', 'postgresql', 'html', 'css', 'typescript', 'ci/cd', 'devops', 'microservices', 'machine learning', 'ai', 'tensorflow', 'pytorch', 'développement', 'programmation', 'logiciel', 'système', 'informatique', 'algorithme'],
    weight: 1.0,
    incompatibleWith: ['healthcare', 'finance']
  },
  'healthcare': {
    keywords: ['soins', 'patient', 'médical', 'infirmier', 'hôpital', 'clinique', 'urgences', 'chirurgie', 'pharmacologie', 'hygiène', 'protocole', 'stérilisation', 'injection', 'perfusion', 'surveillance', 'réanimation', 'bloc opératoire', 'gériatrie', 'pédiatrie', 'sante', 'médecine', 'thérapie', 'diagnostic', 'traitement', 'pathologie', 'anatomie', 'physiologie'],
    weight: 1.0,
    incompatibleWith: ['tech', 'engineering']
  },
  'engineering': {
    keywords: ['ingénieur', 'ingénierie', 'mécanique', 'électrique', 'civil', 'industriel', 'génie', 'conception', 'calcul', 'simulation', 'cad', 'autocad', 'solidworks', 'matlab', 'prototypage', 'essais', 'qualité', 'process', 'production', 'maintenance', 'technique'],
    weight: 1.0,
    incompatibleWith: ['healthcare', 'marketing']
  },
  'finance': {
    keywords: ['comptabilité', 'bilan', 'budget', 'fiscalité', 'audit', 'tva', 'excel', 'sap', 'sage', 'consolidation', 'reporting', 'analyse financière', 'dcf', 'risk management', 'bloomberg', 'trading', 'investment', 'banque', 'assurance', 'crédit', 'finance'],
    weight: 1.0,
    incompatibleWith: ['healthcare', 'tech']
  },
  'marketing': {
    keywords: ['seo', 'sem', 'google ads', 'facebook ads', 'analytics', 'réseaux sociaux', 'content marketing', 'brand', 'storytelling', 'crm', 'email marketing', 'growth hacking', 'conversion', 'communication', 'publicité', 'campagne'],
    weight: 1.0,
    incompatibleWith: ['healthcare', 'engineering']
  },
  'design': {
    keywords: ['photoshop', 'illustrator', 'figma', 'sketch', 'ux', 'ui', 'wireframe', 'prototype', 'design thinking', 'user research', 'typography', 'branding', 'identity', 'créatif', 'graphisme'],
    weight: 1.0,
    incompatibleWith: ['healthcare', 'finance']
  },
  'sales': {
    keywords: ['vente', 'prospection', 'négociation', 'crm', 'salesforce', 'lead generation', 'closing', 'account management', 'business development', 'partnership', 'commercial', 'client'],
    weight: 1.0,
    incompatibleWith: ['healthcare']
  },
  'hr': {
    keywords: ['recrutement', 'sourcing', 'entretien', 'rh', 'paie', 'formation', 'talent', 'sirh', 'droit du travail', 'relations sociales', 'assessment', 'ressources humaines'],
    weight: 1.0,
    incompatibleWith: ['healthcare', 'tech']
  },
  'management': {
    keywords: ['leadership', 'équipe', 'projet', 'scrum', 'agile', 'planning', 'budget', 'stratégie', 'management', 'coaching', 'pmp', 'gantt', 'gestion', 'direction'],
    weight: 0.8,
    incompatibleWith: []
  }
};

// Mapping des catégories de postes vers les domaines de compétences
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
  'operations': ['management'],
  'consulting': ['management'],
  'legal': ['management'],
  'education': ['management']
};

// Analyse la cohérence du profil avec le poste - Version améliorée
const analyzeProfileCoherence = (cvText: string, jobPosition: JobPosition): number => {
  const jobDomains = JOB_CATEGORY_DOMAINS[jobPosition.category as keyof typeof JOB_CATEGORY_DOMAINS] || [];
  
  let relevantSkillsFound = 0;
  let totalRelevantSkills = 0;
  let incompatibleSkillsFound = 0;
  let totalIncompatibleSkills = 0;
  
  // Compter les compétences pertinentes trouvées
  jobDomains.forEach(domain => {
    const domainSkills = SKILL_DOMAINS[domain as keyof typeof SKILL_DOMAINS];
    if (domainSkills) {
      totalRelevantSkills += domainSkills.keywords.length;
      domainSkills.keywords.forEach(keyword => {
        if (cvText.includes(keyword.toLowerCase())) {
          relevantSkillsFound++;
        }
      });
    }
  });
  
  // Compter les compétences incompatibles
  Object.entries(SKILL_DOMAINS).forEach(([domain, skills]) => {
    if (!jobDomains.includes(domain)) {
      const mainJobDomain = jobDomains[0];
      const mainDomainInfo = SKILL_DOMAINS[mainJobDomain as keyof typeof SKILL_DOMAINS];
      
      if (mainDomainInfo && mainDomainInfo.incompatibleWith.includes(domain)) {
        totalIncompatibleSkills += skills.keywords.length;
        skills.keywords.forEach(keyword => {
          if (cvText.includes(keyword.toLowerCase())) {
            incompatibleSkillsFound++;
          }
        });
      }
    }
  });
  
  // Calcul du score de cohérence plus strict
  const relevanceRatio = totalRelevantSkills > 0 ? relevantSkillsFound / totalRelevantSkills : 0;
  const incompatibilityPenalty = totalIncompatibleSkills > 0 ? (incompatibleSkillsFound / totalIncompatibleSkills) * 100 : 0;
  
  let coherenceScore = Math.max(0, (relevanceRatio * 100) - (incompatibilityPenalty * 2));
  
  // Bonus si au moins 20% des compétences pertinentes sont trouvées
  if (relevanceRatio >= 0.2) {
    coherenceScore = Math.min(100, coherenceScore + 20);
  }
  
  return Math.round(coherenceScore);
};

// Analyse la pertinence sectorielle - Version plus stricte
const analyzeSectorRelevance = (cvText: string, jobPosition: JobPosition): number => {
  const sectorKeywords = {
    'tech': ['développement', 'programmation', 'logiciel', 'application', 'système', 'informatique', 'digital', 'numérique', 'tech', 'startup', 'web'],
    'healthcare': ['santé', 'médical', 'hôpital', 'clinique', 'cabinet', 'centre de soins', 'établissement de santé', 'chu', 'ehpad', 'urgences'],
    'engineering': ['bureau d\'études', 'ingénierie', 'industrie', 'usine', 'production', 'manufacturier', 'technique', 'r&d', 'recherche'],
    'finance': ['banque', 'assurance', 'finance', 'comptabilité', 'audit', 'cabinet comptable', 'société de gestion', 'bourse', 'investment'],
    'marketing': ['agence', 'communication', 'publicité', 'marketing', 'digital', 'média', 'brand', 'créatif'],
    'design': ['agence', 'studio', 'création', 'design', 'graphisme', 'web design', 'ux', 'créatif'],
    'sales': ['commercial', 'vente', 'business', 'développement commercial', 'account', 'client', 'retail'],
    'hr': ['ressources humaines', 'rh', 'recrutement', 'talent', 'formation', 'cabinet rh', 'consulting rh'],
    'management': ['direction', 'management', 'chef', 'responsable', 'manager', 'directeur', 'cadre', 'leadership']
  };
  
  const jobSectorKeywords = sectorKeywords[jobPosition.category as keyof typeof sectorKeywords] || [];
  
  let sectorMatches = 0;
  let contextualMatches = 0;
  
  jobSectorKeywords.forEach(keyword => {
    if (cvText.includes(keyword.toLowerCase())) {
      sectorMatches++;
      // Bonus si le mot-clé apparaît dans un contexte d'expérience
      if (cvText.includes(`expérience ${keyword}`) || cvText.includes(`${keyword} depuis`) || cvText.includes(`ans ${keyword}`)) {
        contextualMatches++;
      }
    }
  });
  
  let sectorScore = (sectorMatches / Math.max(1, jobSectorKeywords.length)) * 100;
  
  // Bonus pour contexte d'expérience
  if (contextualMatches > 0) {
    sectorScore = Math.min(100, sectorScore + (contextualMatches * 10));
  }
  
  return Math.round(sectorScore);
};

// Détecte les flags d'alerte - Version renforcée
const detectWarningFlags = (
  cvText: string, 
  jobPosition: JobPosition, 
  coherenceScore: number, 
  sectorScore: number,
  educationScore: number
): string[] => {
  const warnings: string[] = [];
  
  // Incohérence majeure de profil
  if (coherenceScore < 20) {
    warnings.push("Profil complètement inadapté au domaine requis");
  } else if (coherenceScore < 40) {
    warnings.push("Profil très éloigné du domaine requis");
  }
  
  // Manque d'expérience sectorielle
  if (sectorScore < 10) {
    warnings.push("Aucune expérience détectée dans le secteur");
  } else if (sectorScore < 30) {
    warnings.push("Expérience sectorielle insuffisante");
  }
  
  // Formation inadaptée
  if (educationScore < 30) {
    warnings.push("Formation non alignée avec les exigences du poste");
  }
  
  // Détection de domaines hautement incompatibles
  const jobCategory = jobPosition.category;
  const jobDomainInfo = SKILL_DOMAINS[Object.keys(SKILL_DOMAINS).find(domain => 
    JOB_CATEGORY_DOMAINS[jobCategory as keyof typeof JOB_CATEGORY_DOMAINS]?.includes(domain)
  ) as keyof typeof SKILL_DOMAINS];
  
  if (jobDomainInfo && jobDomainInfo.incompatibleWith) {
    jobDomainInfo.incompatibleWith.forEach(incompatibleDomain => {
      const incompatibleSkills = SKILL_DOMAINS[incompatibleDomain as keyof typeof SKILL_DOMAINS];
      if (incompatibleSkills) {
        const skillsFound = incompatibleSkills.keywords.filter(keyword => 
          cvText.includes(keyword.toLowerCase())
        ).length;
        
        if (skillsFound > 2) {
          warnings.push(`Profil ${incompatibleDomain} détecté, incompatible avec ${jobCategory}`);
        }
      }
    });
  }
  
  return warnings;
};

// Calcul du niveau de confiance - Version plus stricte
const calculateConfidenceLevel = (
  coherenceScore: number, 
  sectorScore: number, 
  warningFlags: string[],
  educationScore: number
): 'high' | 'medium' | 'low' => {
  if (warningFlags.length > 2 || coherenceScore < 30 || educationScore < 30) return 'low';
  if (warningFlags.length > 0 || coherenceScore < 60 || sectorScore < 40) return 'medium';
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

  // Score des mots-clés avec pondération plus stricte
  const requiredMatched = jobPosition.keywords.required.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const requiredTotal = jobPosition.keywords.required.length;
  
  const preferredMatched = jobPosition.keywords.preferred.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const preferredTotal = jobPosition.keywords.preferred.length;
  
  const technicalMatched = jobPosition.keywords.technical.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const technicalTotal = jobPosition.keywords.technical.length;
  
  const softMatched = jobPosition.keywords.soft.filter(k => 
    cvText.includes(k.toLowerCase())
  ).length;
  const softTotal = jobPosition.keywords.soft.length;

  // Calcul plus strict - pas de compensation entre catégories
  let keywordScore = 0;
  if (requiredTotal > 0) {
    const requiredScore = (requiredMatched / requiredTotal) * 60; // 60% du score max
    keywordScore += requiredScore;
  }
  if (preferredTotal > 0) {
    const preferredScore = (preferredMatched / preferredTotal) * 20; // 20% du score max
    keywordScore += preferredScore;
  }
  if (technicalTotal > 0) {
    const technicalScore = (technicalMatched / technicalTotal) * 15; // 15% du score max
    keywordScore += technicalScore;
  }
  if (softTotal > 0) {
    const softScore = (softMatched / softTotal) * 5; // 5% du score max
    keywordScore += softScore;
  }

  // Malus si moins de 50% des compétences requises
  if (requiredTotal > 0 && (requiredMatched / requiredTotal) < 0.5) {
    keywordScore *= 0.6; // Malus de 40%
  }

  // Score d'expérience plus réaliste
  let experienceScore = 0;
  if (cvData.experience) {
    const expMatch = cvData.experience.match(/(\d+)/);
    const yearsExp = expMatch ? parseInt(expMatch[0]) : 0;
    
    if (yearsExp >= jobPosition.experience.preferred) {
      experienceScore = 90;
    } else if (yearsExp >= jobPosition.experience.min) {
      const ratio = (yearsExp - jobPosition.experience.min) / 
        Math.max(1, jobPosition.experience.preferred - jobPosition.experience.min);
      experienceScore = 60 + (ratio * 30);
    } else if (yearsExp > 0) {
      experienceScore = Math.min(50, (yearsExp / jobPosition.experience.min) * 50);
    } else {
      experienceScore = 10; // Score très bas sans expérience détectée
    }
  } else {
    experienceScore = 10;
  }

  // Score d'éducation plus strict avec vérification de pertinence
  let educationScore = 0;
  if (cvData.education) {
    const educationLower = cvData.education.toLowerCase();
    
    // Vérification exacte des formations requises
    const exactMatch = jobPosition.education.some(edu => 
      educationLower.includes(edu.toLowerCase())
    );
    
    if (exactMatch) {
      educationScore = 90;
    } else {
      // Vérification de la cohérence du domaine
      const jobCategory = jobPosition.category;
      let domainMatch = false;
      
      switch (jobCategory) {
        case 'healthcare':
          domainMatch = educationLower.includes('santé') || educationLower.includes('médical') || 
                       educationLower.includes('infirmier') || educationLower.includes('médecine');
          break;
        case 'tech':
          domainMatch = educationLower.includes('informatique') || educationLower.includes('ingénieur') ||
                       educationLower.includes('tech') || educationLower.includes('développement');
          break;
        case 'engineering':
          domainMatch = educationLower.includes('ingénieur') || educationLower.includes('technique') ||
                       educationLower.includes('mécanique') || educationLower.includes('industriel');
          break;
        case 'finance':
          domainMatch = educationLower.includes('finance') || educationLower.includes('comptabilité') ||
                       educationLower.includes('gestion') || educationLower.includes('économie');
          break;
        default:
          // Vérification générale du niveau
          domainMatch = educationLower.includes('master') || educationLower.includes('licence');
      }
      
      if (domainMatch) {
        educationScore = 60;
      } else {
        // Vérification opposée - formations incompatibles
        const isIncompatible = checkEducationIncompatibility(educationLower, jobCategory);
        if (isIncompatible) {
          educationScore = 5; // Score très bas pour formation incompatible
        } else {
          educationScore = 25; // Score neutre
        }
      }
    }
  } else {
    educationScore = 15;
  }

  // Score de certifications - plus strict
  let certificationScore = 50; // Score neutre par défaut
  if (jobPosition.certifications && jobPosition.certifications.length > 0) {
    if (cvData.certifications && cvData.certifications.length > 0) {
      const matchingCerts = jobPosition.certifications.filter(cert =>
        cvData.certifications!.some(cvCert => 
          cvCert.toLowerCase().includes(cert.toLowerCase())
        )
      );
      certificationScore = (matchingCerts.length / jobPosition.certifications.length) * 100;
    } else {
      certificationScore = 20; // Malus si pas de certifications mais requises
    }
  }

  // Analyses avancées
  const coherenceScore = analyzeProfileCoherence(cvText, jobPosition);
  const sectorScore = analyzeSectorRelevance(cvText, jobPosition);
  const warningFlags = detectWarningFlags(cvText, jobPosition, coherenceScore, sectorScore, educationScore);
  const confidenceLevel = calculateConfidenceLevel(coherenceScore, sectorScore, warningFlags, educationScore);

  // Calcul du score final avec malus drastiques pour incohérence
  const baseScore = (
    keywordScore * jobPosition.scoreWeights.keywords +
    experienceScore * jobPosition.scoreWeights.experience +
    educationScore * jobPosition.scoreWeights.education +
    certificationScore * jobPosition.scoreWeights.certifications
  );

  // Application de malus sévères pour incohérence
  let finalScore = baseScore;
  
  // Malus pour cohérence faible
  if (coherenceScore < 50) {
    const coherencePenalty = (50 - coherenceScore) * 1.5; // Malus plus sévère
    finalScore -= coherencePenalty;
  }
  
  // Malus pour pertinence sectorielle faible
  if (sectorScore < 40) {
    const sectorPenalty = (40 - sectorScore) * 1.2;
    finalScore -= sectorPenalty;
  }
  
  // Malus pour chaque alerte
  finalScore -= warningFlags.length * 15;
  
  // Malus drastique si formation complètement inadaptée
  if (educationScore < 20) {
    finalScore *= 0.5; // Divise le score par 2
  }
  
  finalScore = Math.max(0, Math.min(100, finalScore));

  // Génération des recommandations intelligentes
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (coherenceScore > 70) {
    strengths.push("Profil parfaitement aligné avec le domaine");
  } else if (coherenceScore < 30) {
    improvements.push("Reorienter complètement le CV vers les compétences du domaine ciblé");
  }

  if (keywordScore > 60) {
    strengths.push("Bonnes compétences techniques identifiées");
  } else if (keywordScore < 30) {
    improvements.push("Développer urgemment les compétences techniques spécifiques");
  }

  if (educationScore > 70) {
    strengths.push("Formation très adaptée au poste");
  } else if (educationScore < 30) {
    improvements.push("Formation inadaptée - envisager une reconversion");
  }

  if (sectorScore > 60) {
    strengths.push("Bonne connaissance du secteur d'activité");
  } else if (sectorScore < 20) {
    improvements.push("Acquérir une expérience significative dans le secteur");
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

// Fonction pour vérifier l'incompatibilité éducative
const checkEducationIncompatibility = (education: string, jobCategory: string): boolean => {
  const incompatibilities = {
    'healthcare': ['informatique', 'ingénieur', 'tech', 'développement', 'programmation'],
    'tech': ['médical', 'santé', 'infirmier', 'médecine'],
    'engineering': ['médical', 'santé', 'infirmier', 'marketing'],
    'finance': ['médical', 'santé', 'infirmier', 'tech'],
    'marketing': ['médical', 'santé', 'infirmier', 'ingénieur']
  };
  
  const incompatibleTerms = incompatibilities[jobCategory as keyof typeof incompatibilities] || [];
  return incompatibleTerms.some(term => education.includes(term));
};

export const simulateDetailedAnalysis = (
  fileName: string,
  jobPositionId: string
): AnalysisResult & { fileName: string } => {
  const jobPosition = getJobPositionById(jobPositionId);
  if (!jobPosition) {
    throw new Error("Position not found");
  }

  // Simulation plus réaliste avec cohérence stricte
  const mockCvData = generateRealisticMockCVData(jobPosition, fileName);
  const result = calculateCVScore(jobPosition, mockCvData);
  
  return {
    ...result,
    fileName
  };
};

// Génération de CV simulé plus réaliste avec logique stricte
const generateRealisticMockCVData = (jobPosition: JobPosition, fileName: string) => {
  const category = jobPosition.category;
  
  // Détermine le type de profil basé sur le nom du fichier
  const profileType = determineProfileType(fileName);
  const isRelevant = profileType === category || 
                    (profileType === 'management' && category !== 'healthcare') ||
                    (profileType === 'generic');
  
  // Génération du texte CV selon le type de profil
  let cvText = '';
  let education = '';
  let experience = `${Math.floor(Math.random() * 8) + 1} ans`;
  
  if (profileType && profileType !== 'generic') {
    const profileDomain = SKILL_DOMAINS[profileType as keyof typeof SKILL_DOMAINS];
    if (profileDomain) {
      // Ajoute massivement les compétences du profil détecté
      const skillsToAdd = profileDomain.keywords.slice(0, Math.floor(profileDomain.keywords.length * 0.8));
      cvText = skillsToAdd.join(' ').toLowerCase();
      
      // Education cohérente avec le profil
      education = getEducationForProfile(profileType);
    }
  }
  
  // Si le profil est pertinent, ajoute quelques compétences du job
  if (isRelevant) {
    const relevantSkills = [
      ...jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.6)),
      ...jobPosition.keywords.preferred.slice(0, Math.floor(jobPosition.keywords.preferred.length * 0.4))
    ];
    cvText += ' ' + relevantSkills.join(' ').toLowerCase();
    
    if (!education) {
      education = jobPosition.education[0] || 'Master';
    }
  } else {
    // Profil non pertinent - très peu de compétences communes
    const someSkills = jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.1));
    cvText += ' ' + someSkills.join(' ').toLowerCase();
    
    if (!education) {
      education = getEducationForProfile(profileType || 'generic');
    }
  }
  
  return {
    text: cvText,
    experience,
    education,
    certifications: isRelevant && jobPosition.certifications ? [jobPosition.certifications[0]] : undefined
  };
};

// Détermine le type de profil basé sur le nom du fichier
const determineProfileType = (fileName: string): string | null => {
  const nameLower = fileName.toLowerCase();
  
  if (nameLower.includes('ingenieur') || nameLower.includes('engineer') || nameLower.includes('technique')) {
    return 'engineering';
  }
  if (nameLower.includes('dev') || nameLower.includes('tech') || nameLower.includes('informatique')) {
    return 'tech';
  }
  if (nameLower.includes('infirmier') || nameLower.includes('medic') || nameLower.includes('sante')) {
    return 'healthcare';
  }
  if (nameLower.includes('finance') || nameLower.includes('compta') || nameLower.includes('audit')) {
    return 'finance';
  }
  if (nameLower.includes('market') || nameLower.includes('comm') || nameLower.includes('pub')) {
    return 'marketing';
  }
  if (nameLower.includes('design') || nameLower.includes('ux') || nameLower.includes('graph')) {
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
  
  return 'generic';
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
    'generic': 'Licence'
  };
  
  return educationMap[profileType as keyof typeof educationMap] || 'Licence';
};


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

// Base de compétences détaillées par domaine
const SKILL_DATABASE = {
  'tech': {
    languages: ['javascript', 'python', 'java', 'c#', 'php', 'typescript', 'go', 'rust', 'scala', 'kotlin'],
    frameworks: ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'next.js'],
    tools: ['git', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'jira', 'confluence', 'postman', 'webpack'],
    cloud: ['aws', 'azure', 'gcp', 'heroku', 'digitalocean', 'cloudflare', 'firebase'],
    databases: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'oracle'],
    concepts: ['api', 'microservices', 'ci/cd', 'devops', 'tdd', 'agile', 'scrum', 'architecture', 'sécurité'],
    soft: ['développement', 'programmation', 'informatique', 'logiciel', 'code', 'application', 'système']
  },
  'healthcare': {
    clinical: ['soins', 'patient', 'médical', 'clinique', 'hôpital', 'urgences', 'chirurgie', 'réanimation'],
    procedures: ['injection', 'perfusion', 'pansement', 'surveillance', 'protocole', 'hygiène', 'stérilisation'],
    specialties: ['gériatrie', 'pédiatrie', 'psychiatrie', 'cardiologie', 'oncologie', 'bloc opératoire'],
    skills: ['empathie', 'communication', 'gestion stress', 'travail équipe', 'rigueur', 'observation'],
    knowledge: ['anatomie', 'physiologie', 'pathologie', 'pharmacologie', 'déontologie', 'législation'],
    soft: ['santé', 'médecine', 'thérapie', 'diagnostic', 'traitement', 'prévention']
  },
  'engineering': {
    mechanical: ['mécanique', 'conception', 'fabrication', 'usinage', 'maintenance', 'production'],
    electrical: ['électrique', 'électronique', 'automatisme', 'instrumentation', 'contrôle'],
    tools: ['autocad', 'solidworks', 'catia', 'matlab', 'simulink', 'ansys', 'cad', 'cao'],
    processes: ['qualité', 'lean', 'six sigma', 'kaizen', 'amélioration continue', 'process'],
    management: ['gestion projet', 'planning', 'budget', 'équipe', 'coordination', 'pilotage'],
    soft: ['ingénieur', 'ingénierie', 'technique', 'innovation', 'recherche', 'développement']
  },
  'finance': {
    accounting: ['comptabilité', 'bilan', 'compte résultat', 'budget', 'prévisionnel', 'consolidation'],
    tools: ['excel', 'sap', 'sage', 'cegid', 'quickbooks', 'oracle financials', 'reporting'],
    analysis: ['analyse financière', 'dcf', 'valorisation', 'risk management', 'audit', 'contrôle'],
    regulations: ['fiscalité', 'tva', 'normes ifrs', 'us gaap', 'compliance', 'réglementation'],
    markets: ['trading', 'investment', 'portfolio', 'bloomberg', 'reuters', 'marchés'],
    soft: ['finance', 'banque', 'assurance', 'crédit', 'investissement', 'gestion']
  },
  'marketing': {
    digital: ['seo', 'sem', 'google ads', 'facebook ads', 'linkedin ads', 'social media', 'content'],
    analytics: ['google analytics', 'gtm', 'data studio', 'tableau', 'powerbi', 'kpi', 'roi'],
    tools: ['hubspot', 'salesforce', 'mailchimp', 'hootsuite', 'canva', 'photoshop'],
    strategy: ['brand', 'storytelling', 'positioning', 'segmentation', 'persona', 'funnel'],
    skills: ['créativité', 'analyse', 'communication', 'négociation', 'gestion projet'],
    soft: ['marketing', 'communication', 'publicité', 'promotion', 'campagne', 'digital']
  }
};

// Analyse avancée des compétences avec correspondances intelligentes
const analyzeKeywordsAdvanced = (cvText: string, jobPosition: JobPosition): {
  score: number;
  matched: string[];
  missing: string[];
  details: any;
} => {
  const cvLower = cvText.toLowerCase();
  const jobCategory = jobPosition.category;
  
  // Récupération des compétences du domaine
  const domainSkills = SKILL_DATABASE[jobCategory as keyof typeof SKILL_DATABASE];
  const allJobKeywords = [
    ...jobPosition.keywords.required,
    ...jobPosition.keywords.preferred,
    ...jobPosition.keywords.technical,
    ...jobPosition.keywords.soft
  ];

  let totalMatches = 0;
  let totalPossible = 0;
  const matched: string[] = [];
  const missing: string[] = [];
  const details: any = {};

  console.log(`[CV Analysis] Analyzing CV for ${jobPosition.title}`);
  console.log(`[CV Analysis] Job keywords:`, allJobKeywords);

  // Analyse des mots-clés du poste
  allJobKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    totalPossible++;
    
    // Recherche directe et avec variations
    const variations = getKeywordVariations(keywordLower);
    const found = variations.some(variation => {
      return cvLower.includes(variation) || 
             hasPartialMatch(cvLower, variation) ||
             hasSynonymMatch(cvLower, variation);
    });
    
    if (found) {
      matched.push(keyword);
      totalMatches++;
      console.log(`[CV Analysis] Found keyword: ${keyword}`);
    } else {
      missing.push(keyword);
      console.log(`[CV Analysis] Missing keyword: ${keyword}`);
    }
  });

  // Analyse des compétences du domaine si disponibles
  if (domainSkills) {
    Object.entries(domainSkills).forEach(([category, skills]) => {
      if (Array.isArray(skills)) {
        const categoryMatches = skills.filter(skill => 
          cvLower.includes(skill.toLowerCase()) ||
          hasPartialMatch(cvLower, skill.toLowerCase())
        );
        details[category] = {
          found: categoryMatches,
          total: skills.length,
          score: categoryMatches.length / skills.length * 100
        };
      }
    });
  }

  // Calcul du score avec pondération intelligente
  let keywordScore = 0;
  
  if (totalPossible > 0) {
    const baseScore = (totalMatches / totalPossible) * 100;
    
    // Bonus pour compétences requises
    const requiredMatched = jobPosition.keywords.required.filter(k => 
      matched.includes(k)
    ).length;
    const requiredTotal = jobPosition.keywords.required.length;
    const requiredBonus = requiredTotal > 0 ? (requiredMatched / requiredTotal) * 30 : 0;
    
    // Bonus pour compétences techniques
    const technicalMatched = jobPosition.keywords.technical.filter(k => 
      matched.includes(k)
    ).length;
    const technicalTotal = jobPosition.keywords.technical.length;
    const technicalBonus = technicalTotal > 0 ? (technicalMatched / technicalTotal) * 20 : 0;
    
    keywordScore = Math.min(100, baseScore + requiredBonus + technicalBonus);
  }

  console.log(`[CV Analysis] Keyword analysis result: ${keywordScore}% (${totalMatches}/${totalPossible} matches)`);

  return {
    score: keywordScore,
    matched: matched.slice(0, 15), // Limite pour l'affichage
    missing: missing.slice(0, 10),
    details
  };
};

// Variations et synonymes améliorés
const getKeywordVariations = (keyword: string): string[] => {
  const variations = [keyword];
  
  // Dictionnaire de synonymes étendu
  const synonymMap: Record<string, string[]> = {
    'javascript': ['js', 'javascript', 'node', 'nodejs', 'ecmascript'],
    'react': ['reactjs', 'react.js', 'react native'],
    'python': ['py', 'python3', 'django', 'flask'],
    'développement': ['dev', 'développeur', 'developer', 'programmation', 'coding'],
    'gestion': ['management', 'pilotage', 'direction', 'coordination'],
    'équipe': ['team', 'groupe', 'collaborateurs', 'collègues'],
    'projet': ['project', 'projets', 'mission', 'missions'],
    'base de données': ['bdd', 'database', 'db', 'sgbd'],
    'intelligence artificielle': ['ia', 'ai', 'machine learning', 'ml', 'deep learning'],
    'expérience': ['exp', 'experience', 'années', 'ans'],
    'anglais': ['english', 'bilingue', 'fluent', 'courant'],
    'communication': ['comm', 'relationnel', 'contact client', 'présentation'],
    'leadership': ['encadrement', 'management', 'direction équipe', 'chef'],
    'analyse': ['analytique', 'études', 'investigation', 'recherche'],
    'créativité': ['créatif', 'innovation', 'imagination', 'originalité']
  };

  if (synonymMap[keyword]) {
    variations.push(...synonymMap[keyword]);
  }

  // Génération de variations automatiques
  if (keyword.length > 4) {
    // Formes plurielles/singulières
    if (keyword.endsWith('s')) {
      variations.push(keyword.slice(0, -1));
    } else {
      variations.push(keyword + 's');
    }
    
    // Formes verbales
    if (keyword.endsWith('er')) {
      variations.push(keyword.replace('er', 'é'));
      variations.push(keyword.replace('er', 'ant'));
    }
  }

  return [...new Set(variations)]; // Supprime les doublons
};

// Correspondance partielle améliorée
const hasPartialMatch = (text: string, keyword: string): boolean => {
  if (keyword.length < 3) return false;
  
  // Recherche de mots-racines
  const words = text.split(/[\s\-_.,;:!?()]+/);
  return words.some(word => {
    if (word.length < 3) return false;
    
    // Correspondance partielle (au moins 80% de similarité)
    const similarity = calculateSimilarity(word, keyword);
    return similarity >= 0.8;
  });
};

// Correspondance par synonymes
const hasSynonymMatch = (text: string, keyword: string): boolean => {
  const contextualSynonyms: Record<string, string[]> = {
    'développeur': ['programmeur', 'codeur', 'ingénieur logiciel', 'software engineer'],
    'manager': ['responsable', 'chef', 'directeur', 'coordinateur'],
    'analyste': ['consultant', 'expert', 'spécialiste', 'conseiller'],
    'designer': ['concepteur', 'créateur', 'graphiste', 'ux designer'],
    'commercial': ['vendeur', 'business developer', 'account manager'],
    'marketing': ['comm', 'promotion', 'publicité', 'brand'],
    'finance': ['comptabilité', 'gestion', 'budget', 'économie'],
    'rh': ['ressources humaines', 'recrutement', 'talents', 'hr']
  };

  const synonyms = contextualSynonyms[keyword] || [];
  return synonyms.some(synonym => text.includes(synonym));
};

// Calcul de similarité de chaînes
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Distance de Levenshtein optimisée
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Analyse d'expérience réaliste
const analyzeExperience = (cvData: { text: string; experience?: string }, jobPosition: JobPosition): number => {
  console.log(`[Experience Analysis] Analyzing experience for ${jobPosition.title}`);
  
  let experienceScore = 40; // Score de base réaliste
  let yearsExp = 0;
  
  // Extraction intelligente des années d'expérience
  if (cvData.experience) {
    const expMatch = cvData.experience.match(/(\d+)/);
    yearsExp = expMatch ? parseInt(expMatch[0]) : 0;
  } else {
    // Tentative d'extraction depuis le texte
    const experiencePatterns = [
      /(\d+)\s*ans?\s*d[''']expérience/gi,
      /(\d+)\s*années?\s*d[''']expérience/gi,
      /expérience\s*:\s*(\d+)\s*ans?/gi,
      /(\d+)\s*years?\s*experience/gi
    ];
    
    for (const pattern of experiencePatterns) {
      const match = cvData.text.match(pattern);
      if (match) {
        yearsExp = Math.max(yearsExp, parseInt(match[1]));
      }
    }
  }
  
  console.log(`[Experience Analysis] Detected ${yearsExp} years of experience`);
  console.log(`[Experience Analysis] Job requires min: ${jobPosition.experience.min}, preferred: ${jobPosition.experience.preferred}`);
  
  // Calcul du score basé sur l'expérience
  if (yearsExp >= jobPosition.experience.preferred) {
    experienceScore = 85 + Math.min(15, (yearsExp - jobPosition.experience.preferred) * 2);
  } else if (yearsExp >= jobPosition.experience.min) {
    const ratio = (yearsExp - jobPosition.experience.min) / 
      Math.max(1, jobPosition.experience.preferred - jobPosition.experience.min);
    experienceScore = 60 + (ratio * 25);
  } else if (yearsExp > 0) {
    experienceScore = Math.max(20, (yearsExp / Math.max(1, jobPosition.experience.min)) * 50);
  }
  
  // Bonus pour expérience pertinente mentionnée
  const relevantExperienceKeywords = [
    jobPosition.category,
    ...jobPosition.keywords.required.slice(0, 3),
    'senior', 'lead', 'expert', 'spécialisé'
  ];
  
  const relevantBonus = relevantExperienceKeywords.filter(keyword => 
    cvData.text.toLowerCase().includes(keyword.toLowerCase())
  ).length * 3;
  
  experienceScore = Math.min(100, experienceScore + relevantBonus);
  
  console.log(`[Experience Analysis] Final experience score: ${experienceScore}%`);
  return experienceScore;
};

// Analyse d'éducation contextuelle
const analyzeEducation = (cvData: { education?: string; text: string }, jobPosition: JobPosition): number => {
  console.log(`[Education Analysis] Analyzing education for ${jobPosition.title}`);
  
  if (!cvData.education && !cvData.text) return 30;
  
  const educationText = (cvData.education || '').toLowerCase() + ' ' + cvData.text.toLowerCase();
  
  // Vérification des formations requises exactes
  const exactMatches = jobPosition.education.filter(edu => 
    educationText.includes(edu.toLowerCase())
  );
  
  if (exactMatches.length > 0) {
    console.log(`[Education Analysis] Found exact education match: ${exactMatches[0]}`);
    return 90 + (exactMatches.length > 1 ? 5 : 0);
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
    }
  });
  
  // Analyse de la pertinence du domaine
  const domainRelevanceScore = analyzEducationDomainRelevance(educationText, jobPosition.category);
  
  // Score final pondéré
  const finalScore = (levelScore * 0.6) + (domainRelevanceScore * 0.4);
  
  console.log(`[Education Analysis] Level score: ${levelScore}, Domain relevance: ${domainRelevanceScore}, Final: ${finalScore}`);
  return Math.round(finalScore);
};

// Analyse de pertinence du domaine d'éducation
const analyzEducationDomainRelevance = (education: string, jobCategory: string): number => {
  const domainKeywords = {
    'tech': ['informatique', 'computer science', 'ingénieur logiciel', 'développement', 'numérique', 'programmation', 'algorithme', 'data'],
    'healthcare': ['médecine', 'santé', 'infirmier', 'médical', 'pharmacie', 'kinésithérapie', 'sage-femme', 'biologie'],
    'engineering': ['ingénieur', 'mécanique', 'électrique', 'industriel', 'génie', 'technique', 'automatisme', 'production'],
    'finance': ['finance', 'comptabilité', 'gestion', 'économie', 'banque', 'audit', 'contrôle de gestion', 'mathématiques'],
    'marketing': ['marketing', 'communication', 'commerce', 'gestion', 'business', 'publicité', 'digital', 'média'],
    'design': ['design', 'art', 'créatif', 'graphisme', 'architecture', 'esthétique', 'multimédia', 'ergonomie'],
    'sales': ['commerce', 'vente', 'business', 'gestion', 'marketing', 'négociation', 'relation client'],
    'hr': ['ressources humaines', 'psychologie', 'gestion', 'droit social', 'management', 'formation'],
    'management': ['gestion', 'management', 'business', 'administration', 'commerce', 'stratégie', 'leadership']
  };
  
  const relevantKeywords = domainKeywords[jobCategory as keyof typeof domainKeywords] || [];
  const matches = relevantKeywords.filter(keyword => education.includes(keyword.toLowerCase()));
  
  if (matches.length === 0) {
    // Vérification d'incompatibilités majeures
    const incompatibleDomains = {
      'tech': ['médecine', 'santé', 'médical', 'infirmier'],
      'healthcare': ['informatique', 'ingénieur logiciel', 'programmation', 'développement'],
      'engineering': ['médecine', 'santé', 'communication', 'publicité'],
      'finance': ['médecine', 'santé', 'art', 'design'],
      'marketing': ['médecine', 'santé', 'ingénieur mécanique'],
      'design': ['médecine', 'santé', 'comptabilité'],
      'sales': ['médecine', 'santé'],
      'hr': ['médecine', 'santé', 'ingénieur mécanique'],
      'management': []
    };
    
    const incompatibleKeywords = incompatibleDomains[jobCategory as keyof typeof incompatibleDomains] || [];
    const incompatibleMatches = incompatibleKeywords.filter(keyword => education.includes(keyword));
    
    if (incompatibleMatches.length > 0) {
      return 15; // Forte incompatibilité
    }
    
    return 50; // Neutre - formation généraliste
  }
  
  // Score basé sur le nombre de correspondances
  const baseScore = (matches.length / relevantKeywords.length) * 80 + 20;
  return Math.min(100, baseScore);
};

// Génération de profils CV simulés réalistes
const generateRealisticCVProfile = (fileName: string, jobPosition: JobPosition) => {
  console.log(`[CV Generation] Generating realistic CV for ${fileName} applying to ${jobPosition.title}`);
  
  const profileType = determineProfileType(fileName);
  const compatibility = calculateProfileJobCompatibility(profileType, jobPosition.category);
  
  console.log(`[CV Generation] Detected profile type: ${profileType}, compatibility: ${compatibility.level}`);
  
  let cvText = '';
  let experience = `${Math.floor(Math.random() * 8) + 2} ans`;
  let education = '';
  let certifications: string[] = [];
  
  // Génération basée sur la compatibilité
  if (compatibility.level === 'high') {
    // Profil très compatible
    const coreSkills = jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.8));
    const preferredSkills = jobPosition.keywords.preferred.slice(0, Math.floor(jobPosition.keywords.preferred.length * 0.6));
    const technicalSkills = jobPosition.keywords.technical.slice(0, Math.floor(jobPosition.keywords.technical.length * 0.7));
    
    cvText = [...coreSkills, ...preferredSkills, ...technicalSkills].join(' ').toLowerCase();
    education = jobPosition.education[0] || getEducationForProfile(profileType || 'generic');
    
    if (jobPosition.certifications && jobPosition.certifications.length > 0) {
      certifications = [jobPosition.certifications[0]];
    }
    
    // Ajouter des compétences du domaine du profil
    if (profileType && SKILL_DATABASE[profileType as keyof typeof SKILL_DATABASE]) {
      const domainSkills = SKILL_DATABASE[profileType as keyof typeof SKILL_DATABASE];
      const additionalSkills: string[] = [];
      
      Object.values(domainSkills).forEach(skillArray => {
        if (Array.isArray(skillArray)) {
          additionalSkills.push(...skillArray.slice(0, 5));
        }
      });
      
      cvText += ' ' + additionalSkills.join(' ').toLowerCase();
    }
    
  } else if (compatibility.level === 'medium') {
    // Profil moyennement compatible
    const someSkills = jobPosition.keywords.required.slice(0, Math.floor(jobPosition.keywords.required.length * 0.4));
    const fewPreferred = jobPosition.keywords.preferred.slice(0, Math.floor(jobPosition.keywords.preferred.length * 0.2));
    
    cvText = [...someSkills, ...fewPreferred].join(' ').toLowerCase();
    education = getEducationForProfile(profileType || 'generic');
    
    // Ajouter quelques compétences du profil original
    if (profileType && SKILL_DATABASE[profileType as keyof typeof SKILL_DATABASE]) {
      const domainSkills = SKILL_DATABASE[profileType as keyof typeof SKILL_DATABASE];
      const mixedSkills: string[] = [];
      
      Object.values(domainSkills).forEach(skillArray => {
        if (Array.isArray(skillArray)) {
          mixedSkills.push(...skillArray.slice(0, 3));
        }
      });
      
      cvText += ' ' + mixedSkills.join(' ').toLowerCase();
    }
    
  } else {
    // Profil incompatible
    if (profileType && SKILL_DATABASE[profileType as keyof typeof SKILL_DATABASE]) {
      const domainSkills = SKILL_DATABASE[profileType as keyof typeof SKILL_DATABASE];
      const profileSkills: string[] = [];
      
      Object.values(domainSkills).forEach(skillArray => {
        if (Array.isArray(skillArray)) {
          profileSkills.push(...skillArray.slice(0, 8));
        }
      });
      
      cvText = profileSkills.join(' ').toLowerCase();
    }
    
    // Très peu de compétences communes
    const minimalSkills = jobPosition.keywords.required.slice(0, 1);
    cvText += ' ' + minimalSkills.join(' ').toLowerCase();
    education = getEducationForProfile(profileType || 'generic');
  }
  
  return {
    text: cvText,
    experience,
    education,
    certifications
  };
};

// Détermine le type de profil basé sur le nom de fichier
const determineProfileType = (fileName: string): string | null => {
  const nameLower = fileName.toLowerCase();
  
  const profilePatterns = {
    'tech': ['dev', 'tech', 'informatique', 'programmeur', 'software', 'web', 'full-stack', 'frontend', 'backend'],
    'engineering': ['ingenieur', 'engineer', 'technique', 'mecanique', 'industriel', 'automatisme'],
    'healthcare': ['infirmier', 'medic', 'sante', 'soignant', 'hospital', 'clinique'],
    'finance': ['finance', 'compta', 'audit', 'comptable', 'banque', 'financial'],
    'marketing': ['market', 'comm', 'pub', 'digital', 'brand', 'social'],
    'design': ['design', 'ux', 'ui', 'graph', 'creatif', 'artist'],
    'sales': ['commercial', 'vente', 'sales', 'business-dev'],
    'hr': ['rh', 'hr', 'recrutement', 'ressources-humaines'],
    'management': ['manager', 'chef', 'directeur', 'lead', 'responsable']
  };
  
  for (const [type, patterns] of Object.entries(profilePatterns)) {
    if (patterns.some(pattern => nameLower.includes(pattern))) {
      return type;
    }
  }
  
  return null;
};

// Calcule la compatibilité entre un profil et un type de poste
const calculateProfileJobCompatibility = (profileType: string | null, jobCategory: string): {
  level: 'high' | 'medium' | 'low';
  score: number;
} => {
  if (!profileType) {
    return { level: 'medium', score: 50 };
  }
  
  // Matrice de compatibilité
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    'tech': { 'tech': 95, 'engineering': 40, 'management': 30, 'marketing': 25, 'finance': 20, 'design': 35, 'sales': 15, 'hr': 15, 'healthcare': 5 },
    'engineering': { 'engineering': 95, 'tech': 45, 'management': 35, 'finance': 25, 'marketing': 20, 'design': 20, 'sales': 15, 'hr': 15, 'healthcare': 8 },
    'healthcare': { 'healthcare': 95, 'management': 25, 'hr': 20, 'tech': 5, 'engineering': 5, 'finance': 5, 'marketing': 5, 'design': 5, 'sales': 5 },
    'finance': { 'finance': 95, 'management': 40, 'tech': 25, 'engineering': 25, 'marketing': 30, 'sales': 25, 'hr': 20, 'design': 15, 'healthcare': 5 },
    'marketing': { 'marketing': 95, 'sales': 50, 'design': 45, 'management': 35, 'tech': 25, 'finance': 20, 'hr': 25, 'engineering': 15, 'healthcare': 5 },
    'design': { 'design': 95, 'marketing': 45, 'tech': 35, 'management': 25, 'sales': 20, 'finance': 15, 'hr': 15, 'engineering': 15, 'healthcare': 5 },
    'sales': { 'sales': 95, 'marketing': 50, 'management': 40, 'finance': 25, 'hr': 20, 'tech': 15, 'design': 15, 'engineering': 10, 'healthcare': 5 },
    'hr': { 'hr': 95, 'management': 45, 'sales': 25, 'marketing': 25, 'finance': 20, 'tech': 15, 'design': 15, 'engineering': 10, 'healthcare': 10 },
    'management': { 'management': 95, 'finance': 45, 'sales': 40, 'marketing': 35, 'hr': 40, 'tech': 30, 'engineering': 35, 'design': 25, 'healthcare': 20 }
  };
  
  const score = compatibilityMatrix[profileType]?.[jobCategory] || 30;
  
  let level: 'high' | 'medium' | 'low';
  if (score >= 80) level = 'high';
  else if (score >= 40) level = 'medium';
  else level = 'low';
  
  return { level, score };
};

// Retourne une formation appropriée pour le type de profil
const getEducationForProfile = (profileType: string): string => {
  const educationMap = {
    'tech': 'Master Informatique',
    'engineering': 'École d\'ingénieur',
    'healthcare': 'Diplôme d\'État Infirmier',
    'finance': 'Master Finance',
    'marketing': 'Master Marketing et Communication',
    'design': 'École de Design',
    'sales': 'École de Commerce',
    'hr': 'Master Ressources Humaines',
    'management': 'Master Management',
    'generic': 'Master'
  };
  
  return educationMap[profileType as keyof typeof educationMap] || 'Master';
};

// Fonction principale de calcul du score CV
export const calculateCVScore = (
  jobPosition: JobPosition,
  cvData: {
    text: string;
    experience?: string;
    education?: string;
    certifications?: string[];
  }
): AnalysisResult => {
  console.log(`[CV Score] Starting analysis for ${jobPosition.title}`);
  
  // Analyse des mots-clés avancée
  const keywordAnalysis = analyzeKeywordsAdvanced(cvData.text, jobPosition);
  
  // Analyse de l'expérience
  const experienceScore = analyzeExperience(cvData, jobPosition);
  
  // Analyse de l'éducation
  const educationScore = analyzeEducation(cvData, jobPosition);
  
  // Score des certifications
  let certificationScore = 50;
  if (jobPosition.certifications && jobPosition.certifications.length > 0) {
    if (cvData.certifications && cvData.certifications.length > 0) {
      const matchingCerts = jobPosition.certifications.filter(cert =>
        cvData.certifications!.some(cvCert => 
          cvCert.toLowerCase().includes(cert.toLowerCase())
        )
      );
      certificationScore = Math.min(100, (matchingCerts.length / jobPosition.certifications.length) * 80 + 40);
    } else {
      certificationScore = 30;
    }
  }
  
  // Analyses contextuelles
  const profileCoherence = analyzeProfileCoherence(cvData.text, jobPosition);
  const sectorRelevance = analyzeSectorRelevance(cvData.text, jobPosition);
  
  // Calcul du score final pondéré
  const weightedScore = (
    keywordAnalysis.score * jobPosition.scoreWeights.keywords +
    experienceScore * jobPosition.scoreWeights.experience +
    educationScore * jobPosition.scoreWeights.education +
    certificationScore * jobPosition.scoreWeights.certifications
  );
  
  // Ajustements contextuels
  let finalScore = weightedScore;
  
  // Bonus/malus basé sur la cohérence
  if (profileCoherence > 80) {
    finalScore += 8;
  } else if (profileCoherence < 30) {
    finalScore -= 20;
  }
  
  // Bonus/malus basé sur la pertinence sectorielle
  if (sectorRelevance > 70) {
    finalScore += 5;
  } else if (sectorRelevance < 25) {
    finalScore -= 15;
  }
  
  finalScore = Math.max(5, Math.min(100, finalScore));
  
  // Génération des alertes
  const warningFlags = generateWarningFlags(keywordAnalysis.score, experienceScore, educationScore, profileCoherence, sectorRelevance);
  
  // Niveau de confiance
  const confidenceLevel = calculateConfidenceLevel(keywordAnalysis.score, experienceScore, educationScore, warningFlags.length);
  
  // Génération des forces et améliorations
  const { strengths, improvements } = generateFeedback(
    keywordAnalysis.score, experienceScore, educationScore, 
    profileCoherence, sectorRelevance, keywordAnalysis.matched, keywordAnalysis.missing
  );
  
  console.log(`[CV Score] Final score: ${Math.round(finalScore)}% for ${jobPosition.title}`);
  
  return {
    score: Math.round(finalScore),
    matchedKeywords: keywordAnalysis.matched,
    missingKeywords: keywordAnalysis.missing,
    strengths,
    improvements,
    experienceMatch: Math.round(experienceScore),
    educationMatch: Math.round(educationScore),
    profileCoherence: Math.round(profileCoherence),
    sectorRelevance: Math.round(sectorRelevance),
    breakdown: {
      keywordScore: Math.round(keywordAnalysis.score),
      experienceScore: Math.round(experienceScore),
      educationScore: Math.round(educationScore),
      certificationScore: Math.round(certificationScore),
      coherenceScore: Math.round(profileCoherence),
      sectorScore: Math.round(sectorRelevance)
    },
    warningFlags,
    confidenceLevel
  };
};

// Analyse de cohérence du profil
const analyzeProfileCoherence = (cvText: string, jobPosition: JobPosition): number => {
  const profileType = determineProfileType(cvText);
  const compatibility = calculateProfileJobCompatibility(profileType, jobPosition.category);
  
  return Math.min(100, compatibility.score + 10);
};

// Analyse de pertinence sectorielle
const analyzeSectorRelevance = (cvText: string, jobPosition: JobPosition): number => {
  const sectorKeywords = {
    'tech': ['startup', 'scale-up', 'éditeur logiciel', 'tech', 'digital', 'numérique', 'saas', 'fintech'],
    'healthcare': ['hôpital', 'clinique', 'chu', 'ehpad', 'centre de soins', 'pharmacie', 'laboratoire'],
    'engineering': ['industrie', 'manufacture', 'bureau d\'études', 'r&d', 'production', 'usine'],
    'finance': ['banque', 'assurance', 'cabinet comptable', 'audit', 'finance', 'investment'],
    'marketing': ['agence', 'communication', 'média', 'publicité', 'événementiel'],
    'design': ['studio', 'agence créative', 'design', 'architecture'],
    'sales': ['commercial', 'distribution', 'retail', 'business development'],
    'hr': ['cabinet rh', 'recrutement', 'conseil rh', 'formation'],
    'management': ['conseil', 'stratégie', 'transformation', 'management']
  };
  
  const jobSectorKeywords = sectorKeywords[jobPosition.category as keyof typeof sectorKeywords] || [];
  const matches = jobSectorKeywords.filter(keyword => 
    cvText.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  return Math.min(100, (matches / Math.max(1, jobSectorKeywords.length)) * 80 + 20);
};

// Génération des alertes
const generateWarningFlags = (
  keywordScore: number, 
  experienceScore: number, 
  educationScore: number, 
  coherenceScore: number, 
  sectorScore: number
): string[] => {
  const warnings: string[] = [];
  
  if (coherenceScore < 25) warnings.push("Profil inadapté au domaine");
  if (keywordScore < 30) warnings.push("Compétences techniques insuffisantes");
  if (experienceScore < 35) warnings.push("Expérience insuffisante");
  if (educationScore < 40) warnings.push("Formation non alignée");
  if (sectorScore < 20) warnings.push("Aucune expérience sectorielle");
  
  return warnings;
};

// Calcul du niveau de confiance
const calculateConfidenceLevel = (
  keywordScore: number, 
  experienceScore: number, 
  educationScore: number, 
  warningCount: number
): 'high' | 'medium' | 'low' => {
  const avgScore = (keywordScore + experienceScore + educationScore) / 3;
  
  if (warningCount >= 3 || avgScore < 35) return 'low';
  if (warningCount >= 1 || avgScore < 65) return 'medium';
  return 'high';
};

// Génération du feedback
const generateFeedback = (
  keywordScore: number,
  experienceScore: number,
  educationScore: number,
  coherenceScore: number,
  sectorScore: number,
  matchedKeywords: string[],
  missingKeywords: string[]
): { strengths: string[]; improvements: string[] } => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  // Forces
  if (keywordScore > 70) strengths.push("Excellentes compétences techniques identifiées");
  if (experienceScore > 75) strengths.push("Expérience très adaptée au poste");
  if (educationScore > 80) strengths.push("Formation parfaitement alignée");
  if (coherenceScore > 75) strengths.push("Profil très cohérent avec le domaine");
  if (sectorScore > 70) strengths.push("Bonne connaissance du secteur");
  if (matchedKeywords.length > 10) strengths.push("Large éventail de compétences pertinentes");
  
  // Améliorations
  if (keywordScore < 50) improvements.push("Développer les compétences techniques spécifiques");
  if (experienceScore < 50) improvements.push("Acquérir plus d'expérience dans le domaine");
  if (educationScore < 60) improvements.push("Formation complémentaire recommandée");
  if (coherenceScore < 50) improvements.push("Repositionner le CV vers le domaine ciblé");
  if (sectorScore < 40) improvements.push("Acquérir une expérience sectorielle");
  if (missingKeywords.length > 8) improvements.push("Développer les compétences manquantes clés");
  
  return { strengths, improvements };
};

// Fonction de simulation avec le nouveau système
export const simulateDetailedAnalysis = (
  fileName: string,
  jobPositionId: string
): AnalysisResult & { fileName: string } => {
  const jobPosition = getJobPositionById(jobPositionId);
  if (!jobPosition) {
    throw new Error("Position not found");
  }

  console.log(`[Simulation] Starting detailed analysis for ${fileName} on ${jobPosition.title}`);
  
  const mockCvData = generateRealisticCVProfile(fileName, jobPosition);
  const result = calculateCVScore(jobPosition, mockCvData);
  
  console.log(`[Simulation] Analysis complete. Score: ${result.score}%`);
  
  return {
    ...result,
    fileName
  };
};

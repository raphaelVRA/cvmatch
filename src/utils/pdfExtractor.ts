
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

// Configuration du worker PDF.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ExtractedCVData {
  text: string;
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
    creator?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  extractedInfo: {
    email?: string;
    phone?: string;
    name?: string;
    skills: string[];
    experience: string[];
    education: string[];
    certifications: string[];
    languages: string[];
  };
}

export const extractTextFromPDF = async (file: File): Promise<ExtractedCVData> => {
  try {
    console.log(`[PDF Extractor] Starting extraction for ${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    console.log(`[PDF Extractor] PDF loaded, ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extraction du texte de toutes les pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    console.log(`[PDF Extractor] Text extracted, ${fullText.length} characters`);
    
    // Extraction des métadonnées
    const metadata = await pdf.getMetadata();
    
    // Analyse et extraction d'informations structurées
    const extractedInfo = extractStructuredInfo(fullText);
    
    return {
      text: fullText,
      metadata: {
        pageCount: pdf.numPages,
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        creator: metadata.info?.Creator,
        subject: metadata.info?.Subject,
        keywords: metadata.info?.Keywords,
        creationDate: metadata.info?.CreationDate,
        modificationDate: metadata.info?.ModDate,
      },
      extractedInfo
    };
    
  } catch (error) {
    console.error('[PDF Extractor] Error extracting PDF:', error);
    throw new Error(`Erreur lors de l'extraction du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

const extractStructuredInfo = (text: string): ExtractedCVData['extractedInfo'] => {
  console.log('[PDF Extractor] Extracting structured information');
  
  const lowerText = text.toLowerCase();
  
  // Extraction de l'email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  const email = emailMatches?.[0];
  
  // Extraction du téléphone
  const phoneRegex = /(?:\+33|0)[1-9](?:[.\-\s]?\d{2}){4}/g;
  const phoneMatches = text.match(phoneRegex);
  const phone = phoneMatches?.[0];
  
  // Extraction du nom (approximatif - première ligne souvent)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const name = lines[0]?.trim();
  
  // Extraction des compétences techniques
  const skills = extractSkills(text);
  
  // Extraction de l'expérience
  const experience = extractExperience(text);
  
  // Extraction de l'éducation
  const education = extractEducation(text);
  
  // Extraction des certifications
  const certifications = extractCertifications(text);
  
  // Extraction des langues
  const languages = extractLanguages(text);
  
  console.log('[PDF Extractor] Structured information extracted', {
    email,
    phone,
    name,
    skillsCount: skills.length,
    experienceCount: experience.length,
    educationCount: education.length,
    certificationsCount: certifications.length,
    languagesCount: languages.length
  });
  
  return {
    email,
    phone,
    name,
    skills,
    experience,
    education,
    certifications,
    languages
  };
};

const extractSkills = (text: string): string[] => {
  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Compétences techniques communes
  const technicalSkills = [
    // Langages de programmation
    'javascript', 'js', 'typescript', 'python', 'java', 'c#', 'c++', 'c', 'php', 'ruby', 'go', 'rust', 'scala', 'kotlin', 'swift',
    // Frameworks
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'next.js', 'nuxt', 'svelte',
    // Bases de données
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite', 'cassandra',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'terraform',
    // Outils
    'git', 'jira', 'confluence', 'postman', 'webpack', 'babel', 'npm', 'yarn',
    // Web
    'html', 'css', 'sass', 'scss', 'less', 'bootstrap', 'tailwind',
    // Data & AI
    'pandas', 'numpy', 'matplotlib', 'scikit-learn', 'tensorflow', 'pytorch', 'jupyter', 'r', 'matlab',
    // Mobile
    'react native', 'flutter', 'ionic', 'xamarin',
    // Autres
    'linux', 'windows', 'macos', 'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum'
  ];
  
  technicalSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  });
  
  // Recherche de patterns de compétences
  const skillPatterns = [
    /compétences?\s*[:\-]?\s*([^.]+)/gi,
    /technologies?\s*[:\-]?\s*([^.]+)/gi,
    /outils?\s*[:\-]?\s*([^.]+)/gi,
    /langages?\s*[:\-]?\s*([^.]+)/gi,
    /frameworks?\s*[:\-]?\s*([^.]+)/gi
  ];
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const skillText = match.split(':')[1]?.trim();
        if (skillText) {
          const extractedSkills = skillText.split(/[,;\/\|]/).map(s => s.trim()).filter(s => s.length > 1);
          skills.push(...extractedSkills);
        }
      });
    }
  });
  
  return [...new Set(skills)]; // Supprime les doublons
};

const extractExperience = (text: string): string[] => {
  const experience: string[] = [];
  const lines = text.split('\n');
  
  // Recherche de sections d'expérience
  const experienceKeywords = ['expérience', 'experience', 'professionnel', 'emploi', 'poste', 'travail'];
  
  let inExperienceSection = false;
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // Détection du début d'une section expérience
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      return;
    }
    
    // Détection de la fin d'une section (nouvelle section)
    if (inExperienceSection && (
      lowerLine.includes('formation') || 
      lowerLine.includes('éducation') || 
      lowerLine.includes('compétence') ||
      lowerLine.includes('certification')
    )) {
      inExperienceSection = false;
      return;
    }
    
    // Extraction des expériences dans la section
    if (inExperienceSection && line.trim().length > 10) {
      // Recherche de patterns de dates
      const datePattern = /\b(20\d{2}|19\d{2})\b/;
      if (datePattern.test(line) || index < lines.length - 1 && datePattern.test(lines[index + 1])) {
        experience.push(line.trim());
      }
    }
  });
  
  return experience;
};

const extractEducation = (text: string): string[] => {
  const education: string[] = [];
  const lines = text.split('\n');
  
  // Mots-clés de formation
  const educationKeywords = ['formation', 'éducation', 'diplôme', 'université', 'école', 'master', 'licence', 'bts', 'dut'];
  
  let inEducationSection = false;
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // Détection du début d'une section formation
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      inEducationSection = true;
      if (line.trim().length > 10) {
        education.push(line.trim());
      }
      return;
    }
    
    // Détection de la fin d'une section
    if (inEducationSection && (
      lowerLine.includes('expérience') || 
      lowerLine.includes('compétence') ||
      lowerLine.includes('certification')
    )) {
      inEducationSection = false;
      return;
    }
    
    // Extraction des formations dans la section
    if (inEducationSection && line.trim().length > 5) {
      education.push(line.trim());
    }
  });
  
  return education;
};

const extractCertifications = (text: string): string[] => {
  const certifications: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Certifications communes
  const commonCertifications = [
    'aws certified', 'azure certified', 'gcp certified', 'google cloud',
    'scrum master', 'product owner', 'pmp', 'itil',
    'cisco', 'microsoft certified', 'oracle certified',
    'comptia', 'cissp', 'ceh', 'cisa', 'cism',
    'toeic', 'toefl', 'ielts', 'bulats'
  ];
  
  commonCertifications.forEach(cert => {
    if (lowerText.includes(cert)) {
      certifications.push(cert);
    }
  });
  
  // Recherche de patterns de certification
  const certPatterns = [
    /certification\s*[:\-]?\s*([^.]+)/gi,
    /certifié\s*[:\-]?\s*([^.]+)/gi,
    /diplôme\s*[:\-]?\s*([^.]+)/gi
  ];
  
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const certText = match.split(':')[1]?.trim();
        if (certText) {
          certifications.push(certText);
        }
      });
    }
  });
  
  return [...new Set(certifications)];
};

const extractLanguages = (text: string): string[] => {
  const languages: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Langues communes
  const commonLanguages = [
    'français', 'francais', 'french',
    'anglais', 'english',
    'espagnol', 'spanish', 'español',
    'allemand', 'german', 'deutsch',
    'italien', 'italian', 'italiano',
    'portugais', 'portuguese',
    'chinois', 'chinese', 'mandarin',
    'japonais', 'japanese',
    'arabe', 'arabic',
    'russe', 'russian'
  ];
  
  commonLanguages.forEach(lang => {
    if (lowerText.includes(lang)) {
      languages.push(lang);
    }
  });
  
  // Recherche de patterns de langues
  const langPatterns = [
    /langues?\s*[:\-]?\s*([^.]+)/gi,
    /languages?\s*[:\-]?\s*([^.]+)/gi
  ];
  
  langPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const langText = match.split(':')[1]?.trim();
        if (langText) {
          const extractedLangs = langText.split(/[,;\/\|]/).map(s => s.trim()).filter(s => s.length > 1);
          languages.push(...extractedLangs);
        }
      });
    }
  });
  
  return [...new Set(languages)];
};

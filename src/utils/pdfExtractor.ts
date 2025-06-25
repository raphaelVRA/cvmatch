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

// Interface pour typer les métadonnées PDF
interface PDFMetadataInfo {
  Title?: string;
  Author?: string;
  Creator?: string;
  Subject?: string;
  Keywords?: string;
  CreationDate?: Date;
  ModDate?: Date;
}

export const extractTextFromPDF = async (file: File): Promise<ExtractedCVData> => {
  try {
    console.log(`[PDF Extractor] Starting extraction for ${file.name}`);
    
    // Import dynamique de pdfjs-dist pour éviter les problèmes de worker
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configuration du worker pour Vite
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
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
    console.log(`[PDF Extractor] First 500 chars:`, fullText.substring(0, 500));
    
    // Extraction des métadonnées avec typage approprié
    const metadata = await pdf.getMetadata();
    const metadataInfo = metadata.info as PDFMetadataInfo;
    
    // Analyse et extraction d'informations structurées
    const extractedInfo = extractStructuredInfo(fullText);
    
    return {
      text: fullText,
      metadata: {
        pageCount: pdf.numPages,
        title: metadataInfo?.Title,
        author: metadataInfo?.Author,
        creator: metadataInfo?.Creator,
        subject: metadataInfo?.Subject,
        keywords: metadataInfo?.Keywords,
        creationDate: metadataInfo?.CreationDate,
        modificationDate: metadataInfo?.ModDate,
      },
      extractedInfo
    };
    
  } catch (error) {
    console.error('[PDF Extractor] Error extracting PDF:', error);
    throw new Error(`Erreur lors de l'extraction du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

const extractStructuredInfo = (text: string): ExtractedCVData['extractedInfo'] => {
  console.log('[PDF Extractor] Extracting structured information from text:', text.substring(0, 200) + '...');
  
  const lowerText = text.toLowerCase();
  
  // Extraction de l'email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  const email = emailMatches?.[0];
  
  // Extraction du téléphone français
  const phoneRegex = /(?:\+33|0)[1-9](?:[.\-\s]?\d{2}){4}/g;
  const phoneMatches = text.match(phoneRegex);
  const phone = phoneMatches?.[0];
  
  // Extraction du nom (approximatif - première ligne souvent)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const name = lines[0]?.trim();
  
  // Extraction des compétences techniques avec méthode améliorée
  const skills = extractSkills(text);
  
  // Extraction de l'expérience
  const experience = extractExperience(text);
  
  // Extraction de l'éducation
  const education = extractEducation(text);
  
  // Extraction des certifications
  const certifications = extractCertifications(text);
  
  // Extraction des langues
  const languages = extractLanguages(text);
  
  console.log('[PDF Extractor] Structured information extracted:', {
    email,
    phone,
    name,
    skillsCount: skills.length,
    skills: skills,
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
  
  // Base de données étendue de compétences techniques
  const technicalSkillsDatabase = {
    // Langages de programmation
    programming: [
      'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c#', 'csharp', 'c++', 'cpp', 
      'c', 'php', 'ruby', 'go', 'golang', 'rust', 'scala', 'kotlin', 'swift', 'dart',
      'r', 'matlab', 'perl', 'shell', 'bash', 'powershell', 'sql', 'plsql', 'nosql'
    ],
    
    // Frameworks et bibliothèques
    frameworks: [
      'react', 'reactjs', 'angular', 'angularjs', 'vue', 'vuejs', 'svelte', 'next.js', 'nextjs',
      'nuxt', 'nuxtjs', 'node.js', 'nodejs', 'express', 'expressjs', 'fastapi', 'flask',
      'django', 'spring', 'springboot', 'laravel', 'symfony', 'codeigniter', 'rails',
      'asp.net', 'dotnet', '.net', 'blazor', 'xamarin', 'flutter', 'react native',
      'ionic', 'cordova', 'phonegap'
    ],
    
    // Bases de données
    databases: [
      'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'elastic',
      'oracle', 'sqlite', 'cassandra', 'neo4j', 'dynamodb', 'firebase', 'firestore',
      'mariadb', 'sqlserver', 'mssql'
    ],
    
    // Cloud et DevOps
    cloud: [
      'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
      'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab', 'github', 'bitbucket',
      'terraform', 'ansible', 'chef', 'puppet', 'vagrant', 'helm', 'prometheus',
      'grafana', 'elastic stack', 'elk', 'nginx', 'apache', 'traefik'
    ],
    
    // Outils de développement
    tools: [
      'git', 'svn', 'mercurial', 'jira', 'confluence', 'trello', 'asana', 'notion',
      'postman', 'insomnia', 'swagger', 'openapi', 'webpack', 'vite', 'rollup',
      'babel', 'eslint', 'prettier', 'jest', 'cypress', 'selenium', 'junit',
      'npm', 'yarn', 'pip', 'composer', 'maven', 'gradle'
    ],
    
    // Technologies web
    web: [
      'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'stylus', 'bootstrap',
      'tailwind', 'tailwindcss', 'material-ui', 'mui', 'chakra-ui', 'ant design',
      'bulma', 'foundation', 'semantic-ui', 'jquery', 'lodash', 'underscore',
      'webpack', 'parcel', 'gulp', 'grunt'
    ],
    
    // Data Science et IA
    datascience: [
      'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly', 'scikit-learn', 'sklearn',
      'tensorflow', 'keras', 'pytorch', 'opencv', 'nltk', 'spacy', 'jupyter',
      'anaconda', 'tableau', 'power bi', 'qlik', 'apache spark', 'hadoop',
      'airflow', 'luigi', 'dask', 'rapids'
    ],
    
    // Systèmes et réseaux
    systems: [
      'linux', 'ubuntu', 'centos', 'redhat', 'debian', 'windows', 'macos',
      'unix', 'freebsd', 'cisco', 'packet tracer', 'wireshark', 'tcp/ip',
      'http', 'https', 'rest', 'graphql', 'soap', 'grpc', 'websocket',
      'microservices', 'soa', 'api'
    ],
    
    // Méthodologies
    methodologies: [
      'agile', 'scrum', 'kanban', 'lean', 'devops', 'ci/cd', 'continuous integration',
      'continuous deployment', 'tdd', 'bdd', 'pair programming', 'code review',
      'design patterns', 'solid', 'clean code', 'clean architecture'
    ],
    
    // Électronique et embarqué
    embedded: [
      'stm32', 'arduino', 'raspberry pi', 'fpga', 'vhdl', 'verilog', 'embedded linux',
      'real-time', 'rtos', 'freertos', 'arm', 'cortex', 'pic', 'avr', 'esp32',
      'iot', 'mqtt', 'can', 'spi', 'i2c', 'uart', 'pwm', 'adc', 'dac'
    ]
  };
  
  // Recherche de toutes les compétences dans le texte
  Object.values(technicalSkillsDatabase).flat().forEach(skill => {
    const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (skillRegex.test(text)) {
      skills.push(skill);
    }
  });
  
  // Recherche de patterns de compétences avec regex améliorées
  const skillPatterns = [
    /(?:compétences?|technologies?|outils?|langages?|frameworks?)\s*[:\-–]?\s*([^.\n]+)/gi,
    /(?:maîtrise|connaissance|expérience)\s+(?:de|en|avec)\s+([^,.\n]+)/gi,
    /(?:programmation|développement)\s+[:\-–]?\s*([^.\n]+)/gi
  ];
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const skillText = match.split(/[:–\-]/)[1]?.trim();
        if (skillText) {
          const extractedSkills = skillText
            .split(/[,;\/\|&\n]/)
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 1 && s.length < 30);
          skills.push(...extractedSkills);
        }
      });
    }
  });
  
  // Nettoyage et déduplication
  const cleanedSkills = [...new Set(skills)]
    .filter(skill => skill.length > 1 && skill.length < 50)
    .map(skill => skill.toLowerCase().trim())
    .filter(skill => !['et', 'ou', 'de', 'le', 'la', 'les', 'du', 'des', 'en', 'avec', 'pour', 'sur'].includes(skill));
  
  console.log('[Skills Extraction] Found skills:', cleanedSkills);
  return cleanedSkills.slice(0, 25); // Limite à 25 compétences max
};

const extractExperience = (text: string): string[] => {
  const experience: string[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 5);
  
  // Mots-clés d'expérience
  const experienceKeywords = [
    'expérience', 'experience', 'professionnel', 'emploi', 'poste', 'travail',
    'stage', 'mission', 'projet', 'fonction', 'responsabilités'
  ];
  
  let inExperienceSection = false;
  let currentExperience = '';
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // Détection du début d'une section expérience
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      if (line.length > 10) currentExperience = line;
      return;
    }
    
    // Détection de la fin d'une section
    if (inExperienceSection && (
      lowerLine.includes('formation') || 
      lowerLine.includes('éducation') || 
      lowerLine.includes('compétence') ||
      lowerLine.includes('certification')
    )) {
      if (currentExperience) {
        experience.push(currentExperience);
        currentExperience = '';
      }
      inExperienceSection = false;
      return;
    }
    
    // Accumulation des lignes d'expérience
    if (inExperienceSection) {
      if (line.match(/\b(20\d{2}|19\d{2})\b/) || line.length > 20) {
        if (currentExperience) {
          experience.push(currentExperience);
        }
        currentExperience = line;
      } else if (currentExperience && line.length > 5) {
        currentExperience += ' ' + line;
      }
    }
  });
  
  // Ajouter la dernière expérience si elle existe
  if (currentExperience) {
    experience.push(currentExperience);
  }
  
  return experience.filter(exp => exp.length > 10);
};

const extractEducation = (text: string): string[] => {
  const education: string[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 5);
  
  // Mots-clés de formation étendus
  const educationKeywords = [
    'formation', 'éducation', 'diplôme', 'université', 'école', 'institut',
    'master', 'licence', 'bachelor', 'bts', 'dut', 'but', 'doctorat', 'phd',
    'ingénieur', 'mba', 'dess', 'dea', 'cap', 'bep', 'bac'
  ];
  
  let inEducationSection = false;
  let currentEducation = '';
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // Détection directe de diplômes dans le texte
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      if (line.length > 8) {
        education.push(line);
      }
      inEducationSection = true;
      return;
    }
    
    // Si on est dans une section formation
    if (inEducationSection) {
      if (lowerLine.includes('expérience') || 
          lowerLine.includes('compétence') ||
          lowerLine.includes('certification')) {
        inEducationSection = false;
        return;
      }
      
      if (line.length > 8) {
        education.push(line);
      }
    }
  });
  
  return [...new Set(education)].filter(edu => edu.length > 5);
};

const extractCertifications = (text: string): string[] => {
  const certifications: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Certifications communes étendues
  const commonCertifications = [
    'aws certified', 'azure certified', 'gcp certified', 'google cloud certified',
    'scrum master', 'product owner', 'pmp', 'prince2', 'itil', 'cobit',
    'cisco ccna', 'cisco ccnp', 'cisco ccie', 'microsoft certified',
    'oracle certified', 'red hat certified', 'comptia', 'cissp', 'ceh',
    'cisa', 'cism', 'cipp', 'cipm', 'toeic', 'toefl', 'ielts', 'bulats',
    'cambridge', 'delf', 'dalf', 'certification', 'certifié', 'habilitation'
  ];
  
  commonCertifications.forEach(cert => {
    if (lowerText.includes(cert)) {
      certifications.push(cert);
    }
  });
  
  // Recherche de patterns de certification
  const certPatterns = [
    /certification\s*[:\-–]?\s*([^.\n]+)/gi,
    /certifié\s*[:\-–]?\s*([^.\n]+)/gi,
    /habilitation\s*[:\-–]?\s*([^.\n]+)/gi
  ];
  
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const certText = match.split(/[:–\-]/)[1]?.trim();
        if (certText && certText.length > 3 && certText.length < 100) {
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
  
  // Langues avec variations
  const languageVariations = {
    'français': ['français', 'francais', 'french', 'france'],
    'anglais': ['anglais', 'english', 'england', 'uk', 'usa'],
    'espagnol': ['espagnol', 'spanish', 'español', 'spain'],
    'allemand': ['allemand', 'german', 'deutsch', 'germany'],
    'italien': ['italien', 'italian', 'italiano', 'italy'],
    'portugais': ['portugais', 'portuguese', 'portugal', 'brasil'],
    'chinois': ['chinois', 'chinese', 'mandarin', 'china'],
    'japonais': ['japonais', 'japanese', 'japan'],
    'arabe': ['arabe', 'arabic'],
    'russe': ['russe', 'russian', 'russia'],
    'néerlandais': ['néerlandais', 'dutch', 'netherlands'],
    'polonais': ['polonais', 'polish', 'poland'],
    'turc': ['turc', 'turkish', 'turkey']
  };
  
  Object.entries(languageVariations).forEach(([mainLang, variations]) => {
    if (variations.some(variation => lowerText.includes(variation))) {
      languages.push(mainLang);
    }
  });
  
  // Recherche de niveaux de langue
  const levelPatterns = [
    /(?:niveau|level)\s*[:\-–]?\s*(courant|fluent|bilingue|natif|débutant|intermédiaire|avancé|a1|a2|b1|b2|c1|c2)/gi,
    /(toeic|toefl|ielts|bulats)\s*[:\-–]?\s*(\d+)/gi
  ];
  
  levelPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      languages.push(...matches.map(match => match.trim()));
    }
  });
  
  return [...new Set(languages)];
};

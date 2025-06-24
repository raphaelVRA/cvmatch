
export interface JobPosition {
  id: string;
  title: string;
  category: string;
  keywords: {
    required: string[];
    preferred: string[];
    technical: string[];
    soft: string[];
  };
  experience: {
    min: number;
    preferred: number;
  };
  education: string[];
  certifications?: string[];
  scoreWeights: {
    keywords: number;
    experience: number;
    education: number;
    certifications: number;
  };
}

export const jobCategories = {
  "tech": "Technologie",
  "marketing": "Marketing & Communication", 
  "finance": "Finance & Comptabilité",
  "hr": "Ressources Humaines",
  "sales": "Commercial & Ventes",
  "design": "Design & Créatif",
  "management": "Management & Direction",
  "healthcare": "Santé & Médical",
  "education": "Éducation & Formation",
  "legal": "Juridique",
  "operations": "Opérations & Logistique",
  "consulting": "Conseil & Stratégie"
};

export const jobPositions: JobPosition[] = [
  // TECHNOLOGIE
  {
    id: "dev-frontend",
    title: "Développeur Frontend",
    category: "tech",
    keywords: {
      required: ["HTML", "CSS", "JavaScript"],
      preferred: ["React", "Vue", "Angular", "TypeScript"],
      technical: ["Webpack", "Sass", "Git", "npm", "API REST", "Responsive Design"],
      soft: ["Créativité", "Attention aux détails", "Travail en équipe"]
    },
    experience: { min: 1, preferred: 3 },
    education: ["Licence", "Master", "BTS", "Autodidacte"],
    certifications: ["AWS Frontend", "Google Developer", "Microsoft Frontend"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "dev-backend",
    title: "Développeur Backend",
    category: "tech",
    keywords: {
      required: ["Base de données", "API", "Serveur"],
      preferred: ["Node.js", "Python", "Java", "C#", "PHP"],
      technical: ["Docker", "AWS", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Microservices"],
      soft: ["Logique", "Résolution de problèmes", "Rigueur"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Licence", "Master", "École d'ingénieur"],
    certifications: ["AWS Solutions Architect", "Google Cloud", "Microsoft Azure"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "dev-fullstack",
    title: "Développeur Full Stack",
    category: "tech",
    keywords: {
      required: ["Frontend", "Backend", "Base de données"],
      preferred: ["MERN", "MEAN", "Django", "Laravel", "Spring"],
      technical: ["Git", "CI/CD", "Testing", "Agile", "Scrum", "Docker"],
      soft: ["Polyvalence", "Adaptabilité", "Communication"]
    },
    experience: { min: 3, preferred: 5 },
    education: ["Licence", "Master", "École d'ingénieur"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "devops",
    title: "Ingénieur DevOps",
    category: "tech",
    keywords: {
      required: ["CI/CD", "Docker", "Kubernetes"],
      preferred: ["AWS", "Azure", "GCP", "Terraform", "Ansible"],
      technical: ["Jenkins", "GitLab CI", "Monitoring", "Prometheus", "Grafana", "Linux"],
      soft: ["Automatisation", "Fiabilité", "Collaboration"]
    },
    experience: { min: 3, preferred: 5 },
    education: ["Master", "École d'ingénieur"],
    certifications: ["AWS DevOps", "Kubernetes", "Docker Certified"],
    scoreWeights: { keywords: 0.5, experience: 0.3, education: 0.1, certifications: 0.1 }
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "tech",
    keywords: {
      required: ["Python", "Machine Learning", "Statistiques"],
      preferred: ["TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy"],
      technical: ["SQL", "R", "Jupyter", "Big Data", "Spark", "Hadoop"],
      soft: ["Analyse critique", "Curiosité", "Communication des résultats"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Master", "Doctorat", "École d'ingénieur"],
    certifications: ["Google Cloud ML", "AWS ML", "Microsoft AI"],
    scoreWeights: { keywords: 0.4, experience: 0.2, education: 0.3, certifications: 0.1 }
  },
  {
    id: "cybersecurity",
    title: "Expert Cybersécurité",
    category: "tech",
    keywords: {
      required: ["Sécurité", "Firewall", "Pentesting"],
      preferred: ["CISSP", "CEH", "CISM", "ISO 27001"],
      technical: ["Nmap", "Wireshark", "Metasploit", "SIEM", "IDS/IPS", "Cryptographie"],
      soft: ["Vigilance", "Éthique", "Discrétion"]
    },
    experience: { min: 3, preferred: 6 },
    education: ["Master", "École d'ingénieur"],
    certifications: ["CISSP", "CEH", "CISM", "GSEC"],
    scoreWeights: { keywords: 0.3, experience: 0.3, education: 0.2, certifications: 0.2 }
  },

  // MARKETING & COMMUNICATION
  {
    id: "marketing-digital",
    title: "Responsable Marketing Digital",
    category: "marketing",
    keywords: {
      required: ["SEO", "SEM", "Réseaux sociaux"],
      preferred: ["Google Ads", "Facebook Ads", "Analytics", "Growth Hacking"],
      technical: ["Google Analytics", "Tag Manager", "CRM", "Email Marketing", "A/B Testing"],
      soft: ["Créativité", "Analyse", "Stratégie"]
    },
    experience: { min: 3, preferred: 5 },
    education: ["Licence", "Master", "École de commerce"],
    certifications: ["Google Ads", "Google Analytics", "Facebook Blueprint"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "content-manager",
    title: "Content Manager",
    category: "marketing",
    keywords: {
      required: ["Rédaction", "Content Marketing", "SEO"],
      preferred: ["WordPress", "CMS", "Storytelling", "Brand Content"],
      technical: ["Canva", "Adobe Creative", "Analytics", "Social Media Management"],
      soft: ["Créativité", "Rigueur", "Polyvalence"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Licence", "Master", "École de journalisme"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // DESIGN & CRÉATIF
  {
    id: "ux-designer",
    title: "UX/UI Designer",
    category: "design",
    keywords: {
      required: ["UX", "UI", "Design thinking"],
      preferred: ["Figma", "Sketch", "Adobe XD", "Prototypage"],
      technical: ["Wireframing", "User Research", "Personas", "A/B Testing", "Accessibilité"],
      soft: ["Empathie", "Créativité", "Communication"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Licence Design", "Master", "École d'art"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "graphic-designer",
    title: "Designer Graphique",
    category: "design",
    keywords: {
      required: ["Adobe Creative Suite", "Design graphique", "Identité visuelle"],
      preferred: ["Photoshop", "Illustrator", "InDesign", "Branding"],
      technical: ["Print", "Web", "Typography", "Couleurs", "Layout"],
      soft: ["Créativité", "Sens esthétique", "Attention aux détails"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Licence Design", "École d'art", "BTS Design"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // FINANCE & COMPTABILITÉ
  {
    id: "comptable",
    title: "Comptable",
    category: "finance",
    keywords: {
      required: ["Comptabilité", "Bilan", "Compte de résultat"],
      preferred: ["SAP", "Sage", "Cegid", "Excel avancé"],
      technical: ["TVA", "Fiscalité", "Audit", "Consolidation", "Reporting"],
      soft: ["Rigueur", "Précision", "Organisation"]
    },
    experience: { min: 2, preferred: 5 },
    education: ["BTS Comptabilité", "DCG", "DSCG", "Master Finance"],
    certifications: ["DCG", "DSCG", "Expert-comptable"],
    scoreWeights: { keywords: 0.3, experience: 0.3, education: 0.3, certifications: 0.1 }
  },
  {
    id: "analyste-financier",
    title: "Analyste Financier",
    category: "finance",
    keywords: {
      required: ["Analyse financière", "Modélisation", "Excel"],
      preferred: ["Bloomberg", "Reuters", "VBA", "Python"],
      technical: ["DCF", "LBO", "M&A", "Risk Management", "Derivatives"],
      soft: ["Analyse critique", "Synthèse", "Communication"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Master Finance", "École de commerce", "École d'ingénieur"],
    certifications: ["CFA", "FRM", "CAIA"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // RESSOURCES HUMAINES
  {
    id: "rh-generaliste",
    title: "Responsable RH",
    category: "hr",
    keywords: {
      required: ["Recrutement", "Gestion RH", "Droit du travail"],
      preferred: ["SIRH", "Formation", "Paie", "Relations sociales"],
      technical: ["Entretiens", "Assessment", "HR Analytics", "Talent Management"],
      soft: ["Écoute", "Diplomatie", "Confidentialité"]
    },
    experience: { min: 3, preferred: 6 },
    education: ["Master RH", "École de commerce", "Droit social"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "talent-acquisition",
    title: "Talent Acquisition Specialist",
    category: "hr",
    keywords: {
      required: ["Recrutement", "Sourcing", "Entretiens"],
      preferred: ["LinkedIn Recruiter", "Boolean search", "Employer branding"],
      technical: ["ATS", "HR Tech", "Candidate Experience", "Diversity & Inclusion"],
      soft: ["Communication", "Persuasion", "Empathie"]
    },
    experience: { min: 2, preferred: 4 },
    education: ["Licence RH", "Master", "École de commerce"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // COMMERCIAL & VENTES
  {
    id: "commercial-btob",
    title: "Commercial BtoB",
    category: "sales",
    keywords: {
      required: ["Vente", "Prospection", "Négociation"],
      preferred: ["CRM", "Salesforce", "Lead Generation", "Account Management"],
      technical: ["Pipeline Management", "Sales Process", "KPI Vente", "Territory Management"],
      soft: ["Persuasion", "Persévérance", "Relationnel"]
    },
    experience: { min: 2, preferred: 5 },
    education: ["Licence", "École de commerce", "BTS Commercial"],
    scoreWeights: { keywords: 0.4, experience: 0.4, education: 0.1, certifications: 0.1 }
  },
  {
    id: "business-developer",
    title: "Business Developer",
    category: "sales",
    keywords: {
      required: ["Business Development", "Stratégie commerciale", "Partenariats"],
      preferred: ["Startup", "Scale-up", "Growth", "Market Research"],
      technical: ["Business Model", "Go-to-Market", "Partnership Management"],
      soft: ["Vision stratégique", "Initiative", "Adaptabilité"]
    },
    experience: { min: 3, preferred: 6 },
    education: ["Master", "École de commerce", "MBA"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // MANAGEMENT & DIRECTION
  {
    id: "product-manager",
    title: "Product Manager",
    category: "management",
    keywords: {
      required: ["Product Management", "Roadmap", "User Stories"],
      preferred: ["Agile", "Scrum", "Product-Market Fit", "Analytics"],
      technical: ["Jira", "Confluence", "A/B Testing", "Data Analysis", "UX Research"],
      soft: ["Leadership", "Vision produit", "Communication"]
    },
    experience: { min: 3, preferred: 6 },
    education: ["Master", "École de commerce", "École d'ingénieur"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },
  {
    id: "project-manager",
    title: "Chef de Projet",
    category: "management",
    keywords: {
      required: ["Gestion de projet", "Planning", "Budget"],
      preferred: ["PMP", "Agile", "Scrum Master", "Kanban"],
      technical: ["MS Project", "Gantt", "Risk Management", "Stakeholder Management"],
      soft: ["Organisation", "Leadership", "Communication"]
    },
    experience: { min: 3, preferred: 6 },
    education: ["Master", "École d'ingénieur", "École de commerce"],
    certifications: ["PMP", "Scrum Master", "Prince2"],
    scoreWeights: { keywords: 0.3, experience: 0.3, education: 0.2, certifications: 0.2 }
  },

  // SANTÉ & MÉDICAL
  {
    id: "infirmier",
    title: "Infirmier(ère)",
    category: "healthcare",
    keywords: {
      required: ["Soins infirmiers", "Diplôme d'État", "Hygiène"],
      preferred: ["Urgences", "Réanimation", "Bloc opératoire", "Gériatrie"],
      technical: ["Protocoles de soins", "Pharmacologie", "Matériel médical"],
      soft: ["Empathie", "Résistance au stress", "Travail en équipe"]
    },
    experience: { min: 0, preferred: 3 },
    education: ["Diplôme d'État Infirmier"],
    certifications: ["Spécialisations infirmières"],
    scoreWeights: { keywords: 0.3, experience: 0.3, education: 0.3, certifications: 0.1 }
  },

  // ÉDUCATION & FORMATION
  {
    id: "formateur",
    title: "Formateur",
    category: "education",
    keywords: {
      required: ["Formation", "Pédagogie", "Animation"],
      preferred: ["E-learning", "LMS", "Ingénierie pédagogique", "Digital Learning"],
      technical: ["SCORM", "Moodle", "Articulate", "Captivate", "Evaluation"],
      soft: ["Patience", "Communication", "Adaptabilité"]
    },
    experience: { min: 2, preferred: 5 },
    education: ["Master", "Licence", "Certification formateur"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // JURIDIQUE
  {
    id: "juriste",
    title: "Juriste d'Entreprise",
    category: "legal",
    keywords: {
      required: ["Droit", "Contrats", "Juridique"],
      preferred: ["Droit des affaires", "RGPD", "Propriété intellectuelle"],
      technical: ["Rédaction juridique", "Veille juridique", "Compliance", "Litigation"],
      soft: ["Rigueur", "Analyse", "Négociation"]
    },
    experience: { min: 2, preferred: 5 },
    education: ["Master Droit", "École de droit", "DJCE"],
    certifications: ["Barreau", "Spécialisations juridiques"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // OPÉRATIONS & LOGISTIQUE
  {
    id: "supply-chain",
    title: "Responsable Supply Chain",
    category: "operations",
    keywords: {
      required: ["Supply Chain", "Logistique", "Approvisionnement"],
      preferred: ["SAP", "ERP", "Lean", "Six Sigma"],
      technical: ["Forecasting", "Inventory Management", "Procurement", "Distribution"],
      soft: ["Organisation", "Analyse", "Négociation"]
    },
    experience: { min: 3, preferred: 6 },
    education: ["Master", "École d'ingénieur", "École de commerce"],
    certifications: ["APICS", "CPIM", "Six Sigma"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  },

  // CONSEIL & STRATÉGIE
  {
    id: "consultant",
    title: "Consultant",
    category: "consulting",
    keywords: {
      required: ["Conseil", "Analyse", "Stratégie"],
      preferred: ["Management", "Transformation", "Change Management"],
      technical: ["Framework", "Méthodologie", "Benchmarking", "Due Diligence"],
      soft: ["Communication", "Adaptabilité", "Synthèse"]
    },
    experience: { min: 2, preferred: 5 },
    education: ["Master", "École de commerce", "École d'ingénieur"],
    scoreWeights: { keywords: 0.4, experience: 0.3, education: 0.2, certifications: 0.1 }
  }
];

export const getJobPositionById = (id: string): JobPosition | undefined => {
  return jobPositions.find(job => job.id === id);
};

export const getJobPositionsByCategory = (category: string): JobPosition[] => {
  return jobPositions.filter(job => job.category === category);
};

// RSE Action Plan Types - Loi 2018-35 & CSRD Compliance

export type ActionStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type ActionPriority = 'high' | 'medium' | 'low';
export type StakeholderCategory = 'regulators' | 'local_authorities' | 'civil_society' | 'export_clients' | 'employees' | 'suppliers' | 'investors' | 'media' | 'environment' | 'financial';
export type DialogueMode = 'meeting' | 'questionnaire' | 'annual_report' | 'audit' | 'liaison_committee' | 'other';

export interface RSEAction {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  priority: ActionPriority;
  linkedKpiId: string;
  linkedKpiLabel: string;
  legislationRef: string[];
  impactMetrics: {
    costEstimated: number; // TND
    co2ReductionTarget?: number; // tCO2e/an
    kpiImpactPoints?: number; // Expected score improvement
    regionalImpact: boolean; // Loi 2018-35 priority
  };
  assignedTo: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  category: 'E' | 'S' | 'G';
  isSuggestion?: boolean; // Auto-generated suggestion
}

export interface Stakeholder {
  id: string;
  name: string;
  category: StakeholderCategory;
  power: number; // 0-100
  interest: number; // 0-100
  description: string;
  engagement: 'inform' | 'consult' | 'involve' | 'collaborate';
  // New fields for dialogue module
  dialogueMode?: DialogueMode;
  keyExpectations?: string;
  plannedActions?: string;
}

export interface RSEBudget {
  allocated: number;
  spent: number;
  committed: number;
  category: 'E' | 'S' | 'G';
}

export interface RSEDashboardStats {
  totalActions: number;
  completedActions: number;
  inProgressActions: number;
  blockedActions: number;
  regionalImpactActions: number;
  csrdTransitionProgress: number;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
}

export const STAKEHOLDER_CATEGORIES: Record<StakeholderCategory, { label: string; description: string; color: string }> = {
  regulators: { 
    label: 'État / Régulateurs', 
    description: 'ANME, ANPE, ANGed, BCT, CMF, Ministères',
    color: '#3b82f6' // blue
  },
  local_authorities: { 
    label: 'Collectivités Locales', 
    description: 'Mairies, Gouvernorats, Conseils régionaux',
    color: '#8b5cf6' // purple
  },
  civil_society: { 
    label: 'Société Civile', 
    description: 'Associations locales, ONG, Syndicats',
    color: '#f59e0b' // amber
  },
  export_clients: { 
    label: 'Clients Export (UE)', 
    description: 'Donneurs d\'ordre européens, Distributeurs',
    color: '#06b6d4' // cyan
  },
  employees: { 
    label: 'Employés', 
    description: 'Salariés, Représentants du personnel',
    color: '#ec4899' // pink
  },
  suppliers: { 
    label: 'Fournisseurs', 
    description: 'Chaîne d\'approvisionnement locale et internationale',
    color: '#64748b' // slate
  },
  investors: { 
    label: 'Investisseurs', 
    description: 'Actionnaires, Banques, Fonds d\'investissement',
    color: '#84cc16' // lime
  },
  media: {
    label: 'Médias',
    description: 'Presse, TV, Réseaux sociaux, Influenceurs',
    color: '#ef4444' // red
  },
  environment: {
    label: 'Environnement',
    description: 'Riverains, Communautés locales, Écosystèmes',
    color: '#10b981' // emerald
  },
  financial: {
    label: 'Institutions Financières',
    description: 'Banques, Assurances, Fonds ESG',
    color: '#0ea5e9' // sky
  },
};

export const DIALOGUE_MODES: Record<DialogueMode, string> = {
  meeting: 'Réunion',
  questionnaire: 'Questionnaire',
  annual_report: 'Rapport Annuel',
  audit: 'Audit',
  liaison_committee: 'Comité de liaison',
  other: 'Autre',
};

export const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: 'À faire', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  in_progress: { label: 'En cours', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  blocked: { label: 'Bloqué', color: 'text-red-600', bgColor: 'bg-red-100' },
  done: { label: 'Terminé', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
};

export const PRIORITY_CONFIG: Record<ActionPriority, { label: string; color: string }> = {
  high: { label: 'Haute', color: 'text-red-500' },
  medium: { label: 'Moyenne', color: 'text-amber-500' },
  low: { label: 'Basse', color: 'text-slate-500' },
};

// ISO 26000 Identification Questions
export const ISO_26000_QUESTIONS = [
  {
    id: 'q1',
    question: 'À qui l\'organisation a-t-elle des obligations juridiques ?',
    description: 'Identifiez les parties prenantes envers lesquelles vous avez des obligations légales ou contractuelles.',
    examples: ['Régulateurs (ANPE, ANME)', 'Employés', 'Actionnaires', 'État tunisien']
  },
  {
    id: 'q2',
    question: 'Qui pourrait être affecté positivement ou négativement par les décisions ou activités de l\'organisation ?',
    description: 'Pensez aux impacts directs et indirects de vos opérations.',
    examples: ['Riverains', 'Communautés locales', 'Fournisseurs', 'Clients']
  },
  {
    id: 'q3',
    question: 'Qui est susceptible d\'exprimer des préoccupations concernant les décisions et activités de l\'organisation ?',
    description: 'Identifiez les groupes qui pourraient s\'intéresser à vos pratiques.',
    examples: ['ONG environnementales', 'Médias', 'Syndicats (UGTT)', 'Associations de consommateurs']
  },
  {
    id: 'q4',
    question: 'Qui peut aider l\'organisation à gérer des impacts spécifiques ?',
    description: 'Identifiez les partenaires potentiels pour améliorer vos pratiques.',
    examples: ['Consultants ESG', 'Institutions de recherche', 'Fédérations professionnelles (UTICA)']
  },
  {
    id: 'q5',
    question: 'Qui pourrait être désavantagé s\'il était exclu du dialogue ?',
    description: 'Assurez-vous de ne pas oublier des parties prenantes vulnérables.',
    examples: ['Populations locales', 'Petits fournisseurs', 'Travailleurs précaires']
  },
  {
    id: 'q6',
    question: 'Qui dans la chaîne de valeur est affecté ?',
    description: 'Cartographiez l\'ensemble de votre chaîne d\'approvisionnement.',
    examples: ['Fournisseurs de matières premières', 'Sous-traitants', 'Transporteurs', 'Distributeurs']
  },
];

// Enriched default stakeholders for Tunisia
export const DEFAULT_STAKEHOLDERS: Stakeholder[] = [
  // Régulateurs
  { 
    id: 'anme', 
    name: 'ANME', 
    category: 'regulators', 
    power: 85, 
    interest: 90, 
    description: 'Agence Nationale pour la Maîtrise de l\'Énergie - Efficacité énergétique & EnR', 
    engagement: 'collaborate',
    dialogueMode: 'meeting',
    keyExpectations: 'Conformité aux normes énergétiques, réduction consommation',
    plannedActions: 'Audit énergétique annuel, plan d\'amélioration continue'
  },
  { 
    id: 'anpe', 
    name: 'ANPE', 
    category: 'regulators', 
    power: 80, 
    interest: 85, 
    description: 'Agence Nationale de Protection de l\'Environnement - Pollution & EIE', 
    engagement: 'collaborate',
    dialogueMode: 'audit',
    keyExpectations: 'Respect des normes environnementales, études d\'impact',
    plannedActions: 'Contrôles périodiques, mise à jour des autorisations'
  },
  { 
    id: 'anged', 
    name: 'ANGed', 
    category: 'regulators', 
    power: 75, 
    interest: 80, 
    description: 'Agence Nationale de Gestion des Déchets - Valorisation & traitement', 
    engagement: 'consult',
    dialogueMode: 'annual_report',
    keyExpectations: 'Gestion conforme des déchets, traçabilité',
    plannedActions: 'Reporting trimestriel, contrats avec collecteurs agréés'
  },
  { 
    id: 'bct', 
    name: 'BCT', 
    category: 'regulators', 
    power: 95, 
    interest: 70, 
    description: 'Banque Centrale de Tunisie - Crédits verts & finance durable', 
    engagement: 'inform',
    dialogueMode: 'annual_report',
    keyExpectations: 'Transparence financière, reporting ESG',
    plannedActions: 'Publication rapport annuel intégré'
  },
  { 
    id: 'cmf', 
    name: 'CMF', 
    category: 'regulators', 
    power: 90, 
    interest: 75, 
    description: 'Conseil du Marché Financier - Reporting extra-financier', 
    engagement: 'inform',
    dialogueMode: 'annual_report',
    keyExpectations: 'Conformité reporting BVMT, transparence ESG',
    plannedActions: 'Publication rapport ESG annuel'
  },
  { 
    id: 'ministere_env', 
    name: 'Min. Environnement', 
    category: 'regulators', 
    power: 92, 
    interest: 88, 
    description: 'Ministère de l\'Environnement - Politique environnementale nationale', 
    engagement: 'collaborate',
    dialogueMode: 'liaison_committee',
    keyExpectations: 'Alignement avec stratégie nationale DD',
    plannedActions: 'Participation aux consultations nationales'
  },
  
  // Collectivités Locales
  { 
    id: 'gouvernorat', 
    name: 'Gouvernorat Local', 
    category: 'local_authorities', 
    power: 70, 
    interest: 75, 
    description: 'Autorité régionale - Développement territorial', 
    engagement: 'involve',
    dialogueMode: 'meeting',
    keyExpectations: 'Création d\'emplois, impact positif régional',
    plannedActions: 'Réunions trimestrielles, projets communs'
  },
  { 
    id: 'mairie', 
    name: 'Mairie', 
    category: 'local_authorities', 
    power: 60, 
    interest: 70, 
    description: 'Autorité municipale - Urbanisme & autorisations locales', 
    engagement: 'consult',
    dialogueMode: 'meeting',
    keyExpectations: 'Respect réglementations locales, intégration urbaine',
    plannedActions: 'Coordination projets, autorisations'
  },
  { 
    id: 'conseil_regional', 
    name: 'Conseil Régional', 
    category: 'local_authorities', 
    power: 65, 
    interest: 72, 
    description: 'Conseil régional - Stratégie développement régional', 
    engagement: 'involve',
    dialogueMode: 'liaison_committee',
    keyExpectations: 'Contribution au développement régional équilibré',
    plannedActions: 'Participation aux instances régionales'
  },
  
  // Société Civile
  { 
    id: 'ugtt', 
    name: 'UGTT', 
    category: 'civil_society', 
    power: 85, 
    interest: 90, 
    description: 'Union Générale Tunisienne du Travail - Droits des travailleurs', 
    engagement: 'collaborate',
    dialogueMode: 'liaison_committee',
    keyExpectations: 'Conditions de travail, dialogue social, sécurité',
    plannedActions: 'Négociations collectives, comité d\'entreprise'
  },
  { 
    id: 'utica', 
    name: 'UTICA', 
    category: 'civil_society', 
    power: 75, 
    interest: 80, 
    description: 'Union Tunisienne de l\'Industrie, du Commerce et de l\'Artisanat', 
    engagement: 'collaborate',
    dialogueMode: 'meeting',
    keyExpectations: 'Représentation sectorielle, bonnes pratiques',
    plannedActions: 'Participation aux groupes de travail sectoriels'
  },
  { 
    id: 'ong_env', 
    name: 'ONG Environnementales', 
    category: 'civil_society', 
    power: 50, 
    interest: 95, 
    description: 'Associations de protection de l\'environnement - WWF, ATPNE', 
    engagement: 'consult',
    dialogueMode: 'questionnaire',
    keyExpectations: 'Transparence environnementale, biodiversité',
    plannedActions: 'Dialogue régulier, partenariats projets verts'
  },
  { 
    id: 'associations_locales', 
    name: 'Associations Locales', 
    category: 'civil_society', 
    power: 45, 
    interest: 88, 
    description: 'Associations de quartier et de développement local', 
    engagement: 'involve',
    dialogueMode: 'meeting',
    keyExpectations: 'Impact social positif, emploi local',
    plannedActions: 'Projets communautaires, sponsoring local'
  },
  { 
    id: 'associations_consommateurs', 
    name: 'Associations Consommateurs', 
    category: 'civil_society', 
    power: 55, 
    interest: 82, 
    description: 'Organisation de Défense du Consommateur (ODC)', 
    engagement: 'consult',
    dialogueMode: 'questionnaire',
    keyExpectations: 'Qualité produits, transparence prix, SAV',
    plannedActions: 'Hotline client, politique qualité transparente'
  },
  
  // Clients Export
  { 
    id: 'clients_ue', 
    name: 'Donneurs d\'ordre UE', 
    category: 'export_clients', 
    power: 95, 
    interest: 95, 
    description: 'Clients européens soumis à la CSRD - Due diligence supply chain', 
    engagement: 'collaborate',
    dialogueMode: 'audit',
    keyExpectations: 'Conformité CSRD, traçabilité carbone, audits',
    plannedActions: 'Certification ISO 14001, reporting ESG, SAQ EcoVadis'
  },
  { 
    id: 'distributeurs_ue', 
    name: 'Distributeurs Européens', 
    category: 'export_clients', 
    power: 80, 
    interest: 85, 
    description: 'Grandes surfaces et centrales d\'achat européennes', 
    engagement: 'collaborate',
    dialogueMode: 'audit',
    keyExpectations: 'Labels durables, empreinte carbone produits',
    plannedActions: 'Certification produit, ACV, labels bio/équitable'
  },
  
  // Employés
  { 
    id: 'employes', 
    name: 'Employés', 
    category: 'employees', 
    power: 70, 
    interest: 95, 
    description: 'Ensemble des salariés de l\'entreprise', 
    engagement: 'collaborate',
    dialogueMode: 'questionnaire',
    keyExpectations: 'Sécurité, évolution carrière, rémunération équitable',
    plannedActions: 'Enquête satisfaction, formation continue, CE'
  },
  { 
    id: 'representants_personnel', 
    name: 'Représentants du Personnel', 
    category: 'employees', 
    power: 65, 
    interest: 92, 
    description: 'Délégués du personnel, comité d\'entreprise', 
    engagement: 'collaborate',
    dialogueMode: 'liaison_committee',
    keyExpectations: 'Dialogue social, participation aux décisions',
    plannedActions: 'Réunions mensuelles, consultation sur projets majeurs'
  },
  { 
    id: 'cadres', 
    name: 'Encadrement', 
    category: 'employees', 
    power: 75, 
    interest: 88, 
    description: 'Cadres et managers de l\'entreprise', 
    engagement: 'collaborate',
    dialogueMode: 'meeting',
    keyExpectations: 'Vision stratégique, autonomie, développement',
    plannedActions: 'Réunions stratégiques, formation leadership'
  },
  
  // Fournisseurs
  { 
    id: 'fournisseurs_locaux', 
    name: 'Fournisseurs Locaux', 
    category: 'suppliers', 
    power: 55, 
    interest: 75, 
    description: 'PME et artisans tunisiens de la chaîne d\'approvisionnement', 
    engagement: 'involve',
    dialogueMode: 'meeting',
    keyExpectations: 'Conditions de paiement, volumes prévisibles',
    plannedActions: 'Contrats pluriannuels, programme d\'accompagnement'
  },
  { 
    id: 'fournisseurs_internationaux', 
    name: 'Fournisseurs Internationaux', 
    category: 'suppliers', 
    power: 60, 
    interest: 65, 
    description: 'Fournisseurs de matières premières et équipements', 
    engagement: 'consult',
    dialogueMode: 'audit',
    keyExpectations: 'Partenariat long terme, innovation',
    plannedActions: 'Évaluation ESG fournisseurs, code de conduite'
  },
  { 
    id: 'transporteurs', 
    name: 'Transporteurs & Logistique', 
    category: 'suppliers', 
    power: 50, 
    interest: 60, 
    description: 'Prestataires transport et logistique', 
    engagement: 'consult',
    dialogueMode: 'meeting',
    keyExpectations: 'Optimisation trajets, réduction émissions',
    plannedActions: 'Critères ESG dans appels d\'offres'
  },
  
  // Investisseurs
  { 
    id: 'actionnaires', 
    name: 'Actionnaires', 
    category: 'investors', 
    power: 95, 
    interest: 90, 
    description: 'Actionnaires et investisseurs institutionnels', 
    engagement: 'collaborate',
    dialogueMode: 'annual_report',
    keyExpectations: 'Rendement, gouvernance, gestion des risques',
    plannedActions: 'AG, rapports trimestriels, roadshows'
  },
  { 
    id: 'banques', 
    name: 'Banques & Financeurs', 
    category: 'financial', 
    power: 85, 
    interest: 80, 
    description: 'Banques commerciales et institutions de financement', 
    engagement: 'inform',
    dialogueMode: 'annual_report',
    keyExpectations: 'Solidité financière, conformité covenants',
    plannedActions: 'Reporting financier régulier, revue annuelle'
  },
  { 
    id: 'fonds_esg', 
    name: 'Fonds ESG', 
    category: 'investors', 
    power: 70, 
    interest: 95, 
    description: 'Fonds d\'investissement à critères ESG', 
    engagement: 'collaborate',
    dialogueMode: 'questionnaire',
    keyExpectations: 'Performance ESG, transparence, ratings',
    plannedActions: 'Amélioration score ESG, certification'
  },
  
  // Médias
  { 
    id: 'presse_nationale', 
    name: 'Presse Nationale', 
    category: 'media', 
    power: 60, 
    interest: 70, 
    description: 'Journaux et magazines tunisiens', 
    engagement: 'inform',
    dialogueMode: 'meeting',
    keyExpectations: 'Transparence, actualités positives',
    plannedActions: 'Communiqués de presse, relations presse'
  },
  { 
    id: 'medias_sociaux', 
    name: 'Médias Sociaux', 
    category: 'media', 
    power: 55, 
    interest: 85, 
    description: 'Influenceurs, communautés en ligne', 
    engagement: 'inform',
    dialogueMode: 'other',
    keyExpectations: 'Engagement, réputation en ligne',
    plannedActions: 'Stratégie social media, veille e-réputation'
  },
  
  // Environnement (communautés)
  { 
    id: 'riverains', 
    name: 'Riverains', 
    category: 'environment', 
    power: 45, 
    interest: 90, 
    description: 'Habitants et commerces à proximité des sites', 
    engagement: 'involve',
    dialogueMode: 'meeting',
    keyExpectations: 'Nuisances minimales, emploi local, sécurité',
    plannedActions: 'Réunions de quartier, ligne d\'écoute'
  },
  { 
    id: 'communautes_locales', 
    name: 'Communautés Locales', 
    category: 'environment', 
    power: 40, 
    interest: 85, 
    description: 'Populations des zones d\'implantation', 
    engagement: 'involve',
    dialogueMode: 'meeting',
    keyExpectations: 'Développement local, respect traditions',
    plannedActions: 'Projets sociaux, mécénat local'
  },
];

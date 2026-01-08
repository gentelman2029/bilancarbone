// RSE Action Plan Types - Loi 2018-35 & CSRD Compliance

export type ActionStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type ActionPriority = 'high' | 'medium' | 'low';
export type StakeholderCategory = 'regulators' | 'local_authorities' | 'civil_society' | 'export_clients' | 'employees' | 'suppliers' | 'investors';

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

export const STAKEHOLDER_CATEGORIES: Record<StakeholderCategory, { label: string; description: string }> = {
  regulators: { 
    label: 'État / Régulateurs', 
    description: 'ANME, ANPE, ANGed, BCT, CMF, Ministères' 
  },
  local_authorities: { 
    label: 'Collectivités Locales', 
    description: 'Mairies, Gouvernorats, Conseils régionaux' 
  },
  civil_society: { 
    label: 'Société Civile', 
    description: 'Associations locales, ONG, Syndicats' 
  },
  export_clients: { 
    label: 'Clients Export (UE)', 
    description: 'Donneurs d\'ordre européens, Distributeurs' 
  },
  employees: { 
    label: 'Employés', 
    description: 'Salariés, Représentants du personnel' 
  },
  suppliers: { 
    label: 'Fournisseurs', 
    description: 'Chaîne d\'approvisionnement locale et internationale' 
  },
  investors: { 
    label: 'Investisseurs', 
    description: 'Actionnaires, Banques, Fonds d\'investissement' 
  },
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

// Default stakeholders for Tunisia
export const DEFAULT_STAKEHOLDERS: Stakeholder[] = [
  { id: 'anme', name: 'ANME', category: 'regulators', power: 85, interest: 90, description: 'Agence Nationale pour la Maîtrise de l\'Énergie', engagement: 'collaborate' },
  { id: 'anpe', name: 'ANPE', category: 'regulators', power: 80, interest: 85, description: 'Agence Nationale de Protection de l\'Environnement', engagement: 'collaborate' },
  { id: 'anged', name: 'ANGed', category: 'regulators', power: 75, interest: 80, description: 'Agence Nationale de Gestion des Déchets', engagement: 'consult' },
  { id: 'bct', name: 'BCT', category: 'regulators', power: 95, interest: 70, description: 'Banque Centrale de Tunisie - Crédits verts', engagement: 'inform' },
  { id: 'gouvernorat', name: 'Gouvernorat Local', category: 'local_authorities', power: 70, interest: 75, description: 'Autorité régionale', engagement: 'involve' },
  { id: 'mairie', name: 'Mairie', category: 'local_authorities', power: 60, interest: 70, description: 'Autorité municipale', engagement: 'consult' },
  { id: 'syndicats', name: 'UGTT / Syndicats', category: 'civil_society', power: 75, interest: 85, description: 'Représentants des travailleurs', engagement: 'collaborate' },
  { id: 'ong_env', name: 'ONG Environnementales', category: 'civil_society', power: 50, interest: 95, description: 'Associations de protection de l\'environnement', engagement: 'consult' },
  { id: 'clients_ue', name: 'Donneurs d\'ordre UE', category: 'export_clients', power: 90, interest: 90, description: 'Clients européens soumis à la CSRD', engagement: 'collaborate' },
];

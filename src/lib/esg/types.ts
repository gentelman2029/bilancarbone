// ESG Scoring Types for Tunisia BVMT Standard

export interface ESGIndicator {
  id: string;
  label: string;
  unit: string;
  type: 'numeric' | 'calculated' | 'binary';
  value?: number | boolean;
  weight?: number; // Sector-specific weight multiplier
  description?: string;
  benchmarkMin?: number;
  benchmarkMax?: number;
  benchmarkAvg?: number;
}

export interface ESGCategory {
  id: 'E' | 'S' | 'G';
  label: string;
  weight: number;
  indicators: ESGIndicator[];
  score?: number;
}

export interface ESGData {
  companyName: string;
  sector: string;
  fiscalYear: number;
  revenue: number; // TND - Chiffre d'affaires
  categories: ESGCategory[];
  totalScore?: number;
  grade?: string;
  materialityMatrix?: MaterialityPoint[];
}

export interface MaterialityPoint {
  id: string;
  label: string;
  environmentalImpact: number; // 0-100
  financialRisk: number; // 0-100
  category: 'E' | 'S' | 'G';
}

export interface ComplianceAlert {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  description: string;
  regulation: string;
  action?: string;
}

export interface SectorBenchmark {
  sector: string;
  avgScore: number;
  topScore: number;
  bottomScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
}

// Tunisian Sectors
export const TUNISIAN_SECTORS = [
  { value: 'textile', label: 'Textile & Habillement' },
  { value: 'agroalimentaire', label: 'Agroalimentaire' },
  { value: 'chimie', label: 'Chimie & Pharmacie' },
  { value: 'mecanique', label: 'Industries Mécaniques' },
  { value: 'electronique', label: 'Électronique & Électrique' },
  { value: 'materiaux', label: 'Matériaux de Construction' },
  { value: 'services', label: 'Services' },
  { value: 'banque', label: 'Banque & Finance' },
  { value: 'energie', label: 'Énergie' },
  { value: 'tourisme', label: 'Tourisme & Hôtellerie' },
] as const;

// BVMT ESG Schema with 32 indicators
export const BVMT_ESG_SCHEMA: ESGCategory[] = [
  {
    id: 'E',
    label: 'Environnement',
    weight: 0.40,
    indicators: [
      { id: 'E1', label: 'Consommation totale d\'énergie', unit: 'kWh', type: 'numeric', description: 'Consommation annuelle totale d\'énergie' },
      { id: 'E2', label: 'Intensité énergétique', unit: 'kWh/TND_CA', type: 'calculated', description: 'Énergie consommée par TND de chiffre d\'affaires' },
      { id: 'E3', label: 'Part des énergies renouvelables', unit: '%', type: 'numeric', description: 'Pourcentage d\'énergie provenant de sources renouvelables' },
      { id: 'E4', label: 'Consommation totale d\'eau', unit: 'm³', type: 'numeric', description: 'Volume d\'eau consommé annuellement' },
      { id: 'E5', label: 'Taux de recyclage de l\'eau', unit: '%', type: 'numeric', description: 'Pourcentage d\'eau recyclée et réutilisée' },
      { id: 'E6', label: 'Émissions Scope 1 (Directes)', unit: 'tCO₂e', type: 'numeric', description: 'Émissions directes de GES' },
      { id: 'E7', label: 'Émissions Scope 2 (Indirectes)', unit: 'tCO₂e', type: 'numeric', description: 'Émissions indirectes liées à l\'énergie' },
      { id: 'E8', label: 'Intensité Carbone', unit: 'tCO₂e/M TND', type: 'calculated', description: 'Émissions par million TND de CA' },
      { id: 'E9', label: 'Production totale de déchets', unit: 'tonnes', type: 'numeric', description: 'Déchets générés annuellement' },
      { id: 'E10', label: 'Taux de valorisation des déchets', unit: '%', type: 'numeric', description: 'Pourcentage de déchets recyclés ou valorisés' },
      { id: 'E11', label: 'Investissements Verts', unit: 'TND', type: 'numeric', description: 'Montant investi dans des projets environnementaux' },
    ]
  },
  {
    id: 'S',
    label: 'Social',
    weight: 0.30,
    indicators: [
      { id: 'S1', label: 'Effectif total', unit: 'employés', type: 'numeric', description: 'Nombre total d\'employés' },
      { id: 'S2', label: 'Taux de féminisation', unit: '%', type: 'numeric', description: 'Pourcentage de femmes dans l\'effectif' },
      { id: 'S3', label: 'Écart salarial Homme/Femme', unit: '%', type: 'numeric', description: 'Différence de rémunération H/F' },
      { id: 'S4', label: 'Taux de rotation (Turnover)', unit: '%', type: 'numeric', description: 'Taux de départ des employés' },
      { id: 'S5', label: 'Taux d\'absentéisme', unit: '%', type: 'numeric', description: 'Taux d\'absence des employés' },
      { id: 'S6', label: 'Taux de fréquence accidents', unit: 'ratio', type: 'numeric', description: 'Accidents de travail par million d\'heures' },
      { id: 'S7', label: 'Heures de formation par employé', unit: 'heures', type: 'numeric', description: 'Formation moyenne par employé' },
      { id: 'S8', label: 'Emploi de personnes handicapées', unit: '%', type: 'numeric', description: 'Taux d\'emploi de travailleurs handicapés' },
      { id: 'S9', label: 'Réunions partenaires sociaux', unit: 'nombre', type: 'numeric', description: 'Dialogue social annuel' },
      { id: 'S10', label: 'Plaintes protection des données', unit: 'nombre', type: 'numeric', description: 'Incidents liés aux données personnelles' },
      { id: 'S11', label: 'Fournisseurs signataires charte éthique', unit: '%', type: 'numeric', description: 'Engagement éthique de la chaîne d\'approvisionnement' },
      { id: 'S12', label: 'Dépenses mécénat/RSE local', unit: 'TND', type: 'numeric', description: 'Contribution à la communauté locale' },
    ]
  },
  {
    id: 'G',
    label: 'Gouvernance',
    weight: 0.30,
    indicators: [
      { id: 'G1', label: 'Femmes au Conseil d\'Administration', unit: '%', type: 'numeric', description: 'Représentation féminine au CA' },
      { id: 'G2', label: 'Administrateurs Indépendants', unit: '%', type: 'numeric', description: 'Indépendance du Conseil' },
      { id: 'G3', label: 'Dissociation Président / DG', unit: 'Oui/Non', type: 'binary', description: 'Séparation des fonctions' },
      { id: 'G4', label: 'Existence Comité RSE', unit: 'Oui/Non', type: 'binary', description: 'Comité dédié à la RSE' },
      { id: 'G5', label: 'Code Anti-corruption', unit: 'Oui/Non', type: 'binary', description: 'Politique de lutte contre la corruption' },
      { id: 'G6', label: 'Impôts payés en Tunisie', unit: 'TND', type: 'numeric', description: 'Contribution fiscale locale' },
      { id: 'G7', label: 'Politique rémunération publiée', unit: 'Oui/Non', type: 'binary', description: 'Transparence des rémunérations' },
      { id: 'G8', label: 'Dispositif d\'alerte professionnelle', unit: 'Oui/Non', type: 'binary', description: 'Système de signalement (whistleblowing)' },
      { id: 'G9', label: 'Taux de fournisseurs locaux', unit: '%', type: 'numeric', description: 'Achats auprès de fournisseurs tunisiens' },
    ]
  }
];

// Grade mapping
export const ESG_GRADES = [
  { min: 90, grade: 'AAA', color: 'hsl(var(--chart-2))', label: 'Leader' },
  { min: 80, grade: 'AA', color: 'hsl(152, 69%, 31%)', label: 'Excellence' },
  { min: 70, grade: 'A', color: 'hsl(152, 69%, 41%)', label: 'Performant' },
  { min: 60, grade: 'BBB', color: 'hsl(45, 93%, 47%)', label: 'Moyen' },
  { min: 50, grade: 'BB', color: 'hsl(38, 92%, 50%)', label: 'En progression' },
  { min: 40, grade: 'B', color: 'hsl(25, 95%, 53%)', label: 'À améliorer' },
  { min: 0, grade: 'CCC', color: 'hsl(0, 84%, 60%)', label: 'Risque élevé' },
];

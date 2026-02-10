// ESG Scoring Types for Tunisia BVMT Standard - 32 KPIs

export interface ESGIndicator {
  id: string;
  label: string;
  unit: string;
  type: 'numeric' | 'calculated' | 'binary' | 'text';
  value?: number | boolean | string;
  weight?: number;
  description?: string;
  gri?: string;
  autoPopulate?: string; // key to auto-populate from calculator data
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
  revenue: number; // kTND
  categories: ESGCategory[];
  totalScore?: number;
  grade?: string;
  materialityMatrix?: MaterialityPoint[];
}

export interface MaterialityPoint {
  id: string;
  label: string;
  environmentalImpact: number;
  financialRisk: number;
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

// Tunisian Sectors (exhaustive)
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
  { value: 'transport', label: 'Transport & Logistique' },
  { value: 'telecom', label: 'Télécommunications & IT' },
  { value: 'immobilier', label: 'Immobilier & Promotion' },
  { value: 'sante', label: 'Santé & Pharmaceutique' },
  { value: 'education', label: 'Éducation & Formation' },
  { value: 'agriculture', label: 'Agriculture & Pêche' },
  { value: 'mines', label: 'Mines & Extraction' },
  { value: 'petrole', label: 'Pétrole & Gaz' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'commerce', label: 'Commerce & Distribution' },
  { value: 'btp', label: 'BTP & Génie Civil' },
  { value: 'cuir', label: 'Cuir & Chaussure' },
  { value: 'artisanat', label: 'Artisanat & Économie Sociale' },
  { value: 'automobile', label: 'Automobile & Composants' },
  { value: 'aeronautique', label: 'Aéronautique' },
  { value: 'plasturgie', label: 'Plasturgie & Emballage' },
  { value: 'autre', label: 'Autre' },
] as const;

// BVMT ESG Schema with 32 KPIs (exact match to BVMT Guide)
export const BVMT_ESG_SCHEMA: ESGCategory[] = [
  {
    id: 'E',
    label: 'Environnement',
    weight: 0.40,
    indicators: [
      // E1 - Consommation Énergétique (GRI 302-1)
      {
        id: 'E1.1', label: 'Consommation énergétique totale au sein de l\'entreprise',
        unit: 'kWh', type: 'numeric', gri: 'GRI 302-1',
        description: 'Consommation totale d\'énergie (en joules ou multiples), ainsi que les types de combustibles utilisés.'
      },
      {
        id: 'E1.2', label: 'Consommation énergétique totale en dehors de l\'entreprise',
        unit: 'kWh', type: 'numeric', gri: 'GRI 302-1',
        description: 'Consommation d\'énergie en dehors du périmètre opérationnel de l\'entreprise.'
      },
      // E2 - Intensité Énergétique (GRI 302-3)
      {
        id: 'E2.1', label: 'Ratio d\'intensité énergétique',
        unit: 'kWh/kTND', type: 'calculated', gri: 'GRI 302-3',
        description: 'Consommation énergétique absolue divisée par le paramètre spécifique de l\'organisation (CA).'
      },
      {
        id: 'E2.2', label: 'Réductions de consommation énergétique',
        unit: 'kWh', type: 'numeric', gri: 'GRI 302-3',
        description: 'Quantité de réductions de la consommation énergétique atteinte, conséquence directe des initiatives d\'économie et d\'efficacité.'
      },
      // E3 - Mix énergétique (GRI 302)
      {
        id: 'E3', label: 'Mix énergétique / Part des énergies renouvelables',
        unit: '%', type: 'numeric', gri: 'GRI 302',
        description: 'Répartition des différentes sources d\'énergie utilisées. Part des renouvelables.'
      },
      // E4 - Eau et Effluent (GRI 303)
      {
        id: 'E4.1', label: 'Volume total d\'eau prélevé par source',
        unit: 'm³', type: 'numeric', gri: 'GRI 303',
        description: 'Volume total d\'eau prélevé, par source.'
      },
      {
        id: 'E4.2', label: 'Pourcentage d\'eau recyclée et réutilisée',
        unit: '%', type: 'numeric', gri: 'GRI 303',
        description: 'Pourcentage et volume total d\'eau recyclée et réutilisée.'
      },
      // E5 - Émissions GES (GRI 305)
      {
        id: 'E5.1', label: 'Émissions directes de GES (Scope 1)',
        unit: 'tCO₂e', type: 'numeric', gri: 'GRI 305',
        description: 'Émissions directes de GES (Champ d\'application 1) brutes en tonnes numériques d\'équivalent CO2.',
        autoPopulate: 'scope1'
      },
      {
        id: 'E5.2', label: 'Émissions indirectes de GES (Scope 2)',
        unit: 'tCO₂e', type: 'numeric', gri: 'GRI 305',
        description: 'Émissions indirectes de GES (Champ d\'application 2).',
        autoPopulate: 'scope2'
      },
      {
        id: 'E5.3', label: 'Autres émissions indirectes de GES (Scope 3)',
        unit: 'tCO₂e', type: 'numeric', gri: 'GRI 305',
        description: 'Autres émissions indirectes de GES (Champ d\'application 3).',
        autoPopulate: 'scope3'
      },
      {
        id: 'E5.4', label: 'Plan de réduction des émissions GES',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 305',
        description: 'Existence d\'un plan d\'action de réduction des émissions GES.'
      },
      // E6 - Intensité des émissions GES (GRI 305-4)
      {
        id: 'E6', label: 'Ratio d\'intensité des émissions de GES',
        unit: 'tCO₂e/M TND', type: 'calculated', gri: 'GRI 305-4',
        description: 'Le ratio d\'intensité des émissions de GES de l\'entreprise.',
        autoPopulate: 'carbonIntensity'
      },
      // E7 - Politique environnementale (GRI 102)
      {
        id: 'E7.1', label: 'Politique environnementale formalisée',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102',
        description: 'Existence d\'une politique environnementale formalisée signée par la direction.'
      },
      {
        id: 'E7.2', label: 'Politique de traitement des déchets / recyclage',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102',
        description: 'Existence d\'une politique spécifique de traitement de déchets et/ou de recyclage.'
      },
      // E8 - Politique changement climatique (GRI 102)
      {
        id: 'E8', label: 'Politique d\'atténuation des risques climatiques',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102',
        description: 'Existence d\'une politique générale d\'atténuation des risques liés aux changements climatiques.'
      },
      // E9 - Effluents et Déchets (GRI 306)
      {
        id: 'E9', label: 'Poids total des déchets (dangereux et non dangereux)',
        unit: 'tonnes', type: 'numeric', gri: 'GRI 306',
        description: 'Le poids total des déchets dangereux et non dangereux en fonction des modes de traitement.'
      },
      // E10 - Matières (GRI 301-1)
      {
        id: 'E10', label: 'Poids/volume total de matières utilisées',
        unit: 'tonnes', type: 'numeric', gri: 'GRI 301-1',
        description: 'Matières utilisées pour produire et emballer les produits, en distinguant renouvelables et non renouvelables.'
      },
      // E11 - Biodiversité (GRI 304)
      {
        id: 'E11.1', label: 'Impacts substantiels sur la biodiversité',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 304',
        description: 'La nature des impacts substantiels des activités, produits et services de l\'entreprise sur la biodiversité.'
      },
      {
        id: 'E11.2', label: 'Initiatives en faveur de la biodiversité',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 304',
        description: 'Liste des initiatives en faveur de la biodiversité.'
      },
    ]
  },
  {
    id: 'S',
    label: 'Social',
    weight: 0.30,
    indicators: [
      // S1 - Rémunération H/F (GRI 405)
      {
        id: 'S1', label: 'Ratio de rémunération Hommes/Femmes',
        unit: '%', type: 'numeric', gri: 'GRI 405',
        description: 'Le ratio entre la rémunération moyenne des hommes et la rémunération moyenne des femmes, par catégorie professionnelle.'
      },
      // S2 - Emploi (GRI 401, GRI 102-8)
      {
        id: 'S2.1', label: 'Répartition des effectifs par type de contrat',
        unit: 'employés', type: 'numeric', gri: 'GRI 401 / GRI 102-8',
        description: 'Répartition des effectifs par type de contrat (CDI, CDD, à plein temps, en temps partiel, en télétravail).'
      },
      {
        id: 'S2.2', label: 'Nombre de contrats d\'insertion',
        unit: 'nombre', type: 'numeric', gri: 'GRI 102-8',
        description: 'Nombre de contrats d\'insertion (apprentissage, alternance, karama, civp,...) et pourcentage de contrats convertis en CDI.'
      },
      {
        id: 'S2.3', label: 'Rotation des effectifs (Turnover)',
        unit: '%', type: 'numeric', gri: 'GRI 401',
        description: 'La rotation des effectifs par type de contrat d\'une année à l\'autre.'
      },
      // S3 - Diversité et Égalité des Chances (GRI 405)
      {
        id: 'S3', label: 'Répartition Hommes/Femmes par catégorie',
        unit: '%', type: 'numeric', gri: 'GRI 405',
        description: 'Répartition hommes/femmes par catégorie professionnelle.'
      },
      // S4 - Lutte contre la discrimination (GRI 103)
      {
        id: 'S4', label: 'Charte de diversité et non-discrimination',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 103',
        description: 'Existence d\'une charte ou d\'une politique de la diversité et de non-discrimination.'
      },
      // S5 - Santé-Sécurité au Travail SST (GRI 403-2)
      {
        id: 'S5.1', label: 'Types d\'accidents de travail et maladies professionnelles',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 403-2',
        description: 'Liste des types d\'accidents de travail et de maladies professionnelles.'
      },
      {
        id: 'S5.2', label: 'Taux d\'accidents de travail (TAT)',
        unit: 'ratio', type: 'numeric', gri: 'GRI 403-2',
        description: 'Le taux d\'accidents de travail, le taux de maladies professionnelles, le taux de journées perdues, le taux d\'absentéisme et les décès liés au travail.'
      },
      // S6 - SST Plan d'atténuation (GRI 103)
      {
        id: 'S6', label: 'Plan d\'atténuation des risques SST',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 103',
        description: 'Analyse des risques liés à la santé et à la sécurité au travail (SST) et mise en place d\'un plan d\'atténuation y compris les risques psychosociaux.'
      },
      // S7 - Politique Générale SST (GRI 409)
      {
        id: 'S7.1', label: 'Politique d\'élimination du travail forcé/enfants',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 409',
        description: 'L\'existence d\'une politique destinée à l\'élimination (abolition) de toute forme de travail forcé et/ou des enfants.'
      },
      {
        id: 'S7.2', label: 'Communication SST aux fournisseurs/clients',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 409',
        description: 'Si oui, est-ce que cette politique est communiquée aux fournisseurs et aux clients.'
      },
      // S8 - Droits de l'Homme (GRI 412)
      {
        id: 'S8.1', label: 'Politique relative aux droits de l\'Homme',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 412',
        description: 'L\'existence d\'une politique au sein de l\'entreprise relative aux droits de l\'Homme.'
      },
      {
        id: 'S8.2', label: 'Couverture clients et fournisseurs',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 412',
        description: 'Si Oui, est-ce que cette politique couvre les clients et les fournisseurs.'
      },
      // S9 - Formation (GRI 404-2)
      {
        id: 'S9.1', label: 'Heures de formation par salarié/an',
        unit: 'heures', type: 'numeric', gri: 'GRI 404-2',
        description: 'Nombre moyen d\'heures de formation par an, par salarié et par catégorie professionnelle.'
      },
      {
        id: 'S9.2', label: 'Heures de formation environnementale/sociétale',
        unit: 'heures', type: 'numeric', gri: 'GRI 404-2',
        description: 'Nombre moyen d\'heures de formation dédiée aux thèmes environnementaux et sociétaux.'
      },
      // S10 - Communautés locales (GRI 413)
      {
        id: 'S10.1', label: 'Programmes de développement communautés locales',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 413',
        description: 'Liste des programmes de développement des communautés locales fondés sur leurs besoins.'
      },
      {
        id: 'S10.2', label: '% du CA investi dans la communauté locale',
        unit: '%', type: 'numeric', gri: 'GRI 413',
        description: 'Le pourcentage du chiffre d\'affaire de l\'entreprise investi au niveau de la communauté locale.'
      },
    ]
  },
  {
    id: 'G',
    label: 'Gouvernance',
    weight: 0.30,
    indicators: [
      // G1 - Diversité des organes de direction (GRI 405)
      {
        id: 'G1.1', label: '% femmes dans les instances de gouvernance',
        unit: '%', type: 'numeric', gri: 'GRI 405',
        description: 'Le pourcentage de femmes au sein des instances de gouvernance et de direction de l\'organisation.'
      },
      {
        id: 'G1.2', label: '% femmes dans les comités du CA',
        unit: '%', type: 'numeric', gri: 'GRI 405',
        description: 'Le pourcentage des femmes au sein des comités du Conseil d\'Administration.'
      },
      // G2 - Indépendance du CA (GRI 102)
      {
        id: 'G2.1', label: 'Séparation DG / Président CA',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102',
        description: 'La séparation entre les fonctions de Directeur Général et celle du président du Conseil d\'Administration.'
      },
      {
        id: 'G2.2', label: '% administrateurs indépendants',
        unit: '%', type: 'numeric', gri: 'GRI 102',
        description: 'Le pourcentage des administrateurs indépendants au sein du Conseil d\'Administration.'
      },
      // G3 - Rémunération et Incitations (GRI 102-35/36)
      {
        id: 'G3.1', label: 'Publication politique de rémunération',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102-35',
        description: 'La publication d\'informations concernant les politiques de rémunération en vigueur de l\'organe de direction.'
      },
      {
        id: 'G3.2', label: 'Critères RSE dans rémunération dirigeants',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102-36',
        description: 'Prise en compte de critères de performance RSE dans la rémunération des cadres dirigeants.'
      },
      // G4 - Accords et Négociations Collectives (GRI 102-41)
      {
        id: 'G4', label: '% employés couverts par accords collectifs',
        unit: '%', type: 'numeric', gri: 'GRI 102-41',
        description: 'Le pourcentage du nombre total d\'employés couverts par des accords de négociation collective.'
      },
      // G5 - Évaluation Fournisseurs (GRI 414-1, 308, 102-9)
      {
        id: 'G5.1', label: 'Description de la chaîne d\'approvisionnement',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 414-1',
        description: 'Une description de la chaîne d\'approvisionnement de l\'organisation.'
      },
      {
        id: 'G5.2', label: 'Systèmes d\'analyse fournisseurs (critères ESG)',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 308 / GRI 102-9',
        description: 'Les systèmes utilisés pour analyser les fournisseurs à l\'aide de critères sociaux et environnementaux.'
      },
      {
        id: 'G5.3', label: '% fournisseurs analysés sur critères ESG',
        unit: '%', type: 'numeric', gri: 'GRI 102-9',
        description: 'Pourcentage des fournisseurs et des partenaires de la chaîne d\'approvisionnement analysés.'
      },
      // G6 - Éthique et intégrité (GRI 102, 103)
      {
        id: 'G6.1', label: 'Code de bonne conduite / éthique',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102',
        description: 'L\'existence dans l\'entreprise d\'un code de bonne conduite et/ou de déontologie et/ou d\'éthique.'
      },
      {
        id: 'G6.2', label: '% formés aux questions éthiques/anti-corruption',
        unit: '%', type: 'numeric', gri: 'GRI 103',
        description: 'Le pourcentage des membres de gouvernance, des employés et des partenaires formés aux questions éthiques et anti-corruption.'
      },
      {
        id: 'G6.3', label: 'Politique anti-corruption',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 103',
        description: 'L\'existence dans l\'entreprise d\'une politique de lutte contre la corruption.'
      },
      // G7 - Confidentialité des données (GRI 103, 418)
      {
        id: 'G7', label: 'Politique de confidentialité des données',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 103 / GRI 418',
        description: 'L\'existence dans l\'entreprise d\'une politique de confidentialité des données.'
      },
      // G8 - Principe de la légalité (GRI 307, 419)
      {
        id: 'G8', label: '% départements évalués conformité réglementaire',
        unit: '%', type: 'numeric', gri: 'GRI 307 / GRI 419',
        description: 'Taux de départements internes ayant été concernés par une évaluation de conformité réglementaire.'
      },
      // G9 - Implication des parties prenantes (GRI 101, 102-42/43/44)
      {
        id: 'G9.1', label: 'Liste des groupes de parties prenantes',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 101 / GRI 102-42',
        description: 'Une liste des groupes de parties prenantes avec lesquelles l\'entreprise a noué un dialogue.'
      },
      {
        id: 'G9.2', label: 'Fréquence du dialogue parties prenantes',
        unit: 'nombre/an', type: 'numeric', gri: 'GRI 102-43',
        description: 'Modalités et fréquence du dialogue par type et par groupe de parties prenantes.'
      },
      {
        id: 'G9.3', label: 'Documentation des préoccupations clés',
        unit: 'Oui/Non', type: 'binary', gri: 'GRI 102-44',
        description: 'Questions et préoccupations clés soulevées dans le cadre du dialogue avec les parties prenantes et la manière dont l\'organisation a répondu.'
      },
      // G10 - Achats Responsables
      {
        id: 'G10.1', label: 'Part des achats auprès des startups',
        unit: '%', type: 'numeric', gri: '',
        description: 'Part des achats auprès des startups ou initiatives en faveur des startups.'
      },
      {
        id: 'G10.2', label: 'Part des achats auprès des TPE/ESS',
        unit: '%', type: 'numeric', gri: '',
        description: 'Part des achats auprès de TPE, avec indication du pourcentage de coopérative et de toute entreprise de l\'ESS.'
      },
      {
        id: 'G10.3', label: 'Délai moyen de paiement fournisseurs TPE/PME',
        unit: 'jours', type: 'numeric', gri: '',
        description: 'Délai moyen de paiement des fournisseurs TPE/PME.'
      },
      // G11 - Reporting ESG
      {
        id: 'G11', label: 'Publication d\'un rapport RSE-DD',
        unit: 'Oui/Non', type: 'binary', gri: 'RSE-DD',
        description: 'Publication d\'un rapport RSE-DD (Oui/Non).'
      },
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

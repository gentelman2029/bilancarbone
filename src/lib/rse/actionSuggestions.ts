// Tunisia-Compliant RSE Action Suggestions Library

import { RSEAction } from './types';

export interface ActionSuggestion {
  kpiId: string;
  kpiLabel: string;
  threshold: number; // Score below which suggestion is triggered
  category: 'E' | 'S' | 'G';
  suggestions: Omit<RSEAction, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'isSuggestion'>[];
}

export const ACTION_SUGGESTIONS_LIBRARY: ActionSuggestion[] = [
  // Environment - E1: Energy Consumption
  {
    kpiId: 'E1',
    kpiLabel: 'Consommation d\'énergie',
    threshold: 50,
    category: 'E',
    suggestions: [
      {
        title: 'Audit énergétique obligatoire ANME',
        description: 'Réaliser un audit énergétique complet selon les normes ANME pour identifier les gisements d\'économie.',
        priority: 'high',
        linkedKpiId: 'E1',
        linkedKpiLabel: 'Consommation totale d\'énergie',
        legislationRef: ['Décret 2009-2269', 'Programme ANME'],
        impactMetrics: {
          costEstimated: 15000,
          kpiImpactPoints: 15,
          regionalImpact: true,
        },
        assignedTo: 'Directeur Technique',
        deadline: '',
        category: 'E',
      },
      {
        title: 'Programme d\'efficacité énergétique',
        description: 'Mettre en place un système de gestion de l\'énergie ISO 50001.',
        priority: 'medium',
        linkedKpiId: 'E1',
        linkedKpiLabel: 'Consommation totale d\'énergie',
        legislationRef: ['ISO 50001', 'CSRD ESRS E1'],
        impactMetrics: {
          costEstimated: 50000,
          kpiImpactPoints: 20,
          regionalImpact: false,
        },
        assignedTo: 'Responsable Environnement',
        deadline: '',
        category: 'E',
      },
    ],
  },
  // E3: Renewable Energy Mix
  {
    kpiId: 'E3',
    kpiLabel: 'Mix Énergétique',
    threshold: 50,
    category: 'E',
    suggestions: [
      {
        title: 'Installation Centrale Photovoltaïque Toiture',
        description: 'Étude et installation de panneaux solaires conformément à la loi sur la production d\'électricité renouvelable.',
        priority: 'high',
        linkedKpiId: 'E3',
        linkedKpiLabel: 'Part des énergies renouvelables',
        legislationRef: ['Loi 2015-12 Production Électricité Renouvelable', 'CSRD ESRS E1'],
        impactMetrics: {
          costEstimated: 150000,
          co2ReductionTarget: 45,
          kpiImpactPoints: 25,
          regionalImpact: true,
        },
        assignedTo: 'Directeur Technique',
        deadline: '',
        category: 'E',
      },
      {
        title: 'Contrat PPA Énergie Verte',
        description: 'Négocier un Power Purchase Agreement avec un producteur d\'énergie renouvelable agréé STEG.',
        priority: 'medium',
        linkedKpiId: 'E3',
        linkedKpiLabel: 'Part des énergies renouvelables',
        legislationRef: ['Décret 2016-1123', 'CSRD ESRS E1'],
        impactMetrics: {
          costEstimated: 20000,
          kpiImpactPoints: 15,
          regionalImpact: false,
        },
        assignedTo: 'Directeur Achats',
        deadline: '',
        category: 'E',
      },
    ],
  },
  // E4: Water Consumption
  {
    kpiId: 'E4',
    kpiLabel: 'Consommation d\'eau',
    threshold: 50,
    category: 'E',
    suggestions: [
      {
        title: 'Programme de réduction de consommation d\'eau',
        description: 'Installer des compteurs intelligents et des systèmes de récupération d\'eau de pluie.',
        priority: 'high',
        linkedKpiId: 'E4',
        linkedKpiLabel: 'Consommation totale d\'eau',
        legislationRef: ['Code des Eaux Tunisie', 'Plan National Eau 2050'],
        impactMetrics: {
          costEstimated: 80000,
          kpiImpactPoints: 20,
          regionalImpact: true,
        },
        assignedTo: 'Responsable Environnement',
        deadline: '',
        category: 'E',
      },
    ],
  },
  // E5: Water Recycling
  {
    kpiId: 'E5',
    kpiLabel: 'Recyclage de l\'eau',
    threshold: 50,
    category: 'E',
    suggestions: [
      {
        title: 'Station de traitement des eaux usées',
        description: 'Installer une STEP pour recycler les eaux industrielles conformément aux normes ONAS.',
        priority: 'high',
        linkedKpiId: 'E5',
        linkedKpiLabel: 'Taux de recyclage de l\'eau',
        legislationRef: ['Loi 75-16 Eaux', 'Normes ONAS NT 106.02'],
        impactMetrics: {
          costEstimated: 250000,
          kpiImpactPoints: 30,
          regionalImpact: true,
        },
        assignedTo: 'Directeur Technique',
        deadline: '',
        category: 'E',
      },
    ],
  },
  // E6 & E7: Carbon Emissions
  {
    kpiId: 'E6',
    kpiLabel: 'Émissions Scope 1',
    threshold: 50,
    category: 'E',
    suggestions: [
      {
        title: 'Plan de Décarbonation MACF',
        description: 'Élaborer un plan de réduction des émissions pour anticiper le Mécanisme d\'Ajustement Carbone aux Frontières.',
        priority: 'high',
        linkedKpiId: 'E6',
        linkedKpiLabel: 'Émissions Scope 1 (Directes)',
        legislationRef: ['Règlement UE 2023/956 MACF', 'CSRD ESRS E1'],
        impactMetrics: {
          costEstimated: 75000,
          co2ReductionTarget: 100,
          kpiImpactPoints: 20,
          regionalImpact: false,
        },
        assignedTo: 'Directeur Développement Durable',
        deadline: '',
        category: 'E',
      },
    ],
  },
  // E9 & E10: Waste Management
  {
    kpiId: 'E9',
    kpiLabel: 'Gestion des déchets',
    threshold: 50,
    category: 'E',
    suggestions: [
      {
        title: 'Programme de valorisation des déchets ANGed',
        description: 'Mettre en place un système de tri et de valorisation conforme aux exigences ANGed.',
        priority: 'medium',
        linkedKpiId: 'E9',
        linkedKpiLabel: 'Production totale de déchets',
        legislationRef: ['Loi 96-41 Déchets', 'Programme ANGed'],
        impactMetrics: {
          costEstimated: 45000,
          kpiImpactPoints: 15,
          regionalImpact: true,
        },
        assignedTo: 'Responsable Environnement',
        deadline: '',
        category: 'E',
      },
    ],
  },
  // S2: Gender Balance
  {
    kpiId: 'S2',
    kpiLabel: 'Féminisation',
    threshold: 50,
    category: 'S',
    suggestions: [
      {
        title: 'Programme d\'égalité professionnelle',
        description: 'Développer un plan d\'action pour l\'égalité H/F conformément au Code du Travail tunisien.',
        priority: 'medium',
        linkedKpiId: 'S2',
        linkedKpiLabel: 'Taux de féminisation',
        legislationRef: ['Code du Travail Art. 5 bis', 'CSRD ESRS S1'],
        impactMetrics: {
          costEstimated: 30000,
          kpiImpactPoints: 15,
          regionalImpact: false,
        },
        assignedTo: 'DRH',
        deadline: '',
        category: 'S',
      },
    ],
  },
  // S3: Gender Pay Gap
  {
    kpiId: 'S3',
    kpiLabel: 'Écart salarial',
    threshold: 50,
    category: 'S',
    suggestions: [
      {
        title: 'Audit de rémunération H/F',
        description: 'Réaliser un audit des écarts de rémunération et établir un plan de correction.',
        priority: 'high',
        linkedKpiId: 'S3',
        linkedKpiLabel: 'Écart salarial Homme/Femme',
        legislationRef: ['Constitution Tunisie Art. 21', 'CSRD ESRS S1'],
        impactMetrics: {
          costEstimated: 25000,
          kpiImpactPoints: 20,
          regionalImpact: false,
        },
        assignedTo: 'DRH',
        deadline: '',
        category: 'S',
      },
    ],
  },
  // S7: Training
  {
    kpiId: 'S7',
    kpiLabel: 'Formation',
    threshold: 50,
    category: 'S',
    suggestions: [
      {
        title: 'Convention Université-Entreprise',
        description: 'Établir des partenariats avec les universités locales pour l\'employabilité et la formation continue.',
        priority: 'medium',
        linkedKpiId: 'S7',
        linkedKpiLabel: 'Heures de formation par employé',
        legislationRef: ['Loi 2008-10 Formation Professionnelle', 'Loi RSE 2018-35'],
        impactMetrics: {
          costEstimated: 40000,
          kpiImpactPoints: 15,
          regionalImpact: true,
        },
        assignedTo: 'DRH',
        deadline: '',
        category: 'S',
      },
    ],
  },
  // S12: Local Sponsorship
  {
    kpiId: 'S12',
    kpiLabel: 'Mécénat local',
    threshold: 50,
    category: 'S',
    suggestions: [
      {
        title: 'Programme de mécénat culturel régional',
        description: 'Soutenir des initiatives culturelles et éducatives dans la région d\'implantation.',
        priority: 'low',
        linkedKpiId: 'S12',
        linkedKpiLabel: 'Dépenses mécénat/RSE local',
        legislationRef: ['Loi RSE 2018-35 Art.3', 'Développement Régional'],
        impactMetrics: {
          costEstimated: 50000,
          kpiImpactPoints: 10,
          regionalImpact: true,
        },
        assignedTo: 'Direction Générale',
        deadline: '',
        category: 'S',
      },
    ],
  },
  // G2: Board Independence
  {
    kpiId: 'G2',
    kpiLabel: 'Indépendance CA',
    threshold: 50,
    category: 'G',
    suggestions: [
      {
        title: 'Recrutement d\'administrateurs indépendants',
        description: 'Nommer des administrateurs indépendants conformément au Code de Gouvernance CMF.',
        priority: 'high',
        linkedKpiId: 'G2',
        linkedKpiLabel: 'Administrateurs Indépendants',
        legislationRef: ['Code Gouvernance CMF 2012', 'CSRD ESRS G1'],
        impactMetrics: {
          costEstimated: 60000,
          kpiImpactPoints: 20,
          regionalImpact: false,
        },
        assignedTo: 'Président du CA',
        deadline: '',
        category: 'G',
      },
    ],
  },
  // G4: CSR Committee
  {
    kpiId: 'G4',
    kpiLabel: 'Comité RSE',
    threshold: 50,
    category: 'G',
    suggestions: [
      {
        title: 'Création d\'un Comité RSE',
        description: 'Mettre en place un comité RSE rattaché au Conseil d\'Administration.',
        priority: 'high',
        linkedKpiId: 'G4',
        linkedKpiLabel: 'Existence Comité RSE',
        legislationRef: ['Loi RSE 2018-35', 'CSRD ESRS G1'],
        impactMetrics: {
          costEstimated: 15000,
          kpiImpactPoints: 25,
          regionalImpact: false,
        },
        assignedTo: 'Direction Générale',
        deadline: '',
        category: 'G',
      },
    ],
  },
  // G5: Anti-corruption
  {
    kpiId: 'G5',
    kpiLabel: 'Anti-corruption',
    threshold: 50,
    category: 'G',
    suggestions: [
      {
        title: 'Certification ISO 37001 Anti-corruption',
        description: 'Obtenir la certification ISO 37001 pour démontrer l\'engagement contre la corruption.',
        priority: 'high',
        linkedKpiId: 'G5',
        linkedKpiLabel: 'Code Anti-corruption',
        legislationRef: ['Loi 2017-10 Corruption', 'ISO 37001', 'CSRD ESRS G1'],
        impactMetrics: {
          costEstimated: 80000,
          kpiImpactPoints: 30,
          regionalImpact: false,
        },
        assignedTo: 'Direction Juridique',
        deadline: '',
        category: 'G',
      },
    ],
  },
  // G8: Whistleblowing
  {
    kpiId: 'G8',
    kpiLabel: 'Alerte professionnelle',
    threshold: 50,
    category: 'G',
    suggestions: [
      {
        title: 'Mise en place d\'un dispositif de signalement',
        description: 'Créer un système d\'alerte anonyme pour les employés conformément à la loi sur les lanceurs d\'alerte.',
        priority: 'medium',
        linkedKpiId: 'G8',
        linkedKpiLabel: 'Dispositif d\'alerte professionnelle',
        legislationRef: ['Loi 2017-10 Art.17', 'Directive UE 2019/1937'],
        impactMetrics: {
          costEstimated: 25000,
          kpiImpactPoints: 20,
          regionalImpact: false,
        },
        assignedTo: 'Direction Juridique',
        deadline: '',
        category: 'G',
      },
    ],
  },
  // G9: Local Suppliers
  {
    kpiId: 'G9',
    kpiLabel: 'Fournisseurs locaux',
    threshold: 50,
    category: 'G',
    suggestions: [
      {
        title: 'Programme d\'achats locaux',
        description: 'Développer un programme de sourcing auprès de fournisseurs tunisiens pour soutenir l\'économie régionale.',
        priority: 'medium',
        linkedKpiId: 'G9',
        linkedKpiLabel: 'Taux de fournisseurs locaux',
        legislationRef: ['Loi RSE 2018-35', 'Développement Régional'],
        impactMetrics: {
          costEstimated: 35000,
          kpiImpactPoints: 15,
          regionalImpact: true,
        },
        assignedTo: 'Directeur Achats',
        deadline: '',
        category: 'G',
      },
    ],
  },
];

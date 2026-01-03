// GHG Protocol - 15 Scope 3 Categories Configuration
// Conforme aux standards du GHG Protocol Corporate Value Chain (Scope 3) Accounting and Reporting Standard

export type CalculationMethod = 'actual' | 'technical' | 'monetary';

export interface EmissionFactor {
  value: number;
  unit: string;
  source: string;
  uncertainty: number; // % d'incertitude
}

export interface Scope3SubCategory {
  id: string;
  name: string;
  description: string;
  unit: string;
  emissionFactors: {
    actual?: EmissionFactor;
    technical?: EmissionFactor;
    monetary?: EmissionFactor;
  };
  examples?: string[];
}

export interface Scope3Category {
  id: string;
  number: number; // 1-15 selon GHG Protocol
  name: string;
  nameShort: string;
  description: string;
  direction: 'upstream' | 'downstream';
  relevance: string;
  subcategories: Scope3SubCategory[];
  defaultMethod: CalculationMethod;
  availableMethods: CalculationMethod[];
}

// Facteurs d'émission Base Carbone ADEME et sources reconnues
export const SCOPE3_CATEGORIES: Scope3Category[] = [
  // ========================================
  // UPSTREAM (Amont) - Categories 1-8
  // ========================================
  {
    id: 'purchased_goods_services',
    number: 1,
    name: 'Biens et services achetés',
    nameShort: 'Achats',
    description: 'Émissions liées à la production de biens et services achetés par l\'entreprise',
    direction: 'upstream',
    relevance: 'Souvent le poste le plus important du Scope 3',
    defaultMethod: 'monetary',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      // Matériaux
      {
        id: 'steel',
        name: 'Acier',
        description: 'Acier primaire et secondaire',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 1.46, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 10 },
          monetary: { value: 0.89, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        },
        examples: ['Tôles', 'Profilés', 'Pièces usinées']
      },
      {
        id: 'aluminium',
        name: 'Aluminium',
        description: 'Aluminium primaire et secondaire',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 8.24, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 10 },
          monetary: { value: 1.25, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        },
        examples: ['Profilés alu', 'Pièces moulées']
      },
      {
        id: 'plastics',
        name: 'Plastiques',
        description: 'Polymères et plastiques divers',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 2.28, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME - PET', uncertainty: 15 },
          monetary: { value: 0.75, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        },
        examples: ['PET', 'PP', 'PE', 'PVC']
      },
      {
        id: 'paper_cardboard',
        name: 'Papier et carton',
        description: 'Papier, carton, emballages',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.92, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 15 },
          monetary: { value: 0.45, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        },
        examples: ['Cartons d\'emballage', 'Papier bureau']
      },
      {
        id: 'cement',
        name: 'Ciment',
        description: 'Ciment et béton',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.918, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 10 },
          monetary: { value: 0.35, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'glass',
        name: 'Verre',
        description: 'Verre plat et creux',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.85, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'copper',
        name: 'Cuivre',
        description: 'Cuivre et alliages',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 4.20, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'chemicals',
        name: 'Produits chimiques',
        description: 'Produits chimiques industriels',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 2.5, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME - moyenne', uncertainty: 25 },
          monetary: { value: 0.65, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      // Services
      {
        id: 'it_services',
        name: 'Services informatiques',
        description: 'Conseil IT, développement, maintenance',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.28, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'legal_consulting',
        name: 'Services juridiques et conseil',
        description: 'Avocats, consultants, audit',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.12, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 25 }
        }
      },
      {
        id: 'marketing_advertising',
        name: 'Marketing et publicité',
        description: 'Agences, campagnes publicitaires',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.18, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'insurance',
        name: 'Assurances',
        description: 'Services d\'assurance',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.08, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 25 }
        }
      },
      {
        id: 'maintenance_services',
        name: 'Maintenance et entretien',
        description: 'Services de maintenance bâtiments et équipements',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.22, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'office_supplies',
        name: 'Fournitures de bureau',
        description: 'Consommables, petit matériel',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.45, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'cleaning_services',
        name: 'Services de nettoyage',
        description: 'Nettoyage locaux et équipements',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.15, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'catering',
        name: 'Restauration',
        description: 'Restauration collective et traiteurs',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.55, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      }
    ]
  },
  {
    id: 'capital_goods',
    number: 2,
    name: 'Biens d\'équipement (Immobilisations)',
    nameShort: 'Immobilisations',
    description: 'Émissions liées à la production des biens d\'équipement achetés ou acquis',
    direction: 'upstream',
    relevance: 'Important pour les entreprises avec des investissements significatifs',
    defaultMethod: 'monetary',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      {
        id: 'buildings',
        name: 'Bâtiments',
        description: 'Construction et rénovation de bâtiments',
        unit: 'm²',
        emissionFactors: {
          actual: { value: 450, unit: 'kgCO2e/m²', source: 'Base Carbone ADEME - bureau neuf', uncertainty: 20 },
          monetary: { value: 0.35, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        },
        examples: ['Bureaux', 'Usines', 'Entrepôts']
      },
      {
        id: 'machinery',
        name: 'Machines et équipements',
        description: 'Machines industrielles et de production',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 3.5, unit: 'kgCO2e/kg', source: 'Estimation technique', uncertainty: 25 },
          monetary: { value: 0.45, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'vehicles',
        name: 'Véhicules',
        description: 'Véhicules de société et utilitaires',
        unit: 'unité',
        emissionFactors: {
          actual: { value: 6000, unit: 'kgCO2e/véhicule', source: 'Base Carbone ADEME - VP moyenne', uncertainty: 20 },
          monetary: { value: 0.38, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'it_equipment',
        name: 'Équipement informatique',
        description: 'Ordinateurs, serveurs, équipements réseau',
        unit: 'unité',
        emissionFactors: {
          actual: { value: 350, unit: 'kgCO2e/ordinateur', source: 'Base Carbone ADEME', uncertainty: 20 },
          monetary: { value: 0.55, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      },
      {
        id: 'furniture',
        name: 'Mobilier',
        description: 'Mobilier de bureau et d\'aménagement',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 1.8, unit: 'kgCO2e/kg', source: 'Estimation technique', uncertainty: 25 },
          monetary: { value: 0.32, unit: 'kgCO2e/€', source: 'ADEME - Ratios monétaires', uncertainty: 30 }
        }
      }
    ]
  },
  {
    id: 'fuel_energy_activities',
    number: 3,
    name: 'Activités liées à l\'énergie (hors Scopes 1 & 2)',
    nameShort: 'Énergie amont',
    description: 'Émissions amont de l\'extraction, production et transport des combustibles et de l\'électricité',
    direction: 'upstream',
    relevance: 'Complète les Scopes 1 et 2 pour une vision complète de l\'énergie',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'upstream_electricity',
        name: 'Amont électricité',
        description: 'Extraction et production du combustible pour l\'électricité',
        unit: 'kWh',
        emissionFactors: {
          actual: { value: 0.012, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME - amont élec FR', uncertainty: 15 }
        }
      },
      {
        id: 'upstream_natural_gas',
        name: 'Amont gaz naturel',
        description: 'Extraction, traitement et transport du gaz naturel',
        unit: 'kWh PCI',
        emissionFactors: {
          actual: { value: 0.039, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'upstream_diesel',
        name: 'Amont gazole',
        description: 'Extraction et raffinage du pétrole pour le gazole',
        unit: 'litre',
        emissionFactors: {
          actual: { value: 0.62, unit: 'kgCO2e/L', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'upstream_gasoline',
        name: 'Amont essence',
        description: 'Extraction et raffinage du pétrole pour l\'essence',
        unit: 'litre',
        emissionFactors: {
          actual: { value: 0.51, unit: 'kgCO2e/L', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'transmission_losses',
        name: 'Pertes en ligne électricité',
        description: 'Pertes dans le réseau de transport et distribution',
        unit: 'kWh',
        emissionFactors: {
          actual: { value: 0.0045, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      }
    ]
  },
  {
    id: 'upstream_transport',
    number: 4,
    name: 'Transport et distribution amont',
    nameShort: 'Transport amont',
    description: 'Transport et distribution des produits achetés entre les fournisseurs et l\'entreprise',
    direction: 'upstream',
    relevance: 'Significatif pour les entreprises avec des chaînes d\'approvisionnement longues',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      {
        id: 'road_transport',
        name: 'Transport routier',
        description: 'Camions et véhicules utilitaires',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 0.111, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME - poids lourd', uncertainty: 15 },
          monetary: { value: 0.85, unit: 'kgCO2e/€', source: 'Estimation', uncertainty: 35 }
        }
      },
      {
        id: 'rail_transport',
        name: 'Transport ferroviaire',
        description: 'Fret ferroviaire',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 0.033, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'maritime_transport',
        name: 'Transport maritime',
        description: 'Porte-conteneurs et vraquiers',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 0.015, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'air_transport',
        name: 'Transport aérien',
        description: 'Fret aérien cargo',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 1.47, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'river_transport',
        name: 'Transport fluvial',
        description: 'Barges et péniches',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 0.037, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      }
    ]
  },
  {
    id: 'waste_generated',
    number: 5,
    name: 'Déchets générés par les activités',
    nameShort: 'Déchets',
    description: 'Traitement et élimination des déchets générés par l\'entreprise',
    direction: 'upstream',
    relevance: 'Important pour les entreprises avec production significative de déchets',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'recycling',
        name: 'Recyclage',
        description: 'Déchets envoyés au recyclage',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.025, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'incineration',
        name: 'Incinération',
        description: 'Incinération avec récupération d\'énergie',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.78, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'landfill',
        name: 'Enfouissement',
        description: 'Mise en décharge',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.48, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 25 }
        }
      },
      {
        id: 'composting',
        name: 'Compostage',
        description: 'Déchets organiques compostés',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.015, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 25 }
        }
      },
      {
        id: 'methanization',
        name: 'Méthanisation',
        description: 'Valorisation énergétique par méthanisation',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.022, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 25 }
        }
      },
      {
        id: 'hazardous_waste',
        name: 'Déchets dangereux',
        description: 'Traitement des déchets dangereux',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 1.2, unit: 'kgCO2e/kg', source: 'Estimation technique', uncertainty: 30 }
        }
      }
    ]
  },
  {
    id: 'business_travel',
    number: 6,
    name: 'Déplacements professionnels',
    nameShort: 'Voyages pro',
    description: 'Déplacements des employés pour des raisons professionnelles',
    direction: 'upstream',
    relevance: 'Significatif pour les entreprises avec beaucoup de voyages',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      {
        id: 'air_short_haul',
        name: 'Avion court-courrier',
        description: 'Vols < 1000 km',
        unit: 'passager.km',
        emissionFactors: {
          actual: { value: 0.230, unit: 'kgCO2e/p.km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'air_medium_haul',
        name: 'Avion moyen-courrier',
        description: 'Vols 1000-3500 km',
        unit: 'passager.km',
        emissionFactors: {
          actual: { value: 0.187, unit: 'kgCO2e/p.km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'air_long_haul',
        name: 'Avion long-courrier',
        description: 'Vols > 3500 km',
        unit: 'passager.km',
        emissionFactors: {
          actual: { value: 0.152, unit: 'kgCO2e/p.km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'train_tgv',
        name: 'Train grande vitesse (TGV)',
        description: 'TGV et Eurostar',
        unit: 'passager.km',
        emissionFactors: {
          actual: { value: 0.0032, unit: 'kgCO2e/p.km', source: 'Base Carbone ADEME', uncertainty: 10 }
        }
      },
      {
        id: 'train_ter',
        name: 'Train régional (TER)',
        description: 'TER et Intercités',
        unit: 'passager.km',
        emissionFactors: {
          actual: { value: 0.0295, unit: 'kgCO2e/p.km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'car_rental',
        name: 'Voiture de location',
        description: 'Véhicule de location diesel/essence',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.193, unit: 'kgCO2e/km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'taxi',
        name: 'Taxi/VTC',
        description: 'Services de taxi et VTC',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.220, unit: 'kgCO2e/km', source: 'Estimation technique', uncertainty: 20 }
        }
      },
      {
        id: 'hotel_nights',
        name: 'Nuitées d\'hôtel',
        description: 'Hébergement en hôtel',
        unit: 'nuitée',
        emissionFactors: {
          actual: { value: 19.5, unit: 'kgCO2e/nuitée', source: 'Base Carbone ADEME - hôtel moyen', uncertainty: 25 }
        }
      }
    ]
  },
  {
    id: 'employee_commuting',
    number: 7,
    name: 'Déplacements domicile–travail',
    nameShort: 'Trajets salariés',
    description: 'Trajets des employés entre leur domicile et leur lieu de travail',
    direction: 'upstream',
    relevance: 'Significatif pour les entreprises avec beaucoup d\'employés',
    defaultMethod: 'technical',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'car_commute',
        name: 'Voiture individuelle',
        description: 'Véhicule personnel',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.193, unit: 'kgCO2e/km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'carpool',
        name: 'Covoiturage',
        description: 'Véhicule partagé (2+ personnes)',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.097, unit: 'kgCO2e/km', source: 'Base Carbone ADEME / 2', uncertainty: 20 }
        }
      },
      {
        id: 'public_transport',
        name: 'Transports en commun',
        description: 'Bus, métro, tramway',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.035, unit: 'kgCO2e/km', source: 'Base Carbone ADEME - moyenne TC', uncertainty: 20 }
        }
      },
      {
        id: 'train_commute',
        name: 'Train de banlieue',
        description: 'RER, Transilien',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.0045, unit: 'kgCO2e/km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'motorcycle',
        name: 'Moto/Scooter',
        description: 'Deux-roues motorisé',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.089, unit: 'kgCO2e/km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'bicycle',
        name: 'Vélo/Marche',
        description: 'Mobilité douce',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.0, unit: 'kgCO2e/km', source: 'Zéro émission directe', uncertainty: 0 }
        }
      },
      {
        id: 'telework',
        name: 'Télétravail',
        description: 'Jours de travail à domicile',
        unit: 'jour',
        emissionFactors: {
          actual: { value: 1.2, unit: 'kgCO2e/jour', source: 'ADEME - consommation domicile', uncertainty: 30 }
        }
      }
    ]
  },
  {
    id: 'upstream_leased_assets',
    number: 8,
    name: 'Actifs loués amont',
    nameShort: 'Locations amont',
    description: 'Émissions des actifs loués par l\'entreprise (non comptabilisés en Scope 1 ou 2)',
    direction: 'upstream',
    relevance: 'Pour les entreprises louant des bureaux, véhicules ou équipements',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      {
        id: 'leased_offices',
        name: 'Bureaux loués',
        description: 'Consommation énergétique des bureaux loués',
        unit: 'm².an',
        emissionFactors: {
          actual: { value: 25, unit: 'kgCO2e/m².an', source: 'ADEME - bureau tertiaire moyen', uncertainty: 25 },
          monetary: { value: 0.15, unit: 'kgCO2e/€ loyer', source: 'Estimation', uncertainty: 35 }
        }
      },
      {
        id: 'leased_vehicles',
        name: 'Véhicules loués',
        description: 'Fabrication des véhicules en leasing',
        unit: 'véhicule.an',
        emissionFactors: {
          actual: { value: 1200, unit: 'kgCO2e/véh.an', source: 'Base Carbone ADEME - amorti sur 5 ans', uncertainty: 25 }
        }
      },
      {
        id: 'leased_equipment',
        name: 'Équipements loués',
        description: 'Machines et équipements en location',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.35, unit: 'kgCO2e/€', source: 'Estimation technique', uncertainty: 35 }
        }
      },
      {
        id: 'leased_warehouses',
        name: 'Entrepôts loués',
        description: 'Surfaces de stockage louées',
        unit: 'm².an',
        emissionFactors: {
          actual: { value: 18, unit: 'kgCO2e/m².an', source: 'ADEME - entrepôt logistique', uncertainty: 25 }
        }
      }
    ]
  },

  // ========================================
  // DOWNSTREAM (Aval) - Categories 9-15
  // ========================================
  {
    id: 'downstream_transport',
    number: 9,
    name: 'Transport et distribution aval',
    nameShort: 'Transport aval',
    description: 'Transport et distribution des produits vendus aux clients',
    direction: 'downstream',
    relevance: 'Important pour les entreprises vendant des produits physiques',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      {
        id: 'delivery_road',
        name: 'Livraison routière',
        description: 'Livraison des produits par camion',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 0.111, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'delivery_express',
        name: 'Livraison express',
        description: 'Services de livraison rapide',
        unit: 'colis',
        emissionFactors: {
          actual: { value: 0.85, unit: 'kgCO2e/colis', source: 'Estimation - colis moyen', uncertainty: 30 }
        }
      },
      {
        id: 'delivery_maritime',
        name: 'Livraison maritime',
        description: 'Export par voie maritime',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 0.015, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'delivery_air',
        name: 'Livraison aérienne',
        description: 'Export par voie aérienne',
        unit: 't.km',
        emissionFactors: {
          actual: { value: 1.47, unit: 'kgCO2e/t.km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      }
    ]
  },
  {
    id: 'processing_sold_products',
    number: 10,
    name: 'Transformation des produits vendus',
    nameShort: 'Transformation aval',
    description: 'Transformation des produits intermédiaires par les clients (B2B)',
    direction: 'downstream',
    relevance: 'Pertinent pour les fournisseurs de produits intermédiaires',
    defaultMethod: 'technical',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'industrial_processing',
        name: 'Transformation industrielle',
        description: 'Énergie utilisée par les clients pour transformer les produits',
        unit: 'kWh',
        emissionFactors: {
          actual: { value: 0.057, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME - élec France', uncertainty: 20 }
        }
      },
      {
        id: 'assembly',
        name: 'Assemblage',
        description: 'Opérations d\'assemblage chez le client',
        unit: 'heure',
        emissionFactors: {
          technical: { value: 2.5, unit: 'kgCO2e/heure', source: 'Estimation technique', uncertainty: 35 }
        }
      }
    ]
  },
  {
    id: 'use_sold_products',
    number: 11,
    name: 'Utilisation des produits vendus',
    nameShort: 'Usage produits',
    description: 'Émissions liées à l\'utilisation des produits vendus par les clients',
    direction: 'downstream',
    relevance: 'Critique pour les produits consommateurs d\'énergie',
    defaultMethod: 'technical',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'electricity_consumption',
        name: 'Consommation électrique',
        description: 'Électricité consommée par les produits vendus',
        unit: 'kWh.an',
        emissionFactors: {
          actual: { value: 0.057, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME', uncertainty: 15 }
        }
      },
      {
        id: 'fuel_consumption',
        name: 'Consommation carburant',
        description: 'Carburant consommé par les produits vendus (véhicules)',
        unit: 'litre',
        emissionFactors: {
          actual: { value: 2.68, unit: 'kgCO2e/L', source: 'Base Carbone ADEME - diesel', uncertainty: 10 }
        }
      },
      {
        id: 'gas_consumption',
        name: 'Consommation gaz',
        description: 'Gaz naturel consommé par les produits vendus',
        unit: 'kWh PCI',
        emissionFactors: {
          actual: { value: 0.227, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME', uncertainty: 10 }
        }
      },
      {
        id: 'direct_emissions',
        name: 'Émissions directes d\'utilisation',
        description: 'Émissions directes lors de l\'usage (réfrigérants, etc.)',
        unit: 'kgCO2e',
        emissionFactors: {
          actual: { value: 1, unit: 'kgCO2e', source: 'Mesure directe', uncertainty: 20 }
        }
      }
    ]
  },
  {
    id: 'end_of_life',
    number: 12,
    name: 'Fin de vie des produits vendus',
    nameShort: 'Fin de vie',
    description: 'Traitement en fin de vie des produits vendus par l\'entreprise',
    direction: 'downstream',
    relevance: 'Important pour les produits avec impact significatif en fin de vie',
    defaultMethod: 'technical',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'product_recycling',
        name: 'Recyclage des produits',
        description: 'Produits recyclés en fin de vie',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.025, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 25 }
        }
      },
      {
        id: 'product_incineration',
        name: 'Incinération des produits',
        description: 'Produits incinérés en fin de vie',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.78, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 25 }
        }
      },
      {
        id: 'product_landfill',
        name: 'Enfouissement des produits',
        description: 'Produits mis en décharge',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.48, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME', uncertainty: 30 }
        }
      },
      {
        id: 'packaging_end_of_life',
        name: 'Fin de vie des emballages',
        description: 'Traitement des emballages produits',
        unit: 'kg',
        emissionFactors: {
          actual: { value: 0.35, unit: 'kgCO2e/kg', source: 'Base Carbone ADEME - mix', uncertainty: 30 }
        }
      }
    ]
  },
  {
    id: 'downstream_leased_assets',
    number: 13,
    name: 'Actifs loués aval',
    nameShort: 'Locations aval',
    description: 'Émissions des actifs détenus par l\'entreprise et loués à des tiers',
    direction: 'downstream',
    relevance: 'Pour les entreprises louant des actifs à des clients',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical'],
    subcategories: [
      {
        id: 'rented_buildings',
        name: 'Bâtiments loués',
        description: 'Consommation énergétique des bâtiments loués à des tiers',
        unit: 'm².an',
        emissionFactors: {
          actual: { value: 25, unit: 'kgCO2e/m².an', source: 'ADEME - bureau tertiaire moyen', uncertainty: 25 }
        }
      },
      {
        id: 'rented_vehicles',
        name: 'Véhicules loués à des tiers',
        description: 'Utilisation des véhicules de la flotte loués',
        unit: 'km',
        emissionFactors: {
          actual: { value: 0.193, unit: 'kgCO2e/km', source: 'Base Carbone ADEME', uncertainty: 20 }
        }
      },
      {
        id: 'rented_equipment',
        name: 'Équipements loués à des tiers',
        description: 'Utilisation des équipements loués',
        unit: 'kWh',
        emissionFactors: {
          actual: { value: 0.057, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME - élec France', uncertainty: 25 }
        }
      }
    ]
  },
  {
    id: 'franchises',
    number: 14,
    name: 'Franchises',
    nameShort: 'Franchises',
    description: 'Émissions des entités franchisées non comptabilisées en Scope 1 et 2',
    direction: 'downstream',
    relevance: 'Pour les franchiseurs uniquement',
    defaultMethod: 'actual',
    availableMethods: ['actual', 'technical', 'monetary'],
    subcategories: [
      {
        id: 'franchise_energy',
        name: 'Énergie des franchises',
        description: 'Consommation énergétique des points de vente franchisés',
        unit: 'kWh',
        emissionFactors: {
          actual: { value: 0.057, unit: 'kgCO2e/kWh', source: 'Base Carbone ADEME - élec France', uncertainty: 20 }
        }
      },
      {
        id: 'franchise_surface',
        name: 'Surface des franchises',
        description: 'Estimation par surface commerciale',
        unit: 'm²',
        emissionFactors: {
          technical: { value: 45, unit: 'kgCO2e/m².an', source: 'ADEME - commerce', uncertainty: 30 }
        }
      },
      {
        id: 'franchise_revenue',
        name: 'Chiffre d\'affaires franchises',
        description: 'Estimation par approche monétaire',
        unit: '€',
        emissionFactors: {
          monetary: { value: 0.15, unit: 'kgCO2e/€', source: 'Estimation sectorielle', uncertainty: 35 }
        }
      }
    ]
  },
  {
    id: 'investments',
    number: 15,
    name: 'Investissements financiers',
    nameShort: 'Investissements',
    description: 'Émissions associées aux investissements (PCAF - Partnership for Carbon Accounting Financials)',
    direction: 'downstream',
    relevance: 'Critique pour les institutions financières et holdings',
    defaultMethod: 'monetary',
    availableMethods: ['actual', 'monetary'],
    subcategories: [
      {
        id: 'equity_listed',
        name: 'Actions cotées',
        description: 'Participations dans des sociétés cotées',
        unit: 'M€',
        emissionFactors: {
          monetary: { value: 120, unit: 'tCO2e/M€', source: 'PCAF - moyenne actions', uncertainty: 35 }
        }
      },
      {
        id: 'equity_private',
        name: 'Actions non cotées',
        description: 'Participations dans des sociétés non cotées',
        unit: 'M€',
        emissionFactors: {
          monetary: { value: 150, unit: 'tCO2e/M€', source: 'PCAF - private equity', uncertainty: 40 }
        }
      },
      {
        id: 'corporate_bonds',
        name: 'Obligations d\'entreprises',
        description: 'Obligations et dettes corporate',
        unit: 'M€',
        emissionFactors: {
          monetary: { value: 85, unit: 'tCO2e/M€', source: 'PCAF - obligations', uncertainty: 35 }
        }
      },
      {
        id: 'sovereign_bonds',
        name: 'Obligations souveraines',
        description: 'Dettes souveraines',
        unit: 'M€',
        emissionFactors: {
          monetary: { value: 45, unit: 'tCO2e/M€', source: 'PCAF - souverain', uncertainty: 30 }
        }
      },
      {
        id: 'project_finance',
        name: 'Financement de projets',
        description: 'Prêts pour projets spécifiques',
        unit: 'M€',
        emissionFactors: {
          monetary: { value: 180, unit: 'tCO2e/M€', source: 'PCAF - project finance', uncertainty: 40 }
        }
      },
      {
        id: 'real_estate',
        name: 'Immobilier',
        description: 'Investissements immobiliers',
        unit: 'm²',
        emissionFactors: {
          actual: { value: 25, unit: 'kgCO2e/m².an', source: 'ADEME - tertiaire moyen', uncertainty: 25 }
        }
      }
    ]
  }
];

// Helper functions
export const getUpstreamCategories = () => SCOPE3_CATEGORIES.filter(c => c.direction === 'upstream');
export const getDownstreamCategories = () => SCOPE3_CATEGORIES.filter(c => c.direction === 'downstream');
export const getCategoryById = (id: string) => SCOPE3_CATEGORIES.find(c => c.id === id);
export const getCategoryByNumber = (num: number) => SCOPE3_CATEGORIES.find(c => c.number === num);

// Calcul des émissions
export const calculateEmissions = (
  subcategoryId: string,
  categoryId: string,
  quantity: number,
  method: CalculationMethod
): { emissions: number; uncertainty: number; source: string } | null => {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  
  const subcategory = category.subcategories.find(s => s.id === subcategoryId);
  if (!subcategory) return null;
  
  const factor = subcategory.emissionFactors[method];
  if (!factor) return null;
  
  return {
    emissions: quantity * factor.value,
    uncertainty: factor.uncertainty,
    source: factor.source
  };
};

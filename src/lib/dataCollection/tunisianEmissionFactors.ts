// Facteurs d'émission officiels pour la Tunisie
// Ces facteurs sont OBLIGATOIRES et ne peuvent pas être modifiés par l'IA
// L'utilisateur doit manuellement sélectionner le facteur approprié lors de la validation

export interface TunisianEmissionFactor {
  id: string;
  label: string;
  category: string;
  factor_value: number;
  factor_unit: string;
  source: string;
  ghg_scope: 'scope1' | 'scope2' | 'scope3';
  description: string;
}

// Facteurs d'émission tunisiens officiels (STEG, ANME)
export const TUNISIAN_EMISSION_FACTORS: TunisianEmissionFactor[] = [
  // Scope 2 - Électricité
  {
    id: 'electricite_steg',
    label: 'Électricité STEG',
    category: 'electricite',
    factor_value: 0.456,
    factor_unit: 'kgCO2e/kWh',
    source: 'STEG Tunisie - Mix électrique national',
    ghg_scope: 'scope2',
    description: 'Facteur d\'émission du réseau électrique tunisien (STEG)'
  },
  
  // Scope 1 - Gaz naturel
  {
    id: 'gaz_naturel',
    label: 'Gaz Naturel',
    category: 'gaz_naturel',
    factor_value: 0.202,
    factor_unit: 'kgCO2e/kWh',
    source: 'ADEME Base Carbone - Gaz naturel',
    ghg_scope: 'scope1',
    description: 'Combustion de gaz naturel (PCI)'
  },
  
  // Scope 1 - Carburants
  {
    id: 'gasoil',
    label: 'Gasoil / Diesel',
    category: 'diesel',
    factor_value: 2.68,
    factor_unit: 'kgCO2e/L',
    source: 'ADEME Base Carbone - Gazole routier',
    ghg_scope: 'scope1',
    description: 'Carburant diesel pour véhicules et engins'
  },
  {
    id: 'essence',
    label: 'Essence SP95/98',
    category: 'essence',
    factor_value: 2.28,
    factor_unit: 'kgCO2e/L',
    source: 'ADEME Base Carbone - Essence',
    ghg_scope: 'scope1',
    description: 'Carburant essence pour véhicules'
  },
  {
    id: 'gpl',
    label: 'GPL Carburant',
    category: 'gpl',
    factor_value: 1.66,
    factor_unit: 'kgCO2e/L',
    source: 'ADEME Base Carbone - GPL',
    ghg_scope: 'scope1',
    description: 'Gaz de pétrole liquéfié pour véhicules'
  },
  {
    id: 'fioul',
    label: 'Fioul domestique',
    category: 'fioul',
    factor_value: 3.17,
    factor_unit: 'kgCO2e/L',
    source: 'ADEME Base Carbone - Fioul domestique',
    ghg_scope: 'scope1',
    description: 'Fioul pour chauffage'
  },
];

// Map category -> factor pour lookup rapide
export const TUNISIAN_FACTORS_BY_CATEGORY: Record<string, TunisianEmissionFactor> = 
  TUNISIAN_EMISSION_FACTORS.reduce((acc, factor) => {
    acc[factor.category] = factor;
    return acc;
  }, {} as Record<string, TunisianEmissionFactor>);

// Fonction pour obtenir le facteur approprié
export function getTunisianEmissionFactor(category: string): TunisianEmissionFactor | null {
  return TUNISIAN_FACTORS_BY_CATEGORY[category] || null;
}

// Liste des catégories disponibles pour le Select de validation
export function getAvailableFactors(): TunisianEmissionFactor[] {
  return TUNISIAN_EMISSION_FACTORS;
}

// Calcul des émissions avec facteur tunisien forcé
export function calculateWithTunisianFactor(
  quantity: number,
  category: string
): { co2_kg: number; factor: TunisianEmissionFactor } | null {
  const factor = getTunisianEmissionFactor(category);
  if (!factor) return null;
  
  return {
    co2_kg: quantity * factor.factor_value,
    factor
  };
}

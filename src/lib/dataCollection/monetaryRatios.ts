// Ratios monétaires pour le calcul des émissions Scope 3 (kgCO2e/€)
// Source: ADEME Base Carbone, adaptés pour le contexte tunisien

export interface MonetaryEmissionFactor {
  category: string;
  subcategory: string;
  factor_value: number; // kgCO2e/€
  source: string;
  description: string;
  ghg_scope: 'scope3';
  ghg_category: string;
}

// Ratios monétaires par catégorie de services/achats
export const MONETARY_EMISSION_FACTORS: MonetaryEmissionFactor[] = [
  // Services informatiques
  {
    category: 'services_informatiques',
    subcategory: 'Logiciels et licences',
    factor_value: 0.28,
    source: 'ADEME Base Carbone',
    description: 'Services cloud, SaaS, licences logicielles',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'services_informatiques',
    subcategory: 'Matériel informatique',
    factor_value: 0.65,
    source: 'ADEME Base Carbone',
    description: 'Ordinateurs, serveurs, équipements IT',
    ghg_scope: 'scope3',
    ghg_category: 'achats_biens'
  },
  {
    category: 'services_informatiques',
    subcategory: 'Hébergement et data centers',
    factor_value: 0.32,
    source: 'ADEME Base Carbone',
    description: 'Services d\'hébergement, stockage cloud',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Services conseil et juridiques
  {
    category: 'services_conseil',
    subcategory: 'Conseil en gestion',
    factor_value: 0.12,
    source: 'ADEME Base Carbone',
    description: 'Prestations de conseil stratégique, management',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'services_conseil',
    subcategory: 'Services juridiques',
    factor_value: 0.12,
    source: 'ADEME Base Carbone',
    description: 'Avocats, notaires, juristes',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'services_conseil',
    subcategory: 'Audit et comptabilité',
    factor_value: 0.14,
    source: 'ADEME Base Carbone',
    description: 'Experts-comptables, auditeurs',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Fournitures de bureau
  {
    category: 'fournitures',
    subcategory: 'Fournitures de bureau',
    factor_value: 0.45,
    source: 'ADEME Base Carbone',
    description: 'Papeterie, consommables bureau',
    ghg_scope: 'scope3',
    ghg_category: 'achats_biens'
  },
  {
    category: 'fournitures',
    subcategory: 'Mobilier de bureau',
    factor_value: 0.55,
    source: 'ADEME Base Carbone',
    description: 'Bureaux, chaises, rangements',
    ghg_scope: 'scope3',
    ghg_category: 'achats_biens'
  },
  
  // Télécommunications
  {
    category: 'telecommunications',
    subcategory: 'Téléphonie et internet',
    factor_value: 0.18,
    source: 'ADEME Base Carbone',
    description: 'Abonnements téléphoniques, internet',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Marketing et communication
  {
    category: 'marketing',
    subcategory: 'Publicité',
    factor_value: 0.22,
    source: 'ADEME Base Carbone',
    description: 'Campagnes publicitaires, affichage',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'marketing',
    subcategory: 'Événementiel',
    factor_value: 0.35,
    source: 'ADEME Base Carbone',
    description: 'Organisation d\'événements, salons',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Nettoyage et entretien
  {
    category: 'services_generaux',
    subcategory: 'Nettoyage',
    factor_value: 0.15,
    source: 'ADEME Base Carbone',
    description: 'Services de nettoyage des locaux',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'services_generaux',
    subcategory: 'Sécurité',
    factor_value: 0.10,
    source: 'ADEME Base Carbone',
    description: 'Services de gardiennage, sécurité',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Formation
  {
    category: 'formation',
    subcategory: 'Formation professionnelle',
    factor_value: 0.15,
    source: 'ADEME Base Carbone',
    description: 'Formations, séminaires, e-learning',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Restauration
  {
    category: 'restauration',
    subcategory: 'Restauration collective',
    factor_value: 0.48,
    source: 'ADEME Base Carbone',
    description: 'Cantine, traiteur, repas d\'affaires',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Maintenance et réparation
  {
    category: 'maintenance',
    subcategory: 'Maintenance bâtiments',
    factor_value: 0.25,
    source: 'ADEME Base Carbone',
    description: 'Entretien, réparations bâtiments',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'maintenance',
    subcategory: 'Maintenance équipements',
    factor_value: 0.30,
    source: 'ADEME Base Carbone',
    description: 'Maintenance machines, véhicules',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  
  // Assurances et services financiers
  {
    category: 'services_financiers',
    subcategory: 'Assurances',
    factor_value: 0.08,
    source: 'ADEME Base Carbone',
    description: 'Primes d\'assurance',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  },
  {
    category: 'services_financiers',
    subcategory: 'Services bancaires',
    factor_value: 0.06,
    source: 'ADEME Base Carbone',
    description: 'Frais bancaires, commissions',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  }
];

// Mapping des mots-clés comptables vers les catégories
export const ACCOUNTING_KEYWORDS_MAPPING: Record<string, string> = {
  // Services informatiques
  'logiciel': 'services_informatiques',
  'software': 'services_informatiques',
  'licence': 'services_informatiques',
  'saas': 'services_informatiques',
  'cloud': 'services_informatiques',
  'hébergement': 'services_informatiques',
  'hosting': 'services_informatiques',
  'ordinateur': 'services_informatiques',
  'serveur': 'services_informatiques',
  'informatique': 'services_informatiques',
  
  // Services conseil
  'conseil': 'services_conseil',
  'consulting': 'services_conseil',
  'avocat': 'services_conseil',
  'juridique': 'services_conseil',
  'notaire': 'services_conseil',
  'audit': 'services_conseil',
  'comptable': 'services_conseil',
  'expert': 'services_conseil',
  
  // Fournitures
  'papeterie': 'fournitures',
  'fourniture': 'fournitures',
  'bureau': 'fournitures',
  'consommable': 'fournitures',
  'mobilier': 'fournitures',
  
  // Télécoms
  'téléphone': 'telecommunications',
  'internet': 'telecommunications',
  'mobile': 'telecommunications',
  'telecom': 'telecommunications',
  
  // Marketing
  'publicité': 'marketing',
  'marketing': 'marketing',
  'communication': 'marketing',
  'événement': 'marketing',
  'salon': 'marketing',
  
  // Services généraux
  'nettoyage': 'services_generaux',
  'entretien': 'services_generaux',
  'sécurité': 'services_generaux',
  'gardiennage': 'services_generaux',
  
  // Formation
  'formation': 'formation',
  'stage': 'formation',
  'séminaire': 'formation',
  
  // Restauration
  'restaurant': 'restauration',
  'traiteur': 'restauration',
  'repas': 'restauration',
  'cantine': 'restauration',
  
  // Maintenance
  'maintenance': 'maintenance',
  'réparation': 'maintenance',
  
  // Services financiers
  'assurance': 'services_financiers',
  'banque': 'services_financiers',
  'frais bancaire': 'services_financiers'
};

// Fonction pour trouver le ratio monétaire approprié
export function findMonetaryFactor(description: string, subcategory?: string): MonetaryEmissionFactor | null {
  const normalizedDesc = description.toLowerCase();
  
  // Chercher d'abord par sous-catégorie exacte si fournie
  if (subcategory) {
    const exactMatch = MONETARY_EMISSION_FACTORS.find(
      f => f.subcategory.toLowerCase() === subcategory.toLowerCase()
    );
    if (exactMatch) return exactMatch;
  }
  
  // Chercher par mots-clés
  for (const [keyword, category] of Object.entries(ACCOUNTING_KEYWORDS_MAPPING)) {
    if (normalizedDesc.includes(keyword)) {
      const factor = MONETARY_EMISSION_FACTORS.find(f => f.category === category);
      if (factor) return factor;
    }
  }
  
  // Facteur par défaut pour services génériques
  return {
    category: 'autres',
    subcategory: 'Autres services',
    factor_value: 0.20, // Moyenne prudente
    source: 'Estimation ADEME',
    description: 'Facteur par défaut pour services non catégorisés',
    ghg_scope: 'scope3',
    ghg_category: 'achats_services'
  };
}

// Fonction de calcul des émissions à partir du montant
export function calculateMonetaryEmissions(
  amountEur: number,
  factor: MonetaryEmissionFactor
): { co2_kg: number; uncertainty_percent: number } {
  const co2_kg = amountEur * factor.factor_value;
  // Les ratios monétaires ont une incertitude plus élevée (20-30%)
  const uncertainty_percent = 25;
  
  return { co2_kg, uncertainty_percent };
}

// Interface pour les entrées CSV comptables
export interface AccountingEntry {
  date: string;
  description: string;
  amount_ht: number;
  amount_ttc?: number;
  currency: string;
  supplier_name?: string;
  account_code?: string;
}

// Fonction de parsing CSV
export function parseAccountingCSV(csvContent: string): AccountingEntry[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].toLowerCase().split(/[,;]/).map(h => h.trim());
  const entries: AccountingEntry[] = [];
  
  // Mapping des colonnes possibles
  const dateIdx = headers.findIndex(h => ['date', 'date comptable', 'date_comptable'].includes(h));
  const descIdx = headers.findIndex(h => ['description', 'libellé', 'libelle', 'designation'].includes(h));
  const amountHTIdx = headers.findIndex(h => ['montant_ht', 'montant ht', 'amount_ht', 'ht'].includes(h));
  const amountTTCIdx = headers.findIndex(h => ['montant_ttc', 'montant ttc', 'amount_ttc', 'ttc'].includes(h));
  const currencyIdx = headers.findIndex(h => ['devise', 'currency', 'monnaie'].includes(h));
  const supplierIdx = headers.findIndex(h => ['fournisseur', 'supplier', 'vendor'].includes(h));
  const accountIdx = headers.findIndex(h => ['compte', 'account', 'code_compte'].includes(h));
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/[,;]/).map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length < 3) continue;
    
    const amountHT = parseFloat(values[amountHTIdx]?.replace(/\s/g, '').replace(',', '.') || '0');
    if (amountHT <= 0) continue;
    
    entries.push({
      date: values[dateIdx] || new Date().toISOString().split('T')[0],
      description: values[descIdx] || 'Non spécifié',
      amount_ht: amountHT,
      amount_ttc: amountTTCIdx >= 0 ? parseFloat(values[amountTTCIdx]?.replace(/\s/g, '').replace(',', '.') || '0') : undefined,
      currency: values[currencyIdx] || 'TND',
      supplier_name: supplierIdx >= 0 ? values[supplierIdx] : undefined,
      account_code: accountIdx >= 0 ? values[accountIdx] : undefined
    });
  }
  
  return entries;
}

// Calculer les émissions pour toutes les entrées comptables
export function processAccountingEntries(entries: AccountingEntry[]): Array<{
  entry: AccountingEntry;
  factor: MonetaryEmissionFactor;
  co2_kg: number;
  uncertainty_percent: number;
}> {
  return entries.map(entry => {
    const factor = findMonetaryFactor(entry.description) || MONETARY_EMISSION_FACTORS[0];
    const { co2_kg, uncertainty_percent } = calculateMonetaryEmissions(entry.amount_ht, factor);
    
    return {
      entry,
      factor,
      co2_kg,
      uncertainty_percent
    };
  });
}

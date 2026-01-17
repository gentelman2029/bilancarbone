import { useState, useEffect, useCallback } from 'react';

// Définition des catégories obligatoires pour la conformité CSRD/BEGES
export interface ComplianceCategory {
  id: string;
  name: string;
  scope: 'scope1' | 'scope2' | 'scope3';
  keywords: string[]; // Mots-clés pour identifier les entrées correspondantes
  isFilled: boolean;
}

export interface ComplianceResult {
  score: number; // Pourcentage de complétude (0-100)
  filledCount: number;
  totalCount: number;
  categories: ComplianceCategory[];
  missingCategories: ComplianceCategory[];
  filledCategories: ComplianceCategory[];
}

// Référentiel des 9 catégories obligatoires
const MANDATORY_CATEGORIES: Omit<ComplianceCategory, 'isFilled'>[] = [
  // Scope 1 - 3 catégories
  {
    id: 'heating',
    name: 'Chauffage (Gaz/Fioul)',
    scope: 'scope1',
    keywords: ['gaz', 'fioul', 'chauffage', 'combustible', 'gazNaturel', 'fioulDomestique', 'fioulLourd', 'propane', 'butane', 'charbon', 'bois', 'granulés']
  },
  {
    id: 'fleet',
    name: 'Flotte de véhicules',
    scope: 'scope1',
    keywords: ['véhicule', 'voiture', 'camion', 'utilitaire', 'flotte', 'diesel', 'essence', 'km', 'kilometr', 'tracteur', 'chariot']
  },
  {
    id: 'refrigerants',
    name: 'Fluides frigorigènes (Climatisation)',
    scope: 'scope1',
    keywords: ['frigorigène', 'climatisation', 'froid', 'r-', 'r134', 'r404', 'r410', 'r407', 'r32', 'r22', 'hfc', 'cfc', 'réfrigérant']
  },
  // Scope 2 - 2 catégories
  {
    id: 'electricity',
    name: 'Électricité',
    scope: 'scope2',
    keywords: ['électricité', 'electrique', 'kwh', 'énergie', 'solaire', 'eolien', 'hydraulique', 'mix']
  },
  {
    id: 'heat_networks',
    name: 'Réseaux de chaleur/froid',
    scope: 'scope2',
    keywords: ['vapeur', 'chaleur', 'réseau', 'eau chaude', 'chauffage urbain', 'district']
  },
  // Scope 3 - 4 catégories
  {
    id: 'purchases',
    name: 'Achats de biens et services',
    scope: 'scope3',
    keywords: ['achat', 'bien', 'service', 'fournisseur', 'approvisionnement', 'matière', 'équipement', 'immobilisation']
  },
  {
    id: 'waste',
    name: 'Déchets',
    scope: 'scope3',
    keywords: ['déchet', 'recyclage', 'enfouissement', 'incinération', 'valorisation', 'ordure', 'tri']
  },
  {
    id: 'travel',
    name: 'Déplacements professionnels/Domicile-travail',
    scope: 'scope3',
    keywords: ['déplacement', 'professionnel', 'domicile', 'travail', 'trajet', 'transport', 'avion', 'train', 'bus', 'métro', 'voyage', 'mission']
  },
  {
    id: 'freight',
    name: 'Fret (Transport de marchandises)',
    scope: 'scope3',
    keywords: ['fret', 'transport', 'marchandise', 'logistique', 'livraison', 'expédition', 'amont', 'aval', 'distribution']
  }
];

export const useComplianceScore = (): ComplianceResult => {
  const [result, setResult] = useState<ComplianceResult>({
    score: 0,
    filledCount: 0,
    totalCount: MANDATORY_CATEGORIES.length,
    categories: [],
    missingCategories: [],
    filledCategories: []
  });

  const calculateCompliance = useCallback(() => {
    try {
      // Charger les données du localStorage
      const sectionDetailsStr = localStorage.getItem('calculation-section-details');
      const scope3AdvancedStr = localStorage.getItem('scope3-advanced-calculations');
      
      const sectionDetails = sectionDetailsStr ? JSON.parse(sectionDetailsStr) : { scope1: [], scope2: [], scope3: [] };
      const scope3Advanced = scope3AdvancedStr ? JSON.parse(scope3AdvancedStr) : [];
      
      // Fusionner toutes les entrées par scope
      const allEntries = {
        scope1: sectionDetails.scope1 || [],
        scope2: sectionDetails.scope2 || [],
        scope3: [...(sectionDetails.scope3 || []), ...scope3Advanced]
      };

      // Vérifier chaque catégorie obligatoire
      const categoriesWithStatus: ComplianceCategory[] = MANDATORY_CATEGORIES.map(cat => {
        const scopeEntries = allEntries[cat.scope] || [];
        
        // Chercher si au moins une entrée correspond à cette catégorie
        const isFilled = scopeEntries.some((entry: any) => {
          // Vérifier dans le type, la description ou la formule
          const searchText = [
            entry.type || '',
            entry.description || '',
            entry.formuleDetail || '',
            entry.category || '',
            entry.subcategory || ''
          ].join(' ').toLowerCase();
          
          // Vérifier aussi si l'entrée a des émissions > 0
          const hasEmissions = (entry.emissions || 0) > 0;
          
          // Chercher si un des mots-clés correspond
          const matchesKeyword = cat.keywords.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          );
          
          return matchesKeyword && hasEmissions;
        });

        return {
          ...cat,
          isFilled
        };
      });

      const filledCategories = categoriesWithStatus.filter(c => c.isFilled);
      const missingCategories = categoriesWithStatus.filter(c => !c.isFilled);
      const filledCount = filledCategories.length;
      const score = Math.round((filledCount / MANDATORY_CATEGORIES.length) * 100);

      setResult({
        score,
        filledCount,
        totalCount: MANDATORY_CATEGORIES.length,
        categories: categoriesWithStatus,
        missingCategories,
        filledCategories
      });
    } catch (error) {
      console.error('Erreur lors du calcul de la conformité:', error);
    }
  }, []);

  // Calculer au montage et écouter les changements
  useEffect(() => {
    calculateCompliance();
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      calculateCompliance();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement pour les changements dans la même page
    const interval = setInterval(calculateCompliance, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [calculateCompliance]);

  return result;
};

export default useComplianceScore;

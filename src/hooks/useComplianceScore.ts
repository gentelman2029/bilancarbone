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

// Normaliser le texte : retirer les accents et mettre en minuscules
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Référentiel des 9 catégories obligatoires
// Les keywords sont SANS accents pour correspondre au normalizeText
const MANDATORY_CATEGORIES: Omit<ComplianceCategory, 'isFilled'>[] = [
  // Scope 1 - 3 catégories
  {
    id: 'heating',
    name: 'Chauffage (Gaz/Fioul)',
    scope: 'scope1',
    keywords: ['gaz', 'fioul', 'chauffage', 'combustible', 'combustibles', 'gaznaturel', 'fiouldomestique', 'fioullourd', 'propane', 'butane', 'charbon', 'bois', 'granules', 'diesel', 'gazole', 'essence', 'coke', 'lignite', 'gpl']
  },
  {
    id: 'fleet',
    name: 'Flotte de véhicules',
    scope: 'scope1',
    keywords: ['vehicule', 'vehicules', 'voiture', 'camion', 'utilitaire', 'flotte', 'km', 'kilometr', 'tracteur', 'chariot', 'poids lourd', 'hybride', 'electrique']
  },
  {
    id: 'refrigerants',
    name: 'Fluides frigorigènes (Climatisation)',
    scope: 'scope1',
    keywords: ['frigorigene', 'refrigerant', 'refrigerants', 'climatisation', 'froid', 'r-', 'r134', 'r404', 'r410', 'r407', 'r32', 'r22', 'r11', 'r12', 'hfc', 'cfc', 'hcfc']
  },
  // Scope 2 - 2 catégories
  {
    id: 'electricity',
    name: 'Électricité',
    scope: 'scope2',
    keywords: ['electricite', 'electrique', 'kwh', 'mwh', 'energie', 'solaire', 'eolien', 'hydraulique', 'mix', 'tunisie', 'france', 'allemagne']
  },
  {
    id: 'heat_networks',
    name: 'Réseaux de chaleur/froid',
    scope: 'scope2',
    keywords: ['vapeur', 'chaleur', 'reseau', 'eau chaude', 'chauffage urbain', 'district', 'vapeurindustrielle', 'eauchaude']
  },
  // Scope 3 - 4 catégories
  {
    id: 'purchases',
    name: 'Achats de biens et services',
    scope: 'scope3',
    keywords: ['achat', 'achats', 'bien', 'service', 'fournisseur', 'approvisionnement', 'matiere', 'materiaux', 'equipement', 'immobilisation', 'acier', 'aluminium', 'beton', 'ciment', 'verre', 'plastique', 'papier', 'cuivre', 'alimentation', 'boeuf', 'porc', 'volaille', 'poisson', 'lait', 'fromage', 'oeuf', 'legumes', 'fruits', 'cereales', 'agneau', 'numerique', 'email', 'streaming', 'visioconference', 'stockage', 'cloud', 'cat1', 'cat2']
  },
  {
    id: 'waste',
    name: 'Déchets',
    scope: 'scope3',
    keywords: ['dechet', 'dechets', 'recyclage', 'enfouissement', 'incineration', 'valorisation', 'ordure', 'tri', 'compostage', 'methanisation', 'cat5']
  },
  {
    id: 'travel',
    name: 'Déplacements professionnels/Domicile-travail',
    scope: 'scope3',
    keywords: ['deplacement', 'professionnel', 'domicile', 'travail', 'trajet', 'avion', 'train', 'bus', 'metro', 'tramway', 'voyage', 'mission', 'tgv', 'ter', 'passager', 'court-courrier', 'long-courrier', 'moyen-courrier', 'cat6', 'cat7']
  },
  {
    id: 'freight',
    name: 'Fret (Transport de marchandises)',
    scope: 'scope3',
    keywords: ['fret', 'marchandise', 'logistique', 'livraison', 'expedition', 'amont', 'aval', 'distribution', 'transport routier', 'transport ferroviaire', 'transport maritime', 'transport aerien', 'transport fluvial', 't.km', 'poids moyen', 'poids lourd', 'cargo', 'cat4', 'cat9']
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
      
      // Fusionner toutes les entrées par scope avec vérification de type Array
      const allEntries = {
        scope1: Array.isArray(sectionDetails.scope1) ? sectionDetails.scope1 : [],
        scope2: Array.isArray(sectionDetails.scope2) ? sectionDetails.scope2 : [],
        scope3: [
          ...(Array.isArray(sectionDetails.scope3) ? sectionDetails.scope3 : []),
          ...(Array.isArray(scope3Advanced) ? scope3Advanced : [])
        ]
      };

      // Vérifier chaque catégorie obligatoire
      const categoriesWithStatus: ComplianceCategory[] = MANDATORY_CATEGORIES.map(cat => {
        const scopeEntries = allEntries[cat.scope] || [];
        
        // Chercher si au moins une entrée correspond à cette catégorie
        const isFilled = scopeEntries.some((entry: any) => {
          // Vérifier dans tous les champs textuels disponibles (standard + avancé)
          const searchText = normalizeText([
            entry.type || '',
            entry.description || '',
            entry.formuleDetail || '',
            entry.category || '',
            entry.subcategory || '',
            entry.categoryName || '',
            entry.subcategoryName || '',
            entry.method || '',
            entry.unit || '',
            entry.source || ''
          ].join(' '));
          
          // Vérifier si l'entrée a des émissions > 0 (supporte les 2 formats)
          const hasEmissions = (entry.emissions || 0) > 0 || (entry.total || 0) > 0;
          
          // Chercher si un des mots-clés correspond (tous normalisés)
          const matchesKeyword = cat.keywords.some(keyword => 
            searchText.includes(normalizeText(keyword))
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

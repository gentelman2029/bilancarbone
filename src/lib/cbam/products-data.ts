// Base de données complète des produits CBAM avec codes CN8
// Source: Règlement UE 2023/956 - Annexes I et II

import { CBAMSector } from './types';

export interface CBAMProductData {
  cn8_code: string;
  product_name: string;
  sector: CBAMSector;
  description: string;
}

export const CBAM_PRODUCTS_DATABASE: CBAMProductData[] = [
  // ============================================================================
  // CIMENT
  // ============================================================================
  {
    cn8_code: '25232100',
    product_name: 'Ciment Portland blanc',
    sector: 'cement',
    description: 'Ciment Portland blanc, même coloré artificiellement'
  },
  {
    cn8_code: '25232900',
    product_name: 'Ciment Portland gris',
    sector: 'cement',
    description: 'Ciment Portland gris ordinaire et haute résistance'
  },
  {
    cn8_code: '25239000',
    product_name: 'Autres ciments hydrauliques',
    sector: 'cement',
    description: 'Ciments alumineux, ciments à maçonner et autres ciments hydrauliques'
  },
  {
    cn8_code: '25231000',
    product_name: 'Ciment prompt',
    sector: 'cement',
    description: 'Ciment prompt naturel'
  },

  // ============================================================================
  // FER ET ACIER
  // ============================================================================
  {
    cn8_code: '72081000',
    product_name: 'Tôles et bandes laminées à chaud, épaisseur > 10 mm',
    sector: 'iron_steel',
    description: 'Tôles et bandes en fer ou aciers non alliés, laminées à chaud, épaisseur > 10 mm'
  },
  {
    cn8_code: '72082500',
    product_name: 'Tôles et bandes laminées à chaud, épaisseur 4,75-10 mm',
    sector: 'iron_steel',
    description: 'Tôles et bandes en fer ou aciers non alliés, laminées à chaud, épaisseur 4,75-10 mm'
  },
  {
    cn8_code: '72083600',
    product_name: 'Tôles et bandes laminées à chaud, épaisseur < 3 mm',
    sector: 'iron_steel',
    description: 'Tôles et bandes en fer ou aciers non alliés, laminées à chaud, épaisseur < 3 mm'
  },
  {
    cn8_code: '72061000',
    product_name: 'Produits laminés plats en fer/acier non allié, largeur ≥ 600 mm',
    sector: 'iron_steel',
    description: 'Produits laminés plats en fer ou aciers non alliés, largeur ≥ 600 mm, plaqués ou revêtus'
  },
  {
    cn8_code: '72071100',
    product_name: 'Demi-produits en fer/acier non allié, carbone < 0,25%',
    sector: 'iron_steel',
    description: 'Demi-produits en fer ou aciers non alliés, teneur en carbone < 0,25% en poids'
  },
  {
    cn8_code: '72071900',
    product_name: 'Demi-produits en fer/acier non allié, carbone ≥ 0,25%',
    sector: 'iron_steel',
    description: 'Demi-produits en fer ou aciers non alliés, teneur en carbone ≥ 0,25% en poids'
  },
  {
    cn8_code: '72101100',
    product_name: 'Tôles laminées à froid, épaisseur ≥ 0,5 mm',
    sector: 'iron_steel',
    description: 'Tôles et bandes laminées à froid, épaisseur ≥ 0,5 mm'
  },
  {
    cn8_code: '72142000',
    product_name: 'Barres en fer/acier non allié, forgées',
    sector: 'iron_steel',
    description: 'Barres en fer ou aciers non alliés, simplement forgées, laminées ou filées à chaud'
  },
  {
    cn8_code: '72151000',
    product_name: 'Barres en acier de décolletage',
    sector: 'iron_steel',
    description: 'Barres en acier de décolletage, simplement obtenues ou parachevées à froid'
  },

  // ============================================================================
  // ALUMINIUM
  // ============================================================================
  {
    cn8_code: '76011000',
    product_name: 'Aluminium non allié brut',
    sector: 'aluminium',
    description: 'Aluminium non allié sous forme brute'
  },
  {
    cn8_code: '76012000',
    product_name: 'Aluminium allié brut',
    sector: 'aluminium',
    description: 'Aluminium allié sous forme brute'
  },
  {
    cn8_code: '76020000',
    product_name: 'Déchets et débris d\'aluminium',
    sector: 'aluminium',
    description: 'Déchets et débris d\'aluminium pour recyclage'
  },
  {
    cn8_code: '76031000',
    product_name: 'Poudres de structure non lamellaire, aluminium non allié',
    sector: 'aluminium',
    description: 'Poudres de structure non lamellaire, en aluminium non allié'
  },
  {
    cn8_code: '76041000',
    product_name: 'Barres et profilés en aluminium non allié',
    sector: 'aluminium',
    description: 'Barres et profilés en aluminium non allié'
  },
  {
    cn8_code: '76051100',
    product_name: 'Fils en aluminium, diamètre > 7 mm',
    sector: 'aluminium',
    description: 'Fils en aluminium non allié, diamètre > 7 mm'
  },
  {
    cn8_code: '76061100',
    product_name: 'Tôles et bandes en aluminium, épaisseur > 0,2 mm',
    sector: 'aluminium',
    description: 'Tôles et bandes rectangulaires en aluminium, épaisseur > 0,2 mm'
  },

  // ============================================================================
  // ENGRAIS
  // ============================================================================
  {
    cn8_code: '31021000',
    product_name: 'Urée avec teneur en azote > 45%',
    sector: 'fertilizers',
    description: 'Urée, même en solution aqueuse, teneur en azote > 45% en poids'
  },
  {
    cn8_code: '31022100',
    product_name: 'Sulfate d\'ammonium',
    sector: 'fertilizers',
    description: 'Sulfate d\'ammonium'
  },
  {
    cn8_code: '31023000',
    product_name: 'Nitrate d\'ammonium',
    sector: 'fertilizers',
    description: 'Nitrate d\'ammonium, même en solution aqueuse'
  },
  {
    cn8_code: '31024000',
    product_name: 'Mélanges de nitrate d\'ammonium et de carbonate de calcium',
    sector: 'fertilizers',
    description: 'Mélanges de nitrate d\'ammonium et de carbonate de calcium ou d\'autres matières inorganiques'
  },
  {
    cn8_code: '31025000',
    product_name: 'Nitrate de sodium',
    sector: 'fertilizers',
    description: 'Nitrate de sodium'
  },
  {
    cn8_code: '31026000',
    product_name: 'Sels doubles et mélanges de nitrate de calcium et de nitrate d\'ammonium',
    sector: 'fertilizers',
    description: 'Sels doubles et mélanges de nitrate de calcium et de nitrate d\'ammonium'
  },
  {
    cn8_code: '31028000',
    product_name: 'Mélanges d\'urée et de nitrate d\'ammonium',
    sector: 'fertilizers',
    description: 'Mélanges d\'urée et de nitrate d\'ammonium en solutions aqueuses ou ammoniacales'
  },
  {
    cn8_code: '31031000',
    product_name: 'Superphosphates',
    sector: 'fertilizers',
    description: 'Superphosphates'
  },
  {
    cn8_code: '31039000',
    product_name: 'Autres engrais phosphatés',
    sector: 'fertilizers',
    description: 'Autres engrais minéraux ou chimiques phosphatés'
  },

  // ============================================================================
  // ÉLECTRICITÉ
  // ============================================================================
  {
    cn8_code: '27160000',
    product_name: 'Énergie électrique',
    sector: 'electricity',
    description: 'Énergie électrique importée via lignes d\'interconnexion'
  },

  // ============================================================================
  // HYDROGÈNE
  // ============================================================================
  {
    cn8_code: '28047000',
    product_name: 'Hydrogène',
    sector: 'hydrogen',
    description: 'Hydrogène gazeux ou liquide'
  },
  {
    cn8_code: '28048000',
    product_name: 'Phosphore',
    sector: 'hydrogen',
    description: 'Phosphore (précurseur pour production d\'hydrogène)'
  },
  {
    cn8_code: '28044000',
    product_name: 'Oxygène',
    sector: 'hydrogen',
    description: 'Oxygène (sous-produit de la production d\'hydrogène)'
  },
  {
    cn8_code: '28012000',
    product_name: 'Iode',
    sector: 'hydrogen',
    description: 'Iode (utilisé dans certains procédés de production d\'hydrogène)'
  }
];

// Fonction helper pour obtenir tous les produits d'un secteur
export const getProductsBySector = (sector: CBAMSector): CBAMProductData[] => {
  return CBAM_PRODUCTS_DATABASE.filter(product => product.sector === sector);
};

// Fonction helper pour obtenir un produit par son code CN8
export const getProductByCN8Code = (cn8_code: string): CBAMProductData | undefined => {
  return CBAM_PRODUCTS_DATABASE.find(product => product.cn8_code === cn8_code);
};

// Fonction helper pour obtenir tous les codes CN8 d'un secteur
export const getCN8CodesBySector = (sector: CBAMSector): string[] => {
  return getProductsBySector(sector).map(product => product.cn8_code);
};
// Base Carbone® ADEME - Facteurs d'émissions complets (kg CO2e par unité)
// Externalisés pour faciliter les mises à jour sans modifier le code du calculateur

export interface EmissionFactorEntry {
  unite: string;
  facteur: number;
  description: string;
}

export interface EmissionFactorCategory {
  [key: string]: EmissionFactorEntry;
}

export interface BaseCarbone {
  scope1: {
    combustibles: EmissionFactorCategory;
    refrigerants: EmissionFactorCategory;
    vehicules: EmissionFactorCategory;
  };
  scope2: {
    electricite: EmissionFactorCategory;
    vapeur: EmissionFactorCategory;
  };
  scope3: {
    transport: EmissionFactorCategory;
    materiaux: EmissionFactorCategory;
    dechets: EmissionFactorCategory;
    alimentation: EmissionFactorCategory;
    numerique: EmissionFactorCategory;
  };
}

export const baseCarbone: BaseCarbone = {
  // SCOPE 1 - Émissions directes
  scope1: {
    combustibles: {
      diesel: { unite: "litre", facteur: 2.68, description: "Gazole/Diesel" },
      essence: { unite: "litre", facteur: 2.31, description: "Essence" },
      fioulLourd: { unite: "litre", facteur: 3.17, description: "Fioul lourd" },
      fioulDomestique: { unite: "litre", facteur: 2.69, description: "Fioul domestique" },
      gpl: { unite: "litre", facteur: 1.64, description: "GPL" },
      gazNaturel: { unite: "kWh PCI", facteur: 0.227, description: "Gaz naturel" },
      propane: { unite: "kg", facteur: 2.94, description: "Propane" },
      butane: { unite: "kg", facteur: 2.93, description: "Butane" },
      charbon: { unite: "kg", facteur: 2.42, description: "Charbon" },
      coke: { unite: "kg", facteur: 3.11, description: "Coke de pétrole" },
      lignite: { unite: "kg", facteur: 1.17, description: "Lignite" },
      boisBuche: { unite: "kg", facteur: 0.013, description: "Bois bûche" },
      granulesBois: { unite: "kg", facteur: 0.024, description: "Granulés de bois" },
      plaquettesBois: { unite: "kg", facteur: 0.015, description: "Plaquettes de bois" }
    },
    refrigerants: {
      r134a: { unite: "kg", facteur: 1430, description: "R-134a (Tétrafluoroéthane)" },
      r404a: { unite: "kg", facteur: 3922, description: "R-404A" },
      r410a: { unite: "kg", facteur: 2088, description: "R-410A" },
      r407c: { unite: "kg", facteur: 1774, description: "R-407C" },
      r32: { unite: "kg", facteur: 675, description: "R-32" },
      r11: { unite: "kg", facteur: 4750, description: "R-11 (CFC-11)" },
      r12: { unite: "kg", facteur: 10900, description: "R-12 (CFC-12)" },
      r22: { unite: "kg", facteur: 1810, description: "R-22 (HCFC-22)" }
    },
    vehicules: {
      voitureEssence: { unite: "km", facteur: 0.193, description: "Voiture essence (moyenne)" },
      voitureDiesel: { unite: "km", facteur: 0.166, description: "Voiture diesel (moyenne)" },
      voitureElectrique: { unite: "km", facteur: 0.020, description: "Voiture électrique" },
      voitureHybride: { unite: "km", facteur: 0.110, description: "Voiture hybride" },
      utilitaireDiesel: { unite: "km", facteur: 0.218, description: "Véhicule utilitaire diesel" },
      utilitaireEssence: { unite: "km", facteur: 0.251, description: "Véhicule utilitaire essence" },
      camion12t: { unite: "km", facteur: 0.390, description: "Camion 12-14t" },
      camion20t: { unite: "km", facteur: 0.580, description: "Camion 16-32t" },
      camion40t: { unite: "km", facteur: 0.790, description: "Camion >32t" },
      tracteurAgricole: { unite: "heure", facteur: 12.5, description: "Tracteur agricole" },
      chariotElevateur: { unite: "heure", facteur: 8.2, description: "Chariot élévateur" }
    }
  },

  // SCOPE 2 - Émissions indirectes liées à l'énergie
  scope2: {
    electricite: {
      france: { unite: "kWh", facteur: 0.057, description: "Électricité France (mix national)" },
      tunisie: { unite: "kWh", facteur: 0.474, description: "Électricité Tunisie" },
      allemagne: { unite: "kWh", facteur: 0.401, description: "Électricité Allemagne" },
      espagne: { unite: "kWh", facteur: 0.256, description: "Électricité Espagne" },
      italie: { unite: "kWh", facteur: 0.359, description: "Électricité Italie" },
      royaumeUni: { unite: "kWh", facteur: 0.233, description: "Électricité Royaume-Uni" },
      moyenneEurope: { unite: "kWh", facteur: 0.276, description: "Électricité moyenne européenne" },
      solaire: { unite: "kWh", facteur: 0.044, description: "Électricité solaire" },
      eolien: { unite: "kWh", facteur: 0.015, description: "Électricité éolienne" },
      hydraulique: { unite: "kWh", facteur: 0.006, description: "Électricité hydraulique" }
    },
    vapeur: {
      vapeurIndustrielle: { unite: "kWh", facteur: 0.090, description: "Vapeur industrielle" },
      eauChaude: { unite: "kWh", facteur: 0.227, description: "Eau chaude (réseau de chaleur)" }
    }
  },

  // SCOPE 3 - Autres émissions indirectes
  scope3: {
    transport: {
      routierPoidsMoyen: { unite: "t.km", facteur: 0.171, description: "Transport routier poids moyen" },
      routierPoidsLourd: { unite: "t.km", facteur: 0.111, description: "Transport routier poids lourd" },
      ferroviaire: { unite: "t.km", facteur: 0.033, description: "Transport ferroviaire" },
      maritime: { unite: "t.km", facteur: 0.015, description: "Transport maritime" },
      aerien: { unite: "t.km", facteur: 1.47, description: "Transport aérien cargo" },
      fluvial: { unite: "t.km", facteur: 0.037, description: "Transport fluvial" },
      avionCourtCourrier: { unite: "passager.km", facteur: 0.230, description: "Avion court-courrier" },
      avionMoyenCourrier: { unite: "passager.km", facteur: 0.187, description: "Avion moyen-courrier" },
      avionLongCourrier: { unite: "passager.km", facteur: 0.152, description: "Avion long-courrier" },
      tgv: { unite: "passager.km", facteur: 0.0032, description: "TGV" },
      ter: { unite: "passager.km", facteur: 0.0295, description: "TER" },
      metro: { unite: "passager.km", facteur: 0.0038, description: "Métro" },
      bus: { unite: "passager.km", facteur: 0.103, description: "Bus" },
      tramway: { unite: "passager.km", facteur: 0.0044, description: "Tramway" }
    },
    materiaux: {
      acier: { unite: "kg", facteur: 1.46, description: "Acier" },
      aluminium: { unite: "kg", facteur: 8.24, description: "Aluminium primaire" },
      beton: { unite: "kg", facteur: 0.152, description: "Béton" },
      ciment: { unite: "kg", facteur: 0.918, description: "Ciment" },
      bois: { unite: "kg", facteur: 0.72, description: "Bois (construction)" },
      verre: { unite: "kg", facteur: 0.85, description: "Verre plat" },
      plastiquePET: { unite: "kg", facteur: 2.28, description: "Plastique PET" },
      plastiquePP: { unite: "kg", facteur: 1.95, description: "Plastique PP" },
      papier: { unite: "kg", facteur: 0.92, description: "Papier/carton" },
      cuivre: { unite: "kg", facteur: 4.20, description: "Cuivre" }
    },
    dechets: {
      incineration: { unite: "kg", facteur: 0.78, description: "Incinération avec récupération d'énergie" },
      enfouissement: { unite: "kg", facteur: 0.48, description: "Enfouissement" },
      recyclage: { unite: "kg", facteur: 0.025, description: "Recyclage" },
      compostage: { unite: "kg", facteur: 0.015, description: "Compostage" },
      methanisation: { unite: "kg", facteur: 0.022, description: "Méthanisation" }
    },
    alimentation: {
      boeuf: { unite: "kg", facteur: 25.2, description: "Bœuf" },
      porc: { unite: "kg", facteur: 4.6, description: "Porc" },
      agneau: { unite: "kg", facteur: 22.9, description: "Agneau" },
      volaille: { unite: "kg", facteur: 2.9, description: "Volaille" },
      poisson: { unite: "kg", facteur: 5.1, description: "Poisson" },
      lait: { unite: "litre", facteur: 1.32, description: "Lait" },
      fromage: { unite: "kg", facteur: 8.5, description: "Fromage" },
      oeuf: { unite: "kg", facteur: 1.8, description: "Œufs" },
      legumes: { unite: "kg", facteur: 0.4, description: "Légumes" },
      fruits: { unite: "kg", facteur: 0.6, description: "Fruits" },
      cereales: { unite: "kg", facteur: 1.1, description: "Céréales" }
    },
    numerique: {
      emailSimple: { unite: "email", facteur: 0.004, description: "Email simple" },
      emailPieceJointe: { unite: "email", facteur: 0.035, description: "Email avec pièce jointe" },
      rechercheWeb: { unite: "recherche", facteur: 0.007, description: "Recherche web" },
      streamingVideo: { unite: "heure", facteur: 0.036, description: "Streaming vidéo HD" },
      visioconference: { unite: "heure", facteur: 0.150, description: "Visioconférence" },
      stockageCloud: { unite: "Go.an", facteur: 0.5, description: "Stockage cloud" }
    }
  }
};

/**
 * Lookup an emission factor by scope/category/subcategory path.
 * Returns null if not found.
 */
export const getEmissionFactor = (
  scope: string,
  category: string,
  subcategory: string
): EmissionFactorEntry | null => {
  try {
    const scopeData = baseCarbone[scope as keyof BaseCarbone] as any;
    if (!scopeData) return null;
    const categoryData = scopeData[category];
    if (!categoryData) return null;
    return categoryData[subcategory] || null;
  } catch {
    return null;
  }
};

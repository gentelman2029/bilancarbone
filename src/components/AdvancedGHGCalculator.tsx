import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Download, RotateCcw, Factory, Car, Zap, Trash2, Building, Plane, Ship, TreePine, Flame, Save, X, CheckCircle2, Sparkles, TrendingUp, Globe, ArrowDown, ArrowUp, Calendar, FileText, AlertTriangle } from "lucide-react";
import { useEmissions } from '@/contexts/EmissionsContext';
import { useCarbonReports } from '@/hooks/useCarbonReports';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useCalculationDetails } from '@/hooks/useCalculationDetails';
import { CalculationDetailsSection } from '@/components/CalculationDetailsSection';
import { Scope3AdvancedModule } from '@/components/scope3/Scope3AdvancedModule';
import { ScopeDetailModal } from '@/components/ScopeDetailModal';

// Base Carbone® ADEME - Facteurs d'émissions complets (kg CO2e par unité)
const baseCarbone = {
  // SCOPE 1 - Émissions directes
  scope1: {
    combustibles: {
      // Combustibles fossiles liquides
      diesel: { unite: "litre", facteur: 2.68, description: "Gazole/Diesel" },
      essence: { unite: "litre", facteur: 2.31, description: "Essence" },
      fioulLourd: { unite: "litre", facteur: 3.17, description: "Fioul lourd" },
      fioulDomestique: { unite: "litre", facteur: 2.69, description: "Fioul domestique" },
      gpl: { unite: "litre", facteur: 1.64, description: "GPL" },
      // Combustibles gazeux
      gazNaturel: { unite: "kWh PCI", facteur: 0.227, description: "Gaz naturel" },
      propane: { unite: "kg", facteur: 2.94, description: "Propane" },
      butane: { unite: "kg", facteur: 2.93, description: "Butane" },
      // Combustibles solides
      charbon: { unite: "kg", facteur: 2.42, description: "Charbon" },
      coke: { unite: "kg", facteur: 3.11, description: "Coke de pétrole" },
      lignite: { unite: "kg", facteur: 1.17, description: "Lignite" },
      // Biomasse
      boisBuche: { unite: "kg", facteur: 0.013, description: "Bois bûche" },
      granulesBois: { unite: "kg", facteur: 0.024, description: "Granulés de bois" },
      plaquettesBois: { unite: "kg", facteur: 0.015, description: "Plaquettes de bois" }
    },
    refrigerants: {
      // Hydrofluorocarbures (HFC)
      r134a: { unite: "kg", facteur: 1430, description: "R-134a (Tétrafluoroéthane)" },
      r404a: { unite: "kg", facteur: 3922, description: "R-404A" },
      r410a: { unite: "kg", facteur: 2088, description: "R-410A" },
      r407c: { unite: "kg", facteur: 1774, description: "R-407C" },
      r32: { unite: "kg", facteur: 675, description: "R-32" },
      // Chlorofluorocarbures (CFC)
      r11: { unite: "kg", facteur: 4750, description: "R-11 (CFC-11)" },
      r12: { unite: "kg", facteur: 10900, description: "R-12 (CFC-12)" },
      // Hydrochlorofluorocarbures (HCFC)
      r22: { unite: "kg", facteur: 1810, description: "R-22 (HCFC-22)" }
    },
    vehicules: {
      // Véhicules particuliers
      voitureEssence: { unite: "km", facteur: 0.193, description: "Voiture essence (moyenne)" },
      voitureDiesel: { unite: "km", facteur: 0.166, description: "Voiture diesel (moyenne)" },
      voitureElectrique: { unite: "km", facteur: 0.020, description: "Voiture électrique" },
      voitureHybride: { unite: "km", facteur: 0.110, description: "Voiture hybride" },
      // Véhicules utilitaires
      utilitaireDiesel: { unite: "km", facteur: 0.218, description: "Véhicule utilitaire diesel" },
      utilitaireEssence: { unite: "km", facteur: 0.251, description: "Véhicule utilitaire essence" },
      // Poids lourds
      camion12t: { unite: "km", facteur: 0.390, description: "Camion 12-14t" },
      camion20t: { unite: "km", facteur: 0.580, description: "Camion 16-32t" },
      camion40t: { unite: "km", facteur: 0.790, description: "Camion >32t" },
      // Équipements mobiles
      tracteurAgricole: { unite: "heure", facteur: 12.5, description: "Tracteur agricole" },
      chariotElevateur: { unite: "heure", facteur: 8.2, description: "Chariot élévateur" }
    }
  },

  // SCOPE 2 - Émissions indirectes liées à l'énergie
  scope2: {
    electricite: {
      // Mix électrique par pays (kg CO2e/kWh)
      france: { unite: "kWh", facteur: 0.057, description: "Électricité France (mix national)" },
      tunisie: { unite: "kWh", facteur: 0.474, description: "Électricité Tunisie" },
      allemagne: { unite: "kWh", facteur: 0.401, description: "Électricité Allemagne" },
      espagne: { unite: "kWh", facteur: 0.256, description: "Électricité Espagne" },
      italie: { unite: "kWh", facteur: 0.359, description: "Électricité Italie" },
      royaumeUni: { unite: "kWh", facteur: 0.233, description: "Électricité Royaume-Uni" },
      moyenneEurope: { unite: "kWh", facteur: 0.276, description: "Électricité moyenne européenne" },
      // Sources renouvelables
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
      // Transport de marchandises
      routierPoidsMoyen: { unite: "t.km", facteur: 0.171, description: "Transport routier poids moyen" },
      routierPoidsLourd: { unite: "t.km", facteur: 0.111, description: "Transport routier poids lourd" },
      ferroviaire: { unite: "t.km", facteur: 0.033, description: "Transport ferroviaire" },
      maritime: { unite: "t.km", facteur: 0.015, description: "Transport maritime" },
      aerien: { unite: "t.km", facteur: 1.47, description: "Transport aérien cargo" },
      fluvial: { unite: "t.km", facteur: 0.037, description: "Transport fluvial" },
      // Transport de personnes
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
      // Matériaux de construction
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
      // Traitement des déchets
      incineration: { unite: "kg", facteur: 0.78, description: "Incinération avec récupération d'énergie" },
      enfouissement: { unite: "kg", facteur: 0.48, description: "Enfouissement" },
      recyclage: { unite: "kg", facteur: 0.025, description: "Recyclage" },
      compostage: { unite: "kg", facteur: 0.015, description: "Compostage" },
      methanisation: { unite: "kg", facteur: 0.022, description: "Méthanisation" }
    },
    alimentation: {
      // Produits alimentaires (kg CO2e/kg)
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
      // Services numériques
      emailSimple: { unite: "email", facteur: 0.004, description: "Email simple" },
      emailPieceJointe: { unite: "email", facteur: 0.035, description: "Email avec pièce jointe" },
      rechercheWeb: { unite: "recherche", facteur: 0.007, description: "Recherche web" },
      streamingVideo: { unite: "heure", facteur: 0.036, description: "Streaming vidéo HD" },
      visioconference: { unite: "heure", facteur: 0.150, description: "Visioconférence" },
      stockageCloud: { unite: "Go.an", facteur: 0.5, description: "Stockage cloud" }
    }
  }
};

interface CalculationResult {
  category: string;
  subcategory: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  emissions: number;
  description: string;
}

export const AdvancedGHGCalculator = () => {
  const { toast } = useToast();
  const { updateEmissions, emissions: emissionsContext } = useEmissions();
  const { createReport } = useCarbonReports();
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [activeTab, setActiveTab] = useState("scope1");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(() => {
    const saved = localStorage.getItem('calculator-advanced-mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // États pour les modales de détail des scopes
  const [openScopeModal, setOpenScopeModal] = useState<1 | 2 | 3 | null>(null);
  
  // Charger le total Scope 3 avancé depuis localStorage au démarrage
  const [scope3AdvancedTotal, setScope3AdvancedTotal] = useState(() => {
    const savedCalculations = localStorage.getItem('scope3-advanced-calculations');
    if (savedCalculations) {
      try {
        const calculations = JSON.parse(savedCalculations);
        return calculations.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0);
      } catch {
        return 0;
      }
    }
    return 0;
  });
  
  // Hook pour les détails de calcul par section
  const { 
    sectionDetails, 
    setSectionDetails,
    addCalculationDetail, 
    removeCalculationDetail, 
    clearSectionDetails, 
    clearAllDetails,
    getTotalEmissionsBySection 
  } = useCalculationDetails();

  // Convertir les sectionDetails en entrées pour les modales
  // Pour Scope 3, inclure aussi les calculs du module avancé
  const getScopeEntries = (scopeNumber: 1 | 2 | 3) => {
    const scopeKey = `scope${scopeNumber}` as keyof typeof sectionDetails;
    const details = sectionDetails[scopeKey];
    
    // Convertir les sectionDetails existants
    const entriesFromDetails = details.map(detail => ({
      id: detail.id,
      source: detail.description,
      quantity: detail.quantity,
      unit: detail.unit,
      emissionFactor: detail.emissionFactor,
      total: detail.emissions
    }));
    
    // Pour Scope 3, ajouter aussi les calculs du module avancé (GHG Protocol 15 catégories)
    if (scopeNumber === 3 && isAdvancedMode) {
      try {
        const savedAdvanced = localStorage.getItem('scope3-advanced-calculations');
        if (savedAdvanced) {
          const advancedCalcs = JSON.parse(savedAdvanced);
          const entriesFromAdvanced = advancedCalcs.map((calc: any) => ({
            id: calc.id || `scope3-adv-${Date.now()}-${Math.random()}`,
            source: `${calc.categoryName} - ${calc.subcategoryName}`,
            quantity: calc.quantity,
            unit: calc.unit,
            emissionFactor: calc.emissions / (calc.quantity || 1), // Recalculer le facteur
            total: calc.emissions
          }));
          return [...entriesFromDetails, ...entriesFromAdvanced];
        }
      } catch (e) {
        console.error('Erreur lecture Scope3 avancé:', e);
      }
    }
    
    return entriesFromDetails;
  };

  // Mettre à jour les sectionDetails depuis les entrées modifiées dans la modale
  const handleScopeEntriesChange = (scopeNumber: 1 | 2 | 3, entries: { id: string; source: string; quantity: number; unit: string; emissionFactor: number; total: number }[]) => {
    const scopeKey = `scope${scopeNumber}` as 'scope1' | 'scope2' | 'scope3';
    
    // Convertir les entrées en format CalculationDetail
    const newDetails = entries.map(entry => ({
      id: entry.id,
      type: entry.source.toLowerCase().replace(/\s+/g, '-'),
      description: entry.source,
      quantity: entry.quantity,
      unit: entry.unit,
      emissionFactor: entry.emissionFactor,
      emissions: entry.total,
      timestamp: new Date().toLocaleString('fr-FR'),
      formuleDetail: `${entry.quantity} ${entry.unit} × ${entry.emissionFactor} kg CO₂e/${entry.unit}`
    }));
    
    // Mettre à jour sectionDetails (cela déclenchera un re-render et mettra à jour getEmissionsByScope)
    setSectionDetails(scopeKey, newDetails);
    
    // Pour le mode avancé Scope 3, synchroniser aussi le localStorage
    if (scopeNumber === 3 && isAdvancedMode) {
      const advancedEntries = entries.filter(e => e.id.startsWith('scope3-adv-') || e.source.includes(' - '));
      if (advancedEntries.length > 0) {
        try {
          const savedAdvanced = localStorage.getItem('scope3-advanced-calculations');
          if (savedAdvanced) {
            const originalAdvanced = JSON.parse(savedAdvanced);
            const updatedAdvanced = originalAdvanced.filter((calc: any) => 
              advancedEntries.some(e => e.id === calc.id)
            ).map((calc: any) => {
              const matchingEntry = advancedEntries.find(e => e.id === calc.id);
              if (matchingEntry) {
                return { ...calc, quantity: matchingEntry.quantity, emissions: matchingEntry.total };
              }
              return calc;
            });
            localStorage.setItem('scope3-advanced-calculations', JSON.stringify(updatedAdvanced));
            setScope3AdvancedTotal(updatedAdvanced.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0));
          }
        } catch (e) {
          console.error('Erreur mise à jour Scope3 avancé:', e);
        }
      }
    }
  };

  // États pour les formulaires avec persistance
  const [scope1Data, setScope1Data] = useState(() => {
    const saved = localStorage.getItem('calculator-scope1');
    return saved ? JSON.parse(saved) : {
      combustibleType: "",
      combustibleQuantity: "",
      combustibleUnit: "kg", // kg ou tonne
      refrigerantType: "",
      refrigerantQuantity: "",
      refrigerantUnit: "kg",
      vehiculeType: "",
      vehiculeQuantity: "",
      vehiculeUnit: "km" // km ou 1000km
    };
  });

  const [scope2Data, setScope2Data] = useState(() => {
    const saved = localStorage.getItem('calculator-scope2');
    return saved ? JSON.parse(saved) : {
      electriciteType: "",
      electriciteQuantity: "",
      electriciteUnit: "kWh", // kWh ou MWh
      vapeurType: "",
      vapeurQuantity: "",
      vapeurUnit: "kWh"
    };
  });

  const [scope3Data, setScope3Data] = useState(() => {
    const saved = localStorage.getItem('calculator-scope3');
    return saved ? JSON.parse(saved) : {
      transportType: "",
      transportQuantity: "",
      materiauType: "",
      materiauQuantity: "",
      dechetType: "",
      dechetQuantity: "",
      alimentationType: "",
      alimentationQuantity: "",
      numeriqueType: "",
      numeriqueQuantity: ""
    };
  });

  // États pour les données d'entreprise avec persistance
  const [chiffreAffaires, setChiffreAffaires] = useState(() => {
    const saved = localStorage.getItem('calculator-chiffre-affaires');
    return saved ? JSON.parse(saved) : 1000;
  });

  const [nombrePersonnels, setNombrePersonnels] = useState(() => {
    const saved = localStorage.getItem('calculator-nombre-personnels');
    return saved ? JSON.parse(saved) : 50;
  });

  const [emissionsAnneePrecedente, setEmissionsAnneePrecedente] = useState(() => {
    const saved = localStorage.getItem('calculator-emissions-annee-precedente');
    return saved ? JSON.parse(saved) : 0;
  });

  const [objectifSBTI, setObjectifSBTI] = useState(() => {
    const saved = localStorage.getItem('calculator-objectif-sbti');
    return saved ? JSON.parse(saved) : 0;
  });

  const [objectifsSBTParAnnee, setObjectifsSBTParAnnee] = useState(() => {
    const saved = localStorage.getItem('calculator-objectifs-sbt-par-annee');
    return saved ? JSON.parse(saved) : {};
  });

  const [emissionsReelles, setEmissionsReelles] = useState(() => {
    const saved = localStorage.getItem('calculator-emissions-reelles');
    return saved ? JSON.parse(saved) : 0;
  });

  // États pour les benchmarks sectoriels avec persistance
  const [moyenneSectorielle, setMoyenneSectorielle] = useState(() => {
    const saved = localStorage.getItem('calculator-moyenne-sectorielle');
    return saved ? JSON.parse(saved) : 0;
  });

  const [leadersSecteur, setLeadersSecteur] = useState(() => {
    const saved = localStorage.getItem('calculator-leaders-secteur');
    return saved ? JSON.parse(saved) : 0;
  });

  const [positionClassement, setPositionClassement] = useState(() => {
    const saved = localStorage.getItem('calculator-position-classement');
    return saved ? JSON.parse(saved) : 0;
  });

  // Vérifier l'authentification et charger les calculs sauvegardés
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
    
    const savedCalculations = localStorage.getItem('calculator-calculations');
    if (savedCalculations) {
      setCalculations(JSON.parse(savedCalculations));
    }
  }, []);

  // Sauvegarder le mode avancé
  useEffect(() => {
    localStorage.setItem('calculator-advanced-mode', JSON.stringify(isAdvancedMode));
  }, [isAdvancedMode]);

  // Sauvegarder les formulaires
  useEffect(() => {
    localStorage.setItem('calculator-scope1', JSON.stringify(scope1Data));
  }, [scope1Data]);

  useEffect(() => {
    localStorage.setItem('calculator-scope2', JSON.stringify(scope2Data));
  }, [scope2Data]);

  useEffect(() => {
    localStorage.setItem('calculator-scope3', JSON.stringify(scope3Data));
  }, [scope3Data]);

  // Sauvegarder les données d'entreprise ET mettre à jour le contexte
  useEffect(() => {
    localStorage.setItem('calculator-chiffre-affaires', JSON.stringify(chiffreAffaires));
    updateEmissions({ chiffreAffaires });
  }, [chiffreAffaires, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-nombre-personnels', JSON.stringify(nombrePersonnels));
    updateEmissions({ nombrePersonnels });
  }, [nombrePersonnels, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-emissions-annee-precedente', JSON.stringify(emissionsAnneePrecedente));
    updateEmissions({ emissionsAnneePrecedente });
  }, [emissionsAnneePrecedente, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-objectif-sbti', JSON.stringify(objectifSBTI));
    updateEmissions({ objectifSBTI });
  }, [objectifSBTI, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-objectifs-sbt-par-annee', JSON.stringify(objectifsSBTParAnnee));
    updateEmissions({ objectifsSBTParAnnee });
  }, [objectifsSBTParAnnee, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-emissions-reelles', JSON.stringify(emissionsReelles));
    updateEmissions({ emissionsReelles });
  }, [emissionsReelles, updateEmissions]);

  // Sauvegarder les benchmarks sectoriels
  useEffect(() => {
    localStorage.setItem('calculator-moyenne-sectorielle', JSON.stringify(moyenneSectorielle));
    updateEmissions({ moyenneSectorielle });
  }, [moyenneSectorielle, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-leaders-secteur', JSON.stringify(leadersSecteur));
    updateEmissions({ leadersSecteur });
  }, [leadersSecteur, updateEmissions]);

  useEffect(() => {
    localStorage.setItem('calculator-position-classement', JSON.stringify(positionClassement));
    updateEmissions({ positionClassement });
  }, [positionClassement, updateEmissions]);

  // Sauvegarder les calculs et mettre à jour le contexte (incluant Scope 3 avancé)
  useEffect(() => {
    localStorage.setItem('calculator-calculations', JSON.stringify(calculations));
    const emissionsByScope = getEmissionsByScope();
    const scope3Total = isAdvancedMode 
      ? emissionsByScope.scope3 + scope3AdvancedTotal 
      : emissionsByScope.scope3;
    updateEmissions({
      scope1: emissionsByScope.scope1,
      scope2: emissionsByScope.scope2,
      scope3: scope3Total
    });
  }, [calculations, scope3AdvancedTotal, isAdvancedMode, sectionDetails]);

  const addCalculation = (scope: string, category: string, subcategory: string, quantity: number) => {
    const scopeData = baseCarbone[scope as keyof typeof baseCarbone] as any;
    if (!scopeData) return;

    const categoryData = scopeData[category];
    if (!categoryData) return;

    const item = categoryData[subcategory];
    if (!item) return;

    const emissions = quantity * item.facteur;
    
    const newCalculation: CalculationResult = {
      category: scope,
      subcategory,
      quantity,
      unit: item.unite,
      emissionFactor: item.facteur,
      emissions,
      description: item.description
    };

    setCalculations(prev => [...prev, newCalculation]);
    
    // Ajouter aux détails de section pour la traçabilité
    const formuleDetail = `${quantity} ${item.unite} × ${item.facteur} kg CO₂e/${item.unite} = ${emissions.toFixed(2)} kg CO₂e`;
    
    addCalculationDetail(scope as 'scope1' | 'scope2' | 'scope3', {
      type: category,
      description: item.description,
      quantity,
      unit: item.unite,
      emissionFactor: item.facteur,
      emissions,
      formuleDetail
    });
    
    toast({
      title: "Calcul ajouté ✅",
      description: `${emissions.toFixed(2)} kg CO₂e ajoutés au ${scope.toUpperCase()}`,
    });
  };

  const getTotalEmissions = () => {
    return calculations.reduce((total, calc) => total + calc.emissions, 0);
  };

  const getEmissionsByScope = () => {
    // Les sectionDetails sont la source de vérité pour les totaux
    // Ils sont synchronisés avec les calculations via addCalculation
    const scope1 = sectionDetails.scope1.reduce((sum, d) => sum + d.emissions, 0);
    const scope2 = sectionDetails.scope2.reduce((sum, d) => sum + d.emissions, 0);
    const scope3 = sectionDetails.scope3.reduce((sum, d) => sum + d.emissions, 0);
    return { scope1, scope2, scope3 };
  };

  const resetCalculations = () => {
    setCalculations([]);
    localStorage.removeItem('calculator-calculations');
    localStorage.removeItem('calculator-scope1');
    localStorage.removeItem('calculator-scope2');
    localStorage.removeItem('calculator-scope3');
    
    const initialScope1 = {
      combustibleType: "",
      combustibleQuantity: "",
      combustibleUnit: "kg",
      refrigerantType: "",
      refrigerantQuantity: "",
      refrigerantUnit: "kg",
      vehiculeType: "",
      vehiculeQuantity: "",
      vehiculeUnit: "km"
    };
    
    const initialScope2 = {
      electriciteType: "",
      electriciteQuantity: "",
      electriciteUnit: "kWh",
      vapeurType: "",
      vapeurQuantity: "",
      vapeurUnit: "kWh"
    };
    
    const initialScope3 = {
      transportType: "",
      transportQuantity: "",
      materiauType: "",
      materiauQuantity: "",
      dechetType: "",
      dechetQuantity: "",
      alimentationType: "",
      alimentationQuantity: "",
      numeriqueType: "",
      numeriqueQuantity: ""
    };
    
    setScope1Data(initialScope1);
    setScope2Data(initialScope2);
    setScope3Data(initialScope3);
    
    // Réinitialiser les détails de calcul par section
    clearAllDetails();
    
    updateEmissions({ scope1: 0, scope2: 0, scope3: 0 });
    
    toast({
      title: "Calculs réinitialisés ✅",
      description: "Tous les calculs et détails ont été supprimés",
    });
  };

  // Sauvegarder les calculs dans la base de données
  const saveToDatabase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentification requise",
        description: "Connectez-vous pour sauvegarder vos calculs dans le dashboard",
        variant: "destructive",
      });
      return;
    }

    if (calculations.length === 0) {
      toast({
        title: "Aucun calcul",
        description: "Ajoutez au moins un calcul avant de sauvegarder",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Créer un calcul d'émissions d'abord
      const { data: calculationData, error: calcError } = await supabase
        .from('emissions_calculations')
        .insert({
          user_id: user.id,
          scope1: emissions.scope1,
          scope2: emissions.scope2,
          scope3: emissions.scope3,
          total: getTotalEmissions(),
          carbon_intensity: getTotalEmissions() / 1000 / chiffreAffaires,
          calculation_data: JSON.stringify({
            chiffre_affaires: chiffreAffaires,
            nombre_personnels: nombrePersonnels,
            emissions_annee_precedente: emissionsAnneePrecedente,
            objectif_sbti: objectifSBTI,
            calculations: calculations
          }) as any
        })
        .select()
        .single();

      if (calcError) throw calcError;

      // Sauvegarder les données détaillées d'émissions
      const emissionsData = calculations.map(calc => ({
        calculation_id: calculationData.id,
        category: calc.subcategory,
        subcategory: calc.description,
        scope_type: calc.category,
        value: calc.quantity,
        unit: calc.unit,
        emission_factor: calc.emissionFactor,
        co2_equivalent: calc.emissions
      }));

      const { error: emissionsError } = await supabase
        .from('emissions_data')
        .insert(emissionsData);

      if (emissionsError) throw emissionsError;

      // Créer un rapport carbone
      await createReport({
        report_name: `Bilan Carbone ${new Date().toLocaleDateString('fr-FR')}`,
        period: `Année ${new Date().getFullYear()}`,
        total_co2e: getTotalEmissions() / 1000, // Conversion en tonnes
        scope1_total: emissions.scope1 / 1000,
        scope2_total: emissions.scope2 / 1000,
        scope3_total: emissions.scope3 / 1000,
        carbon_intensity: getTotalEmissions() / 1000 / chiffreAffaires,
        company_info: {
          chiffre_affaires: chiffreAffaires,
          nombre_personnels: nombrePersonnels,
          emissions_annee_precedente: emissionsAnneePrecedente,
          objectif_sbti: objectifSBTI,
          date_calcul: new Date().toISOString()
        },
        calculation_id: calculationData.id
      });

      toast({
        title: "Données sauvegardées",
        description: "Vos calculs ont été sauvegardés et sont maintenant visibles sur le dashboard",
      });

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Scope', 'Catégorie', 'Description', 'Quantité', 'Unité', 'Facteur d\'émission', 'Émissions (kg CO2e)'];
    const csvContent = [
      headers.join(','),
      ...calculations.map(calc => [
        calc.category.toUpperCase(),
        calc.subcategory,
        calc.description,
        calc.quantity,
        calc.unit,
        calc.emissionFactor,
        calc.emissions.toFixed(3)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bilan-carbone-detaille-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const emissions = getEmissionsByScope();
  
  // Calcul du total global incluant Scope 3 avancé
  const scope3TotalWithAdvanced = isAdvancedMode 
    ? (emissions.scope3 + scope3AdvancedTotal) 
    : emissions.scope3;
  const totalGlobal = emissions.scope1 + emissions.scope2 + scope3TotalWithAdvanced;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard Global - Toujours visible en premier */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Résultat Global des Émissions GES
              </CardTitle>
              <Badge variant="outline" className="text-sm font-medium">
                <Calendar className="h-3 w-3 mr-1" />
                Année 2025
              </Badge>
              {/* Indicateur de variation par rapport à l'année précédente */}
              {emissionsAnneePrecedente > 0 && totalGlobal > 0 && (
                (() => {
                  const currentTotal = totalGlobal / 1000;
                  const variation = ((currentTotal - emissionsAnneePrecedente) / emissionsAnneePrecedente) * 100;
                  const isReduction = variation < 0;
                  return (
                    <Badge 
                      className={`flex items-center gap-1 ${
                        isReduction 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                      }`}
                      variant="outline"
                    >
                      {isReduction ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUp className="h-3 w-3" />
                      )}
                      {Math.abs(variation).toFixed(1)}% vs 2024
                    </Badge>
                  );
                })()
              )}
            </div>
            {isAdvancedMode && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                GHG Protocol - 15 catégories
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Scope 1 - Cliquable */}
            <Card 
              className="p-4 bg-red-500/10 border-red-500/30 cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 hover:shadow-md"
              onClick={() => setOpenScopeModal(1)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-muted-foreground">Scope 1</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {(emissions.scope1 / 1000).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </Card>

            {/* Scope 2 - Cliquable */}
            <Card 
              className="p-4 bg-amber-500/10 border-amber-500/30 cursor-pointer hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200 hover:shadow-md"
              onClick={() => setOpenScopeModal(2)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Scope 2</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {(emissions.scope2 / 1000).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </Card>

            {/* Scope 3 - Cliquable */}
            <Card 
              className="p-4 bg-blue-500/10 border-blue-500/30 cursor-pointer hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200 hover:shadow-md"
              onClick={() => setOpenScopeModal(3)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Scope 3</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {(scope3TotalWithAdvanced / 1000).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </Card>

            {/* Séparateur visuel */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-3xl font-bold text-muted-foreground">=</div>
            </div>

            {/* Total Global */}
            <Card className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">TOTAL</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {(totalGlobal / 1000).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">tCO₂e</div>
            </Card>
          </div>

          {/* Barre de répartition */}
          {totalGlobal > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                <div 
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${(emissions.scope1 / totalGlobal) * 100}%` }}
                />
                <div 
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${(emissions.scope2 / totalGlobal) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${(scope3TotalWithAdvanced / totalGlobal) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Scope 1: {((emissions.scope1 / totalGlobal) * 100).toFixed(1)}%
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Scope 2: {((emissions.scope2 / totalGlobal) * 100).toFixed(1)}%
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Scope 3: {((scope3TotalWithAdvanced / totalGlobal) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Intensité carbone et CA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Intensité carbone</span>
              <span className="text-lg font-bold text-destructive">
                {chiffreAffaires > 0 ? (totalGlobal / 1000 / chiffreAffaires).toFixed(3) : '0.000'} tCO₂e/k€
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">CA:</span>
              <Input
                type="number"
                value={chiffreAffaires}
                onChange={(e) => setChiffreAffaires(Number(e.target.value) || 1000)}
                className="w-24 text-center font-bold h-8"
              />
              <span className="text-sm font-medium">k€</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Par employé</span>
              <span className="text-lg font-bold">
                {nombrePersonnels > 0 ? (totalGlobal / 1000 / nombrePersonnels).toFixed(2) : '0.00'} tCO₂e
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerte Sanity Check - si Scope 1 > 500 tonnes */}
      {emissions.scope1 / 1000 > 500 && (
        <Alert variant="destructive" className="border-2 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Attention - Valeur anormalement élevée</AlertTitle>
          <AlertDescription className="text-base">
            Le Scope 1 affiche <strong>{(emissions.scope1 / 1000).toFixed(1)} tCO₂e</strong>, ce qui semble très élevé.
            <br />
            <strong>Avez-vous saisi des kg au lieu de tonnes ?</strong> Les facteurs d'émission Base Carbone® sont en <strong>kg CO₂e par unité</strong>.
            <br />
            Vérifiez vos quantités saisies ou utilisez le sélecteur d'unité approprié dans les formulaires.
          </AlertDescription>
        </Alert>
      )}

      {/* Header with mode toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Calculateur GES {isAdvancedMode ? 'Avancé' : 'Standard'} - Base Carbone® ADEME
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isAdvancedMode 
              ? 'Calculateur expert avec 15 catégories Scope 3 conformes au GHG Protocol.'
              : 'Calculateur basé sur les facteurs d\'émissions officiels de la Base Carbone® ADEME.'
            }
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Standard</span>
          </div>
          <Switch
            checked={isAdvancedMode}
            onCheckedChange={setIsAdvancedMode}
          />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Avancé</span>
          </div>
        </div>
      </div>

      {/* Anciens métriques masquées - remplacées par le dashboard global */}
      {calculations.length > 0 && (
        <div>

        {/* Nouveaux champs d'entreprise */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Nombre de personnels</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  value={nombrePersonnels}
                  onChange={(e) => setNombrePersonnels(Number(e.target.value) || 50)}
                  className="w-24 text-center text-2xl font-bold"
                />
                <span className="text-lg font-medium">pers.</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Émissions année précédente (2024)</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  value={emissionsAnneePrecedente}
                  onChange={(e) => setEmissionsAnneePrecedente(Number(e.target.value) || 0)}
                  className="w-24 text-center text-2xl font-bold"
                  step="0.1"
                />
                <span className="text-lg font-medium">tCO2e</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Émissions Réelles (2025)</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  value={emissionsReelles}
                  onChange={(e) => setEmissionsReelles(Number(e.target.value) || 0)}
                  className="w-24 text-center text-2xl font-bold"
                  step="0.1"
                />
                <span className="text-lg font-medium">tCO2e</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Objectifs SBT par année */}
        <Card className="p-6 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Objectifs Science Based Targets (SBT) par année</CardTitle>
            <CardDescription>
              Saisissez vos objectifs de réduction d'émissions pour chaque année de 2023 à 2030 (en tCO2e)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <div key={year} className="space-y-2">
                  <Label className="text-sm font-medium">{year}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={objectifsSBTParAnnee[year] || ''}
                      onChange={(e) => {
                        const newObjectifs = { ...objectifsSBTParAnnee };
                        if (e.target.value === '') {
                          delete newObjectifs[year];
                        } else {
                          newObjectifs[year] = Number(e.target.value) || 0;
                        }
                        setObjectifsSBTParAnnee(newObjectifs);
                      }}
                      className="text-center"
                      step="0.1"
                      placeholder="0"
                    />
                    <span className="text-sm text-muted-foreground">tCO2e</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Champs de benchmarks sectoriels */}
        <Card className="p-6 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Benchmarks Sectoriels</CardTitle>
            <CardDescription>
              Saisissez les valeurs de référence de votre secteur d'activité (en tCO2e/employé)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-lg text-muted-foreground mb-2">Moyenne sectorielle</div>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={moyenneSectorielle}
                    onChange={(e) => setMoyenneSectorielle(Number(e.target.value) || 0)}
                    className="w-24 text-center text-xl font-bold"
                    step="0.1"
                    placeholder="0.0"
                  />
                  <span className="text-lg font-medium">tCO2e/employé</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="text-lg text-muted-foreground mb-2">Leaders du secteur</div>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={leadersSecteur}
                    onChange={(e) => setLeadersSecteur(Number(e.target.value) || 0)}
                    className="w-24 text-center text-xl font-bold"
                    step="0.1"
                    placeholder="0.0"
                  />
                  <span className="text-lg font-medium">tCO2e/employé</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="text-lg text-muted-foreground mb-2">Position (classement)</div>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={positionClassement}
                    onChange={(e) => setPositionClassement(Number(e.target.value) || 0)}
                    className="w-24 text-center text-xl font-bold"
                    placeholder="0"
                  />
                  <span className="text-lg font-medium">ème</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Résumé des émissions par scope */}
      {calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Bilan Carbone par Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {(emissions.scope1 / 1000).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 1 (tCO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {(emissions.scope2 / 1000).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 2 (tCO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {(scope3TotalWithAdvanced / 1000).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 3 (tCO2e)</div>
                {isAdvancedMode && scope3AdvancedTotal > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    (incl. {(scope3AdvancedTotal / 1000).toFixed(1)}t avancé)
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {(totalGlobal / 1000).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Total (tCO2e)</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveToDatabase} variant="default" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isAuthenticated ? "Sauvegarder au Dashboard" : "Connexion requise"}
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
              <Button onClick={resetCalculations} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scope1" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Scope 1
          </TabsTrigger>
          <TabsTrigger value="scope2" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Scope 2
          </TabsTrigger>
          <TabsTrigger value="scope3" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Scope 3
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Détails calcul
          </TabsTrigger>
        </TabsList>

        {/* SCOPE 1 */}
        <TabsContent value="scope1" className="space-y-6">
          {/* Info sur les unités */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important :</strong> Les facteurs d'émission Base Carbone® ADEME sont en <strong>kg CO₂e</strong> par unité.
              Les résultats sont automatiquement convertis en tonnes (tCO₂e) pour l'affichage dans le dashboard.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Combustibles
              </CardTitle>
              <CardDescription>
                Combustion de combustibles fossiles et biomasse dans vos installations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Type de combustible</Label>
                  <Select 
                    value={scope1Data.combustibleType} 
                    onValueChange={(value) => setScope1Data(prev => ({...prev, combustibleType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(baseCarbone.scope1.combustibles).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.description} ({value.unite})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope1Data.combustibleQuantity}
                    onChange={(e) => setScope1Data(prev => ({...prev, combustibleQuantity: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Unité saisie</Label>
                  <Select 
                    value={scope1Data.combustibleUnit || "standard"} 
                    onValueChange={(value) => setScope1Data(prev => ({...prev, combustibleUnit: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unité..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Unité standard (facteur ADEME)</SelectItem>
                      <SelectItem value="tonne">Tonne → auto-conversion ×1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      const qty = Number(scope1Data.combustibleQuantity);
                      const finalQty = scope1Data.combustibleUnit === "tonne" ? qty * 1000 : qty;
                      addCalculation('scope1', 'combustibles', scope1Data.combustibleType, finalQty);
                    }}
                    disabled={!scope1Data.combustibleType || !scope1Data.combustibleQuantity}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Véhicules d'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Type de véhicule</Label>
                  <Select 
                    value={scope1Data.vehiculeType} 
                    onValueChange={(value) => setScope1Data(prev => ({...prev, vehiculeType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(baseCarbone.scope1.vehicules).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.description} ({value.unite})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Distance/Quantité</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope1Data.vehiculeQuantity}
                    onChange={(e) => setScope1Data(prev => ({...prev, vehiculeQuantity: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Unité saisie</Label>
                  <Select 
                    value={scope1Data.vehiculeUnit || "km"} 
                    onValueChange={(value) => setScope1Data(prev => ({...prev, vehiculeUnit: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unité..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilomètres (km)</SelectItem>
                      <SelectItem value="1000km">Milliers km → ×1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      const qty = Number(scope1Data.vehiculeQuantity);
                      const finalQty = scope1Data.vehiculeUnit === "1000km" ? qty * 1000 : qty;
                      addCalculation('scope1', 'vehicules', scope1Data.vehiculeType, finalQty);
                    }}
                    disabled={!scope1Data.vehiculeType || !scope1Data.vehiculeQuantity}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réfrigérants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Type de réfrigérant</Label>
                  <Select 
                    value={scope1Data.refrigerantType} 
                    onValueChange={(value) => setScope1Data(prev => ({...prev, refrigerantType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(baseCarbone.scope1.refrigerants).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.description} ({value.unite})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope1Data.refrigerantQuantity}
                    onChange={(e) => setScope1Data(prev => ({...prev, refrigerantQuantity: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Unité saisie</Label>
                  <Select 
                    value={scope1Data.refrigerantUnit || "kg"} 
                    onValueChange={(value) => setScope1Data(prev => ({...prev, refrigerantUnit: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unité..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                      <SelectItem value="tonne">Tonnes → ×1000 kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      const qty = Number(scope1Data.refrigerantQuantity);
                      const finalQty = scope1Data.refrigerantUnit === "tonne" ? qty * 1000 : qty;
                      addCalculation('scope1', 'refrigerants', scope1Data.refrigerantType, finalQty);
                    }}
                    disabled={!scope1Data.refrigerantType || !scope1Data.refrigerantQuantity}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCOPE 2 */}
        <TabsContent value="scope2" className="space-y-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 pb-4">
              {/* Info sur les unités */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Important :</strong> Les facteurs d'émission sont en kg CO₂e par kWh. 
                  Si vous avez des MWh, utilisez le sélecteur d'unité pour une conversion automatique (×1000).
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Électricité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Mix électrique</Label>
                      <Select 
                        value={scope2Data.electriciteType} 
                        onValueChange={(value) => setScope2Data(prev => ({...prev, electriciteType: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(baseCarbone.scope2.electricite).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.description} ({value.unite})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Consommation</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={scope2Data.electriciteQuantity}
                        onChange={(e) => setScope2Data(prev => ({...prev, electriciteQuantity: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label>Unité saisie</Label>
                      <Select 
                        value={scope2Data.electriciteUnit || "kWh"} 
                        onValueChange={(value) => setScope2Data(prev => ({...prev, electriciteUnit: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unité..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kWh">Kilowattheure (kWh)</SelectItem>
                          <SelectItem value="MWh">Mégawattheure (MWh) → ×1000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => {
                          const qty = Number(scope2Data.electriciteQuantity);
                          const finalQty = scope2Data.electriciteUnit === "MWh" ? qty * 1000 : qty;
                          addCalculation('scope2', 'electricite', scope2Data.electriciteType, finalQty);
                        }}
                        disabled={!scope2Data.electriciteType || !scope2Data.electriciteQuantity}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vapeur et chaleur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Type d'énergie thermique</Label>
                      <Select 
                        value={scope2Data.vapeurType} 
                        onValueChange={(value) => setScope2Data(prev => ({...prev, vapeurType: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(baseCarbone.scope2.vapeur).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.description} ({value.unite})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={scope2Data.vapeurQuantity}
                        onChange={(e) => setScope2Data(prev => ({...prev, vapeurQuantity: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label>Unité saisie</Label>
                      <Select 
                        value={scope2Data.vapeurUnit || "kWh"} 
                        onValueChange={(value) => setScope2Data(prev => ({...prev, vapeurUnit: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unité..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kWh">Kilowattheure (kWh)</SelectItem>
                          <SelectItem value="MWh">Mégawattheure (MWh) → ×1000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => {
                          const qty = Number(scope2Data.vapeurQuantity);
                          const finalQty = scope2Data.vapeurUnit === "MWh" ? qty * 1000 : qty;
                          addCalculation('scope2', 'vapeur', scope2Data.vapeurType, finalQty);
                        }}
                        disabled={!scope2Data.vapeurType || !scope2Data.vapeurQuantity}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* SCOPE 3 */}
        <TabsContent value="scope3" className="space-y-6">
          {isAdvancedMode ? (
            /* Mode Avancé: 15 catégories GHG Protocol */
            <Scope3AdvancedModule 
              onTotalChange={setScope3AdvancedTotal}
            />
          ) : (
            /* Mode Standard: catégories simplifiées */
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transport */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Transport
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Mode de transport</Label>
                        <Select 
                          value={scope3Data.transportType} 
                          onValueChange={(value) => setScope3Data(prev => ({...prev, transportType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(baseCarbone.scope3.transport).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.description} ({value.unite})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={scope3Data.transportQuantity}
                          onChange={(e) => setScope3Data(prev => ({...prev, transportQuantity: e.target.value}))}
                        />
                      </div>
                      <Button 
                        onClick={() => addCalculation('scope3', 'transport', scope3Data.transportType, Number(scope3Data.transportQuantity))}
                        disabled={!scope3Data.transportType || !scope3Data.transportQuantity}
                        className="w-full"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Matériaux */}
                <Card>
                  <CardHeader>
                    <CardTitle>Matériaux</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Type de matériau</Label>
                        <Select 
                          value={scope3Data.materiauType} 
                          onValueChange={(value) => setScope3Data(prev => ({...prev, materiauType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(baseCarbone.scope3.materiaux).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.description} ({value.unite})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité (kg)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={scope3Data.materiauQuantity}
                          onChange={(e) => setScope3Data(prev => ({...prev, materiauQuantity: e.target.value}))}
                        />
                      </div>
                      <Button 
                        onClick={() => addCalculation('scope3', 'materiaux', scope3Data.materiauType, Number(scope3Data.materiauQuantity))}
                        disabled={!scope3Data.materiauType || !scope3Data.materiauQuantity}
                        className="w-full"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Déchets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Déchets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Mode de traitement</Label>
                        <Select 
                          value={scope3Data.dechetType} 
                          onValueChange={(value) => setScope3Data(prev => ({...prev, dechetType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(baseCarbone.scope3.dechets).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.description} ({value.unite})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité (kg)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={scope3Data.dechetQuantity}
                          onChange={(e) => setScope3Data(prev => ({...prev, dechetQuantity: e.target.value}))}
                        />
                      </div>
                      <Button 
                        onClick={() => addCalculation('scope3', 'dechets', scope3Data.dechetType, Number(scope3Data.dechetQuantity))}
                        disabled={!scope3Data.dechetType || !scope3Data.dechetQuantity}
                        className="w-full"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Alimentation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Alimentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Produit alimentaire</Label>
                        <Select 
                          value={scope3Data.alimentationType} 
                          onValueChange={(value) => setScope3Data(prev => ({...prev, alimentationType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(baseCarbone.scope3.alimentation).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.description} ({value.unite})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={scope3Data.alimentationQuantity}
                          onChange={(e) => setScope3Data(prev => ({...prev, alimentationQuantity: e.target.value}))}
                        />
                      </div>
                      <Button 
                        onClick={() => addCalculation('scope3', 'alimentation', scope3Data.alimentationType, Number(scope3Data.alimentationQuantity))}
                        disabled={!scope3Data.alimentationType || !scope3Data.alimentationQuantity}
                        className="w-full"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Numérique */}
                <Card>
                  <CardHeader>
                    <CardTitle>Services numériques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Service numérique</Label>
                        <Select 
                          value={scope3Data.numeriqueType} 
                          onValueChange={(value) => setScope3Data(prev => ({...prev, numeriqueType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(baseCarbone.scope3.numerique).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.description} ({value.unite})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={scope3Data.numeriqueQuantity}
                          onChange={(e) => setScope3Data(prev => ({...prev, numeriqueQuantity: e.target.value}))}
                        />
                      </div>
                      <Button 
                        onClick={() => addCalculation('scope3', 'numerique', scope3Data.numeriqueType, Number(scope3Data.numeriqueQuantity))}
                        disabled={!scope3Data.numeriqueType || !scope3Data.numeriqueQuantity}
                        className="w-full"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Invitation vers mode avancé */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Besoin d'une couverture complète Scope 3 ?</h3>
                        <p className="text-sm text-muted-foreground">
                          Activez le mode avancé pour accéder aux 15 catégories du GHG Protocol
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setIsAdvancedMode(true)} variant="default">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Activer le mode avancé
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* DÉTAILS DE CALCUL - Onglet unifié pour les 3 scopes */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Détail des Calculs - Année 2025
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    <Calculator className="h-3 w-3 mr-1" />
                    {calculations.length} calcul{calculations.length > 1 ? 's' : ''} enregistré{calculations.length > 1 ? 's' : ''}
                  </Badge>
                  <Button 
                    onClick={resetCalculations} 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                    disabled={calculations.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réinitialiser tout
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Résumé des totaux */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center border-r border-border/50">
                  <div className="text-sm text-muted-foreground">Scope 1</div>
                  <div className="text-xl font-bold text-red-600">{(emissions.scope1 / 1000).toFixed(2)} tCO₂e</div>
                </div>
                <div className="text-center border-r border-border/50">
                  <div className="text-sm text-muted-foreground">Scope 2</div>
                  <div className="text-xl font-bold text-amber-600">{(emissions.scope2 / 1000).toFixed(2)} tCO₂e</div>
                </div>
                <div className="text-center border-r border-border/50">
                  <div className="text-sm text-muted-foreground">Scope 3</div>
                  <div className="text-xl font-bold text-blue-600">{(scope3TotalWithAdvanced / 1000).toFixed(2)} tCO₂e</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">TOTAL</div>
                  <div className="text-xl font-bold text-primary">{(totalGlobal / 1000).toFixed(2)} tCO₂e</div>
                </div>
              </div>

              {/* Sections de détails par scope */}
              <div className="space-y-6">
                {/* Scope 1 */}
                <CalculationDetailsSection
                  title="Scope 1 - Émissions Directes"
                  icon={<Flame className="h-5 w-5 text-red-500" />}
                  details={sectionDetails.scope1}
                  sectionColor="destructive"
                  onRemoveDetail={(detailId) => removeCalculationDetail('scope1', detailId)}
                  onClearSection={() => clearSectionDetails('scope1')}
                />

                {/* Scope 2 */}
                <CalculationDetailsSection
                  title="Scope 2 - Émissions Indirectes Énergie"
                  icon={<Zap className="h-5 w-5 text-amber-500" />}
                  details={sectionDetails.scope2}
                  sectionColor="default"
                  onRemoveDetail={(detailId) => removeCalculationDetail('scope2', detailId)}
                  onClearSection={() => clearSectionDetails('scope2')}
                />

                {/* Scope 3 */}
                <CalculationDetailsSection
                  title="Scope 3 - Autres Émissions Indirectes"
                  icon={<Globe className="h-5 w-5 text-blue-500" />}
                  details={sectionDetails.scope3}
                  sectionColor="secondary"
                  onRemoveDetail={(detailId) => removeCalculationDetail('scope3', detailId)}
                  onClearSection={() => clearSectionDetails('scope3')}
                />

                {/* Message si aucun détail */}
                {sectionDetails.scope1.length === 0 && sectionDetails.scope2.length === 0 && sectionDetails.scope3.length === 0 && calculations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucun calcul enregistré</p>
                    <p className="text-sm">Ajoutez des données dans les onglets Scope 1, 2 ou 3 pour voir les détails ici</p>
                  </div>
                )}

                {/* Tableau récapitulatif si calculs présents */}
                {calculations.length > 0 && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Tableau Récapitulatif
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 font-medium">Scope</th>
                              <th className="text-left p-3 font-medium">Description</th>
                              <th className="text-right p-3 font-medium">Quantité</th>
                              <th className="text-right p-3 font-medium">Facteur d'émission</th>
                              <th className="text-right p-3 font-medium">Émissions (kg CO₂e)</th>
                              <th className="text-center p-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculations.map((calc, index) => (
                              <tr key={index} className="border-b hover:bg-muted/30">
                                <td className="p-3">
                                  <Badge variant={calc.category === 'scope1' ? 'destructive' : calc.category === 'scope2' ? 'default' : 'secondary'}>
                                    {calc.category.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="p-3">{calc.description}</td>
                                <td className="text-right p-3">{calc.quantity.toLocaleString('fr-FR')} {calc.unit}</td>
                                <td className="text-right p-3 text-muted-foreground">{calc.emissionFactor} kg CO₂e/{calc.unit}</td>
                                <td className="text-right p-3 font-semibold">{calc.emissions.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</td>
                                <td className="text-center p-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newCalculations = calculations.filter((_, i) => i !== index);
                                      setCalculations(newCalculations);
                                    }}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-primary/5 font-bold">
                              <td className="p-3" colSpan={4}>TOTAL GÉNÉRAL (Année 2025)</td>
                              <td className="text-right p-3 text-primary">{totalGlobal.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} kg CO₂e</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions d'export */}
              {calculations.length > 0 && (
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Button onClick={saveToDatabase} variant="default">
                    <Save className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Sauvegarder au Dashboard" : "Connexion requise"}
                  </Button>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales de détail des scopes */}
      <ScopeDetailModal
        isOpen={openScopeModal === 1}
        onClose={() => setOpenScopeModal(null)}
        scopeNumber={1}
        scopeTitle="Scope 1"
        entries={getScopeEntries(1)}
        onEntriesChange={(entries) => handleScopeEntriesChange(1, entries)}
      />
      <ScopeDetailModal
        isOpen={openScopeModal === 2}
        onClose={() => setOpenScopeModal(null)}
        scopeNumber={2}
        scopeTitle="Scope 2"
        entries={getScopeEntries(2)}
        onEntriesChange={(entries) => handleScopeEntriesChange(2, entries)}
      />
      <ScopeDetailModal
        isOpen={openScopeModal === 3}
        onClose={() => setOpenScopeModal(null)}
        scopeNumber={3}
        scopeTitle="Scope 3"
        entries={getScopeEntries(3)}
        onEntriesChange={(entries) => handleScopeEntriesChange(3, entries)}
      />

    </div>
  );
};
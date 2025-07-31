import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Download, RotateCcw, Factory, Car, Zap, Trash2, Building, Plane, Ship, TreePine, Flame } from "lucide-react";
import { useEmissions } from '@/contexts/EmissionsContext';


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
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [activeTab, setActiveTab] = useState("scope1");

  // États pour les formulaires avec persistance
  const [scope1Data, setScope1Data] = useState(() => {
    const saved = localStorage.getItem('calculator-scope1');
    return saved ? JSON.parse(saved) : {
      combustibleType: "",
      combustibleQuantity: "",
      refrigerantType: "",
      refrigerantQuantity: "",
      vehiculeType: "",
      vehiculeQuantity: ""
    };
  });

  const [scope2Data, setScope2Data] = useState(() => {
    const saved = localStorage.getItem('calculator-scope2');
    return saved ? JSON.parse(saved) : {
      electriciteType: "",
      electriciteQuantity: "",
      vapeurType: "",
      vapeurQuantity: ""
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

  // État pour le chiffre d'affaires
  const [chiffreAffaires, setChiffreAffaires] = useState(() => {
    const saved = localStorage.getItem('calculator-chiffre-affaires');
    return saved ? JSON.parse(saved) : 1000;
  });

  // Charger les calculs sauvegardés
  useEffect(() => {
    const savedCalculations = localStorage.getItem('calculator-calculations');
    if (savedCalculations) {
      setCalculations(JSON.parse(savedCalculations));
    }
  }, []);

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

  // Sauvegarder le chiffre d'affaires
  useEffect(() => {
    localStorage.setItem('calculator-chiffre-affaires', JSON.stringify(chiffreAffaires));
  }, [chiffreAffaires]);

  // Sauvegarder les calculs et mettre à jour le contexte
  useEffect(() => {
    localStorage.setItem('calculator-calculations', JSON.stringify(calculations));
    const emissionsByScope = getEmissionsByScope();
    updateEmissions({
      scope1: emissionsByScope.scope1,
      scope2: emissionsByScope.scope2,
      scope3: emissionsByScope.scope3
    });
  }, [calculations]);

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
    
    toast({
      title: "Calcul ajouté",
      description: `${emissions.toFixed(2)} kg CO2e ajoutés au bilan`,
    });
  };

  const getTotalEmissions = () => {
    return calculations.reduce((total, calc) => total + calc.emissions, 0);
  };

  const getEmissionsByScope = () => {
    const scope1 = calculations.filter(c => c.category === 'scope1').reduce((sum, c) => sum + c.emissions, 0);
    const scope2 = calculations.filter(c => c.category === 'scope2').reduce((sum, c) => sum + c.emissions, 0);
    const scope3 = calculations.filter(c => c.category === 'scope3').reduce((sum, c) => sum + c.emissions, 0);
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
      refrigerantType: "",
      refrigerantQuantity: "",
      vehiculeType: "",
      vehiculeQuantity: ""
    };
    
    const initialScope2 = {
      electriciteType: "",
      electriciteQuantity: "",
      vapeurType: "",
      vapeurQuantity: ""
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
    
    updateEmissions({ scope1: 0, scope2: 0, scope3: 0 });
    
    toast({
      title: "Calculs réinitialisés",
      description: "Tous les calculs ont été supprimés",
    });
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Calculateur GES Avancé - Base Carbone® ADEME
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Calculateur complet basé sur les facteurs d'émissions officiels de la Base Carbone® de l'ADEME.
          Couvre tous les scopes et catégories d'émissions GES.
        </p>
      </div>

      {/* Métriques principales */}
      {calculations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {(getTotalEmissions() / 1000).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Total tCO2e</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5 border border-secondary/20">
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Intensité carbone</div>
              <div className="text-3xl font-bold text-secondary">
                {(getTotalEmissions() / 1000 / chiffreAffaires).toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground">tCO2e/k€ CA</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20">
            <div className="text-center space-y-2">
              <div className="text-lg text-muted-foreground mb-2">Chiffre d'affaires</div>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  value={chiffreAffaires}
                  onChange={(e) => setChiffreAffaires(Number(e.target.value) || 1000)}
                  className="w-24 text-center text-2xl font-bold border-accent/30"
                />
                <span className="text-2xl font-bold text-accent">k€</span>
              </div>
            </div>
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
                  {emissions.scope1.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 1 (kg CO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {emissions.scope2.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 2 (kg CO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {emissions.scope3.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Scope 3 (kg CO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {getTotalEmissions().toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Total (kg CO2e)</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
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
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        {/* SCOPE 1 */}
        <TabsContent value="scope1" className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="flex items-end">
                  <Button 
                    onClick={() => addCalculation('scope1', 'combustibles', scope1Data.combustibleType, Number(scope1Data.combustibleQuantity))}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope1Data.vehiculeQuantity}
                    onChange={(e) => setScope1Data(prev => ({...prev, vehiculeQuantity: e.target.value}))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => addCalculation('scope1', 'vehicules', scope1Data.vehiculeType, Number(scope1Data.vehiculeQuantity))}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Quantité (kg)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope1Data.refrigerantQuantity}
                    onChange={(e) => setScope1Data(prev => ({...prev, refrigerantQuantity: e.target.value}))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => addCalculation('scope1', 'refrigerants', scope1Data.refrigerantType, Number(scope1Data.refrigerantQuantity))}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Électricité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Consommation (kWh)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope2Data.electriciteQuantity}
                    onChange={(e) => setScope2Data(prev => ({...prev, electriciteQuantity: e.target.value}))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => addCalculation('scope2', 'electricite', scope2Data.electriciteType, Number(scope2Data.electriciteQuantity))}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Quantité (kWh)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={scope2Data.vapeurQuantity}
                    onChange={(e) => setScope2Data(prev => ({...prev, vapeurQuantity: e.target.value}))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => addCalculation('scope2', 'vapeur', scope2Data.vapeurType, Number(scope2Data.vapeurQuantity))}
                    disabled={!scope2Data.vapeurType || !scope2Data.vapeurQuantity}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCOPE 3 */}
        <TabsContent value="scope3" className="space-y-6">
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
        </TabsContent>
      </Tabs>

      {/* Tableau des calculs */}
      {calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détail des calculs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Scope</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">Quantité</th>
                    <th className="text-right p-2">Facteur</th>
                    <th className="text-right p-2">Émissions</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.map((calc, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Badge variant={calc.category === 'scope1' ? 'destructive' : calc.category === 'scope2' ? 'default' : 'secondary'}>
                          {calc.category.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2">{calc.description}</td>
                      <td className="text-right p-2">{calc.quantity} {calc.unit}</td>
                      <td className="text-right p-2">{calc.emissionFactor} kg CO2e/{calc.unit}</td>
                      <td className="text-right p-2 font-semibold">{calc.emissions.toFixed(2)} kg CO2e</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
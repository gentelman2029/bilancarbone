import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Calculator, FileSpreadsheet, Zap, Car, Trash2, Building, Factory, TrendingUp, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useEmissions } from "@/contexts/EmissionsContext";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { SectorComparison } from "@/components/SectorComparison";

export const DataCollection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { emissions, updateEmissions, resetEmissions, hasEmissions, saveToSupabase } = useEmissions();

  // Formulaires persistants avec localStorage
  const scope1Form = usePersistentForm("emissions-scope1", {
    fuelType: "",
    fuelQuantity: "",
    vehicleType: "",
    vehicleFuel: "",
    vehicleFuelQuantity: "",
    equipmentType: "",
    equipmentFuel: "",
    equipmentQuantity: "",
    refrigerantType: "",
    refrigerantQuantity: ""
  });
  
  const scope2Form = usePersistentForm("emissions-scope2", {
    electricity: "",
    provider: "",
    renewable: "",
    location: "",
    heating: "",
    cooling: "",
    steam: ""
  });
  
  const scope3Form = usePersistentForm("emissions-scope3", {
    // Transport
    transportType: "",
    distance: "",
    frequency: "",
    // Déchets
    wasteType: "",
    wasteQuantity: "",
    treatment: "",
    // Achats
    materialType: "",
    materialQuantity: "",
    // Voyages d'affaires
    businessTripType: "",
    businessDistance: "",
    businessFrequency: "",
    // Fret et distribution
    freightType: "",
    freightDistance: "",
    freightWeight: "",
    // Immobilisations
    assetType: "",
    assetQuantity: "",
    assetLifespan: ""
  });

  // États pour compatibilité avec le code existant
  const [scope1Data, setScope1Data] = useState(scope1Form.data);
  const [scope2Data, setScope2Data] = useState(scope2Form.data);
  const [scope3Data, setScope3Data] = useState(scope3Form.data);
  
  // Emission factors (kg CO2e per unit) - facteurs étendus
  const emissionFactors = {
    scope1: {
      // Combustibles fixes
      gas: { kwh: 0.227, m3: 2.35, liters: 2.67 },
      fuel: { kwh: 0.324, m3: 2.85, liters: 2.67 },
      propane: { kwh: 0.234, m3: 1.97, liters: 1.64 },
      butane: { kwh: 0.238, m3: 2.04, liters: 1.68 },
      coal: { kwh: 0.354, kg: 2.42 },
      wood: { kwh: 0.018, kg: 0.39 },
      // Véhicules de l'entreprise
      vehicles: {
        diesel: 2.68, // kg CO2e/litre
        gasoline: 2.31, // kg CO2e/litre
        lpg: 1.64, // kg CO2e/litre
        electric: 0.057 // kg CO2e/kWh
      },
      // Équipements mobiles
      equipment: {
        diesel: 2.68,
        gasoline: 2.31,
        propane: 1.64
      },
      // Fuites de réfrigérants (kg CO2e/kg)
      refrigerants: {
        r134a: 1430,
        r404a: 3922,
        r410a: 2088,
        r407c: 1774,
        co2: 1
      }
    },
    scope2: {
      // Facteurs par pays/région
      france: 0.057,
      germany: 0.485,
      uk: 0.233,
      spain: 0.256,
      italy: 0.315,
      poland: 0.781,
      tunisia: 0.441, // Facteur d'émission pour la Tunisie
      // Types d'énergie
      heating: 0.227,
      cooling: 0.057,
      steam: 0.324
    },
    scope3: {
      // Transport (kg CO2e/km)
      transport: {
        car: 0.193,
        truck: 0.085,
        plane: 0.258,
        train: 0.041,
        bus: 0.089,
        metro: 0.024,
        bike: 0,
        walk: 0
      },
      // Déchets (kg CO2e/kg)
      waste: {
        paper: 0.91,
        plastic: 2.92,
        organic: 0.58,
        mixed: 1.85,
        metal: 1.34,
        glass: 0.51,
        textile: 3.8,
        electronic: 15.2
      },
      // Achats de biens et services (kg CO2e/kg ou €)
      materials: {
        steel: 1.85, // kg CO2e/kg
        aluminum: 8.24,
        concrete: 0.11,
        wood: 0.39,
        plastic: 1.83,
        paper: 0.71,
        services: 0.15 // kg CO2e/€
      },
      // Voyages d'affaires (kg CO2e/km)
      businessTravel: {
        domesticFlight: 0.255,
        internationalFlight: 0.195,
        train: 0.041,
        car: 0.193,
        hotel: 30.5 // kg CO2e/nuit
      },
      // Fret et distribution (kg CO2e/tonne.km)
      freight: {
        truck: 0.062,
        rail: 0.022,
        ship: 0.011,
        plane: 0.602
      },
      // Immobilisations (kg CO2e/unité amortie)
      assets: {
        computer: 300, // kg CO2e/ordinateur/an
        server: 1000,
        vehicle: 2000,
        building: 50000,
        machinery: 5000
      }
    }
  };
  
  const calculateScope1Emissions = () => {
    let totalEmissions = 0;
    let details = [];
    
    // Synchroniser avec les formulaires persistants
    const currentData = scope1Form.data;
    setScope1Data(currentData);
    
    // Combustibles fixes
    if (currentData.fuelType && currentData.fuelQuantity) {
      const quantity = parseFloat(currentData.fuelQuantity);
      const fuelFactors = emissionFactors.scope1[currentData.fuelType];
      
      if (fuelFactors) {
        // Utiliser par défaut le facteur en litres
        const factor = fuelFactors.liters || Object.values(fuelFactors)[0];
        const emissions = quantity * factor;
        totalEmissions += emissions;
        details.push(`Combustible: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Véhicules de l'entreprise
    if (currentData.vehicleType && currentData.vehicleFuel && currentData.vehicleFuelQuantity) {
      const fuelQuantity = parseFloat(currentData.vehicleFuelQuantity);
      const factor = emissionFactors.scope1.vehicles[currentData.vehicleFuel];
      
      if (factor) {
        const emissions = fuelQuantity * factor;
        totalEmissions += emissions;
        details.push(`Véhicules: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Équipements mobiles
    if (currentData.equipmentType && currentData.equipmentFuel && currentData.equipmentQuantity) {
      const equipmentQuantity = parseFloat(currentData.equipmentQuantity);
      const factor = emissionFactors.scope1.equipment[currentData.equipmentFuel];
      
      if (factor) {
        const emissions = equipmentQuantity * factor;
        totalEmissions += emissions;
        details.push(`Équipements: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Fuites de réfrigérants
    if (currentData.refrigerantType && currentData.refrigerantQuantity) {
      const refrigerantQuantity = parseFloat(currentData.refrigerantQuantity);
      const factor = emissionFactors.scope1.refrigerants[currentData.refrigerantType];
      
      if (factor) {
        const emissions = refrigerantQuantity * factor;
        totalEmissions += emissions;
        details.push(`Réfrigérants: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    if (totalEmissions === 0) {
      toast({
        title: t('data_collection.missing_data'),
        description: t('data_collection.scope1_missing'),
        variant: "destructive"
      });
      return;
    }
    
    updateEmissions({ scope1: totalEmissions });
    
    toast({
      title: t('data_collection.scope1_calculated'),
      description: `${details.join('\n')}\n${t('data_collection.total_emissions_label')}: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };
  
  const calculateScope2Emissions = () => {
    let totalEmissions = 0;
    let details = [];
    
    // Synchroniser avec les formulaires persistants
    const currentData = scope2Form.data;
    setScope2Data(currentData);
    
    // Électricité
    if (currentData.electricity && currentData.location) {
      const electricity = parseFloat(currentData.electricity);
      const renewablePercent = parseFloat(currentData.renewable) || 0;
      const baseFactor = emissionFactors.scope2[currentData.location];
      
      if (baseFactor) {
        const adjustedFactor = baseFactor * (1 - renewablePercent / 100);
        const emissions = electricity * adjustedFactor;
        totalEmissions += emissions;
        details.push(`Électricité: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Chauffage
    if (currentData.heating) {
      const heating = parseFloat(currentData.heating);
      const factor = emissionFactors.scope2.heating;
      const emissions = heating * factor;
      totalEmissions += emissions;
      details.push(`Chauffage: ${emissions.toFixed(2)} kg CO2e`);
    }
    
    // Refroidissement
    if (currentData.cooling) {
      const cooling = parseFloat(currentData.cooling);
      const factor = emissionFactors.scope2.cooling;
      const emissions = cooling * factor;
      totalEmissions += emissions;
      details.push(`Refroidissement: ${emissions.toFixed(2)} kg CO2e`);
    }
    
    // Vapeur
    if (currentData.steam) {
      const steam = parseFloat(currentData.steam);
      const factor = emissionFactors.scope2.steam;
      const emissions = steam * factor;
      totalEmissions += emissions;
      details.push(`Vapeur: ${emissions.toFixed(2)} kg CO2e`);
    }
    
    if (totalEmissions === 0) {
      toast({
        title: t('data_collection.missing_data'),
        description: t('data_collection.scope2_missing'),
        variant: "destructive"
      });
      return;
    }
    
    updateEmissions({ scope2: totalEmissions });
    
    toast({
      title: t('data_collection.scope2_calculated'),
      description: `${details.join('\n')}\n${t('data_collection.total_emissions_label')}: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };
  
  const calculateScope3Emissions = () => {
    let totalEmissions = 0;
    let details = [];
    
    // Utiliser directement les données persistantes du formulaire
    const currentData = scope3Form.data;
    
    // Transport des employés
    if (currentData.transportType && currentData.distance) {
      const distance = parseFloat(currentData.distance);
      const transportFactor = emissionFactors.scope3.transport[currentData.transportType];
      
      if (transportFactor) {
        let multiplier = 1;
        switch (currentData.frequency) {
          case 'daily': multiplier = 365; break;
          case 'weekly': multiplier = 52; break;
          case 'monthly': multiplier = 12; break;
          case 'yearly': multiplier = 1; break;
        }
        const emissions = distance * transportFactor * multiplier;
        totalEmissions += emissions;
        details.push(`Transport employés: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Déchets
    if (currentData.wasteType && currentData.wasteQuantity) {
      const wasteQuantity = parseFloat(currentData.wasteQuantity);
      const wasteFactor = emissionFactors.scope3.waste[currentData.wasteType];
      
      if (wasteFactor) {
        let treatmentMultiplier = 1;
        if (currentData.treatment === 'recycling') treatmentMultiplier = 0.3;
        else if (currentData.treatment === 'composting') treatmentMultiplier = 0.1;
        
        const emissions = wasteQuantity * wasteFactor * treatmentMultiplier;
        totalEmissions += emissions;
        details.push(`Déchets: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Achats de biens et services
    if (currentData.materialType && currentData.materialQuantity) {
      const materialQuantity = parseFloat(currentData.materialQuantity);
      const materialFactor = emissionFactors.scope3.materials[currentData.materialType];
      
      if (materialFactor) {
        const emissions = materialQuantity * materialFactor;
        totalEmissions += emissions;
        details.push(`Achats: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Voyages d'affaires
    if (currentData.businessTripType && currentData.businessDistance) {
      const businessDistance = parseFloat(currentData.businessDistance);
      const businessFactor = emissionFactors.scope3.businessTravel[currentData.businessTripType];
      
      if (businessFactor) {
        let multiplier = 1;
        switch (currentData.businessFrequency) {
          case 'daily': multiplier = 365; break;
          case 'weekly': multiplier = 52; break;
          case 'monthly': multiplier = 12; break;
          case 'yearly': multiplier = 1; break;
        }
        const emissions = businessDistance * businessFactor * multiplier;
        totalEmissions += emissions;
        details.push(`Voyages d'affaires: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Fret et distribution
    if (currentData.freightType && currentData.freightDistance && currentData.freightWeight) {
      const freightDistance = parseFloat(currentData.freightDistance);
      const freightWeight = parseFloat(currentData.freightWeight);
      const freightFactor = emissionFactors.scope3.freight[currentData.freightType];
      
      if (freightFactor) {
        const emissions = freightDistance * freightWeight * freightFactor;
        totalEmissions += emissions;
        details.push(`Fret: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Immobilisations
    if (currentData.assetType && currentData.assetQuantity && currentData.assetLifespan) {
      const assetQuantity = parseFloat(currentData.assetQuantity);
      const assetLifespan = parseFloat(currentData.assetLifespan);
      const assetFactor = emissionFactors.scope3.assets[currentData.assetType];
      
      if (assetFactor) {
        const emissions = (assetQuantity * assetFactor) / assetLifespan;
        totalEmissions += emissions;
        details.push(`Immobilisations: ${emissions.toFixed(2)} kg CO2e/an`);
      }
    }
    
    if (totalEmissions === 0) {
      toast({
        title: t('data_collection.missing_data'),
        description: t('data_collection.scope3_missing'),
        variant: "destructive"
      });
      return;
    }
    
    updateEmissions({ scope3: totalEmissions });
    
    toast({
      title: t('data_collection.scope3_calculated'),
      description: `${details.join('\n')}\n${t('data_collection.total_emissions_label')}: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };

  const calculateGlobalScore = async () => {
    const total = emissions.scope1 + emissions.scope2 + emissions.scope3;
    
    if (total === 0) {
      toast({
        title: t('data_collection.no_data'),
        description: t('data_collection.calculate_first'),
        variant: "destructive"
      });
      return;
    }

    // Préparer les données détaillées pour la sauvegarde
    const detailedData = {
      scope1Data,
      scope2Data,
      scope3Data,
      emissionFactors,
      calculationDate: new Date().toISOString(),
      total
    };

    // Sauvegarder automatiquement dans Supabase
    const calculationId = await saveToSupabase({
      scope1: emissions.scope1,
      scope2: emissions.scope2, 
      scope3: emissions.scope3,
      total: total,
      detailedData,
      inputData: {
        scope1Data,
        scope2Data,
        scope3Data
      }
    });

    if (calculationId) {
      updateEmissions({
        scope1: emissions.scope1,
        scope2: emissions.scope2,
        scope3: emissions.scope3,
        total: total,
        calculationId
      });
    }
    
    toast({
      title: t('data_collection.global_calculated'),
      description: `${t('data_collection.total_emissions_label')}: ${total.toFixed(2)} kg CO2e\nScope 1: ${emissions.scope1.toFixed(2)} kg CO2e (${((emissions.scope1/total)*100).toFixed(1)}%)\nScope 2: ${emissions.scope2.toFixed(2)} kg CO2e (${((emissions.scope2/total)*100).toFixed(1)}%)\nScope 3: ${emissions.scope3.toFixed(2)} kg CO2e (${((emissions.scope3/total)*100).toFixed(1)}%)`,
      variant: "default"
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('data_collection.title')}</h1>
          <p className="text-muted-foreground">{t('data_collection.subtitle')}</p>
        </div>

      {/* Score global */}
      {hasEmissions && (
        <Card className="p-6 bg-gradient-card border shadow-card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <span>Score Global des Émissions</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scope 1</p>
                  <p className="text-lg font-semibold text-foreground">{emissions.scope1.toFixed(2)} kg CO2e</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scope 2</p>
                  <p className="text-lg font-semibold text-foreground">{emissions.scope2.toFixed(2)} kg CO2e</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scope 3</p>
                  <p className="text-lg font-semibold text-foreground">{emissions.scope3.toFixed(2)} kg CO2e</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">{emissions.total.toFixed(2)} kg CO2e</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="destructive" onClick={resetEmissions}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              <Button variant="eco" onClick={calculateGlobalScore}>
                <Calculator className="w-4 h-4 mr-2" />
                Recalculer le score
              </Button>
              <Button variant="outline" onClick={() => {
                resetEmissions();
                scope1Form.resetData();
                scope2Form.resetData();
                scope3Form.resetData();
                setScope1Data({
                  fuelType: "",
                  fuelQuantity: "",
                  vehicleType: "",
                  vehicleFuel: "",
                  vehicleFuelQuantity: "",
                  equipmentType: "",
                  equipmentFuel: "",
                  equipmentQuantity: "",
                  refrigerantType: "",
                  refrigerantQuantity: ""
                });
                setScope2Data({
                  electricity: "",
                  provider: "",
                  renewable: "",
                  location: "",
                  heating: "",
                  cooling: "",
                  steam: ""
                });
                setScope3Data({
                  transportType: "",
                  distance: "",
                  frequency: "",
                  wasteType: "",
                  wasteQuantity: "",
                  treatment: "",
                  materialType: "",
                  materialQuantity: "",
                  businessTripType: "",
                  businessDistance: "",
                  businessFrequency: "",
                  freightType: "",
                  freightDistance: "",
                  freightWeight: "",
                  assetType: "",
                  assetQuantity: "",
                  assetLifespan: ""
                });
                toast({
                  title: "Données réinitialisées",
                  description: "Toutes les données ont été effacées",
                  variant: "default"
                });
              }}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="scope1" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scope1" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Scope 1</span>
          </TabsTrigger>
          <TabsTrigger value="scope2" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Scope 2</span>
          </TabsTrigger>
          <TabsTrigger value="scope3" className="flex items-center space-x-2">
            <Car className="w-4 h-4" />
            <span>Scope 3</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scope1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Combustibles fixes */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Combustibles fixes</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fuel-type">Type de combustible</Label>
                  <Select value={scope1Form.data.fuelType} onValueChange={(value) => scope1Form.updateData({ fuelType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un combustible" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Gaz naturel</SelectItem>
                      <SelectItem value="fuel">Fioul domestique</SelectItem>
                      <SelectItem value="propane">Propane</SelectItem>
                      <SelectItem value="butane">Butane</SelectItem>
                      <SelectItem value="coal">Charbon</SelectItem>
                      <SelectItem value="wood">Bois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuelQuantity">Quantité consommée (L)</Label>
                  <Input 
                    id="fuelQuantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope1Form.data.fuelQuantity}
                    onChange={(e) => scope1Form.updateData({ fuelQuantity: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Véhicules de l'entreprise */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Car className="w-5 h-5 text-primary" />
                <span>Véhicules de l'entreprise</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vehicle-type">Type de véhicule</Label>
                  <Select value={scope1Form.data.vehicleType} onValueChange={(value) => scope1Form.updateData({ vehicleType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Voiture</SelectItem>
                      <SelectItem value="van">Camionnette</SelectItem>
                      <SelectItem value="truck">Camion</SelectItem>
                      <SelectItem value="forklift">Chariot élévateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle-fuel">Carburant</Label>
                  <Select value={scope1Form.data.vehicleFuel} onValueChange={(value) => scope1Form.updateData({ vehicleFuel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de carburant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="gasoline">Essence</SelectItem>
                      <SelectItem value="lpg">GPL</SelectItem>
                      <SelectItem value="electric">Électrique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicleFuelQuantity">Quantité de carburant (L ou kWh)</Label>
                  <Input 
                    id="vehicleFuelQuantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope1Form.data.vehicleFuelQuantity}
                    onChange={(e) => scope1Form.updateData({ vehicleFuelQuantity: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Équipements mobiles */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Factory className="w-5 h-5 text-primary" />
                <span>Équipements mobiles</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="equipment-type">Type d'équipement</Label>
                  <Select value={scope1Form.data.equipmentType} onValueChange={(value) => scope1Form.updateData({ equipmentType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'équipement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generator">Générateur</SelectItem>
                      <SelectItem value="compressor">Compresseur</SelectItem>
                      <SelectItem value="excavator">Excavatrice</SelectItem>
                      <SelectItem value="tractor">Tracteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="equipment-fuel">Carburant</Label>
                  <Select value={scope1Form.data.equipmentFuel} onValueChange={(value) => scope1Form.updateData({ equipmentFuel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de carburant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="gasoline">Essence</SelectItem>
                      <SelectItem value="propane">Propane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="equipment-quantity">Consommation (L)</Label>
                  <Input 
                    id="equipment-quantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope1Form.data.equipmentQuantity}
                    onChange={(e) => scope1Form.updateData({ equipmentQuantity: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Fuites de réfrigérants */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Building className="w-5 h-5 text-primary" />
                <span>Fuites de réfrigérants</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="refrigerant-type">Type de réfrigérant</Label>
                  <Select value={scope1Form.data.refrigerantType} onValueChange={(value) => scope1Form.updateData({ refrigerantType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de réfrigérant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="r134a">R-134a</SelectItem>
                      <SelectItem value="r404a">R-404A</SelectItem>
                      <SelectItem value="r410a">R-410A</SelectItem>
                      <SelectItem value="r407c">R-407C</SelectItem>
                      <SelectItem value="co2">CO2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="refrigerant-quantity">Quantité de fuite (kg)</Label>
                  <Input 
                    id="refrigerant-quantity" 
                    placeholder="0" 
                    type="number" 
                    step="0.01"
                    value={scope1Form.data.refrigerantQuantity}
                    onChange={(e) => scope1Form.updateData({ refrigerantQuantity: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-6">
            <Button variant="eco" className="w-full" onClick={calculateScope1Emissions}>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer toutes les émissions Scope 1
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="scope2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Électricité */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Électricité</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="electricity">Consommation électrique (kWh)</Label>
                  <Input 
                    id="electricity" 
                    placeholder="0" 
                    type="number" 
                    value={scope2Form.data.electricity}
                    onChange={(e) => scope2Form.updateData({ electricity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="renewable">% Énergies renouvelables</Label>
                  <Input 
                    id="renewable" 
                    placeholder="0" 
                    type="number" 
                    max="100"
                    value={scope2Form.data.renewable}
                    onChange={(e) => scope2Form.updateData({ renewable: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Select value={scope2Form.data.location} onValueChange={(value) => scope2Form.updateData({ location: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pays/Région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="germany">Allemagne</SelectItem>
                      <SelectItem value="uk">Royaume-Uni</SelectItem>
                      <SelectItem value="spain">Espagne</SelectItem>
                      <SelectItem value="italy">Italie</SelectItem>
                      <SelectItem value="poland">Pologne</SelectItem>
                      <SelectItem value="tunisia">Tunisie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Chauffage et refroidissement */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Building className="w-5 h-5 text-primary" />
                <span>Chauffage/Refroidissement acheté</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="heating">Chauffage acheté (kWh)</Label>
                  <Input 
                    id="heating" 
                    placeholder="0" 
                    type="number" 
                    value={scope2Form.data.heating}
                    onChange={(e) => scope2Form.updateData({ heating: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cooling">Refroidissement acheté (kWh)</Label>
                  <Input 
                    id="cooling" 
                    placeholder="0" 
                    type="number" 
                    value={scope2Form.data.cooling}
                    onChange={(e) => scope2Form.updateData({ cooling: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="steam">Vapeur achetée (kWh)</Label>
                  <Input 
                    id="steam" 
                    placeholder="0" 
                    type="number" 
                    value={scope2Form.data.steam}
                    onChange={(e) => scope2Form.updateData({ steam: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-6">
            <Button variant="eco" className="w-full" onClick={calculateScope2Emissions}>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer toutes les émissions Scope 2
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="scope3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transport des employés */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Car className="w-5 h-5 text-primary" />
                <span>Transport des employés</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transport-type">Type de transport</Label>
                  <Select value={scope3Form.data.transportType} onValueChange={(value) => scope3Form.updateData({ transportType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Voiture</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="metro">Métro</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bike">Vélo</SelectItem>
                      <SelectItem value="walk">Marche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input 
                    id="distance" 
                    placeholder="0" 
                    type="number"
                    value={scope3Form.data.distance}
                    onChange={(e) => scope3Form.updateData({ distance: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select value={scope3Form.data.frequency} onValueChange={(value) => scope3Form.updateData({ frequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Déchets */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-primary" />
                <span>Déchets</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="waste-type">Type de déchet</Label>
                  <Select value={scope3Form.data.wasteType} onValueChange={(value) => scope3Form.updateData({ wasteType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de déchet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Papier/Carton</SelectItem>
                      <SelectItem value="plastic">Plastique</SelectItem>
                      <SelectItem value="organic">Organique</SelectItem>
                      <SelectItem value="mixed">Mélangé</SelectItem>
                      <SelectItem value="metal">Métal</SelectItem>
                      <SelectItem value="glass">Verre</SelectItem>
                      <SelectItem value="textile">Textile</SelectItem>
                      <SelectItem value="electronic">Électronique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="waste-quantity">Quantité (kg)</Label>
                  <Input 
                    id="waste-quantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Form.data.wasteQuantity}
                    onChange={(e) => scope3Form.updateData({ wasteQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="treatment">Traitement</Label>
                  <Select value={scope3Form.data.treatment} onValueChange={(value) => scope3Form.updateData({ treatment: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de traitement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landfill">Enfouissement</SelectItem>
                      <SelectItem value="incineration">Incinération</SelectItem>
                      <SelectItem value="recycling">Recyclage</SelectItem>
                      <SelectItem value="composting">Compostage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Achats de biens et services */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Factory className="w-5 h-5 text-primary" />
                <span>Achats de biens</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="material-type">Type de matériau</Label>
                  <Select value={scope3Form.data.materialType} onValueChange={(value) => scope3Form.updateData({ materialType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steel">Acier</SelectItem>
                      <SelectItem value="aluminum">Aluminium</SelectItem>
                      <SelectItem value="concrete">Béton</SelectItem>
                      <SelectItem value="wood">Bois</SelectItem>
                      <SelectItem value="plastic">Plastique</SelectItem>
                      <SelectItem value="paper">Papier</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="material-quantity">Quantité (kg ou €)</Label>
                  <Input 
                    id="material-quantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Form.data.materialQuantity}
                    onChange={(e) => scope3Form.updateData({ materialQuantity: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Voyages d'affaires */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>Voyages d'affaires</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-trip-type">Type de voyage</Label>
                  <Select value={scope3Form.data.businessTripType} onValueChange={(value) => scope3Form.updateData({ businessTripType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domesticFlight">Vol domestique</SelectItem>
                      <SelectItem value="internationalFlight">Vol international</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="car">Voiture</SelectItem>
                      <SelectItem value="hotel">Hôtel (nuitée)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="business-distance">Distance ou nuitées</Label>
                  <Input 
                    id="business-distance" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Form.data.businessDistance}
                    onChange={(e) => scope3Form.updateData({ businessDistance: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="business-frequency">Fréquence</Label>
                  <Select value={scope3Form.data.businessFrequency} onValueChange={(value) => scope3Form.updateData({ businessFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Fret et distribution */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Car className="w-5 h-5 text-primary" />
                <span>Fret et distribution</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="freight-type">Mode de transport</Label>
                  <Select value={scope3Form.data.freightType} onValueChange={(value) => scope3Form.updateData({ freightType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Camion</SelectItem>
                      <SelectItem value="rail">Train de marchandises</SelectItem>
                      <SelectItem value="ship">Bateau</SelectItem>
                      <SelectItem value="plane">Avion cargo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="freight-distance">Distance (km)</Label>
                  <Input 
                    id="freight-distance" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Form.data.freightDistance}
                    onChange={(e) => scope3Form.updateData({ freightDistance: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="freight-weight">Poids (tonnes)</Label>
                  <Input 
                    id="freight-weight" 
                    placeholder="0" 
                    type="number" 
                    step="0.1"
                    value={scope3Form.data.freightWeight}
                    onChange={(e) => scope3Form.updateData({ freightWeight: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Immobilisations */}
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Building className="w-5 h-5 text-primary" />
                <span>Immobilisations</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="asset-type">Type d'actif</Label>
                  <Select value={scope3Form.data.assetType} onValueChange={(value) => scope3Form.updateData({ assetType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'actif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer">Ordinateur</SelectItem>
                      <SelectItem value="server">Serveur</SelectItem>
                      <SelectItem value="vehicle">Véhicule</SelectItem>
                      <SelectItem value="building">Bâtiment</SelectItem>
                      <SelectItem value="machinery">Machinerie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="asset-quantity">Quantité</Label>
                  <Input 
                    id="asset-quantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Form.data.assetQuantity}
                    onChange={(e) => scope3Form.updateData({ assetQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="asset-lifespan">Durée de vie (années)</Label>
                  <Input 
                    id="asset-lifespan" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Form.data.assetLifespan}
                    onChange={(e) => scope3Form.updateData({ assetLifespan: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-6">
            <Button variant="eco" className="w-full" onClick={calculateScope3Emissions}>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer toutes les émissions Scope 3
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Section de comparaison sectorielle */}
      {hasEmissions && (
        <div className="mt-8">
          <SectorComparison totalEmissions={emissions.total} />
        </div>
      )}
      </div>
    </ScrollArea>
  );
};
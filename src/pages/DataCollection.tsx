import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Calculator, FileSpreadsheet, Zap, Car, Trash2, Building, Factory, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const DataCollection = () => {
  const { toast } = useToast();
  
  // Global emissions tracking
  const [globalEmissions, setGlobalEmissions] = useState({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });

  // Scope 1 states - élargi pour plus de sources
  const [scope1Data, setScope1Data] = useState({
    fuelType: "",
    quantity: "",
    unit: "",
    period: "",
    vehicleType: "",
    vehicleFuel: "",
    fuelQuantity: "",
    equipmentType: "",
    equipmentFuel: "",
    equipmentQuantity: "",
    refrigerantType: "",
    refrigerantQuantity: ""
  });
  
  // Scope 2 states
  const [scope2Data, setScope2Data] = useState({
    electricity: "",
    provider: "",
    renewable: "",
    location: "",
    heating: "",
    cooling: "",
    steam: ""
  });
  
  // Scope 3 states - élargi pour plus de catégories
  const [scope3Data, setScope3Data] = useState({
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
    
    // Combustibles fixes
    if (scope1Data.fuelType && scope1Data.quantity && scope1Data.unit) {
      const quantity = parseFloat(scope1Data.quantity);
      const factor = emissionFactors.scope1[scope1Data.fuelType]?.[scope1Data.unit];
      
      if (factor) {
        const emissions = quantity * factor;
        totalEmissions += emissions;
        details.push(`Combustible: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Véhicules de l'entreprise
    if (scope1Data.vehicleType && scope1Data.vehicleFuel && scope1Data.fuelQuantity) {
      const fuelQuantity = parseFloat(scope1Data.fuelQuantity);
      const factor = emissionFactors.scope1.vehicles[scope1Data.vehicleFuel];
      
      if (factor) {
        const emissions = fuelQuantity * factor;
        totalEmissions += emissions;
        details.push(`Véhicules: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Équipements mobiles
    if (scope1Data.equipmentType && scope1Data.equipmentFuel && scope1Data.equipmentQuantity) {
      const equipmentQuantity = parseFloat(scope1Data.equipmentQuantity);
      const factor = emissionFactors.scope1.equipment[scope1Data.equipmentFuel];
      
      if (factor) {
        const emissions = equipmentQuantity * factor;
        totalEmissions += emissions;
        details.push(`Équipements: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Fuites de réfrigérants
    if (scope1Data.refrigerantType && scope1Data.refrigerantQuantity) {
      const refrigerantQuantity = parseFloat(scope1Data.refrigerantQuantity);
      const factor = emissionFactors.scope1.refrigerants[scope1Data.refrigerantType];
      
      if (factor) {
        const emissions = refrigerantQuantity * factor;
        totalEmissions += emissions;
        details.push(`Réfrigérants: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    if (totalEmissions === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir au moins une source d'émission Scope 1",
        variant: "destructive"
      });
      return;
    }
    
    setGlobalEmissions(prev => ({
      ...prev,
      scope1: totalEmissions,
      total: prev.scope2 + prev.scope3 + totalEmissions
    }));
    
    toast({
      title: "Émissions Scope 1 calculées",
      description: `${details.join('\n')}\nTotal: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };
  
  const calculateScope2Emissions = () => {
    let totalEmissions = 0;
    let details = [];
    
    // Électricité
    if (scope2Data.electricity && scope2Data.location) {
      const electricity = parseFloat(scope2Data.electricity);
      const renewablePercent = parseFloat(scope2Data.renewable) || 0;
      const baseFactor = emissionFactors.scope2[scope2Data.location];
      
      if (baseFactor) {
        const adjustedFactor = baseFactor * (1 - renewablePercent / 100);
        const emissions = electricity * adjustedFactor;
        totalEmissions += emissions;
        details.push(`Électricité: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Chauffage
    if (scope2Data.heating) {
      const heating = parseFloat(scope2Data.heating);
      const factor = emissionFactors.scope2.heating;
      const emissions = heating * factor;
      totalEmissions += emissions;
      details.push(`Chauffage: ${emissions.toFixed(2)} kg CO2e`);
    }
    
    // Refroidissement
    if (scope2Data.cooling) {
      const cooling = parseFloat(scope2Data.cooling);
      const factor = emissionFactors.scope2.cooling;
      const emissions = cooling * factor;
      totalEmissions += emissions;
      details.push(`Refroidissement: ${emissions.toFixed(2)} kg CO2e`);
    }
    
    // Vapeur
    if (scope2Data.steam) {
      const steam = parseFloat(scope2Data.steam);
      const factor = emissionFactors.scope2.steam;
      const emissions = steam * factor;
      totalEmissions += emissions;
      details.push(`Vapeur: ${emissions.toFixed(2)} kg CO2e`);
    }
    
    if (totalEmissions === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir au moins une source d'énergie achetée",
        variant: "destructive"
      });
      return;
    }
    
    setGlobalEmissions(prev => ({
      ...prev,
      scope2: totalEmissions,
      total: prev.scope1 + prev.scope3 + totalEmissions
    }));
    
    toast({
      title: "Émissions Scope 2 calculées",
      description: `${details.join('\n')}\nTotal: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };
  
  const calculateScope3Emissions = () => {
    let totalEmissions = 0;
    let details = [];
    
    // Transport des employés
    if (scope3Data.transportType && scope3Data.distance) {
      const distance = parseFloat(scope3Data.distance);
      const transportFactor = emissionFactors.scope3.transport[scope3Data.transportType];
      
      if (transportFactor) {
        let multiplier = 1;
        switch (scope3Data.frequency) {
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
    if (scope3Data.wasteType && scope3Data.wasteQuantity) {
      const wasteQuantity = parseFloat(scope3Data.wasteQuantity);
      const wasteFactor = emissionFactors.scope3.waste[scope3Data.wasteType];
      
      if (wasteFactor) {
        let treatmentMultiplier = 1;
        if (scope3Data.treatment === 'recycling') treatmentMultiplier = 0.3;
        else if (scope3Data.treatment === 'composting') treatmentMultiplier = 0.1;
        
        const emissions = wasteQuantity * wasteFactor * treatmentMultiplier;
        totalEmissions += emissions;
        details.push(`Déchets: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Achats de biens et services
    if (scope3Data.materialType && scope3Data.materialQuantity) {
      const materialQuantity = parseFloat(scope3Data.materialQuantity);
      const materialFactor = emissionFactors.scope3.materials[scope3Data.materialType];
      
      if (materialFactor) {
        const emissions = materialQuantity * materialFactor;
        totalEmissions += emissions;
        details.push(`Achats: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Voyages d'affaires
    if (scope3Data.businessTripType && scope3Data.businessDistance) {
      const businessDistance = parseFloat(scope3Data.businessDistance);
      const businessFactor = emissionFactors.scope3.businessTravel[scope3Data.businessTripType];
      
      if (businessFactor) {
        let multiplier = 1;
        switch (scope3Data.businessFrequency) {
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
    if (scope3Data.freightType && scope3Data.freightDistance && scope3Data.freightWeight) {
      const freightDistance = parseFloat(scope3Data.freightDistance);
      const freightWeight = parseFloat(scope3Data.freightWeight);
      const freightFactor = emissionFactors.scope3.freight[scope3Data.freightType];
      
      if (freightFactor) {
        const emissions = freightDistance * freightWeight * freightFactor;
        totalEmissions += emissions;
        details.push(`Fret: ${emissions.toFixed(2)} kg CO2e`);
      }
    }
    
    // Immobilisations
    if (scope3Data.assetType && scope3Data.assetQuantity && scope3Data.assetLifespan) {
      const assetQuantity = parseFloat(scope3Data.assetQuantity);
      const assetLifespan = parseFloat(scope3Data.assetLifespan);
      const assetFactor = emissionFactors.scope3.assets[scope3Data.assetType];
      
      if (assetFactor) {
        const emissions = (assetQuantity * assetFactor) / assetLifespan;
        totalEmissions += emissions;
        details.push(`Immobilisations: ${emissions.toFixed(2)} kg CO2e/an`);
      }
    }
    
    if (totalEmissions === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir au moins une catégorie Scope 3",
        variant: "destructive"
      });
      return;
    }
    
    setGlobalEmissions(prev => ({
      ...prev,
      scope3: totalEmissions,
      total: prev.scope1 + prev.scope2 + totalEmissions
    }));
    
    toast({
      title: "Émissions Scope 3 calculées",
      description: `${details.join('\n')}\nTotal: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };

  const calculateGlobalScore = () => {
    const total = globalEmissions.scope1 + globalEmissions.scope2 + globalEmissions.scope3;
    
    if (total === 0) {
      toast({
        title: "Aucune donnée",
        description: "Veuillez calculer les émissions par scope d'abord",
        variant: "destructive"
      });
      return;
    }
    
    setGlobalEmissions(prev => ({
      ...prev,
      total: total
    }));
    
    toast({
      title: "Score global calculé",
      description: `Total des émissions: ${total.toFixed(2)} kg CO2e\nScope 1: ${globalEmissions.scope1.toFixed(2)} kg CO2e (${((globalEmissions.scope1/total)*100).toFixed(1)}%)\nScope 2: ${globalEmissions.scope2.toFixed(2)} kg CO2e (${((globalEmissions.scope2/total)*100).toFixed(1)}%)\nScope 3: ${globalEmissions.scope3.toFixed(2)} kg CO2e (${((globalEmissions.scope3/total)*100).toFixed(1)}%)`,
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Collecte de données GES</h1>
        <p className="text-muted-foreground">Saisissez vos données d'émissions par scope</p>
      </div>

      {/* Score global */}
      {(globalEmissions.scope1 > 0 || globalEmissions.scope2 > 0 || globalEmissions.scope3 > 0) && (
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
                  <p className="text-lg font-semibold text-foreground">{globalEmissions.scope1.toFixed(2)} kg CO2e</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scope 2</p>
                  <p className="text-lg font-semibold text-foreground">{globalEmissions.scope2.toFixed(2)} kg CO2e</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Scope 3</p>
                  <p className="text-lg font-semibold text-foreground">{globalEmissions.scope3.toFixed(2)} kg CO2e</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">{globalEmissions.total.toFixed(2)} kg CO2e</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="eco" onClick={calculateGlobalScore}>
                <Calculator className="w-4 h-4 mr-2" />
                Recalculer le score
              </Button>
              <Button variant="outline" onClick={() => {
                setGlobalEmissions({ scope1: 0, scope2: 0, scope3: 0, total: 0 });
                setScope1Data({
                  fuelType: "",
                  quantity: "",
                  unit: "",
                  period: "",
                  vehicleType: "",
                  vehicleFuel: "",
                  fuelQuantity: "",
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
                  <Select value={scope1Data.fuelType} onValueChange={(value) => setScope1Data({...scope1Data, fuelType: value})}>
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
                  <Label htmlFor="quantity">Quantité consommée</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="quantity" 
                      placeholder="0" 
                      type="number" 
                      value={scope1Data.quantity}
                      onChange={(e) => setScope1Data({...scope1Data, quantity: e.target.value})}
                    />
                    <Select value={scope1Data.unit} onValueChange={(value) => setScope1Data({...scope1Data, unit: value})}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kwh">kWh</SelectItem>
                        <SelectItem value="m3">m³</SelectItem>
                        <SelectItem value="liters">Litres</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Select value={scope1Data.vehicleType} onValueChange={(value) => setScope1Data({...scope1Data, vehicleType: value})}>
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
                  <Select value={scope1Data.vehicleFuel} onValueChange={(value) => setScope1Data({...scope1Data, vehicleFuel: value})}>
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
                  <Label htmlFor="fuel-quantity">Quantité de carburant (L ou kWh)</Label>
                  <Input 
                    id="fuel-quantity" 
                    placeholder="0" 
                    type="number" 
                    value={scope1Data.fuelQuantity}
                    onChange={(e) => setScope1Data({...scope1Data, fuelQuantity: e.target.value})}
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
                  <Select value={scope1Data.equipmentType} onValueChange={(value) => setScope1Data({...scope1Data, equipmentType: value})}>
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
                  <Select value={scope1Data.equipmentFuel} onValueChange={(value) => setScope1Data({...scope1Data, equipmentFuel: value})}>
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
                    value={scope1Data.equipmentQuantity}
                    onChange={(e) => setScope1Data({...scope1Data, equipmentQuantity: e.target.value})}
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
                  <Select value={scope1Data.refrigerantType} onValueChange={(value) => setScope1Data({...scope1Data, refrigerantType: value})}>
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
                    value={scope1Data.refrigerantQuantity}
                    onChange={(e) => setScope1Data({...scope1Data, refrigerantQuantity: e.target.value})}
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
                    value={scope2Data.electricity}
                    onChange={(e) => setScope2Data({...scope2Data, electricity: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="renewable">% Énergies renouvelables</Label>
                  <Input 
                    id="renewable" 
                    placeholder="0" 
                    type="number" 
                    max="100"
                    value={scope2Data.renewable}
                    onChange={(e) => setScope2Data({...scope2Data, renewable: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Select value={scope2Data.location} onValueChange={(value) => setScope2Data({...scope2Data, location: value})}>
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
                    value={scope2Data.heating}
                    onChange={(e) => setScope2Data({...scope2Data, heating: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cooling">Refroidissement acheté (kWh)</Label>
                  <Input 
                    id="cooling" 
                    placeholder="0" 
                    type="number" 
                    value={scope2Data.cooling}
                    onChange={(e) => setScope2Data({...scope2Data, cooling: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="steam">Vapeur achetée (kWh)</Label>
                  <Input 
                    id="steam" 
                    placeholder="0" 
                    type="number" 
                    value={scope2Data.steam}
                    onChange={(e) => setScope2Data({...scope2Data, steam: e.target.value})}
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
                  <Select value={scope3Data.transportType} onValueChange={(value) => setScope3Data({...scope3Data, transportType: value})}>
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
                    value={scope3Data.distance}
                    onChange={(e) => setScope3Data({...scope3Data, distance: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select value={scope3Data.frequency} onValueChange={(value) => setScope3Data({...scope3Data, frequency: value})}>
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
                  <Select value={scope3Data.wasteType} onValueChange={(value) => setScope3Data({...scope3Data, wasteType: value})}>
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
                    value={scope3Data.wasteQuantity}
                    onChange={(e) => setScope3Data({...scope3Data, wasteQuantity: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="treatment">Traitement</Label>
                  <Select value={scope3Data.treatment} onValueChange={(value) => setScope3Data({...scope3Data, treatment: value})}>
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
                  <Select value={scope3Data.materialType} onValueChange={(value) => setScope3Data({...scope3Data, materialType: value})}>
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
                    value={scope3Data.materialQuantity}
                    onChange={(e) => setScope3Data({...scope3Data, materialQuantity: e.target.value})}
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
                  <Select value={scope3Data.businessTripType} onValueChange={(value) => setScope3Data({...scope3Data, businessTripType: value})}>
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
                    value={scope3Data.businessDistance}
                    onChange={(e) => setScope3Data({...scope3Data, businessDistance: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="business-frequency">Fréquence</Label>
                  <Select value={scope3Data.businessFrequency} onValueChange={(value) => setScope3Data({...scope3Data, businessFrequency: value})}>
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
                  <Select value={scope3Data.freightType} onValueChange={(value) => setScope3Data({...scope3Data, freightType: value})}>
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
                    value={scope3Data.freightDistance}
                    onChange={(e) => setScope3Data({...scope3Data, freightDistance: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="freight-weight">Poids (tonnes)</Label>
                  <Input 
                    id="freight-weight" 
                    placeholder="0" 
                    type="number" 
                    step="0.1"
                    value={scope3Data.freightWeight}
                    onChange={(e) => setScope3Data({...scope3Data, freightWeight: e.target.value})}
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
                  <Select value={scope3Data.assetType} onValueChange={(value) => setScope3Data({...scope3Data, assetType: value})}>
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
                    value={scope3Data.assetQuantity}
                    onChange={(e) => setScope3Data({...scope3Data, assetQuantity: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="asset-lifespan">Durée de vie (années)</Label>
                  <Input 
                    id="asset-lifespan" 
                    placeholder="0" 
                    type="number" 
                    value={scope3Data.assetLifespan}
                    onChange={(e) => setScope3Data({...scope3Data, assetLifespan: e.target.value})}
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
    </div>
  );
};
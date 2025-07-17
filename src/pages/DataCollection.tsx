import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Calculator, FileSpreadsheet, Zap, Car, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const DataCollection = () => {
  const { toast } = useToast();
  
  // Scope 1 states
  const [scope1Data, setScope1Data] = useState({
    fuelType: "",
    quantity: "",
    unit: "",
    period: ""
  });
  
  // Scope 2 states
  const [scope2Data, setScope2Data] = useState({
    electricity: "",
    provider: "",
    renewable: "",
    location: ""
  });
  
  // Scope 3 states
  const [scope3Data, setScope3Data] = useState({
    transportType: "",
    distance: "",
    frequency: "",
    wasteType: "",
    wasteQuantity: "",
    treatment: ""
  });
  
  // Emission factors (kg CO2e per unit)
  const emissionFactors = {
    scope1: {
      gas: { kwh: 0.227, m3: 2.35, liters: 2.67 },
      fuel: { kwh: 0.324, m3: 2.85, liters: 2.67 },
      propane: { kwh: 0.234, m3: 1.97, liters: 1.64 },
      butane: { kwh: 0.238, m3: 2.04, liters: 1.68 }
    },
    scope2: {
      france: 0.057,
      germany: 0.485,
      uk: 0.233
    },
    scope3: {
      transport: {
        car: 0.193,
        truck: 0.085,
        plane: 0.258,
        train: 0.041
      },
      waste: {
        paper: 0.91,
        plastic: 2.92,
        organic: 0.58,
        mixed: 1.85
      }
    }
  };
  
  const calculateScope1Emissions = () => {
    if (!scope1Data.fuelType || !scope1Data.quantity || !scope1Data.unit) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }
    
    const quantity = parseFloat(scope1Data.quantity);
    const factor = emissionFactors.scope1[scope1Data.fuelType]?.[scope1Data.unit];
    
    if (!factor) {
      toast({
        title: "Erreur de calcul",
        description: "Facteur d'émission non trouvé pour cette combinaison",
        variant: "destructive"
      });
      return;
    }
    
    const emissions = quantity * factor;
    
    toast({
      title: "Émissions Scope 1 calculées",
      description: `${emissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };
  
  const calculateScope2Emissions = () => {
    if (!scope2Data.electricity || !scope2Data.location) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir la consommation électrique et la localisation",
        variant: "destructive"
      });
      return;
    }
    
    const electricity = parseFloat(scope2Data.electricity);
    const renewablePercent = parseFloat(scope2Data.renewable) || 0;
    const baseFactor = emissionFactors.scope2[scope2Data.location];
    
    if (!baseFactor) {
      toast({
        title: "Erreur de calcul",
        description: "Facteur d'émission non trouvé pour cette localisation",
        variant: "destructive"
      });
      return;
    }
    
    // Adjust for renewable energy percentage
    const adjustedFactor = baseFactor * (1 - renewablePercent / 100);
    const emissions = electricity * adjustedFactor;
    
    toast({
      title: "Émissions Scope 2 calculées",
      description: `${emissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };
  
  const calculateScope3Emissions = () => {
    let transportEmissions = 0;
    let wasteEmissions = 0;
    
    // Calculate transport emissions
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
        transportEmissions = distance * transportFactor * multiplier;
      }
    }
    
    // Calculate waste emissions
    if (scope3Data.wasteType && scope3Data.wasteQuantity) {
      const wasteQuantity = parseFloat(scope3Data.wasteQuantity);
      const wasteFactor = emissionFactors.scope3.waste[scope3Data.wasteType];
      
      if (wasteFactor) {
        // Apply treatment factor (recycling reduces emissions by 70%)
        let treatmentMultiplier = 1;
        if (scope3Data.treatment === 'recycling') treatmentMultiplier = 0.3;
        else if (scope3Data.treatment === 'composting') treatmentMultiplier = 0.1;
        
        wasteEmissions = wasteQuantity * wasteFactor * treatmentMultiplier;
      }
    }
    
    const totalEmissions = transportEmissions + wasteEmissions;
    
    if (totalEmissions === 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir au moins une catégorie (transport ou déchets)",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Émissions Scope 3 calculées",
      description: `Transport: ${transportEmissions.toFixed(2)} kg CO2e\nDéchets: ${wasteEmissions.toFixed(2)} kg CO2e\nTotal: ${totalEmissions.toFixed(2)} kg CO2e`,
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Collecte de données GES</h1>
        <p className="text-muted-foreground">Saisissez vos données d'émissions par scope</p>
      </div>

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
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span>Saisie manuelle - Combustibles</span>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="period">Période</Label>
                  <Select value={scope1Data.period} onValueChange={(value) => setScope1Data({...scope1Data, period: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Période de consommation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="eco" className="w-full" onClick={calculateScope1Emissions}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculer les émissions
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-accent" />
                <span>Import de fichiers</span>
              </h3>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Glissez vos fichiers Excel/CSV ici ou cliquez pour sélectionner
                </p>
                <Button variant="outline">
                  Choisir des fichiers
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Formats acceptés: .xlsx, .csv</p>
                <p>Taille max: 10MB</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scope2">
          <Card className="p-6 bg-gradient-card border shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Consommation électrique</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="provider">Fournisseur d'énergie</Label>
                  <Select value={scope2Data.provider} onValueChange={(value) => setScope2Data({...scope2Data, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edf">EDF</SelectItem>
                      <SelectItem value="engie">Engie</SelectItem>
                      <SelectItem value="total">Total Direct Energie</SelectItem>
                      <SelectItem value="green">Fournisseur vert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button variant="eco" className="w-full mt-6" onClick={calculateScope2Emissions}>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer les émissions Scope 2
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="scope3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Car className="w-5 h-5 text-primary" />
                <span>Transport</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transport-type">Type de transport</Label>
                  <Select value={scope3Data.transportType} onValueChange={(value) => setScope3Data({...scope3Data, transportType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Voiture particulière</SelectItem>
                      <SelectItem value="truck">Camion</SelectItem>
                      <SelectItem value="plane">Avion</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
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
                      <SelectValue placeholder="Fréquence d'utilisation" />
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
                      <SelectValue placeholder="Catégorie de déchet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Papier/Carton</SelectItem>
                      <SelectItem value="plastic">Plastique</SelectItem>
                      <SelectItem value="organic">Organique</SelectItem>
                      <SelectItem value="mixed">Mélangé</SelectItem>
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
                      <SelectItem value="recycling">Recyclage</SelectItem>
                      <SelectItem value="incineration">Incinération</SelectItem>
                      <SelectItem value="landfill">Enfouissement</SelectItem>
                      <SelectItem value="composting">Compostage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-6">
            <Button variant="eco" className="w-full" onClick={calculateScope3Emissions}>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer les émissions Scope 3
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
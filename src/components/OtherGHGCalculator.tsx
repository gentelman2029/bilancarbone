import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Flame, Factory, Trash2 } from "lucide-react";

// Potentiels de réchauffement global (PRG) - GIEC AR6
const PRG = {
  CH4: 28, // Méthane sur 100 ans
  N2O: 265, // Protoxyde d'azote sur 100 ans
};

// Sources et facteurs d'émission pour autres GES
const sourceFactors = {
  methane: {
    // Sources de méthane (kg CH4)
    elevageBovins: { unite: "tête", facteur: 57, description: "Élevage bovins (par tête/an)" },
    elevagePorcins: { unite: "tête", facteur: 1.5, description: "Élevage porcins (par tête/an)" },
    elevageOvins: { unite: "tête", facteur: 8, description: "Élevage ovins (par tête/an)" },
    riziculture: { unite: "hectare", facteur: 230, description: "Riziculture (par hectare/an)" },
    dechetsOrganiques: { unite: "tonne", facteur: 21, description: "Déchets organiques en décharge" },
    stationEpuration: { unite: "EH", facteur: 0.65, description: "Station d'épuration (par EH/an)" },
    digesteurBiogaz: { unite: "m³", facteur: 0.001, description: "Fuite digesteur biogaz (par m³)" },
    combustionIncomplete: { unite: "tonne", facteur: 4.5, description: "Combustion incomplète biomasse" },
    torchage: { unite: "m³", facteur: 0.023, description: "Torchage gaz naturel (par m³)" }
  },
  protoxyde: {
    // Sources de protoxyde d'azote (kg N2O)
    fertilisantsAzotes: { unite: "kg N", facteur: 0.01, description: "Fertilisants azotés (par kg N)" },
    epandageFumier: { unite: "kg N", facteur: 0.002, description: "Épandage fumier (par kg N)" },
    combustionBiomasse: { unite: "tonne", facteur: 0.07, description: "Combustion biomasse" },
    combustionCharbon: { unite: "tonne", facteur: 1.4, description: "Combustion charbon" },
    combustionGazNaturel: { unite: "MWh", facteur: 0.1, description: "Combustion gaz naturel" },
    industricChimique: { unite: "tonne produit", facteur: 9.8, description: "Production acide nitrique" },
    vehiculesCatalyseur: { unite: "km", facteur: 0.000008, description: "Véhicules avec catalyseur" },
    traitementEauxUsees: { unite: "kg N", facteur: 0.005, description: "Traitement eaux usées (par kg N)" }
  }
};

interface CalculationResult {
  id: string;
  gas: 'CH4' | 'N2O';
  source: string;
  quantity: number;
  unit: string;
  emissions: number;
  co2Equivalent: number;
  description: string;
}

export const OtherGHGCalculator = () => {
  const [activeTab, setActiveTab] = useState('methane');
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [formData, setFormData] = useState({
    methane: { source: '', quantity: '' },
    protoxyde: { source: '', quantity: '' }
  });
  const { toast } = useToast();

  const addCalculation = (gas: 'CH4' | 'N2O') => {
    const currentData = formData[gas === 'CH4' ? 'methane' : 'protoxyde'];
    const sourceData = sourceFactors[gas === 'CH4' ? 'methane' : 'protoxyde'][currentData.source as keyof typeof sourceFactors.methane];
    
    if (!currentData.source || !currentData.quantity || !sourceData) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une source et saisir une quantité",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(currentData.quantity);
    const emissions = quantity * sourceData.facteur;
    const co2Equivalent = emissions * PRG[gas];

    const newCalculation: CalculationResult = {
      id: Date.now().toString(),
      gas,
      source: currentData.source,
      quantity,
      unit: sourceData.unite,
      emissions,
      co2Equivalent,
      description: sourceData.description
    };

    setCalculations([...calculations, newCalculation]);
    
    // Reset form
    setFormData({
      ...formData,
      [gas === 'CH4' ? 'methane' : 'protoxyde']: { source: '', quantity: '' }
    });

    toast({
      title: "Calcul ajouté",
      description: `${co2Equivalent.toFixed(2)} kg CO2e ajoutés`
    });
  };

  const removeCalculation = (id: string) => {
    setCalculations(calculations.filter(calc => calc.id !== id));
  };

  const getTotalEmissions = () => {
    return calculations.reduce((total, calc) => total + calc.co2Equivalent, 0);
  };

  const getEmissionsByGas = (gas: 'CH4' | 'N2O') => {
    return calculations
      .filter(calc => calc.gas === gas)
      .reduce((total, calc) => total + calc.co2Equivalent, 0);
  };

  const resetCalculations = () => {
    setCalculations([]);
    setFormData({
      methane: { source: '', quantity: '' },
      protoxyde: { source: '', quantity: '' }
    });
    toast({
      title: "Calculs réinitialisés",
      description: "Tous les calculs ont été supprimés"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Calculateur Autres Gaz à Effet de Serre
          </CardTitle>
          <CardDescription>
            Calculez vos émissions de méthane (CH4) et protoxyde d'azote (N2O) selon les facteurs ADEME
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Métriques clés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {getTotalEmissions().toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">kg CO2e total</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {getEmissionsByGas('CH4').toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">kg CO2e CH4</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {getEmissionsByGas('N2O').toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">kg CO2e N2O</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {calculations.length}
              </div>
              <div className="text-sm text-muted-foreground">Sources calculées</div>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="methane" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Méthane (CH4)
              </TabsTrigger>
              <TabsTrigger value="protoxyde" className="flex items-center gap-2">
                <Factory className="w-4 h-4" />
                Protoxyde d'azote (N2O)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="methane" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sources de Méthane (CH4)</CardTitle>
                  <CardDescription>
                    PRG = {PRG.CH4} (potentiel de réchauffement sur 100 ans)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="methane-source">Source d'émission</Label>
                      <Select
                        value={formData.methane.source}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          methane: { ...formData.methane, source: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une source" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sourceFactors.methane).map(([key, data]) => (
                            <SelectItem key={key} value={key}>
                              {data.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="methane-quantity">
                        Quantité {formData.methane.source && `(${sourceFactors.methane[formData.methane.source as keyof typeof sourceFactors.methane]?.unite})`}
                      </Label>
                      <Input
                        id="methane-quantity"
                        type="number"
                        step="0.01"
                        value={formData.methane.quantity}
                        onChange={(e) => setFormData({
                          ...formData,
                          methane: { ...formData.methane, quantity: e.target.value }
                        })}
                        placeholder="Saisir la quantité"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => addCalculation('CH4')} 
                        className="w-full"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculer CH4
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="protoxyde" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sources de Protoxyde d'azote (N2O)</CardTitle>
                  <CardDescription>
                    PRG = {PRG.N2O} (potentiel de réchauffement sur 100 ans)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="protoxyde-source">Source d'émission</Label>
                      <Select
                        value={formData.protoxyde.source}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          protoxyde: { ...formData.protoxyde, source: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une source" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sourceFactors.protoxyde).map(([key, data]) => (
                            <SelectItem key={key} value={key}>
                              {data.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="protoxyde-quantity">
                        Quantité {formData.protoxyde.source && `(${sourceFactors.protoxyde[formData.protoxyde.source as keyof typeof sourceFactors.protoxyde]?.unite})`}
                      </Label>
                      <Input
                        id="protoxyde-quantity"
                        type="number"
                        step="0.01"
                        value={formData.protoxyde.quantity}
                        onChange={(e) => setFormData({
                          ...formData,
                          protoxyde: { ...formData.protoxyde, quantity: e.target.value }
                        })}
                        placeholder="Saisir la quantité"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => addCalculation('N2O')} 
                        className="w-full"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculer N2O
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tableau des calculs */}
          {calculations.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Calculs effectués</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetCalculations}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Gaz</th>
                        <th className="text-left p-2">Source</th>
                        <th className="text-right p-2">Quantité</th>
                        <th className="text-right p-2">Émissions</th>
                        <th className="text-right p-2">CO2e</th>
                        <th className="text-right p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.map((calc) => (
                        <tr key={calc.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Badge variant={calc.gas === 'CH4' ? 'default' : 'secondary'}>
                              {calc.gas}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">{calc.description}</td>
                          <td className="p-2 text-right">
                            {calc.quantity.toFixed(2)} {calc.unit}
                          </td>
                          <td className="p-2 text-right">
                            {calc.emissions.toFixed(2)} kg {calc.gas}
                          </td>
                          <td className="p-2 text-right font-semibold">
                            {calc.co2Equivalent.toFixed(2)} kg CO2e
                          </td>
                          <td className="p-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCalculation(calc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total des autres GES :</span>
                    <span className="text-xl font-bold text-primary">
                      {getTotalEmissions().toFixed(2)} kg CO2e
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Équivalent à {(getTotalEmissions() / 1000).toFixed(3)} tonnes CO2e
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
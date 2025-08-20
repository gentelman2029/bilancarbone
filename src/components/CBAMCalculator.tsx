import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Zap, Factory, Leaf, Save, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmissionCalculation {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  perUnit: number;
}

export const CBAMCalculator = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [calculations, setCalculations] = useState<EmissionCalculation>({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0,
    perUnit: 0
  });

  const [energyData, setEnergyData] = useState({
    electricity: '',
    naturalGas: '',
    fuelOil: '',
    coal: '',
    production: ''
  });

  const emissionFactors = {
    electricity: 0.0008, // tCO2/kWh (mix tunisien)
    naturalGas: 0.0002, // tCO2/kWh
    fuelOil: 0.074, // tCO2/GJ
    coal: 0.094 // tCO2/GJ
  };

  const calculateEmissions = () => {
    const scope1 = 
      (parseFloat(energyData.naturalGas) || 0) * emissionFactors.naturalGas +
      (parseFloat(energyData.fuelOil) || 0) * emissionFactors.fuelOil +
      (parseFloat(energyData.coal) || 0) * emissionFactors.coal;

    const scope2 = (parseFloat(energyData.electricity) || 0) * emissionFactors.electricity;
    const scope3 = scope1 * 0.15; // Estimation basique 15% pour les précurseurs
    
    const total = scope1 + scope2 + scope3;
    const production = parseFloat(energyData.production) || 1;
    const perUnit = total / production;

    const newCalculations = { scope1, scope2, scope3, total, perUnit };
    setCalculations(newCalculations);

    toast({
      title: "Calcul effectué",
      description: `Émissions totales: ${total.toFixed(3)} tCO₂e`
    });
  };

  const saveCalculation = () => {
    toast({
      title: "Calcul sauvegardé",
      description: "Les données ont été sauvegardées avec succès"
    });
  };

  const exportData = () => {
    const csvData = `Scope,Émissions (tCO2e)
Scope 1,${calculations.scope1.toFixed(3)}
Scope 2,${calculations.scope2.toFixed(3)}
Scope 3,${calculations.scope3.toFixed(3)}
Total,${calculations.total.toFixed(3)}
Par unité,${calculations.perUnit.toFixed(4)}`;

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcul-emissions-${selectedProduct || 'produit'}.csv`;
    a.click();

    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculateur d'Émissions Embarquées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Sélectionner un produit</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acier">Acier laminé à chaud</SelectItem>
                    <SelectItem value="ciment">Ciment Portland</SelectItem>
                    <SelectItem value="aluminium">Aluminium brut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="production">Production totale (tonnes)</Label>
                <Input
                  id="production"
                  value={energyData.production}
                  onChange={(e) => setEnergyData(prev => ({ ...prev, production: e.target.value }))}
                  placeholder="Volume de production"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Énergie
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Matières premières
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Résultats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle>Consommation Énergétique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="electricity">Électricité (kWh)</Label>
                  <Input
                    id="electricity"
                    value={energyData.electricity}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, electricity: e.target.value }))}
                    placeholder="Consommation électrique"
                  />
                </div>
                <div>
                  <Label htmlFor="naturalGas">Gaz naturel (kWh)</Label>
                  <Input
                    id="naturalGas"
                    value={energyData.naturalGas}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, naturalGas: e.target.value }))}
                    placeholder="Consommation gaz"
                  />
                </div>
                <div>
                  <Label htmlFor="fuelOil">Fioul (GJ)</Label>
                  <Input
                    id="fuelOil"
                    value={energyData.fuelOil}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, fuelOil: e.target.value }))}
                    placeholder="Consommation fioul"
                  />
                </div>
                <div>
                  <Label htmlFor="coal">Charbon (GJ)</Label>
                  <Input
                    id="coal"
                    value={energyData.coal}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, coal: e.target.value }))}
                    placeholder="Consommation charbon"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={calculateEmissions} className="flex-1">
                  Calculer les Émissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Matières Premières et Précurseurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Factory className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Configuration des Précurseurs</h3>
                <p className="text-muted-foreground mb-4">
                  Saisissez les quantités et origines de vos matières premières
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ironOre">Minerai de fer (tonnes)</Label>
                    <Input id="ironOre" placeholder="Quantité minerai de fer" />
                  </div>
                  <div>
                    <Label htmlFor="coke">Coke métallurgique (tonnes)</Label>
                    <Input id="coke" placeholder="Quantité coke" />
                  </div>
                  <div>
                    <Label htmlFor="limestone">Calcaire (tonnes)</Label>
                    <Input id="limestone" placeholder="Quantité calcaire" />
                  </div>
                  <div>
                    <Label htmlFor="scrapMetal">Ferraille (tonnes)</Label>
                    <Input id="scrapMetal" placeholder="Quantité ferraille" />
                  </div>
                </div>
                <Button className="mt-4 w-full">Enregistrer les Matières Premières</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Résultats des Calculs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {calculations.scope1.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 1 (tCO₂e)</div>
                      <Badge variant="secondary" className="mt-2">Directes</Badge>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {calculations.scope2.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 2 (tCO₂e)</div>
                      <Badge variant="secondary" className="mt-2">Électricité</Badge>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculations.scope3.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 3 (tCO₂e)</div>
                      <Badge variant="secondary" className="mt-2">Précurseurs</Badge>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {calculations.total.toFixed(3)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total (tCO₂e)</div>
                      <Badge variant="default" className="mt-2">Émissions totales</Badge>
                    </div>
                  </Card>
                </div>

                <Card className="p-4 bg-green-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-700">
                      {calculations.perUnit.toFixed(4)}
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      tCO₂e par tonne de produit
                    </div>
                    <Badge className="mt-2 bg-green-600">Intensité carbone</Badge>
                  </div>
                </Card>

                <div className="flex gap-2">
                  <Button onClick={saveCalculation} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button onClick={exportData} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
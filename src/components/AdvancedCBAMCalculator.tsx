import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Zap, 
  Factory, 
  Leaf, 
  Save, 
  Download, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Globe,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cbamEnhancedCalculator, type AdvancedEmissionResult, type EmissionScenario } from '@/services/cbamEnhancedCalculator';
import { CBAMSector, EmissionMethod } from '@/lib/cbam/types';
import { CBAMPrecursorsModule } from './CBAMPrecursorsModule';

export const AdvancedCBAMCalculator = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [countryCode, setCountryCode] = useState('TN');
  const [sector, setSector] = useState<CBAMSector>('iron_steel');
  const [calculationMethod, setCalculationMethod] = useState<EmissionMethod>('ACTUAL');
  const [showUncertainties, setShowUncertainties] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);
  const [results, setResults] = useState<AdvancedEmissionResult | null>(null);
  const [scenarios, setScenarios] = useState<EmissionScenario[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const [energyData, setEnergyData] = useState({
    electricity_kwh: '',
    natural_gas_kwh: '',
    fuel_oil_gj: '',
    coal_gj: '',
    production_tonnes: '',
    ch4_kg: '',
    n2o_kg: '',
    custom_electricity_factor: '',
    custom_process_emissions: ''
  });

  // Pays disponibles avec leurs facteurs
  const countries = [
    { code: 'TN', name: '🇹🇳 Tunisie', factor: 0.48 },
    { code: 'EU', name: '🇪🇺 Union Européenne', factor: 0.255 },
    { code: 'CN', name: '🇨🇳 Chine', factor: 0.555 },
    { code: 'TR', name: '🇹🇷 Turquie', factor: 0.39 },
    { code: 'MA', name: '🇲🇦 Maroc', factor: 0.72 },
    { code: 'EG', name: '🇪🇬 Égypte', factor: 0.53 }
  ];

  // Secteurs CBAM
  const sectors = [
    { value: 'iron_steel', label: '🏗️ Fer et Acier' },
    { value: 'cement', label: '🧱 Ciment' },
    { value: 'aluminium', label: '⚡ Aluminium' },
    { value: 'fertilizers', label: '🌱 Engrais' },
    { value: 'electricity', label: '🔌 Électricité' },
    { value: 'hydrogen', label: '💨 Hydrogène' }
  ];

  const calculateAdvancedEmissions = async () => {
    if (!energyData.production_tonnes || parseFloat(energyData.production_tonnes) <= 0) {
      toast({
        title: "Données manquantes",
        description: "Veuillez saisir le volume de production",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      const inputs = {
        electricity_kwh: parseFloat(energyData.electricity_kwh) || 0,
        natural_gas_kwh: parseFloat(energyData.natural_gas_kwh) || 0,
        fuel_oil_gj: parseFloat(energyData.fuel_oil_gj) || 0,
        coal_gj: parseFloat(energyData.coal_gj) || 0,
        ch4_kg: parseFloat(energyData.ch4_kg) || 0,
        n2o_kg: parseFloat(energyData.n2o_kg) || 0,
        country_code: countryCode,
        sector: sector as CBAMSector,
        production_tonnes: parseFloat(energyData.production_tonnes),
        custom_electricity_factor: parseFloat(energyData.custom_electricity_factor) || undefined,
        custom_process_emissions: parseFloat(energyData.custom_process_emissions) || undefined,
        preferred_method: calculationMethod
      };

      const calculationResults = cbamEnhancedCalculator.calculateAdvancedEmissions(inputs);
      setResults(calculationResults);
      
      // Générer scénarios
      const scenarioResults = cbamEnhancedCalculator.createScenarios(inputs);
      setScenarios(scenarioResults);

      toast({
        title: "Calcul terminé ✅",
        description: `Émissions: ${calculationResults.total.value.toFixed(3)} ±${calculationResults.total.uncertainty.toFixed(1)}% tCO₂e`
      });

    } catch (error) {
      toast({
        title: "Erreur de calcul",
        description: "Vérifiez vos données d'entrée",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvData = `Indicateur,Valeur,Incertitude (%),Méthode,Sources
Scope 1,${results.scope1.value.toFixed(4)},${results.scope1.uncertainty.toFixed(1)},${results.scope1.method},"${results.scope1.sources.join('; ')}"
Scope 2,${results.scope2.value.toFixed(4)},${results.scope2.uncertainty.toFixed(1)},${results.scope2.method},"${results.scope2.sources.join('; ')}"
Scope 3,${results.scope3.value.toFixed(4)},${results.scope3.uncertainty.toFixed(1)},${results.scope3.method},"${results.scope3.sources.join('; ')}"
Total,${results.total.value.toFixed(4)},${results.total.uncertainty.toFixed(1)},${results.total.method},"${results.total.sources.join('; ')}"
Intensité,${results.per_unit.value.toFixed(4)},${results.per_unit.uncertainty.toFixed(1)},${results.per_unit.method},"${results.per_unit.sources.join('; ')}"
CO₂,${results.all_ghg.co2.toFixed(4)},N/A,Calculé,Facteurs d'émission
CH₄ (CO₂e),${results.all_ghg.ch4_co2e.toFixed(4)},N/A,PRG AR6,IPCC AR6
N₂O (CO₂e),${results.all_ghg.n2o_co2e.toFixed(4)},N/A,PRG AR6,IPCC AR6
Coût Carbone (€),${results.carbon_cost_eur.toFixed(2)},N/A,Prix EEX,Marché européen
Score Conformité,${results.compliance_score.toFixed(0)},N/A,Algorithme,Évaluation interne`;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcul-cbam-avance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export réussi 📄",
      description: "Résultats exportés avec sources et incertitudes"
    });
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getUncertaintyIcon = (uncertainty: number) => {
    if (uncertainty <= 5) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (uncertainty <= 15) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header avec configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculateur CBAM Avancé
            <Badge variant="secondary" className="ml-2">v2.0</Badge>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Switch 
                checked={showUncertainties} 
                onCheckedChange={setShowUncertainties}
                id="show-uncertainties" 
              />
              <Label htmlFor="show-uncertainties">Incertitudes</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={showFormulas} 
                onCheckedChange={setShowFormulas}
                id="show-formulas" 
              />
              <Label htmlFor="show-formulas">Formules</Label>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Prix Carbone Temps Réel: 68,45€/tCO₂
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Pays d'origine</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.factor} tCO₂/MWh)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Secteur CBAM</Label>
              <Select value={sector} onValueChange={(value) => setSector(value as CBAMSector)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Méthode de calcul</Label>
              <Select value={calculationMethod} onValueChange={(value) => setCalculationMethod(value as EmissionMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTUAL">🔍 Données réelles vérifiées</SelectItem>
                  <SelectItem value="HYBRID">⚖️ Mélange réel/défaut</SelectItem>
                  <SelectItem value="DEFAULT">📋 Valeurs par défaut UE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Production totale (tonnes)</Label>
              <Input
                value={energyData.production_tonnes}
                onChange={(e) => setEnergyData(prev => ({ ...prev, production_tonnes: e.target.value }))}
                placeholder="Volume annuel"
                type="number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="energy">⚡ Énergie</TabsTrigger>
          <TabsTrigger value="materials">🏭 Matières</TabsTrigger>
          <TabsTrigger value="ghg">🌍 Autres GES</TabsTrigger>
          <TabsTrigger value="results">📊 Résultats</TabsTrigger>
        </TabsList>

        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle>Données Énergétiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Électricité (kWh/an)</Label>
                  <Input
                    value={energyData.electricity_kwh}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, electricity_kwh: e.target.value }))}
                    placeholder="Consommation électrique"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Gaz naturel (kWh/an)</Label>
                  <Input
                    value={energyData.natural_gas_kwh}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, natural_gas_kwh: e.target.value }))}
                    placeholder="Consommation gaz"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Fioul (GJ/an)</Label>
                  <Input
                    value={energyData.fuel_oil_gj}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, fuel_oil_gj: e.target.value }))}
                    placeholder="Consommation fioul"
                    type="number"
                  />
                </div>
                <div>
                  <Label>Charbon (GJ/an)</Label>
                  <Input
                    value={energyData.coal_gj}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, coal_gj: e.target.value }))}
                    placeholder="Consommation charbon"
                    type="number"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-semibold">Facteurs Personnalisés (Optionnel)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Facteur électricité spécifique (tCO₂/MWh)</Label>
                    <Input
                      value={energyData.custom_electricity_factor}
                      onChange={(e) => setEnergyData(prev => ({ ...prev, custom_electricity_factor: e.target.value }))}
                      placeholder="Facteur de votre fournisseur"
                      type="number"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label>Émissions de procédé (tCO₂e/an)</Label>
                    <Input
                      value={energyData.custom_process_emissions}
                      onChange={(e) => setEnergyData(prev => ({ ...prev, custom_process_emissions: e.target.value }))}
                      placeholder="Ex: décarbonatation calcaire"
                      type="number"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={calculateAdvancedEmissions} className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calcul en cours...' : 'Calculer avec Incertitudes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <CBAMPrecursorsModule />
        </TabsContent>

        <TabsContent value="ghg">
          <Card>
            <CardHeader>
              <CardTitle>Autres Gaz à Effet de Serre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Méthane - CH₄ (kg/an)</Label>
                  <Input
                    value={energyData.ch4_kg}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, ch4_kg: e.target.value }))}
                    placeholder="Émissions directes CH₄"
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">PRG: 25 (AR6 IPCC)</p>
                </div>
                <div>
                  <Label>Protoxyde d'azote - N₂O (kg/an)</Label>
                  <Input
                    value={energyData.n2o_kg}
                    onChange={(e) => setEnergyData(prev => ({ ...prev, n2o_kg: e.target.value }))}
                    placeholder="Émissions directes N₂O"
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">PRG: 298 (AR6 IPCC)</p>
                </div>
              </div>
            <div className="mt-4">
              <Button onClick={calculateAdvancedEmissions} className="w-full" disabled={isCalculating}>
                {isCalculating ? 'Calcul en cours...' : 'Calculer Autres GES'}
              </Button>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {results ? (
            <div className="space-y-6">
              {/* Résultats principaux */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Résultats du Calcul
                    <Badge className={`${getComplianceColor(results.compliance_score)} border`}>
                      Score: {results.compliance_score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Scope 1 */}
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                          {results.scope1.value.toFixed(3)}
                          {showUncertainties && getUncertaintyIcon(results.scope1.uncertainty)}
                        </div>
                        <div className="text-sm text-muted-foreground">Scope 1</div>
                        {showUncertainties && (
                          <Badge variant="secondary" className="mt-1">
                            ±{results.scope1.uncertainty.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge className="mt-1 bg-red-100 text-red-800">Directes</Badge>
                        {showFormulas && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {results.scope1.formula}
                          </p>
                        )}
                      </div>
                    </Card>

                    {/* Scope 2 */}
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-2">
                          {results.scope2.value.toFixed(3)}
                          {showUncertainties && getUncertaintyIcon(results.scope2.uncertainty)}
                        </div>
                        <div className="text-sm text-muted-foreground">Scope 2</div>
                        {showUncertainties && (
                          <Badge variant="secondary" className="mt-1">
                            ±{results.scope2.uncertainty.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge className="mt-1 bg-orange-100 text-orange-800">Électricité</Badge>
                      </div>
                    </Card>

                    {/* Scope 3 */}
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                          {results.scope3.value.toFixed(3)}
                          {showUncertainties && getUncertaintyIcon(results.scope3.uncertainty)}
                        </div>
                        <div className="text-sm text-muted-foreground">Scope 3</div>
                        {showUncertainties && (
                          <Badge variant="secondary" className="mt-1">
                            ±{results.scope3.uncertainty.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge className="mt-1 bg-blue-100 text-blue-800">Précurseurs</Badge>
                      </div>
                    </Card>

                    {/* Total */}
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                          {results.total.value.toFixed(3)}
                          {showUncertainties && getUncertaintyIcon(results.total.uncertainty)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total (tCO₂e)</div>
                        {showUncertainties && (
                          <Badge variant="secondary" className="mt-1">
                            ±{results.total.uncertainty.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge className="mt-1 bg-green-100 text-green-800">Toutes émissions</Badge>
                      </div>
                    </Card>

                    {/* Intensité */}
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.per_unit.value.toFixed(4)}
                        </div>
                        <div className="text-sm text-muted-foreground">tCO₂e/tonne</div>
                        <Badge className="mt-1 bg-purple-100 text-purple-800">Intensité</Badge>
                      </div>
                    </Card>
                  </div>

                  {/* Autres GES */}
                  {(results.all_ghg.ch4_co2e > 0 || results.all_ghg.n2o_co2e > 0) && (
                    <Card className="p-4 mb-4">
                      <h4 className="font-semibold mb-2">Détail Autres GES</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold">{results.all_ghg.co2.toFixed(3)}</div>
                          <div className="text-sm text-muted-foreground">CO₂ pur</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{results.all_ghg.ch4_co2e.toFixed(3)}</div>
                          <div className="text-sm text-muted-foreground">CH₄ (CO₂e)</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{results.all_ghg.n2o_co2e.toFixed(3)}</div>
                          <div className="text-sm text-muted-foreground">N₂O (CO₂e)</div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Coût carbone */}
                  {results.carbon_cost_eur > 0 && (
                    <Card className="p-4 bg-yellow-50 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-700">
                          {results.carbon_cost_eur.toFixed(2)} €
                        </div>
                        <div className="text-lg font-semibold text-yellow-600">
                          Coût carbone estimé (prix EEX actuel)
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Recommandations */}
                  {results.recommendations.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Recommandations d'Amélioration
                      </h4>
                      <ul className="space-y-1">
                        {results.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => {}} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button onClick={exportResults} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export Complet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scénarios de simulation */}
              {scenarios.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Scénarios de Simulation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {scenarios.map((scenario) => (
                        <Card key={scenario.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{scenario.name}</h4>
                              <p className="text-sm text-muted-foreground">{scenario.description}</p>
                            </div>
                            <Badge variant="outline">
                              {((scenario.results.total.value - results.total.value) / results.total.value * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <div className="font-bold">{scenario.results.scope1.value.toFixed(3)}</div>
                              <div className="text-xs text-muted-foreground">Scope 1</div>
                            </div>
                            <div>
                              <div className="font-bold">{scenario.results.scope2.value.toFixed(3)}</div>
                              <div className="text-xs text-muted-foreground">Scope 2</div>
                            </div>
                            <div>
                              <div className="font-bold">{scenario.results.total.value.toFixed(3)}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <div>
                              <div className="font-bold">{scenario.results.carbon_cost_eur.toFixed(0)}€</div>
                              <div className="text-xs text-muted-foreground">Coût</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Prêt pour le calcul</h3>
                <p className="text-muted-foreground">
                  Saisissez vos données énergétiques et cliquez sur "Calculer"
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
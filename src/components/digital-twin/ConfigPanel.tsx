import { Sun, Battery, Landmark, Play, Cloud, Receipt, Zap, Calculator, Info, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ValidationResult, DigitalTwinMetrics } from "@/hooks/useDigitalTwin";

// Format number with space separator (French style)
const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('fr-FR').replace(/,/g, ' ');
};

interface ConfigPanelProps {
  solarPower: number[];
  setSolarPower: (value: number[]) => void;
  hasTracker: boolean;
  setHasTracker: (value: boolean) => void;
  batteryCapacity: number[];
  setBatteryCapacity: (value: number[]) => void;
  withSubsidy: boolean;
  setWithSubsidy: (value: boolean) => void;
  inflationRate: string;
  setInflationRate: (value: string) => void;
  energyPriceEscalation: string;
  setEnergyPriceEscalation: (value: string) => void;
  voltageRegime: 'MT' | 'HT';
  setVoltageRegime: (value: 'MT' | 'HT') => void;
  includeWeatherVariability: boolean;
  setIncludeWeatherVariability: (value: boolean) => void;
  includeFiscalBenefits: boolean;
  setIncludeFiscalBenefits: (value: boolean) => void;
  isSimulating: boolean;
  validation: ValidationResult;
  onSimulate: () => void;
  stegTariffs: Record<'MT' | 'HT', { peak: number; day: number; night: number }>;
  // CAPEX unit costs
  solarUnitCost: string;
  setSolarUnitCost: (value: string) => void;
  batteryUnitCost: string;
  setBatteryUnitCost: (value: string) => void;
  trackerAdditionalCost: number;
  subsidyReduction: number;
  // Metrics for unified CAPEX display
  metrics: DigitalTwinMetrics;
}

export const ConfigPanel = ({
  solarPower,
  setSolarPower,
  hasTracker,
  setHasTracker,
  batteryCapacity,
  setBatteryCapacity,
  withSubsidy,
  setWithSubsidy,
  inflationRate,
  setInflationRate,
  energyPriceEscalation,
  setEnergyPriceEscalation,
  voltageRegime,
  setVoltageRegime,
  includeWeatherVariability,
  setIncludeWeatherVariability,
  includeFiscalBenefits,
  setIncludeFiscalBenefits,
  isSimulating,
  validation,
  onSimulate,
  stegTariffs,
  solarUnitCost,
  setSolarUnitCost,
  batteryUnitCost,
  setBatteryUnitCost,
  trackerAdditionalCost,
  subsidyReduction,
  metrics
}: ConfigPanelProps) => {
  const currentTariff = stegTariffs[voltageRegime];
  
  // Use metrics for unified CAPEX calculation (single source of truth)
  const solarCostNum = Number(solarUnitCost) || 850;
  const batteryCostNum = Number(batteryUnitCost) || 450;
  const solarCapex = solarPower[0] * solarCostNum;
  const trackerCapex = hasTracker ? solarPower[0] * trackerAdditionalCost : 0;
  const batteryCapex = batteryCapacity[0] * batteryCostNum;
  const totalCapexBrut = solarCapex + trackerCapex + batteryCapex;
  const subsidyAmount = withSubsidy ? (solarCapex + trackerCapex) * subsidyReduction : 0;
  // Use metrics.investment for THE unified CAPEX value
  const investmentInitial = metrics.investment;
  const annualOMCost = metrics.annualOMCost;
  
  return (
    <TooltipProvider>
      <div>
        <h2 className="text-lg font-semibold mb-1 text-gray-900">Configuration du Scénario</h2>
        <p className="text-sm text-gray-500">Paramètres technico-économiques</p>
      </div>

      {/* Validation Errors */}
      {!validation.isValid && (
        <Alert className="bg-red-500/10 border-red-500/30 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Solar PV Card */}
      <Card className="bg-white border-gray-200 shadow-sm" data-tour="config-solar">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">Solaire Photovoltaïque</CardTitle>
              <CardDescription className="text-gray-500">Dégradation 0.7%/an incluse</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-gray-700">Puissance Installée</Label>
              <span className="text-lg font-semibold text-emerald-600">{solarPower[0]} kWc</span>
            </div>
            <Slider
              value={solarPower}
              onValueChange={setSolarPower}
              min={0}
              max={5000}
              step={50}
              className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0 kWc</span>
              <span>5 000 kWc</span>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-700">Système Tracker</Label>
              <p className="text-xs text-gray-400">+15% rendement, +120 TND/kWc</p>
            </div>
            <Switch
              checked={hasTracker}
              onCheckedChange={setHasTracker}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Battery Storage Card */}
      <Card className="bg-white border-gray-200 shadow-sm" data-tour="config-battery">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Battery className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">Stockage Batterie</CardTitle>
              <CardDescription className="text-gray-500">Remplacement année 10 inclus</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-gray-700">Capacité</Label>
            <span className="text-lg font-semibold text-blue-600">{batteryCapacity[0]} kWh</span>
          </div>
          <Slider
            value={batteryCapacity}
            onValueChange={setBatteryCapacity}
            min={0}
            max={2000}
            step={25}
            className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0 kWh</span>
            <span>2 000 kWh</span>
          </div>
        </CardContent>
      </Card>

      {/* Tariff Card */}
      <Card className="bg-white border-gray-200 shadow-sm" data-tour="config-financial">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">Tarif STEG</CardTitle>
              <CardDescription className="text-gray-500">Différentiation Pointe/Jour/Nuit</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Régime de Tension</Label>
            <Select value={voltageRegime} onValueChange={(v) => setVoltageRegime(v as 'MT' | 'HT')}>
              <SelectTrigger className="focus:border-emerald-500 bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="MT" className="text-gray-900 focus:bg-gray-100">
                  Moyenne Tension (MT)
                </SelectItem>
                <SelectItem value="HT" className="text-gray-900 focus:bg-gray-100">
                  Haute Tension (HT)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tariff Display */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-500/10 rounded-lg p-2">
              <p className="text-xs text-gray-500">Pointe</p>
              <p className="text-sm font-semibold text-red-600">{(currentTariff.peak * 1000).toFixed(0)} mill</p>
              <p className="text-xs text-gray-400">18h-22h</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-2">
              <p className="text-xs text-gray-500">Jour</p>
              <p className="text-sm font-semibold text-amber-600">{(currentTariff.day * 1000).toFixed(0)} mill</p>
              <p className="text-xs text-gray-400">7h-18h</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2">
              <p className="text-xs text-gray-500">Nuit</p>
              <p className="text-sm font-semibold text-blue-600">{(currentTariff.night * 1000).toFixed(0)} mill</p>
              <p className="text-xs text-gray-400">22h-7h</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Escalade Prix Énergie (%/an)</Label>
            <Input
              type="number"
              min={-5}
              max={15}
              value={energyPriceEscalation}
              onChange={(e) => setEnergyPriceEscalation(e.target.value)}
              className="focus:border-emerald-500 bg-white border-gray-300 text-gray-900"
              placeholder="-5 à +15%"
            />
            <p className="text-xs text-gray-400">Distinct de l'inflation générale</p>
          </div>
        </CardContent>
      </Card>

      {/* Financing Card */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Landmark className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">Financement</CardTitle>
              <CardDescription className="text-gray-500">Contexte réglementaire Tunisie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="subsidy" 
              checked={withSubsidy}
              onCheckedChange={(checked) => setWithSubsidy(checked === true)}
              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-gray-300"
            />
            <div className="space-y-0.5">
              <Label htmlFor="subsidy" className="cursor-pointer text-gray-700">
                Subvention FTE (ANME)
              </Label>
              <p className="text-xs text-gray-400">-30% sur le CAPEX</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Inflation Générale (%/an)</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="focus:border-emerald-500 bg-white border-gray-300 text-gray-900"
              placeholder="0 - 20%"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options Card */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Cloud className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">Options Avancées</CardTitle>
              <CardDescription className="text-gray-500">Aléas et avantages fiscaux</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="weather" 
              checked={includeWeatherVariability}
              onCheckedChange={(checked) => setIncludeWeatherVariability(checked === true)}
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-gray-300"
            />
            <div className="space-y-0.5">
              <Label htmlFor="weather" className="cursor-pointer text-gray-700">
                Variabilité Météo
              </Label>
              <p className="text-xs text-gray-400">Simule bonnes/mauvaises années (±15%)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox 
              id="fiscal" 
              checked={includeFiscalBenefits}
              onCheckedChange={(checked) => setIncludeFiscalBenefits(checked === true)}
              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 border-gray-300"
            />
            <div className="space-y-0.5 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-500" />
              <div>
                <Label htmlFor="fiscal" className="cursor-pointer text-gray-700">
                  Amortissement Fiscal
                </Label>
                <p className="text-xs text-gray-400">Déduction IS 15% sur 7 ans</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CAPEX & OPEX Detail Card */}
      <Card className="bg-white border-gray-200 shadow-sm" data-tour="config-capex">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Calculator className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-gray-900">Investissement Initial (CAPEX)</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 hover:text-indigo-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm bg-white border-gray-200 shadow-xl p-3">
                  <p className="text-sm text-gray-700 font-medium mb-2">Détail du calcul :</p>
                  <p className="text-xs text-gray-600">
                    (Puissance kWc × {solarCostNum} TND) + Coût Tracker + Coût Batterie.
                  </p>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    C'est l'argent total investi au départ.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <CardDescription className="text-gray-500">Hypothèses de coûts unitaires du marché</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unit cost inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Coût Solaire (TND/kWc)</Label>
              <Input
                type="number"
                min={500}
                max={1500}
                value={solarUnitCost}
                onChange={(e) => setSolarUnitCost(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Coût Batterie (TND/kWh)</Label>
              <Input
                type="number"
                min={200}
                max={800}
                value={batteryUnitCost}
                onChange={(e) => setBatteryUnitCost(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* CAPEX Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Panneaux solaires ({formatNumber(solarPower[0])} kWc × {formatNumber(solarCostNum)} TND)</span>
              <span className="font-medium text-gray-900">{formatNumber(solarCapex)} TND</span>
            </div>
            {hasTracker && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Système Tracker ({formatNumber(solarPower[0])} kWc × {formatNumber(trackerAdditionalCost)} TND)</span>
                <span className="font-medium text-gray-900">{formatNumber(trackerCapex)} TND</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stockage batterie ({formatNumber(batteryCapacity[0])} kWh × {formatNumber(batteryCostNum)} TND)</span>
              <span className="font-medium text-gray-900">{formatNumber(batteryCapex)} TND</span>
            </div>
            
            <Separator className="my-2 bg-gray-200" />
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">Total Brut</span>
              <span className="font-semibold text-gray-900">{formatNumber(totalCapexBrut)} TND</span>
            </div>
            
            {withSubsidy && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Dont Subvention FTE (-{(subsidyReduction * 100).toFixed(0)}% solaire)</span>
                <span className="font-medium text-emerald-600">-{formatNumber(subsidyAmount)} TND</span>
              </div>
            )}
            
            <Separator className="my-2 bg-gray-200" />
            
            {/* Unified CAPEX display - single source of truth from metrics */}
            <div className="flex justify-between text-base">
              <span className="text-gray-900 font-semibold">Investissement Initial (CAPEX)</span>
              <span className="font-bold text-indigo-600">{formatNumber(investmentInitial)} TND</span>
            </div>
          </div>

          {/* OPEX Section */}
          <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-800">OPEX (Maintenance)</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-orange-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-white border-gray-200 shadow-xl p-3">
                    <p className="text-sm text-gray-700 font-medium mb-1">Frais annuels d'entretien</p>
                    <p className="text-xs text-gray-600">
                      Calculé à 1.5% du CAPEX brut par an. Inclut nettoyage, monitoring et remplacement onduleurs.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-semibold text-orange-600">{formatNumber(annualOMCost)} TND/an</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Button */}
      <Button 
        onClick={onSimulate}
        disabled={isSimulating || !validation.isValid}
        className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSimulating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
            Simulation en cours...
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            Lancer la Simulation
          </>
        )}
      </Button>
    </TooltipProvider>
  );
};

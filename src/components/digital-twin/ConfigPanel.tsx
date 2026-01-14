import { Sun, Battery, Landmark, Play } from "lucide-react";
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
import type { ValidationResult } from "@/hooks/useDigitalTwin";

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
  voltageRegime: 'MT' | 'HT';
  setVoltageRegime: (value: 'MT' | 'HT') => void;
  isSimulating: boolean;
  validation: ValidationResult;
  onSimulate: () => void;
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
  voltageRegime,
  setVoltageRegime,
  isSimulating,
  validation,
  onSimulate
}: ConfigPanelProps) => {
  return (
    <div className="lg:col-span-5 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-1">Configuration du Scénario</h2>
        <p className="text-sm text-slate-500">CAPEX / OPEX</p>
      </div>

      {/* Validation Errors */}
      {!validation.isValid && (
        <Alert className="bg-red-500/10 border-red-500/30 text-red-400">
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
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Sun className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">Solaire Photovoltaïque</CardTitle>
              <CardDescription className="text-slate-400">Production d'énergie renouvelable</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-slate-300">Puissance Installée</Label>
              <span className="text-lg font-semibold text-emerald-400">{solarPower[0]} kWc</span>
            </div>
            <Slider
              value={solarPower}
              onValueChange={setSolarPower}
              min={0}
              max={5000}
              step={50}
              className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0 kWc</span>
              <span>5 000 kWc</span>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-300">Système Tracker ?</Label>
              <p className="text-xs text-slate-500">+15% de rendement</p>
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
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Battery className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">Stockage Batterie</CardTitle>
              <CardDescription className="text-slate-400">Optimisation de l'autoconsommation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-slate-300">Capacité</Label>
            <span className="text-lg font-semibold text-blue-400">{batteryCapacity[0]} kWh</span>
          </div>
          <Slider
            value={batteryCapacity}
            onValueChange={setBatteryCapacity}
            min={0}
            max={2000}
            step={25}
            className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0 kWh</span>
            <span>2 000 kWh</span>
          </div>
        </CardContent>
      </Card>

      {/* Financing Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Landmark className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-100">Financement</CardTitle>
              <CardDescription className="text-slate-400">Contexte réglementaire Tunisie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Voltage Regime Selector */}
          <div className="space-y-2">
            <Label className="text-slate-300">Régime de Tension</Label>
            <Select value={voltageRegime} onValueChange={(v) => setVoltageRegime(v as 'MT' | 'HT')}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="MT" className="text-slate-100 focus:bg-slate-700">
                  Moyenne Tension (MT)
                </SelectItem>
                <SelectItem value="HT" className="text-slate-100 focus:bg-slate-700">
                  Haute Tension (HT) - +12% économies
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox 
              id="subsidy" 
              checked={withSubsidy}
              onCheckedChange={(checked) => setWithSubsidy(checked === true)}
              className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <div className="space-y-0.5">
              <Label htmlFor="subsidy" className="text-slate-300 cursor-pointer">
                Appliquer Subvention FTE (ANME)
              </Label>
              <p className="text-xs text-slate-500">Réduction de 30% sur le CAPEX</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Inflation Tarifaire STEG (%/an)</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-emerald-500"
              placeholder="0 - 20%"
            />
            <p className="text-xs text-slate-500">Entre 0% et 20%</p>
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
    </div>
  );
};

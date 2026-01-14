import { useState } from "react";
import { 
  LayoutDashboard, 
  Activity, 
  Calculator, 
  FileText, 
  Settings,
  ChevronRight,
  Zap,
  Sun,
  Battery,
  Landmark,
  TrendingDown,
  Coins,
  Gauge,
  AlertTriangle,
  Play
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: false },
  { icon: Activity, label: "Suivi Temps Réel", active: false },
  { icon: Calculator, label: "Simulateur Investissement", active: true },
  { icon: FileText, label: "Rapports Réglementaires", active: false },
  { icon: Settings, label: "Paramètres", active: false },
];

const generateProjectionData = (solarPower: number, batteryCapacity: number, withSubsidy: boolean) => {
  const baseInvestment = solarPower * 850 + batteryCapacity * 450;
  const subsidyFactor = withSubsidy ? 0.7 : 1;
  const investment = baseInvestment * subsidyFactor;
  const annualSavings = solarPower * 180 + batteryCapacity * 25;
  
  return Array.from({ length: 11 }, (_, i) => {
    const year = 2026 + i;
    const cashFlow = i === 0 ? -investment / 1000 : annualSavings / 1000 * (1 + i * 0.02);
    const cumulative = i === 0 ? -investment / 1000 : 
      (annualSavings / 1000 * i * (1 + (i-1) * 0.01)) - investment / 1000;
    
    return {
      year: year.toString(),
      cashFlow: Math.round(cashFlow),
      cumulative: Math.round(cumulative),
    };
  });
};

const DigitalTwin = () => {
  // Configuration states
  const [solarPower, setSolarPower] = useState([1500]);
  const [hasTracker, setHasTracker] = useState(false);
  const [batteryCapacity, setBatteryCapacity] = useState([500]);
  const [withSubsidy, setWithSubsidy] = useState(true);
  const [inflationRate, setInflationRate] = useState("5");
  const [isSimulating, setIsSimulating] = useState(false);

  // Calculated metrics
  const trackerBonus = hasTracker ? 1.15 : 1;
  const effectiveSolar = solarPower[0] * trackerBonus;
  const annualSavings = effectiveSolar * 180 + batteryCapacity[0] * 25;
  const baseInvestment = solarPower[0] * 850 + batteryCapacity[0] * 450;
  const investment = withSubsidy ? baseInvestment * 0.7 : baseInvestment;
  const payback = investment / annualSavings;
  const cbamSavings = (effectiveSolar * 0.48 * 0.065).toFixed(0);
  const lcoe = (investment / (effectiveSolar * 1600 * 25) * 1000).toFixed(3);

  const projectionData = generateProjectionData(solarPower[0], batteryCapacity[0], withSubsidy);

  const handleSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">
            <span className="text-emerald-500">Green</span>Insight
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                item.active 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">Version 2.1.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Modules</span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
            <span className="text-slate-200 font-medium">Jumeau Numérique</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Status Badge */}
            <Badge 
              variant="outline" 
              className="bg-amber-500/10 border-amber-500/30 text-amber-400 gap-2 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Intensité Mix STEG : Élevée (480g CO₂/kWh)
            </Badge>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">Mohamed Trabelsi</div>
                <div className="text-xs text-slate-500">Directeur Technique</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                MT
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Control Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">Configuration du Scénario</h2>
                <p className="text-sm text-slate-500">CAPEX / OPEX</p>
              </div>

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
                      value={inflationRate}
                      onChange={(e) => setInflationRate(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-emerald-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Simulation Button */}
              <Button 
                onClick={handleSimulation}
                disabled={isSimulating}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-base shadow-lg shadow-emerald-500/20 transition-all"
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

            {/* Right Column - Results */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-1">Impact Financier & Carbone</h2>
                <p className="text-sm text-slate-500">Résultats de la simulation</p>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Payback KPI */}
                <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">TRI / Payback</p>
                        <p className="text-3xl font-bold text-emerald-400">{payback.toFixed(1)} <span className="text-lg">Ans</span></p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs text-emerald-500">-20% vs Standard</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <TrendingDown className="h-5 w-5 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CBAM Savings KPI */}
                <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Économie CBAM</p>
                        <p className="text-3xl font-bold text-emerald-400">{Number(cbamSavings).toLocaleString('fr-FR')} <span className="text-lg">€/an</span></p>
                        <p className="text-xs text-slate-500 mt-2">Taxe carbone évitée</p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Coins className="h-5 w-5 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* LCOE KPI */}
                <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">LCOE</p>
                        <p className="text-3xl font-bold text-amber-400">{lcoe} <span className="text-lg">TND/kWh</span></p>
                        <p className="text-xs text-slate-500 mt-2">Coût actualisé énergie</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Gauge className="h-5 w-5 text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Flux de Trésorerie & Économies Projetées</CardTitle>
                  <CardDescription className="text-slate-400">Projection sur 10 ans (2026-2036)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#64748b"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          tickFormatter={(value) => `${value}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString('fr-FR')} TND`,
                            name === 'cashFlow' ? 'Cash Flow Net' : 'Économies Cumulées'
                          ]}
                          labelFormatter={(label) => `Année ${label}`}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value) => (
                            <span className="text-slate-300">
                              {value === 'cashFlow' ? 'Cash Flow Net' : 'Économies Cumulées'}
                            </span>
                          )}
                        />
                        <Bar 
                          dataKey="cashFlow" 
                          fill="#10b981" 
                          radius={[4, 4, 0, 0]}
                          name="cashFlow"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name="cumulative"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendation Alert */}
              <Alert className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 border-emerald-500/30 border-l-4 border-l-emerald-500">
                <Zap className="h-5 w-5 text-emerald-400" />
                <AlertTitle className="text-emerald-400 font-semibold">Optimisation Détectée</AlertTitle>
                <AlertDescription className="text-slate-300 mt-2">
                  Selon les tarifs STEG actuels, augmenter le stockage de <strong className="text-emerald-400">50 kWh</strong> améliore 
                  le TRI de <strong className="text-emerald-400">1.2%</strong> grâce à l'effacement de pointe (Peak-shaving). 
                  Cette configuration permettrait d'éviter les heures de tarif "Pointe" (18h-22h).
                </AlertDescription>
              </Alert>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Risque Réglementaire</p>
                        <p className="text-xs text-slate-500">CBAM Phase 3 applicable dès 2026</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">Irradiation Moyenne</p>
                        <p className="text-xs text-slate-500">1 850 kWh/m²/an (Tunisie)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DigitalTwin;

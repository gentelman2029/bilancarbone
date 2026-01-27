// Enhanced Analysis Module with Financial, Historical, SBT and Benchmark features
import { useState, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Target, 
  Award,
  Calendar,
  Building2,
  RotateCcw,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { CarbonSummaryDashboard } from './CarbonSummaryDashboard';
import { usePersistentForm } from '@/hooks/usePersistentForm';

interface AnalysisData {
  revenue: number;
  currency: 'TND' | 'EUR';
  employeeCount: number;
  emissionsN1: number; // Year N-1
  emissionsN2: number; // Year N+1 forecast
  sbtTarget2030: number;
  sbtTarget2050: number;
  sectorAverage: number; // tCO2e per employee
  sectorBestInClass: number; // tCO2e per employee
}

const DEFAULT_DATA: AnalysisData = {
  revenue: 0,
  currency: 'TND',
  employeeCount: 0,
  emissionsN1: 0,
  emissionsN2: 0,
  sbtTarget2030: 0,
  sbtTarget2050: 0,
  sectorAverage: 2.5, // Average Tunisian company
  sectorBestInClass: 1.0,
};

const STORAGE_KEY = 'analysis-module-data';

interface AnalysisModuleProps {
  totalEmissions: number; // Current year emissions in tCO2e
  refreshTrigger?: number;
}

export function AnalysisModule({ totalEmissions, refreshTrigger }: AnalysisModuleProps) {
  // Use persistent form hook for automatic localStorage sync
  const { data, updateData, resetData, hasData } = usePersistentForm<AnalysisData>(
    STORAGE_KEY,
    DEFAULT_DATA
  );

  // Calculate intensities
  // Revenue is in millions (MTND), emissions in tCO2e
  // Intensity = tCO2e / MTND (no conversion needed)
  const intensityPerRevenue = data.revenue > 0 
    ? (totalEmissions / data.revenue).toFixed(2) 
    : '—';
  
  const intensityPerEmployee = data.employeeCount > 0 
    ? (totalEmissions / data.employeeCount).toFixed(2) 
    : '—';

  // Calculate year-over-year evolution
  const yoyChange = data.emissionsN1 > 0 
    ? ((totalEmissions - data.emissionsN1) / data.emissionsN1 * 100).toFixed(1)
    : null;

  // Calculate SBT progress
  const sbtProgress2030 = data.sbtTarget2030 > 0 
    ? Math.min(100, (data.sbtTarget2030 / totalEmissions) * 100)
    : null;

  // Calculate benchmark position
  const getBenchmarkPosition = useCallback(() => {
    if (!data.employeeCount || data.employeeCount === 0) return null;
    const myIntensity = totalEmissions / data.employeeCount;
    
    if (myIntensity <= data.sectorBestInClass) {
      return { label: 'Leader', color: 'bg-green-500', textColor: 'text-green-700' };
    } else if (myIntensity <= data.sectorAverage) {
      return { label: 'Supérieur à la moyenne', color: 'bg-blue-500', textColor: 'text-blue-700' };
    } else if (myIntensity <= data.sectorAverage * 1.5) {
      return { label: 'Dans la moyenne', color: 'bg-amber-500', textColor: 'text-amber-700' };
    } else {
      return { label: 'À améliorer', color: 'bg-red-500', textColor: 'text-red-700' };
    }
  }, [data.employeeCount, data.sectorAverage, data.sectorBestInClass, totalEmissions]);

  const benchmarkPosition = getBenchmarkPosition();

  // Historical chart data
  const historicalData = [
    { year: '2024 (N-1)', emissions: data.emissionsN1 || 0, type: 'historical' },
    { year: '2025 (actuel)', emissions: totalEmissions, type: 'current' },
    { year: '2026 (prév.)', emissions: data.emissionsN2 || 0, type: 'forecast' },
  ];

  // SBT trajectory data
  const sbtData = data.sbtTarget2030 > 0 ? [
    { year: '2025', target: totalEmissions, actual: totalEmissions },
    { year: '2030', target: data.sbtTarget2030, actual: null },
    { year: '2050', target: data.sbtTarget2050 || data.sbtTarget2030 * 0.1, actual: null },
  ] : [];

  // Benchmark comparison data
  const benchmarkData = data.employeeCount > 0 ? [
    { name: 'Mon entreprise', value: Number(intensityPerEmployee) || 0 },
    { name: 'Moyenne sectorielle', value: data.sectorAverage },
    { name: 'Best-in-class', value: data.sectorBestInClass },
  ] : [];

  const handleChange = (field: keyof AnalysisData, value: number | string) => {
    updateData({ [field]: value } as Partial<AnalysisData>);
  };

  const handleReset = () => {
    resetData();
    toast.success('Données réinitialisées', {
      description: 'Tous les champs ont été remis à zéro.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Dashboard */}
      <CarbonSummaryDashboard refreshTrigger={refreshTrigger} />

      <Separator />

      {/* Section A: Financial & HR Intensity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Intensité Carbone
            </span>
            {hasData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Réinitialiser les données d'analyse ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action effacera toutes les données saisies (intensité carbone, historique, objectifs SBT, benchmark). Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Réinitialiser
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardTitle>
          <CardDescription>
            Renseignez les données financières et RH pour calculer les ratios d'intensité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Input: Revenue */}
            <div className="space-y-2">
              <Label htmlFor="revenue" className="flex items-center gap-1">
                Chiffre d'Affaires
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>CA annuel en millions de dinars ou euros</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="revenue"
                  type="number"
                  placeholder="Ex: 15.5"
                  value={data.revenue || ''}
                  onChange={(e) => handleChange('revenue', parseFloat(e.target.value) || 0)}
                  className="flex-1"
                />
                <select
                  value={data.currency}
                  onChange={(e) => handleChange('currency', e.target.value as 'TND' | 'EUR')}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="TND">M TND</option>
                  <option value="EUR">M €</option>
                </select>
              </div>
            </div>

            {/* Input: Employees */}
            <div className="space-y-2">
              <Label htmlFor="employees" className="flex items-center gap-1">
                Nombre d'employés
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>Effectif moyen sur l'année</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="employees"
                type="number"
                placeholder="Ex: 150"
                value={data.employeeCount || ''}
                onChange={(e) => handleChange('employeeCount', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Result: Intensity per Revenue */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Intensité / CA
                </div>
                <div className="text-2xl font-bold text-primary">
                  {intensityPerRevenue}
                </div>
                <div className="text-xs text-muted-foreground">
                  tCO₂e / M{data.currency}
                </div>
              </CardContent>
            </Card>

            {/* Result: Intensity per Employee */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  Intensité / Employé
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {intensityPerEmployee}
                </div>
                <div className="text-xs text-muted-foreground">
                  tCO₂e / employé
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Historical & Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Historique et Prévisionnel
          </CardTitle>
          <CardDescription>
            Comparez vos émissions sur 3 années pour suivre votre trajectoire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emissionsN1">Année 2024 (N-1)</Label>
                  <Input
                    id="emissionsN1"
                    type="number"
                    placeholder="tCO₂e"
                    value={data.emissionsN1 || ''}
                    onChange={(e) => handleChange('emissionsN1', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emissionsN2">Prévision 2026 (N+1)</Label>
                  <Input
                    id="emissionsN2"
                    type="number"
                    placeholder="tCO₂e"
                    value={data.emissionsN2 || ''}
                    onChange={(e) => handleChange('emissionsN2', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* YoY Badge */}
              {yoyChange !== null && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${parseFloat(yoyChange) <= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {parseFloat(yoyChange) <= 0 ? (
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {parseFloat(yoyChange) <= 0 ? 'Réduction' : 'Augmentation'} de {Math.abs(parseFloat(yoyChange))}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Par rapport à 2024
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} tCO₂e`, 'Émissions']}
                  />
                  <Bar 
                    dataKey="emissions" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section C: SBT Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Objectifs Science Based Targets (SBT)
          </CardTitle>
          <CardDescription>
            Définissez vos objectifs alignés sur l'Accord de Paris (+1.5°C)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sbt2030">Objectif 2030 (tCO₂e)</Label>
                  <Input
                    id="sbt2030"
                    type="number"
                    placeholder="Ex: 200"
                    value={data.sbtTarget2030 || ''}
                    onChange={(e) => handleChange('sbtTarget2030', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sbt2050">Objectif 2050 (tCO₂e)</Label>
                  <Input
                    id="sbt2050"
                    type="number"
                    placeholder="Net-Zero"
                    value={data.sbtTarget2050 || ''}
                    onChange={(e) => handleChange('sbtTarget2050', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Progress indicator */}
              {sbtProgress2030 !== null && data.sbtTarget2030 > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression vers objectif 2030</span>
                    <span className={totalEmissions <= data.sbtTarget2030 ? 'text-green-600' : 'text-red-600'}>
                      {totalEmissions <= data.sbtTarget2030 ? 'Objectif atteint ✓' : `${(totalEmissions - data.sbtTarget2030).toFixed(1)}t à réduire`}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (data.sbtTarget2030 / totalEmissions) * 100)}
                    className={totalEmissions <= data.sbtTarget2030 ? 'bg-green-100' : 'bg-red-100'}
                  />
                </div>
              )}
            </div>

            {/* Trajectory chart */}
            {sbtData.length > 0 && (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sbtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" fontSize={12} />
                    <YAxis fontSize={12} />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Trajectoire cible"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(142, 76%, 36%)" 
                      strokeWidth={3}
                      name="Émissions réelles"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section D: Sector Benchmark */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Benchmark Sectoriel
          </CardTitle>
          <CardDescription>
            Comparez votre intensité carbone avec les références du secteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectorAvg">Moyenne sectorielle</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sectorAvg"
                      type="number"
                      step="0.1"
                      placeholder="tCO₂e/employé"
                      value={data.sectorAverage || ''}
                      onChange={(e) => handleChange('sectorAverage', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">t/emp</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sectorBest">Best-in-class (Top 10%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sectorBest"
                      type="number"
                      step="0.1"
                      placeholder="tCO₂e/employé"
                      value={data.sectorBestInClass || ''}
                      onChange={(e) => handleChange('sectorBestInClass', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">t/emp</span>
                  </div>
                </div>
              </div>

              {/* Position Badge */}
              {benchmarkPosition && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${benchmarkPosition.color}/20`}>
                    <Award className={`h-5 w-5 ${benchmarkPosition.textColor}`} />
                  </div>
                  <div>
                    <Badge className={`${benchmarkPosition.color} text-white`}>
                      {benchmarkPosition.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votre intensité: {intensityPerEmployee} tCO₂e/employé
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison chart */}
            {benchmarkData.length > 0 && (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value.toFixed(2)} tCO₂e/employé`]}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--primary))"
                    />
                    {data.sectorAverage > 0 && (
                      <ReferenceLine 
                        x={data.sectorAverage} 
                        stroke="hsl(var(--destructive))" 
                        strokeDasharray="3 3"
                        label={{ value: 'Moyenne', position: 'top', fontSize: 10 }}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

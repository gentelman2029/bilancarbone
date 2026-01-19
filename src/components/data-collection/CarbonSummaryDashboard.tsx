// Carbon Summary Dashboard Component
// Displays KPI metrics for carbon emissions with scope breakdown

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Factory, 
  Zap, 
  Truck, 
  Target,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from 'recharts';
import { useActivityData } from '@/hooks/useActivityData';

interface CarbonSummaryDashboardProps {
  refreshTrigger?: number;
  period?: 'month' | 'quarter' | 'year';
  onExportPDF?: () => void;
}

interface ScopeTotals {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

interface CategoryBreakdown {
  category: string;
  label: string;
  scope: string;
  co2Kg: number;
  percentage: number;
}

const SCOPE_COLORS = {
  scope1: 'hsl(0, 84%, 60%)', // Red
  scope2: 'hsl(38, 92%, 50%)', // Orange/Amber
  scope3: 'hsl(217, 91%, 60%)', // Blue
};

const CATEGORY_LABELS: Record<string, string> = {
  'diesel': 'Diesel',
  'essence': 'Essence',
  'gaz_naturel': 'Gaz naturel',
  'electricite': 'Électricité',
  'transport_routier': 'Transport routier',
  'transport_maritime': 'Transport maritime',
  'achats_biens': 'Achats de biens',
  'achats_services': 'Achats de services',
  'deplacements_domicile_travail': 'Domicile-travail',
  'deplacements_professionnels': 'Déplacements pro',
  'dechets': 'Déchets',
  'autres': 'Autres',
};

export function CarbonSummaryDashboard({ 
  refreshTrigger, 
  period = 'year',
  onExportPDF 
}: CarbonSummaryDashboardProps) {
  const { activities, isLoading, scopeStats, totalEmissions, validatedCount } = useActivityData({ autoLoad: true });
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [objective, setObjective] = useState<number | null>(null); // tCO2e objective

  // Calculate scope totals
  const scopeTotals: ScopeTotals = {
    scope1: activities.filter(a => a.ghg_scope === 'scope1').reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0),
    scope2: activities.filter(a => a.ghg_scope === 'scope2').reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0),
    scope3: activities.filter(a => a.ghg_scope === 'scope3').reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0),
    total: totalEmissions,
  };

  // Calculate category breakdown (top 5)
  const categoryBreakdown: CategoryBreakdown[] = Object.entries(
    activities.reduce((acc, a) => {
      const key = a.ghg_category;
      if (!acc[key]) {
        acc[key] = { scope: a.ghg_scope, co2Kg: 0 };
      }
      acc[key].co2Kg += a.co2_equivalent_kg || 0;
      return acc;
    }, {} as Record<string, { scope: string; co2Kg: number }>)
  )
    .map(([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category] || category,
      scope: data.scope,
      co2Kg: data.co2Kg,
      percentage: totalEmissions > 0 ? (data.co2Kg / totalEmissions) * 100 : 0,
    }))
    .sort((a, b) => b.co2Kg - a.co2Kg)
    .slice(0, 5);

  // Pie chart data
  const pieData = [
    { name: 'Scope 1', value: scopeTotals.scope1 / 1000, color: SCOPE_COLORS.scope1 },
    { name: 'Scope 2', value: scopeTotals.scope2 / 1000, color: SCOPE_COLORS.scope2 },
    { name: 'Scope 3', value: scopeTotals.scope3 / 1000, color: SCOPE_COLORS.scope3 },
  ].filter(d => d.value > 0);

  // Monthly trend data (mock for now, would be from actual data)
  const monthlyData = [
    { month: 'Jan', scope1: 12, scope2: 8, scope3: 25 },
    { month: 'Fév', scope1: 11, scope2: 7, scope3: 23 },
    { month: 'Mar', scope1: 13, scope2: 9, scope3: 28 },
    { month: 'Avr', scope1: 10, scope2: 8, scope3: 22 },
    { month: 'Mai', scope1: 12, scope2: 7, scope3: 26 },
    { month: 'Juin', scope1: 14, scope2: 10, scope3: 30 },
  ];

  // Calculate data quality score
  const dataQualityScore = activities.length > 0 
    ? Math.round((validatedCount / activities.length) * 100)
    : 0;

  // Objective progress
  const objectiveProgress = objective && scopeTotals.total > 0
    ? Math.min(100, (scopeTotals.total / 1000 / objective) * 100)
    : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Bilan Carbone
          </h2>
          <p className="text-sm text-muted-foreground">
            {activities.length} activités collectées • {validatedCount} validées
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          {onExportPDF && (
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Emissions */}
        <Card className="bg-gradient-to-br from-background to-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Émissions totales</p>
                <p className="text-3xl font-bold mt-1">
                  {(scopeTotals.total / 1000).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">tCO₂e</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
            {objectiveProgress !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Objectif</span>
                  <span>{objectiveProgress.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={objectiveProgress} 
                  className={objectiveProgress > 80 ? 'bg-red-200' : objectiveProgress > 50 ? 'bg-amber-200' : 'bg-green-200'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scope 1 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <p className="text-sm text-muted-foreground">Scope 1</p>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {(scopeTotals.scope1 / 1000).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">tCO₂e • Émissions directes</p>
              </div>
              <Factory className="h-6 w-6 text-red-500/70" />
            </div>
            <div className="mt-3">
              <Badge variant="outline" className="text-xs">
                {scopeTotals.total > 0 ? ((scopeTotals.scope1 / scopeTotals.total) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Scope 2 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <p className="text-sm text-muted-foreground">Scope 2</p>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {(scopeTotals.scope2 / 1000).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">tCO₂e • Énergie indirecte</p>
              </div>
              <Zap className="h-6 w-6 text-amber-500/70" />
            </div>
            <div className="mt-3">
              <Badge variant="outline" className="text-xs">
                {scopeTotals.total > 0 ? ((scopeTotals.scope2 / scopeTotals.total) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Scope 3 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <p className="text-sm text-muted-foreground">Scope 3</p>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {(scopeTotals.scope3 / 1000).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">tCO₂e • Chaîne de valeur</p>
              </div>
              <Truck className="h-6 w-6 text-blue-500/70" />
            </div>
            <div className="mt-3">
              <Badge variant="outline" className="text-xs">
                {scopeTotals.total > 0 ? ((scopeTotals.scope3 / scopeTotals.total) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scope Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5" />
              Répartition par Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}t`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, 'Émissions']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mb-2 opacity-50" />
                <p>Aucune donnée d'émission</p>
                <p className="text-sm">Importez des documents pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Top 5 Catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {categoryBreakdown.map((cat, index) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm">{cat.label}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            cat.scope === 'scope1' ? 'border-red-500/50 text-red-600' :
                            cat.scope === 'scope2' ? 'border-amber-500/50 text-amber-600' :
                            'border-blue-500/50 text-blue-600'
                          }`}
                        >
                          {cat.scope === 'scope1' ? 'S1' : cat.scope === 'scope2' ? 'S2' : 'S3'}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {(cat.co2Kg / 1000).toFixed(2)} t
                      </span>
                    </div>
                    <Progress 
                      value={cat.percentage} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <p>Pas encore de catégories</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Qualité des données</p>
              <p className="text-xs text-muted-foreground mt-1">
                {validatedCount} / {activities.length} activités validées
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{dataQualityScore}%</p>
                <p className="text-xs text-muted-foreground">Score qualité</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`p-2 rounded-full ${
                      dataQualityScore >= 80 ? 'bg-green-100 text-green-600' :
                      dataQualityScore >= 50 ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {dataQualityScore >= 80 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : dataQualityScore >= 50 ? (
                        <Target className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {dataQualityScore >= 80 ? 'Excellente qualité' :
                     dataQualityScore >= 50 ? 'Qualité acceptable' :
                     'Amélioration nécessaire'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Progress value={dataQualityScore} className="mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}

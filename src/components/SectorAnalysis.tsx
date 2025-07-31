import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, TrendingUp, TrendingDown, AlertTriangle, Target, CheckCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SECTOR_BENCHMARKS = {
  manufacturing: {
    name: "Industrie manufacturière",
    average: 2.5,
    topPerformers: 1.2,
    threshold: 3.0,
    unit: "tCO2e/k€ CA"
  },
  services: {
    name: "Services",
    average: 0.8,
    topPerformers: 0.4,
    threshold: 1.2,
    unit: "tCO2e/k€ CA"
  },
  retail: {
    name: "Commerce de détail",
    average: 1.8,
    topPerformers: 0.9,
    threshold: 2.2,
    unit: "tCO2e/k€ CA"
  },
  transport: {
    name: "Transport et logistique",
    average: 4.2,
    topPerformers: 2.8,
    threshold: 5.0,
    unit: "tCO2e/k€ CA"
  },
  construction: {
    name: "BTP",
    average: 3.8,
    topPerformers: 2.1,
    threshold: 4.5,
    unit: "tCO2e/k€ CA"
  },
  technology: {
    name: "Technologies",
    average: 0.6,
    topPerformers: 0.2,
    threshold: 0.9,
    unit: "tCO2e/k€ CA"
  },
  energy: {
    name: "Énergie",
    average: 6.8,
    topPerformers: 3.5,
    threshold: 8.5,
    unit: "tCO2e/k€ CA"
  }
};

interface SectorAnalysisProps {
  totalEmissions: number; // en kg
  annualRevenue: number; // en k€
}

export const SectorAnalysis: React.FC<SectorAnalysisProps> = ({ 
  totalEmissions, 
  annualRevenue 
}) => {
  const [selectedSector, setSelectedSector] = useState<string>("services");
  
  // Calcul de l'intensité carbone
  const emissionsIntensity = (totalEmissions / 1000) / annualRevenue; // tCO2e/k€
  
  // Données pour le graphique
  const getChartData = () => {
    const sector = SECTOR_BENCHMARKS[selectedSector as keyof typeof SECTOR_BENCHMARKS];
    if (!sector) return [];
    
    return [
      {
        name: "Vos émissions",
        value: emissionsIntensity,
        color: emissionsIntensity <= sector.topPerformers ? "#10B981" : 
               emissionsIntensity <= sector.average ? "#3B82F6" : 
               emissionsIntensity <= sector.threshold ? "#F59E0B" : "#EF4444"
      },
      {
        name: "Moyenne sectorielle",
        value: sector.average,
        color: "#94A3B8"
      },
      {
        name: "Top 10%",
        value: sector.topPerformers,
        color: "#10B981"
      }
    ];
  };

  // Interprétation dynamique
  const getDynamicInterpretation = () => {
    const sector = SECTOR_BENCHMARKS[selectedSector as keyof typeof SECTOR_BENCHMARKS];
    if (!sector) return null;

    if (emissionsIntensity <= sector.topPerformers) {
      return {
        level: 'excellent',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        title: 'Performance Exceptionnelle',
        message: `Félicitations ! Avec ${emissionsIntensity.toFixed(2)} tCO2e/k€, vous faites partie des 10% les plus performants du secteur ${sector.name}. Maintenez ces excellents résultats !`,
        color: 'border-green-200 bg-green-50',
        badgeColor: 'bg-green-100 text-green-800'
      };
    } else if (emissionsIntensity <= sector.average) {
      return {
        level: 'good',
        icon: <Target className="w-5 h-5 text-blue-600" />,
        title: 'Bonne Performance',
        message: `Votre performance (${emissionsIntensity.toFixed(2)} tCO2e/k€) est meilleure que la moyenne sectorielle (${sector.average} tCO2e/k€). Vous pourriez viser le top 10% (${sector.topPerformers} tCO2e/k€).`,
        color: 'border-blue-200 bg-blue-50',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    } else if (emissionsIntensity <= sector.threshold) {
      return {
        level: 'average',
        icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
        title: 'Performance Moyenne',
        message: `Vos émissions (${emissionsIntensity.toFixed(2)} tCO2e/k€) dépassent la moyenne du secteur ${sector.name}. Des actions d'amélioration sont recommandées pour atteindre ${sector.average} tCO2e/k€.`,
        color: 'border-orange-200 bg-orange-50',
        badgeColor: 'bg-orange-100 text-orange-800'
      };
    } else {
      return {
        level: 'critical',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        title: 'Action Urgente Requise',
        message: `Vos émissions (${emissionsIntensity.toFixed(2)} tCO2e/k€) dépassent largement le seuil critique (${sector.threshold} tCO2e/k€). Un plan de réduction ambitieux est urgent.`,
        color: 'border-red-200 bg-red-50',
        badgeColor: 'bg-red-100 text-red-800'
      };
    }
  };

  const interpretation = getDynamicInterpretation();
  const chartData = getChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {data.value.toFixed(3)} tCO2e/k€ CA
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-lg">Analyse Sectorielle</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comparez vos performances carbone
              </p>
            </div>
          </div>
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sélecteur de secteur */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Secteur d'activité
          </label>
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="bg-background border-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-muted shadow-lg z-50">
              {Object.entries(SECTOR_BENCHMARKS).map(([key, sector]) => (
                <SelectItem key={key} value={key}>{sector.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Graphique interactif */}
        <div className="bg-background rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-4">Comparaison des performances</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'tCO2e/k€ CA', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Interprétation dynamique */}
        {interpretation && (
          <Alert className={`p-4 ${interpretation.color}`}>
            <div className="flex items-start gap-3">
              {interpretation.icon}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{interpretation.title}</h4>
                  <Badge className={interpretation.badgeColor}>
                    {interpretation.level}
                  </Badge>
                </div>
                <AlertDescription className="text-sm">
                  {interpretation.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Métriques clés */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-3 text-center bg-background">
            <div className="text-lg font-bold text-primary">
              {emissionsIntensity.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">Votre intensité</div>
          </Card>
          <Card className="p-3 text-center bg-background">
            <div className="text-lg font-bold text-orange-600">
              {SECTOR_BENCHMARKS[selectedSector as keyof typeof SECTOR_BENCHMARKS]?.average || 0}
            </div>
            <div className="text-xs text-muted-foreground">Moyenne secteur</div>
          </Card>
          <Card className="p-3 text-center bg-background">
            <div className="text-lg font-bold text-green-600">
              {SECTOR_BENCHMARKS[selectedSector as keyof typeof SECTOR_BENCHMARKS]?.topPerformers || 0}
            </div>
            <div className="text-xs text-muted-foreground">Top 10%</div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, CheckCircle, Award, TrendingUp, Info, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { useEmissions } from "@/contexts/EmissionsContext";

// Données des benchmarks sectoriels par défaut avec des seuils détaillés
const DEFAULT_SECTOR_BENCHMARKS = {
  services: {
    name: "Services",
    average: 12.5, // tCO2e/k€
    topPerformers: 6.2,
    threshold: 20.0,
    unit: "tCO2e/k€",
    description: "Secteur tertiaire incluant conseil, finance, assurance"
  },
  industrie: {
    name: "Industrie manufacturière",
    average: 28.7,
    topPerformers: 15.3,
    threshold: 45.0,
    unit: "tCO2e/k€",
    description: "Production industrielle, transformation"
  },
  transport: {
    name: "Transport et logistique",
    average: 45.2,
    topPerformers: 22.8,
    threshold: 70.0,
    unit: "tCO2e/k€",
    description: "Transport de marchandises et de personnes"
  },
  construction: {
    name: "BTP et construction",
    average: 35.6,
    topPerformers: 18.9,
    threshold: 55.0,
    unit: "tCO2e/k€",
    description: "Bâtiment, travaux publics, matériaux"
  },
  energie: {
    name: "Énergie et utilities",
    average: 65.4,
    topPerformers: 32.1,
    threshold: 100.0,
    unit: "tCO2e/k€",
    description: "Production et distribution d'énergie"
  },
  agriculture: {
    name: "Agriculture et agroalimentaire",
    average: 42.8,
    topPerformers: 25.6,
    threshold: 65.0,
    unit: "tCO2e/k€",
    description: "Agriculture, élevage, transformation alimentaire"
  },
  retail: {
    name: "Commerce et distribution",
    average: 18.3,
    topPerformers: 9.7,
    threshold: 30.0,
    unit: "tCO2e/k€",
    description: "Commerce de détail, grande distribution"
  },
  technologie: {
    name: "Technologies et numérique",
    average: 8.9,
    topPerformers: 4.2,
    threshold: 15.0,
    unit: "tCO2e/k€",
    description: "IT, télécommunications, numérique"
  }
};

interface SectorComparativeAnalysisProps {
  totalEmissions: number; // en kg
  annualRevenue?: number; // en k€
}

export const SectorComparativeAnalysis = ({ totalEmissions, annualRevenue = 1000 }: SectorComparativeAnalysisProps) => {
  const [selectedSector, setSelectedSector] = useState<string>("services");
  const { emissions } = useEmissions();
  
  // Utiliser les benchmarks personnalisés du calculateur si disponibles
  const hasCustomBenchmarks = useMemo(() => {
    return emissions.benchmarkSectorAverage && emissions.benchmarkSectorAverage > 0;
  }, [emissions.benchmarkSectorAverage]);
  
  // Créer les données du secteur en combinant les benchmarks par défaut et personnalisés
  const sectorData = useMemo(() => {
    if (hasCustomBenchmarks) {
      // Utiliser les valeurs personnalisées du calculateur
      return {
        name: emissions.benchmarkSectorName || "Secteur personnalisé",
        average: emissions.benchmarkSectorAverage || 12.5,
        topPerformers: emissions.benchmarkSectorTop10 || 6.2,
        threshold: emissions.benchmarkSectorCritical || 20.0,
        unit: "tCO2e/k€" as const,
        description: `Valeurs personnalisées pour ${emissions.benchmarkSectorName || "votre secteur"}`
      };
    }
    // Sinon utiliser les valeurs par défaut du secteur sélectionné
    return DEFAULT_SECTOR_BENCHMARKS[selectedSector as keyof typeof DEFAULT_SECTOR_BENCHMARKS];
  }, [hasCustomBenchmarks, emissions.benchmarkSectorName, emissions.benchmarkSectorAverage, emissions.benchmarkSectorTop10, emissions.benchmarkSectorCritical, selectedSector]);
  
  // Calcul de l'intensité carbone de l'entreprise
  const emissionsIntensity = annualRevenue > 0 ? (totalEmissions / 1000) / annualRevenue : 0;
  
  // Fonction pour calculer la performance relative
  const getPerformanceAnalysis = () => {
    if (!sectorData) return { status: "unknown", message: "", color: "gray", icon: Info, recommendations: [] };
    
    const { average, topPerformers, threshold } = sectorData;
    
    if (emissionsIntensity <= topPerformers) {
      return {
        status: "excellent",
        message: `Excellente performance ! Vous faites partie du top 10% du secteur ${sectorData.name.toLowerCase()}.`,
        color: "green",
        icon: Award,
        recommendations: [
          "Maintenez vos bonnes pratiques actuelles",
          "Partagez votre expertise avec d'autres entreprises",
          "Visez la neutralité carbone d'ici 2030"
        ]
      };
    } else if (emissionsIntensity <= average) {
      return {
        status: "good",
        message: `Bonne performance, vous êtes en dessous de la moyenne sectorielle de ${average.toFixed(1)} ${sectorData.unit}.`,
        color: "blue",
        icon: CheckCircle,
        recommendations: [
          "Optimisez vos processus les plus émissifs",
          "Investissez dans les énergies renouvelables",
          "Renforcez vos objectifs de réduction"
        ]
      };
    } else if (emissionsIntensity <= threshold) {
      return {
        status: "average",
        message: `Performance moyenne. Des efforts supplémentaires sont nécessaires pour atteindre la moyenne sectorielle.`,
        color: "yellow",
        icon: TrendingUp,
        recommendations: [
          "Établissez un plan de réduction structuré",
          "Identifiez vos principaux postes d'émission",
          "Formez vos équipes aux enjeux carbone"
        ]
      };
    } else {
      return {
        status: "critical",
        message: `⚠️ Performance critique ! Votre intensité carbone dépasse largement les standards du secteur.`,
        color: "red",
        icon: AlertTriangle,
        recommendations: [
          "Action urgente requise : audit carbone complet",
          "Mise en place d'une stratégie climat immédiate",
          "Accompagnement par un expert en décarbonation"
        ]
      };
    }
  };
  
  const performance = getPerformanceAnalysis();
  
  // Calcul de l'écart avec la moyenne sectorielle
  const gapWithAverage = sectorData ? ((emissionsIntensity - sectorData.average) / sectorData.average * 100) : 0;
  
  // Données pour le graphique comparatif
  const getChartData = () => {
    // Ensure emissionsIntensity has a minimum visible value for the chart
    const displayIntensity = emissionsIntensity > 0 ? emissionsIntensity : 0.01;
    
    return [
      {
        name: "Votre entreprise",
        value: displayIntensity,
        color: performance.color === "green" ? "#22c55e" : 
               performance.color === "blue" ? "#3b82f6" :
               performance.color === "yellow" ? "#eab308" : "#ef4444",
        isCompany: true
      },
      {
        name: "Top 10",
        value: sectorData.topPerformers,
        color: "#10b981",
        isCompany: false
      },
      {
        name: "Moyenne sectorielle",
        value: sectorData.average,
        color: "#f59e0b",
        isCompany: false
      },
      {
        name: "Seuil critique",
        value: sectorData.threshold,
        color: "#ef4444",
        isCompany: false
      }
    ];
  };
  
  const chartData = getChartData();
  
  // Custom tooltip pour le graphique
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gap = data.isCompany ? 
        ((emissionsIntensity - sectorData.average) / sectorData.average * 100).toFixed(1) : null;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value.toFixed(2)} {sectorData.unit}
          </p>
          {gap && (
            <p className="text-xs mt-1">
              {parseFloat(gap) > 0 ? `+${gap}%` : `${gap}%`} vs moyenne sectorielle
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analyse Comparative Sectorielle
          </CardTitle>
          {!hasCustomBenchmarks && (
            <div className="w-64">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEFAULT_SECTOR_BENCHMARKS).map(([key, sector]) => (
                    <SelectItem key={key} value={key}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {hasCustomBenchmarks && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {sectorData.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {sectorData.description} • Intensité carbone en {sectorData.unit}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Graphique comparatif */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: sectorData.unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Interprétation dynamique */}
        <Alert className={`border-l-4 ${
          performance.color === "green" ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" :
          performance.color === "blue" ? "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20" :
          performance.color === "yellow" ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" :
          "border-l-red-500 bg-red-50 dark:bg-red-950/20"
        }`}>
          <performance.icon className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="font-medium">{performance.message}</p>
            <div className="space-y-1">
              <p className="text-sm font-medium">Recommandations :</p>
              <ul className="text-sm space-y-1">
                {performance.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
        
        {/* Métriques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Votre intensité</span>
                <Badge variant={performance.color === "green" ? "default" : "secondary"}>
                  {emissionsIntensity.toFixed(2)} {sectorData.unit}
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (emissionsIntensity / sectorData.threshold) * 100)} 
                className="h-2" 
              />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Moyenne sectorielle</span>
                <Badge variant="outline">
                  {sectorData.average.toFixed(1)} {sectorData.unit}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Écart: {gapWithAverage >= 0 ? '+' : ''}{gapWithAverage.toFixed(1)}%
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Top 10</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950">
                  {sectorData.topPerformers.toFixed(1)} {sectorData.unit}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Objectif d'excellence
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendingUp, TrendingDown, Activity, Target, Zap, Factory, PieChart, BarChart3, Edit, Eye, Plus, AlertTriangle, CheckCircle, Filter, Calendar as CalendarIcon, Bell, TrendingUp as TrendIcon, Calculator, Award, Clock } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, AreaChart, Area, ComposedChart, Legend } from "recharts";
import { Link } from "react-router-dom";
import { useEmissions } from "@/contexts/EmissionsContext";
import { EnhancedReportGenerator } from "@/components/EnhancedReportGenerator";
import { SectorBasedScoring } from "@/components/SectorBasedScoring";
import { SectorAnalysis } from "@/components/SectorAnalysis";


import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Dashboard = () => {
  const { emissions, hasEmissions } = useEmissions();
  
  // Données réalistes basées sur les émissions calculées
  const currentEmissions = emissions.total / 1000; // Conversion en tCO2e
  const previousYearEmissions = currentEmissions * 1.15; // 15% de plus l'année précédente
  const targetReduction = currentEmissions * 0.7; // Objectif -30% pour 2026
  const progressPercentage = hasEmissions ? ((previousYearEmissions - currentEmissions) / (previousYearEmissions - targetReduction)) * 100 : 0;
  
  // États pour les filtres interactifs
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setDateRange(range);
      applyFilters(range, selectedScope, viewType);
    }
  };

  const applyFilters = (dateRange: any, scope: string, view: string) => {
    let filtered = [...monthlyEmissions];
    
    if (scope !== "all") {
      // Filtrer par scope - augmenter les valeurs du scope sélectionné pour l'effet visuel
      filtered = filtered.map(item => ({
        ...item,
        scope1: scope === "scope1" ? item.scope1 * 1.2 : item.scope1 * 0.8,
        scope2: scope === "scope2" ? item.scope2 * 1.2 : item.scope2 * 0.8,
        scope3: scope === "scope3" ? item.scope3 * 1.2 : item.scope3 * 0.8,
      }));
    }
    
    setFilteredData(filtered);
  };

  const exportCSV = () => {
    const toTonnes = (kg: number) => Number((kg / 1000).toFixed(2));
    
    // Données réelles des émissions
    const realEmissions = {
      scope1: toTonnes(emissions.scope1),
      scope2: toTonnes(emissions.scope2),
      scope3: toTonnes(emissions.scope3),
      total: toTonnes(emissions.total)
    };

    // Sources détaillées d'émissions (exemples basés sur les scopes)
    const detailedSources = [
      // Scope 1 - Sources directes
      { categorie: 'Scope 1', source: 'Combustion stationnaire', type: 'Chauffage bureaux', emissions: toTonnes(emissions.scope1 * 0.4), unite: 'tCO2e' },
      { categorie: 'Scope 1', source: 'Transport', type: 'Véhicules de fonction', emissions: toTonnes(emissions.scope1 * 0.6), unite: 'tCO2e' },
      
      // Scope 2 - Sources indirectes énergétiques
      { categorie: 'Scope 2', source: 'Électricité', type: 'Consommation bureaux', emissions: toTonnes(emissions.scope2 * 0.7), unite: 'tCO2e' },
      { categorie: 'Scope 2', source: 'Chauffage urbain', type: 'Réseau de chaleur', emissions: toTonnes(emissions.scope2 * 0.3), unite: 'tCO2e' },
      
      // Scope 3 - Autres sources indirectes
      { categorie: 'Scope 3', source: 'Achats', type: 'Matières premières', emissions: toTonnes(emissions.scope3 * 0.3), unite: 'tCO2e' },
      { categorie: 'Scope 3', source: 'Transport', type: 'Fret et distribution', emissions: toTonnes(emissions.scope3 * 0.25), unite: 'tCO2e' },
      { categorie: 'Scope 3', source: 'Déplacements', type: 'Voyages d\'affaires', emissions: toTonnes(emissions.scope3 * 0.2), unite: 'tCO2e' },
      { categorie: 'Scope 3', source: 'Numérique', type: 'Équipements IT', emissions: toTonnes(emissions.scope3 * 0.15), unite: 'tCO2e' },
      { categorie: 'Scope 3', source: 'Déchets', type: 'Traitement déchets', emissions: toTonnes(emissions.scope3 * 0.1), unite: 'tCO2e' }
    ];

    // Données consolidées
    const csvData = [
      ['=== BILAN CARBONE CONSOLIDÉ CARBONTRACK ==='],
      [''],
      ['Date d\'export:', format(new Date(), 'dd/MM/yyyy HH:mm')],
      ['Dernière mise à jour:', emissions.lastUpdated ? format(new Date(emissions.lastUpdated), 'dd/MM/yyyy HH:mm') : 'N/A'],
      [''],
      ['=== RÉSUMÉ EXÉCUTIF ==='],
      ['Scope', 'Émissions (tCO2e)', 'Pourcentage du total', 'Statut vs Objectif'],
      ['Scope 1 - Émissions directes', realEmissions.scope1, `${((realEmissions.scope1 / realEmissions.total) * 100).toFixed(1)}%`, realEmissions.scope1 < 200 ? 'Objectif atteint' : 'À améliorer'],
      ['Scope 2 - Énergies indirectes', realEmissions.scope2, `${((realEmissions.scope2 / realEmissions.total) * 100).toFixed(1)}%`, realEmissions.scope2 < 150 ? 'Objectif atteint' : 'À améliorer'],
      ['Scope 3 - Autres indirectes', realEmissions.scope3, `${((realEmissions.scope3 / realEmissions.total) * 100).toFixed(1)}%`, realEmissions.scope3 < 300 ? 'Objectif atteint' : 'À améliorer'],
      ['TOTAL', realEmissions.total, '100%', realEmissions.total < 650 ? 'Objectif global atteint' : 'Effort requis'],
      [''],
      ['=== ANALYSE DÉTAILLÉE PAR SOURCE ==='],
      ['Catégorie', 'Source d\'émission', 'Type/Description', 'Émissions (tCO2e)', 'Impact relatif', 'Priorité d\'action'],
      ...detailedSources.map(item => [
        item.categorie,
        item.source,
        item.type,
        item.emissions,
        `${((item.emissions / realEmissions.total) * 100).toFixed(1)}%`,
        item.emissions > realEmissions.total * 0.15 ? 'HAUTE' : item.emissions > realEmissions.total * 0.08 ? 'MOYENNE' : 'FAIBLE'
      ]),
      [''],
      ['=== BENCHMARKS ET OBJECTIFS ==='],
      ['Métrique', 'Valeur actuelle', 'Objectif 2024', 'Benchmark sectoriel', 'Écart à l\'objectif'],
      ['Émissions totales (tCO2e)', realEmissions.total, '650', '700', `${(realEmissions.total - 650).toFixed(1)}`],
      ['Intensité carbone (tCO2e/k€)', (realEmissions.total / 1000).toFixed(2), '0.60', '0.65', `${((realEmissions.total / 1000) - 0.60).toFixed(2)}`],
      ['Scope 1 (tCO2e)', realEmissions.scope1, '200', '220', `${(realEmissions.scope1 - 200).toFixed(1)}`],
      ['Scope 2 (tCO2e)', realEmissions.scope2, '150', '180', `${(realEmissions.scope2 - 150).toFixed(1)}`],
      ['Scope 3 (tCO2e)', realEmissions.scope3, '300', '300', `${(realEmissions.scope3 - 300).toFixed(1)}`],
      [''],
      ['=== ÉVOLUTION TEMPORELLE ==='],
      ['Période', 'Scope 1', 'Scope 2', 'Scope 3', 'Total', 'Objectif', 'Benchmark', 'Tendance'],
      ...filteredData.map(item => [
        item.month,
        item.scope1,
        item.scope2,
        item.scope3,
        item.scope1 + item.scope2 + item.scope3,
        item.target,
        item.benchmark,
        (item.scope1 + item.scope2 + item.scope3) < item.target ? 'Amélioration' : 'Dégradation'
      ]),
      [''],
      ['=== PRINCIPALES SOURCES D\'ÉMISSIONS ==='],
      ['Rang', 'Source', 'Émissions (tCO2e)', '% du total', 'Actions recommandées'],
      ...detailedSources
        .sort((a, b) => b.emissions - a.emissions)
        .slice(0, 5)
        .map((item, index) => [
          index + 1,
          `${item.source} - ${item.type}`,
          item.emissions,
          `${((item.emissions / realEmissions.total) * 100).toFixed(1)}%`,
          index === 0 ? 'Action prioritaire immédiate' : index < 3 ? 'Planifier réduction sous 6 mois' : 'Surveiller et optimiser'
        ]),
      [''],
      ['=== RECOMMANDATIONS D\'ACTION ==='],
      ['Priorité', 'Action', 'Impact estimé (tCO2e)', 'Coût estimé (k€)', 'ROI (mois)'],
      ['1 - HAUTE', 'Optimisation énergétique bureaux', (realEmissions.scope2 * 0.3).toFixed(1), '50', '18'],
      ['2 - HAUTE', 'Électrification flotte véhicules', (realEmissions.scope1 * 0.6).toFixed(1), '120', '36'],
      ['3 - MOYENNE', 'Réduction voyages d\'affaires', (realEmissions.scope3 * 0.2).toFixed(1), '10', '6'],
      ['4 - MOYENNE', 'Eco-conception produits', (realEmissions.scope3 * 0.15).toFixed(1), '80', '24'],
      ['5 - FAIBLE', 'Sensibilisation équipes', (realEmissions.total * 0.05).toFixed(1), '5', '12'],
      [''],
      ['=== CONTACT CARBONTRACK ==='],
      ['Société:', 'Carbontrack'],
      ['Email:', 'carbontrack2025@protonmail.com'],
      ['Téléphone:', '+216 93 460 745'],
      ['Site web:', 'www.carbontrack.tn']
    ];

    const csvContent = csvData.map(row => 
      Array.isArray(row) ? row.join(';') : row
    ).join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bilan_carbone_detaille_carbontrack_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const analyzeData = () => {
    const totalEmissions = hasEmissions ? emissions.total : 1247000;
    const analysis = {
      mainHotspot: emissions.scope1 > emissions.scope2 && emissions.scope1 > emissions.scope3 ? "Scope 1" : 
                   emissions.scope2 > emissions.scope3 ? "Scope 2" : "Scope 3",
      reductionPotential: Math.round(totalEmissions * 0.35),
      estimatedCost: Math.round(totalEmissions * 0.08),
      paybackPeriod: "18-24 mois",
      priority: emissions.scope1 > 500000 ? "Très haute" : emissions.scope2 > 300000 ? "Haute" : "Moyenne"
    };
    
    setAnalysisData(analysis);
  };
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [viewType, setViewType] = useState<string>("monthly");
  const [showNotifications, setShowNotifications] = useState(true);
  
  // États pour les filtres de progression vs objectifs
  const [progressYear, setProgressYear] = useState<string>("2024");
  const [progressDepartment, setProgressDepartment] = useState<string>("all");
  const [reductionType, setReductionType] = useState<string>("all");
  
  // États pour les filtres du plan d'action
  const [actionPriority, setActionPriority] = useState<string>("all");
  const [actionStatus, setActionStatus] = useState<string>("all");
  const [actionDateFilter, setActionDateFilter] = useState<string>("all");
  
  // Données historiques enrichies basées sur les calculs réels
  const monthlyEmissions = [
    { month: "Jan", scope1: Math.round(emissions.scope1 / 1000 * 0.8), scope2: Math.round(emissions.scope2 / 1000 * 0.85), scope3: Math.round(emissions.scope3 / 1000 * 0.9), target: 110, benchmark: 120, prediction: Math.round(emissions.scope1 / 1000 * 0.75) },
    { month: "Fév", scope1: Math.round(emissions.scope1 / 1000 * 0.85), scope2: Math.round(emissions.scope2 / 1000 * 0.9), scope3: Math.round(emissions.scope3 / 1000 * 0.95), target: 108, benchmark: 118, prediction: Math.round(emissions.scope1 / 1000 * 0.8) },
    { month: "Mar", scope1: Math.round(emissions.scope1 / 1000 * 0.9), scope2: Math.round(emissions.scope2 / 1000 * 0.95), scope3: Math.round(emissions.scope3 / 1000 * 1.0), target: 106, benchmark: 116, prediction: Math.round(emissions.scope1 / 1000 * 0.85) },
    { month: "Avr", scope1: Math.round(emissions.scope1 / 1000 * 0.95), scope2: Math.round(emissions.scope2 / 1000 * 1.0), scope3: Math.round(emissions.scope3 / 1000 * 1.05), target: 104, benchmark: 114, prediction: Math.round(emissions.scope1 / 1000 * 0.9) },
    { month: "Mai", scope1: Math.round(emissions.scope1 / 1000 * 1.0), scope2: Math.round(emissions.scope2 / 1000 * 1.05), scope3: Math.round(emissions.scope3 / 1000 * 1.1), target: 102, benchmark: 112, prediction: Math.round(emissions.scope1 / 1000 * 0.95) },
    { month: "Jun", scope1: Math.round(emissions.scope1 / 1000), scope2: Math.round(emissions.scope2 / 1000), scope3: Math.round(emissions.scope3 / 1000), target: 100, benchmark: 110, prediction: Math.round(emissions.scope1 / 1000) },
    { month: "Jul", scope1: 0, scope2: 0, scope3: 0, target: 98, benchmark: 108, prediction: Math.round(emissions.scope1 / 1000 * 0.9) },
    { month: "Août", scope1: 0, scope2: 0, scope3: 0, target: 96, benchmark: 106, prediction: Math.round(emissions.scope1 / 1000 * 0.85) },
    { month: "Sep", scope1: 0, scope2: 0, scope3: 0, target: 94, benchmark: 104, prediction: Math.round(emissions.scope1 / 1000 * 0.8) },
    { month: "Oct", scope1: 0, scope2: 0, scope3: 0, target: 92, benchmark: 102, prediction: Math.round(emissions.scope1 / 1000 * 0.75) },
    { month: "Nov", scope1: 0, scope2: 0, scope3: 0, target: 90, benchmark: 100, prediction: Math.round(emissions.scope1 / 1000 * 0.7) },
    { month: "Déc", scope1: 0, scope2: 0, scope3: 0, target: 88, benchmark: 98, prediction: Math.round(emissions.scope1 / 1000 * 0.65) }
  ];
  
  const [filteredData, setFilteredData] = useState(monthlyEmissions);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Convertir en tonnes pour l'affichage
  const toTonnes = (kg: number) => (kg / 1000).toFixed(3);
  
  const metrics = [
    {
      title: "Émissions totales",
      value: hasEmissions ? `${toTonnes(emissions.total)} tCO2e` : "0 tCO2e",
      change: hasEmissions ? "+12%" : "0%",
      trend: hasEmissions ? "up" : "neutral",
      icon: Activity,
      color: "text-destructive"
    },
    {
      title: "Scope 1",
      value: hasEmissions ? `${toTonnes(emissions.scope1)} tCO2e` : "0 tCO2e",
      change: hasEmissions ? "-5%" : "0%", 
      trend: hasEmissions ? "down" : "neutral",
      icon: Factory,
      color: "text-primary"
    },
    {
      title: "Scope 2",
      value: hasEmissions ? `${toTonnes(emissions.scope2)} tCO2e` : "0 tCO2e",
      change: hasEmissions ? "+8%" : "0%",
      trend: hasEmissions ? "up" : "neutral", 
      icon: Zap,
      color: "text-accent"
    },
    {
      title: "Objectif 2026",
      value: "1,100 tCO2e",
      change: hasEmissions ? `${Math.round((emissions.total / 1100000) * 100)}%` : "0%",
      trend: "target",
      icon: Target,
      color: "text-primary"
    }
  ];

  // Données pour les graphiques basées sur les vraies données
  const emissionsByScope = hasEmissions ? [
    { name: "Scope 1", value: Math.round(emissions.scope1 / 1000), color: "#059669" },
    { name: "Scope 2", value: Math.round(emissions.scope2 / 1000), color: "#3B82F6" },
    { name: "Scope 3", value: Math.round(emissions.scope3 / 1000), color: "#EF4444" }
  ].filter(item => item.value > 0) : [
    { name: "Scope 1", value: 342, color: "#059669" },
    { name: "Scope 2", value: 445, color: "#3B82F6" },
    { name: "Scope 3", value: 460, color: "#EF4444" }
  ];



  const interpretEmissions = (total: number) => {
    if (total > 1000) {
      return {
        level: "Élevé",
        color: "text-destructive",
        icon: AlertTriangle,
        message: "Vos émissions sont importantes. Il est urgent de mettre en place un plan de réduction ambitieux.",
        actions: ["Audit énergétique approfondi", "Plan de mobilité durable", "Transition énergétique"]
      };
    } else if (total > 500) {
      return {
        level: "Modéré",
        color: "text-warning",
        icon: Activity,
        message: "Vos émissions sont dans la moyenne. Des actions ciblées peuvent améliorer votre performance.",
        actions: ["Optimisation énergétique", "Sensibilisation équipes", "Mobilité douce"]
      };
    } else {
      return {
        level: "Faible",
        color: "text-success",
        icon: CheckCircle,
        message: "Félicitations ! Vos émissions sont relativement faibles. Maintenez vos efforts.",
        actions: ["Maintenir les bonnes pratiques", "Amélioration continue", "Certification environnementale"]
      };
    }
  };

  const interpretation = interpretEmissions(hasEmissions ? emissions.total : 1247);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header modernisé avec notifications */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard Carbone Intelligent
              </h1>
              <p className="text-muted-foreground text-lg">Analyse prédictive et pilotage ESG en temps réel</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {showNotifications && (
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications(false)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Alertes
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse"></span>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/contact">Voir la démo</Link>
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Calculator className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
            <Button variant="eco" onClick={analyzeData}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyser les données
            </Button>
          </div>
        </div>

        {/* Filtres interactifs */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-background/50 rounded-xl border">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtres :</span>
          </div>
          
          <Select value={selectedScope} onValueChange={(value) => {
            setSelectedScope(value);
            applyFilters(dateRange, value, viewType);
          }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous scopes</SelectItem>
              <SelectItem value="scope1">Scope 1</SelectItem>
              <SelectItem value="scope2">Scope 2</SelectItem>
              <SelectItem value="scope3">Scope 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewType} onValueChange={(value) => {
            setViewType(value);
            applyFilters(dateRange, selectedScope, value);
          }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Journalier</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="yearly">Annuel</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "dd/MM/yyyy", { locale: fr })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: fr })}`
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: fr })
                  )
                ) : (
                  "Sélectionner période"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards - Hiérarchie Visuelle Améliorée */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Émissions Totales - Métrique Principale */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-2">Émissions Totales Actuelles</p>
                <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                  {hasEmissions ? `${currentEmissions.toFixed(1)} tCO2e` : "0 tCO2e"}
                </p>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                    {hasEmissions ? `${((previousYearEmissions - currentEmissions) / previousYearEmissions * 100).toFixed(1)}%` : "0%"} vs année dernière
                  </p>
                </div>
                <p className="text-emerald-500 dark:text-emerald-400 text-xs mt-1">
                  Précédent: {hasEmissions ? previousYearEmissions.toFixed(1) : "0"} tCO2e
                </p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Progression Objectif - Métrique Critique */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 ring-2 ring-blue-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">Progression vs Objectif 2026</p>
                <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {hasEmissions ? `${Math.min(100, progressPercentage).toFixed(0)}` : "0"}%
                </p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-blue-600 dark:text-blue-400 text-xs">
                    {hasEmissions && progressPercentage > 50 ? "En avance sur l'objectif" : "En cours"}
                  </p>
                </div>
                <p className="text-blue-500 dark:text-blue-400 text-xs mt-1">
                  Cible: {hasEmissions ? targetReduction.toFixed(1) : "N/A"} tCO2e (-30%)
                </p>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${hasEmissions ? Math.min(100, progressPercentage) : 0}%`}}
                  ></div>
                </div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

      </div>


      {/* Interprétation des émissions */}
      <Card className="p-6 bg-gradient-card border shadow-card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <interpretation.icon className={`w-6 h-6 ${interpretation.color}`} />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Interprétation de vos émissions</h3>
            <Badge variant={interpretation.level === "Élevé" ? "destructive" : interpretation.level === "Modéré" ? "secondary" : "default"}>
              Niveau {interpretation.level}
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">{interpretation.message}</p>
        

        {/* Recommandations prioritaires */}
        <div className="mb-4">
          <h4 className="font-semibold text-foreground mb-3">🎯 Recommandations prioritaires</h4>
          <div className="space-y-3">
            {hasEmissions && emissions.scope1 > emissions.scope2 ? (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">🔥 Hot spot détecté: Scope 1</p>
                    <p className="text-sm text-muted-foreground">Vos émissions directes représentent {Math.round((emissions.scope1/emissions.total)*100)}% du total</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">-{Math.round(emissions.scope1/2000)} tCO2e</div>
                    <div className="text-xs text-muted-foreground">Potentiel réduction</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">⚡ Hot spot détecté: Scope 2</p>
                    <p className="text-sm text-muted-foreground">Votre consommation électrique représente {hasEmissions ? Math.round((emissions.scope2/emissions.total)*100) : 36}% du total</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">-{hasEmissions ? Math.round(emissions.scope2/3000) : 150} tCO2e</div>
                    <div className="text-xs text-muted-foreground">Potentiel réduction</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {interpretation.actions.map((action, index) => (
            <div key={index} className="text-sm bg-secondary/50 rounded px-3 py-2">
              • {action}
            </div>
          ))}
        </div>

        {/* Simulation de scénarios */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-foreground mb-3">🔮 Simulation d'impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-primary/5 rounded border border-primary/20">
              <div className="font-medium text-foreground">💡 Passage LED complet</div>
              <div className="text-primary">-12% d'émissions Scope 2</div>
              <div className="text-muted-foreground">ROI: 2.3 ans</div>
            </div>
            <div className="p-3 bg-primary/5 rounded border border-primary/20">
              <div className="font-medium text-foreground">🚗 Flotte électrique</div>
              <div className="text-primary">-25% d'émissions Scope 1</div>
              <div className="text-muted-foreground">ROI: 4.1 ans</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Graphiques interactifs avancés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en camembert interactif */}
        <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <span>Répartition par Scope</span>
            </h3>
            <Badge variant="outline" className="text-xs">
              Filtré: {selectedScope === "all" ? "Tous" : selectedScope.toUpperCase()}
            </Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={emissionsByScope}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emissionsByScope.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [`${value} tCO2e`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Graphique combiné avec prédictions */}
        <Card className="p-6 bg-gradient-to-br from-background to-accent/5 border border-accent/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <span>Analyse Prédictive</span>
            </h3>
            <Badge variant="outline" className="text-xs">
              Vue: {viewType}
            </Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyEmissions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="benchmark" 
                  fill="hsl(var(--muted))" 
                  stroke="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                  name="Benchmark sectoriel"
                />
                <Bar 
                  dataKey="scope1" 
                  stackId="a" 
                  fill="hsl(var(--primary))" 
                  name="Scope 1"
                  radius={[0, 0, 4, 4]}
                />
                <Bar 
                  dataKey="scope2" 
                  stackId="a" 
                  fill="hsl(var(--accent))" 
                  name="Scope 2"
                />
                <Bar 
                  dataKey="scope3" 
                  stackId="a" 
                  fill="hsl(var(--destructive))" 
                  name="Scope 3"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Objectif 2026"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Progression vs Objectifs</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={progressYear} onValueChange={setProgressYear}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              <Select value={progressDepartment} onValueChange={setProgressDepartment}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Dépt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="logistique">Logistique</SelectItem>
                  <SelectItem value="bureaux">Bureaux</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reductionType} onValueChange={setReductionType}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="energie">Énergie</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="dechets">Déchets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Réduction 2026</span>
                <span className="font-medium text-foreground">88% atteint</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Scope 1 - Combustion</span>
                <span className="font-medium text-foreground">75% atteint</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Scope 2 - Électricité</span>
                <span className="font-medium text-foreground">92% atteint</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Plan d'action chiffré</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={actionPriority} onValueChange={setActionPriority}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue placeholder="Prior." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionStatus} onValueChange={setActionStatus}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="État" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="planifie">Planifié</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionDateFilter} onValueChange={setActionDateFilter}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="q1">Q1</SelectItem>
                  <SelectItem value="q2">Q2</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => alert("Création d'une nouvelle action de réduction carbone")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle action
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">Optimisation éclairage LED</p>
                <p className="text-sm text-muted-foreground">Impact: -45 tCO2e/an</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>En cours</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Modification de l'action 'Optimisation éclairage LED'")}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Détails de l'action: Remplacement de 200 spots par des LED. Investissement: 15 000€. ROI: 2.5 ans")}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">Formation éco-conduite</p>
                <p className="text-sm text-muted-foreground">Impact: -23 tCO2e/an</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Planifié</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Modification de l'action 'Formation éco-conduite'")}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Détails de l'action: Formation de 25 chauffeurs. Coût: 3 500€. Économies carburant: 15%")}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">Panneaux solaires</p>
                <p className="text-sm text-muted-foreground">Impact: -120 tCO2e/an</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>Terminé</Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Modification de l'action 'Panneaux solaires'")}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Détails de l'action: Installation 50kW. Investissement: 45 000€. Production: 65 MWh/an")}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Analyse sectorielle avec graphiques interactifs */}
        {hasEmissions && (
          <SectorAnalysis 
            totalEmissions={emissions.total} 
            annualRevenue={1000} 
          />
        )}


        {/* Nouveau composant pour les rapports intelligents */}
        <EnhancedReportGenerator />
      </div>
    </div>
  );
};
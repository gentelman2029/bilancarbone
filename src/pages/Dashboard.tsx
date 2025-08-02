import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Target, Share, Download, FileText, Filter, BarChart3, Eye, RotateCcw, Leaf, TreePine, Users, Zap, Building2, Globe, AlertTriangle, CheckCircle, Award } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useCarbonReports } from "@/hooks/useCarbonReports";
import { useEmissions } from "@/contexts/EmissionsContext";
import { useState } from "react";
import { format } from "date-fns";

export const Dashboard = () => {
  const { emissions, hasEmissions } = useEmissions();
  const { reports, loading, getLatestReport } = useCarbonReports();
  
  const latestReport = getLatestReport();
  const displayEmissions = latestReport ? {
    total: latestReport.total_co2e * 1000,
    scope1: latestReport.scope1_total * 1000,
    scope2: latestReport.scope2_total * 1000,
    scope3: latestReport.scope3_total * 1000
  } : emissions;
  
  const hasData = hasEmissions || !!latestReport;
  const currentEmissions = displayEmissions.total / 1000;
  const reductionAnnuelle = hasData ? 600 : 0;
  const objectifSBTI = hasData ? 87 : 0;
  const intensiteCarbone = hasData ? 1.2 : 0;
  const emissionsEmploye = hasData ? 8.4 : 0;
  const conformiteReglementaire = hasData ? 95 : 0;

  const [periodFilter, setPeriodFilter] = useState("Année 2024");
  const [scopeFilter, setScopeFilter] = useState("Tous les Scopes");
  const [entityFilter, setEntityFilter] = useState("Tous les sites");

  // Données pour le graphique donut - Répartition par Poste d'Émission
  const emissionsByPost = [
    { name: "Transport", value: 34.5, color: "#ef4444", percentage: 34.5 },
    { name: "Énergie", value: 28.6, color: "#84cc16", percentage: 28.6 },
    { name: "Achats", value: 23.3, color: "#10b981", percentage: 23.3 },
    { name: "Déchets", value: 7.6, color: "#3b82f6", percentage: 7.6 },
    { name: "Numérique", value: 6.0, color: "#8b5cf6", percentage: 6.0 }
  ];

  // Données pour le graphique area - Tendance Mensuelle vs Objectifs
  const monthlyTrend = [
    { month: "Jan", emissions: 150, objectif: 160 },
    { month: "Fév", emissions: 145, objectif: 155 },
    { month: "Mar", emissions: 138, objectif: 150 },
    { month: "Avr", emissions: 142, objectif: 145 },
    { month: "Mai", emissions: 135, objectif: 140 },
    { month: "Jun", emissions: 128, objectif: 135 },
    { month: "Jul", emissions: 125, objectif: 130 },
    { month: "Août", emissions: 122, objectif: 125 },
    { month: "Sep", emissions: 118, objectif: 120 },
    { month: "Oct", emissions: 115, objectif: 115 },
    { month: "Nov", emissions: 112, objectif: 110 },
    { month: "Déc", emissions: 108, objectif: 105 }
  ];

  // Données pour l'analyse par catégorie et scope
  const categoryScopeData = [
    { category: "Transport", scope1: 120, scope2: 30, scope3: 80 },
    { category: "Énergie", scope1: 50, scope2: 180, scope3: 40 },
    { category: "Production", scope1: 200, scope2: 150, scope3: 100 },
    { category: "Bureaux", scope1: 20, scope2: 80, scope3: 60 },
    { category: "Logistique", scope1: 40, scope2: 60, scope3: 150 },
    { category: "IT", scope1: 10, scope2: 70, scope3: 200 }
  ];

  // Données pour la répartition par site
  const siteData = [
    { name: "Siège Paris", emissions: 1250, percentage: 28.8, employees: 450 },
    { name: "Usine Lyon", emissions: 980, percentage: 22.5, employees: 320 },
    { name: "Entrepôt Marseille", emissions: 650, percentage: 14.9, employees: 180 },
    { name: "Agence Lille", emissions: 580, percentage: 13.4, employees: 150 },
    { name: "Bureau Nantes", emissions: 340, percentage: 7.8, employees: 95 },
    { name: "Site Toulouse", emissions: 280, percentage: 6.4, employees: 78 }
  ];

  // Données pour la trajectoire Science Based Targets
  const sbtTrajectory = [
    { year: "2022", target: 4500, actual: 4200 },
    { year: "2023", target: 4200, actual: 4100 },
    { year: "2024", target: 3900, actual: 3850 },
    { year: "2025", target: 3600, actual: null },
    { year: "2026", target: 3300, actual: null },
    { year: "2027", target: 3000, actual: null },
    { year: "2028", target: 2700, actual: null },
    { year: "2029", target: 2400, actual: null },
    { year: "2030", target: 2100, actual: null }
  ];

  // Données pour le benchmark sectoriel
  const sectorBenchmark = [
    { category: "Votre entreprise", value: 8.4, color: "#10b981", rank: "68ème" },
    { category: "Moyenne sectorielle", value: 12.7, color: "#f59e0b", rank: "" },
    { category: "Leaders du secteur", value: 6.8, color: "#3b82f6", rank: "" }
  ];

  const exportCSV = () => {
    const csvData = [
      ['Dashboard Carbone - Export', format(new Date(), 'dd/MM/yyyy')],
      [''],
      ['=== INDICATEURS CLÉS ==='],
      ['Émissions totales', hasData ? currentEmissions.toFixed(1) : '0', 'tCO2e'],
      ['Réduction annuelle', reductionAnnuelle, 'tCO2e'],
      ['Objectif SBTi', objectifSBTI, '%'],
      ['Intensité carbone', intensiteCarbone, 'tCO2e/k€'],
      ['Émissions/employé', emissionsEmploye, 'tCO2e/pers'],
      ['Conformité réglementaire', conformiteReglementaire, '%'],
      [''],
      ['=== RÉPARTITION PAR POSTE ==='],
      ['Poste', 'Pourcentage', 'Valeur'],
      ...emissionsByPost.map(item => [item.name, `${item.percentage}%`, `${item.value}`]),
      [''],
      ['=== RÉPARTITION PAR SITE ==='],
      ['Site', 'Émissions (tCO2e)', 'Pourcentage', 'Employés'],
      ...siteData.map(site => [site.name, site.emissions, `${site.percentage}%`, site.employees])
    ];

    const csvContent = csvData.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_carbone_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border/40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Carbone Interactif</h1>
              <p className="text-sm text-muted-foreground">Visualisation Power BI des émissions GES - Conforme Base Carbone® ADEME</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Rapport PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Filtres de Données */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres de Données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Période d'analyse</label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Année 2024">Année 2024</SelectItem>
                    <SelectItem value="Année 2023">Année 2023</SelectItem>
                    <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Scope GES</label>
                <Select value={scopeFilter} onValueChange={setScopeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous les Scopes">Tous les Scopes</SelectItem>
                    <SelectItem value="Scope 1">Scope 1</SelectItem>
                    <SelectItem value="Scope 2">Scope 2</SelectItem>
                    <SelectItem value="Scope 3">Scope 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Site/Entité</label>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous les sites">Tous les sites</SelectItem>
                    <SelectItem value="Siège Paris">Siège Paris</SelectItem>
                    <SelectItem value="Usine Lyon">Usine Lyon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Actions</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Vue
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Émissions totales */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">Émissions totales</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {hasData ? currentEmissions.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "4,200"} <span className="text-lg">tCO2e</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 font-medium">12.5%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total des émissions GES sur la période
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: 3,800 tCO2e
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Réduction annuelle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">Réduction annuelle</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    600 <span className="text-lg">tCO2e</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">16.3%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Réduction par rapport à l'année précédente
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: 550 tCO2e
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectif SBTi */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">Objectif SBTi</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    87% <span className="text-lg">atteint</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">8.7%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Progression vers l'objectif Science Based Targets
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: 100%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intensité carbone */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">Intensité carbone</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    1.2 <span className="text-lg">tCO2e/k€</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">18.2%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Émissions par unité de chiffre d'affaires
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: 0.9 tCO2e/k€
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Émissions/employé */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">Émissions/employé</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    8.4 <span className="text-lg">tCO2e/pers</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">15.2%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Intensité carbone par collaborateur
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: 7.0 tCO2e/pers
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conformité réglementaire */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">Conformité réglementaire</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    95% <span className="text-lg">complète</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">5.2%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Avancement conformité CSRD/BEGES
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Objectif: 100%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par Poste d'Émission */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Répartition par Poste d'Émission
                <Badge variant="secondary" className="ml-auto text-xs">Cliquable</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={emissionsByPost}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {emissionsByPost.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {emissionsByPost.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium">{item.name}: {item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendance Mensuelle vs Objectifs */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendance Mensuelle vs Objectifs
                <Badge variant="secondary" className="ml-auto text-xs">Temps réel</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
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
                    <Area 
                      type="monotone" 
                      dataKey="emissions" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="Émissions réelles"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="objectif" 
                      stroke="#3b82f6" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      name="Objectifs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section inférieure - Vue d'ensemble */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analyse par Catégorie et Scope */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analyse par Catégorie et Scope
                <div className="flex gap-1 ml-auto">
                  <Badge variant="destructive" className="text-xs">Scope 1</Badge>
                  <Badge variant="secondary" className="text-xs">Scope 2</Badge>
                  <Badge variant="outline" className="text-xs">Scope 3</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryScopeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="scope1" stackId="a" fill="#ef4444" name="Scope 1 - Émissions directes" />
                    <Bar dataKey="scope2" stackId="a" fill="#f97316" name="Scope 2 - Énergie indirecte" />
                    <Bar dataKey="scope3" stackId="a" fill="#3b82f6" name="Scope 3 - Autres indirectes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition par Site */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Répartition par Site
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteData.map((site, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{site.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {site.emissions.toLocaleString()} tCO2e • {site.employees} employés
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{site.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          {(site.emissions / site.employees).toFixed(1)} tCO2e/pers
                        </div>
                      </div>
                    </div>
                    <Progress value={site.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section finale - Trajectoire et Benchmark */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trajectoire Science Based Targets */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Trajectoire Science Based Targets
                <div className="flex gap-1 ml-auto">
                  <Badge variant="secondary" className="text-xs">En avance</Badge>
                  <Badge variant="outline" className="text-xs">4.2% vs objectif</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sbtTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Objectifs SBT"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Émissions réelles"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Sectoriel */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Benchmark Sectoriel
                <Badge variant="default" className="ml-auto text-lg font-bold">68ème</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">68ème</div>
                  <div className="text-sm text-muted-foreground">position sur 500 entreprises</div>
                  <div className="text-sm font-medium text-green-600">Performance above average</div>
                </div>
                
                <div className="space-y-4">
                  {sectorBenchmark.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.value} tCO2e/pers</div>
                        {item.rank && <div className="text-xs text-muted-foreground">{item.rank}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-green-600">Insights Automatiques:</div>
                      <ul className="text-muted-foreground mt-1 space-y-1">
                        <li>• Émissions 30% inférieures au secteur</li>
                        <li>• Énergie: +42% via énergies vertes</li>
                        <li>• Scope 1: Optimisation flotte (-15%)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Rapport détaillé sectoriel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes et Recommandations Intelligentes */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes et Recommandations Intelligentes
              <Badge variant="destructive" className="ml-auto">3 alertes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dépassement détecté */}
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-red-900 mb-1">Dépassement détecté</div>
                    <div className="text-sm text-red-700 mb-2">
                      Transport: +30% vs budget carbone Q4
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Analyser
                    </Button>
                  </div>
                </div>
              </div>

              {/* Objectif à risque */}
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-orange-900 mb-1">Objectif à risque</div>
                    <div className="text-sm text-orange-700 mb-2">
                      SBT 2025: retard de -8% sur trajectoire
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Plan d'actions
                    </Button>
                  </div>
                </div>
              </div>

              {/* Opportunité */}
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900 mb-1">Opportunité</div>
                    <div className="text-sm text-green-700 mb-2">
                      Économies potentielles: voir le détail
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Voir offre
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
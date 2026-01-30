// RSE Report Viewer - Interactive Preview Component
// Displays the aggregated RSE report with regulatory compliance

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Download,
  Building2,
  Leaf,
  Users,
  Scale,
  TrendingUp,
  Target,
  MapPin,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  BookOpen,
  BarChart3,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import { RSEReportData } from '@/hooks/useRSEReport';
import { RSEReportCharts } from './RSEReportCharts';

interface RSEReportViewerProps {
  reportData: RSEReportData;
  onExportPDF: () => void;
  onRefresh: () => void;
  isExporting?: boolean;
}

const CATEGORY_CONFIG = {
  E: { label: 'Environnement', color: 'emerald', icon: Leaf },
  S: { label: 'Social', color: 'blue', icon: Users },
  G: { label: 'Gouvernance', color: 'purple', icon: Scale },
};

export function RSEReportViewer({ reportData, onExportPDF, onRefresh, isExporting }: RSEReportViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'top10': return { label: 'Top 10%', color: 'bg-emerald-500' };
      case 'top25': return { label: 'Top 25%', color: 'bg-blue-500' };
      case 'average': return { label: 'Moyenne', color: 'bg-amber-500' };
      default: return { label: 'Sous la moyenne', color: 'bg-red-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Rapport RSE Intégré
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Synthèse réglementaire générée à partir des modules Scoring ESG et Pilotage RSE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={onExportPDF} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Génération...' : 'Exporter PDF'}
          </Button>
        </div>
      </div>

      {/* Source Attribution Banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-3">
          <p className="text-sm text-center">
            <Shield className="h-4 w-4 inline mr-2 text-primary" />
            Ce rapport RSE est généré automatiquement à partir du{' '}
            <strong>module de Scoring ESG</strong> et du{' '}
            <strong>module de Pilotage RSE</strong> de la plateforme.
          </p>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="esg" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Scores ESG</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Plan d'Actions</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Conformité</span>
          </TabsTrigger>
          <TabsTrigger value="kpis" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Indicateurs</span>
          </TabsTrigger>
          <TabsTrigger value="methodology" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Méthodologie</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Company Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {reportData.companyName}
              </CardTitle>
              <CardDescription>
                {reportData.sectorLabel} • Exercice {reportData.fiscalYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-primary">{reportData.esgScores.totalScore.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Score ESG Global</p>
                  <Badge className="mt-2" style={{ backgroundColor: reportData.esgScores.gradeColor }}>
                    {reportData.esgScores.grade}
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-emerald-500">{reportData.actionStats.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Plan d'Actions Réalisé</p>
                  <Badge variant="outline" className="mt-2">
                    {reportData.actionStats.completed}/{reportData.actionStats.total} actions
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-blue-500">{reportData.csrdProgress}%</p>
                  <p className="text-sm text-muted-foreground">Transition CSRD</p>
                  <Badge variant="outline" className="mt-2">Directive 2022/2464</Badge>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-amber-500">{reportData.regionalImpact.percentage}%</p>
                  <p className="text-sm text-muted-foreground">Impact Territorial</p>
                  <Badge variant="outline" className="mt-2">Loi 2018-35</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Position */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Position Sectorielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-full text-white font-medium ${getPositionLabel(reportData.benchmark.position).color}`}>
                  {getPositionLabel(reportData.benchmark.position).label}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Votre score de {reportData.esgScores.totalScore.toFixed(0)} vous place dans le{' '}
                    <strong>{getPositionLabel(reportData.benchmark.position).label}</strong> des entreprises du secteur{' '}
                    <strong>{reportData.sectorLabel}</strong>.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Moyenne sectorielle</p>
                  <p className="text-xl font-bold">{reportData.benchmark.avgScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Top 10%</p>
                  <p className="text-xl font-bold text-emerald-500">{reportData.benchmark.topScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Votre score</p>
                  <p className="text-xl font-bold text-primary">{reportData.esgScores.totalScore.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <RSEReportCharts reportData={reportData} />
        </TabsContent>

        {/* ESG Scores Tab */}
        <TabsContent value="esg" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['E', 'S', 'G'] as const).map(catId => {
              const config = CATEGORY_CONFIG[catId];
              const score = reportData.esgScores.categoryScores[catId] || 0;
              const category = reportData.categories.find(c => c.id === catId);
              const Icon = config.icon;
              
              return (
                <Card key={catId} className={`border-${config.color}-500/30`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`flex items-center gap-2 text-${config.color}-500`}>
                      <Icon className="h-5 w-5" />
                      {config.label}
                    </CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{score.toFixed(0)}/100</span>
                      <Badge variant="outline">
                        {reportData.actionStats.byCategory[catId].completed}/{reportData.actionStats.byCategory[catId].count} actions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={score} className="h-2 mb-4" />
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {category?.indicators.slice(0, 6).map(ind => (
                          <div key={ind.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground truncate max-w-[200px]">{ind.label}</span>
                            <span className="font-medium">
                              {ind.value !== undefined 
                                ? (ind.type === 'binary' ? (ind.value ? 'Oui' : 'Non') : `${Number(ind.value).toLocaleString('fr-FR')} ${ind.unit}`)
                                : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Weighting Info */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Pondération appliquée :</span>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    E: {reportData.weightingConfig.e.toFixed(0)}%
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    S: {reportData.weightingConfig.s.toFixed(0)}%
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    G: {reportData.weightingConfig.g.toFixed(0)}%
                  </Badge>
                </div>
                <Badge>
                  Mode: {reportData.weightingConfig.mode === 'standard' ? '⚖️ Standard' : reportData.weightingConfig.mode === 'sectoriel' ? '🏭 Sectoriel' : '🎯 Expert'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          {/* Action Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">{reportData.actionStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Actions</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30">
              <CardContent className="pt-4 text-center">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                <p className="text-2xl font-bold text-emerald-500">{reportData.actionStats.completed}</p>
                <p className="text-sm text-muted-foreground">Terminées</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30">
              <CardContent className="pt-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold text-blue-500">{reportData.actionStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{reportData.actionStats.todo}</p>
                <p className="text-sm text-muted-foreground">À faire</p>
              </CardContent>
            </Card>
            <Card className="border-red-500/30">
              <CardContent className="pt-4 text-center">
                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-2xl font-bold text-red-500">{reportData.actionStats.blocked}</p>
                <p className="text-sm text-muted-foreground">Bloquées</p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Suivi Budgétaire RSE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Budget Alloué</p>
                  <p className="text-xl font-bold">{formatCurrency(reportData.budgetStats.allocated)} TND</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-sm text-muted-foreground">Budget Consommé</p>
                  <p className="text-xl font-bold text-emerald-500">{formatCurrency(reportData.budgetStats.spent)} TND</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                  <p className="text-sm text-muted-foreground">Budget Restant</p>
                  <p className="text-xl font-bold text-blue-500">{formatCurrency(reportData.budgetStats.remaining)} TND</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-500/10">
                  <p className="text-sm text-muted-foreground">Taux d'Utilisation</p>
                  <p className="text-xl font-bold text-purple-500">{reportData.budgetStats.utilizationRate}%</p>
                </div>
              </div>
              <Progress value={reportData.budgetStats.utilizationRate} className="h-2" />
            </CardContent>
          </Card>

          {/* Actions by Pillar */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Pilier ESG</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['E', 'S', 'G'] as const).map(catId => {
                  const config = CATEGORY_CONFIG[catId];
                  const stats = reportData.actionStats.byCategory[catId];
                  const Icon = config.icon;
                  const progress = stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0;
                  
                  return (
                    <div key={catId} className={`p-4 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/30`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`h-5 w-5 text-${config.color}-500`} />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stats.completed}/{stats.count} actions</span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Regional Impact */}
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <MapPin className="h-5 w-5" />
                Impact Territorial (Loi 2018-35)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">{reportData.regionalImpact.actionsCount}</p>
                  <p className="text-sm text-muted-foreground">Actions régionales</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{reportData.regionalImpact.percentage}%</p>
                  <p className="text-sm text-muted-foreground">du portefeuille</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-500">{formatCurrency(reportData.regionalImpact.co2Reduction)}</p>
                  <p className="text-sm text-muted-foreground">tCO₂e évitées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {/* Regulatory Framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🇹🇳 Réglementation Tunisienne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.regulatoryFramework.tunisian.map(reg => (
                    <div key={reg.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{reg.name}</p>
                        <p className="text-sm text-muted-foreground">{reg.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌍 Référentiels Internationaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.regulatoryFramework.international.map(reg => (
                    <div key={reg.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{reg.name}</p>
                        <p className="text-sm text-muted-foreground">{reg.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes de Conformité
              </CardTitle>
              <CardDescription>
                Points d'attention identifiés automatiquement par le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.complianceAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <p>Aucune alerte de conformité détectée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportData.complianceAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border ${
                        alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                        alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                        alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
                        {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />}
                        {alert.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />}
                        {alert.type === 'info' && <Shield className="h-5 w-5 text-blue-500 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <Badge variant="outline" className="mt-2">{alert.regulation}</Badge>
                          {alert.action && (
                            <p className="text-sm mt-2 text-primary font-medium">→ {alert.action}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tableau des Indicateurs ESG</CardTitle>
              <CardDescription>
                32 KPIs conformes au Guide BVMT et aux standards internationaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reportData.categories.map(category => {
                  const config = CATEGORY_CONFIG[category.id as 'E' | 'S' | 'G'];
                  const Icon = config.icon;
                  
                  return (
                    <div key={category.id}>
                      <div className={`flex items-center gap-2 mb-3 text-${config.color}-500`}>
                        <Icon className="h-5 w-5" />
                        <h3 className="font-semibold">{category.label}</h3>
                        <Badge variant="outline">{category.indicators.length} indicateurs</Badge>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">ID</th>
                              <th className="text-left py-2 font-medium">Indicateur</th>
                              <th className="text-right py-2 font-medium">Valeur</th>
                              <th className="text-center py-2 font-medium">Unité</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.indicators.map(ind => (
                              <tr key={ind.id} className="border-b border-border/50">
                                <td className="py-2 text-muted-foreground">{ind.id}</td>
                                <td className="py-2">{ind.label}</td>
                                <td className="py-2 text-right font-medium">
                                  {ind.value !== undefined 
                                    ? (ind.type === 'binary' 
                                        ? (ind.value ? '✓' : '✗') 
                                        : Number(ind.value).toLocaleString('fr-FR'))
                                    : '—'}
                                </td>
                                <td className="py-2 text-center text-muted-foreground">{ind.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methodology Tab */}
        <TabsContent value="methodology" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Formule de Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                  {reportData.methodology.scoringFormula}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reportData.methodology.weights}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source des Données</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {reportData.methodology.dataSource}
                </p>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">
                  Rapport généré le {formatDate(reportData.reportGeneratedAt)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Limites Méthodologiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {reportData.methodology.limitations.map((limitation, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-500 mt-1">•</span>
                    {limitation}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Périmètre du Rapport</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entité</span>
                <span className="font-medium">{reportData.companyName}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Secteur</span>
                <span className="font-medium">{reportData.sectorLabel}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Exercice fiscal</span>
                <span className="font-medium">{reportData.fiscalYear}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chiffre d'affaires</span>
                <span className="font-medium">{formatCurrency(reportData.revenue)} TND</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RSEReportViewer;

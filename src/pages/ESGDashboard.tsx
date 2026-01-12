import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Users, 
  Building2, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Target,
  TrendingUp,
  Droplets,
  BookOpen,
  RotateCcw,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ESGIndicatorForm } from '@/components/esg/ESGIndicatorForm';
import { ESGScoreGauges } from '@/components/esg/ESGScoreGauges';
import { ESGMaterialityMatrix } from '@/components/esg/ESGMaterialityMatrix';
import { ESGComplianceAlerts } from '@/components/esg/ESGComplianceAlerts';
import { ESGSectorBenchmark } from '@/components/esg/ESGSectorBenchmark';
import { ESGPDFExport } from '@/components/esg/ESGPDFExport';
import { ESGMethodologyGuide } from '@/components/esg/ESGMethodologyGuide';
import { ESGWeightingConfig, WeightingConfig } from '@/components/esg/ESGWeightingConfig';
import { ESGMaterialityTable, MaterialityIssue } from '@/components/esg/ESGMaterialityTable';
import { ESGMaterialityBubbleChart } from '@/components/esg/ESGMaterialityBubbleChart';
import { useESGMateriality } from '@/hooks/useESGMateriality';
import { 
  ESGData, 
  ESGCategory, 
  BVMT_ESG_SCHEMA, 
  TUNISIAN_SECTORS,
  MaterialityPoint,
  ComplianceAlert
} from '@/lib/esg/types';
import { 
  calculateAutomaticKPIs, 
  calculateTotalScore, 
  generateMaterialityMatrix,
  generateComplianceAlerts
} from '@/lib/esg/scoringEngine';

const ESGDashboard: React.FC = () => {
  // ESG Materiality hook
  const {
    issues,
    weightingConfig,
    isLoading,
    addIssue,
    updateIssue,
    deleteIssue,
    saveWeightingConfig,
  } = useESGMateriality();

  // Initialize ESG data state
  const [esgData, setEsgData] = useState<ESGData>(() => {
    const stored = localStorage.getItem('esg-dashboard-data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getInitialData();
      }
    }
    return getInitialData();
  });

  const [scores, setScores] = useState<{
    totalScore: number;
    categoryScores: Record<string, number>;
    grade: string;
    gradeColor: string;
    gradeLabel: string;
  }>({ totalScore: 0, categoryScores: {}, grade: 'CCC', gradeColor: '', gradeLabel: '' });

  const [legacyMaterialityData, setLegacyMaterialityData] = useState<MaterialityPoint[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);

  function getInitialData(): ESGData {
    return {
      companyName: '',
      sector: 'services',
      fiscalYear: new Date().getFullYear(),
      revenue: 0,
      categories: JSON.parse(JSON.stringify(BVMT_ESG_SCHEMA)),
    };
  }

  const handleReset = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ESG ?')) {
      setEsgData(getInitialData());
      localStorage.removeItem('esg-dashboard-data');
    }
  }, []);

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('esg-dashboard-data', JSON.stringify(esgData));
  }, [esgData]);

  // Recalculate scores when data or weighting changes
  useEffect(() => {
    // Calculate automatic KPIs
    const updatedCategories = calculateAutomaticKPIs(esgData.categories, esgData.revenue);
    
    // Build custom weights from weighting config
    const customWeights = {
      e: weightingConfig.environmentWeight,
      s: weightingConfig.socialWeight,
      g: weightingConfig.governanceWeight,
    };
    
    // Calculate scores with custom weights
    const newScores = calculateTotalScore(updatedCategories, esgData.sector, customWeights);
    setScores(newScores);

    // Generate legacy materiality matrix for BVMT indicators
    const matrixData = generateMaterialityMatrix(updatedCategories);
    setLegacyMaterialityData(matrixData);

    // Generate compliance alerts
    const alerts = generateComplianceAlerts(
      { ...esgData, categories: updatedCategories },
      newScores.categoryScores
    );
    setComplianceAlerts(alerts);
  }, [esgData, weightingConfig]);

  const handleIndicatorChange = useCallback((categoryId: string, indicatorId: string, value: number | boolean) => {
    setEsgData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          indicators: cat.indicators.map(ind => {
            if (ind.id !== indicatorId) return ind;
            return { ...ind, value };
          }),
        };
      }),
    }));
  }, []);

  const handleCompanyInfoChange = useCallback((field: keyof ESGData, value: string | number) => {
    setEsgData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Get updated categories with calculated KPIs for display
  const displayCategories = calculateAutomaticKPIs(esgData.categories, esgData.revenue);

  return (
    <>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Leaf className="h-8 w-8 text-emerald-500" />
              </div>
              Scoring ESG Tunisie
            </h1>
            <p className="text-muted-foreground mt-1">
              Conforme au Guide BVMT, Loi RSE 2018-35, CSRD & MACF
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <Droplets className="h-3 w-3 mr-1 text-blue-500" />
              Stress Hydrique TN
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              32 KPIs BVMT
            </Badge>
            <Badge className="bg-emerald-500 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Édition 2025
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Company Info Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informations Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Nom de l'entreprise</Label>
                <Input
                  value={esgData.companyName}
                  onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
                  placeholder="Ex: Société ABC"
                />
              </div>
              <div className="space-y-2">
                <Label>Secteur d'activité</Label>
                <Select
                  value={esgData.sector}
                  onValueChange={(v) => handleCompanyInfoChange('sector', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TUNISIAN_SECTORS.map((sector) => (
                      <SelectItem key={sector.value} value={sector.value}>
                        {sector.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exercice fiscal</Label>
                <Select
                  value={esgData.fiscalYear.toString()}
                  onValueChange={(v) => handleCompanyInfoChange('fiscalYear', parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2024, 2023, 2022].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chiffre d'Affaires (TND)</Label>
                <Input
                  type="number"
                  value={esgData.revenue || ''}
                  onChange={(e) => handleCompanyInfoChange('revenue', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 15000000"
                />
              </div>
            </div>
            {(esgData.sector === 'textile' || esgData.sector === 'agroalimentaire') && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  <strong>Pondération sectorielle active :</strong> Les indicateurs Eau (E4, E5) et Déchets (E9, E10) ont un poids multiplié par 1,5x pour ce secteur.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="scoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Scoring</span>
            </TabsTrigger>
            <TabsTrigger value="weighting" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Pondérations</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Indicateurs</span>
            </TabsTrigger>
            <TabsTrigger value="materiality" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Matérialité</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Conformité</span>
            </TabsTrigger>
            <TabsTrigger value="methodology" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Méthodologie</span>
            </TabsTrigger>
          </TabsList>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            {/* Current Weighting Display */}
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">Pondération active :</span>
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      E: {weightingConfig.environmentWeight.toFixed(0)}%
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      S: {weightingConfig.socialWeight.toFixed(0)}%
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      G: {weightingConfig.governanceWeight.toFixed(0)}%
                    </Badge>
                  </div>
                  <Badge>
                    Mode: {weightingConfig.mode === 'standard' ? '⚖️ Standard' : weightingConfig.mode === 'sectoriel' ? '🏭 Sectoriel' : '🎯 Expert'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ESGScoreGauges
                eScore={scores.categoryScores.E || 0}
                sScore={scores.categoryScores.S || 0}
                gScore={scores.categoryScores.G || 0}
                totalScore={scores.totalScore}
                grade={scores.grade}
                gradeColor={scores.gradeColor}
                gradeLabel={scores.gradeLabel}
              />
              <ESGSectorBenchmark
                sector={esgData.sector}
                userScore={scores.totalScore}
                categoryScores={scores.categoryScores}
              />
              <ESGPDFExport
                data={esgData}
                totalScore={scores.totalScore}
                grade={scores.grade}
                categoryScores={scores.categoryScores}
              />
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Environnement</p>
                      <p className="text-2xl font-bold">{(scores.categoryScores.E || 0).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Social</p>
                      <p className="text-2xl font-bold">{(scores.categoryScores.S || 0).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-purple-500/30 bg-purple-500/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gouvernance</p>
                      <p className="text-2xl font-bold">{(scores.categoryScores.G || 0).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Score Global</p>
                      <p className="text-2xl font-bold">{scores.totalScore.toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weighting Configuration Tab */}
          <TabsContent value="weighting" className="space-y-6">
            <ESGWeightingConfig
              config={weightingConfig}
              onConfigChange={saveWeightingConfig}
            />
            
            <Card className="border-border/50 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Impact des pondérations sur le score</CardTitle>
                <CardDescription>
                  Visualisez comment les pondérations affectent votre score ESG global
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-emerald-500/10">
                    <p className="text-sm text-muted-foreground mb-1">Contribution E</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {((scores.categoryScores.E || 0) * weightingConfig.environmentWeight / 100).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(scores.categoryScores.E || 0).toFixed(0)} × {weightingConfig.environmentWeight.toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10">
                    <p className="text-sm text-muted-foreground mb-1">Contribution S</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {((scores.categoryScores.S || 0) * weightingConfig.socialWeight / 100).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(scores.categoryScores.S || 0).toFixed(0)} × {weightingConfig.socialWeight.toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10">
                    <p className="text-sm text-muted-foreground mb-1">Contribution G</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {((scores.categoryScores.G || 0) * weightingConfig.governanceWeight / 100).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(scores.categoryScores.G || 0).toFixed(0)} × {weightingConfig.governanceWeight.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators">
            <ESGIndicatorForm
              categories={displayCategories}
              revenue={esgData.revenue}
              onIndicatorChange={handleIndicatorChange}
              onRevenueChange={(revenue) => handleCompanyInfoChange('revenue', revenue)}
            />
          </TabsContent>

          {/* Materiality Tab - NEW Interactive CRUD */}
          <TabsContent value="materiality" className="space-y-6">
            <ESGMaterialityTable
              issues={issues}
              onAddIssue={addIssue}
              onUpdateIssue={updateIssue}
              onDeleteIssue={deleteIssue}
            />
            
            <ESGMaterialityBubbleChart issues={issues} />

            {/* Legacy BVMT Matrix */}
            {legacyMaterialityData.length > 0 && (
              <>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    Matrice BVMT (32 KPIs standards)
                  </h3>
                  <ESGMaterialityMatrix data={legacyMaterialityData} />
                </div>
              </>
            )}

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Méthodologie Double Matérialité</CardTitle>
                <CardDescription>
                  Conformément à la directive CSRD de l'Union Européenne
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  La <strong>double matérialité</strong> évalue chaque enjeu ESG selon deux dimensions :
                </p>
                <ul>
                  <li><strong>Matérialité d'impact</strong> : Effet de l'entreprise sur l'environnement et la société</li>
                  <li><strong>Matérialité financière</strong> : Risques et opportunités pour la valeur de l'entreprise</li>
                </ul>
                <p>
                  Les enjeux situés dans le <span className="text-destructive font-medium">quadrant supérieur droit</span> sont 
                  prioritaires car ils présentent à la fois un fort impact environnemental et un risque financier significatif.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ESGComplianceAlerts alerts={complianceAlerts} />
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Cadre Réglementaire</CardTitle>
                  <CardDescription>
                    Réglementations applicables à votre entreprise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      🇹🇳 Tunisie
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Loi RSE 2018-35 (Entreprises &gt; 100 employés)</li>
                      <li>• Guide Reporting ESG - Bourse de Tunis (BVMT)</li>
                      <li>• Plan National de l'Eau 2050</li>
                      <li>• Circulaire BCT 2023-08 (Crédits verts)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      🇪🇺 Union Européenne (Export)
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• CSRD - Corporate Sustainability Reporting Directive</li>
                      <li>• MACF - Mécanisme d'Ajustement Carbone aux Frontières</li>
                      <li>• Taxonomie verte européenne</li>
                      <li>• IFRS S1/S2 Sustainability Standards</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      🌍 International
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• GRI Standards (Global Reporting Initiative)</li>
                      <li>• SASB (Sustainability Accounting Standards)</li>
                      <li>• TCFD (Task Force on Climate-related Financial Disclosures)</li>
                      <li>• CDP (Carbon Disclosure Project)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Methodology Tab */}
          <TabsContent value="methodology">
            <ESGMethodologyGuide />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ESGDashboard;

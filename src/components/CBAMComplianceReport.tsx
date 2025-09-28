import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Scale,
  Calculator,
  BookOpen,
  Target,
  Zap,
  Factory,
  Leaf,
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react';
import { CBAMComplianceReport } from '@/services/cbamRegulatoryEngine';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CBAMComplianceReportProps {
  report: CBAMComplianceReport;
  onExport?: () => void;
}

export const CBAMComplianceReportComponent: React.FC<CBAMComplianceReportProps> = ({ 
  report, 
  onExport 
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch(status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'non_compliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Données pour graphiques
  const emissionsData = [
    {
      name: 'Scope 1',
      emissions: report.detailed_calculations.scope1_direct.total,
      uncertainty: report.detailed_calculations.scope1_direct.uncertainty_expanded,
      color: '#ef4444'
    },
    {
      name: 'Scope 2', 
      emissions: report.detailed_calculations.scope2_indirect.total,
      uncertainty: report.detailed_calculations.scope2_indirect.uncertainty_expanded,
      color: '#f97316'
    },
    {
      name: 'Scope 3',
      emissions: report.detailed_calculations.scope3_precursors.total,
      uncertainty: report.detailed_calculations.scope3_precursors.uncertainty_expanded,
      color: '#3b82f6'
    }
  ];

  const uncertaintyBudgetData = report.summary.uncertainty_budget.map((item, index) => ({
    name: item.component,
    value: item.contribution_percent,
    color: ['#ef4444', '#f97316', '#3b82f6'][index] || '#6b7280'
  }));

  const timelineData = report.recommendations.map((rec, index) => ({
    action: rec.description.substring(0, 30) + '...',
    timeline: rec.timeline,
    priority: rec.priority,
    cost: rec.implementation_cost
  }));

  return (
    <div className="space-y-6">
      {/* En-tête du rapport */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Rapport de Conformité CBAM
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Conforme au règlement UE 2023/956 et GHG Protocol
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  {report.detailed_calculations.calculation_metadata.regulation_version}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {report.detailed_calculations.calculation_metadata.ghg_protocol_version}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calculator className="h-3 w-3" />
                  GUM ISO/IEC 98-3
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                className={`text-lg px-4 py-2 ${getRiskColor(report.summary.regulatory_risk_level)}`}
              >
                Risque: {report.summary.regulatory_risk_level.toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Score: {report.summary.compliance_score}/100
              </p>
              <Button onClick={onExport} className="mt-2" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">📊 Résumé</TabsTrigger>
          <TabsTrigger value="calculations">🧮 Calculs</TabsTrigger>
          <TabsTrigger value="uncertainty">📈 Incertitudes</TabsTrigger>
          <TabsTrigger value="quality">✅ Qualité</TabsTrigger>
          <TabsTrigger value="compliance">⚖️ Conformité</TabsTrigger>
          <TabsTrigger value="recommendations">💡 Actions</TabsTrigger>
        </TabsList>

        {/* Onglet Résumé */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Factory className="h-5 w-5 text-blue-600" />
                  Émissions Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {report.summary.total_emissions.toFixed(3)} tCO₂e
                </div>
                <p className="text-sm text-muted-foreground">
                  ± {((report.detailed_calculations.total_uncertainty_expanded / report.summary.total_emissions) * 100).toFixed(1)}% (k=2, 95%)
                </p>
                <div className="mt-4">
                  <div className="text-sm font-medium mb-1">Intensité carbone</div>
                  <div className="text-lg font-semibold">
                    {report.summary.emissions_intensity.toFixed(4)} tCO₂e/tonne
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Score Conformité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-green-600">
                    {report.summary.compliance_score}/100
                  </div>
                  <Progress value={report.summary.compliance_score} className="w-full" />
                  <Badge className={getRiskColor(report.summary.regulatory_risk_level)}>
                    Risque réglementaire: {report.summary.regulatory_risk_level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="h-5 w-5 text-yellow-600" />
                  Impact Financier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Coût carbone estimé</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {(report.summary.total_emissions * 68.45).toFixed(0)} €
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Prix EEX: 68,45€/tCO₂
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Potentiel économies</div>
                    <div className="text-lg font-semibold text-green-600">
                      15-30% possible
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphique répartition émissions */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Émissions par Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${Number(value).toFixed(3)} tCO₂e`, 
                        name === 'emissions' ? 'Émissions' : 'Incertitude'
                      ]}
                    />
                    <Bar dataKey="emissions" fill="#3b82f6" name="Émissions" />
                    <Bar dataKey="uncertainty" fill="#ef4444" name="Incertitude (U, k=2)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Calculs Détaillés */}
        <TabsContent value="calculations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scope 1 */}
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Scope 1 - Direct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Combustion</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.scope1_direct.combustion_emissions.toFixed(3)} tCO₂e
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Procédés</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.scope1_direct.process_emissions.toFixed(3)} tCO₂e
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium">Total Scope 1</div>
                  <div className="text-2xl font-bold text-red-600">
                    {report.detailed_calculations.scope1_direct.total.toFixed(3)} tCO₂e
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ± {report.detailed_calculations.scope1_direct.uncertainty_expanded.toFixed(3)} tCO₂e (U, k={report.detailed_calculations.scope1_direct.coverage_factor.toFixed(1)})
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-xs font-medium">Méthode:</div>
                  <div className="text-sm">{report.detailed_calculations.calculation_method}</div>
                  <div className="text-xs mt-1">
                    Article 7.1 - Émissions directes de combustion et procédés
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scope 2 */}
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Scope 2 - Indirect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Électricité</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.scope2_indirect.electricity_emissions.toFixed(3)} tCO₂e
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Chaleur & Vapeur</div>
                  <div className="text-xl font-bold">
                    {(report.detailed_calculations.scope2_indirect.heat_emissions + report.detailed_calculations.scope2_indirect.steam_emissions).toFixed(3)} tCO₂e
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium">Total Scope 2</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {report.detailed_calculations.scope2_indirect.total.toFixed(3)} tCO₂e
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ± {report.detailed_calculations.scope2_indirect.uncertainty_expanded.toFixed(3)} tCO₂e (U, k={report.detailed_calculations.scope2_indirect.coverage_factor.toFixed(1)})
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-xs font-medium">Facteur réseau:</div>
                  <div className="text-sm">Spécifique pays d'origine</div>
                  <div className="text-xs mt-1">
                    Article 7.2 - Émissions indirectes énergétiques
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scope 3 */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Scope 3 - Précurseurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Matières premières</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.scope3_precursors.raw_materials.toFixed(3)} tCO₂e
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Matières auxiliaires</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.scope3_precursors.auxiliary_materials.toFixed(3)} tCO₂e
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium">Total Scope 3</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {report.detailed_calculations.scope3_precursors.total.toFixed(3)} tCO₂e
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ± {report.detailed_calculations.scope3_precursors.uncertainty_expanded.toFixed(3)} tCO₂e (U, k={report.detailed_calculations.scope3_precursors.coverage_factor.toFixed(1)})
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs font-medium">Périmètre:</div>
                  <div className="text-sm">Précurseurs significatifs</div>
                  <div className="text-xs mt-1">
                    Selon définition CBAM - Annexe I
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Traçabilité des Calculs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.detailed_calculations.calculation_metadata.audit_trail.slice(0, 5).map((step, index) => (
                  <div key={index} className="border-l-4 border-primary/30 pl-4 py-2">
                    <div className="font-medium text-sm">{step.step}</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Formule: {step.formula}
                    </div>
                    <div className="text-xs">
                      Propagation: {step.uncertainty_propagation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Budget d'Incertitude */}
        <TabsContent value="uncertainty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget d'Incertitudes (Méthode GUM)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyse de la contribution de chaque composant à l'incertitude totale
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={uncertaintyBudgetData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {uncertaintyBudgetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {report.summary.uncertainty_budget.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.component}</h4>
                        <Badge variant="outline">
                          {item.contribution_percent.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={item.contribution_percent} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        💡 {item.improvement_potential}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Statistiques GUM */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm font-medium">Incertitude Standard</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.total_uncertainty_standard.toFixed(3)} tCO₂e
                  </div>
                  <div className="text-xs text-muted-foreground">u (1σ)</div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium">Incertitude Élargie</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.total_uncertainty_expanded.toFixed(3)} tCO₂e
                  </div>
                  <div className="text-xs text-muted-foreground">U (k=2, 95%)</div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium">Degrés Liberté</div>
                  <div className="text-xl font-bold">
                    {report.detailed_calculations.scope1_direct.effective_degrees_freedom.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">νeff (Welch-Satterthwaite)</div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium">Incertitude Relative</div>
                  <div className="text-xl font-bold">
                    {((report.detailed_calculations.total_uncertainty_expanded / report.summary.total_emissions) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">U/résultat × 100</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Qualité des Données */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Couverture des Données Primaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Données mesurées</span>
                      <span>{report.data_quality_assessment.primary_data_coverage}%</span>
                    </div>
                    <Progress value={report.data_quality_assessment.primary_data_coverage} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Valeurs par défaut</span>
                      <span>{report.data_quality_assessment.default_values_used}%</span>
                    </div>
                    <Progress value={report.data_quality_assessment.default_values_used} className="[&>div]:bg-orange-500" />
                  </div>
                  
                  <div className="mt-4">
                    <Badge variant="outline" className="mb-2">
                      Niveau de vérification: {report.data_quality_assessment.verification_level}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Techniques de mesure: {report.data_quality_assessment.measurement_techniques.join(', ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs de Qualité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.data_quality_assessment.quality_indicators.map((indicator, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{indicator.parameter}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full mx-0.5 ${
                                i < indicator.quality_score ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Actions d'amélioration:
                      </div>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {indicator.improvement_actions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Conformité Réglementaire */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>État de Conformité Réglementaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.regulatory_references.map((ref, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    {getComplianceIcon(ref.compliance_status)}
                    <div className="flex-1">
                      <div className="font-medium">{ref.regulation} - {ref.article}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {ref.requirement}
                      </div>
                      <Badge 
                        className={
                          ref.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' :
                          ref.compliance_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {ref.compliance_status === 'compliant' ? 'Conforme' :
                         ref.compliance_status === 'partial' ? 'Partiellement conforme' :
                         'Non conforme'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sources Réglementaires Utilisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.detailed_calculations.calculation_metadata.data_sources.map((source, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{source}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Recommandations */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {report.recommendations.map((rec, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg pr-4">{rec.description}</CardTitle>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">Amélioration potentielle</div>
                      <div className="text-sm text-muted-foreground">{rec.potential_improvement}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="text-sm font-medium">Coût d'implémentation</div>
                      <div className="text-sm text-muted-foreground">
                        {rec.implementation_cost === 'low' ? 'Faible' :
                         rec.implementation_cost === 'medium' ? 'Moyen' : 'Élevé'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Délai</div>
                      <div className="text-sm text-muted-foreground">{rec.timeline}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Badge variant="outline">
                      {rec.category === 'data_quality' ? 'Qualité données' :
                       rec.category === 'measurement' ? 'Métrologie' :
                       rec.category === 'verification' ? 'Vérification' :
                       'Conformité'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CBAMComplianceReportComponent;
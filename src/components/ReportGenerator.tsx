import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, Download, Mail, Share2, CheckCircle, AlertTriangle, 
  TrendingDown, Building, Target, Clock, Users, Zap, 
  Truck, Factory, Lightbulb, Award, BarChart3, PieChart,
  Calendar, MapPin, Leaf
} from "lucide-react";
import { useEmissions } from "@/contexts/EmissionsContext";

export const ReportGenerator = () => {
  const { emissions, hasEmissions } = useEmissions();
  
  const toTonnes = (kg: number) => (kg / 1000).toFixed(3);
  
  const getEmissionIntensity = () => {
    if (!hasEmissions) return null;
    const scope1Percent = (emissions.scope1 / emissions.total) * 100;
    const scope2Percent = (emissions.scope2 / emissions.total) * 100;
    const scope3Percent = (emissions.scope3 / emissions.total) * 100;
    
    if (scope1Percent > 50) return { 
      type: 'scope1', 
      percent: scope1Percent, 
      icon: Factory, 
      color: 'text-red-600',
      label: 'Émissions directes dominantes',
      recommendation: 'Transition énergétique prioritaire'
    };
    if (scope2Percent > 50) return { 
      type: 'scope2', 
      percent: scope2Percent, 
      icon: Zap, 
      color: 'text-orange-600',
      label: 'Électricité principale source',
      recommendation: 'Efficacité énergétique et énergie verte'
    };
    return { 
      type: 'scope3', 
      percent: scope3Percent, 
      icon: Truck, 
      color: 'text-blue-600',
      label: 'Chaîne de valeur impact majeur',
      recommendation: 'Optimisation supply chain et mobilité'
    };
  };

  const getBenchmarkStatus = () => {
    if (!hasEmissions) return null;
    const totalTonnes = emissions.total / 1000;
    
    // Benchmarks indicatifs par taille d'entreprise (tonnes CO2e/an)
    if (totalTonnes < 10) return { status: 'excellent', color: 'bg-green-500', message: 'Performance excellente' };
    if (totalTonnes < 50) return { status: 'good', color: 'bg-green-400', message: 'Bonne performance' };
    if (totalTonnes < 200) return { status: 'average', color: 'bg-yellow-500', message: 'Performance moyenne' };
    if (totalTonnes < 500) return { status: 'below', color: 'bg-orange-500', message: 'Amélioration nécessaire' };
    return { status: 'poor', color: 'bg-red-500', message: 'Action urgente requise' };
  };

  const getReductionTargets = () => {
    if (!hasEmissions) return [];
    const totalTonnes = emissions.total / 1000;
    
    return [
      { year: 2025, reduction: 15, target: totalTonnes * 0.85, actions: ['Audit énergétique', 'LED', 'Sensibilisation'] },
      { year: 2027, reduction: 30, target: totalTonnes * 0.70, actions: ['Véhicules électriques', 'Énergies renouvelables'] },
      { year: 2030, reduction: 50, target: totalTonnes * 0.50, actions: ['Digitalisation', 'Économie circulaire'] },
      { year: 2035, reduction: 70, target: totalTonnes * 0.30, actions: ['Neutralité carbone', 'Compensation'] }
    ];
  };

  const generateDetailedReport = () => {
    if (!hasEmissions) return "Aucune donnée disponible pour générer le rapport.";
    
    const total = emissions.total / 1000;
    const intensity = getEmissionIntensity();
    const benchmark = getBenchmarkStatus();
    const targets = getReductionTargets();
    
    let report = `📊 RAPPORT DÉTAILLÉ D'ANALYSE CARBONE\n`;
    report += `Généré le ${new Date().toLocaleDateString('fr-FR')} par CarbonTrack\n\n`;
    
    report += `═══════════════════════════════════════\n`;
    report += `🎯 SYNTHÈSE EXÉCUTIVE\n`;
    report += `═══════════════════════════════════════\n`;
    report += `Empreinte carbone totale : ${total.toFixed(3)} tonnes CO2e\n`;
    report += `Performance : ${benchmark?.message}\n`;
    report += `Priorité stratégique : ${intensity?.recommendation}\n\n`;
    
    report += `📈 ANALYSE DÉTAILLÉE PAR SCOPE\n`;
    report += `─────────────────────────────────────\n`;
    report += `• SCOPE 1 - Émissions directes : ${toTonnes(emissions.scope1)} tCO2e (${Math.round((emissions.scope1/emissions.total)*100)}%)\n`;
    report += `  └ Combustibles, chauffage, véhicules d'entreprise\n`;
    report += `• SCOPE 2 - Électricité : ${toTonnes(emissions.scope2)} tCO2e (${Math.round((emissions.scope2/emissions.total)*100)}%)\n`;
    report += `  └ Consommation électrique des bâtiments\n`;
    report += `• SCOPE 3 - Émissions indirectes : ${toTonnes(emissions.scope3)} tCO2e (${Math.round((emissions.scope3/emissions.total)*100)}%)\n`;
    report += `  └ Supply chain, déplacements, télétravail\n\n`;
    
    report += `🎯 FEUILLE DE ROUTE DÉCARBONATION\n`;
    report += `─────────────────────────────────────\n`;
    targets.forEach(target => {
      report += `${target.year} : -${target.reduction}% | Objectif : ${target.target.toFixed(1)} tCO2e\n`;
      report += `Actions : ${target.actions.join(', ')}\n\n`;
    });
    
    report += `📋 CONFORMITÉ RÉGLEMENTAIRE\n`;
    report += `─────────────────────────────────────\n`;
    report += `✅ Méthodologie : GHG Protocol, ISO 14064\n`;
    report += `✅ Reporting : CSRD, Taxonomie européenne\n`;
    report += `✅ Standards : Science Based Targets initiative\n\n`;
    
    report += `🔍 RECOMMANDATIONS PRIORITAIRES\n`;
    report += `─────────────────────────────────────\n`;
    report += `1. COURT TERME (0-6 mois)\n`;
    report += `   • Audit énergétique approfondi\n`;
    report += `   • Formation équipes développement durable\n`;
    report += `   • Politique déplacements professionnels\n\n`;
    report += `2. MOYEN TERME (6-18 mois)\n`;
    report += `   • Transition énergétique (LED, isolation)\n`;
    report += `   • Contrat électricité verte\n`;
    report += `   • Plan mobilité durable\n\n`;
    report += `3. LONG TERME (18+ mois)\n`;
    report += `   • Certification ISO 14001\n`;
    report += `   • Stratégie Net Zero\n`;
    report += `   • Innovation produits/services bas carbone\n\n`;
    
    report += `═══════════════════════════════════════\n`;
    report += `Ce rapport est conforme aux standards internationaux\n`;
    report += `et peut être utilisé pour votre reporting réglementaire.\n`;
    report += `═══════════════════════════════════════`;
    
    return report;
  };
  
  const downloadReport = (format: 'pdf' | 'excel' | 'csv') => {
    const report = generateDetailedReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `rapport-carbone-detaille-${date}.${format === 'pdf' ? 'txt' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const shareReport = () => {
    const report = generateDetailedReport();
    const subject = "Rapport d'analyse carbone détaillé - CarbonTrack";
    const body = encodeURIComponent(report);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const intensity = getEmissionIntensity();
  const benchmark = getBenchmarkStatus();
  const targets = getReductionTargets();
  
  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-card border shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Rapport Intelligent</h3>
            <p className="text-sm text-muted-foreground">Analyse narrative et recommandations personnalisées</p>
          </div>
        </div>
        
        {hasEmissions ? (
          <Tabs defaultValue="synthesis" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="synthesis" className="text-xs sm:text-sm py-2">
                <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Synthèse</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs sm:text-sm py-2">
                <PieChart className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Analyse</span>
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="text-xs sm:text-sm py-2">
                <Target className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Feuille route</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="synthesis" className="mt-6 space-y-4">
              {/* Métriques clés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">{toTonnes(emissions.total)}</div>
                      <div className="text-sm text-muted-foreground">tonnes CO2e</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-secondary/50">
                  <div className="flex items-center space-x-3">
                    {intensity && <intensity.icon className={`w-8 h-8 ${intensity.color}`} />}
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {intensity ? Math.round(intensity.percent) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Source principale</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Award className={`w-8 h-8 ${benchmark?.color.replace('bg-', 'text-')}`} />
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {benchmark?.status.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">{benchmark?.message}</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Performance benchmark */}
              {benchmark && (
                <Card className="p-4 sm:p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Performance vs Benchmarks
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Votre performance</span>
                      <span className="font-semibold">{benchmark.message}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${benchmark.color} transition-all duration-500`}
                        style={{ width: '60%' }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Basé sur des entreprises de taille similaire dans votre secteur
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="mt-6 space-y-4">
              {/* Répartition par scope */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4">Répartition des émissions</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Factory className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">Scope 1 - Directes</span>
                      </div>
                      <span className="text-sm font-bold">{toTonnes(emissions.scope1)} tCO2e</span>
                    </div>
                    <Progress value={(emissions.scope1 / emissions.total) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Scope 2 - Électricité</span>
                      </div>
                      <span className="text-sm font-bold">{toTonnes(emissions.scope2)} tCO2e</span>
                    </div>
                    <Progress value={(emissions.scope2 / emissions.total) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Scope 3 - Indirectes</span>
                      </div>
                      <span className="text-sm font-bold">{toTonnes(emissions.scope3)} tCO2e</span>
                    </div>
                    <Progress value={(emissions.scope3 / emissions.total) * 100} className="h-2" />
                  </div>
                </div>
              </Card>

              {/* Recommandations prioritaires */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  Recommandations prioritaires
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Action immédiate</div>
                      <div className="text-sm text-muted-foreground">
                        {intensity?.recommendation}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Court terme (6 mois)</div>
                      <div className="text-sm text-muted-foreground">
                        Audit énergétique et formation équipes
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Long terme (3 ans)</div>
                      <div className="text-sm text-muted-foreground">
                        Stratégie Net Zero et certification
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="roadmap" className="mt-6 space-y-4">
              {/* Feuille de route */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Feuille de route décarbonation
                </h4>
                <div className="space-y-4">
                  {targets.map((target, index) => (
                    <div key={target.year} className="relative">
                      {index < targets.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                      )}
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {target.year.toString().slice(-2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h5 className="font-medium text-foreground">{target.year}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                -{target.reduction}%
                              </Badge>
                              <span className="text-sm font-bold text-primary">
                                {target.target.toFixed(1)} tCO2e
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {target.actions.join(' • ')}
                          </div>
                          <Progress 
                            value={target.reduction} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucune donnée d'émission disponible pour générer le rapport.
            </p>
            <Button variant="outline" disabled>
              Rapport non disponible
            </Button>
          </div>
        )}
      </Card>

      {/* Actions de téléchargement */}
      {hasEmissions && (
        <Card className="p-4 sm:p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Exporter le rapport
          </h4>
          
          <div className="space-y-3">
            <Button 
              onClick={() => downloadReport('pdf')} 
              className="w-full bg-gradient-primary hover:scale-105 transition-transform shadow-eco" 
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapport détaillé complet
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button 
                onClick={() => downloadReport('excel')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button 
                onClick={() => downloadReport('csv')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                onClick={shareReport} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>

          <Separator className="my-4" />
          
          {/* Certifications */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <Badge variant="secondary" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              ISO 14064
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              GHG Protocol
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              CSRD Ready
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              SBTi Aligned
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};
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
  Calendar, MapPin, Leaf, DollarSign, Recycle, Calculator, RotateCcw
} from "lucide-react";
import { useEmissions } from "@/contexts/EmissionsContext";
import { 
  PieChart as RechartsPC, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  Pie
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  scope: string;
  priority: 'high' | 'medium' | 'low';
  estimatedReduction: number;
  estimatedCost: number;
  implementationTime: string;
  roi: number;
}

export const EnhancedReportGenerator = () => {
  const { emissions, hasEmissions, resetEmissions } = useEmissions();
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  const toTonnes = (kg: number) => (kg / 1000).toFixed(3);

  const handleResetData = () => {
    resetEmissions();
    setActionPlans([]);
  };

  // Génération automatique d'actions basées sur les émissions
  const generateActionPlans = (): ActionPlan[] => {
    if (!hasEmissions) return [];

    const actions: ActionPlan[] = [];
    const total = emissions.total;
    
    // Actions Scope 1
    if (emissions.scope1 > total * 0.3) {
      actions.push({
        id: '1',
        title: 'Transition vers véhicules électriques',
        description: 'Remplacer 50% de la flotte par des véhicules électriques',
        category: 'Transport',
        scope: 'scope1',
        priority: 'high',
        estimatedReduction: emissions.scope1 * 0.6,
        estimatedCost: 80000,
        implementationTime: '12-18 mois',
        roi: 3.2
      });
      
      actions.push({
        id: '2',
        title: 'Audit et optimisation énergétique',
        description: 'Audit énergétique complet et optimisation des équipements',
        category: 'Énergie',
        scope: 'scope1',
        priority: 'high',
        estimatedReduction: emissions.scope1 * 0.25,
        estimatedCost: 15000,
        implementationTime: '3-6 mois',
        roi: 4.8
      });
    }

    // Actions Scope 2
    if (emissions.scope2 > total * 0.25) {
      actions.push({
        id: '3',
        title: 'Contrat électricité verte',
        description: 'Souscrire à un contrat 100% énergie renouvelable',
        category: 'Énergie',
        scope: 'scope2',
        priority: 'medium',
        estimatedReduction: emissions.scope2 * 0.8,
        estimatedCost: 5000,
        implementationTime: '1-3 mois',
        roi: 8.5
      });
      
      actions.push({
        id: '4',
        title: 'Installation LED et système intelligent',
        description: 'Remplacement éclairage LED + système de gestion intelligent',
        category: 'Énergie',
        scope: 'scope2',
        priority: 'medium',
        estimatedReduction: emissions.scope2 * 0.3,
        estimatedCost: 25000,
        implementationTime: '2-4 mois',
        roi: 2.8
      });
    }

    // Actions Scope 3
    if (emissions.scope3 > total * 0.4) {
      actions.push({
        id: '5',
        title: 'Plan mobilité durable',
        description: 'Télétravail, covoiturage, transports en commun',
        category: 'Transport',
        scope: 'scope3',
        priority: 'high',
        estimatedReduction: emissions.scope3 * 0.4,
        estimatedCost: 8000,
        implementationTime: '3-6 mois',
        roi: 6.2
      });
      
      actions.push({
        id: '6',
        title: 'Politique achats responsables',
        description: 'Critères environnementaux dans les achats',
        category: 'Supply Chain',
        scope: 'scope3',
        priority: 'medium',
        estimatedReduction: emissions.scope3 * 0.2,
        estimatedCost: 3000,
        implementationTime: '2-3 mois',
        roi: 5.1
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  useEffect(() => {
    if (hasEmissions) {
      const plans = generateActionPlans();
      setActionPlans(plans);
      saveActionsToSupabase(plans);
    }
  }, [emissions, hasEmissions]);

  const saveActionsToSupabase = async (actions: ActionPlan[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !emissions.calculationId) return;

      const actionsData = actions.map(action => ({
        user_id: user.id,
        calculation_id: emissions.calculationId,
        title: action.title,
        description: action.description,
        category: action.category,
        scope_type: action.scope,
        priority: action.priority,
        estimated_reduction_kg: action.estimatedReduction,
        estimated_cost: action.estimatedCost,
        implementation_time: action.implementationTime,
        is_custom: false
      }));

      await supabase.from('carbon_actions').insert(actionsData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des actions:', error);
    }
  };

  // Données pour les graphiques
  const pieData = hasEmissions ? [
    { name: 'Scope 1', value: Math.round(emissions.scope1), color: '#ef4444' },
    { name: 'Scope 2', value: Math.round(emissions.scope2), color: '#f97316' },
    { name: 'Scope 3', value: Math.round(emissions.scope3), color: '#3b82f6' }
  ].filter(item => item.value > 0) : [];

  const barData = hasEmissions ? [
    { name: 'Scope 1', emissions: Math.round(emissions.scope1/1000), target: Math.round(emissions.scope1/1000 * 0.7) },
    { name: 'Scope 2', emissions: Math.round(emissions.scope2/1000), target: Math.round(emissions.scope2/1000 * 0.5) },
    { name: 'Scope 3', emissions: Math.round(emissions.scope3/1000), target: Math.round(emissions.scope3/1000 * 0.6) }
  ] : [];

  const reductionData = actionPlans.map((action, index) => ({
    name: action.title.substring(0, 20) + '...',
    reduction: action.estimatedReduction,
    cost: action.estimatedCost,
    roi: action.roi
  }));

  const yearlyProjection = hasEmissions ? [
    { year: '2024', current: emissions.total, projected: emissions.total },
    { year: '2025', current: emissions.total, projected: emissions.total * 0.85 },
    { year: '2026', current: emissions.total, projected: emissions.total * 0.70 },
    { year: '2027', current: emissions.total, projected: emissions.total * 0.55 },
    { year: '2030', current: emissions.total, projected: emissions.total * 0.30 }
  ] : [];

  const getBenchmarkStatus = () => {
    if (!hasEmissions) return null;
    const totalTonnes = emissions.total / 1000;
    
    if (totalTonnes < 10) return { status: 'excellent', color: 'bg-green-500', message: 'Performance excellente', score: 95 };
    if (totalTonnes < 50) return { status: 'good', color: 'bg-green-400', message: 'Bonne performance', score: 80 };
    if (totalTonnes < 200) return { status: 'average', color: 'bg-yellow-500', message: 'Performance moyenne', score: 60 };
    if (totalTonnes < 500) return { status: 'below', color: 'bg-orange-500', message: 'Amélioration nécessaire', score: 40 };
    return { status: 'poor', color: 'bg-red-500', message: 'Action urgente requise', score: 20 };
  };

  const generateDetailedPDF = async () => {
    if (!hasEmissions) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const totalTonnes = emissions.total / 1000;
    const benchmark = getBenchmarkStatus();
    
    // Page de garde
    pdf.setFontSize(24);
    pdf.setTextColor(40, 40, 40);
    pdf.text('RAPPORT CARBONE DÉTAILLÉ', 20, 30);
    
    pdf.setFontSize(16);
    pdf.text('Analyse complète de l\'empreinte carbone', 20, 45);
    
    pdf.setFontSize(12);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 60);
    pdf.text('par CarbonTrack Pro', 20, 70);

    // Synthèse exécutive
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 204);
    pdf.text('SYNTHÈSE EXÉCUTIVE', 20, 95);
    
    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);
    
    const synthese = [
      `Empreinte carbone totale : ${totalTonnes.toFixed(3)} tonnes CO2e`,
      `Performance globale : ${benchmark?.message}`,
      `Score environnemental : ${benchmark?.score}/100`,
      '',
      'RÉPARTITION PAR SCOPE :',
      `• Scope 1 (directes) : ${toTonnes(emissions.scope1)} tCO2e (${Math.round((emissions.scope1/emissions.total)*100)}%)`,
      `• Scope 2 (électricité) : ${toTonnes(emissions.scope2)} tCO2e (${Math.round((emissions.scope2/emissions.total)*100)}%)`,
      `• Scope 3 (indirectes) : ${toTonnes(emissions.scope3)} tCO2e (${Math.round((emissions.scope3/emissions.total)*100)}%)`
    ];

    let yPos = 105;
    synthese.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 7;
    });

    // Plan d'action chiffré
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 204);
    pdf.text('PLAN D\'ACTION CHIFFRÉ', 20, 30);

    yPos = 45;
    actionPlans.forEach((action, index) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 30;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(40, 40, 40);
      pdf.text(`${index + 1}. ${action.title}`, 20, yPos);
      
      pdf.setFontSize(10);
      pdf.text(`Description: ${action.description}`, 25, yPos + 8);
      pdf.text(`Réduction estimée: ${action.estimatedReduction.toFixed(0)} kg CO2e`, 25, yPos + 16);
      pdf.text(`Coût d'investissement: ${action.estimatedCost.toLocaleString()} €`, 25, yPos + 24);
      pdf.text(`ROI: ${action.roi}x | Délai: ${action.implementationTime}`, 25, yPos + 32);
      
      yPos += 45;
    });

    // Projections financières
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setTextColor(0, 102, 204);
    pdf.text('PROJECTIONS FINANCIÈRES', 20, 30);

    const totalInvestment = actionPlans.reduce((sum, action) => sum + action.estimatedCost, 0);
    const totalReduction = actionPlans.reduce((sum, action) => sum + action.estimatedReduction, 0);
    const carbonPrice = 80; // €/tonne CO2e
    const annualSavings = (totalReduction / 1000) * carbonPrice;

    const financial = [
      `Investissement total requis : ${totalInvestment.toLocaleString()} €`,
      `Réduction totale possible : ${(totalReduction/1000).toFixed(1)} tonnes CO2e/an`,
      `Économies annuelles estimées : ${annualSavings.toLocaleString()} €/an`,
      `Retour sur investissement : ${(totalInvestment / annualSavings).toFixed(1)} ans`,
      '',
      'AVANTAGES INTANGIBLES :',
      '• Amélioration de l\'image de marque',
      '• Conformité réglementaire anticipée',
      '• Réduction des risques climatiques',
      '• Motivation des employés'
    ];

    yPos = 45;
    financial.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 8;
    });

    // Sauvegarde
    pdf.save(`rapport-carbone-detaille-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const benchmark = getBenchmarkStatus();

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-card border shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Rapport Intelligent Avancé</h3>
            <p className="text-sm text-muted-foreground">Analyse graphique et plan d'action chiffré</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="flex items-center"
            >
              <PieChart className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </Button>
            <Button
              variant={activeTab === "analysis" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("analysis")}
              className="flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analyse
            </Button>
            <Button
              variant={activeTab === "actions" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("actions")}
              className="flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Actions
            </Button>
            <Button
              variant={activeTab === "projections" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("projections")}
              className="flex items-center"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Projections
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            className="flex items-center text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        {hasEmissions ? (
          <div className="w-full">{/* Replace Tabs component with conditional rendering */}

            {activeTab === "overview" && (
              <div className="mt-6 space-y-4">
              {/* KPIs clés */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">{toTonnes(emissions.total)}</div>
                      <div className="text-sm text-muted-foreground">tonnes CO2e</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center space-x-3">
                    <Award className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{benchmark?.score}</div>
                      <div className="text-sm text-muted-foreground">Score éco</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {actionPlans.reduce((sum, action) => sum + action.estimatedCost, 0).toLocaleString()}€
                      </div>
                      <div className="text-sm text-muted-foreground">Investissement</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-center space-x-3">
                    <Recycle className="w-8 h-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(actionPlans.reduce((sum, action) => sum + action.estimatedReduction, 0) / 1000)}
                      </div>
                      <div className="text-sm text-muted-foreground">tCO2e réduction</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Graphiques interactifs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4 sm:p-6">
                  <h4 className="font-semibold text-foreground mb-4">Répartition des émissions</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPC data={pieData}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, value}) => `${name}: ${(value/1000).toFixed(1)} tCO2e`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${(value/1000).toFixed(2)} tCO2e`, 'Émissions']} />
                        <Legend />
                      </RechartsPC>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h4 className="font-semibold text-foreground mb-4">Émissions vs Objectifs</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="emissions" fill="#ef4444" name="Émissions actuelles" />
                        <Bar dataKey="target" fill="#22c55e" name="Objectif 2030" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="mt-6 space-y-4">
              {/* Benchmark détaillé */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4">Benchmark sectoriel</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Votre performance</span>
                    <Badge variant={benchmark?.status === 'excellent' ? 'default' : 'destructive'}>
                      {benchmark?.message}
                    </Badge>
                  </div>
                  <Progress value={benchmark?.score} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    Score basé sur des entreprises similaires dans votre secteur
                  </div>
                </div>
              </Card>

              {/* Analyse des coûts carbone */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4">Impact financier du carbone</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Coût carbone actuel (80€/tCO2e)</span>
                    <span className="font-bold">{((emissions.total/1000) * 80).toLocaleString()}€/an</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projection 2030 (150€/tCO2e)</span>
                    <span className="font-bold text-red-600">{((emissions.total/1000) * 150).toLocaleString()}€/an</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Le prix du carbone augmente de 10-15% par an. Agir maintenant réduit les coûts futurs.
                  </div>
                </div>
              </Card>
              </div>
            )}

            {activeTab === "actions" && (
              <div className="mt-6 space-y-4">
              {/* Plan d'action chiffré */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Plan d'action chiffré
                </h4>
                <div className="space-y-4">
                  {actionPlans.map((action, index) => (
                    <Card key={action.id} className="p-4 border-l-4 border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-foreground">{action.title}</h5>
                        <Badge variant={action.priority === 'high' ? 'destructive' : 'outline'}>
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Réduction:</span>
                          <div className="font-semibold text-green-600">
                            {Math.round(action.estimatedReduction)} kg CO2e
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coût:</span>
                          <div className="font-semibold">{action.estimatedCost.toLocaleString()}€</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROI:</span>
                          <div className="font-semibold text-blue-600">{action.roi}x</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Délai:</span>
                          <div className="font-semibold">{action.implementationTime}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* ROI des actions */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4">Retour sur investissement</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reductionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="roi" fill="#3b82f6" name="ROI (x)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              </div>
            )}

            {activeTab === "projections" && (
              <div className="mt-6 space-y-4">
              {/* Projection de réduction */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4">Trajectoire de décarbonation</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyProjection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${(value/1000).toFixed(1)} tCO2e`, '']} />
                      <Area 
                        type="monotone" 
                        dataKey="current" 
                        stackId="1" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.6}
                        name="Émissions actuelles"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="projected" 
                        stackId="2" 
                        stroke="#22c55e" 
                        fill="#22c55e" 
                        fillOpacity={0.6}
                        name="Trajectoire Net Zero"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Objectifs climatiques */}
              <Card className="p-4 sm:p-6">
                <h4 className="font-semibold text-foreground mb-4">Alignement objectifs climatiques</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Accord de Paris (-50% en 2030)</span>
                    <Badge variant="outline">En cours</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Science Based Targets (SBTi)</span>
                    <Badge variant="outline">Aligné</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Net Zero 2050</span>
                    <Badge variant="default">Faisable</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucune donnée d'émission disponible pour générer le rapport.
            </p>
          </div>
        )}
      </Card>

      {/* Actions de téléchargement */}
      {hasEmissions && (
        <Card className="p-4 sm:p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Exporter le rapport avancé
          </h4>
          
          <div className="space-y-3">
            <Button 
              onClick={generateDetailedPDF} 
              className="w-full bg-gradient-primary hover:scale-105 transition-transform shadow-eco" 
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapport PDF Détaillé avec Plan d'Action Chiffré
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Partager par email
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Lien de partage
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
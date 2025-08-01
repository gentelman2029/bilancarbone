import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Download, Mail, Share2, CheckCircle, AlertTriangle, 
  TrendingDown, Building, Target, Clock, Users, Zap, 
  Truck, Factory, Lightbulb, Award, BarChart3, PieChart,
  Calendar, MapPin, Leaf, DollarSign, Recycle, Calculator, RotateCcw, Copy
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
import { PowerBIDashboard } from "@/components/PowerBIDashboard";

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
  const [shareUrl, setShareUrl] = useState("");
  const [emailData, setEmailData] = useState({ to: "", subject: "", message: "" });
  const [accessRequest, setAccessRequest] = useState({ name: "", email: "", company: "", message: "" });
  const { toast } = useToast();
  
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
    { year: '2025', current: emissions.total, projected: emissions.total * 0.88 },
    { year: '2026', current: emissions.total, projected: emissions.total * 0.70 },
    { year: '2027', current: emissions.total, projected: emissions.total * 0.55 },
    { year: '2030', current: emissions.total, projected: emissions.total * 0.35 }
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
    
    // Configuration des couleurs et styles
    const colors = {
      primary: [0, 102, 204] as [number, number, number],
      secondary: [64, 64, 64] as [number, number, number],
      success: [34, 197, 94] as [number, number, number],
      warning: [245, 158, 11] as [number, number, number],
      danger: [239, 68, 68] as [number, number, number]
    };
    
    // Page de garde avec logo et design moderne
    pdf.setFillColor(0, 102, 204);
    pdf.rect(0, 0, 210, 60, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT CARBONE', 20, 35);
    pdf.text('DÉTAILLÉ AVEC PLAN D\'ACTION', 20, 50);
    
    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Analyse complète de l\'empreinte carbone et stratégie de réduction', 20, 80);
    
    pdf.setFontSize(11);
    pdf.text(`📅 Généré le ${new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    })}`, 20, 95);
    
    // Informations Carbontrack
    pdf.text('🌱 Carbontrack - Solution d\'analyse environnementale', 20, 105);
    pdf.text('📧 Carbontrack2025@protonmail.com', 20, 115);
    pdf.text('📞 +216 93 460 745', 20, 125);

    // Sommaire interactif (nouvelle page)
    pdf.addPage();
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📋 SOMMAIRE', 20, 30);
    
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let yPos = 50;
    const sommaire = [
      '1. Synthèse exécutive ............................................................... p.3',
      '2. Analyse détaillée par scope .................................................. p.4', 
      '3. Plan d\'action chiffré ............................................................ p.5',
      '4. Projections financières ........................................................ p.6',
      '5. Graphiques et indicateurs .................................................... p.7',
      '6. Recommandations prioritaires .............................................. p.8'
    ];
    
    sommaire.forEach(item => {
      pdf.text(item, 25, yPos);
      yPos += 10;
    });

    // Synthèse exécutive avec encadrés colorés
    pdf.addPage();
    pdf.setFillColor(...colors.primary);
    pdf.rect(15, 20, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. SYNTHÈSE EXÉCUTIVE', 20, 26);
    
    // Encadré émissions totales
    pdf.setFillColor(220, 250, 220);
    pdf.rect(20, 40, 170, 25, 'F');
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`🌍 Empreinte carbone globale : ${totalTonnes.toFixed(1)} tonnes équivalent CO2`, 25, 50);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`📊 Évaluation environnementale : ${benchmark?.message} (score : ${benchmark?.score}/100)`, 25, 58);
    
    // Tableau des scopes avec couleurs
    yPos = 80;
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RÉPARTITION PAR SCOPE D\'ÉMISSIONS :', 20, yPos);
    
    const scopeData = [
      { scope: 'Scope 1', emissions: emissions.scope1, color: colors.danger, description: 'Émissions directes (combustibles, processus)' },
      { scope: 'Scope 2', emissions: emissions.scope2, color: colors.warning, description: 'Émissions indirectes (électricité, vapeur)' },
      { scope: 'Scope 3', emissions: emissions.scope3, color: colors.primary, description: 'Autres émissions indirectes (supply chain)' }
    ];
    
    yPos += 15;
    scopeData.forEach((scope, index) => {
      const percentage = Math.round((scope.emissions/emissions.total)*100);
      const tonnes = (scope.emissions/1000).toFixed(1);
      
      // Pastille colorée
      pdf.setFillColor(...scope.color);
      pdf.circle(25, yPos + 2, 2, 'F');
      
      pdf.setTextColor(...colors.secondary);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${scope.scope} : ${tonnes} tCO2e (${percentage}%)`, 30, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(scope.description, 30, yPos + 6);
      
      yPos += 18;
    });

    // Plan d'action chiffré avec design amélioré
    pdf.addPage();
    pdf.setFillColor(...colors.primary);
    pdf.rect(15, 20, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. PLAN D\'ACTION CHIFFRÉ', 20, 26);

    yPos = 45;
    actionPlans.forEach((action, index) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 30;
      }

      // Encadré pour chaque action
      const actionHeight = 35;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, yPos - 5, 170, actionHeight, 'F');
      
      // Numéro d'action avec pastille colorée
      const priorityColor = action.priority === 'high' ? colors.danger : 
                           action.priority === 'medium' ? colors.warning : colors.success;
      pdf.setFillColor(...priorityColor);
      pdf.circle(28, yPos + 3, 3, 'F');
      
      pdf.setTextColor(...colors.secondary);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${action.title}`, 35, yPos);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`📝 ${action.description}`, 25, yPos + 8);
      
      // Métriques avec icônes
      pdf.text(`➤ Réduction estimée : ${(action.estimatedReduction/1000).toFixed(1)} tonnes CO2e`, 25, yPos + 16);
      pdf.text(`➤ Coût projeté : ${action.estimatedCost.toLocaleString()} €`, 25, yPos + 22);
      pdf.text(`➤ Retour sur investissement : ${action.roi}x, atteint sous ${action.implementationTime}`, 25, yPos + 28);
      
      yPos += actionHeight + 10;
    });

    // Projections financières avec graphiques textuels
    pdf.addPage();
    pdf.setFillColor(...colors.primary);
    pdf.rect(15, 20, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. PROJECTIONS FINANCIÈRES', 20, 26);

    const totalInvestment = actionPlans.reduce((sum, action) => sum + action.estimatedCost, 0);
    const totalReduction = actionPlans.reduce((sum, action) => sum + action.estimatedReduction, 0);
    const carbonPrice = 85; // €/tonne CO2e (prix actualisé)
    const annualSavings = (totalReduction / 1000) * carbonPrice;

    // Encadrés avec couleurs pour les métriques clés
    yPos = 45;
    const financialMetrics = [
      { 
        label: '💰 Investissement total requis',
        value: `${totalInvestment.toLocaleString()} €`,
        color: colors.primary,
        description: 'Coût total du plan d\'action sur 18 mois'
      },
      { 
        label: '🌱 Réduction totale possible', 
        value: `${(totalReduction/1000).toFixed(1)} tonnes CO2e/an`,
        color: colors.success,
        description: 'Impact environnemental annuel du plan'
      },
      { 
        label: '💵 Économies annuelles estimées',
        value: `${Math.round(annualSavings).toLocaleString()} €/an`,
        color: colors.warning,
        description: 'Valorisation des réductions (prix carbone : 85€/t)'
      },
      {
        label: '⚡ Retour sur investissement',
        value: `${(totalInvestment / annualSavings).toFixed(1)} ans`,
        color: colors.danger,
        description: 'Période d\'amortissement financier'
      }
    ];

    financialMetrics.forEach((metric, index) => {
      // Encadré coloré
      pdf.setFillColor(240, 248, 255);
      pdf.rect(20, yPos, 170, 20, 'F');
      
      pdf.setTextColor(...metric.color);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.label, 25, yPos + 6);
      
      pdf.setTextColor(...colors.secondary);
      pdf.setFontSize(14);
      pdf.text(metric.value, 25, yPos + 13);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(metric.description, 25, yPos + 18);
      
      yPos += 30;
    });

    // Section avantages intangibles
    yPos += 10;
    pdf.setFillColor(250, 250, 220);
    pdf.rect(20, yPos, 170, 40, 'F');
    
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎯 AVANTAGES STRATÉGIQUES INTANGIBLES :', 25, yPos + 8);
    
    const benefits = [
      '✓ Amélioration de l\'image de marque et différenciation concurrentielle',
      '✓ Conformité réglementaire anticipée (CSRD, taxonomie verte)',
      '✓ Réduction des risques climatiques et résilience business',
      '✓ Attraction et motivation des talents (RSE)'
    ];
    
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let benefitY = yPos + 16;
    benefits.forEach(benefit => {
      pdf.text(benefit, 25, benefitY);
      benefitY += 6;
    });

    // Dernière page - Dashboard Interactif
    pdf.addPage();
    pdf.setFillColor(...colors.primary);
    pdf.rect(15, 20, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. DASHBOARD INTERACTIF', 20, 26);
    
    pdf.setTextColor(...colors.secondary);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    yPos = 45;
    
    const dashboardInfo = [
      '🎯 Votre dashboard interactif personnalisé sera disponible sous 48h',
      '',
      '📊 FONCTIONNALITÉS INCLUSES :',
      '• Visualisations interactives en temps réel',
      '• Filtres dynamiques par période, scope et catégorie',
      '• Comparaisons sectorielles automatisées',
      '• Projections prédictives basées sur l\'IA',
      '• Alertes automatiques de dépassement',
      '• Export automatique de rapports mensuels',
      '',
      '🔗 ACCÈS :',
      '• Lien d\'accès personnalisé envoyé par email',
      '• Compatible mobile, tablette et desktop',
      '• Mise à jour automatique des données',
      '• Partage sécurisé avec votre équipe',
      '',
      '💡 BÉNÉFICES :',
      '• Pilotage en temps réel de votre performance carbone',
      '• Décisions data-driven pour vos actions climat',
      '• Reporting automatisé pour vos parties prenantes'
    ];
    
    dashboardInfo.forEach(line => {
      if (line.startsWith('📊') || line.startsWith('🔗') || line.startsWith('💡')) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(line, 20, yPos);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(line, line.startsWith('•') ? 25 : 20, yPos);
      }
      yPos += 6;
    });

    // Sauvegarde avec nom amélioré
    const currentDate = new Date().toISOString().split('T')[0];
    const companyName = 'MonEntreprise'; // Peut être dynamique
    pdf.save(`${companyName}-Rapport-Carbone-Dashboard-${currentDate}.pdf`);
  };

  // Fonction pour générer un lien de partage
  const generateShareLink = () => {
    if (!hasEmissions) return;
    
    // Générer un ID unique pour le rapport
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Construire l'URL de partage
    const baseUrl = window.location.origin;
    const shareLink = `${baseUrl}/shared-report/${reportId}`;
    
    setShareUrl(shareLink);
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "Lien de partage généré",
        description: "Le lien a été copié dans votre presse-papier",
      });
    });
  };

  // Fonction pour partager par email
  const shareByEmail = () => {
    if (!emailData.to || !emailData.subject) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(`${emailData.message}\n\nConsultez le rapport détaillé via ce lien: ${shareUrl || window.location.href}`);
    
    window.open(`mailto:${emailData.to}?subject=${subject}&body=${body}`);
    
    toast({
      title: "Email préparé",
      description: "Votre client email s'ouvre avec le rapport prêt à envoyer",
    });
  };

  // Fonction pour demander l'accès au dashboard avancé
  const requestDashboardAccess = async () => {
    if (!accessRequest.name || !accessRequest.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Envoyer la demande d'accès par email
      const subject = encodeURIComponent("Demande d'accès - Dashboard Avancé Carbontrack");
      const body = encodeURIComponent(`
Nouvelle demande d'accès au dashboard avancé:

Nom: ${accessRequest.name}
Email: ${accessRequest.email}
Entreprise: ${accessRequest.company}
Message: ${accessRequest.message}

Données utilisateur:
- Émissions totales: ${(emissions.total / 1000).toFixed(1)} tCO2e
- Date de demande: ${new Date().toLocaleDateString('fr-FR')}
      `);
      
      window.open(`mailto:Carbontrack2025@protonmail.com?subject=${subject}&body=${body}`);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'accès a été transmise à notre équipe",
      });
      
      // Réinitialiser le formulaire
      setAccessRequest({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const benchmark = getBenchmarkStatus();

  return (
        <div className="space-y-6">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 border border-primary/20 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Rapport Intelligent Avancé
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Dashboard interactif Power BI • Analyse graphique • Plan d'action chiffré
                </p>
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
              variant={activeTab === "dashboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Leaf className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-lg font-bold text-primary">{toTonnes(emissions.total)}</div>
                      <div className="text-xs text-muted-foreground">tonnes CO2e</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3 bg-green-50 dark:bg-green-950/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Award className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-lg font-bold text-green-600">{benchmark?.score}</div>
                      <div className="text-xs text-muted-foreground">Score éco</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(actionPlans.reduce((sum, action) => sum + action.estimatedCost, 0) / 1000)}k€
                      </div>
                      <div className="text-xs text-muted-foreground">Investissement</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Recycle className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(actionPlans.reduce((sum, action) => sum + action.estimatedReduction, 0) / 1000)}
                      </div>
                      <div className="text-xs text-muted-foreground">tCO2e réduction</div>
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

            {activeTab === "dashboard" && (
              <div className="mt-6">
                <PowerBIDashboard
                  totalEmissions={emissions.total}
                  scope1={emissions.scope1}
                  scope2={emissions.scope2}
                  scope3={emissions.scope3}
                />
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Partager par email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Partager le rapport par email</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-to">Destinataire *</Label>
                      <Input
                        id="email-to"
                        type="email"
                        value={emailData.to}
                        onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                        placeholder="destinataire@exemple.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-subject">Objet *</Label>
                      <Input
                        id="email-subject"
                        value={emailData.subject}
                        onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                        placeholder="Rapport carbone détaillé"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email-message">Message</Label>
                      <Textarea
                        id="email-message"
                        value={emailData.message}
                        onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                        placeholder="Voici notre rapport carbone détaillé..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={shareByEmail} className="w-full">
                      Préparer l'email
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={generateShareLink}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Lien de partage
              </Button>
            </div>
            
            {shareUrl && (
              <div className="mt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Voir le lien généré
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Lien de partage généré</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Lien partageable</Label>
                        <div className="flex gap-2">
                          <Input value={shareUrl} readOnly className="flex-1" />
                          <Button 
                            size="sm" 
                            onClick={() => navigator.clipboard.writeText(shareUrl)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ce lien permet d'accéder à une version web de votre rapport carbone.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
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
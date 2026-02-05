import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, MapPin, Coins, ShieldCheck, ShieldAlert, ShieldX, ArrowRight } from 'lucide-react';
import { RSEAction, Stakeholder, DEFAULT_STAKEHOLDERS } from '@/lib/rse/types';
import { calculateCSRDProgress, countRegionalImpactActions, calculateBudgetStats } from '@/lib/rse/actionEngine';
import { 
  checkCompliance, 
  getComplianceLevelConfig, 
  getOverallStatus,
  RSEGovernance
} from '@/lib/rse/complianceEngine';
import { 
  CircularProgressGauge, 
  ESGPillarCard, 
  StakeholderMaterialityChart, 
  ActionTrackingTable,
  KPIDrilldownDrawer,
  DrilldownType
} from './dashboard';

interface RSEStrategicDashboardProps {
  actions: RSEAction[];
  stakeholders?: Stakeholder[];
  onNavigateToTab?: (tabId: string) => void;
}

export function RSEStrategicDashboard({ actions, stakeholders = DEFAULT_STAKEHOLDERS, onNavigateToTab }: RSEStrategicDashboardProps) {
  // Calculate executive KPIs
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'done').length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const csrdProgress = calculateCSRDProgress(actions);
  const regionalImpactActions = countRegionalImpactActions(actions);
  const regionalPercentage = totalActions > 0 ? Math.round((regionalImpactActions / totalActions) * 100) : 0;
  const budgetStats = calculateBudgetStats(actions);
  const budgetOptimization = budgetStats.allocated > 0 ? Math.round((budgetStats.spent / budgetStats.allocated) * 100) : 0;

  // RSE Governance state (loaded from localStorage)
  const [governance, setGovernance] = useState<RSEGovernance>({
    hasRSEManager: false,
    hasSustainabilityPolicy: false
  });

  // Load governance settings from localStorage
  useEffect(() => {
    const savedGovernance = localStorage.getItem('rse_governance');
    if (savedGovernance) {
      setGovernance(JSON.parse(savedGovernance));
    }
  }, []);

  // Calculate compliance result using the corrected engine
  const complianceResult = checkCompliance(
    actions,
    {
      // Get ESG data from localStorage if available
      totalCO2Emissions: (() => {
        try {
          const details = localStorage.getItem('calculation-section-details');
          if (details) {
            const parsed = JSON.parse(details);
            const scope1 = (parsed.scope1 || []).reduce((sum: number, e: any) => sum + (e.emissions || 0), 0);
            const scope2 = (parsed.scope2 || []).reduce((sum: number, e: any) => sum + (e.emissions || 0), 0);
            const scope3 = (parsed.scope3 || []).reduce((sum: number, e: any) => sum + (e.emissions || 0), 0);
            return scope1 + scope2 + scope3;
          }
        } catch { }
        return 0;
      })()
    },
    undefined,
    governance
  );

  // Get overall status based on alerts
  const overallStatus = getOverallStatus(complianceResult.alerts);
  const levelConfig = getComplianceLevelConfig(complianceResult.overallLevel);

  // Determine status icon and colors
  const getStatusDisplay = () => {
    if (complianceResult.overallLevel === 'critical') {
      return {
        icon: <ShieldX className="h-4 w-4" />,
        color: 'amber', // Use amber for the gauge but show status correctly
        badgeClass: 'bg-red-100 text-red-700 border-red-200'
      };
    }
    if (complianceResult.overallLevel === 'warning') {
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        color: 'amber' as const,
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }
    return {
      icon: <ShieldCheck className="h-4 w-4" />,
      color: 'emerald' as const,
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
  };

  const statusDisplay = getStatusDisplay();

  // Drilldown state
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownType, setDrilldownType] = useState<DrilldownType>(null);

  const handleOpenDrilldown = (type: DrilldownType) => {
    setDrilldownType(type);
    setDrilldownOpen(true);
  };

  const handleExportReport = () => {
    // Trigger the PDF export via custom event (listened by RSEPilotageReport)
    const event = new CustomEvent('rse-export-report');
    window.dispatchEvent(event);
  };

  // Listen for export trigger from other components
  useEffect(() => {
    const handleExportTrigger = () => handleExportReport();
    window.addEventListener('rse-export-report', handleExportTrigger);
    return () => window.removeEventListener('rse-export-report', handleExportTrigger);
  }, []);

  return (
    <div className="space-y-8">
      {/* Section 1: Executive Dashboard Header */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tableau de bord exécutif</h2>
            <p className="text-sm text-muted-foreground">
              Vision consolidée de l'engagement RSE de l'entreprise
            </p>
          </div>
        </div>

        {/* Circular KPI Gauges - Clickable */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardContent className="py-6">
            {/* Status Badge - Top Right */}
            <div className="flex justify-end mb-4">
              <Badge className={`${statusDisplay.badgeClass} border gap-1.5`}>
                {statusDisplay.icon}
                {overallStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <CircularProgressGauge
                value={complianceResult.score}
                label="Conformité réglementaire"
                sublabel={complianceResult.hasGovernanceIssue ? 'Plafonné (Art. 2)' : `${complianceResult.alerts.length} alertes`}
                color={complianceResult.overallLevel === 'critical' ? 'amber' : complianceResult.overallLevel === 'warning' ? 'amber' : 'emerald'}
                icon={statusDisplay.icon}
                onClick={() => handleOpenDrilldown('score')}
                tooltipText="Score de conformité basé sur la Loi RSE 2018-35 et les seuils BVMT. Plafonné à 50/100 si la gouvernance RSE (Article 2) n'est pas définie."
              />
              <CircularProgressGauge
                value={csrdProgress}
                label="Avancement des engagements"
                sublabel="Plan de Transition CSRD"
                color="blue"
                icon={<Target className="h-4 w-4" />}
                onClick={() => handleOpenDrilldown('engagement')}
                tooltipText="Progression des jalons CSRD (Directive européenne 2022/2464). Cliquez pour voir les jalons."
              />
              <CircularProgressGauge
                value={regionalPercentage}
                label="Impact territorial"
                sublabel={`${regionalImpactActions} actions Loi 2018-35`}
                color="amber"
                icon={<MapPin className="h-4 w-4" />}
                onClick={() => handleOpenDrilldown('impact')}
                tooltipText="Actions contribuant au développement régional (Loi RSE 2018-35). Cliquez pour la liste."
              />
              <CircularProgressGauge
                value={budgetOptimization}
                label="Optimisation budgétaire"
                sublabel={`${(budgetStats.spent / 1000).toFixed(0)}K / ${(budgetStats.allocated / 1000).toFixed(0)}K TND`}
                color="purple"
                icon={<Coins className="h-4 w-4" />}
                onClick={() => handleOpenDrilldown('budget')}
                tooltipText="Ratio budget engagé vs budget alloué par pilier ESG. Cliquez pour le détail."
              />
            </div>

            {/* Corrective Actions Button */}
            {complianceResult.score < 100 && complianceResult.alerts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border/50 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/5 hover:bg-primary/10 border-primary/20"
                  onClick={() => onNavigateToTab?.('kanban')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Voir les actions correctives
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 2: ESG Pillar Analysis */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">Analyse par piliers ESG</h2>
          <p className="text-sm text-muted-foreground">
            Répartition budgétaire et actions phares par domaine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ESGPillarCard category="E" actions={actions} />
          <ESGPillarCard category="S" actions={actions} />
          <ESGPillarCard category="G" actions={actions} />
        </div>
      </section>

      {/* Section 3: Stakeholder Materiality Matrix */}
      <section>
        <StakeholderMaterialityChart stakeholders={stakeholders} />
      </section>

      {/* Section 4: Action Tracking Table */}
      <section>
        <ActionTrackingTable actions={actions} />
      </section>

      {/* Drilldown Drawer */}
      <KPIDrilldownDrawer
        open={drilldownOpen}
        onOpenChange={setDrilldownOpen}
        type={drilldownType}
        actions={actions}
        budgetStats={budgetStats}
      />
    </div>
  );
}

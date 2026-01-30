import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, Target, MapPin, Coins } from 'lucide-react';
import { RSEAction, Stakeholder, DEFAULT_STAKEHOLDERS } from '@/lib/rse/types';
import { calculateCSRDProgress, countRegionalImpactActions, calculateBudgetStats } from '@/lib/rse/actionEngine';
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
}

export function RSEStrategicDashboard({ actions, stakeholders = DEFAULT_STAKEHOLDERS }: RSEStrategicDashboardProps) {
  // Calculate executive KPIs
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'done').length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const csrdProgress = calculateCSRDProgress(actions);
  const regionalImpactActions = countRegionalImpactActions(actions);
  const regionalPercentage = totalActions > 0 ? Math.round((regionalImpactActions / totalActions) * 100) : 0;
  const budgetStats = calculateBudgetStats(actions);
  const budgetOptimization = budgetStats.allocated > 0 ? Math.round((budgetStats.spent / budgetStats.allocated) * 100) : 0;

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
          <CardContent className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <CircularProgressGauge
                value={completionRate}
                label="Score de conformité"
                sublabel={`${completedActions}/${totalActions} actions terminées`}
                color="emerald"
                icon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => handleOpenDrilldown('score')}
                tooltipText="Ratio d'actions terminées sur le total. Cliquez pour voir le détail des actions."
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

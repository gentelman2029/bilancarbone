import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, Target, MapPin, Coins } from 'lucide-react';
import { RSEAction, Stakeholder, DEFAULT_STAKEHOLDERS } from '@/lib/rse/types';
import { calculateCSRDProgress, countRegionalImpactActions, calculateBudgetStats } from '@/lib/rse/actionEngine';
import { 
  CircularProgressGauge, 
  ESGPillarCard, 
  StakeholderMaterialityChart, 
  ActionTrackingTable 
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
  const { allocated, spent } = calculateBudgetStats(actions);
  const budgetOptimization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  const handleExportReport = () => {
    // This would trigger the PDF export - integrated with RSEPilotageReport
    const event = new CustomEvent('rse-export-report');
    window.dispatchEvent(event);
  };

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
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4" />
            Télécharger le rapport annuel
          </Button>
        </div>

        {/* Circular KPI Gauges */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardContent className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <CircularProgressGauge
                value={completionRate}
                label="Score de conformité"
                sublabel={`${completedActions}/${totalActions} actions terminées`}
                color="emerald"
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <CircularProgressGauge
                value={csrdProgress}
                label="Avancement des engagements"
                sublabel="Plan de Transition CSRD"
                color="blue"
                icon={<Target className="h-4 w-4" />}
              />
              <CircularProgressGauge
                value={regionalPercentage}
                label="Impact territorial"
                sublabel={`${regionalImpactActions} actions Loi 2018-35`}
                color="amber"
                icon={<MapPin className="h-4 w-4" />}
              />
              <CircularProgressGauge
                value={budgetOptimization}
                label="Optimisation budgétaire"
                sublabel={`${(spent / 1000).toFixed(0)}K / ${(allocated / 1000).toFixed(0)}K TND`}
                color="purple"
                icon={<Coins className="h-4 w-4" />}
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
    </div>
  );
}

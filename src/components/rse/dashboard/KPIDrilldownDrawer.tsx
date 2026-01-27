import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  MapPin, 
  Coins,
  AlertCircle,
  FileText,
  TrendingUp,
  Users
} from 'lucide-react';
import { RSEAction } from '@/lib/rse/types';
import { cn } from '@/lib/utils';

export type DrilldownType = 'score' | 'engagement' | 'impact' | 'budget' | null;

interface KPIDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DrilldownType;
  actions: RSEAction[];
  budgetStats: { allocated: number; spent: number };
}

const STATUS_BADGES = {
  done: { label: 'Terminé', className: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
  todo: { label: 'À faire', className: 'bg-slate-100 text-slate-600' },
  blocked: { label: 'Bloqué', className: 'bg-red-100 text-red-700' },
};

function ScoreDrilldown({ actions }: { actions: RSEAction[] }) {
  const completed = actions.filter(a => a.status === 'done');
  const remaining = actions.filter(a => a.status !== 'done');
  const completionRate = actions.length > 0 ? Math.round((completed.length / actions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-emerald-800">Taux de conformité</span>
          <span className="text-2xl font-bold text-emerald-700">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-2 bg-emerald-200" />
        <p className="text-xs text-emerald-600 mt-2">
          {completed.length} action{completed.length > 1 ? 's' : ''} terminée{completed.length > 1 ? 's' : ''} sur {actions.length}
        </p>
      </div>

      {/* Completed Actions */}
      <div>
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Actions terminées ({completed.length})
        </h4>
        <ul className="space-y-2">
          {completed.slice(0, 10).map(action => (
            <li key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{action.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                {action.category}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* Remaining Actions */}
      {remaining.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-500" />
            Actions restantes ({remaining.length})
          </h4>
          <ul className="space-y-2">
            {remaining.slice(0, 10).map(action => (
              <li key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                {action.status === 'in_progress' ? (
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                ) : action.status === 'blocked' ? (
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <Target className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{action.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
                </div>
                <Badge variant="outline" className={cn('shrink-0 text-[10px]', STATUS_BADGES[action.status].className)}>
                  {STATUS_BADGES[action.status].label}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Source :</strong> Calcul automatique basé sur le statut des actions RSE.
        </p>
      </div>
    </div>
  );
}

function EngagementDrilldown({ actions }: { actions: RSEAction[] }) {
  const csrdActions = actions.filter(a => 
    a.legislationRef.some(ref => ref.toLowerCase().includes('csrd'))
  );
  const completedCsrd = csrdActions.filter(a => a.status === 'done');
  const csrdProgress = csrdActions.length > 0 ? Math.round((completedCsrd.length / csrdActions.length) * 100) : 0;

  // Group by legislation
  const milestones = [
    { label: 'Rapport de durabilité', status: csrdActions.some(a => a.title.toLowerCase().includes('rapport')) ? 'done' : 'todo' },
    { label: 'Double matérialité', status: csrdActions.some(a => a.title.toLowerCase().includes('matérialité')) ? 'in_progress' : 'todo' },
    { label: 'Plan de transition climatique', status: csrdActions.some(a => a.title.toLowerCase().includes('transition') && a.status === 'done') ? 'done' : 'in_progress' },
    { label: 'Chaîne de valeur', status: 'todo' },
    { label: 'Indicateurs ESRS', status: completedCsrd.length > 0 ? 'in_progress' : 'todo' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-800">Progression CSRD</span>
          <span className="text-2xl font-bold text-blue-700">{csrdProgress}%</span>
        </div>
        <Progress value={csrdProgress} className="h-2 bg-blue-200" />
        <p className="text-xs text-blue-600 mt-2">
          {completedCsrd.length} jalon{completedCsrd.length > 1 ? 's' : ''} validé{completedCsrd.length > 1 ? 's' : ''} sur {csrdActions.length} actions CSRD
        </p>
      </div>

      {/* CSRD Milestones */}
      <div>
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-blue-500" />
          Jalons du Plan de Transition
        </h4>
        <ul className="space-y-2">
          {milestones.map((milestone, idx) => (
            <li key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              {milestone.status === 'done' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : milestone.status === 'in_progress' ? (
                <Clock className="h-4 w-4 text-blue-500 shrink-0" />
              ) : (
                <Target className="h-4 w-4 text-slate-400 shrink-0" />
              )}
              <span className="text-sm flex-1">{milestone.label}</span>
              <Badge variant="outline" className={cn('text-[10px]', STATUS_BADGES[milestone.status as keyof typeof STATUS_BADGES].className)}>
                {STATUS_BADGES[milestone.status as keyof typeof STATUS_BADGES].label}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* CSRD Actions List */}
      {csrdActions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Actions liées à la CSRD ({csrdActions.length})
          </h4>
          <ul className="space-y-2">
            {csrdActions.slice(0, 8).map(action => (
              <li key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.legislationRef.join(' • ')}
                  </p>
                </div>
                <Badge variant="outline" className={cn('shrink-0 text-[10px]', STATUS_BADGES[action.status].className)}>
                  {STATUS_BADGES[action.status].label}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Source :</strong> Directive CSRD (UE) 2022/2464, Standards ESRS.
        </p>
      </div>
    </div>
  );
}

function ImpactDrilldown({ actions }: { actions: RSEAction[] }) {
  const regionalActions = actions.filter(a => a.impactMetrics.regionalImpact);
  const regionalPercentage = actions.length > 0 ? Math.round((regionalActions.length / actions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-amber-800">Impact territorial</span>
          <span className="text-2xl font-bold text-amber-700">{regionalPercentage}%</span>
        </div>
        <Progress value={regionalPercentage} className="h-2 bg-amber-200" />
        <p className="text-xs text-amber-600 mt-2">
          {regionalActions.length} action{regionalActions.length > 1 ? 's' : ''} à impact régional sur {actions.length}
        </p>
      </div>

      {/* Regional Impact Actions */}
      <div>
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-amber-500" />
          Actions Loi 2018-35 ({regionalActions.length})
        </h4>
        
        {regionalActions.length > 0 ? (
          <ul className="space-y-2">
            {regionalActions.map(action => (
              <li key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{action.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                      {action.category === 'E' ? 'Environnement' : action.category === 'S' ? 'Social' : 'Gouvernance'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Budget : {action.impactMetrics.costEstimated.toLocaleString('fr-FR')} TND
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={cn('shrink-0 text-[10px]', STATUS_BADGES[action.status].className)}>
                  {STATUS_BADGES[action.status].label}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune action à impact régional définie.</p>
            <p className="text-xs mt-1">Activez l'indicateur « Impact régional » sur vos actions.</p>
          </div>
        )}
      </div>

      {/* Legislation Reference */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Cadre réglementaire
        </h5>
        <p className="text-sm">
          <strong>Loi n° 2018-35</strong> relative à la Responsabilité Sociétale des Entreprises en Tunisie
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Priorité au développement régional équilibré et à l'emploi local.
        </p>
      </div>

      {/* Source */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Source :</strong> Indicateur « Impact régional » des fiches actions RSE.
        </p>
      </div>
    </div>
  );
}

function BudgetDrilldown({ actions, budgetStats }: { actions: RSEAction[]; budgetStats: { allocated: number; spent: number } }) {
  const { allocated, spent } = budgetStats;
  const optimization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
  const remaining = allocated - spent;

  // Group by category
  const categoryBudgets = {
    E: { label: 'Environnement', allocated: 0, spent: 0, color: 'emerald' },
    S: { label: 'Social', allocated: 0, spent: 0, color: 'blue' },
    G: { label: 'Gouvernance', allocated: 0, spent: 0, color: 'purple' },
  };

  actions.forEach(action => {
    categoryBudgets[action.category].allocated += action.impactMetrics.costEstimated;
    if (action.status === 'done') {
      categoryBudgets[action.category].spent += action.impactMetrics.costEstimated;
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-purple-800">Optimisation budgétaire</span>
          <span className="text-2xl font-bold text-purple-700">{optimization}%</span>
        </div>
        <Progress value={optimization} className="h-2 bg-purple-200" />
        <p className="text-xs text-purple-600 mt-2">
          {(spent / 1000).toFixed(0)}K TND engagés sur {(allocated / 1000).toFixed(0)}K TND alloués
        </p>
      </div>

      {/* Budget Comparison Table */}
      <div>
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Coins className="h-4 w-4 text-purple-500" />
          Comparatif Engagé vs Réel
        </h4>
        
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-4 py-2 font-medium">Poste</th>
                <th className="text-right px-4 py-2 font-medium">Alloué</th>
                <th className="text-right px-4 py-2 font-medium">Engagé</th>
                <th className="text-right px-4 py-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryBudgets).map(([key, data]) => (
                <tr key={key} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        data.color === 'emerald' ? 'bg-emerald-500' :
                        data.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      )} />
                      {data.label}
                    </div>
                  </td>
                  <td className="text-right px-4 py-3 tabular-nums">
                    {data.allocated.toLocaleString('fr-FR')} TND
                  </td>
                  <td className="text-right px-4 py-3 tabular-nums">
                    {data.spent.toLocaleString('fr-FR')} TND
                  </td>
                  <td className="text-right px-4 py-3 tabular-nums">
                    {data.allocated > 0 ? Math.round((data.spent / data.allocated) * 100) : 0}%
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-muted/20 font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="text-right px-4 py-3 tabular-nums">{allocated.toLocaleString('fr-FR')} TND</td>
                <td className="text-right px-4 py-3 tabular-nums">{spent.toLocaleString('fr-FR')} TND</td>
                <td className="text-right px-4 py-3 tabular-nums">{optimization}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Remaining Budget */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
        <div>
          <p className="text-sm font-medium">Budget restant</p>
          <p className="text-xs text-muted-foreground">À engager sur l'exercice</p>
        </div>
        <span className="text-xl font-bold text-foreground tabular-nums">
          {remaining.toLocaleString('fr-FR')} TND
        </span>
      </div>

      {/* Source */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Source :</strong> Estimation des coûts par action (champ « Budget estimé »).
        </p>
      </div>
    </div>
  );
}

export function KPIDrilldownDrawer({ 
  open, 
  onOpenChange, 
  type, 
  actions,
  budgetStats 
}: KPIDrilldownDrawerProps) {
  const config: Record<Exclude<DrilldownType, null>, { title: string; description: string; icon: React.ReactNode }> = {
    score: {
      title: 'Score de conformité',
      description: 'Détail du calcul et liste des actions terminées',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    },
    engagement: {
      title: 'Avancement des engagements',
      description: 'Jalons validés du Plan de Transition CSRD',
      icon: <Target className="h-5 w-5 text-blue-500" />
    },
    impact: {
      title: 'Impact territorial',
      description: 'Actions conformes à la Loi RSE 2018-35',
      icon: <MapPin className="h-5 w-5 text-amber-500" />
    },
    budget: {
      title: 'Optimisation budgétaire',
      description: 'Comparatif Budget engagé vs Budget réel',
      icon: <Coins className="h-5 w-5 text-purple-500" />
    },
  };

  if (!type) return null;

  const currentConfig = config[type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            {currentConfig.icon}
            <div>
              <SheetTitle>{currentConfig.title}</SheetTitle>
              <SheetDescription>{currentConfig.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6">
          {type === 'score' && <ScoreDrilldown actions={actions} />}
          {type === 'engagement' && <EngagementDrilldown actions={actions} />}
          {type === 'impact' && <ImpactDrilldown actions={actions} />}
          {type === 'budget' && <BudgetDrilldown actions={actions} budgetStats={budgetStats} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}

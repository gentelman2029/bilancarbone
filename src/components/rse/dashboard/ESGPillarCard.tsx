import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Leaf, Users, Building2, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { RSEAction } from '@/lib/rse/types';
import { cn } from '@/lib/utils';

interface ESGPillarCardProps {
  category: 'E' | 'S' | 'G';
  actions: RSEAction[];
}

const PILLAR_CONFIG = {
  E: {
    label: 'Environnement',
    icon: Leaf,
    color: 'emerald',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    progressColor: 'bg-emerald-500',
    barBg: 'bg-emerald-100',
  },
  S: {
    label: 'Social',
    icon: Users,
    color: 'blue',
    bgGradient: 'from-blue-50 to-blue-100/50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
    barBg: 'bg-blue-100',
  },
  G: {
    label: 'Gouvernance',
    icon: Building2,
    color: 'purple',
    bgGradient: 'from-purple-50 to-purple-100/50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    progressColor: 'bg-purple-500',
    barBg: 'bg-purple-100',
  },
};

const STATUS_BADGES = {
  done: { label: 'Terminé', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  todo: { label: 'À venir', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  blocked: { label: 'Bloqué', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function ESGPillarCard({ category, actions }: ESGPillarCardProps) {
  const config = PILLAR_CONFIG[category];
  const Icon = config.icon;

  const catActions = actions.filter(a => a.category === category);
  const totalBudget = catActions.reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0);
  const spentBudget = catActions
    .filter(a => a.status === 'done')
    .reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0);
  const budgetProgress = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

  const completedCount = catActions.filter(a => a.status === 'done').length;
  const inProgressCount = catActions.filter(a => a.status === 'in_progress').length;
  const completionRate = catActions.length > 0 
    ? Math.round((completedCount / catActions.length) * 100) 
    : 0;

  // Get top 3 flagship actions
  const flagshipActions = catActions
    .filter(a => a.priority === 'high' || a.status === 'in_progress')
    .slice(0, 3);

  return (
    <Card className={cn(
      'relative overflow-hidden border transition-all duration-300 hover:shadow-lg',
      config.borderColor
    )}>
      {/* Subtle gradient background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50',
        config.bgGradient
      )} />

      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl', config.iconBg)}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{config.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {catActions.length} action{catActions.length > 1 ? 's' : ''} • {completionRate}% complété
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold tabular-nums">{completedCount}</span>
            <span className="text-muted-foreground">/{catActions.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget consommé</span>
            <span className="font-medium tabular-nums">
              {(spentBudget / 1000).toFixed(0)}K / {(totalBudget / 1000).toFixed(0)}K TND
            </span>
          </div>
          <div className={cn('h-3 rounded-full overflow-hidden', config.barBg)}>
            <div 
              className={cn('h-full rounded-full transition-all duration-700 ease-out', config.progressColor)}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {budgetProgress.toFixed(0)}% du budget engagé
          </p>
        </div>

        {/* Flagship Actions */}
        {flagshipActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions phares
            </p>
            <ul className="space-y-2">
              {flagshipActions.map(action => (
                <li 
                  key={action.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50"
                >
                  {action.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : action.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-sm flex-1 line-clamp-1">{action.title}</span>
                  <Badge 
                    variant="outline" 
                    className={cn('text-[10px] px-1.5', STATUS_BADGES[action.status].className)}
                  >
                    {STATUS_BADGES[action.status].label}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">{completedCount} terminée{completedCount > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">{inProgressCount} en cours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

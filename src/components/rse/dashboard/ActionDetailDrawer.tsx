import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Coins,
  MapPin,
  Users,
  Calendar,
  Target,
  FileText,
  Leaf,
  Building2,
  AlertCircle
} from 'lucide-react';
import { RSEAction } from '@/lib/rse/types';
import { cn } from '@/lib/utils';

interface ActionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: RSEAction | null;
}

const STATUS_CONFIG = {
  done: { 
    label: 'Terminé', 
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500'
  },
  in_progress: { 
    label: 'En cours', 
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock,
    iconColor: 'text-blue-500'
  },
  todo: { 
    label: 'À venir', 
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: ArrowRight,
    iconColor: 'text-slate-400'
  },
  blocked: { 
    label: 'Bloqué', 
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
};

const PRIORITY_CONFIG = {
  high: { label: 'Haute', className: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Moyenne', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Basse', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const CATEGORY_CONFIG = {
  E: { label: 'Environnement', icon: Leaf, color: 'emerald' },
  S: { label: 'Social', icon: Users, color: 'blue' },
  G: { label: 'Gouvernance', icon: Building2, color: 'purple' },
};

export function ActionDetailDrawer({ open, onOpenChange, action }: ActionDetailDrawerProps) {
  if (!action) return null;

  const statusConfig = STATUS_CONFIG[action.status];
  const StatusIcon = statusConfig.icon;
  const categoryConfig = CATEGORY_CONFIG[action.category];
  const CategoryIcon = categoryConfig.icon;
  const priorityConfig = PRIORITY_CONFIG[action.priority];

  const budgetConsumed = action.status === 'done' ? action.impactMetrics.costEstimated : 0;
  const budgetProgress = action.impactMetrics.costEstimated > 0 
    ? (budgetConsumed / action.impactMetrics.costEstimated) * 100 
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2.5 rounded-xl shrink-0',
              categoryConfig.color === 'emerald' ? 'bg-emerald-100' :
              categoryConfig.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
            )}>
              <CategoryIcon className={cn(
                'h-5 w-5',
                categoryConfig.color === 'emerald' ? 'text-emerald-600' :
                categoryConfig.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg leading-tight">{action.title}</SheetTitle>
              <SheetDescription className="mt-1">{categoryConfig.label}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Status & Priority Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-5 w-5', statusConfig.iconColor)} />
              <Badge variant="outline" className={cn('text-sm', statusConfig.className)}>
                {statusConfig.label}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <Badge variant="outline" className={cn('text-sm', priorityConfig.className)}>
              Priorité {priorityConfig.label}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </div>

          {/* Budget Section */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="h-4 w-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-800">Suivi budgétaire</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Budget consommé</span>
                <span className="font-semibold text-purple-800 tabular-nums">
                  {budgetConsumed.toLocaleString('fr-FR')} / {action.impactMetrics.costEstimated.toLocaleString('fr-FR')} TND
                </span>
              </div>
              <Progress value={budgetProgress} className="h-2 bg-purple-200" />
              <p className="text-xs text-purple-600">
                {action.status === 'done' 
                  ? '100% du budget engagé' 
                  : action.status === 'in_progress' 
                    ? 'Budget en cours d\'utilisation'
                    : 'Budget non encore engagé'}
              </p>
            </div>
          </div>

          {/* Regional Impact Section */}
          <div className={cn(
            'p-4 rounded-lg border',
            action.impactMetrics.regionalImpact 
              ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200' 
              : 'bg-muted/30 border-border/50'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className={cn(
                'h-4 w-4',
                action.impactMetrics.regionalImpact ? 'text-amber-600' : 'text-muted-foreground'
              )} />
              <h4 className={cn(
                'text-sm font-semibold',
                action.impactMetrics.regionalImpact ? 'text-amber-800' : 'text-foreground'
              )}>
                Impact territorial
              </h4>
            </div>
            
            {action.impactMetrics.regionalImpact ? (
              <div className="space-y-2">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                  Conforme Loi 2018-35
                </Badge>
                <p className="text-xs text-amber-700">
                  Cette action contribue au développement régional équilibré conformément à la Loi RSE tunisienne.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun impact régional direct identifié pour cette action.
              </p>
            )}
          </div>

          {/* Legislation Reference */}
          {action.legislationRef && action.legislationRef.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">Références réglementaires</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {action.legislationRef.map((ref, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-slate-50">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {action.deadline && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Échéance :</span>
                <span className="text-sm font-medium">
                  {new Date(action.deadline).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}

          {/* CO2 Impact */}
          {action.impactMetrics.co2ReductionTarget && action.impactMetrics.co2ReductionTarget > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">Réduction CO₂ estimée</span>
                </div>
                <span className="text-lg font-bold text-emerald-700 tabular-nums">
                  {action.impactMetrics.co2ReductionTarget.toFixed(1)} tCO₂e/an
                </span>
              </div>
            </div>
          )}

          {/* Assigned To */}
          {action.assignedTo && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Responsable :</span>
                <span className="text-sm font-medium">{action.assignedTo}</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
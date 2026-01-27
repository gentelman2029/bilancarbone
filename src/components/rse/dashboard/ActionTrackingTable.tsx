import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ListChecks, 
  MapPin, 
  ArrowUp, 
  ArrowRight, 
  ArrowDown,
  Leaf,
  Users,
  Building2
} from 'lucide-react';
import { RSEAction, STATUS_CONFIG } from '@/lib/rse/types';
import { cn } from '@/lib/utils';

interface ActionTrackingTableProps {
  actions: RSEAction[];
}

const PRIORITY_ICONS = {
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
};

const PRIORITY_STYLES = {
  high: 'text-red-500 bg-red-50',
  medium: 'text-amber-500 bg-amber-50',
  low: 'text-slate-500 bg-slate-50',
};

const CATEGORY_ICONS = {
  E: Leaf,
  S: Users,
  G: Building2,
};

const CATEGORY_COLORS = {
  E: 'text-emerald-600 bg-emerald-50',
  S: 'text-blue-600 bg-blue-50',
  G: 'text-purple-600 bg-purple-50',
};

export function ActionTrackingTable({ actions }: ActionTrackingTableProps) {
  // Sort by priority (high first) then by status
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const statusOrder = { in_progress: 0, todo: 1, blocked: 2, done: 3 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return statusOrder[a.status] - statusOrder[b.status];
  }).slice(0, 10); // Show top 10

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              Table de pilotage des actions
            </CardTitle>
            <CardDescription className="mt-1">
              Vue consolidée des engagements prioritaires
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">
            {actions.length} action{actions.length > 1 ? 's' : ''} au total
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-12 text-center font-semibold">Pilier</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="w-24 text-center font-semibold">Priorité</TableHead>
                <TableHead className="w-24 text-center font-semibold">Statut</TableHead>
                <TableHead className="w-28 text-right font-semibold">Budget (TND)</TableHead>
                <TableHead className="w-24 text-center font-semibold">Impact régional</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActions.map((action, index) => {
                const PriorityIcon = PRIORITY_ICONS[action.priority];
                const CategoryIcon = CATEGORY_ICONS[action.category];
                const statusConfig = STATUS_CONFIG[action.status];

                return (
                  <TableRow 
                    key={action.id}
                    className={cn(
                      'transition-colors',
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    )}
                  >
                    {/* Category */}
                    <TableCell className="text-center py-4">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mx-auto',
                        CATEGORY_COLORS[action.category]
                      )}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                    </TableCell>

                    {/* Action Title & Description */}
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {action.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* Priority */}
                    <TableCell className="text-center py-4">
                      <div className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                        PRIORITY_STYLES[action.priority]
                      )}>
                        <PriorityIcon className="h-3 w-3" />
                        {action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center py-4">
                      <Badge 
                        variant="outline"
                        className={cn(
                          'text-xs',
                          statusConfig.bgColor,
                          statusConfig.color,
                          'border-transparent'
                        )}
                      >
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

                    {/* Budget */}
                    <TableCell className="text-right py-4">
                      <span className="font-medium tabular-nums">
                        {action.impactMetrics.costEstimated.toLocaleString('fr-FR')}
                      </span>
                    </TableCell>

                    {/* Regional Impact */}
                    <TableCell className="text-center py-4">
                      {action.impactMetrics.regionalImpact ? (
                        <div className="flex items-center justify-center gap-1 text-emerald-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-medium">Oui</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Priorité haute</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Priorité moyenne</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Priorité basse</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span>Loi RSE 2018-35 - Développement régional</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

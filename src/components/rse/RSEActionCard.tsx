import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, 
  User, 
  Coins, 
  Target, 
  MapPin, 
  FileText,
  ChevronDown,
  ChevronUp,
  Leaf,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';
import { RSEAction, STATUS_CONFIG, PRIORITY_CONFIG, ActionStatus } from '@/lib/rse/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RSEActionCardProps {
  action: RSEAction;
  onStatusChange: (id: string, status: ActionStatus) => void;
  onEdit: (action: RSEAction) => void;
}

const CATEGORY_ICONS = {
  E: Leaf,
  S: Users,
  G: Building2,
};

const CATEGORY_COLORS = {
  E: 'text-emerald-500',
  S: 'text-blue-500',
  G: 'text-purple-500',
};

export function RSEActionCard({ action, onStatusChange, onEdit }: RSEActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const CategoryIcon = CATEGORY_ICONS[action.category];
  const statusConfig = STATUS_CONFIG[action.status];
  const priorityConfig = PRIORITY_CONFIG[action.priority];

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${action.isSuggestion ? 'border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <CategoryIcon className={`h-5 w-5 mt-0.5 ${CATEGORY_COLORS[action.category]}`} />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium leading-tight">
                {action.title}
                {action.isSuggestion && (
                  <Sparkles className="inline-block ml-2 h-4 w-4 text-amber-500" />
                )}
              </CardTitle>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={`text-xs text-muted-foreground mt-1 cursor-help ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {action.description}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start" 
                    className="max-w-xs p-3 text-sm bg-popover border shadow-lg z-50"
                  >
                    <p className="whitespace-pre-wrap">{action.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Badge variant="outline" className={priorityConfig.color}>
            {priorityConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Quick Info */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{action.linkedKpiId}</span>
          </div>
          {action.impactMetrics.costEstimated > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Coins className="h-3 w-3" />
              <span>{action.impactMetrics.costEstimated.toLocaleString()} TND</span>
            </div>
          )}
          {action.deadline && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(action.deadline), 'dd MMM yyyy', { locale: fr })}</span>
            </div>
          )}
          {action.impactMetrics.regionalImpact && (
            <Badge variant="secondary" className="text-xs h-5">
              <MapPin className="h-3 w-3 mr-1" />
              Impact Régional
            </Badge>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={action.status}
              onChange={(e) => onStatusChange(action.id, e.target.value as ActionStatus)}
              className={`text-xs px-2 py-1 rounded border ${statusConfig.bgColor} ${statusConfig.color} cursor-pointer`}
            >
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? (
              <>Moins <ChevronUp className="h-3 w-3 ml-1" /></>
            ) : (
              <>Plus <ChevronDown className="h-3 w-3 ml-1" /></>
            )}
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Responsable:</span>
              <span className="font-medium">{action.assignedTo}</span>
            </div>

            {action.impactMetrics.kpiImpactPoints && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Impact KPI:</span>
                <span className="font-medium text-emerald-600">+{action.impactMetrics.kpiImpactPoints} points</span>
              </div>
            )}

            {action.impactMetrics.co2ReductionTarget && (
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Réduction CO₂:</span>
                <span className="font-medium text-emerald-600">-{action.impactMetrics.co2ReductionTarget} tCO₂e/an</span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Références légales:</span>
              </div>
              <div className="flex flex-wrap gap-1 ml-6">
                {action.legislationRef.map((ref, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>

            {action.impactMetrics.regionalImpact && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">
                <Checkbox checked disabled className="h-4 w-4" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400">
                  Projet à impact régional / Développement local (Loi 2018-35)
                </span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(action)}>
                Modifier
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

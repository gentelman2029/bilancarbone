import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle2, Clock, User, CalendarCheck } from 'lucide-react';
import { ActivityData } from '@/lib/dataCollection/types';

interface ValidationStatusBadgeProps {
  activity: ActivityData;
}

export function ValidationStatusBadge({ activity }: ValidationStatusBadgeProps) {
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusContent = () => {
    switch (activity.status) {
      case 'draft':
        return {
          badge: (
            <Badge variant="outline" className="cursor-default">
              Brouillon
            </Badge>
          ),
          tooltipContent: (
            <div className="space-y-1 text-xs">
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                En attente de validation
              </p>
              <p className="text-muted-foreground">
                Créé le {formatDateTime(activity.created_at)}
              </p>
            </div>
          ),
        };

      case 'validated':
        return {
          badge: (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/30 cursor-default flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Validé
            </Badge>
          ),
          tooltipContent: (
            <div className="space-y-1.5 text-xs">
              <p className="font-medium flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Donnée validée
              </p>
              <div className="space-y-0.5 text-muted-foreground">
                <p className="flex items-center gap-1">
                  <CalendarCheck className="h-3 w-3" />
                  {formatDateTime(activity.updated_at)}
                </p>
                <p className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {activity.user_id ? 'Utilisateur authentifié' : 'Système'}
                </p>
              </div>
              <p className="text-[10px] pt-1 border-t border-border/50">
                Intégrée au bilan carbone officiel
              </p>
            </div>
          ),
        };

      case 'integrated':
        return {
          badge: (
            <Badge className="bg-primary/10 text-primary border-primary/30 cursor-default flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Intégré
            </Badge>
          ),
          tooltipContent: (
            <div className="space-y-1.5 text-xs">
              <p className="font-medium flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" />
                Donnée intégrée
              </p>
              <div className="space-y-0.5 text-muted-foreground">
                <p className="flex items-center gap-1">
                  <CalendarCheck className="h-3 w-3" />
                  {formatDateTime(activity.updated_at)}
                </p>
                <p className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {activity.user_id ? 'Utilisateur authentifié' : 'Système'}
                </p>
              </div>
              <p className="text-[10px] pt-1 border-t border-border/50">
                Consolidée dans le rapport final
              </p>
            </div>
          ),
        };

      default:
        return {
          badge: <Badge variant="secondary">{activity.status}</Badge>,
          tooltipContent: <p>Statut: {activity.status}</p>,
        };
    }
  };

  const { badge, tooltipContent } = getStatusContent();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

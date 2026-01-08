import { RSEAction, ActionStatus, STATUS_CONFIG } from '@/lib/rse/types';
import { RSEActionCard } from './RSEActionCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface RSEKanbanBoardProps {
  actions: RSEAction[];
  onStatusChange: (id: string, status: ActionStatus) => void;
  onEditAction: (action: RSEAction) => void;
}

const COLUMNS: ActionStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

export function RSEKanbanBoard({ actions, onStatusChange, onEditAction }: RSEKanbanBoardProps) {
  const getColumnActions = (status: ActionStatus) => 
    actions.filter(a => a.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map(status => {
        const columnActions = getColumnActions(status);
        const config = STATUS_CONFIG[status];
        
        return (
          <div key={status} className="flex flex-col">
            <div className={`p-3 rounded-t-lg ${config.bgColor} border-b`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${config.color}`}>
                  {config.label}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {columnActions.length}
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="flex-1 bg-muted/30 rounded-b-lg p-2 min-h-[400px] max-h-[600px]">
              <div className="space-y-3">
                {columnActions.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Aucune action
                  </p>
                ) : (
                  columnActions.map(action => (
                    <RSEActionCard
                      key={action.id}
                      action={action}
                      onStatusChange={onStatusChange}
                      onEdit={onEditAction}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}

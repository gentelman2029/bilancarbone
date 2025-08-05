import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { useActions } from "@/contexts/ActionsContext";
import { useNavigate } from "react-router-dom";

export const CarbonActionsTracking = () => {
  const { actions, getTotalImpact, getCompletedImpact, getActionsProgress } = useActions();
  const navigate = useNavigate();

  // Trier les actions par priorité et statut
  const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
  const statusOrder = { 'delayed': 0, 'in-progress': 1, 'planned': 2, 'completed': 3 };
  
  const sortedActions = [...actions].sort((a, b) => {
    if (a.status === 'delayed' && b.status !== 'delayed') return -1;
    if (b.status === 'delayed' && a.status !== 'delayed') return 1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const topActions = sortedActions.slice(0, 3);
  const totalImpact = getTotalImpact();
  const completedImpact = getCompletedImpact();
  const progressPercentage = getActionsProgress();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Terminée</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">En cours</Badge>;
      case 'planned':
        return <Badge variant="outline">Planifiée</Badge>;
      case 'delayed':
        return <Badge variant="destructive">En retard</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getActionIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'delayed': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (actions.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Plan d'Actions Carbone
            <Badge variant="outline" className="ml-auto">Aucune action</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun plan d'actions défini</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier plan d'actions pour réduire vos émissions carbone
            </p>
            <Button onClick={() => navigate('/actions')} className="gap-2">
              <Target className="w-4 h-4" />
              Créer un plan d'actions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          Plan d'Actions Carbone
          <Badge variant="outline" className="ml-auto">{actions.length} actions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métriques de synthèse */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Impact total</div>
                <div className="font-semibold">{totalImpact.toFixed(1)} tCO2e</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Impact réalisé</div>
                <div className="font-semibold">{completedImpact.toFixed(1)} tCO2e</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Progression</div>
                <div className="font-semibold">{progressPercentage.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression des actions</span>
              <span>{progressPercentage.toFixed(1)}% terminées</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Top 3 des actions prioritaires */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Actions prioritaires</h4>
            {topActions.map((action, index) => (
              <div key={action.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  {getActionIcon(action.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm truncate">{action.title}</div>
                      <span className={`text-xs font-medium ${getPriorityColor(action.priority)}`}>
                        {action.priority === 'high' ? 'Haute' : 
                         action.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {action.description}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{action.impact.toFixed(1)} tCO2e</span>
                        <span>{action.scope}</span>
                        {action.deadline && <span>Échéance: {new Date(action.deadline).toLocaleDateString()}</span>}
                      </div>
                      {getStatusBadge(action.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton d'accès au plan complet */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/actions')}
            >
              Voir le plan d'actions complet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
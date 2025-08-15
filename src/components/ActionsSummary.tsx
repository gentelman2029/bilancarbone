import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingDown, CheckCircle, Calculator, Euro, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useActions } from "@/contexts/ActionsContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const ActionsSummary = () => {
  const { 
    actions, 
    getTotalImpact, 
    getCompletedImpact, 
    getTotalCost, 
    getActionsProgress,
    getActionsByScope 
  } = useActions();

  const totalImpact = getTotalImpact();
  const completedImpact = getCompletedImpact();
  const totalCost = getTotalCost();
  const progressPercentage = getActionsProgress();

  // Données pour les graphiques
  const scopeData = [
    { 
      name: 'Scope 1', 
      actions: getActionsByScope('Scope 1').length,
      impact: getActionsByScope('Scope 1').reduce((sum, action) => sum + action.impact, 0),
      cost: getActionsByScope('Scope 1').reduce((sum, action) => sum + action.cost, 0),
      color: '#059669'
    },
    { 
      name: 'Scope 2', 
      actions: getActionsByScope('Scope 2').length,
      impact: getActionsByScope('Scope 2').reduce((sum, action) => sum + action.impact, 0),
      cost: getActionsByScope('Scope 2').reduce((sum, action) => sum + action.cost, 0),
      color: '#3B82F6'
    },
    { 
      name: 'Scope 3', 
      actions: getActionsByScope('Scope 3').length,
      impact: getActionsByScope('Scope 3').reduce((sum, action) => sum + action.impact, 0),
      cost: getActionsByScope('Scope 3').reduce((sum, action) => sum + action.cost, 0),
      color: '#EF4444'
    }
  ].filter(scope => scope.actions > 0);

  const statusData = [
    { name: 'Terminé', value: actions.filter(a => a.status === 'completed').length, color: '#059669' },
    { name: 'En cours', value: actions.filter(a => a.status === 'in-progress').length, color: '#3B82F6' },
    { name: 'Planifié', value: actions.filter(a => a.status === 'todo').length, color: '#F59E0B' },
    { name: 'En retard', value: actions.filter(a => a.status === 'delayed').length, color: '#EF4444' }
  ].filter(status => status.value > 0);

  const ROI = totalCost > 0 ? (totalImpact * 25 / totalCost) : 0; // ROI estimé (25€/tCO2e)

  if (actions.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card border shadow-card">
        <div className="text-center space-y-4">
          <Target className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Aucun plan d'actions</h3>
            <p className="text-muted-foreground">Créez votre premier plan d'actions carbone</p>
          </div>
          <Button asChild variant="eco">
            <Link to="/actions">
              <Target className="w-4 h-4 mr-2" />
              Créer mon plan d'actions
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Plan d'actions carbone</h3>
        <Button variant="outline" asChild>
          <Link to="/actions">Voir tout</Link>
        </Button>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalImpact.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">tCO2e réduction</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{completedImpact.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">tCO2e réalisé</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <Euro className="w-8 h-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{(totalCost / 1000).toFixed(0)}k€</p>
              <p className="text-sm text-muted-foreground">Investissement</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-success" />
            <div>
              <p className="text-2xl font-bold text-foreground">{ROI.toFixed(1)}x</p>
              <p className="text-sm text-muted-foreground">ROI carbone</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progression globale */}
      <Card className="p-6 bg-gradient-card border shadow-card">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-foreground">Progression du plan</h4>
            <Badge variant={progressPercentage > 75 ? "default" : progressPercentage > 50 ? "secondary" : "outline"}>
              {progressPercentage.toFixed(0)}% complété
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Actions terminées: </span>
              <span className="font-medium text-foreground">
                {actions.filter(a => a.status === 'completed').length}/{actions.length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Impact réalisé: </span>
              <span className="font-medium text-foreground">
                {((completedImpact / totalImpact) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact par scope */}
        <Card className="p-6 bg-gradient-card border shadow-card">
          <h4 className="text-lg font-semibold text-foreground mb-4">Impact par scope</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scopeData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-primary">
                          {payload[0].value} tCO2e
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scopeData.find(s => s.name === label)?.actions} actions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="impact" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Statut des actions */}
        <Card className="p-6 bg-gradient-card border shadow-card">
          <h4 className="text-lg font-semibold text-foreground mb-4">Statut des actions</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Actions urgentes */}
      {actions.filter(a => a.status === 'delayed').length > 0 && (
        <Card className="p-6 bg-gradient-card border border-destructive/20 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-destructive" />
            <h4 className="text-lg font-semibold text-foreground">Actions en retard</h4>
            <Badge variant="destructive">
              {actions.filter(a => a.status === 'delayed').length}
            </Badge>
          </div>
          <div className="space-y-3">
            {actions.filter(a => a.status === 'delayed').slice(0, 3).map(action => (
              <div key={action.id} className="flex justify-between items-center p-3 bg-destructive/5 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.scope} • -{action.impact} tCO2e</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-destructive font-medium">Échéance: {action.deadline}</p>
                  <p className="text-xs text-muted-foreground">{action.cost.toLocaleString()} €</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
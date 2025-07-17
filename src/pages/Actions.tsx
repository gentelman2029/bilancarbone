import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Calendar, TrendingDown, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const Actions = () => {
  const actions = [
    {
      id: 1,
      title: "Installation panneaux solaires",
      description: "Mise en place de 50 kW de panneaux photovoltaïques sur le toit principal",
      impact: 120,
      status: "completed",
      progress: 100,
      deadline: "2024-03-15",
      scope: "Scope 2",
      cost: "45,000 €"
    },
    {
      id: 2,
      title: "Optimisation éclairage LED",
      description: "Remplacement de 200 points lumineux par des LED haute efficacité",
      impact: 45,
      status: "in-progress",
      progress: 75,
      deadline: "2024-04-30",
      scope: "Scope 2",
      cost: "12,000 €"
    },
    {
      id: 3,
      title: "Formation éco-conduite",
      description: "Formation de 50 collaborateurs aux techniques d'éco-conduite",
      impact: 23,
      status: "planned",
      progress: 0,
      deadline: "2024-06-15",
      scope: "Scope 3",
      cost: "3,500 €"
    },
    {
      id: 4,
      title: "Isolation thermique des bureaux",
      description: "Amélioration de l'isolation pour réduire les besoins de chauffage",
      impact: 67,
      status: "delayed",
      progress: 25,
      deadline: "2024-05-20",
      scope: "Scope 1",
      cost: "28,000 €"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-accent" />;
      case "planned":
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
      case "delayed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-primary/10 text-primary">Terminé</Badge>;
      case "in-progress":
        return <Badge className="bg-accent/10 text-accent">En cours</Badge>;
      case "planned":
        return <Badge variant="secondary">Planifié</Badge>;
      case "delayed":
        return <Badge variant="destructive">En retard</Badge>;
      default:
        return <Badge variant="secondary">Non défini</Badge>;
    }
  };

  const totalImpact = actions.reduce((sum, action) => sum + action.impact, 0);
  const completedImpact = actions
    .filter(action => action.status === "completed")
    .reduce((sum, action) => sum + action.impact, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Plan d'actions carbone</h1>
          <p className="text-muted-foreground">Pilotez vos initiatives de réduction d'empreinte</p>
        </div>
        <Button variant="eco">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle action
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalImpact} tCO2e</p>
              <p className="text-sm text-muted-foreground">Potentiel total</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <TrendingDown className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{completedImpact} tCO2e</p>
              <p className="text-sm text-muted-foreground">Déjà réalisé</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round((completedImpact / totalImpact) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Progression</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {actions.map((action) => (
          <Card key={action.id} className="p-6 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {getStatusIcon(action.status)}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{action.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{action.description}</p>
                </div>
              </div>
              {getStatusBadge(action.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">-{action.impact} tCO2e</span>
                  <span className="text-muted-foreground">/an</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">{action.scope}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{action.deadline}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  <span className="font-medium text-foreground">{action.cost}</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-foreground">{action.progress}%</span>
              </div>
              <Progress value={action.progress} className="h-2" />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm">
                Modifier
              </Button>
              <Button variant="eco" size="sm">
                Voir détails
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
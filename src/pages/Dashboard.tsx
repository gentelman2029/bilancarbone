import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Target, Zap, Factory } from "lucide-react";

export const Dashboard = () => {
  const metrics = [
    {
      title: "Émissions totales",
      value: "1,247 tCO2e",
      change: "+12%",
      trend: "up",
      icon: Activity,
      color: "text-destructive"
    },
    {
      title: "Scope 1",
      value: "342 tCO2e",
      change: "-5%", 
      trend: "down",
      icon: Factory,
      color: "text-primary"
    },
    {
      title: "Scope 2",
      value: "445 tCO2e",
      change: "+8%",
      trend: "up", 
      icon: Zap,
      color: "text-accent"
    },
    {
      title: "Objectif 2024",
      value: "1,100 tCO2e",
      change: "88%",
      trend: "target",
      icon: Target,
      color: "text-primary"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Carbone</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre empreinte carbone</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-6 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
              <Badge 
                variant={metric.trend === "down" ? "secondary" : metric.trend === "target" ? "default" : "destructive"}
                className="flex items-center space-x-1"
              >
                {metric.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {metric.trend === "down" && <TrendingDown className="w-3 h-3" />}
                {metric.trend === "target" && <Target className="w-3 h-3" />}
                <span>{metric.change}</span>
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card border shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Progression vs Objectifs</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Réduction 2024</span>
                <span className="font-medium text-foreground">88% atteint</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Scope 1 - Combustion</span>
                <span className="font-medium text-foreground">75% atteint</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Scope 2 - Électricité</span>
                <span className="font-medium text-foreground">92% atteint</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions en cours</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Optimisation éclairage LED</p>
                <p className="text-sm text-muted-foreground">Impact: -45 tCO2e/an</p>
              </div>
              <Badge>En cours</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Formation éco-conduite</p>
                <p className="text-sm text-muted-foreground">Impact: -23 tCO2e/an</p>
              </div>
              <Badge variant="secondary">Planifié</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Panneaux solaires</p>
                <p className="text-sm text-muted-foreground">Impact: -120 tCO2e/an</p>
              </div>
              <Badge>Terminé</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
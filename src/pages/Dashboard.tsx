import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Target, Zap, Factory, PieChart, BarChart3, Edit, Eye, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Link } from "react-router-dom";
import { useEmissions } from "@/contexts/EmissionsContext";

export const Dashboard = () => {
  const { emissions, hasEmissions } = useEmissions();
  
  // Convertir en tonnes pour l'affichage
  const toTonnes = (kg: number) => (kg / 1000).toFixed(3);
  
  const metrics = [
    {
      title: "Émissions totales",
      value: hasEmissions ? `${toTonnes(emissions.total)} tCO2e` : "0 tCO2e",
      change: hasEmissions ? "+12%" : "0%",
      trend: hasEmissions ? "up" : "neutral",
      icon: Activity,
      color: "text-destructive"
    },
    {
      title: "Scope 1",
      value: hasEmissions ? `${toTonnes(emissions.scope1)} tCO2e` : "0 tCO2e",
      change: hasEmissions ? "-5%" : "0%", 
      trend: hasEmissions ? "down" : "neutral",
      icon: Factory,
      color: "text-primary"
    },
    {
      title: "Scope 2",
      value: hasEmissions ? `${toTonnes(emissions.scope2)} tCO2e` : "0 tCO2e",
      change: hasEmissions ? "+8%" : "0%",
      trend: hasEmissions ? "up" : "neutral", 
      icon: Zap,
      color: "text-accent"
    },
    {
      title: "Objectif 2024",
      value: "1,100 tCO2e",
      change: hasEmissions ? `${Math.round((emissions.total / 1100000) * 100)}%` : "0%",
      trend: "target",
      icon: Target,
      color: "text-primary"
    }
  ];

  // Données pour les graphiques basées sur les vraies données
  const emissionsByScope = hasEmissions ? [
    { name: "Scope 1", value: Math.round(emissions.scope1 / 1000), color: "#059669" },
    { name: "Scope 2", value: Math.round(emissions.scope2 / 1000), color: "#3B82F6" },
    { name: "Scope 3", value: Math.round(emissions.scope3 / 1000), color: "#EF4444" }
  ].filter(item => item.value > 0) : [
    { name: "Scope 1", value: 342, color: "#059669" },
    { name: "Scope 2", value: 445, color: "#3B82F6" },
    { name: "Scope 3", value: 460, color: "#EF4444" }
  ];

  const monthlyEmissions = [
    { month: "Jan", scope1: 35, scope2: 40, scope3: 38 },
    { month: "Fév", scope1: 32, scope2: 38, scope3: 40 },
    { month: "Mar", scope1: 30, scope2: 42, scope3: 39 },
    { month: "Avr", scope1: 28, scope2: 37, scope3: 41 },
    { month: "Mai", scope1: 26, scope2: 35, scope3: 38 },
    { month: "Jun", scope1: 25, scope2: 33, scope3: 36 }
  ];

  const interpretEmissions = (total: number) => {
    if (total > 1000) {
      return {
        level: "Élevé",
        color: "text-destructive",
        icon: AlertTriangle,
        message: "Vos émissions sont importantes. Il est urgent de mettre en place un plan de réduction ambitieux.",
        actions: ["Audit énergétique approfondi", "Plan de mobilité durable", "Transition énergétique"]
      };
    } else if (total > 500) {
      return {
        level: "Modéré",
        color: "text-warning",
        icon: Activity,
        message: "Vos émissions sont dans la moyenne. Des actions ciblées peuvent améliorer votre performance.",
        actions: ["Optimisation énergétique", "Sensibilisation équipes", "Mobilité douce"]
      };
    } else {
      return {
        level: "Faible",
        color: "text-success",
        icon: CheckCircle,
        message: "Félicitations ! Vos émissions sont relativement faibles. Maintenez vos efforts.",
        actions: ["Maintenir les bonnes pratiques", "Amélioration continue", "Certification environnementale"]
      };
    }
  };

  const interpretation = interpretEmissions(hasEmissions ? emissions.total : 1247);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Carbone</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre empreinte carbone</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/pricing">
              Tarification
            </Link>
          </Button>
          <Button variant="eco" asChild>
            <Link to="/data">
              <BarChart3 className="w-4 h-4 mr-2" />
              Interpréter les résultats
            </Link>
          </Button>
        </div>
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

      {/* Interprétation des émissions */}
      <Card className="p-6 bg-gradient-card border shadow-card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <interpretation.icon className={`w-6 h-6 ${interpretation.color}`} />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Interprétation de vos émissions</h3>
            <Badge variant={interpretation.level === "Élevé" ? "destructive" : interpretation.level === "Modéré" ? "secondary" : "default"}>
              Niveau {interpretation.level}
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">{interpretation.message}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {interpretation.actions.map((action, index) => (
            <div key={index} className="text-sm bg-secondary/50 rounded px-3 py-2">
              • {action}
            </div>
          ))}
        </div>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 bg-gradient-card border shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-primary" />
            <span>Répartition par Scope</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={emissionsByScope}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value} tCO2e`}
                >
                  {emissionsByScope.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Évolution mensuelle</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyEmissions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="scope1" stroke="#059669" name="Scope 1" />
                <Line type="monotone" dataKey="scope2" stroke="#3B82F6" name="Scope 2" />
                <Line type="monotone" dataKey="scope3" stroke="#EF4444" name="Scope 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Actions en cours</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle action
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">Optimisation éclairage LED</p>
                <p className="text-sm text-muted-foreground">Impact: -45 tCO2e/an</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>En cours</Badge>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">Formation éco-conduite</p>
                <p className="text-sm text-muted-foreground">Impact: -23 tCO2e/an</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Planifié</Badge>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">Panneaux solaires</p>
                <p className="text-sm text-muted-foreground">Impact: -120 tCO2e/an</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>Terminé</Badge>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
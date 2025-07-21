import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Target, Zap, Factory, PieChart, BarChart3, Edit, Eye, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Link } from "react-router-dom";
import { useEmissions } from "@/contexts/EmissionsContext";
import { ReportGenerator } from "@/components/ReportGenerator";

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
        
        {/* Benchmarking sectoriel */}
        <div className="bg-secondary/20 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-foreground mb-2">📊 Comparaison sectorielle</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{hasEmissions ? toTonnes(emissions.total) : "1.25"}</div>
              <div className="text-muted-foreground">Vos émissions (tCO2e)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">1.8</div>
              <div className="text-muted-foreground">Moyenne sectorielle</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">0.9</div>
              <div className="text-muted-foreground">Top 10% du secteur</div>
            </div>
          </div>
        </div>

        {/* Recommandations prioritaires */}
        <div className="mb-4">
          <h4 className="font-semibold text-foreground mb-3">🎯 Recommandations prioritaires</h4>
          <div className="space-y-3">
            {hasEmissions && emissions.scope1 > emissions.scope2 ? (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">🔥 Hot spot détecté: Scope 1</p>
                    <p className="text-sm text-muted-foreground">Vos émissions directes représentent {Math.round((emissions.scope1/emissions.total)*100)}% du total</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">-{Math.round(emissions.scope1/2000)} tCO2e</div>
                    <div className="text-xs text-muted-foreground">Potentiel réduction</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">⚡ Hot spot détecté: Scope 2</p>
                    <p className="text-sm text-muted-foreground">Votre consommation électrique représente {hasEmissions ? Math.round((emissions.scope2/emissions.total)*100) : 36}% du total</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">-{hasEmissions ? Math.round(emissions.scope2/3000) : 150} tCO2e</div>
                    <div className="text-xs text-muted-foreground">Potentiel réduction</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {interpretation.actions.map((action, index) => (
            <div key={index} className="text-sm bg-secondary/50 rounded px-3 py-2">
              • {action}
            </div>
          ))}
        </div>

        {/* Simulation de scénarios */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-foreground mb-3">🔮 Simulation d'impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-primary/5 rounded border border-primary/20">
              <div className="font-medium text-foreground">💡 Passage LED complet</div>
              <div className="text-primary">-12% d'émissions Scope 2</div>
              <div className="text-muted-foreground">ROI: 2.3 ans</div>
            </div>
            <div className="p-3 bg-primary/5 rounded border border-primary/20">
              <div className="font-medium text-foreground">🚗 Flotte électrique</div>
              <div className="text-primary">-25% d'émissions Scope 1</div>
              <div className="text-muted-foreground">ROI: 4.1 ans</div>
            </div>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => alert("Création d'une nouvelle action de réduction carbone")}
            >
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Modification de l'action 'Optimisation éclairage LED'")}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Détails de l'action: Remplacement de 200 spots par des LED. Investissement: 15 000€. ROI: 2.5 ans")}
                >
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Modification de l'action 'Formation éco-conduite'")}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Détails de l'action: Formation de 25 chauffeurs. Coût: 3 500€. Économies carburant: 15%")}
                >
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Modification de l'action 'Panneaux solaires'")}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => alert("Détails de l'action: Installation 50kW. Investissement: 45 000€. Production: 65 MWh/an")}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Nouveau composant pour les rapports intelligents */}
        <ReportGenerator />
      </div>
    </div>
  );
};
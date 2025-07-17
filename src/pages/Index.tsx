import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, BarChart3, Target, Shield, Users, Zap, TrendingDown, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-carbon.jpg";

const Index = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Bilan Carbone® automatisé",
      description: "Calcul précis de vos émissions selon les standards GHG Protocol et ISO 14064"
    },
    {
      icon: Target,
      title: "Pilotage des actions",
      description: "Suivez vos initiatives de réduction et mesurez leur impact en temps réel"
    },
    {
      icon: Shield,
      title: "Conformité réglementaire",
      description: "Rapports exportables conformes aux exigences CSRD et autres réglementations"
    },
    {
      icon: Users,
      title: "Collaboration équipe",
      description: "Accès multi-utilisateurs avec droits différenciés pour vos équipes"
    }
  ];

  const stats = [
    { value: "1000+", label: "Entreprises clientes" },
    { value: "2.5M", label: "tCO2e calculées" },
    { value: "98%", label: "Satisfaction client" },
    { value: "ISO 14064", label: "Certification" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-eco overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Leaf className="w-4 h-4 mr-2" />
                Plateforme SaaS certifiée
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Votre <span className="text-primary">Bilan Carbone®</span> simplifié
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  La plateforme tout-en-un pour calculer, suivre et réduire l'empreinte carbone de votre entreprise. 
                  Conformité réglementaire garantie.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/dashboard">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Démarrer gratuitement
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Target className="w-5 h-5 mr-2" />
                  Voir la démo
                </Button>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-3xl opacity-20 animate-float"></div>
              <img 
                src={heroImage} 
                alt="Bilan Carbone Dashboard"
                className="relative w-full rounded-2xl shadow-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Fonctionnalités
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin pour votre transition carbone
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète pour mesurer, analyser et réduire votre empreinte carbone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Votre Bilan Carbone® en 3 étapes
            </h2>
            <p className="text-xl text-muted-foreground">
              Un processus simple et guidé pour obtenir votre certification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">1. Collectez vos données</h3>
              <p className="text-muted-foreground">
                Import automatique ou saisie manuelle de vos consommations énergétiques
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">2. Analysez vos émissions</h3>
              <p className="text-muted-foreground">
                Calculs automatiques selon les facteurs d'émission ADEME et GHG Protocol
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <TrendingDown className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">3. Pilotez vos actions</h3>
              <p className="text-muted-foreground">
                Définissez et suivez votre plan de réduction d'empreinte carbone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Commencez votre transition carbone aujourd'hui
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Rejoignez plus de 1000 entreprises qui font confiance à CarbonTrack pour leur Bilan Carbone®
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/dashboard">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Essai gratuit 14 jours
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Demander une démo
              </Button>
            </div>

            <p className="text-sm opacity-75">
              Aucune carte bancaire requise • Configuration en 5 minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

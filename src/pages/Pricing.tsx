import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Star, Building, Users, Zap, Shield, BarChart3, Target, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      description: "Parfait pour les petites entreprises qui commencent",
      price: "99",
      period: "mois",
      badge: null,
      features: [
        "Calcul Scope 1 et 2",
        "Dashboard de base",
        "Export PDF",
        "Support email",
        "1 utilisateur",
        "Données jusqu'à 12 mois"
      ],
      limitations: [
        "Pas de Scope 3",
        "Pas d'API",
        "Pas de support téléphone"
      ],
      cta: "Commencer",
      variant: "outline" as const
    },
    {
      name: "Professional",
      description: "La solution complète pour les entreprises en croissance",
      price: "299",
      period: "mois",
      badge: "Populaire",
      features: [
        "Calcul Scope 1, 2 et 3 complet",
        "Dashboard avancé avec graphiques",
        "Export multi-formats (PDF, Excel, API)",
        "Support prioritaire (email + téléphone)",
        "Jusqu'à 10 utilisateurs",
        "Historique illimité",
        "Plan d'actions personnalisé",
        "Conformité CSRD",
        "Formation en ligne incluse"
      ],
      limitations: [],
      cta: "Essai gratuit",
      variant: "hero" as const
    },
    {
      name: "Enterprise",
      description: "Pour les grandes organisations avec des besoins avancés",
      price: "Sur devis",
      period: "",
      badge: "Sur mesure",
      features: [
        "Toutes les fonctionnalités Professional",
        "Utilisateurs illimités",
        "API dédiée et intégrations",
        "Support dédié 24/7",
        "Formation sur site",
        "Audit carbone personnalisé",
        "Reporting multi-sites",
        "Certification ISO 14064",
        "Accompagnement réglementaire",
        "SLA garantie 99.9%"
      ],
      limitations: [],
      cta: "Nous contacter",
      variant: "outline" as const
    }
  ];

  const faqs = [
    {
      question: "Quelle est la différence entre les Scopes 1, 2 et 3 ?",
      answer: "Scope 1 : émissions directes (combustion sur site), Scope 2 : émissions indirectes liées à l'énergie achetée, Scope 3 : toutes les autres émissions indirectes (transport, achats, déchets...)"
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement."
    },
    {
      question: "Y a-t-il des frais de configuration ?",
      answer: "Non, aucun frais de configuration. Nous incluons l'accompagnement initial dans tous nos plans."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Chiffrement SSL, hébergement sécurisé en Europe, conformité RGPD, audits de sécurité réguliers."
    },
    {
      question: "Proposez-vous une garantie ?",
      answer: "Oui, 30 jours satisfait ou remboursé sur tous nos plans payants."
    }
  ];

  const addons = [
    {
      name: "Audit carbone expert",
      description: "Audit complet par un consultant certifié",
      price: "2 500€",
      icon: Target
    },
    {
      name: "Formation équipe",
      description: "Formation sur site pour vos équipes",
      price: "1 200€",
      icon: Users
    },
    {
      name: "Certification ISO 14064",
      description: "Accompagnement à la certification",
      price: "3 500€",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-eco">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <BarChart3 className="w-4 h-4 mr-2" />
            Tarification transparente
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choisissez le plan qui vous convient
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Des solutions adaptées à chaque taille d'entreprise. Commencez gratuitement, évoluez selon vos besoins.
          </p>
        </div>

        {/* Plans de tarification */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 relative ${plan.badge === "Populaire" ? "ring-2 ring-primary scale-105" : ""}`}>
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  {plan.badge === "Populaire" && <Star className="w-3 h-3 mr-1" />}
                  {plan.badge}
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-4">
                  {plan.price !== "Sur devis" ? (
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-primary">{plan.price}€</span>
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-primary">{plan.price}</div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{limitation}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.variant} 
                size="lg" 
                className="w-full" 
                onClick={() => {
                  if (plan.name === "Professional") {
                    window.location.href = "/trial";
                  } else if (plan.name === "Enterprise") {
                    alert("Contactez-nous à contact@carbontrack.fr");
                  } else {
                    window.location.href = "/trial";
                  }
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Options supplémentaires */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Services d'accompagnement</h2>
            <p className="text-xl text-muted-foreground">
              Accélérez votre transition carbone avec nos experts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addons.map((addon, index) => (
              <Card key={index} className="p-6 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <addon.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{addon.name}</h3>
                    <p className="text-primary font-bold">{addon.price}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{addon.description}</p>
                <Button variant="outline" size="sm" onClick={() => alert("Contactez-nous pour ce service")}>
                  Commander
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Questions fréquentes</h2>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir sur nos tarifs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 bg-gradient-card border shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI et bénéfices business */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Retour sur investissement garanti</h2>
            <p className="text-xl text-muted-foreground">
              Nos clients récupèrent leur investissement en moins de 6 mois
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">6 mois</div>
              <div className="text-sm text-muted-foreground">ROI moyen</div>
            </Card>
            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">€35k</div>
              <div className="text-sm text-muted-foreground">Économies moyennes/an</div>
            </Card>
            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">-30%</div>
              <div className="text-sm text-muted-foreground">Réduction émissions</div>
            </Card>
            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Conformité CSRD</div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="p-8 bg-gradient-primary text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-xl mb-6 opacity-90">
              Rejoignez plus de 1000 entreprises qui font confiance à CarbonTrack
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/trial">
                  <Zap className="w-5 h-5 mr-2" />
                  Essai gratuit 14 jours
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => {
                  const email = "demo@carbontrack.fr";
                  const subject = "Demande de démonstration CarbonTrack";
                  const body = "Bonjour,\n\nJe souhaiterais planifier une démonstration de CarbonTrack pour mon entreprise.\n\nCordialement";
                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
              >
                Demander une démo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Leaf, BarChart3, Target, Shield, Users, Zap, TrendingDown, CheckCircle, Building, Eye, Search, FileText, Calculator, DollarSign, ClipboardCheck, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-carbon.jpg";
import teamSustainabilityImage from "@/assets/team-sustainability.jpg";
import { QuickCarbonCalculator } from "@/components/QuickCarbonCalculator";
import { CBAMChecker } from "@/components/CBAMChecker";
import { CSRDChecker } from "@/components/CSRDChecker";

const Index = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: BarChart3,
      title: t('home.features.bilan_title'),
      description: t('home.features.bilan_desc')
    },
    {
      icon: Target,
      title: t('home.features.pilotage_title'),
      description: t('home.features.pilotage_desc')
    },
    {
      icon: Shield,
      title: t('home.features.conformite_title'),
      description: t('home.features.conformite_desc')
    },
    {
      icon: Users,
      title: t('home.features.collaboration_title'),
      description: t('home.features.collaboration_desc')
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
                {t('home.hero.badge')}
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  {t('home.hero.title')} <span className="text-primary">{t('home.hero.title_highlight')}</span> {t('home.hero.title_end')}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t('home.hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/trial">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    {t('home.hero.cta_trial')}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">
                    <Target className="w-5 h-5 mr-2" />
                    {t('home.hero.cta_demo')}
                  </Link>
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

      {/* Message de sensibilisation */}
      <section className="py-16 bg-gradient-to-r from-destructive/10 to-primary/10 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full border border-destructive/20">
              <span className="text-2xl">🌍</span>
              <span className="font-semibold">{t('home.alert.badge')}</span>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {t('home.alert.title')}
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('home.alert.description')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-sm font-semibold text-foreground">{t('home.alert.cards.warming_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('home.alert.cards.warming_desc')}
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl mb-2">⚖️</div>
                <div className="text-sm font-semibold text-foreground">{t('home.alert.cards.regulation_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('home.alert.cards.regulation_desc')}
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl mb-2">💚</div>
                <div className="text-sm font-semibold text-foreground">{t('home.alert.cards.business_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t('home.alert.cards.business_desc')}
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {t('home.alert.cta_badge')}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              {t('home.features.badge')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
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
              {t('home.process.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('home.process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t('home.process.step1_title')}</h3>
              <p className="text-muted-foreground">
                {t('home.process.step1_desc')}
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t('home.process.step2_title')}</h3>
              <p className="text-muted-foreground">
                {t('home.process.step2_desc')}
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <TrendingDown className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t('home.process.step3_title')}</h3>
              <p className="text-muted-foreground">
                {t('home.process.step3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image équipe durabilité */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={teamSustainabilityImage} 
              alt="Équipe professionnelle travaillant sur l'analyse de l'empreinte carbone et le développement durable"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Études de cas */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              {t('home.case_studies.badge')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.case_studies.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('home.case_studies.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Building className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">PME Manufacturière - 150 employés</h3>
                  <p className="text-sm text-muted-foreground">Secteur automobile • Chiffre d'affaires 25M€</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">2,340</div>
                    <div className="text-sm text-muted-foreground">tCO2e avant</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">1,520</div>
                    <div className="text-sm text-muted-foreground">tCO2e après</div>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-lg font-bold text-primary text-center">-35% d'émissions en 18 mois</div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Actions mises en place :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Remplacement éclairage LED (-180 tCO2e)</li>
                    <li>• Optimisation flotte véhicules (-320 tCO2e)</li>
                    <li>• Installation panneaux solaires (-220 tCO2e)</li>
                    <li>• Formation éco-gestes équipes (-100 tCO2e)</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-primary font-semibold">
                    💰 Économies générées : 78 000€/an
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Entreprise de Services - 75 employés</h3>
                  <p className="text-sm text-muted-foreground">Conseil IT • Chiffre d'affaires 12M€</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">890</div>
                    <div className="text-sm text-muted-foreground">tCO2e avant</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">460</div>
                    <div className="text-sm text-muted-foreground">tCO2e après</div>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-lg font-bold text-primary text-center">-48% d'émissions en 12 mois</div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Actions mises en place :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Télétravail 3j/semaine (-240 tCO2e)</li>
                    <li>• Remplacement voyages par visio (-120 tCO2e)</li>
                    <li>• Fournisseur électricité verte (-50 tCO2e)</li>
                    <li>• Matériel IT reconditionné (-20 tCO2e)</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-primary font-semibold">
                    💰 Économies générées : 32 000€/an
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Proposition de valeur renforcée */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Pourquoi choisir CarbonTrack ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nous résolvons les défis les plus courants des entreprises en matière de bilan carbone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Complexité simplifiée</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Problème :</strong> Les normes carbone sont complexes<br/>
                <strong>Solution :</strong> Interface guidée, calculs automatiques
              </p>
              <div className="text-primary font-semibold">Configuration en 5 minutes</div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Coûts maîtrisés</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Problème :</strong> Consultants à 15 000€+<br/>
                <strong>Solution :</strong> À partir de 99€/mois tout inclus
              </p>
              <div className="text-primary font-semibold">90% moins cher qu'un consultant</div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Rapidité d'exécution</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Problème :</strong> 6 mois avec un consultant<br/>
                <strong>Solution :</strong> Bilan complet en 2 semaines
              </p>
              <div className="text-primary font-semibold">12x plus rapide</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Nouvelles sections demandées */}
      
      {/* Visualisation Section */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Eye className="w-4 h-4 mr-2" />
              Visualisation
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Visualisez l'impact environnemental de votre entreprise
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Suivez les émissions de votre entreprise à l'aide de graphiques et de tableaux de bord personnalisables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Tableaux de bord personnalisables</h3>
                  <p className="text-muted-foreground">
                    Visualisez vos progrès en matière de développement durable grâce à une analyse détaillée des tendances et à des comparaisons par périodes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Engagement des parties prenantes</h3>
                  <p className="text-muted-foreground">
                    Impliquez vos parties prenantes en partageant des données d'émissions précises avec des visualisations claires et percutantes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Suivi des tendances</h3>
                  <p className="text-muted-foreground">
                    Analysez l'évolution de vos émissions dans le temps avec des graphiques interactifs et des métriques de performance.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Identification points chauds Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Search className="w-4 h-4 mr-2" />
              Analyse
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Identifiez les points chauds d'émissions et leurs origines
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Analyse et visualisation détaillées des données pour cibler vos efforts de décarbonation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Décomposition par source</h3>
                  <p className="text-muted-foreground">
                    Identifiez la source de vos émissions en décomposant votre empreinte carbone par département, installation, projet ou toute autre dimension spécifique.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Optimisation ciblée</h3>
                  <p className="text-muted-foreground">
                    Ciblez vos efforts de décarbonation pour un maximum d'impact en utilisant des informations approfondies sur vos données d'émissions.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparence Section */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Transparence
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Apportez de la transparence à vos données d'émissions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une plateforme centralisée pour organiser et auditer toutes vos données carbone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Centralisation des données</h3>
                  <p className="text-muted-foreground">
                    Téléchargez toutes vos données d'émissions sur une seule plateforme, organisées par scopes 1, 2 et 3 et par catégories d'émissions pour une visibilité complète.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Organisation multi-niveaux</h3>
                  <p className="text-muted-foreground">
                    Organisez vos données par département, installation ou filiale pour suivre les émissions à tous les niveaux de l'organisation.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Prêt pour les audits</h3>
                  <p className="text-muted-foreground">
                    Soyez toujours prêt pour les audits et conformez-vous facilement avec des rapports détaillés et des ressources éducatives intégrées.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ressources Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <FileText className="w-4 h-4 mr-2" />
              Ressources
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Outils et ressources essentiels
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Accédez à nos calculateurs et outils d'évaluation spécialisés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Calculateur Carbone Rapide</h3>
                <p className="text-muted-foreground">
                  Estimez rapidement votre empreinte carbone avec notre calculateur intégré basé sur les derniers facteurs d'émission.
                </p>
                <QuickCarbonCalculator />
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">CBAM Checker</h3>
                <p className="text-muted-foreground">
                  Estimez vos futurs coûts MACF et les économies potentielles avec notre outil d'évaluation du mécanisme d'ajustement carbone aux frontières.
                </p>
                <CBAMChecker />
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <ClipboardCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">CSRD Checker</h3>
                <p className="text-muted-foreground">
                  Vérifiez votre conformité aux nouvelles exigences de reporting de durabilité et préparez-vous à la directive CSRD.
                </p>
                <CSRDChecker />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Support
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Questions fréquemment posées
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions les plus courantes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-gradient-card border shadow-card rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Qu'est-ce qu'un calculateur d'empreinte carbone?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Un calculateur d'empreinte carbone est un outil qui permet de quantifier les émissions de gaz à effet de serre générées par les activités d'une entreprise. Il mesure les émissions directes (Scope 1), indirectes liées à l'énergie (Scope 2) et autres émissions indirectes (Scope 3) selon les standards internationaux comme le GHG Protocol.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-gradient-card border shadow-card rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Quels sont les avantages d'un logiciel permettant de calculer l'empreinte carbone d'une entreprise ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Un logiciel de calcul d'empreinte carbone offre plusieurs avantages : automatisation des calculs, gain de temps considérable, précision des données, suivi en temps réel, génération de rapports conformes aux réglementations, identification des leviers de réduction, et aide à la prise de décision stratégique pour la transition écologique.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-gradient-card border shadow-card rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Comment la plateforme de développement durable de Carbontrack aide-t-elle les entreprises à mesurer leurs émissions ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Notre plateforme Carbontrack simplifie la mesure des émissions grâce à une interface intuitive, des facteurs d'émission actualisés automatiquement, l'intégration avec vos systèmes existants, des tableaux de bord personnalisables, et un accompagnement expert pour interpréter les résultats et définir un plan d'action.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-gradient-card border shadow-card rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Carbontrack permet-elle de calculer les émissions de scopes 1, 2 et 3 ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Oui, Carbontrack couvre l'intégralité des émissions selon la méthodologie GHG Protocol : Scope 1 (émissions directes), Scope 2 (électricité, chauffage, refroidissement), et Scope 3 (chaîne de valeur complète). Notre plateforme inclut plus de 15 catégories du Scope 3 pour une mesure exhaustive.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-gradient-card border shadow-card rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Quelles sont les principales caractéristiques du logiciel de bilan carbone ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Les principales caractéristiques incluent : calcul automatisé selon les normes ISO 14064 et GHG Protocol, interface collaborative multi-utilisateurs, tableaux de bord personnalisables, génération de rapports conformes CSRD, suivi des actions de réduction, alertes et notifications, API pour l'intégration, et support expert inclus.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-gradient-card border shadow-card rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Pourquoi les entreprises doivent-elles calculer leur empreinte carbone ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Le calcul de l'empreinte carbone est devenu essentiel pour : respecter les nouvelles réglementations (CSRD, taxonomie européenne), répondre aux attentes des investisseurs et clients, identifier des opportunités d'économies, améliorer sa compétitivité, contribuer aux objectifs climatiques, et préparer l'avenir face aux enjeux environnementaux.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                Rejoignez plus de 1000 entreprises qui font confiance à Carbontrack pour leur Bilan Carbone®
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/trial">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Essai gratuit 14 jours
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link to="/contact">
                  Demander une démo
                </Link>
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

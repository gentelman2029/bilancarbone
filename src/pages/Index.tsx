import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Leaf, BarChart3, Target, Shield, Users, Zap, TrendingDown, CheckCircle, 
  Building, Eye, Search, FileText, Calculator, DollarSign, ClipboardCheck,
  Activity, Gauge, Globe, Scale, Landmark, Factory, BrainCircuit, ArrowRight,
  ScanLine, Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-carbon.jpg";
import teamSustainabilityImage from "@/assets/team-sustainability.jpg";
import { QuickCarbonCalculator } from "@/components/QuickCarbonCalculator";
import { CBAMChecker } from "@/components/CBAMChecker";
import { CSRDChecker } from "@/components/CSRDChecker";

const modules = [
  {
    icon: BarChart3,
    title: "Bilan Carbone",
    subtitle: "Scopes 1, 2, 3 & Trajectoire 1.5°C",
    description: "Calculez et suivez vos émissions GES selon le GHG Protocol. Modélisez votre trajectoire de décarbonation alignée sur les objectifs SBTi.",
    link: "/calculator",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-500/40",
    tag: "Mesure",
  },
  {
    icon: FileText,
    title: "Module CSRD",
    subtitle: "Double matérialité & Reporting extra-financier",
    description: "Préparez votre reporting de durabilité conforme à la directive européenne CSRD avec l'analyse de double matérialité intégrée.",
    link: "/esg",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-500/40",
    tag: "Réglementation",
  },
  {
    icon: Scale,
    title: "Module CBAM / MACF",
    subtitle: "Conformité taxe carbone frontières",
    description: "Gérez vos obligations CBAM : déclarations trimestrielles, calcul des émissions intrinsèques et suivi des certificats carbone.",
    link: "/cbam",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-500/40",
    tag: "Réglementation",
  },
  {
    icon: Users,
    title: "Pilotage RSE",
    subtitle: "Indicateurs Sociaux & Gouvernance",
    description: "Pilotez vos indicateurs ESG, cartographiez vos parties prenantes et suivez votre plan d'actions RSE avec des KPIs en temps réel.",
    link: "/rse-pilotage",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    borderColor: "hover:border-violet-500/40",
    tag: "Action",
  },
  {
    icon: Gauge,
    title: "Pilotage Énergétique",
    subtitle: "Suivi des consommations temps réel",
    description: "Surveillez vos consommations énergétiques en temps réel grâce au jumeau numérique et simulez des scénarios de réduction.",
    link: "/digital-twin",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    borderColor: "hover:border-orange-500/40",
    tag: "Mesure",
  },
  {
    icon: ScanLine,
    title: "Collecte Automatisée",
    subtitle: "OCR & Import intelligent de données",
    description: "Automatisez la collecte de vos données carbone par OCR sur factures, import comptable CSV et extraction intelligente de documents.",
    link: "/data-ocr",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    borderColor: "hover:border-cyan-500/40",
    tag: "Mesure",
  },
];

const tagColors: Record<string, string> = {
  "Mesure": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "Réglementation": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  "Action": "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
};

const Index = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "1000+", label: t('home.stats.clients') },
    { value: "2.5M", label: t('home.stats.co2_calculated') },
    { value: "98%", label: t('home.stats.satisfaction') },
    { value: "ISO 14064", label: t('home.stats.certification') }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section — ESG Platform */}
      <section className="relative py-20 lg:py-32 bg-gradient-eco overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Layers className="w-4 h-4 mr-2" />
                Plateforme multi-modules ESG
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Plateforme de <span className="text-primary">Pilotage ESG</span> & Conformité
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Centralisez la mesure carbone, la conformité réglementaire (CSRD, CBAM) et le pilotage RSE dans une seule plateforme. Données environnementales, sociales et de gouvernance unifiées.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/trial">
                    <Zap className="w-5 h-5 mr-2" />
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

              {/* Stats inline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-primary">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-3xl opacity-20 animate-float"></div>
              <img 
                src={heroImage} 
                alt="Plateforme ESG GreenInsight - Dashboard de pilotage"
                className="relative w-full rounded-2xl shadow-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <BrainCircuit className="w-4 h-4 mr-2" />
              Écosystème complet
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              6 modules intégrés pour votre stratégie ESG
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Données environnementales, sociales et financières dans une plateforme unifiée
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, index) => (
              <Link key={index} to={mod.link} className="group">
                <Card className={`p-6 h-full bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 ${mod.borderColor} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${mod.color}`}>
                      <mod.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className={`text-xs ${tagColors[mod.tag] || ""}`}>
                      {mod.tag}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{mod.title}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{mod.subtitle}</p>
                  <p className="text-sm text-muted-foreground mb-4">{mod.description}</p>
                  <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Accéder au module <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
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
                <div className="text-xs text-muted-foreground mt-1">{t('home.alert.cards.warming_desc')}</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl mb-2">⚖️</div>
                <div className="text-sm font-semibold text-foreground">{t('home.alert.cards.regulation_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('home.alert.cards.regulation_desc')}</div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-2xl mb-2">💚</div>
                <div className="text-sm font-semibold text-foreground">{t('home.alert.cards.business_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('home.alert.cards.business_desc')}</div>
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
                  <div className="text-sm text-primary font-semibold">💰 Économies générées : 78 000€/an</div>
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
                  <div className="text-sm text-primary font-semibold">💰 Économies générées : 32 000€/an</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pourquoi GreenInsight */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.why_choose.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home.why_choose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.why_choose.complexity_title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>{t('home.why_choose.complexity_problem')}</strong> {t('home.why_choose.complexity_problem_desc')}<br/>
                <strong>{t('home.why_choose.complexity_solution')}</strong> {t('home.why_choose.complexity_solution_desc')}
              </p>
              <div className="text-primary font-semibold">{t('home.why_choose.complexity_result')}</div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.why_choose.cost_title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>{t('home.why_choose.complexity_problem')}</strong> {t('home.why_choose.cost_problem')}<br/>
                <strong>{t('home.why_choose.complexity_solution')}</strong> {t('home.why_choose.cost_solution')}
              </p>
              <div className="text-primary font-semibold">{t('home.why_choose.cost_result')}</div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.why_choose.speed_title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>{t('home.why_choose.complexity_problem')}</strong> {t('home.why_choose.speed_problem')}<br/>
                <strong>{t('home.why_choose.complexity_solution')}</strong> {t('home.why_choose.speed_solution')}
              </p>
              <div className="text-primary font-semibold">{t('home.why_choose.speed_result')}</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Image équipe */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={teamSustainabilityImage} 
              alt="Équipe professionnelle travaillant sur la stratégie ESG et le développement durable"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Ressources Section */}
      <section className="py-20 bg-gradient-eco">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <FileText className="w-4 h-4 mr-2" />
              {t('home.resources.badge')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.resources.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home.resources.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('home.resources.quick_calc_title')}</h3>
                <p className="text-muted-foreground">{t('home.resources.quick_calc_desc')}</p>
                <QuickCarbonCalculator />
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('home.resources.cbam_title')}</h3>
                <p className="text-muted-foreground">{t('home.resources.cbam_desc')}</p>
                <CBAMChecker />
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border shadow-card hover:shadow-eco transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <ClipboardCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('home.resources.csrd_title')}</h3>
                <p className="text-muted-foreground">{t('home.resources.csrd_desc')}</p>
                <CSRDChecker />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              {t('home.faq.badge')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.faq.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home.faq.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[1,2,3,4,5,6].map(i => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-gradient-card border shadow-card rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                    {t(`home.faq.q${i}_title`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    {t(`home.faq.q${i}_answer`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
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
                {t('home.cta.title')}
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                {t('home.cta.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/trial">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t('home.cta.trial_button')}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link to="/contact">
                  {t('home.cta.demo_button')}
                </Link>
              </Button>
            </div>

            <p className="text-sm opacity-75">
              {t('home.cta.no_card')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

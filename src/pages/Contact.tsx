import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: "Demande de démo envoyée !",
      description: "Nous vous contacterons dans les 24h pour organiser votre démonstration personnalisée.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
            <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Merci pour votre demande !
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Votre demande de démonstration a été envoyée avec succès. Notre équipe d'experts vous contactera dans les 24h pour organiser une démonstration personnalisée de notre solution.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Réponse sous 24h garantie</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Démonstration personnalisée de 30 minutes</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Analyse de vos besoins spécifiques</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Demande de Démonstration
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment notre solution Power BI peut transformer votre reporting carbone en tableaux de bord interactifs et intelligents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-background to-secondary/10 border border-primary/10">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Informations de contact
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" placeholder="Votre prénom" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" placeholder="Votre nom" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input id="email" type="email" placeholder="votre.email@entreprise.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="+216 93 460 745" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise *</Label>
                  <Input id="company" placeholder="Nom de votre entreprise" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Secteur d'activité</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="industry">Industrie</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="retail">Commerce</SelectItem>
                        <SelectItem value="transport">Transport & Logistique</SelectItem>
                        <SelectItem value="construction">BTP</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="tech">Technologie</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Taille de l'entreprise</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre d'employés" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employés</SelectItem>
                        <SelectItem value="11-50">11-50 employés</SelectItem>
                        <SelectItem value="51-200">51-200 employés</SelectItem>
                        <SelectItem value="201-1000">201-1000 employés</SelectItem>
                        <SelectItem value="1000+">Plus de 1000 employés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="needs">Vos besoins spécifiques</Label>
                  <Textarea 
                    id="needs" 
                    placeholder="Décrivez vos défis actuels en matière de reporting carbone et vos objectifs..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Calendrier de mise en œuvre</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Quand souhaitez-vous démarrer ?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiatement</SelectItem>
                      <SelectItem value="1-3months">Dans 1-3 mois</SelectItem>
                      <SelectItem value="3-6months">Dans 3-6 mois</SelectItem>
                      <SelectItem value="6-12months">Dans 6-12 mois</SelectItem>
                      <SelectItem value="exploration">En phase d'exploration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Demander une démonstration
                </Button>
              </form>
            </Card>
          </div>

          {/* Informations et avantages */}
          <div className="space-y-6">
            {/* Contact direct */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Contact direct
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Carbontrack2025@protonmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">+216 93 460 745</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">75 rue de Rivoli<br />75001 Paris</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Ce que vous obtiendrez */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/10">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Ce que vous obtiendrez
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Démonstration personnalisée</p>
                    <p className="text-xs text-muted-foreground">Adaptée à votre secteur et vos besoins</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Analyse de vos données</p>
                    <p className="text-xs text-muted-foreground">Simulation sur vos propres données</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Roadmap personnalisée</p>
                    <p className="text-xs text-muted-foreground">Plan de déploiement sur mesure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Accès test gratuit</p>
                    <p className="text-xs text-muted-foreground">15 jours d'essai sur votre environnement</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Temps de réponse */}
            <Card className="p-6 bg-gradient-to-br from-success/5 to-primary/5 border border-success/20">
              <div className="text-center">
                <Clock className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Réponse garantie
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Notre équipe vous contactera dans les
                </p>
                <Badge variant="default" className="text-lg font-bold px-4 py-2">
                  24 heures
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
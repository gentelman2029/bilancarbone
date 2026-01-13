import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building, Users, Mail, Phone, MapPin, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Trial = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    employeeCount: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    country: "",
    city: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande d'essai gratuit envoyée !",
      description: "Nous vous contacterons dans les 24h pour configurer votre compte.",
      variant: "default"
    });
  };

  const benefits = [
    "14 jours d'accès complet gratuit",
    "Calcul automatique des émissions Scope 1, 2 et 3", 
    "Tableaux de bord et rapports détaillés",
    "Support prioritaire par email et téléphone",
    "Formation en ligne incluse",
    "Aucune carte bancaire requise"
  ];

  return (
    <div className="min-h-screen bg-gradient-eco">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Essai gratuit 14 jours
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Démarrez votre <span className="text-primary">Bilan Carbone®</span> aujourd'hui
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Testez notre plateforme gratuitement pendant 14 jours. Aucun engagement, aucune carte bancaire requise.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <Card className="p-8 bg-gradient-card border shadow-card">
              <h2 className="text-2xl font-bold text-foreground mb-6">Commencer l'essai gratuit</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Secteur d'activité *</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Industrie manufacturière</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="retail">Commerce de détail</SelectItem>
                      <SelectItem value="technology">Technologie</SelectItem>
                      <SelectItem value="healthcare">Santé</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="construction">BTP</SelectItem>
                      <SelectItem value="logistics">Transport et logistique</SelectItem>
                      <SelectItem value="energy">Énergie</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employeeCount">Nombre d'employés *</Label>
                  <Select value={formData.employeeCount} onValueChange={(value) => setFormData({...formData, employeeCount: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Taille de l'entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employés</SelectItem>
                      <SelectItem value="11-50">11-50 employés</SelectItem>
                      <SelectItem value="51-200">51-200 employés</SelectItem>
                      <SelectItem value="201-500">201-500 employés</SelectItem>
                      <SelectItem value="501-1000">501-1000 employés</SelectItem>
                      <SelectItem value="1000+">Plus de 1000 employés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Pays *</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="france">France</SelectItem>
                        <SelectItem value="tunisia">Tunisie</SelectItem>
                        <SelectItem value="belgium">Belgique</SelectItem>
                        <SelectItem value="switzerland">Suisse</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="morocco">Maroc</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Démarrer l'essai gratuit 14 jours
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </form>
            </Card>

            {/* Avantages */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-card border shadow-card">
                <h3 className="text-xl font-semibold text-foreground mb-4">Ce que comprend votre essai gratuit</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card border shadow-card">
                <h3 className="text-xl font-semibold text-foreground mb-4">Support dédié</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">GreenInsight2025@protonmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      <p className="text-sm text-muted-foreground">+216 93 460 745</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Formation en ligne</p>
                      <p className="text-sm text-muted-foreground">Sessions hebdomadaires</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card border shadow-card">
                <h3 className="text-xl font-semibold text-foreground mb-4">Questions fréquentes</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground text-sm">Puis-je annuler à tout moment ?</p>
                    <p className="text-sm text-muted-foreground">Oui, aucun engagement. Vous pouvez arrêter à tout moment.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Mes données sont-elles sécurisées ?</p>
                    <p className="text-sm text-muted-foreground">Chiffrement SSL, hébergement sécurisé en Europe, conformité RGPD.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Puis-je importer mes données existantes ?</p>
                    <p className="text-sm text-muted-foreground">Oui, nous supportons Excel, CSV et de nombreuses APIs.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trial;
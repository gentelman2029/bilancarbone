import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Zap, ExternalLink } from "lucide-react";

interface PowerBIDashboardProps {
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

export const PowerBIDashboard: React.FC<PowerBIDashboardProps> = ({
  totalEmissions,
  scope1,
  scope2,
  scope3
}) => {
  const [accessRequest, setAccessRequest] = useState({ name: "", email: "", company: "", message: "" });
  const { toast } = useToast();

  // Données pour les graphiques Power BI
  const emissionsData = [
    { scope: 'Scope 1', emissions: Math.round(scope1 / 1000), percentage: Math.round((scope1 / totalEmissions) * 100) },
    { scope: 'Scope 2', emissions: Math.round(scope2 / 1000), percentage: Math.round((scope2 / totalEmissions) * 100) },
    { scope: 'Scope 3', emissions: Math.round(scope3 / 1000), percentage: Math.round((scope3 / totalEmissions) * 100) }
  ];

  const totalTonnes = Math.round(totalEmissions / 1000);

  // Fonction pour demander l'accès au dashboard avancé
  const requestDashboardAccess = async () => {
    if (!accessRequest.name || !accessRequest.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Envoyer la demande d'accès par email
      const subject = encodeURIComponent("Demande d'accès - Dashboard Avancé Carbontrack");
      const body = encodeURIComponent(`
Nouvelle demande d'accès au dashboard avancé:

Nom: ${accessRequest.name}
Email: ${accessRequest.email}
Entreprise: ${accessRequest.company}
Message: ${accessRequest.message}

Données utilisateur:
- Émissions totales: ${(totalEmissions / 1000).toFixed(1)} tCO2e
- Date de demande: ${new Date().toLocaleDateString('fr-FR')}
      `);
      
      window.open(`mailto:Carbontrack2025@protonmail.com?subject=${subject}&body=${body}`);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'accès a été transmise à notre équipe",
      });
      
      // Réinitialiser le formulaire
      setAccessRequest({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dashboard Interactif</h2>
              <p className="text-sm text-gray-600">Visualisations avancées de vos données carbone</p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Temps réel
          </Badge>
        </div>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalTonnes}</div>
          <div className="text-sm text-muted-foreground">Total tCO2e</div>
        </Card>
        {emissionsData.map((data, index) => (
          <Card key={index} className="p-4 text-center">
            <div className="text-xl font-bold text-foreground">{data.emissions}</div>
            <div className="text-sm text-muted-foreground">{data.scope}</div>
            <div className="text-xs text-primary font-semibold">{data.percentage}%</div>
          </Card>
        ))}
      </div>

      {/* Graphiques interactifs simulés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique à barres */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Répartition par Scope
          </h3>
          <div className="space-y-3">
            {emissionsData.map((data, index) => {
              const colors = ['bg-red-500', 'bg-orange-500', 'bg-blue-500'];
              const widthPercentage = (data.emissions / Math.max(...emissionsData.map(d => d.emissions))) * 100;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{data.scope}</span>
                    <span className="text-muted-foreground">{data.emissions} tCO2e</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${colors[index]} transition-all duration-1000 ease-out`}
                      style={{ width: `${widthPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Graphique en secteurs simulé */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Analyse de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                {/* Cercle de base */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  {/* Scope 1 */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${emissionsData[0].percentage}, 100`}
                  />
                  {/* Scope 2 */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeDasharray={`${emissionsData[1].percentage}, 100`}
                    strokeDashoffset={-emissionsData[0].percentage}
                  />
                  {/* Scope 3 */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${emissionsData[2].percentage}, 100`}
                    strokeDashoffset={-(emissionsData[0].percentage + emissionsData[1].percentage)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold">{totalTonnes}</div>
                    <div className="text-xs text-muted-foreground">tCO2e</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {emissionsData.map((data, index) => {
                const colors = ['text-red-500', 'text-orange-500', 'text-blue-500'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index].replace('text', 'bg')}`}></div>
                      <span className="text-sm">{data.scope}</span>
                    </div>
                    <span className="text-sm font-medium">{data.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Actualiser les données</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Analyser les tendances</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <ExternalLink className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Rapport détaillé</span>
          </Button>
        </div>
      </Card>

      {/* Information sur la fonctionnalité Power BI */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Dashboard Avancé Disponible
            </h3>
            <p className="text-purple-700 text-sm mb-4">
              Votre dashboard interactif personnalisé sera disponible sous 48h avec des visualisations avancées,
              des analyses prédictives et des recommandations automatisées basées sur vos données.
            </p>
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Demander l'accès
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Demander l'accès au Dashboard Avancé</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="access-name">Nom complet *</Label>
                      <Input
                        id="access-name"
                        value={accessRequest.name}
                        onChange={(e) => setAccessRequest({...accessRequest, name: e.target.value})}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="access-email">Email *</Label>
                      <Input
                        id="access-email"
                        type="email"
                        value={accessRequest.email}
                        onChange={(e) => setAccessRequest({...accessRequest, email: e.target.value})}
                        placeholder="votre.email@entreprise.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="access-company">Entreprise</Label>
                      <Input
                        id="access-company"
                        value={accessRequest.company}
                        onChange={(e) => setAccessRequest({...accessRequest, company: e.target.value})}
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div>
                      <Label htmlFor="access-message">Message</Label>
                      <Textarea
                        id="access-message"
                        value={accessRequest.message}
                        onChange={(e) => setAccessRequest({...accessRequest, message: e.target.value})}
                        placeholder="Décrivez vos besoins spécifiques..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={requestDashboardAccess} className="w-full">
                      Envoyer la demande
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Badge variant="outline" className="border-purple-200 text-purple-700">
                Inclus dans votre abonnement
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
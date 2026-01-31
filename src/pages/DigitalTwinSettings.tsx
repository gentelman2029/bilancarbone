import { Settings, Building, Zap, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";

const DigitalTwinSettings = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Configuration du Jumeau Numérique</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Informations Installation
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Données de base de votre site industriel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nom du Site</Label>
                  <Input 
                    defaultValue="Usine Sousse - Zone Industrielle" 
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Consommation Annuelle (MWh)</Label>
                  <Input 
                    type="number"
                    defaultValue="4500" 
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Surface Toiture Disponible (m²)</Label>
                  <Input 
                    type="number"
                    defaultValue="8000" 
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Paramètres Tarifaires
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configuration des tarifs STEG
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Tarif Actuel (TND/kWh)</Label>
                  <Input 
                    type="number"
                    step="0.001"
                    defaultValue="0.285" 
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Puissance Souscrite (kVA)</Label>
                  <Input 
                    type="number"
                    defaultValue="500" 
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Régime Haute Tension</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Alertes et rappels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Alertes Pic de Consommation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Rappels Échéances CBAM</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Rapport Hebdomadaire</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Intégrations
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Connexions externes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">API Compteur IoT</p>
                    <p className="text-sm text-primary">Connecté</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-border">
                    Configurer
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Export ERP</p>
                    <p className="text-sm text-muted-foreground">Non configuré</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-border">
                    Activer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button className="bg-primary hover:bg-primary/90">
              Sauvegarder les Paramètres
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DigitalTwinSettings;

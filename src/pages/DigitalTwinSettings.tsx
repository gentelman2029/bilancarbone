import { Settings, Building, Zap, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";

const DigitalTwinSettings = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Paramètres</h1>
            <p className="text-slate-400">Configuration du Jumeau Numérique</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-500" />
                  Informations Installation
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Données de base de votre site industriel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nom du Site</Label>
                  <Input 
                    defaultValue="Usine Sousse - Zone Industrielle" 
                    className="bg-slate-900 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Consommation Annuelle (MWh)</Label>
                  <Input 
                    type="number"
                    defaultValue="4500" 
                    className="bg-slate-900 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Surface Toiture Disponible (m²)</Label>
                  <Input 
                    type="number"
                    defaultValue="8000" 
                    className="bg-slate-900 border-slate-600 text-slate-100"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Paramètres Tarifaires
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configuration des tarifs STEG
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Tarif Actuel (TND/kWh)</Label>
                  <Input 
                    type="number"
                    step="0.001"
                    defaultValue="0.285" 
                    className="bg-slate-900 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Puissance Souscrite (kVA)</Label>
                  <Input 
                    type="number"
                    defaultValue="500" 
                    className="bg-slate-900 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Régime Haute Tension</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Alertes et rappels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Alertes Pic de Consommation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Rappels Échéances CBAM</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Rapport Hebdomadaire</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Intégrations
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Connexions externes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">API Compteur IoT</p>
                    <p className="text-sm text-emerald-400">Connecté</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    Configurer
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">Export ERP</p>
                    <p className="text-sm text-slate-400">Non configuré</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    Activer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Sauvegarder les Paramètres
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DigitalTwinSettings;

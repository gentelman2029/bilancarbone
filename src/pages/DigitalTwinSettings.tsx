import { Settings, Building, Zap, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";
import { DigitalTwinThemeProvider, useDigitalTwinTheme } from "@/contexts/DigitalTwinThemeContext";
import { cn } from "@/lib/utils";

const DigitalTwinSettingsContent = () => {
  const { theme } = useDigitalTwinTheme();
  const isDark = theme === "dark";

  return (
    <div className={cn(
      "min-h-screen flex",
      isDark ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-gray-900"
    )}>
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-gray-900")}>Paramètres</h1>
            <p className={isDark ? "text-slate-400" : "text-gray-500"}>Configuration du Jumeau Numérique</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-slate-100" : "text-gray-900")}>
                  <Building className="h-5 w-5 text-emerald-500" />
                  Informations Installation
                </CardTitle>
                <CardDescription className={isDark ? "text-slate-400" : "text-gray-500"}>
                  Données de base de votre site industriel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Nom du Site</Label>
                  <Input 
                    defaultValue="Usine Sousse - Zone Industrielle" 
                    className={isDark ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Consommation Annuelle (MWh)</Label>
                  <Input 
                    type="number"
                    defaultValue="4500" 
                    className={isDark ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Surface Toiture Disponible (m²)</Label>
                  <Input 
                    type="number"
                    defaultValue="8000" 
                    className={isDark ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-slate-100" : "text-gray-900")}>
                  <Zap className="h-5 w-5 text-amber-500" />
                  Paramètres Tarifaires
                </CardTitle>
                <CardDescription className={isDark ? "text-slate-400" : "text-gray-500"}>
                  Configuration des tarifs STEG
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Tarif Actuel (TND/kWh)</Label>
                  <Input 
                    type="number"
                    step="0.001"
                    defaultValue="0.285" 
                    className={isDark ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Puissance Souscrite (kVA)</Label>
                  <Input 
                    type="number"
                    defaultValue="500" 
                    className={isDark ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-white border-gray-300 text-gray-900"}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Régime Haute Tension</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-slate-100" : "text-gray-900")}>
                  <Bell className="h-5 w-5 text-blue-500" />
                  Notifications
                </CardTitle>
                <CardDescription className={isDark ? "text-slate-400" : "text-gray-500"}>
                  Alertes et rappels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Alertes Pic de Consommation</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Rappels Échéances CBAM</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={isDark ? "text-slate-300" : "text-gray-700"}>Rapport Hebdomadaire</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-slate-100" : "text-gray-900")}>
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Intégrations
                </CardTitle>
                <CardDescription className={isDark ? "text-slate-400" : "text-gray-500"}>
                  Connexions externes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  isDark ? "bg-slate-900" : "bg-gray-50"
                )}>
                  <div>
                    <p className={cn("font-medium", isDark ? "text-slate-100" : "text-gray-900")}>API Compteur IoT</p>
                    <p className="text-sm text-emerald-500">Connecté</p>
                  </div>
                  <Button size="sm" variant="outline" className={isDark ? "border-slate-600" : "border-gray-300"}>
                    Configurer
                  </Button>
                </div>
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  isDark ? "bg-slate-900" : "bg-gray-50"
                )}>
                  <div>
                    <p className={cn("font-medium", isDark ? "text-slate-100" : "text-gray-900")}>Export ERP</p>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>Non configuré</p>
                  </div>
                  <Button size="sm" variant="outline" className={isDark ? "border-slate-600" : "border-gray-300"}>
                    Activer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Sauvegarder les Paramètres
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

const DigitalTwinSettings = () => {
  return (
    <DigitalTwinThemeProvider>
      <DigitalTwinSettingsContent />
    </DigitalTwinThemeProvider>
  );
};

export default DigitalTwinSettings;

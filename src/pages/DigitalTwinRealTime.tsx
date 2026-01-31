import { Activity, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";
import { DigitalTwinThemeProvider } from "@/contexts/DigitalTwinThemeContext";

const DigitalTwinRealTimeContent = () => {
  return (
    <div 
      className="min-h-screen flex text-gray-900"
      style={{ 
        background: 'linear-gradient(180deg, hsl(142 60% 96%) 0%, hsl(120 40% 98%) 100%)' 
      }}
    >
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Suivi Temps Réel</h1>
            <p className="text-gray-500">Monitoring en direct de votre consommation énergétique</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Puissance Instantanée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">245 kW</div>
                <p className="text-xs text-emerald-600">-12% vs moyenne</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Production Solaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">180 kW</div>
                <p className="text-xs text-emerald-600">73% de la capacité</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Autoconsommation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">92%</div>
                <p className="text-xs text-gray-500">Excellent</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Intensité CO2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">480 g/kWh</div>
                <p className="text-xs text-red-600">Pic réseau STEG</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Graphique Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Graphique de monitoring en temps réel (à venir)</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

const DigitalTwinRealTime = () => {
  return (
    <DigitalTwinThemeProvider>
      <DigitalTwinRealTimeContent />
    </DigitalTwinThemeProvider>
  );
};

export default DigitalTwinRealTime;

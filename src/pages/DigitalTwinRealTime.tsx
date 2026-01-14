import { Activity, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";

const DigitalTwinRealTime = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Suivi Temps Réel</h1>
            <p className="text-slate-400">Monitoring en direct de votre consommation énergétique</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Puissance Instantanée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">245 kW</div>
                <p className="text-xs text-emerald-400">-12% vs moyenne</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Production Solaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">180 kW</div>
                <p className="text-xs text-emerald-400">73% de la capacité</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Autoconsommation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">92%</div>
                <p className="text-xs text-slate-400">Excellent</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Intensité CO2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">480 g/kWh</div>
                <p className="text-xs text-red-400">Pic réseau STEG</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Graphique Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-500">
                <p>Graphique de monitoring en temps réel (à venir)</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DigitalTwinRealTime;

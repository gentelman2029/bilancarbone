import { FileText, Download, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";

const reports = [
  { 
    id: 1, 
    name: "Rapport CBAM Q4 2025", 
    status: "Généré", 
    date: "15/01/2026",
    type: "CBAM"
  },
  { 
    id: 2, 
    name: "Déclaration Environnementale", 
    status: "En attente", 
    date: "20/01/2026",
    type: "ANME"
  },
  { 
    id: 3, 
    name: "Bilan Carbone Annuel 2025", 
    status: "Généré", 
    date: "10/01/2026",
    type: "GHG"
  },
];

const DigitalTwinReports = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Rapports Réglementaires</h1>
            <p className="text-slate-400">Génération et suivi des déclarations environnementales</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Rapports Générés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">12</div>
                <p className="text-xs text-slate-400">Cette année</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Prochaine Échéance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">31 Jan</div>
                <p className="text-xs text-amber-400">CBAM Q4</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Conformité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">100%</div>
                <p className="text-xs text-slate-400">À jour</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Historique des Rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div 
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-100">{report.name}</p>
                        <p className="text-sm text-slate-400">{report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={report.status === "Généré" ? "default" : "secondary"}
                        className={report.status === "Généré" ? "bg-emerald-500/20 text-emerald-400" : ""}
                      >
                        {report.status}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        {report.type}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-100">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DigitalTwinReports;

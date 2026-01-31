import { FileText, Download, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DigitalTwinSidebar, DigitalTwinHeader } from "@/components/digital-twin";
import { DigitalTwinThemeProvider, useDigitalTwinTheme } from "@/contexts/DigitalTwinThemeContext";
import { cn } from "@/lib/utils";

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

const DigitalTwinReportsContent = () => {
  const { theme } = useDigitalTwinTheme();
  const isDark = theme === "dark";

  return (
    <div 
      className={cn(
        "min-h-screen flex",
        isDark ? "bg-slate-900 text-slate-100" : "text-gray-900"
      )}
      style={!isDark ? { 
        background: 'linear-gradient(180deg, hsl(142 60% 96%) 0%, hsl(120 40% 98%) 100%)' 
      } : undefined}
    >
      <DigitalTwinSidebar />
      
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-gray-900")}>Rapports Réglementaires</h1>
            <p className={isDark ? "text-slate-400" : "text-gray-500"}>Génération et suivi des déclarations environnementales</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isDark ? "text-slate-400" : "text-gray-500")}>
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Rapports Générés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-gray-900")}>12</div>
                <p className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-500")}>Cette année</p>
              </CardContent>
            </Card>
            
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isDark ? "text-slate-400" : "text-gray-500")}>
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Prochaine Échéance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-gray-900")}>31 Jan</div>
                <p className="text-xs text-amber-500">CBAM Q4</p>
              </CardContent>
            </Card>
            
            <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
              <CardHeader className="pb-2">
                <CardTitle className={cn("text-sm flex items-center gap-2", isDark ? "text-slate-400" : "text-gray-500")}>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Conformité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">100%</div>
                <p className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-500")}>À jour</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className={isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"}>
            <CardHeader>
              <CardTitle className={isDark ? "text-slate-100" : "text-gray-900"}>Historique des Rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div 
                    key={report.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-gray-400")} />
                      <div>
                        <p className={cn("font-medium", isDark ? "text-slate-100" : "text-gray-900")}>{report.name}</p>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>{report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={report.status === "Généré" ? "default" : "secondary"}
                        className={report.status === "Généré" ? "bg-emerald-500/20 text-emerald-500" : ""}
                      >
                        {report.status}
                      </Badge>
                      <Badge variant="outline" className={isDark ? "border-slate-600 text-slate-400" : "border-gray-300 text-gray-500"}>
                        {report.type}
                      </Badge>
                      <Button size="sm" variant="ghost" className={isDark ? "text-slate-400 hover:text-slate-100" : "text-gray-500 hover:text-gray-900"}>
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

const DigitalTwinReports = () => {
  return (
    <DigitalTwinThemeProvider>
      <DigitalTwinReportsContent />
    </DigitalTwinThemeProvider>
  );
};

export default DigitalTwinReports;

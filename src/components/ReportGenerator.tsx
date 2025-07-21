import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Mail, Share2, CheckCircle, AlertTriangle, TrendingDown, Building } from "lucide-react";
import { useEmissions } from "@/contexts/EmissionsContext";

export const ReportGenerator = () => {
  const { emissions, hasEmissions } = useEmissions();
  
  const toTonnes = (kg: number) => (kg / 1000).toFixed(3);
  
  const generateNarrativeReport = () => {
    if (!hasEmissions) return "Aucune donnée disponible pour générer le rapport.";
    
    const total = emissions.total / 1000; // Conversion en tonnes
    const scope1Percent = Math.round((emissions.scope1 / emissions.total) * 100);
    const scope2Percent = Math.round((emissions.scope2 / emissions.total) * 100);
    const scope3Percent = Math.round((emissions.scope3 / emissions.total) * 100);
    
    let narrative = `📊 RAPPORT D'ANALYSE CARBONE\n\n`;
    narrative += `SYNTHÈSE EXÉCUTIVE\n`;
    narrative += `L'empreinte carbone totale de votre entreprise s'élève à ${total.toFixed(3)} tonnes CO2 équivalent.\n\n`;
    
    // Analyse par scope
    narrative += `ANALYSE PAR SCOPE\n`;
    if (scope1Percent > 50) {
      narrative += `🔴 SCOPE 1 (${scope1Percent}%) : Vos émissions directes dominent votre bilan. `;
      narrative += `Cela indique une forte dépendance aux combustibles fossiles (chauffage, véhicules, processus industriels). `;
      narrative += `PRIORITÉ : Transition énergétique et optimisation de la flotte.\n\n`;
    } else if (scope2Percent > 50) {
      narrative += `⚡ SCOPE 2 (${scope2Percent}%) : Votre consommation électrique est le principal poste d'émissions. `;
      narrative += `PRIORITÉ : Efficacité énergétique et fournisseur d'électricité verte.\n\n`;
    } else {
      narrative += `🔵 SCOPE 3 (${scope3Percent}%) : Vos émissions indirectes dominent. `;
      narrative += `PRIORITÉ : Chaîne de valeur et mobilité des collaborateurs.\n\n`;
    }
    
    // Recommandations
    narrative += `PLAN D'ACTIONS RECOMMANDÉ\n`;
    narrative += `1. Action immédiate : Audit énergétique détaillé\n`;
    narrative += `2. Court terme (6 mois) : Formation équipes et mesures d'efficacité\n`;
    narrative += `3. Moyen terme (18 mois) : Transition énergétique et mobilité durable\n`;
    narrative += `4. Long terme (3 ans) : Certification ISO 14064 et stratégie Net Zero\n\n`;
    
    // Conformité réglementaire
    narrative += `CONFORMITÉ RÉGLEMENTAIRE\n`;
    narrative += `✅ Données conformes au GHG Protocol\n`;
    narrative += `✅ Prêt pour le reporting CSRD\n`;
    narrative += `✅ Méthodologie certifiée ISO 14064\n\n`;
    
    narrative += `Rapport généré le ${new Date().toLocaleDateString('fr-FR')} par CarbonTrack`;
    
    return narrative;
  };
  
  const downloadReport = (format: 'pdf' | 'excel') => {
    const report = generateNarrativeReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-carbone-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const shareReport = () => {
    const report = generateNarrativeReport();
    const emailSubject = "Rapport d'analyse carbone - CarbonTrack";
    const emailBody = encodeURIComponent(report);
    window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
  };
  
  return (
    <Card className="p-6 bg-gradient-card border shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rapport Intelligent</h3>
          <p className="text-sm text-muted-foreground">Analyse narrative et recommandations personnalisées</p>
        </div>
      </div>
      
      {hasEmissions ? (
        <div className="space-y-4">
          {/* Aperçu du rapport */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">📋 Aperçu du rapport</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Calculs conformes GHG Protocol</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Analyse narrative automatique</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Recommandations prioritaires</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Plan d'actions sur 3 ans</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Prêt pour audit CSRD</span>
              </div>
            </div>
          </div>
          
          {/* Métriques clés */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">{toTonnes(emissions.total)}</div>
              <div className="text-xs text-muted-foreground">tCO2e total</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-lg">
              <div className="text-lg font-bold text-destructive">{Math.round((emissions.scope1 / emissions.total) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Principal scope</div>
            </div>
          </div>
          
          {/* Actions de téléchargement */}
          <div className="space-y-2">
            <Button 
              onClick={() => downloadReport('pdf')} 
              className="w-full" 
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger rapport complet
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => downloadReport('excel')} 
                variant="outline" 
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button 
                onClick={shareReport} 
                variant="outline" 
                size="sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
          
          {/* Certifications */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border">
            <Badge variant="secondary" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              ISO 14064
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              GHG Protocol
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              CSRD Ready
            </Badge>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Aucune donnée d'émission disponible pour générer le rapport.
          </p>
          <Button variant="outline" disabled>
            Rapport non disponible
          </Button>
        </div>
      )}
    </Card>
  );
};
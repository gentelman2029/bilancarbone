import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Building, Calendar, TrendingUp, Target, Zap, Factory } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PDFExportProps {
  data: {
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
    carbonIntensity: number;
    companyInfo?: {
      name?: string;
      period?: string;
      entity?: string;
    };
    postsBreakdown?: Array<{
      name: string;
      value: number;
      percentage: number;
      scope: string;
    }>;
  };
  filters?: any;
}

export const PDFExport = ({ data, filters }: PDFExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Créer un nouveau document PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configuration des couleurs et styles
      const primaryColor = '#059669';
      const secondaryColor = '#3B82F6';
      const accentColor = '#EF4444';
      
      // En-tête du document
      pdf.setFillColor(5, 150, 105); // Primary color
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      // Logo et titre (simulé)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RAPPORT BILAN CARBONE', 20, 15);
      
      // Sous-titre avec date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 20, 21);
      
      // Informations générales
      let yPosition = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SYNTHÈSE EXÉCUTIVE', 20, yPosition);
      
      yPosition += 15;
      
      // Tableau des KPIs principaux
      const kpis = [
        { label: 'Émissions totales', value: `${(data.totalEmissions / 1000).toFixed(1)} tCO₂e`, color: primaryColor },
        { label: 'Scope 1 (Direct)', value: `${(data.scope1 / 1000).toFixed(1)} tCO₂e`, color: primaryColor },
        { label: 'Scope 2 (Énergie)', value: `${(data.scope2 / 1000).toFixed(1)} tCO₂e`, color: secondaryColor },
        { label: 'Scope 3 (Indirect)', value: `${(data.scope3 / 1000).toFixed(1)} tCO₂e`, color: accentColor },
        { label: 'Intensité carbone', value: `${data.carbonIntensity.toFixed(3)} tCO₂e/k€`, color: primaryColor }
      ];
      
      kpis.forEach((kpi, index) => {
        const y = yPosition + (index * 12);
        
        // Indicateur coloré
        pdf.setFillColor(5, 150, 105);
        pdf.circle(25, y - 2, 2, 'F');
        
        // Label et valeur
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(kpi.label, 35, y);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(kpi.value, 120, y);
      });
      
      yPosition += 80;
      
      // Répartition par scope (texte)
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RÉPARTITION PAR SCOPE', 20, yPosition);
      
      yPosition += 15;
      
      const scopeData = [
        { name: 'Scope 1', value: data.scope1, percentage: (data.scope1 / data.totalEmissions) * 100 },
        { name: 'Scope 2', value: data.scope2, percentage: (data.scope2 / data.totalEmissions) * 100 },
        { name: 'Scope 3', value: data.scope3, percentage: (data.scope3 / data.totalEmissions) * 100 }
      ];
      
      scopeData.forEach((scope, index) => {
        const y = yPosition + (index * 10);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${scope.name}:`, 30, y);
        pdf.text(`${(scope.value / 1000).toFixed(1)} tCO₂e`, 70, y);
        pdf.text(`(${scope.percentage.toFixed(1)}%)`, 110, y);
        
        // Barre de progression visuelle
        const barWidth = 60;
        const barHeight = 3;
        const fillWidth = (scope.percentage / 100) * barWidth;
        
        // Barre de fond
        pdf.setFillColor(240, 240, 240);
        pdf.rect(120, y - 2, barWidth, barHeight, 'F');
        
        // Barre de remplissage
        pdf.setFillColor(5, 150, 105);
        pdf.rect(120, y - 2, fillWidth, barHeight, 'F');
      });
      
      yPosition += 50;
      
      // Principales sources d'émissions
      if (data.postsBreakdown && data.postsBreakdown.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PRINCIPALES SOURCES D\'ÉMISSIONS', 20, yPosition);
        
        yPosition += 15;
        
        const topPosts = data.postsBreakdown
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        topPosts.forEach((post, index) => {
          const y = yPosition + (index * 12);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${index + 1}.`, 25, y);
          pdf.text(post.name, 35, y);
          pdf.text(`${post.value.toFixed(1)} tCO₂e`, 120, y);
          pdf.text(`(${post.percentage.toFixed(1)}%)`, 150, y);
        });
      }
      
      // Pied de page
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('CarbonTrack - Plateforme de pilotage carbone', 20, footerY);
      pdf.text('carbontrack2025@protonmail.com | +216 93 460 745', 20, footerY + 5);
      
      // Ligne de séparation
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      
      // Sauvegarder le PDF
      const fileName = `bilan-carbone-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Rapport PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Génération du Rapport PDF
          </DialogTitle>
          <DialogDescription>
            Prévisualisation du rapport de bilan carbone qui sera généré en PDF
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Prévisualisation du contenu */}
          <Card>
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-center">RAPPORT BILAN CARBONE</CardTitle>
              <p className="text-center text-sm opacity-90">
                Généré le {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              {/* KPIs principaux */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Synthèse Exécutive
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Émissions totales:</span>
                      <Badge variant="default">{(data.totalEmissions / 1000).toFixed(1)} tCO₂e</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Scope 1:</span>
                      <Badge variant="secondary">{(data.scope1 / 1000).toFixed(1)} tCO₂e</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Scope 2:</span>
                      <Badge variant="secondary">{(data.scope2 / 1000).toFixed(1)} tCO₂e</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Scope 3:</span>
                      <Badge variant="secondary">{(data.scope3 / 1000).toFixed(1)} tCO₂e</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Intensité carbone:</span>
                      <Badge variant="outline">{data.carbonIntensity.toFixed(3)} tCO₂e/k€</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Principales sources */}
              {data.postsBreakdown && data.postsBreakdown.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Top 5 Sources d'Émissions
                  </h3>
                  <div className="space-y-1">
                    {data.postsBreakdown
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)
                      .map((post, index) => (
                        <div key={post.name} className="flex justify-between text-sm">
                          <span>{index + 1}. {post.name}</span>
                          <span>{post.value.toFixed(1)} tCO₂e ({post.percentage.toFixed(1)}%)</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* Métadonnées */}
              <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
                {data.companyInfo?.name && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3 h-3" />
                    <span>{data.companyInfo.name}</span>
                  </div>
                )}
                {data.companyInfo?.period && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Période: {data.companyInfo.period}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  <span>Rapport généré par CarbonTrack</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Annuler
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>Génération...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
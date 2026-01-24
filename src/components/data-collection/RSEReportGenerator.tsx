// RSE Report Generator - Tunisian & GRI/ISO compliant
import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, Building2, Leaf, Users, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RSEReportData {
  companyName: string;
  sector: string;
  employeeCount: number;
  reportingYear: number;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  intensityPerEmployee: number;
  intensityPerRevenue: number;
  revenue: number;
  currency: string;
  sbtTarget2030?: number;
  executiveSummary: string;
}

interface RSEReportGeneratorProps {
  scopeData: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  companyInfo?: {
    name?: string;
    sector?: string;
    employees?: number;
    revenue?: number;
    currency?: string;
  };
}

export function RSEReportGenerator({ scopeData, companyInfo }: RSEReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<RSEReportData>({
    companyName: companyInfo?.name || '',
    sector: companyInfo?.sector || 'Industrie',
    employeeCount: companyInfo?.employees || 0,
    reportingYear: new Date().getFullYear(),
    scope1: scopeData.scope1,
    scope2: scopeData.scope2,
    scope3: scopeData.scope3,
    total: scopeData.total,
    intensityPerEmployee: companyInfo?.employees ? scopeData.total / companyInfo.employees : 0,
    intensityPerRevenue: companyInfo?.revenue ? (scopeData.total / companyInfo.revenue) * 1000000 : 0,
    revenue: companyInfo?.revenue || 0,
    currency: companyInfo?.currency || 'TND',
    executiveSummary: '',
  });

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      // Helper function
      const addPageIfNeeded = (height: number) => {
        if (y + height > pageHeight - 30) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      const formatNum = (n: number, decimals: number = 2) => 
        n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

      // === COVER PAGE ===
      doc.setFillColor(34, 139, 34); // Forest Green
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('RAPPORT RSE', pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Responsabilité Sociétale des Entreprises', pageWidth / 2, 50, { align: 'center' });
      doc.text(`Année ${reportData.reportingYear}`, pageWidth / 2, 65, { align: 'center' });

      y = 100;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.companyName || 'Entreprise', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Secteur: ${reportData.sector}`, pageWidth / 2, y, { align: 'center' });
      
      y += 30;
      
      // Compliance badges
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Conforme aux normes:', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      const badges = ['Loi RSE 2018-35 (Tunisie)', 'Guide BVMT', 'GRI Standards', 'ISO 26000'];
      doc.setFontSize(9);
      badges.forEach((badge, i) => {
        doc.text(`• ${badge}`, pageWidth / 2 - 30, y + (i * 6), { align: 'left' });
      });

      y += 40;
      
      // Key metrics box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 3, 3, 'F');
      
      y += 15;
      doc.setTextColor(34, 139, 34);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(`${formatNum(reportData.total)} tCO₂e`, pageWidth / 2, y, { align: 'center' });
      
      y += 10;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text('Émissions totales de gaz à effet de serre', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(9);
      const metricsLine = `Scope 1: ${formatNum(reportData.scope1)}t | Scope 2: ${formatNum(reportData.scope2)}t | Scope 3: ${formatNum(reportData.scope3)}t`;
      doc.text(metricsLine, pageWidth / 2, y, { align: 'center' });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

      // === PAGE 2: EXECUTIVE SUMMARY ===
      doc.addPage();
      y = margin;

      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 8, 'F');
      
      y = 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Résumé Exécutif', margin, y);
      
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const summary = reportData.executiveSummary || 
        `${reportData.companyName || 'Notre entreprise'} s'engage dans une démarche RSE structurée, ` +
        `alignée sur les objectifs de développement durable et la réglementation tunisienne. ` +
        `Ce rapport présente notre bilan carbone pour l'année ${reportData.reportingYear}, ` +
        `avec un total de ${formatNum(reportData.total)} tonnes de CO₂ équivalent émises. ` +
        `\n\nNotre stratégie de réduction des émissions vise une décarbonation progressive de nos activités, ` +
        `en cohérence avec les recommandations du GIEC et les engagements de la Tunisie dans le cadre de l'Accord de Paris.`;

      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, y);
      
      y += summaryLines.length * 5 + 20;

      // === SCOPE BREAKDOWN TABLE ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Bilan des Émissions GES', margin, y);
      
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Scope', 'Description', 'Émissions (tCO₂e)', 'Part (%)']],
        body: [
          ['Scope 1', 'Émissions directes (combustion, véhicules)', formatNum(reportData.scope1), `${reportData.total > 0 ? ((reportData.scope1 / reportData.total) * 100).toFixed(1) : 0}%`],
          ['Scope 2', 'Émissions indirectes (électricité)', formatNum(reportData.scope2), `${reportData.total > 0 ? ((reportData.scope2 / reportData.total) * 100).toFixed(1) : 0}%`],
          ['Scope 3', 'Autres émissions indirectes (chaîne de valeur)', formatNum(reportData.scope3), `${reportData.total > 0 ? ((reportData.scope3 / reportData.total) * 100).toFixed(1) : 0}%`],
          ['TOTAL', '', formatNum(reportData.total), '100%'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 34] },
        footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 20;
      addPageIfNeeded(60);

      // === INTENSITY METRICS ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Indicateurs d\'Intensité Carbone', margin, y);
      
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Indicateur', 'Valeur', 'Unité']],
        body: [
          ['Émissions par employé', reportData.employeeCount > 0 ? formatNum(reportData.total / reportData.employeeCount) : 'N/A', 'tCO₂e/employé'],
          ['Émissions par chiffre d\'affaires', reportData.revenue > 0 ? formatNum((reportData.total / reportData.revenue) * 1000000) : 'N/A', `tCO₂e/M${reportData.currency}`],
          ['Effectif total', reportData.employeeCount.toString(), 'employés'],
          ['Chiffre d\'affaires', reportData.revenue > 0 ? `${formatNum(reportData.revenue, 1)} M${reportData.currency}` : 'N/A', ''],
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 34] },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 20;
      addPageIfNeeded(80);

      // === REGULATORY CONTEXT ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Cadre Réglementaire', margin, y);
      
      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const regulations = [
        '• Loi n°2018-35 relative à la Responsabilité Sociétale des Entreprises en Tunisie',
        '• Guide de reporting ESG du Conseil du Marché Financier (CMF) et de la BVMT',
        '• Contribution Déterminée au niveau National (CDN) de la Tunisie - Accord de Paris',
        '• Standards GRI (Global Reporting Initiative) pour le reporting développement durable',
        '• Norme ISO 26000 - Lignes directrices relatives à la responsabilité sociétale',
        '• Directive CSRD (Corporate Sustainability Reporting Directive) - UE',
        '• Mécanisme d\'Ajustement Carbone aux Frontières (MACF/CBAM) - UE',
      ];
      
      regulations.forEach((reg, i) => {
        doc.text(reg, margin, y + (i * 7));
      });

      y += regulations.length * 7 + 15;
      addPageIfNeeded(40);

      // === METHODOLOGY ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Méthodologie', margin, y);
      
      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const methodology = 
        'Ce bilan carbone a été établi selon la méthodologie du GHG Protocol (Greenhouse Gas Protocol), ' +
        'référentiel international pour la comptabilisation des émissions de gaz à effet de serre.\n\n' +
        'Les facteurs d\'émission utilisés proviennent de la Base Carbone ADEME et ont été adaptés ' +
        'au contexte énergétique tunisien (mix électrique STEG).\n\n' +
        'Périmètre organisationnel: Contrôle opérationnel\n' +
        'Périmètre temporel: Année calendaire ' + reportData.reportingYear;

      const methodLines = doc.splitTextToSize(methodology, pageWidth - 2 * margin);
      doc.text(methodLines, margin, y);

      // Footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i}/${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        doc.text(`Rapport RSE ${reportData.reportingYear} - ${reportData.companyName}`, margin, pageHeight - 10);
      }

      // Save PDF
      const fileName = `Rapport_RSE_${reportData.companyName.replace(/\s+/g, '_')}_${reportData.reportingYear}.pdf`;
      doc.save(fileName);
      
      toast.success('Rapport RSE généré', {
        description: `${fileName} téléchargé avec succès.`
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <FileText className="h-4 w-4" />
        Générer Rapport RSE
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Générateur de Rapport RSE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Company Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informations Entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'entreprise</Label>
                  <Input
                    value={reportData.companyName}
                    onChange={(e) => setReportData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Ex: GreenTech Tunisie"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secteur d'activité</Label>
                  <Input
                    value={reportData.sector}
                    onChange={(e) => setReportData(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="Ex: Industrie manufacturière"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre d'employés</Label>
                  <Input
                    type="number"
                    value={reportData.employeeCount || ''}
                    onChange={(e) => setReportData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Année de reporting</Label>
                  <Input
                    type="number"
                    value={reportData.reportingYear}
                    onChange={(e) => setReportData(prev => ({ ...prev, reportingYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emissions Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Bilan des Émissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Scope 1</p>
                    <p className="text-lg font-bold text-red-600">{reportData.scope1.toFixed(2)}</p>
                    <p className="text-xs">tCO₂e</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Scope 2</p>
                    <p className="text-lg font-bold text-amber-600">{reportData.scope2.toFixed(2)}</p>
                    <p className="text-xs">tCO₂e</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Scope 3</p>
                    <p className="text-lg font-bold text-blue-600">{reportData.scope3.toFixed(2)}</p>
                    <p className="text-xs">tCO₂e</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-green-600">{reportData.total.toFixed(2)}</p>
                    <p className="text-xs">tCO₂e</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <div className="space-y-2">
              <Label>Résumé Exécutif (optionnel)</Label>
              <Textarea
                value={reportData.executiveSummary}
                onChange={(e) => setReportData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                placeholder="Décrivez les points clés de votre performance RSE cette année..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Si laissé vide, un résumé sera généré automatiquement.
              </p>
            </div>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Scale className="h-3 w-3" />
                Loi RSE 2018-35
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                GRI Standards
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                ISO 26000
              </Badge>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Guide BVMT
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={generatePDF} disabled={isGenerating || !reportData.companyName}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Télécharger PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

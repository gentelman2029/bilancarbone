// RSE Pilotage Report Generator - Based on RSE Action Data
import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, CheckCircle, Building2, Target, Users, Scale, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RSEAction } from '@/lib/rse/types';
import { calculateCSRDProgress, countRegionalImpactActions, calculateBudgetStats } from '@/lib/rse/actionEngine';

interface RSEPilotageReportProps {
  actions: RSEAction[];
}

interface ReportData {
  companyName: string;
  sector: string;
  reportingYear: number;
  executiveSummary: string;
}

export function RSEPilotageReport({ actions }: RSEPilotageReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    companyName: '',
    sector: 'Industrie',
    reportingYear: new Date().getFullYear(),
    executiveSummary: '',
  });

  // Listen for custom event to open dialog
  useEffect(() => {
    const handleExportEvent = () => setIsOpen(true);
    window.addEventListener('rse-export-report', handleExportEvent);
    return () => window.removeEventListener('rse-export-report', handleExportEvent);
  }, []);

  // Calculate metrics from actions
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'done').length;
  const inProgressActions = actions.filter(a => a.status === 'in_progress').length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const csrdProgress = calculateCSRDProgress(actions);
  const regionalImpactCount = countRegionalImpactActions(actions);
  const budgetStats = calculateBudgetStats(actions);

  // Count by ESG pillar (using 'category' field)
  const envActions = actions.filter(a => a.category === 'E').length;
  const socialActions = actions.filter(a => a.category === 'S').length;
  const govActions = actions.filter(a => a.category === 'G').length;

  // Calculate CO2 reduction estimate
  const totalCO2Reduction = actions
    .filter(a => a.status === 'done')
    .reduce((sum, a) => sum + (a.impactMetrics.co2ReductionTarget || 0), 0);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      const formatNum = (n: number, decimals: number = 0) => 
        n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

      // === COVER PAGE ===
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('RAPPORT RSE', pageWidth / 2, 35, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Plan d\'Actions Strategiques', pageWidth / 2, 50, { align: 'center' });
      doc.text(`Annee ${reportData.reportingYear}`, pageWidth / 2, 65, { align: 'center' });

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
      
      const badges = ['Loi RSE 2018-35 (Tunisie)', 'Guide BVMT', 'CSRD (UE)', 'ISO 26000'];
      doc.setFontSize(9);
      badges.forEach((badge, i) => {
        doc.text(`- ${badge}`, pageWidth / 2 - 30, y + (i * 6), { align: 'left' });
      });

      y += 40;
      
      // Key metrics box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 60, 3, 3, 'F');
      
      y += 15;
      doc.setTextColor(34, 139, 34);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(`${completionRate}%`, pageWidth / 2, y, { align: 'center' });
      
      y += 10;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text('Taux de realisation du plan RSE', pageWidth / 2, y, { align: 'center' });
      
      y += 15;
      doc.setFontSize(9);
      const metricsLine = `${totalActions} actions | ${completedActions} terminees | ${inProgressActions} en cours`;
      doc.text(metricsLine, pageWidth / 2, y, { align: 'center' });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

      // === PAGE 2: EXECUTIVE SUMMARY ===
      doc.addPage();
      y = margin;

      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 8, 'F');
      
      y = 25;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Resume Executif', margin, y);
      
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const summary = reportData.executiveSummary || 
        `${reportData.companyName || 'Notre entreprise'} deploie un plan d'actions RSE structure, ` +
        `aligne sur les objectifs de developpement durable et la reglementation tunisienne. ` +
        `Ce rapport presente l'avancement de nos ${totalActions} actions pour l'annee ${reportData.reportingYear}. ` +
        `\n\nNotre taux de realisation atteint ${completionRate}%, avec ${completedActions} actions terminees ` +
        `et ${inProgressActions} en cours. La progression CSRD est estimee a ${csrdProgress}%. ` +
        `${regionalImpactCount} action(s) contribuent directement au developpement regional.`;

      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, y);
      
      y += summaryLines.length * 5 + 20;

      // === KPIs DASHBOARD ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Indicateurs Cles de Performance', margin, y);
      
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Indicateur', 'Valeur', 'Objectif', 'Statut']],
        body: [
          ['Taux de realisation global', `${completionRate}%`, '100%', completionRate >= 75 ? 'Excellent' : completionRate >= 50 ? 'Bon' : 'A ameliorer'],
          ['Progression CSRD', `${csrdProgress}%`, '100%', csrdProgress >= 50 ? 'En bonne voie' : 'A accelerer'],
          ['Actions impact regional', `${regionalImpactCount}`, '-', regionalImpactCount > 0 ? 'Actif' : 'A developper'],
          ['Reduction CO2 estimee', `${formatNum(totalCO2Reduction)} tCO2e`, '-', totalCO2Reduction > 0 ? 'Positif' : 'En cours'],
          ['Budget alloue', `${formatNum(budgetStats.allocated)} TND`, '-', '-'],
          ['Budget depense', `${formatNum(budgetStats.spent)} TND`, '-', '-'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 34] },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 20;

      // === ESG BREAKDOWN ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Repartition par Pilier ESG', margin, y);
      
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Pilier', 'Nombre d\'actions', 'Part (%)', 'Description']],
        body: [
          ['Environnement (E)', envActions.toString(), totalActions > 0 ? `${Math.round((envActions/totalActions)*100)}%` : '0%', 'Climat, ressources, biodiversite'],
          ['Social (S)', socialActions.toString(), totalActions > 0 ? `${Math.round((socialActions/totalActions)*100)}%` : '0%', 'Emploi, formation, sante securite'],
          ['Gouvernance (G)', govActions.toString(), totalActions > 0 ? `${Math.round((govActions/totalActions)*100)}%` : '0%', 'Ethique, transparence, conformite'],
          ['TOTAL', totalActions.toString(), '100%', ''],
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 34] },
        footStyles: { fillColor: [220, 220, 220], fontStyle: 'bold' },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 20;

      // === PAGE 3: ACTIONS LIST ===
      if (actions.length > 0) {
        doc.addPage();
        y = margin;

        doc.setFillColor(34, 139, 34);
        doc.rect(0, 0, pageWidth, 8, 'F');

        y = 25;
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('4. Liste des Actions RSE', margin, y);
        
        y += 10;

        const actionRows = actions.slice(0, 20).map(action => [
          action.title.substring(0, 40) + (action.title.length > 40 ? '...' : ''),
          action.category,
          action.status === 'done' ? 'Termine' : action.status === 'in_progress' ? 'En cours' : 'A faire',
          action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse',
          `${formatNum(action.impactMetrics.costEstimated)} TND`
        ]);

        autoTable(doc, {
          startY: y,
          head: [['Action', 'Pilier', 'Statut', 'Priorite', 'Budget']],
          body: actionRows,
          theme: 'striped',
          headStyles: { fillColor: [34, 139, 34] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8 },
        });

        if (actions.length > 20) {
          y = (doc as any).lastAutoTable.finalY + 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`... et ${actions.length - 20} autres actions`, margin, y);
        }
      }

      // === REGULATORY CONTEXT PAGE ===
      doc.addPage();
      y = margin;

      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 8, 'F');

      y = 25;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Cadre Reglementaire', margin, y);
      
      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const regulations = [
        '- Loi n 2018-35 relative a la Responsabilite Societale des Entreprises en Tunisie',
        '- Guide de reporting ESG du Conseil du Marche Financier (CMF) et de la BVMT',
        '- Contribution Determinee au niveau National (CDN) de la Tunisie - Accord de Paris',
        '- Standards GRI (Global Reporting Initiative) pour le reporting developpement durable',
        '- Norme ISO 26000 - Lignes directrices relatives a la responsabilite societale',
        '- Directive CSRD (Corporate Sustainability Reporting Directive) - UE',
      ];
      
      regulations.forEach((reg, i) => {
        doc.text(reg, margin, y + (i * 7));
      });

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
      const fileName = `Rapport_RSE_Pilotage_${reportData.companyName.replace(/\s+/g, '_') || 'Entreprise'}_${reportData.reportingYear}.pdf`;
      doc.save(fileName);
      
      toast.success('Rapport RSE genere', {
        description: `${fileName} telecharge avec succes.`
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erreur lors de la generation du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generateur de Rapport RSE - Pilotage
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
                  <Label>Secteur d'activite</Label>
                  <Input
                    value={reportData.sector}
                    onChange={(e) => setReportData(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="Ex: Industrie manufacturiere"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Annee de reporting</Label>
                  <Input
                    type="number"
                    value={reportData.reportingYear}
                    onChange={(e) => setReportData(prev => ({ ...prev, reportingYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Synthese du Plan d'Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Actions</p>
                    <p className="text-lg font-bold text-blue-600">{totalActions}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Terminees</p>
                    <p className="text-lg font-bold text-green-600">{completedActions}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">En cours</p>
                    <p className="text-lg font-bold text-amber-600">{inProgressActions}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Taux</p>
                    <p className="text-lg font-bold text-purple-600">{completionRate}%</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-emerald-50 rounded">
                    <span className="text-emerald-600 font-medium">E: {envActions}</span>
                  </div>
                  <div className="p-2 bg-sky-50 rounded">
                    <span className="text-sky-600 font-medium">S: {socialActions}</span>
                  </div>
                  <div className="p-2 bg-violet-50 rounded">
                    <span className="text-violet-600 font-medium">G: {govActions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <div className="space-y-2">
              <Label>Resume Executif (optionnel)</Label>
              <Textarea
                value={reportData.executiveSummary}
                onChange={(e) => setReportData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                placeholder="Decrivez les points cles de votre strategie RSE cette annee..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Si laisse vide, un resume sera genere automatiquement.
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
                CSRD
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
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating || !reportData.companyName}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Telecharger PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
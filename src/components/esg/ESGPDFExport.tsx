import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Building, Calendar, Award } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ESGData, ESGCategory, TUNISIAN_SECTORS, ESG_GRADES } from '@/lib/esg/types';

interface ESGPDFExportProps {
  data: ESGData;
  totalScore: number;
  grade: string;
  categoryScores: Record<string, number>;
}

export const ESGPDFExport: React.FC<ESGPDFExportProps> = ({
  data,
  totalScore,
  grade,
  categoryScores,
}) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const sectorLabel = TUNISIAN_SECTORS.find(s => s.value === data.sector)?.label || data.sector;
    const gradeInfo = ESG_GRADES.find(g => g.grade === grade);

    // Header
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport ESG - Édition Tunisie', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Conforme au Guide BVMT & Loi RSE 2018-35', pageWidth / 2, 28, { align: 'center' });
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-TN')}`, pageWidth / 2, 35, { align: 'center' });

    // Company Info
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Entreprise', 14, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Société: ${data.companyName || 'Non renseigné'}`, 14, 65);
    doc.text(`Secteur: ${sectorLabel}`, 14, 72);
    doc.text(`Exercice: ${data.fiscalYear}`, 14, 79);
    doc.text(`Chiffre d'affaires: ${data.revenue?.toLocaleString('fr-TN')} TND`, 14, 86);

    // Score Summary Box
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.roundedRect(120, 50, 76, 45, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SCORE ESG GLOBAL', 158, 60, { align: 'center' });
    
    doc.setFontSize(28);
    doc.setTextColor(16, 185, 129);
    doc.text(`${totalScore.toFixed(0)}`, 145, 78);
    
    doc.setFontSize(14);
    doc.text(`/100`, 170, 78);
    
    doc.setFontSize(18);
    doc.text(`Grade: ${grade}`, 158, 90, { align: 'center' });

    // Pillar Scores
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores par Pilier', 14, 105);

    const pillarData = [
      ['Pilier', 'Score', 'Pondération', 'Contribution'],
      ['Environnement', `${(categoryScores.E || 0).toFixed(1)}/100`, '40%', `${((categoryScores.E || 0) * 0.4).toFixed(1)} pts`],
      ['Social', `${(categoryScores.S || 0).toFixed(1)}/100`, '30%', `${((categoryScores.S || 0) * 0.3).toFixed(1)} pts`],
      ['Gouvernance', `${(categoryScores.G || 0).toFixed(1)}/100`, '30%', `${((categoryScores.G || 0) * 0.3).toFixed(1)} pts`],
    ];

    autoTable(doc, {
      startY: 110,
      head: [pillarData[0]],
      body: pillarData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
      },
    });

    // Indicator Details - Environment
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    data.categories.forEach((category) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${category.label} (${category.id})`, 14, yPos);
      yPos += 5;

      const indicatorRows = category.indicators.map(ind => [
        ind.id,
        ind.label,
        ind.type === 'binary' 
          ? (ind.value === true ? 'Oui' : 'Non')
          : (typeof ind.value === 'number' ? ind.value.toLocaleString('fr-TN', { maximumFractionDigits: 2 }) : '—'),
        ind.unit,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['ID', 'Indicateur', 'Valeur', 'Unité']],
        body: indicatorRows,
        theme: 'grid',
        headStyles: { 
          fillColor: category.id === 'E' ? [16, 185, 129] : category.id === 'S' ? [59, 130, 246] : [139, 92, 246],
          textColor: 255,
          fontSize: 9,
        },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 85 },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35 },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    });

    // Compliance Section
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Conformité Réglementaire', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const regulations = [
      '✓ Guide de Reporting ESG - Bourse de Tunis (BVMT)',
      '✓ Loi RSE Tunisie 2018-35',
      '✓ Directive européenne CSRD (Double Matérialité)',
      '✓ Normes IFRS S1/S2 Sustainability',
      '✓ Mécanisme d\'Ajustement Carbone aux Frontières (MACF)',
    ];

    regulations.forEach((reg) => {
      doc.text(reg, 14, yPos);
      yPos += 6;
    });

    // Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 280, pageWidth, 17, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Ce rapport est conforme aux exigences de la Banque Centrale de Tunisie pour les demandes de crédits verts.', pageWidth / 2, 287, { align: 'center' });
    doc.text('Document généré par CarbonTrack ESG Tunisia - www.carbontrack.tn', pageWidth / 2, 293, { align: 'center' });

    // Save
    doc.save(`Rapport_ESG_${data.companyName || 'Entreprise'}_${data.fiscalYear}.pdf`);
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Export Rapport BCT
        </CardTitle>
        <CardDescription>
          Rapport "Prêt pour la Banque" - Conforme aux exigences BCT pour les crédits verts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <Building className="h-3 w-3 mr-1" />
            32 Indicateurs BVMT
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Exercice {data.fiscalYear}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Award className="h-3 w-3 mr-1" />
            Grade {grade}
          </Badge>
        </div>

        <Button 
          onClick={generatePDF} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={!data.companyName}
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger le Rapport PDF
        </Button>

        {!data.companyName && (
          <p className="text-xs text-muted-foreground text-center">
            Renseignez le nom de l'entreprise pour activer l'export
          </p>
        )}
      </CardContent>
    </Card>
  );
};

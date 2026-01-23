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

// Helper to format numbers properly (French convention, no invalid chars)
const formatNum = (value: number | undefined | null, decimals: number = 0): string => {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).replace(/\u202F/g, ' '); // Replace narrow no-break space with regular space for PDF
};

export const ESGPDFExport: React.FC<ESGPDFExportProps> = ({
  data,
  totalScore,
  grade,
  categoryScores,
}) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const sectorLabel = TUNISIAN_SECTORS.find(s => s.value === data.sector)?.label || data.sector;
    const gradeInfo = ESG_GRADES.find(g => g.grade === grade);

    // === PAGE 1: COVER & SUMMARY ===
    
    // Header with gradient effect
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport ESG - Edition Tunisie', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Conforme au Guide BVMT & Loi RSE 2018-35', pageWidth / 2, 28, { align: 'center' });
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-TN')}`, pageWidth / 2, 38, { align: 'center' });

    // Company Info Box
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(14, 55, 85, 50, 3, 3, 'F');
    
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Entreprise', 20, 67);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const companyInfo = [
      ['Societe:', data.companyName || 'Non renseigne'],
      ['Secteur:', sectorLabel],
      ['Exercice:', data.fiscalYear.toString()],
      ["Chiffre d'affaires:", `${formatNum(data.revenue)} TND`],
      ['Grade:', grade],
    ];
    
    let infoY = 75;
    companyInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, infoY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 55, infoY);
      infoY += 7;
    });

    // Score Summary Box (Right side)
    doc.setFillColor(16, 185, 129, 0.1);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(105, 55, 90, 50, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('SCORE ESG GLOBAL', 150, 67, { align: 'center' });
    
    doc.setFontSize(36);
    doc.setTextColor(16, 185, 129);
    doc.text(`${totalScore.toFixed(0)}`, 140, 88, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('/100', 165, 88);
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`Grade: ${grade}`, 150, 100, { align: 'center' });

    // Pillar Scores Table
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores par Pilier', 14, 120);

    const pillarData = [
      ['Pilier', 'Score', 'Ponderation', 'Contribution'],
      ['Environnement', `${formatNum(categoryScores.E || 0, 1)}/100`, '40%', `${formatNum((categoryScores.E || 0) * 0.4, 1)} pts`],
      ['Social', `${formatNum(categoryScores.S || 0, 1)}/100`, '30%', `${formatNum((categoryScores.S || 0) * 0.3, 1)} pts`],
      ['Gouvernance', `${formatNum(categoryScores.G || 0, 1)}/100`, '30%', `${formatNum((categoryScores.G || 0) * 0.3, 1)} pts`],
    ];

    autoTable(doc, {
      startY: 125,
      head: [pillarData[0]],
      body: pillarData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 40 },
        3: { halign: 'center', cellWidth: 50 },
      },
    });

    // Executive Summary
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resume Executif', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryText = generateExecutiveSummary(data, totalScore, grade, categoryScores, sectorLabel);
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
    doc.text(splitSummary, 14, yPos);
    yPos += splitSummary.length * 5 + 10;

    // === PAGE 2+: DETAILED INDICATORS ===
    doc.addPage();
    yPos = 20;
    
    data.categories.forEach((category, catIndex) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Category Header
      const catColor = category.id === 'E' ? [16, 185, 129] : category.id === 'S' ? [59, 130, 246] : [139, 92, 246];
      
      doc.setFillColor(catColor[0], catColor[1], catColor[2]);
      doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${category.label} (${category.id})`, 20, yPos + 2);
      yPos += 12;

      const indicatorRows = category.indicators.map(ind => [
        ind.id,
        ind.label.length > 40 ? ind.label.substring(0, 40) + '...' : ind.label,
        ind.type === 'binary' 
          ? (ind.value === true ? 'Oui' : 'Non')
          : (typeof ind.value === 'number' ? formatNum(ind.value, 2) : '—'),
        ind.unit || '',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['ID', 'Indicateur', 'Valeur', 'Unite']],
        body: indicatorRows,
        theme: 'grid',
        headStyles: { 
          fillColor: catColor as [number, number, number],
          textColor: 255,
          fontSize: 9,
        },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 90 },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35 },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;
    });

    // === COMPLIANCE & METHODOLOGY PAGE ===
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Conformite Reglementaire', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const regulations = [
      '- Guide de Reporting ESG - Bourse de Tunis (BVMT)',
      '- Loi RSE Tunisie 2018-35',
      '- Directive europeenne CSRD (Double Materialite)',
      '- Normes IFRS S1/S2 Sustainability',
      "- Mecanisme d'Ajustement Carbone aux Frontieres (MACF)",
    ];

    regulations.forEach((reg) => {
      doc.text(reg, 18, yPos);
      yPos += 6;
    });

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Methodologie de Calcul', 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Score Global = (Environnement x 0,40) + (Social x 0,30) + (Gouvernance x 0,30)', 14, yPos);
    yPos += 6;
    doc.text('Base sur les 32 indicateurs du Guide BVMT et la Loi RSE 2018-35.', 14, yPos);
    yPos += 12;

    // Grade Scale
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Echelle des Grades ESG:', 14, yPos);
    yPos += 6;

    const gradeData = [
      ['Grade', 'Score', 'Niveau', 'Signification'],
      ['A / AA / AAA', '75-100', 'Excellence', 'Conforme aux standards export UE'],
      ['B / BB / BBB', '50-74', 'Transition', 'Performance solide, ameliorations possibles'],
      ['C / CC / CCC', '<50', 'Risque', 'Action requise pour conformite'],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [gradeData[0]],
      body: gradeData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'center', cellWidth: 35 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 30 },
        3: { cellWidth: 90 },
      },
    });

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Ce rapport est conforme aux exigences de la Banque Centrale de Tunisie pour les demandes de credits verts.', pageWidth / 2, pageHeight - 11, { align: 'center' });
      doc.text(`GreenInsight ESG Tunisia | Page ${i}/${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // Save
    const safeName = (data.companyName || 'Entreprise').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Rapport_ESG_${safeName}_${data.fiscalYear}.pdf`);
  };

  // Generate executive summary text
  const generateExecutiveSummary = (
    data: ESGData, 
    totalScore: number, 
    grade: string, 
    categoryScores: Record<string, number>,
    sectorLabel: string
  ): string => {
    const eScore = categoryScores.E || 0;
    const sScore = categoryScores.S || 0;
    const gScore = categoryScores.G || 0;
    
    const strongestPillar = eScore >= sScore && eScore >= gScore ? 'Environnement' :
                           sScore >= eScore && sScore >= gScore ? 'Social' : 'Gouvernance';
    const weakestPillar = eScore <= sScore && eScore <= gScore ? 'Environnement' :
                         sScore <= eScore && sScore <= gScore ? 'Social' : 'Gouvernance';
    
    let summary = `${data.companyName || 'L\'entreprise'} opere dans le secteur ${sectorLabel} `;
    summary += `et affiche un score ESG global de ${totalScore.toFixed(0)}/100 (Grade ${grade}). `;
    
    if (totalScore >= 75) {
      summary += `Cette performance d'excellence positionne l'entreprise parmi les leaders en matiere de durabilite, `;
      summary += `facilitant l'acces aux financements verts et aux marches europeens conformes au MACF. `;
    } else if (totalScore >= 50) {
      summary += `Cette performance de transition indique une base solide avec des opportunites d'amelioration. `;
      summary += `L'entreprise est en bonne voie pour atteindre les standards d'exportation europeens. `;
    } else {
      summary += `Ce score indique des axes d'amelioration prioritaires a adresser pour assurer la conformite reglementaire. `;
    }
    
    summary += `Le pilier ${strongestPillar} constitue le point fort de l'entreprise, `;
    summary += `tandis que le pilier ${weakestPillar} merite une attention particuliere dans le plan d'action RSE.`;
    
    return summary;
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-emerald-50/50 to-background dark:from-emerald-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Export Rapport BCT
        </CardTitle>
        <CardDescription>
          Rapport "Pret pour la Banque" - Conforme aux exigences BCT pour les credits verts
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
          Telecharger le Rapport PDF
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

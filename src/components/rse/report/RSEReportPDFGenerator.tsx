// RSE Report PDF Generator - Full Regulatory Compliant Document
// Uses jsPDF for vector-based PDF generation

import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { RSEReportData } from '@/hooks/useRSEReport';

// Color palette (RGB values)
const COLORS = {
  emerald: { r: 16, g: 185, b: 129 },
  blue: { r: 59, g: 130, b: 246 },
  purple: { r: 139, g: 92, b: 246 },
  slate: { r: 100, g: 116, b: 139 },
  dark: { r: 30, g: 41, b: 59 },
  amber: { r: 245, g: 158, b: 11 },
  red: { r: 239, g: 68, b: 68 },
  white: { r: 255, g: 255, b: 255 },
  lightGray: { r: 248, g: 250, b: 252 },
};

export async function generateRSEReportPDF(
  reportData: RSEReportData,
  onProgress?: (step: string) => void
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  const formatNum = (n: number) => n.toLocaleString('fr-FR');
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Helper: Draw rounded rectangle
  const drawRoundedRect = (x: number, yPos: number, w: number, h: number, r: number, color: typeof COLORS.emerald, fill = true) => {
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yPos, w, h, r, r, fill ? 'F' : 'S');
  };

  // Helper: Add new page with header
  const addNewPage = () => {
    doc.addPage();
    y = margin;
    doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.rect(0, 0, pageWidth, 8, 'F');
    y = 20;
  };

  // Helper: Draw visual gauge (arc-based score indicator)
  const drawGauge = (x: number, yPos: number, radius: number, percentage: number, color: typeof COLORS.emerald, label: string) => {
    const centerX = x + radius;
    const centerY = yPos + radius;
    
    // Background circle
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.circle(centerX, centerY, radius, 'F');
    
    // Draw arc segments for progress
    const segments = 36;
    const filledSegments = Math.round((percentage / 100) * segments);
    
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * 10 - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * 10 - 90) * (Math.PI / 180);
      
      if (i < filledSegments) {
        doc.setFillColor(color.r, color.g, color.b);
      } else {
        doc.setFillColor(226, 232, 240);
      }
      
      // Draw segment as small arc approximation
      const innerRadius = radius * 0.7;
      const outerRadius = radius;
      
      const x1 = centerX + Math.cos(startAngle) * innerRadius;
      const y1 = centerY + Math.sin(startAngle) * innerRadius;
      const x2 = centerX + Math.cos(startAngle) * outerRadius;
      const y2 = centerY + Math.sin(startAngle) * outerRadius;
      const x3 = centerX + Math.cos(endAngle) * outerRadius;
      const y3 = centerY + Math.sin(endAngle) * outerRadius;
      const x4 = centerX + Math.cos(endAngle) * innerRadius;
      const y4 = centerY + Math.sin(endAngle) * innerRadius;
      
      doc.triangle(x1, y1, x2, y2, x3, y3, 'F');
      doc.triangle(x1, y1, x3, y3, x4, y4, 'F');
    }
    
    // Inner white circle
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, centerY, radius * 0.65, 'F');
    
    // Score text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(`${percentage.toFixed(0)}`, centerX, centerY + 2, { align: 'center' });
    
    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(label, centerX, centerY + radius + 8, { align: 'center' });
  };

  // Helper: Draw KPI card
  const drawKPICard = (x: number, yPos: number, w: number, h: number, value: string, label: string, color: typeof COLORS.emerald) => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(x, yPos, w, h, 4, 4, 'F');
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yPos, w, 4, 4, 4, 'F');
    doc.rect(x, yPos + 2, w, 2, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(value, x + w/2, yPos + 20, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    const labelLines = doc.splitTextToSize(label, w - 6);
    doc.text(labelLines, x + w/2, yPos + 30, { align: 'center' });
  };

  // Helper: Draw progress bar
  const drawProgressBar = (x: number, yPos: number, w: number, h: number, percentage: number, color: typeof COLORS.emerald) => {
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, yPos, w, h, 2, 2, 'F');
    const progressWidth = Math.max(0, Math.min(w, (percentage / 100) * w));
    if (progressWidth > 0) {
      doc.setFillColor(color.r, color.g, color.b);
      doc.roundedRect(x, yPos, progressWidth, h, 2, 2, 'F');
    }
  };

  // Helper: Draw table with proper spacing
  const drawBudgetTable = (x: number, yPos: number, budgetStats: RSEReportData['budgetStats']) => {
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / 4;
    const rowHeight = 20;
    
    // Table background
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(x, yPos, tableWidth, rowHeight * 2 + 10, 4, 4, 'F');
    
    // Header row
    doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.roundedRect(x, yPos, tableWidth, rowHeight, 4, 4, 'F');
    doc.rect(x, yPos + rowHeight - 4, tableWidth, 4, 'F');
    
    // Header texts
    const headers = ['Budget Alloue', 'Budget Consomme', 'Budget Restant', 'Taux Utilisation'];
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    headers.forEach((header, idx) => {
      const cellX = x + idx * colWidth + colWidth / 2;
      doc.text(header, cellX, yPos + 13, { align: 'center' });
    });
    
    // Data row
    const values = [
      `${formatNum(budgetStats.allocated)} TND`,
      `${formatNum(budgetStats.spent)} TND`,
      `${formatNum(budgetStats.remaining)} TND`,
      `${budgetStats.utilizationRate}%`
    ];
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    
    values.forEach((value, idx) => {
      const cellX = x + idx * colWidth + colWidth / 2;
      doc.text(value, cellX, yPos + rowHeight + 15, { align: 'center' });
    });
    
    // Progress bar below
    drawProgressBar(x + 10, yPos + rowHeight * 2 + 5, tableWidth - 20, 4, budgetStats.utilizationRate, COLORS.emerald);
    
    return rowHeight * 2 + 15;
  };

  onProgress?.('Generation de la page de couverture...');

  // ===== PAGE 1: COVER =====
  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Decorative elements
  doc.setFillColor(20, 200, 140);
  doc.circle(pageWidth - 30, 30, 60, 'F');
  doc.setFillColor(12, 170, 120);
  doc.circle(30, 80, 40, 'F');

  // Title - using clean ASCII text (no emoji encoding issues)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT RSE', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Responsabilite Societale de l\'Entreprise', pageWidth / 2, 55, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Exercice ${reportData.fiscalYear}`, pageWidth / 2, 85, { align: 'center' });

  // Company info card
  y = 115;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 35, 6, 6, 'F');
  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.roundedRect(margin, y, 4, 35, 2, 0, 'F');
  
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportData.companyName, margin + 12, y + 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text(`Secteur : ${reportData.sectorLabel}`, margin + 12, y + 26);

  // Key metrics with visual gauges
  y = 165;
  const gaugeRadius = 18;
  const gaugeSpacing = (pageWidth - 2*margin) / 4;
  
  drawGauge(margin + gaugeSpacing * 0, y, gaugeRadius, reportData.esgScores.totalScore, COLORS.emerald, 'Score ESG');
  drawGauge(margin + gaugeSpacing * 1, y, gaugeRadius, reportData.actionStats.completionRate, COLORS.blue, 'Realisation');
  drawGauge(margin + gaugeSpacing * 2, y, gaugeRadius, reportData.csrdProgress, COLORS.purple, 'CSRD');
  drawGauge(margin + gaugeSpacing * 3, y, gaugeRadius, reportData.regionalImpact.percentage, COLORS.amber, 'Territorial');

  // Source attribution
  y = 225;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 25, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.setFont('helvetica', 'bold');
  const sourceText = 'Ce rapport RSE est genere a partir du module de Scoring ESG et du module de Pilotage RSE de la plateforme GreenInsight.';
  const sourceLines = doc.splitTextToSize(sourceText, pageWidth - 2*margin - 12);
  doc.text(sourceLines, pageWidth / 2, y + 10, { align: 'center' });

  // Regulatory compliance badges
  y = 260;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text('Conforme aux referentiels :', margin, y);
  
  y += 10;
  const badges = ['Loi RSE 2018-35', 'CSRD (UE)', 'ISO 26000', 'GRI Standards', 'Guide BVMT'];
  let badgeX = margin;
  doc.setFontSize(7);
  badges.forEach(badge => {
    const badgeWidth = doc.getTextWidth(badge) + 10;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(badgeX, y - 4, badgeWidth, 10, 2, 2, 'F');
    doc.setTextColor(71, 85, 105);
    doc.text(badge, badgeX + 5, y + 3);
    badgeX += badgeWidth + 4;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Genere le ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Generation de la table des matieres...');

  // ===== PAGE 2: TABLE OF CONTENTS =====
  addNewPage();
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Sommaire', margin, y);
  
  y += 20;
  const tocItems = [
    { num: '1', title: 'Mot du Dirigeant', page: '3' },
    { num: '2', title: 'Introduction et Contexte Reglementaire', page: '4' },
    { num: '3', title: 'Resultats ESG Globaux', page: '5' },
    { num: '4', title: 'Analyse par Pilier ESG', page: '6' },
    { num: '5', title: 'Matrice de Materialite', page: '8' },
    { num: '6', title: 'Plan d\'Actions RSE Detaille', page: '9' },
    { num: '7', title: 'Gouvernance et Conformite', page: '11' },
    { num: '8', title: 'Indicateurs Cles ESG', page: '12' },
    { num: '9', title: 'Perspectives et Feuille de Route', page: '13' },
    { num: '10', title: 'Methodologie', page: '14' },
  ];
  
  tocItems.forEach(item => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.text(item.num, margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(item.title, margin + 12, y);
    
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(item.page, pageWidth - margin, y, { align: 'right' });
    
    y += 12;
  });

  onProgress?.('Generation du mot du dirigeant...');

  // ===== PAGE 3: MOT DU DIRIGEANT (CEO MESSAGE) =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('1. Mot du Dirigeant', margin, y);
  
  y += 15;
  
  // Decorative quote box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 80, 6, 6, 'F');
  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.roundedRect(margin, y, 4, 80, 2, 0, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  
  const ceoMessage = `"La responsabilite societale est au coeur de notre strategie d'entreprise. Ce rapport temoigne de notre engagement envers un developpement durable et responsable, en harmonie avec les attentes de nos parties prenantes et les exigences reglementaires tunisiennes et internationales.

Notre ambition est de creer de la valeur partagee tout en reduisant notre empreinte environnementale et en renforçant notre impact social positif."`;
  
  const ceoLines = doc.splitTextToSize(ceoMessage, pageWidth - 2*margin - 20);
  doc.text(ceoLines, margin + 12, y + 15);
  
  y += 95;
  
  // Signature placeholder
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('[Nom du Dirigeant]', pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text('Directeur General', pageWidth - margin, y + 8, { align: 'right' });

  onProgress?.('Generation du contexte reglementaire...');

  // ===== PAGE 4: REGULATORY CONTEXT =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('2. Introduction et Contexte Reglementaire', margin, y);
  
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const introText = `Ce rapport RSE de ${reportData.companyName} presente une synthese complete de la performance extra-financiere de l'entreprise pour l'exercice ${reportData.fiscalYear}. Il agregge les donnees issues du module de Scoring ESG (mesure, benchmark, methodologie) et du module de Pilotage RSE (actions, budgets, statuts, impacts).`;
  const introTextLines = doc.splitTextToSize(introText, pageWidth - 2*margin);
  doc.text(introTextLines, margin, y);
  
  y += introTextLines.length * 5 + 15;

  // Tunisian regulations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('[TN] Reglementation Tunisienne', margin, y);
  
  y += 10;
  reportData.regulatoryFramework.tunisian.forEach(reg => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(margin, y, pageWidth - 2*margin, 18, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(reg.name, margin + 5, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(reg.description, margin + 5, y + 14);
    
    y += 22;
  });

  y += 5;
  
  // International standards
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('[INTL] Referentiels Internationaux', margin, y);
  
  y += 10;
  reportData.regulatoryFramework.international.forEach(reg => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(margin, y, pageWidth - 2*margin, 18, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(reg.name, margin + 5, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(reg.description, margin + 5, y + 14);
    
    y += 22;
  });

  onProgress?.('Generation des resultats ESG...');

  // ===== PAGE 5: ESG RESULTS WITH VISUAL GAUGES =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('3. Resultats ESG Globaux', margin, y);
  
  y += 20;

  // Global score with large gauge
  const mainGaugeRadius = 35;
  drawGauge(margin, y, mainGaugeRadius, reportData.esgScores.totalScore, COLORS.emerald, '');
  
  // Score details next to gauge
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.text(`${reportData.esgScores.totalScore.toFixed(0)}/100`, margin + mainGaugeRadius * 2 + 20, y + 25);
  
  doc.setFontSize(16);
  doc.text(reportData.esgScores.grade, margin + mainGaugeRadius * 2 + 80, y + 25);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`Score ESG Global - ${reportData.esgScores.gradeLabel}`, margin + mainGaugeRadius * 2 + 20, y + 40);

  // Benchmark position
  doc.setFontSize(10);
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  const positionLabels: Record<string, string> = {
    'top10': 'Top 10% du secteur',
    'top25': 'Top 25% du secteur',
    'average': 'Dans la moyenne sectorielle',
    'below': 'Sous la moyenne sectorielle',
  };
  doc.text(positionLabels[reportData.benchmark.position], margin + mainGaugeRadius * 2 + 20, y + 52);
  
  y += 80;

  // Category gauges in a row
  const categoryGaugeRadius = 25;
  const categories = [
    { id: 'E', name: 'Environnement', color: COLORS.emerald, score: reportData.esgScores.categoryScores.E || 0 },
    { id: 'S', name: 'Social', color: COLORS.blue, score: reportData.esgScores.categoryScores.S || 0 },
    { id: 'G', name: 'Gouvernance', color: COLORS.purple, score: reportData.esgScores.categoryScores.G || 0 },
  ];
  
  const categorySpacing = (pageWidth - 2*margin) / 3;
  categories.forEach((cat, idx) => {
    const x = margin + idx * categorySpacing + (categorySpacing - categoryGaugeRadius * 2) / 2;
    drawGauge(x, y, categoryGaugeRadius, cat.score, cat.color, cat.name);
  });
  
  y += categoryGaugeRadius * 2 + 25;

  // Weighting info
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 25, 4, 4, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Ponderation appliquee :', margin + 10, y + 10);
  
  doc.setFont('helvetica', 'normal');
  const weightText = `E: ${reportData.weightingConfig.e.toFixed(0)}% - S: ${reportData.weightingConfig.s.toFixed(0)}% - G: ${reportData.weightingConfig.g.toFixed(0)}% (Mode ${reportData.weightingConfig.mode})`;
  doc.text(weightText, margin + 10, y + 18);

  onProgress?.('Generation de l\'analyse par pilier...');

  // ===== PAGE 6-7: PILLAR ANALYSIS =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('4. Analyse par Pilier ESG', margin, y);
  
  y += 15;

  const categoryConfigs = [
    { id: 'E', name: 'Environnement', color: COLORS.emerald, icon: '[E]' },
    { id: 'S', name: 'Social', color: COLORS.blue, icon: '[S]' },
    { id: 'G', name: 'Gouvernance', color: COLORS.purple, icon: '[G]' },
  ];

  categoryConfigs.forEach((catConfig) => {
    if (y > pageHeight - 80) {
      addNewPage();
    }
    
    const catData = reportData.categories.find(c => c.id === catConfig.id);
    const catScore = reportData.esgScores.categoryScores[catConfig.id] || 0;
    const catActions = reportData.actionStats.byCategory[catConfig.id as 'E' | 'S' | 'G'];
    
    // Section header
    doc.setFillColor(catConfig.color.r, catConfig.color.g, catConfig.color.b);
    doc.roundedRect(margin, y, pageWidth - 2*margin, 25, 4, 4, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${catConfig.icon} ${catConfig.name}`, margin + 10, y + 16);
    
    // Mini gauge for score
    doc.setFontSize(16);
    doc.text(`${catScore.toFixed(0)}/100`, pageWidth - margin - 10, y + 16, { align: 'right' });
    
    y += 35;
    
    // Key indicators (first 5)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text('Indicateurs cles :', margin, y);
    
    y += 8;
    catData?.indicators.slice(0, 5).forEach(ind => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
      
      // Truncate label if too long
      let labelText = ind.label;
      if (labelText.length > 50) {
        labelText = labelText.substring(0, 47) + '...';
      }
      doc.text(`- ${labelText}`, margin + 5, y);
      
      let valueStr = '—';
      if (ind.value !== undefined) {
        valueStr = ind.type === 'binary' 
          ? (ind.value ? 'Oui' : 'Non') 
          : `${Number(ind.value).toLocaleString('fr-FR')} ${ind.unit}`;
      }
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(valueStr, pageWidth - margin, y, { align: 'right' });
      
      y += 6;
    });
    
    y += 5;
    
    // Actions summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text('Actions associees :', margin, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const completionPct = catActions.count > 0 ? Math.round((catActions.completed / catActions.count) * 100) : 0;
    const actionsText = `${catActions.completed}/${catActions.count} actions terminees (${completionPct}%)`;
    doc.text(actionsText, margin + 5, y);
    
    drawProgressBar(margin + 90, y - 3, 60, 4, completionPct, catConfig.color);
    
    y += 20;
  });

  onProgress?.('Generation de la matrice de materialite...');

  // ===== PAGE 8: MATERIALITY MATRIX =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('5. Matrice de Materialite', margin, y);
  
  y += 15;
  
  // Description
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const matDesc = 'La matrice de materialite identifie les enjeux ESG les plus significatifs pour l\'entreprise et ses parties prenantes, conformement aux exigences de la CSRD et du principe de double materialite.';
  const matDescLines = doc.splitTextToSize(matDesc, pageWidth - 2*margin);
  doc.text(matDescLines, margin, y);
  
  y += matDescLines.length * 5 + 15;
  
  // Placeholder matrix visualization
  const matrixSize = 100;
  const matrixX = (pageWidth - matrixSize) / 2;
  
  // Background
  doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.roundedRect(matrixX, y, matrixSize, matrixSize, 4, 4, 'F');
  
  // Grid lines
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  for (let i = 1; i < 4; i++) {
    const linePos = matrixSize * i / 4;
    doc.line(matrixX + linePos, y, matrixX + linePos, y + matrixSize);
    doc.line(matrixX, y + linePos, matrixX + matrixSize, y + linePos);
  }
  
  // Axes labels
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Impact Entreprise', matrixX + matrixSize / 2, y + matrixSize + 10, { align: 'center' });
  
  // Vertical label (rotated simulation with multiple lines)
  doc.text('Impact', matrixX - 10, y + matrixSize / 2 - 5);
  doc.text('Parties', matrixX - 10, y + matrixSize / 2 + 2);
  doc.text('Prenantes', matrixX - 10, y + matrixSize / 2 + 9);
  
  // Sample data points
  const materialityPoints = [
    { x: 0.8, y: 0.9, label: 'Climat', color: COLORS.emerald },
    { x: 0.7, y: 0.75, label: 'Eau', color: COLORS.blue },
    { x: 0.6, y: 0.6, label: 'Emploi', color: COLORS.purple },
    { x: 0.5, y: 0.8, label: 'Ethique', color: COLORS.amber },
  ];
  
  materialityPoints.forEach(point => {
    const px = matrixX + point.x * matrixSize;
    const py = y + (1 - point.y) * matrixSize;
    doc.setFillColor(point.color.r, point.color.g, point.color.b);
    doc.circle(px, py, 4, 'F');
    doc.setFontSize(6);
    doc.setTextColor(point.color.r, point.color.g, point.color.b);
    doc.text(point.label, px, py - 6, { align: 'center' });
  });
  
  y += matrixSize + 25;
  
  // Note
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 20, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.setFont('helvetica', 'bold');
  doc.text('[!] Cette matrice est un exemple. Configurez vos enjeux materiels dans le module ESG.', margin + 10, y + 12);

  onProgress?.('Generation du plan d\'actions...');

  // ===== PAGE 9-10: ACTION PLAN =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('6. Plan d\'Actions RSE Detaille', margin, y);
  
  y += 15;

  // Action stats with gauges
  const actionGaugeRadius = 18;
  const actionGaugeSpacing = (pageWidth - 2*margin) / 5;
  
  const actionStats = [
    { label: 'Total', value: reportData.actionStats.total, pct: 100, color: COLORS.slate },
    { label: 'Terminees', value: reportData.actionStats.completed, pct: reportData.actionStats.completionRate, color: COLORS.emerald },
    { label: 'En cours', value: reportData.actionStats.inProgress, pct: reportData.actionStats.total > 0 ? (reportData.actionStats.inProgress / reportData.actionStats.total) * 100 : 0, color: COLORS.blue },
    { label: 'A faire', value: reportData.actionStats.todo, pct: reportData.actionStats.total > 0 ? (reportData.actionStats.todo / reportData.actionStats.total) * 100 : 0, color: COLORS.amber },
    { label: 'Bloquees', value: reportData.actionStats.blocked, pct: reportData.actionStats.total > 0 ? (reportData.actionStats.blocked / reportData.actionStats.total) * 100 : 0, color: COLORS.red },
  ];
  
  actionStats.forEach((stat, idx) => {
    const x = margin + idx * actionGaugeSpacing;
    
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(x, y, actionGaugeSpacing - 5, 45, 3, 3, 'F');
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color.r, stat.color.g, stat.color.b);
    doc.text(String(stat.value), x + (actionGaugeSpacing - 5) / 2, y + 22, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(stat.label, x + (actionGaugeSpacing - 5) / 2, y + 35, { align: 'center' });
  });
  
  y += 60;

  // Budget section with proper table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Suivi Budgetaire', margin, y);
  
  y += 10;
  const tableHeight = drawBudgetTable(margin, y, reportData.budgetStats);
  y += tableHeight + 15;

  // Regional Impact - with correct CO2 calculation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.text('[TN] Impact Territorial (Loi 2018-35)', margin, y);
  
  y += 10;
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 40, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`${reportData.regionalImpact.actionsCount} actions contribuant au developpement regional`, margin + 10, y + 12);
  
  // CO2 reduction from completed actions
  const co2Avoided = reportData.regionalImpact.co2Reduction;
  const co2Text = co2Avoided > 0 
    ? `${formatNum(co2Avoided)} tCO2e evitees grace aux actions terminees`
    : 'Calculez l\'impact CO2 en definissant les objectifs de reduction dans vos actions';
  doc.text(co2Text, margin + 10, y + 24);
  
  // Show gauge for regional percentage
  drawProgressBar(margin + 10, y + 32, pageWidth - 2*margin - 20, 4, reportData.regionalImpact.percentage, COLORS.amber);

  onProgress?.('Generation de la methodologie...');

  // ===== PAGE: METHODOLOGY =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('10. Methodologie', margin, y);
  
  y += 20;

  // Scoring formula
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Formule de Scoring', margin, y);
  
  y += 10;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 20, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setFont('courier', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(reportData.methodology.scoringFormula, margin + 10, y + 12);
  
  y += 30;

  // Weights explanation
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text(reportData.methodology.weights, margin, y);
  
  y += 20;

  // Data source
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Source des Donnees', margin, y);
  
  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  const dataSourceLines = doc.splitTextToSize(reportData.methodology.dataSource, pageWidth - 2*margin);
  doc.text(dataSourceLines, margin, y);
  
  y += dataSourceLines.length * 5 + 15;

  // Limitations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.text('[!] Limites Methodologiques', margin, y);
  
  y += 10;
  reportData.methodology.limitations.forEach(limitation => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    const limitLines = doc.splitTextToSize(`- ${limitation}`, pageWidth - 2*margin - 10);
    doc.text(limitLines, margin + 5, y);
    y += limitLines.length * 5 + 3;
  });

  y += 15;

  // Scope
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Perimetre du Rapport', margin, y);
  
  y += 10;
  const scopeItems = [
    { label: 'Entite', value: reportData.companyName },
    { label: 'Secteur', value: reportData.sectorLabel },
    { label: 'Exercice fiscal', value: String(reportData.fiscalYear) },
    { label: 'Chiffre d\'affaires', value: `${formatNum(reportData.revenue)} TND` },
  ];
  
  scopeItems.forEach(item => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(item.label, margin, y);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(item.value, margin + 50, y);
    y += 8;
  });

  // Final footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Rapport genere automatiquement par GreenInsight - ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Finalisation du document...');

  // Save the PDF
  const fileName = `Rapport_RSE_${reportData.companyName.replace(/\s+/g, '_')}_${reportData.fiscalYear}.pdf`;
  doc.save(fileName);
  
  toast.success('Rapport RSE genere avec succes !', {
    description: fileName,
  });
}

export default generateRSEReportPDF;

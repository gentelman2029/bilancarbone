// RSE Report PDF Generator - Universal Dynamic Template
// Uses jsPDF for vector-based PDF generation with dynamic variables
// Compliant with: Loi RSE 2018-35, CSRD, GRI, ISO 26000

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

type Color = typeof COLORS.emerald;

// Dynamic template variables interface
interface TemplateVariables {
  nom_entreprise: string;
  secteur_activite: string;
  periode_exercice: number;
  nom_dirigeant: string;
  titre_dirigeant: string;
  mot_dirigeant: string;
}

// Default template values
const getTemplateDefaults = (reportData: RSEReportData): TemplateVariables => ({
  nom_entreprise: reportData.companyName || 'Nom de l\'entreprise',
  secteur_activite: reportData.sectorLabel || 'Secteur d\'activite',
  periode_exercice: reportData.fiscalYear || new Date().getFullYear(),
  nom_dirigeant: 'Directeur General',
  titre_dirigeant: 'President-Directeur General',
  mot_dirigeant: `La responsabilite societale est au coeur de notre strategie d'entreprise. Ce rapport temoigne de notre engagement envers un developpement durable et responsable, en harmonie avec les attentes de nos parties prenantes et les exigences reglementaires tunisiennes et internationales.

Notre ambition est de creer de la valeur partagee tout en reduisant notre empreinte environnementale et en renforcant notre impact social positif. L'exercice ${reportData.fiscalYear} a ete marque par des avancees significatives dans notre demarche RSE, avec un taux de realisation de ${reportData.actionStats.completionRate}% de notre plan d'actions.`,
});

export async function generateRSEReportPDF(
  reportData: RSEReportData,
  onProgress?: (step: string) => void
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Get template variables
  const tpl = getTemplateDefaults(reportData);

  // ===== UTILITY FUNCTIONS =====
  
  // Format number with French convention (space separator)
  const formatNum = (n: number): string => {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  };

  // Format currency
  const formatCurrency = (n: number): string => {
    return `${formatNum(n)} TND`;
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Clean text for PDF (remove problematic characters)
  const cleanText = (text: string): string => {
    return text
      .replace(/[^\x00-\x7F]/g, (char) => {
        // Map common special characters to ASCII equivalents
        const charMap: Record<string, string> = {
          '\u00e9': 'e', '\u00e8': 'e', '\u00ea': 'e', '\u00eb': 'e',
          '\u00e0': 'a', '\u00e2': 'a', '\u00e4': 'a',
          '\u00f9': 'u', '\u00fb': 'u', '\u00fc': 'u',
          '\u00f4': 'o', '\u00f6': 'o',
          '\u00ee': 'i', '\u00ef': 'i',
          '\u00e7': 'c',
          '\u00c9': 'E', '\u00c8': 'E', '\u00ca': 'E',
          '\u00c0': 'A', '\u00c2': 'A',
          '\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"',
          '\u2013': '-', '\u2014': '-',
          '\u2022': '-',
          '\u2026': '...',
          '\u20ac': 'EUR',
          '\u00b2': '2',
          '\u2082': '2',
        };
        return charMap[char] || '';
      });
  };

  // Add new page with header
  const addNewPage = () => {
    doc.addPage();
    y = margin;
    doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.rect(0, 0, pageWidth, 8, 'F');
    y = 20;
  };

  // ===== VISUAL COMPONENTS =====

  // Draw visual gauge (circular progress indicator)
  const drawGauge = (x: number, yPos: number, radius: number, percentage: number, color: Color, label: string) => {
    const centerX = x + radius;
    const centerY = yPos + radius;
    
    // Background circle
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.circle(centerX, centerY, radius, 'F');
    
    // Draw arc segments for progress
    const segments = 36;
    const filledSegments = Math.round((Math.min(100, Math.max(0, percentage)) / 100) * segments);
    
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * 10 - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * 10 - 90) * (Math.PI / 180);
      
      if (i < filledSegments) {
        doc.setFillColor(color.r, color.g, color.b);
      } else {
        doc.setFillColor(226, 232, 240);
      }
      
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
    doc.text(`${Math.round(percentage)}`, centerX, centerY + 2, { align: 'center' });
    
    // Label
    if (label) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
      doc.text(cleanText(label), centerX, centerY + radius + 8, { align: 'center' });
    }
  };

  // Draw radar/spider chart for ESG pillars
  const drawRadarChart = (x: number, yPos: number, size: number, scores: { e: number; s: number; g: number }) => {
    const centerX = x + size / 2;
    const centerY = yPos + size / 2;
    const maxRadius = size / 2 - 10;
    
    // Draw background grid circles
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      doc.circle(centerX, centerY, maxRadius * scale, 'S');
    });
    
    // Draw axis lines (3 axes for E, S, G)
    const angles = [-90, 30, 150]; // Degrees for each axis
    const labels = ['E', 'S', 'G'];
    const colors = [COLORS.emerald, COLORS.blue, COLORS.purple];
    
    doc.setLineWidth(0.3);
    angles.forEach((angle, idx) => {
      const rad = angle * Math.PI / 180;
      const endX = centerX + Math.cos(rad) * maxRadius;
      const endY = centerY + Math.sin(rad) * maxRadius;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(centerX, centerY, endX, endY);
      
      // Axis labels
      const labelX = centerX + Math.cos(rad) * (maxRadius + 8);
      const labelY = centerY + Math.sin(rad) * (maxRadius + 8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors[idx].r, colors[idx].g, colors[idx].b);
      doc.text(labels[idx], labelX, labelY + 3, { align: 'center' });
    });
    
    // Calculate polygon points based on scores
    const scoreValues = [scores.e / 100, scores.s / 100, scores.g / 100];
    const points: { x: number; y: number }[] = [];
    
    angles.forEach((angle, idx) => {
      const rad = angle * Math.PI / 180;
      const distance = maxRadius * scoreValues[idx];
      points.push({
        x: centerX + Math.cos(rad) * distance,
        y: centerY + Math.sin(rad) * distance,
      });
    });
    
    // Draw filled polygon (using lighter color for fill effect)
    doc.setFillColor(200, 240, 220);
    
    // Draw polygon as triangles from center
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      doc.triangle(centerX, centerY, points[i].x, points[i].y, points[next].x, points[next].y, 'F');
    }
    
    // Draw polygon outline
    doc.setDrawColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.setLineWidth(1.5);
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      doc.line(points[i].x, points[i].y, points[next].x, points[next].y);
    }
    
    // Draw score points
    points.forEach((point, idx) => {
      doc.setFillColor(colors[idx].r, colors[idx].g, colors[idx].b);
      doc.circle(point.x, point.y, 3, 'F');
    });
    
    // Add score values near points
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    angles.forEach((angle, idx) => {
      const rad = angle * Math.PI / 180;
      const scoreVal = [scores.e, scores.s, scores.g][idx];
      const labelDistance = maxRadius * (scoreValues[idx] + 0.15);
      const labelX = centerX + Math.cos(rad) * labelDistance;
      const labelY = centerY + Math.sin(rad) * labelDistance;
      doc.setTextColor(colors[idx].r, colors[idx].g, colors[idx].b);
      doc.text(`${Math.round(scoreVal)}`, labelX, labelY + 2, { align: 'center' });
    });
  };

  // Draw progress bar
  const drawProgressBar = (x: number, yPos: number, w: number, h: number, percentage: number, color: Color) => {
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, yPos, w, h, 2, 2, 'F');
    const progressWidth = Math.max(0, Math.min(w, (percentage / 100) * w));
    if (progressWidth > 0) {
      doc.setFillColor(color.r, color.g, color.b);
      doc.roundedRect(x, yPos, progressWidth, h, 2, 2, 'F');
    }
  };

  // Draw KPI card
  const drawKPICard = (x: number, yPos: number, w: number, h: number, value: string, label: string, color: Color) => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(x, yPos, w, h, 4, 4, 'F');
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yPos, w, 4, 4, 4, 'F');
    doc.rect(x, yPos + 2, w, 2, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(value, x + w / 2, yPos + 18, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    const labelLines = doc.splitTextToSize(cleanText(label), w - 6);
    doc.text(labelLines, x + w / 2, yPos + 28, { align: 'center' });
  };

  // Draw budget table with proper formatting
  const drawBudgetTable = (x: number, yPos: number, budgetStats: RSEReportData['budgetStats']): number => {
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / 4;
    const headerHeight = 18;
    const dataHeight = 22;
    
    // Table background
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(x, yPos, tableWidth, headerHeight + dataHeight, 4, 4, 'F');
    
    // Header row
    doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.roundedRect(x, yPos, tableWidth, headerHeight, 4, 4, 'F');
    doc.rect(x, yPos + headerHeight - 4, tableWidth, 4, 'F');
    
    // Header texts
    const headers = ['Budget Alloue', 'Budget Consomme', 'Budget Restant', 'Taux Utilisation'];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    headers.forEach((header, idx) => {
      const cellX = x + idx * colWidth + colWidth / 2;
      doc.text(header, cellX, yPos + 12, { align: 'center' });
    });
    
    // Vertical separators in data row
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    for (let i = 1; i < 4; i++) {
      const sepX = x + i * colWidth;
      doc.line(sepX, yPos + headerHeight, sepX, yPos + headerHeight + dataHeight);
    }
    
    // Data row values with proper formatting
    const values = [
      formatCurrency(budgetStats.allocated),
      formatCurrency(budgetStats.spent),
      formatCurrency(budgetStats.remaining),
      `${budgetStats.utilizationRate} %`
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    
    values.forEach((value, idx) => {
      const cellX = x + idx * colWidth + colWidth / 2;
      doc.text(value, cellX, yPos + headerHeight + 14, { align: 'center' });
    });
    
    return headerHeight + dataHeight + 5;
  };

  // Draw materiality matrix
  const drawMaterialityMatrix = (x: number, yPos: number, size: number): number => {
    const matrixX = x;
    const matrixY = yPos;
    
    // Background with grid
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(matrixX, matrixY, size, size, 4, 4, 'F');
    
    // Grid lines
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    for (let i = 1; i < 4; i++) {
      const linePos = size * i / 4;
      doc.line(matrixX + linePos, matrixY, matrixX + linePos, matrixY + size);
      doc.line(matrixX, matrixY + linePos, matrixX + size, matrixY + linePos);
    }
    
    // Border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(matrixX, matrixY, size, size, 4, 4, 'S');
    
    // Zone colors (quadrants)
    // High-High (top-right) - Green
    doc.setFillColor(220, 252, 231);
    doc.rect(matrixX + size / 2, matrixY, size / 2, size / 2, 'F');
    
    // Medium zones - Yellow
    doc.setFillColor(254, 249, 195);
    doc.rect(matrixX, matrixY, size / 2, size / 2, 'F');
    doc.rect(matrixX + size / 2, matrixY + size / 2, size / 2, size / 2, 'F');
    
    // Low-Low (bottom-left) - Light gray
    doc.setFillColor(241, 245, 249);
    doc.rect(matrixX, matrixY + size / 2, size / 2, size / 2, 'F');
    
    // Sample materiality issues (bubbles)
    const issues = [
      { x: 0.85, y: 0.9, label: 'Climat', color: COLORS.emerald, size: 6 },
      { x: 0.75, y: 0.8, label: 'Eau', color: COLORS.blue, size: 5 },
      { x: 0.65, y: 0.65, label: 'Emploi', color: COLORS.purple, size: 5 },
      { x: 0.55, y: 0.85, label: 'Ethique', color: COLORS.amber, size: 4 },
      { x: 0.4, y: 0.5, label: 'Dechets', color: COLORS.emerald, size: 4 },
      { x: 0.8, y: 0.6, label: 'Formation', color: COLORS.blue, size: 4 },
    ];
    
    issues.forEach(issue => {
      const px = matrixX + issue.x * size;
      const py = matrixY + (1 - issue.y) * size;
      doc.setFillColor(issue.color.r, issue.color.g, issue.color.b);
      doc.circle(px, py, issue.size, 'F');
      doc.setFontSize(6);
      doc.setTextColor(issue.color.r, issue.color.g, issue.color.b);
      doc.text(issue.label, px, py - issue.size - 2, { align: 'center' });
    });
    
    // Axis labels
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text('Impact Entreprise', matrixX + size / 2, matrixY + size + 10, { align: 'center' });
    
    // Rotated Y-axis label (simulated)
    doc.text('Impact', matrixX - 12, matrixY + size / 2 - 8);
    doc.text('Parties', matrixX - 12, matrixY + size / 2);
    doc.text('Prenantes', matrixX - 12, matrixY + size / 2 + 8);
    
    // Scale indicators
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text('Faible', matrixX + 5, matrixY + size - 3);
    doc.text('Eleve', matrixX + size - 10, matrixY + size - 3);
    doc.text('Eleve', matrixX + 5, matrixY + 8);
    
    return size + 20;
  };

  // ===== BEGIN PDF GENERATION =====

  onProgress?.('Generation de la page de couverture...');

  // ===== PAGE 1: COVER =====
  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Decorative elements
  doc.setFillColor(20, 200, 140);
  doc.circle(pageWidth - 30, 30, 60, 'F');
  doc.setFillColor(12, 170, 120);
  doc.circle(30, 80, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT RSE', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Responsabilite Societale de l\'Entreprise', pageWidth / 2, 55, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Exercice ${tpl.periode_exercice}`, pageWidth / 2, 85, { align: 'center' });

  // Company info card (dynamic variable)
  y = 115;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 6, 6, 'F');
  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.roundedRect(margin, y, 4, 35, 2, 0, 'F');
  
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(cleanText(tpl.nom_entreprise), margin + 12, y + 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text(`Secteur : ${cleanText(tpl.secteur_activite)}`, margin + 12, y + 26);

  // Key metrics with visual gauges
  y = 165;
  const gaugeRadius = 18;
  const gaugeSpacing = (pageWidth - 2 * margin) / 4;
  
  drawGauge(margin + gaugeSpacing * 0, y, gaugeRadius, reportData.esgScores.totalScore, COLORS.emerald, 'Score ESG');
  drawGauge(margin + gaugeSpacing * 1, y, gaugeRadius, reportData.actionStats.completionRate, COLORS.blue, 'Realisation');
  drawGauge(margin + gaugeSpacing * 2, y, gaugeRadius, reportData.csrdProgress, COLORS.purple, 'CSRD');
  drawGauge(margin + gaugeSpacing * 3, y, gaugeRadius, reportData.regionalImpact.percentage, COLORS.amber, 'Territorial');

  // Source attribution
  y = 225;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.setFont('helvetica', 'bold');
  const sourceText = 'Ce rapport RSE est genere a partir du module de Scoring ESG et du module de Pilotage RSE de la plateforme.';
  const sourceLines = doc.splitTextToSize(sourceText, pageWidth - 2 * margin - 12);
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
    
    // Dotted line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    const titleWidth = doc.getTextWidth(item.title);
    const dotStart = margin + 14 + titleWidth;
    const dotEnd = pageWidth - margin - 15;
    for (let dx = dotStart; dx < dotEnd; dx += 3) {
      doc.circle(dx, y - 1, 0.3, 'F');
    }
    
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(item.page, pageWidth - margin, y, { align: 'right' });
    
    y += 14;
  });

  onProgress?.('Generation du mot du dirigeant...');

  // ===== PAGE 3: CEO MESSAGE =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('1. Mot du Dirigeant', margin, y);
  
  y += 15;
  
  // Decorative quote box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 90, 6, 6, 'F');
  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.roundedRect(margin, y, 4, 90, 2, 0, 'F');
  
  // Quote marks
  doc.setFontSize(36);
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.text('"', margin + 10, y + 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  
  const ceoMessageLines = doc.splitTextToSize(cleanText(tpl.mot_dirigeant), pageWidth - 2 * margin - 30);
  doc.text(ceoMessageLines, margin + 18, y + 25);
  
  y += 105;
  
  // Signature placeholder (dynamic variable)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`[${tpl.nom_dirigeant}]`, pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text(tpl.titre_dirigeant, pageWidth - margin, y + 8, { align: 'right' });

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
  const introText = `Ce rapport RSE de ${cleanText(tpl.nom_entreprise)} presente une synthese complete de la performance extra-financiere de l'entreprise pour l'exercice ${tpl.periode_exercice}. Il agregge les donnees issues du module de Scoring ESG (mesure, benchmark, methodologie) et du module de Pilotage RSE (actions, budgets, statuts, impacts).`;
  const introTextLines = doc.splitTextToSize(introText, pageWidth - 2 * margin);
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
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(reg.name, margin + 5, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(cleanText(reg.description), margin + 5, y + 14);
    
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
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(reg.name, margin + 5, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(cleanText(reg.description), margin + 5, y + 14);
    
    y += 22;
  });

  onProgress?.('Generation des resultats ESG...');

  // ===== PAGE 5: ESG RESULTS WITH RADAR CHART =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('3. Resultats ESG Globaux', margin, y);
  
  y += 20;

  // Left side: Global score gauge
  const mainGaugeRadius = 35;
  drawGauge(margin, y, mainGaugeRadius, reportData.esgScores.totalScore, COLORS.emerald, '');
  
  // Score details next to gauge
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.text(`${Math.round(reportData.esgScores.totalScore)}/100`, margin + mainGaugeRadius * 2 + 20, y + 25);
  
  doc.setFontSize(16);
  doc.text(reportData.esgScores.grade, margin + mainGaugeRadius * 2 + 80, y + 25);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`Score ESG Global - ${cleanText(reportData.esgScores.gradeLabel)}`, margin + mainGaugeRadius * 2 + 20, y + 40);

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
  
  y += 85;

  // Radar chart for E/S/G comparison
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Analyse Comparative par Pilier (Radar ESG)', margin, y);
  
  y += 10;
  
  const radarSize = 80;
  drawRadarChart(margin + 20, y, radarSize, {
    e: reportData.esgScores.categoryScores.E || 0,
    s: reportData.esgScores.categoryScores.S || 0,
    g: reportData.esgScores.categoryScores.G || 0,
  });
  
  // Legend next to radar
  const legendX = margin + radarSize + 50;
  const legendY = y + 15;
  
  const pillarDetails = [
    { id: 'E', name: 'Environnement', color: COLORS.emerald, score: reportData.esgScores.categoryScores.E || 0 },
    { id: 'S', name: 'Social', color: COLORS.blue, score: reportData.esgScores.categoryScores.S || 0 },
    { id: 'G', name: 'Gouvernance', color: COLORS.purple, score: reportData.esgScores.categoryScores.G || 0 },
  ];
  
  pillarDetails.forEach((pillar, idx) => {
    const ly = legendY + idx * 22;
    
    doc.setFillColor(pillar.color.r, pillar.color.g, pillar.color.b);
    doc.circle(legendX, ly, 4, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(pillar.name, legendX + 10, ly + 3);
    
    doc.setTextColor(pillar.color.r, pillar.color.g, pillar.color.b);
    doc.text(`${Math.round(pillar.score)}/100`, legendX + 60, ly + 3);
    
    // Mini progress bar
    drawProgressBar(legendX + 10, ly + 7, 70, 3, pillar.score, pillar.color);
  });
  
  y += radarSize + 20;

  // Weighting info
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 4, 4, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Ponderation appliquee :', margin + 10, y + 10);
  
  doc.setFont('helvetica', 'normal');
  const weightText = `E: ${Math.round(reportData.weightingConfig.e)}% - S: ${Math.round(reportData.weightingConfig.s)}% - G: ${Math.round(reportData.weightingConfig.g)}% (Mode ${reportData.weightingConfig.mode})`;
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
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 4, 4, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${catConfig.icon} ${catConfig.name}`, margin + 10, y + 16);
    
    // Score badge
    doc.setFontSize(16);
    doc.text(`${Math.round(catScore)}/100`, pageWidth - margin - 10, y + 16, { align: 'right' });
    
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
      let labelText = cleanText(ind.label);
      if (labelText.length > 50) {
        labelText = labelText.substring(0, 47) + '...';
      }
      doc.text(`- ${labelText}`, margin + 5, y);
      
      let valueStr = '---';
      if (ind.value !== undefined) {
        valueStr = ind.type === 'binary' 
          ? (ind.value ? 'Oui' : 'Non') 
          : `${formatNum(Number(ind.value))} ${ind.unit || ''}`;
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
  const matDescLines = doc.splitTextToSize(matDesc, pageWidth - 2 * margin);
  doc.text(matDescLines, margin, y);
  
  y += matDescLines.length * 5 + 15;
  
  // Draw materiality matrix
  const matrixSize = 100;
  const matrixHeight = drawMaterialityMatrix((pageWidth - matrixSize) / 2 + 15, y, matrixSize);
  
  y += matrixHeight;
  
  // Legend
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Legende :', margin, y);
  
  y += 8;
  const legendItems = [
    { color: { r: 220, g: 252, b: 231 }, label: 'Enjeux prioritaires (double materialite elevee)' },
    { color: { r: 254, g: 249, b: 195 }, label: 'Enjeux a surveiller' },
    { color: { r: 241, g: 245, b: 249 }, label: 'Enjeux secondaires' },
  ];
  
  legendItems.forEach((item, idx) => {
    doc.setFillColor(item.color.r, item.color.g, item.color.b);
    doc.rect(margin + idx * 60, y, 8, 8, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    const labelLines = doc.splitTextToSize(item.label, 50);
    doc.text(labelLines, margin + idx * 60 + 10, y + 5);
  });
  
  y += 25;
  
  // Note
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.setFont('helvetica', 'bold');
  doc.text('[!] Configurez vos enjeux materiels dans le module ESG pour personnaliser cette matrice.', margin + 10, y + 12);

  onProgress?.('Generation du plan d\'actions...');

  // ===== PAGE 9-10: ACTION PLAN =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('6. Plan d\'Actions RSE Detaille', margin, y);
  
  y += 15;

  // Action stats KPI cards
  const cardWidth = (pageWidth - 2 * margin - 16) / 5;
  const cardHeight = 38;
  
  const actionKPIs = [
    { label: 'Total', value: String(reportData.actionStats.total), color: COLORS.slate },
    { label: 'Terminees', value: String(reportData.actionStats.completed), color: COLORS.emerald },
    { label: 'En cours', value: String(reportData.actionStats.inProgress), color: COLORS.blue },
    { label: 'A faire', value: String(reportData.actionStats.todo), color: COLORS.amber },
    { label: 'Bloquees', value: String(reportData.actionStats.blocked), color: COLORS.red },
  ];
  
  actionKPIs.forEach((kpi, idx) => {
    drawKPICard(margin + idx * (cardWidth + 4), y, cardWidth, cardHeight, kpi.value, kpi.label, kpi.color);
  });
  
  y += cardHeight + 15;

  // Budget section with proper table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Suivi Budgetaire', margin, y);
  
  y += 10;
  const tableHeight = drawBudgetTable(margin, y, reportData.budgetStats);
  y += tableHeight + 10;

  // Progress bar for budget utilization
  doc.setFontSize(8);
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text('Taux d\'utilisation budgetaire', margin, y);
  y += 5;
  drawProgressBar(margin, y, pageWidth - 2 * margin, 6, reportData.budgetStats.utilizationRate, COLORS.emerald);
  
  y += 20;

  // Regional Impact with CO2 calculation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.text('[TN] Impact Territorial (Loi 2018-35)', margin, y);
  
  y += 10;
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`${reportData.regionalImpact.actionsCount} actions contribuant au developpement regional`, margin + 10, y + 12);
  
  // CO2 reduction calculated from completed actions
  const co2Avoided = reportData.regionalImpact.co2Reduction;
  const co2Display = co2Avoided > 0 ? formatNum(co2Avoided) : '0';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.text(`${co2Display} tCO2e evitees`, margin + 10, y + 26);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  const co2Note = co2Avoided > 0 
    ? 'grace aux actions terminees avec objectifs de reduction definis'
    : 'Definissez les objectifs CO2 dans vos actions pour calculer les reductions';
  doc.text(co2Note, margin + 10, y + 36);
  
  // Regional percentage gauge
  drawProgressBar(margin + 10, y + 44, pageWidth - 2 * margin - 20, 4, reportData.regionalImpact.percentage, COLORS.amber);

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
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 4, 4, 'F');
  
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
  const dataSourceLines = doc.splitTextToSize(reportData.methodology.dataSource, pageWidth - 2 * margin);
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
    const limitLines = doc.splitTextToSize(`- ${cleanText(limitation)}`, pageWidth - 2 * margin - 10);
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
    { label: 'Entite', value: cleanText(tpl.nom_entreprise) },
    { label: 'Secteur', value: cleanText(tpl.secteur_activite) },
    { label: 'Exercice fiscal', value: String(tpl.periode_exercice) },
    { label: 'Chiffre d\'affaires', value: formatCurrency(reportData.revenue) },
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

  // Referentiels table
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Referentiels Utilises', margin, y);
  
  y += 10;
  const allRefs = [...reportData.regulatoryFramework.tunisian, ...reportData.regulatoryFramework.international];
  allRefs.forEach((ref, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.rect(margin, y - 3, pageWidth - 2 * margin, 8, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(ref.name, margin + 5, y + 3);
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(cleanText(ref.description).substring(0, 60), margin + 50, y + 3);
    y += 8;
  });

  // Final footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Rapport genere automatiquement - ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Finalisation du document...');

  // Save the PDF
  const cleanCompanyName = cleanText(tpl.nom_entreprise).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const fileName = `Rapport_RSE_${cleanCompanyName || 'Entreprise'}_${tpl.periode_exercice}.pdf`;
  doc.save(fileName);
  
  toast.success('Rapport RSE genere avec succes !', {
    description: fileName,
  });
}

export default generateRSEReportPDF;

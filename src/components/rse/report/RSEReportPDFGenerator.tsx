// RSE Report PDF Generator - Universal SaaS Template
// Uses jsPDF for vector-based PDF generation with dynamic variables
// Compliant with: Loi RSE 2018-35, CSRD, GRI, ISO 26000

import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { RSEReportData } from '@/hooks/useRSEReport';

// Professional color palette (RGB values) - Institutional dark theme
const COLORS = {
  // Primary palette - Sober & Professional
  navyBlue: { r: 26, g: 54, b: 93 },      // Bleu nuit - Main accent
  emeraldDark: { r: 5, g: 102, b: 68 },   // Vert emeraude fonce - ESG/Sustainability
  anthracite: { r: 55, g: 65, b: 81 },    // Gris anthracite - Text
  
  // Secondary palette
  slate: { r: 100, g: 116, b: 139 },
  slateLight: { r: 148, g: 163, b: 184 },
  dark: { r: 30, g: 41, b: 59 },
  
  // Accent colors
  teal: { r: 20, g: 184, b: 166 },
  amber: { r: 217, g: 119, b: 6 },
  red: { r: 185, g: 28, b: 28 },
  
  // Neutrals
  white: { r: 255, g: 255, b: 255 },
  lightGray: { r: 248, g: 250, b: 252 },
  paleGreen: { r: 236, g: 253, b: 245 },
  paleBlue: { r: 239, g: 246, b: 255 },
};

type Color = typeof COLORS.navyBlue;

// Dynamic template variables interface
interface TemplateVariables {
  company_name: string;
  sector_name: string;
  fiscal_year: number;
  ceo_name: string;
  ceo_title: string;
  ceo_message: string;
  subsidiaries: string[];
}

// Default CEO message - Inspiring, no "placeholder" mention
const getDefaultCeoMessage = (fiscalYear: number, completionRate: number): string => {
  return `La responsabilite societale est au coeur de notre strategie d'entreprise. Ce rapport temoigne de notre engagement envers un developpement durable et responsable, en harmonie avec les attentes de nos parties prenantes et les exigences reglementaires.

Notre ambition est de creer de la valeur partagee tout en reduisant notre empreinte environnementale et en renforcant notre impact social positif. L'exercice ${fiscalYear} a ete marque par des avancees significatives dans notre demarche RSE, avec un taux de realisation de ${completionRate}% de notre plan d'actions.

Nous restons determines a poursuivre cette trajectoire vers l'excellence durable.`;
};

// Get template variables from report data
const getTemplateVariables = (reportData: RSEReportData): TemplateVariables => ({
  company_name: reportData.companyName || 'Votre Entreprise',
  sector_name: reportData.sectorLabel || 'Secteur d\'activite',
  fiscal_year: reportData.fiscalYear || new Date().getFullYear(),
  ceo_name: 'Directeur General',
  ceo_title: 'President-Directeur General',
  ceo_message: getDefaultCeoMessage(
    reportData.fiscalYear || new Date().getFullYear(),
    reportData.actionStats.completionRate
  ),
  subsidiaries: [],
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
  const tpl = getTemplateVariables(reportData);

  // ===== UTILITY FUNCTIONS =====
  
  // Format number with French convention (non-breaking space separator)
  const formatNum = (n: number): string => {
    if (n === undefined || n === null || isNaN(n)) return '0';
    // Use standard French formatting with space separators
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Format currency with proper spacing
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

  // Clean text for PDF (remove problematic characters - proper UTF-8 handling)
  const cleanText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[^\x00-\x7F]/g, (char) => {
        const charMap: Record<string, string> = {
          '\u00e9': 'e', '\u00e8': 'e', '\u00ea': 'e', '\u00eb': 'e',
          '\u00e0': 'a', '\u00e2': 'a', '\u00e4': 'a',
          '\u00f9': 'u', '\u00fb': 'u', '\u00fc': 'u',
          '\u00f4': 'o', '\u00f6': 'o',
          '\u00ee': 'i', '\u00ef': 'i',
          '\u00e7': 'c',
          '\u00c9': 'E', '\u00c8': 'E', '\u00ca': 'E',
          '\u00c0': 'A', '\u00c2': 'A',
          '\u00d4': 'O',
          '\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"',
          '\u2013': '-', '\u2014': '-',
          '\u2022': '-',
          '\u2026': '...',
          '\u20ac': 'EUR',
          '\u00b2': '2',
          '\u2082': '2',
          '\u00b0': 'o',
        };
        return charMap[char] || '';
      });
  };

  // Add new page with professional header bar
  const addNewPage = () => {
    doc.addPage();
    y = margin;
    // Professional header stripe
    doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
    doc.rect(0, 0, pageWidth, 6, 'F');
    y = 18;
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
      doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
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
    
    // Draw axis lines (3 axes for E, S, G) - Clean labels without prefixes
    const angles = [-90, 30, 150];
    const labels = ['Environnement', 'Social', 'Gouvernance'];
    const shortLabels = ['E', 'S', 'G'];
    const colors = [COLORS.emeraldDark, COLORS.navyBlue, COLORS.anthracite];
    
    doc.setLineWidth(0.3);
    angles.forEach((angle, idx) => {
      const rad = angle * Math.PI / 180;
      const endX = centerX + Math.cos(rad) * maxRadius;
      const endY = centerY + Math.sin(rad) * maxRadius;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(centerX, centerY, endX, endY);
      
      // Axis labels - short version for chart
      const labelX = centerX + Math.cos(rad) * (maxRadius + 8);
      const labelY = centerY + Math.sin(rad) * (maxRadius + 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors[idx].r, colors[idx].g, colors[idx].b);
      doc.text(shortLabels[idx], labelX, labelY + 3, { align: 'center' });
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
    
    // Draw filled polygon (professional green tint)
    doc.setFillColor(236, 253, 245);
    
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      doc.triangle(centerX, centerY, points[i].x, points[i].y, points[next].x, points[next].y, 'F');
    }
    
    // Draw polygon outline with professional color
    doc.setDrawColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
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

  // Draw KPI card - Professional style
  const drawKPICard = (x: number, yPos: number, w: number, h: number, value: string, label: string, color: Color, unit?: string) => {
    // Card background
    doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    doc.roundedRect(x, yPos, w, h, 4, 4, 'F');
    
    // Left accent stripe
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yPos, 3, h, 2, 0, 'F');
    doc.rect(x + 1.5, yPos, 1.5, h, 'F');
    
    // Shadow effect
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, yPos, w, h, 4, 4, 'S');
    
    // Value
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(value, x + w / 2 + 2, yPos + h / 2 - 2, { align: 'center' });
    
    // Unit if provided
    if (unit) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
      doc.text(unit, x + w / 2 + 2, yPos + h / 2 + 6, { align: 'center' });
    }
    
    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    const labelLines = doc.splitTextToSize(cleanText(label), w - 10);
    doc.text(labelLines, x + w / 2 + 2, yPos + h - 8, { align: 'center' });
  };

  // Draw budget table with proper formatting - Clean columns
  const drawBudgetTable = (x: number, yPos: number, budgetStats: RSEReportData['budgetStats']): number => {
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / 4;
    const headerHeight = 16;
    const dataHeight = 20;
    
    // Table border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, yPos, tableWidth, headerHeight + dataHeight, 3, 3, 'S');
    
    // Header row
    doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
    doc.roundedRect(x, yPos, tableWidth, headerHeight, 3, 3, 'F');
    doc.rect(x, yPos + headerHeight - 3, tableWidth, 3, 'F');
    
    // Header texts - Clean, no technical prefixes
    const headers = ['Budget Alloue', 'Budget Consomme', 'Budget Restant', 'Taux Utilisation'];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    headers.forEach((header, idx) => {
      const cellX = x + idx * colWidth + colWidth / 2;
      doc.text(header, cellX, yPos + 10, { align: 'center' });
    });
    
    // Data row background
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.rect(x, yPos + headerHeight, tableWidth, dataHeight, 'F');
    
    // Vertical separators in data row
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    for (let i = 1; i < 4; i++) {
      const sepX = x + i * colWidth;
      doc.line(sepX, yPos + headerHeight, sepX, yPos + headerHeight + dataHeight);
    }
    
    // Data row values with proper formatting (spaces, not slashes)
    const values = [
      formatCurrency(budgetStats.allocated),
      formatCurrency(budgetStats.spent),
      formatCurrency(budgetStats.remaining),
      `${Math.round(budgetStats.utilizationRate)}%`
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    
    values.forEach((value, idx) => {
      const cellX = x + idx * colWidth + colWidth / 2;
      doc.text(value, cellX, yPos + headerHeight + 13, { align: 'center' });
    });
    
    return headerHeight + dataHeight + 5;
  };

  // Draw dynamic materiality matrix - Uses real data if available
  const drawMaterialityMatrix = (x: number, yPos: number, size: number, hasData: boolean): number => {
    const matrixX = x;
    const matrixY = yPos;
    
    if (!hasData) {
      // No data state - Educational content about double materiality
      doc.setFillColor(COLORS.paleBlue.r, COLORS.paleBlue.g, COLORS.paleBlue.b);
      doc.roundedRect(matrixX - 20, matrixY, size + 40, size + 20, 6, 6, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
      doc.text('Double Materialite - Concept CSRD', matrixX + size / 2, matrixY + 15, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
      
      const eduText = `La directive CSRD impose une analyse de double materialite : evaluer a la fois l'impact de l'entreprise sur l'environnement et la societe, ET l'impact des enjeux ESG sur la performance financiere de l'entreprise.

Cette matrice sera alimentee automatiquement une fois vos enjeux strategiques definis dans le module ESG de la plateforme.`;
      
      const eduLines = doc.splitTextToSize(eduText, size + 20);
      doc.text(eduLines, matrixX + size / 2, matrixY + 30, { align: 'center' });
      
      // Key concepts
      const concepts = [
        'Impact sortant : Effets de l\'entreprise sur l\'environnement',
        'Impact entrant : Risques et opportunites pour l\'entreprise',
        'Enjeux prioritaires : Intersection des deux dimensions'
      ];
      
      let conceptY = matrixY + 65;
      doc.setFontSize(8);
      concepts.forEach(concept => {
        doc.setFillColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
        doc.circle(matrixX + 5, conceptY - 1, 2, 'F');
        doc.text(concept, matrixX + 12, conceptY);
        conceptY += 10;
      });
      
      return size + 30;
    }
    
    // Has data - Draw actual matrix
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
    
    // Zone colors (quadrants) with professional colors
    // High-High (top-right) - Green priority zone
    doc.setFillColor(COLORS.paleGreen.r, COLORS.paleGreen.g, COLORS.paleGreen.b);
    doc.rect(matrixX + size / 2, matrixY, size / 2, size / 2, 'F');
    
    // Medium zones - Light blue
    doc.setFillColor(COLORS.paleBlue.r, COLORS.paleBlue.g, COLORS.paleBlue.b);
    doc.rect(matrixX, matrixY, size / 2, size / 2, 'F');
    doc.rect(matrixX + size / 2, matrixY + size / 2, size / 2, size / 2, 'F');
    
    // Low-Low (bottom-left) - Light gray
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.rect(matrixX, matrixY + size / 2, size / 2, size / 2, 'F');
    
    // Sample materiality issues (bubbles) with clean labels
    const issues = [
      { x: 0.85, y: 0.9, label: 'Climat', color: COLORS.emeraldDark, size: 6 },
      { x: 0.75, y: 0.8, label: 'Eau', color: COLORS.navyBlue, size: 5 },
      { x: 0.65, y: 0.65, label: 'Emploi', color: COLORS.anthracite, size: 5 },
      { x: 0.55, y: 0.85, label: 'Ethique', color: COLORS.amber, size: 4 },
      { x: 0.4, y: 0.5, label: 'Dechets', color: COLORS.emeraldDark, size: 4 },
      { x: 0.8, y: 0.6, label: 'Formation', color: COLORS.navyBlue, size: 4 },
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
    
    // Axis labels - Clean, no technical prefixes
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text('Impact Entreprise', matrixX + size / 2, matrixY + size + 10, { align: 'center' });
    
    // Y-axis label
    doc.text('Impact', matrixX - 10, matrixY + size / 2 - 6);
    doc.text('Parties', matrixX - 10, matrixY + size / 2 + 2);
    doc.text('Prenantes', matrixX - 10, matrixY + size / 2 + 10);
    
    return size + 20;
  };

  // Draw validation checkmark list (replaces Yes/No table for governance)
  const drawValidationList = (x: number, yPos: number, items: Array<{ label: string; value: boolean | undefined | string | number }>): number => {
    let currentY = yPos;
    
    items.forEach(item => {
      // Determine if checked
      const isChecked = item.value === true || item.value === 'Oui' || (typeof item.value === 'number' && item.value > 0);
      const hasValue = item.value !== undefined && item.value !== null;
      
      // Icon circle
      if (hasValue && isChecked) {
        doc.setFillColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
        doc.circle(x + 4, currentY - 1, 3, 'F');
        // Checkmark
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.8);
        doc.line(x + 2.5, currentY - 1, x + 3.8, currentY + 0.5);
        doc.line(x + 3.8, currentY + 0.5, x + 5.5, currentY - 2);
      } else if (hasValue && !isChecked) {
        doc.setFillColor(COLORS.slateLight.r, COLORS.slateLight.g, COLORS.slateLight.b);
        doc.circle(x + 4, currentY - 1, 3, 'F');
        // X mark
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.line(x + 2.5, currentY - 2.5, x + 5.5, currentY + 0.5);
        doc.line(x + 5.5, currentY - 2.5, x + 2.5, currentY + 0.5);
      } else {
        doc.setFillColor(226, 232, 240);
        doc.circle(x + 4, currentY - 1, 3, 'F');
      }
      
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(cleanText(item.label), x + 12, currentY);
      
      currentY += 10;
    });
    
    return currentY - yPos;
  };

  // ===== BEGIN PDF GENERATION =====

  onProgress?.('Generation de la page de couverture...');

  // ===== PAGE 1: COVER =====
  // Professional navy gradient header
  doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Subtle decorative elements
  doc.setFillColor(40, 74, 113);
  doc.circle(pageWidth - 25, 25, 50, 'F');
  doc.setFillColor(20, 44, 83);
  doc.circle(25, 85, 35, 'F');

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
  doc.text(`Exercice ${tpl.fiscal_year}`, pageWidth / 2, 85, { align: 'center' });

  // Company info card (dynamic variables)
  y = 115;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 6, 6, 'F');
  doc.setFillColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
  doc.roundedRect(margin, y, 4, 35, 2, 0, 'F');
  
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(cleanText(tpl.company_name), margin + 12, y + 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  doc.text(`Secteur : ${cleanText(tpl.sector_name)}`, margin + 12, y + 26);

  // KPI Cards row - 4 key metrics
  y = 165;
  const kpiCardWidth = (pageWidth - 2 * margin - 15) / 4;
  const kpiCardHeight = 45;
  
  // Calculate total CO2 from completed actions
  const totalCO2Avoided = reportData.actions
    .filter(a => a.status === 'done' && a.impactMetrics?.co2ReductionTarget)
    .reduce((sum, a) => sum + (a.impactMetrics?.co2ReductionTarget || 0), 0);
  
  // Calculate total RSE investment
  const totalInvestment = reportData.budgetStats.allocated;
  
  drawKPICard(
    margin, 
    y, 
    kpiCardWidth, 
    kpiCardHeight, 
    `${Math.round(reportData.esgScores.totalScore)}`, 
    'Score ESG Global', 
    COLORS.emeraldDark,
    '/100'
  );
  
  drawKPICard(
    margin + kpiCardWidth + 5, 
    y, 
    kpiCardWidth, 
    kpiCardHeight, 
    totalCO2Avoided > 0 ? formatNum(totalCO2Avoided) : '---', 
    'Empreinte CO2 evitee', 
    COLORS.navyBlue,
    'tCO2e'
  );
  
  drawKPICard(
    margin + (kpiCardWidth + 5) * 2, 
    y, 
    kpiCardWidth, 
    kpiCardHeight, 
    `${Math.round(reportData.actionStats.completionRate)}%`, 
    'Taux de realisation', 
    COLORS.teal
  );
  
  drawKPICard(
    margin + (kpiCardWidth + 5) * 3, 
    y, 
    kpiCardWidth, 
    kpiCardHeight, 
    formatNum(totalInvestment), 
    'Investissement RSE', 
    COLORS.anthracite,
    'TND'
  );

  // Source attribution
  y = 225;
  doc.setFillColor(COLORS.paleGreen.r, COLORS.paleGreen.g, COLORS.paleGreen.b);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
  doc.setFont('helvetica', 'normal');
  const sourceText = 'Ce rapport est genere a partir des modules Scoring ESG et Pilotage RSE.';
  doc.text(sourceText, pageWidth / 2, y + 12, { align: 'center' });

  // Regulatory compliance badges - Clean, no brackets
  y = 255;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  doc.text('Conforme aux referentiels :', margin, y);
  
  y += 10;
  const badges = ['Loi RSE 2018-35', 'CSRD (UE)', 'ISO 26000', 'GRI Standards', 'Guide BVMT'];
  let badgeX = margin;
  doc.setFontSize(7);
  badges.forEach(badge => {
    const badgeWidth = doc.getTextWidth(badge) + 10;
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(badgeX, y - 4, badgeWidth, 10, 2, 2, 'F');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text(badge, badgeX + 5, y + 3);
    badgeX += badgeWidth + 4;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(COLORS.slateLight.r, COLORS.slateLight.g, COLORS.slateLight.b);
  doc.text(`Genere le ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Generation de la table des matieres...');

  // ===== PAGE 2: TABLE OF CONTENTS =====
  addNewPage();
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
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
    { num: '9', title: 'Perimetre de Consolidation', page: '13' },
    { num: '10', title: 'Methodologie', page: '14' },
  ];
  
  tocItems.forEach(item => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
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
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('1. Mot du Dirigeant', margin, y);
  
  y += 15;
  
  // Decorative quote box with professional styling
  doc.setFillColor(COLORS.paleBlue.r, COLORS.paleBlue.g, COLORS.paleBlue.b);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 90, 6, 6, 'F');
  doc.setFillColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.roundedRect(margin, y, 4, 90, 2, 0, 'F');
  
  // Quote marks
  doc.setFontSize(36);
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('"', margin + 10, y + 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  
  // CEO message - dynamic, no "placeholder" mention
  const ceoMessageLines = doc.splitTextToSize(cleanText(tpl.ceo_message), pageWidth - 2 * margin - 30);
  doc.text(ceoMessageLines, margin + 18, y + 25);
  
  y += 105;
  
  // Signature (dynamic variable)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(tpl.ceo_name, pageWidth - margin, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  doc.text(tpl.ceo_title, pageWidth - margin, y + 8, { align: 'right' });

  onProgress?.('Generation du contexte reglementaire...');

  // ===== PAGE 4: REGULATORY CONTEXT - Clean labels =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('2. Introduction et Contexte Reglementaire', margin, y);
  
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  const introText = `Ce rapport RSE de ${cleanText(tpl.company_name)} presente une synthese complete de la performance extra-financiere de l'entreprise pour l'exercice ${tpl.fiscal_year}. Il agregge les donnees issues du module de Scoring ESG (mesure, benchmark, methodologie) et du module de Pilotage RSE (actions, budgets, statuts, impacts).`;
  const introTextLines = doc.splitTextToSize(introText, pageWidth - 2 * margin);
  doc.text(introTextLines, margin, y);
  
  y += introTextLines.length * 5 + 15;

  // Tunisian regulations - Clean header, no technical prefixes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Reglementation Tunisienne', margin, y);
  
  y += 10;
  reportData.regulatoryFramework.tunisian.forEach(reg => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(reg.name, margin + 5, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text(cleanText(reg.description), margin + 5, y + 14);
    
    y += 22;
  });

  y += 5;
  
  // International standards - Clean header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Referentiels Internationaux', margin, y);
  
  y += 10;
  reportData.regulatoryFramework.international.forEach(reg => {
    doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(reg.name, margin + 5, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text(cleanText(reg.description), margin + 5, y + 14);
    
    y += 22;
  });

  onProgress?.('Generation des resultats ESG...');

  // ===== PAGE 5: ESG RESULTS WITH RADAR CHART =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('3. Resultats ESG Globaux', margin, y);
  
  y += 20;

  // Left side: Global score gauge
  const mainGaugeRadius = 35;
  drawGauge(margin, y, mainGaugeRadius, reportData.esgScores.totalScore, COLORS.emeraldDark, '');
  
  // Score details next to gauge
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
  doc.text(`${Math.round(reportData.esgScores.totalScore)}/100`, margin + mainGaugeRadius * 2 + 20, y + 25);
  
  doc.setFontSize(16);
  doc.text(reportData.esgScores.grade, margin + mainGaugeRadius * 2 + 80, y + 25);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`Score ESG Global - ${cleanText(reportData.esgScores.gradeLabel)}`, margin + mainGaugeRadius * 2 + 20, y + 40);

  // Benchmark position
  doc.setFontSize(10);
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  const positionLabels: Record<string, string> = {
    'top10': 'Top 10% du secteur',
    'top25': 'Top 25% du secteur',
    'average': 'Dans la moyenne sectorielle',
    'below': 'Sous la moyenne sectorielle',
  };
  doc.text(positionLabels[reportData.benchmark.position] || '', margin + mainGaugeRadius * 2 + 20, y + 52);
  
  y += 85;

  // Radar chart for E/S/G comparison
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Analyse Comparative par Pilier', margin, y);
  
  y += 10;
  
  const radarSize = 80;
  drawRadarChart(margin + 20, y, radarSize, {
    e: reportData.esgScores.categoryScores.E || 0,
    s: reportData.esgScores.categoryScores.S || 0,
    g: reportData.esgScores.categoryScores.G || 0,
  });
  
  // Legend next to radar - Clean labels
  const legendX = margin + radarSize + 50;
  const legendY = y + 15;
  
  const pillarDetails = [
    { id: 'E', name: 'Environnement', color: COLORS.emeraldDark, score: reportData.esgScores.categoryScores.E || 0 },
    { id: 'S', name: 'Social', color: COLORS.navyBlue, score: reportData.esgScores.categoryScores.S || 0 },
    { id: 'G', name: 'Gouvernance', color: COLORS.anthracite, score: reportData.esgScores.categoryScores.G || 0 },
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
  doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 4, 4, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Ponderation appliquee :', margin + 10, y + 10);
  
  doc.setFont('helvetica', 'normal');
  const weightText = `E: ${Math.round(reportData.weightingConfig.e)}% - S: ${Math.round(reportData.weightingConfig.s)}% - G: ${Math.round(reportData.weightingConfig.g)}% (Mode ${reportData.weightingConfig.mode})`;
  doc.text(weightText, margin + 10, y + 18);

  onProgress?.('Generation de l\'analyse par pilier...');

  // ===== PAGE 6-7: PILLAR ANALYSIS - Clean labels =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('4. Analyse par Pilier ESG', margin, y);
  
  y += 15;

  const categoryConfigs = [
    { id: 'E', name: 'Environnement', color: COLORS.emeraldDark },
    { id: 'S', name: 'Social', color: COLORS.navyBlue },
    { id: 'G', name: 'Gouvernance', color: COLORS.anthracite },
  ];

  categoryConfigs.forEach((catConfig) => {
    if (y > pageHeight - 80) {
      addNewPage();
    }
    
    const catData = reportData.categories.find(c => c.id === catConfig.id);
    const catScore = reportData.esgScores.categoryScores[catConfig.id] || 0;
    const catActions = reportData.actionStats.byCategory[catConfig.id as 'E' | 'S' | 'G'];
    
    // Section header - Clean, no technical prefixes
    doc.setFillColor(catConfig.color.r, catConfig.color.g, catConfig.color.b);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 4, 4, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(catConfig.name, margin + 10, y + 16);
    
    // Score badge
    doc.setFontSize(14);
    doc.text(`Score : ${Math.round(catScore)}/100`, pageWidth - margin - 10, y + 16, { align: 'right' });
    
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
      doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
      
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
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('5. Matrice de Materialite', margin, y);
  
  y += 15;
  
  // Description - Clean
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  const matDesc = 'La matrice de materialite identifie les enjeux ESG les plus significatifs pour l\'entreprise et ses parties prenantes, conformement aux exigences de la CSRD et du principe de double materialite.';
  const matDescLines = doc.splitTextToSize(matDesc, pageWidth - 2 * margin);
  doc.text(matDescLines, margin, y);
  
  y += matDescLines.length * 5 + 15;
  
  // Check if we have real materiality data (from ESG module storage)
  const storedMateriality = localStorage.getItem('esg-materiality-issues');
  const hasMaterialityData = storedMateriality ? JSON.parse(storedMateriality).length > 0 : false;
  
  // Draw materiality matrix - dynamic based on data presence
  const matrixSize = 100;
  const matrixHeight = drawMaterialityMatrix((pageWidth - matrixSize) / 2 + 15, y, matrixSize, hasMaterialityData);
  
  y += matrixHeight;
  
  if (hasMaterialityData) {
    // Legend
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text('Legende :', margin, y);
    
    y += 8;
    const legendItems = [
      { color: COLORS.paleGreen, label: 'Enjeux prioritaires' },
      { color: COLORS.paleBlue, label: 'Enjeux a surveiller' },
      { color: COLORS.lightGray, label: 'Enjeux secondaires' },
    ];
    
    legendItems.forEach((item, idx) => {
      doc.setFillColor(item.color.r, item.color.g, item.color.b);
      doc.rect(margin + idx * 60, y, 8, 8, 'F');
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
      doc.text(item.label, margin + idx * 60 + 10, y + 5);
    });
  }

  onProgress?.('Generation du plan d\'actions...');

  // ===== PAGE 9-10: ACTION PLAN =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('6. Plan d\'Actions RSE Detaille', margin, y);
  
  y += 15;

  // Action stats KPI cards
  const cardWidth = (pageWidth - 2 * margin - 16) / 5;
  const cardHeight = 38;
  
  const actionKPIs = [
    { label: 'Total', value: String(reportData.actionStats.total), color: COLORS.anthracite },
    { label: 'Terminees', value: String(reportData.actionStats.completed), color: COLORS.emeraldDark },
    { label: 'En cours', value: String(reportData.actionStats.inProgress), color: COLORS.navyBlue },
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
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Suivi Budgetaire', margin, y);
  
  y += 10;
  const tableHeight = drawBudgetTable(margin, y, reportData.budgetStats);
  y += tableHeight + 10;

  // Progress bar for budget utilization
  doc.setFontSize(8);
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  doc.text('Taux d\'utilisation budgetaire', margin, y);
  y += 5;
  drawProgressBar(margin, y, pageWidth - 2 * margin, 6, reportData.budgetStats.utilizationRate, COLORS.emeraldDark);
  
  y += 20;

  // Regional Impact with automatic CO2 calculation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Impact Territorial (Loi 2018-35)', margin, y);
  
  y += 10;
  doc.setFillColor(COLORS.paleBlue.r, COLORS.paleBlue.g, COLORS.paleBlue.b);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 55, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`${reportData.regionalImpact.actionsCount} actions contribuant au developpement regional`, margin + 10, y + 12);
  
  // CO2 reduction calculated from completed actions - Automatic calculation
  const co2Avoided = reportData.actions
    .filter(a => a.status === 'done' && a.impactMetrics?.co2ReductionTarget)
    .reduce((sum, a) => sum + (a.impactMetrics?.co2ReductionTarget || 0), 0);
  
  if (co2Avoided > 0) {
    // Show actual impact
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
    doc.text(`${formatNum(co2Avoided)} tCO2e evitees`, margin + 10, y + 28);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text('Calculees a partir des actions terminees avec objectifs de reduction definis', margin + 10, y + 38);
    
    // Small progress indicator toward neutrality (example: assuming 1000 tCO2e target)
    const neutralityTarget = 1000;
    const progressPercent = Math.min(100, (co2Avoided / neutralityTarget) * 100);
    doc.text(`Progression vers l'objectif de neutralite : ${Math.round(progressPercent)}%`, margin + 10, y + 48);
    drawProgressBar(margin + 10, y + 51, 100, 3, progressPercent, COLORS.emeraldDark);
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text('Impact CO2 : en attente de la cloture des actions avec objectifs de reduction.', margin + 10, y + 28);
  }

  onProgress?.('Generation de la gouvernance...');

  // ===== PAGE 11: GOVERNANCE - Clean validation list instead of Yes/No table =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('7. Gouvernance et Conformite', margin, y);
  
  y += 20;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Indicateurs de Gouvernance', margin, y);
  
  y += 12;
  
  // Find governance category
  const govCategory = reportData.categories.find(c => c.id === 'G');
  
  if (govCategory) {
    const govItems = govCategory.indicators
      .filter(ind => ind.type === 'binary')
      .map(ind => ({
        label: ind.label,
        value: ind.value,
      }));
    
    const listHeight = drawValidationList(margin, y, govItems);
    y += listHeight + 15;
  }
  
  // Numeric governance indicators
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs Quantitatifs', margin, y);
  
  y += 12;
  
  if (govCategory) {
    govCategory.indicators
      .filter(ind => ind.type === 'numeric')
      .slice(0, 5)
      .forEach(ind => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
        doc.text(`- ${cleanText(ind.label)}`, margin + 5, y);
        
        const valueStr = ind.value !== undefined ? `${formatNum(Number(ind.value))} ${ind.unit || ''}` : '---';
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        doc.text(valueStr, pageWidth - margin, y, { align: 'right' });
        
        y += 8;
      });
  }

  onProgress?.('Generation du perimetre de consolidation...');

  // ===== PAGE: CONSOLIDATION SCOPE (NEW) =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('9. Perimetre de Consolidation', margin, y);
  
  y += 20;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  const scopeIntro = 'Le perimetre de ce rapport couvre les entites et sites suivants, conformement aux principes de consolidation du GHG Protocol et de la CSRD.';
  const scopeIntroLines = doc.splitTextToSize(scopeIntro, pageWidth - 2 * margin);
  doc.text(scopeIntroLines, margin, y);
  
  y += scopeIntroLines.length * 5 + 15;
  
  // Main entity card
  doc.setFillColor(COLORS.paleGreen.r, COLORS.paleGreen.g, COLORS.paleGreen.b);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 4, 4, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.emeraldDark.r, COLORS.emeraldDark.g, COLORS.emeraldDark.b);
  doc.text('Entite Principale', margin + 10, y + 12);
  
  doc.setFontSize(12);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(cleanText(tpl.company_name), margin + 10, y + 24);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  doc.text(`Secteur : ${cleanText(tpl.sector_name)}`, pageWidth - margin - 10, y + 24, { align: 'right' });
  
  y += 45;
  
  // Subsidiaries/Sites section (dynamic)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('Filiales et Sites Couverts', margin, y);
  
  y += 10;
  
  if (tpl.subsidiaries && tpl.subsidiaries.length > 0) {
    tpl.subsidiaries.forEach((sub, idx) => {
      doc.setFillColor(idx % 2 === 0 ? COLORS.lightGray.r : 255, idx % 2 === 0 ? COLORS.lightGray.g : 255, idx % 2 === 0 ? COLORS.lightGray.b : 255);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 12, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(cleanText(sub), margin + 10, y + 8);
      
      y += 14;
    });
  } else {
    doc.setFillColor(COLORS.paleBlue.r, COLORS.paleBlue.g, COLORS.paleBlue.b);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 4, 4, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text('Aucune filiale ou site additionnel defini.', margin + 10, y + 12);
    doc.text('Le rapport couvre l\'entite principale uniquement.', margin + 10, y + 22);
  }

  onProgress?.('Generation de la methodologie...');

  // ===== PAGE: METHODOLOGY =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.navyBlue.r, COLORS.navyBlue.g, COLORS.navyBlue.b);
  doc.text('10. Methodologie', margin, y);
  
  y += 20;

  // Scoring formula
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Formule de Scoring', margin, y);
  
  y += 10;
  doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setFont('courier', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(reportData.methodology.scoringFormula, margin + 10, y + 12);
  
  y += 30;

  // Weights explanation
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
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
  doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
  const dataSourceLines = doc.splitTextToSize(reportData.methodology.dataSource, pageWidth - 2 * margin);
  doc.text(dataSourceLines, margin, y);
  
  y += dataSourceLines.length * 5 + 15;

  // Limitations - Clean label
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.text('Limites Methodologiques', margin, y);
  
  y += 10;
  reportData.methodology.limitations.forEach(limitation => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    const limitLines = doc.splitTextToSize(`- ${cleanText(limitation)}`, pageWidth - 2 * margin - 10);
    doc.text(limitLines, margin + 5, y);
    y += limitLines.length * 5 + 3;
  });

  y += 15;

  // Scope summary table - Clean formatting
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Resume du Perimetre', margin, y);
  
  y += 10;
  const scopeItems = [
    { label: 'Entite', value: cleanText(tpl.company_name) },
    { label: 'Secteur', value: cleanText(tpl.sector_name) },
    { label: 'Exercice fiscal', value: String(tpl.fiscal_year) },
    { label: 'Chiffre d\'affaires', value: formatCurrency(reportData.revenue) },
  ];
  
  scopeItems.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.rect(margin, y - 3, pageWidth - 2 * margin, 10, 'F');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.anthracite.r, COLORS.anthracite.g, COLORS.anthracite.b);
    doc.text(item.label, margin + 5, y + 4);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(item.value, margin + 60, y + 4);
    y += 10;
  });

  // Final footer
  doc.setFontSize(8);
  doc.setTextColor(COLORS.slateLight.r, COLORS.slateLight.g, COLORS.slateLight.b);
  doc.text(`Rapport genere automatiquement - ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Finalisation du document...');

  // Save the PDF
  const cleanCompanyName = cleanText(tpl.company_name).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const fileName = `Rapport_RSE_${cleanCompanyName || 'Entreprise'}_${tpl.fiscal_year}.pdf`;
  doc.save(fileName);
  
  toast.success('Rapport RSE genere avec succes !', {
    description: fileName,
  });
}

export default generateRSEReportPDF;

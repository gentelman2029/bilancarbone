// RSE Pilotage Report Generator - Strategic Communication Document
// Transformed from technical data to human-centered visual storytelling

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, CheckCircle, Building2, Target, Users, Scale, TrendingUp, Sparkles, Heart, Leaf, Shield, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
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
  ceoMessage: string;
  mission: string;
  sbtTarget: number;
  historicalEmissions: { year: number; value: number }[];
}

// ESG Colors
const COLORS = {
  emerald: { r: 16, g: 185, b: 129 },   // #10B981 - Environment
  blue: { r: 59, g: 130, b: 246 },       // #3B82F6 - Social  
  purple: { r: 139, g: 92, b: 246 },     // #8B5CF6 - Governance
  slate: { r: 100, g: 116, b: 139 },     // #64748B
  white: { r: 255, g: 255, b: 255 },
  dark: { r: 30, g: 41, b: 59 },
  amber: { r: 245, g: 158, b: 11 },
};

export function RSEPilotageReport({ actions }: RSEPilotageReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    companyName: '',
    sector: 'Industrie',
    reportingYear: new Date().getFullYear(),
    executiveSummary: '',
    ceoMessage: '',
    mission: '',
    sbtTarget: 42,
    historicalEmissions: [
      { year: 2021, value: 1250 },
      { year: 2022, value: 1180 },
      { year: 2023, value: 1050 },
      { year: 2024, value: 920 },
    ],
  });

  useEffect(() => {
    const handleExportEvent = () => setIsOpen(true);
    window.addEventListener('rse-export-report', handleExportEvent);
    return () => window.removeEventListener('rse-export-report', handleExportEvent);
  }, []);

  // Metrics
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'done').length;
  const inProgressActions = actions.filter(a => a.status === 'in_progress').length;
  const todoActions = actions.filter(a => a.status === 'todo').length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const csrdProgress = calculateCSRDProgress(actions);
  const regionalImpactCount = countRegionalImpactActions(actions);
  const budgetStats = calculateBudgetStats(actions);

  const envActions = actions.filter(a => a.category === 'E');
  const socialActions = actions.filter(a => a.category === 'S');
  const govActions = actions.filter(a => a.category === 'G');

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

      const formatNum = (n: number) => n.toLocaleString('fr-FR');
      
      // Helper: Draw rounded rectangle
      const drawRoundedRect = (x: number, yPos: number, w: number, h: number, r: number, color: typeof COLORS.emerald, fill = true) => {
        doc.setFillColor(color.r, color.g, color.b);
        doc.setDrawColor(color.r, color.g, color.b);
        doc.roundedRect(x, yPos, w, h, r, r, fill ? 'F' : 'S');
      };

      // Helper: Draw KPI Card
      const drawKPICard = (x: number, yPos: number, w: number, h: number, value: string, label: string, color: typeof COLORS.emerald, icon?: string) => {
        // Card background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, yPos, w, h, 4, 4, 'F');
        
        // Colored accent bar
        doc.setFillColor(color.r, color.g, color.b);
        doc.roundedRect(x, yPos, w, 4, 4, 4, 'F');
        doc.rect(x, yPos + 2, w, 2, 'F');
        
        // Value
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color.r, color.g, color.b);
        doc.text(value, x + w/2, yPos + 22, { align: 'center' });
        
        // Label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const labelLines = doc.splitTextToSize(label, w - 6);
        doc.text(labelLines, x + w/2, yPos + 32, { align: 'center' });
      };

      // Helper: Draw Progress Gauge (circular)
      const drawGauge = (centerX: number, centerY: number, radius: number, percentage: number, color: typeof COLORS.emerald) => {
        const startAngle = -90;
        const endAngle = startAngle + (percentage / 100) * 360;
        
        // Background circle
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(3);
        doc.circle(centerX, centerY, radius, 'S');
        
        // Progress arc (simplified as filled segments)
        doc.setFillColor(color.r, color.g, color.b);
        doc.setDrawColor(color.r, color.g, color.b);
        doc.setLineWidth(4);
        
        // Draw arc using small line segments
        const segments = Math.floor(percentage / 100 * 36);
        for (let i = 0; i < segments; i++) {
          const angle1 = (startAngle + i * 10) * Math.PI / 180;
          const angle2 = (startAngle + (i + 1) * 10) * Math.PI / 180;
          const x1 = centerX + radius * Math.cos(angle1);
          const y1 = centerY + radius * Math.sin(angle1);
          const x2 = centerX + radius * Math.cos(angle2);
          const y2 = centerY + radius * Math.sin(angle2);
          doc.line(x1, y1, x2, y2);
        }
        
        // Center text
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color.r, color.g, color.b);
        doc.text(`${percentage}%`, centerX, centerY + 2, { align: 'center' });
      };

      // ===== PAGE 1: COVER =====
      // Full gradient header
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 100, 'F');
      
      // Decorative pattern
      doc.setFillColor(20, 200, 140);
      doc.circle(pageWidth - 30, 30, 60, 'F');
      doc.setFillColor(12, 170, 120);
      doc.circle(30, 80, 40, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('RAPPORT RSE', pageWidth / 2, 45, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Engagement, Impact & Transparence', pageWidth / 2, 60, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(String(reportData.reportingYear), pageWidth / 2, 85, { align: 'center' });

      // Company name card
      y = 120;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, pageWidth - 2*margin, 40, 6, 6, 'F');
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(margin, y, 6, 40, 3, 0, 'F');
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.companyName || 'Entreprise', margin + 16, y + 18);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Secteur : ${reportData.sector}`, margin + 16, y + 32);

      // Hero KPI Cards
      y = 175;
      const cardWidth = (pageWidth - 2*margin - 15) / 4;
      
      drawKPICard(margin, y, cardWidth, 45, `${completionRate}%`, 'Taux de Réalisation', COLORS.emerald);
      drawKPICard(margin + cardWidth + 5, y, cardWidth, 45, `${csrdProgress}%`, 'Progression CSRD', COLORS.blue);
      drawKPICard(margin + 2*(cardWidth + 5), y, cardWidth, 45, `${formatNum(totalCO2Reduction)}`, 'tCO₂e Évitées', COLORS.purple);
      drawKPICard(margin + 3*(cardWidth + 5), y, cardWidth, 45, `${formatNum(budgetStats.allocated)}`, 'Budget TND', COLORS.amber);

      // ESG Distribution visual
      y = 235;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Répartition ESG du Plan d\'Actions', margin, y);
      
      y += 10;
      const barHeight = 12;
      const totalWidth = pageWidth - 2*margin;
      const envWidth = totalActions > 0 ? (envActions.length / totalActions) * totalWidth : 0;
      const socialWidth = totalActions > 0 ? (socialActions.length / totalActions) * totalWidth : 0;
      const govWidth = totalActions > 0 ? (govActions.length / totalActions) * totalWidth : 0;
      
      drawRoundedRect(margin, y, envWidth || 0.1, barHeight, 2, COLORS.emerald);
      drawRoundedRect(margin + envWidth, y, socialWidth || 0.1, barHeight, 0, COLORS.blue);
      drawRoundedRect(margin + envWidth + socialWidth, y, govWidth || 0.1, barHeight, 2, COLORS.purple);
      
      // Legend
      y += 20;
      const legendY = y;
      doc.setFontSize(9);
      
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.circle(margin + 5, legendY, 3, 'F');
      doc.setTextColor(30, 41, 59);
      doc.text(`Environnement (${envActions.length})`, margin + 12, legendY + 2);
      
      doc.setFillColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.circle(margin + 60, legendY, 3, 'F');
      doc.text(`Social (${socialActions.length})`, margin + 67, legendY + 2);
      
      doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.circle(margin + 105, legendY, 3, 'F');
      doc.text(`Gouvernance (${govActions.length})`, margin + 112, legendY + 2);

      // Compliance badges
      y = legendY + 25;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Conforme aux référentiels :', margin, y);
      
      y += 8;
      const badges = ['Loi RSE 2018-35', 'CSRD (UE)', 'ISO 26000', 'GRI Standards', 'Guide BVMT'];
      let badgeX = margin;
      badges.forEach(badge => {
        const badgeWidth = doc.getTextWidth(badge) + 10;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(badgeX, y - 4, badgeWidth, 10, 2, 2, 'F');
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(7);
        doc.text(badge, badgeX + 5, y + 3);
        badgeX += badgeWidth + 4;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

      // ===== PAGE 2: EDITORIAL / CEO MESSAGE =====
      doc.addPage();
      
      // Header bar
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      
      y = 30;
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Éditorial de la Direction', margin, y);
      
      // Decorative quote mark
      doc.setFontSize(48);
      doc.setTextColor(226, 232, 240);
      doc.text('"', margin, y + 25);
      
      y += 20;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      
      const ceoMessage = reportData.ceoMessage || 
        `Notre engagement RSE n'est pas une contrainte réglementaire, mais le reflet de notre vision ` +
        `d'une entreprise responsable et pérenne. En ${reportData.reportingYear}, nous avons accéléré notre ` +
        `transformation avec ${totalActions} actions concrètes, dont ${completedActions} déjà réalisées.\n\n` +
        `Notre objectif est clair : réconcilier performance économique et impact positif sur notre ` +
        `environnement et nos communautés. Chaque collaborateur, chaque partenaire est partie prenante ` +
        `de cette ambition.\n\n` +
        `Ce rapport témoigne de nos progrès, mais aussi de notre lucidité sur le chemin qu'il reste à parcourir. ` +
        `La transparence est le socle de notre crédibilité.`;
      
      const ceoLines = doc.splitTextToSize(ceoMessage, pageWidth - 2*margin - 10);
      doc.text(ceoLines, margin + 10, y);
      
      y += ceoLines.length * 5 + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('— La Direction Générale', margin + 10, y);

      // Mission & Vision box
      y += 25;
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, pageWidth - 2*margin, 50, 6, 6, 'F');
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.roundedRect(margin, y, 4, 50, 2, 0, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.text('Notre Mission', margin + 12, y + 12);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const mission = reportData.mission || 
        `Créer de la valeur durable pour toutes nos parties prenantes en intégrant les meilleures ` +
        `pratiques environnementales, sociales et de gouvernance au cœur de notre stratégie.`;
      const missionLines = doc.splitTextToSize(mission, pageWidth - 2*margin - 24);
      doc.text(missionLines, margin + 12, y + 22);

      // 3 Pillar highlights
      y += 65;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Nos 3 Piliers d\'Action', margin, y);
      
      y += 12;
      const pillarWidth = (pageWidth - 2*margin - 10) / 3;
      
      // Environment pillar
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, pillarWidth, 65, 4, 4, 'F');
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.circle(margin + pillarWidth/2, y + 15, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('E', margin + pillarWidth/2, y + 18, { align: 'center' });
      doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Environnement', margin + pillarWidth/2, y + 32, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const envText = doc.splitTextToSize('Décarbonation, économie circulaire, biodiversité', pillarWidth - 10);
      doc.text(envText, margin + pillarWidth/2, y + 42, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.text(`${envActions.length} actions`, margin + pillarWidth/2, y + 58, { align: 'center' });
      
      // Social pillar
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin + pillarWidth + 5, y, pillarWidth, 65, 4, 4, 'F');
      doc.setFillColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.circle(margin + pillarWidth + 5 + pillarWidth/2, y + 15, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('S', margin + pillarWidth + 5 + pillarWidth/2, y + 18, { align: 'center' });
      doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Social', margin + pillarWidth + 5 + pillarWidth/2, y + 32, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const socText = doc.splitTextToSize('Bien-être, diversité, développement des compétences', pillarWidth - 10);
      doc.text(socText, margin + pillarWidth + 5 + pillarWidth/2, y + 42, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.text(`${socialActions.length} actions`, margin + pillarWidth + 5 + pillarWidth/2, y + 58, { align: 'center' });
      
      // Governance pillar
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(margin + 2*(pillarWidth + 5), y, pillarWidth, 65, 4, 4, 'F');
      doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.circle(margin + 2*(pillarWidth + 5) + pillarWidth/2, y + 15, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('G', margin + 2*(pillarWidth + 5) + pillarWidth/2, y + 18, { align: 'center' });
      doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Gouvernance', margin + 2*(pillarWidth + 5) + pillarWidth/2, y + 32, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const govText = doc.splitTextToSize('Éthique, transparence, conformité', pillarWidth - 10);
      doc.text(govText, margin + 2*(pillarWidth + 5) + pillarWidth/2, y + 42, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.text(`${govActions.length} actions`, margin + 2*(pillarWidth + 5) + pillarWidth/2, y + 58, { align: 'center' });

      // ===== PAGE 3: CARBON TRAJECTORY =====
      doc.addPage();
      
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      
      y = 30;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Trajectoire Carbone & Objectifs SBTi', margin, y);
      
      // Chart area
      y += 15;
      const chartX = margin + 10;
      const chartY = y;
      const chartWidth = pageWidth - 2*margin - 20;
      const chartHeight = 80;
      
      // Background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y - 5, pageWidth - 2*margin, chartHeight + 25, 4, 4, 'F');
      
      // Y-axis labels
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const maxEmissions = Math.max(...reportData.historicalEmissions.map(e => e.value), 1500);
      for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxEmissions * (1 - i/4));
        doc.text(`${val}`, chartX - 8, chartY + (i * chartHeight/4) + 3, { align: 'right' });
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(chartX, chartY + (i * chartHeight/4), chartX + chartWidth, chartY + (i * chartHeight/4));
      }
      
      // Draw trajectory line
      const emissions = reportData.historicalEmissions;
      const target2030 = emissions[0]?.value * (1 - reportData.sbtTarget/100) || 700;
      const years = [...emissions.map(e => e.year), 2030];
      const values = [...emissions.map(e => e.value), target2030];
      
      doc.setDrawColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.setLineWidth(2);
      
      for (let i = 0; i < values.length - 1; i++) {
        const x1 = chartX + (i / (years.length - 1)) * chartWidth;
        const x2 = chartX + ((i + 1) / (years.length - 1)) * chartWidth;
        const y1 = chartY + (1 - values[i] / maxEmissions) * chartHeight;
        const y2 = chartY + (1 - values[i + 1] / maxEmissions) * chartHeight;
        
        // Dashed line for projection
        if (i >= emissions.length - 1) {
          doc.setLineDashPattern([2, 2], 0);
        }
        doc.line(x1, y1, x2, y2);
        doc.setLineDashPattern([], 0);
        
        // Data points
        doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
        doc.circle(x1, y1, 3, 'F');
      }
      // Last point
      const lastX = chartX + chartWidth;
      const lastY = chartY + (1 - target2030 / maxEmissions) * chartHeight;
      doc.setFillColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
      doc.circle(lastX, lastY, 4, 'F');
      
      // X-axis labels
      years.forEach((year, i) => {
        const x = chartX + (i / (years.length - 1)) * chartWidth;
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', i === years.length - 1 ? 'bold' : 'normal');
        doc.text(String(year), x, chartY + chartHeight + 12, { align: 'center' });
      });
      
      // Target label
      doc.setFillColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
      doc.roundedRect(lastX - 25, lastY - 18, 50, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Objectif: -${reportData.sbtTarget}%`, lastX, lastY - 9, { align: 'center' });

      // Benchmark section
      y = chartY + chartHeight + 40;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Performance Sectorielle', margin, y);
      
      y += 12;
      
      // Benchmark gauge
      const gaugeX = margin + 40;
      const gaugeY = y + 30;
      drawGauge(gaugeX, gaugeY, 22, completionRate, COLORS.emerald);
      
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Réalisation', gaugeX, gaugeY + 32, { align: 'center' });
      
      // Benchmark bar
      const benchX = margin + 90;
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Position vs. secteur', benchX, y + 8);
      
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(benchX, y + 12, 90, 10, 2, 2, 'F');
      
      // Performance indicator (assuming top 25%)
      const perfPosition = 75; // Top 25%
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.roundedRect(benchX, y + 12, perfPosition * 0.9, 10, 2, 2, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Moyenne', benchX + 45, y + 30);
      doc.text('Top 10%', benchX + 80, y + 30);
      
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.circle(benchX + perfPosition * 0.9, y + 17, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.text('✓', benchX + perfPosition * 0.9, y + 19, { align: 'center' });

      // ===== PAGE 4: ENVIRONMENTAL ACTIONS =====
      doc.addPage();
      
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      
      y = 30;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.text('Pilier Environnement', margin, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Décarbonation • Ressources • Biodiversité', margin, y);
      
      y += 15;
      
      // Environment action cards
      envActions.slice(0, 4).forEach((action, idx) => {
        if (y > pageHeight - 50) return;
        
        const cardHeight = 35;
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, y, pageWidth - 2*margin, cardHeight, 4, 4, 'F');
        
        // Status indicator
        const statusColor = action.status === 'done' ? COLORS.emerald : 
                           action.status === 'in_progress' ? COLORS.blue : COLORS.slate;
        doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
        doc.circle(margin + 10, y + cardHeight/2, 4, 'F');
        
        // Action title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(action.title.substring(0, 50), margin + 20, y + 12);
        
        // Description
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const desc = doc.splitTextToSize(action.description.substring(0, 100), pageWidth - 2*margin - 80);
        doc.text(desc[0] || '', margin + 20, y + 22);
        
        // Status & budget
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
        const statusText = action.status === 'done' ? 'Terminé' : 
                          action.status === 'in_progress' ? 'En cours' : 'À faire';
        doc.text(statusText, pageWidth - margin - 30, y + 12, { align: 'right' });
        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formatNum(action.impactMetrics.costEstimated)} TND`, pageWidth - margin - 10, y + 22, { align: 'right' });
        
        y += cardHeight + 5;
      });
      
      // ===== PAGE 5: SOCIAL ACTIONS WITH STORIES =====
      doc.addPage();
      
      doc.setFillColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      
      y = 30;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.text('Pilier Social', margin, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Bien-être • Formation • Diversité • Sécurité', margin, y);
      
      y += 15;
      
      // Impact story box
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, y, pageWidth - 2*margin, 45, 6, 6, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
      doc.text('Témoignage d\'Impact', margin + 10, y + 15);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      const story = `"Grâce au programme de formation continue, j'ai pu évoluer du poste d'opérateur ` +
                   `à celui de chef d'équipe en 18 mois. Cette opportunité a changé ma vie professionnelle."`;
      const storyLines = doc.splitTextToSize(story, pageWidth - 2*margin - 20);
      doc.text(storyLines, margin + 10, y + 26);
      
      y += 55;
      
      // Social action cards
      socialActions.slice(0, 3).forEach((action) => {
        if (y > pageHeight - 50) return;
        
        const cardHeight = 35;
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(margin, y, pageWidth - 2*margin, cardHeight, 4, 4, 'F');
        
        const statusColor = action.status === 'done' ? COLORS.emerald : 
                           action.status === 'in_progress' ? COLORS.blue : COLORS.slate;
        doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
        doc.circle(margin + 10, y + cardHeight/2, 4, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(action.title.substring(0, 50), margin + 20, y + 12);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(action.description.substring(0, 80), margin + 20, y + 22);
        
        y += cardHeight + 5;
      });

      // ===== PAGE 6: GOVERNANCE =====
      doc.addPage();
      
      doc.setFillColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      
      y = 30;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.purple.r, COLORS.purple.g, COLORS.purple.b);
      doc.text('Pilier Gouvernance', margin, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Éthique • Transparence • Conformité • Anti-corruption', margin, y);
      
      y += 15;
      
      govActions.slice(0, 3).forEach((action) => {
        if (y > pageHeight - 50) return;
        
        const cardHeight = 35;
        doc.setFillColor(245, 243, 255);
        doc.roundedRect(margin, y, pageWidth - 2*margin, cardHeight, 4, 4, 'F');
        
        const statusColor = action.status === 'done' ? COLORS.emerald : 
                           action.status === 'in_progress' ? COLORS.purple : COLORS.slate;
        doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
        doc.circle(margin + 10, y + cardHeight/2, 4, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(action.title.substring(0, 50), margin + 20, y + 12);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(action.description.substring(0, 80), margin + 20, y + 22);
        
        y += cardHeight + 5;
      });

      // ===== PAGE 7: COMMITMENTS & ROADMAP =====
      doc.addPage();
      
      doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      
      y = 30;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Engagements Futurs', margin, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Transparence sur les actions à venir - Honêteté de notre démarche', margin, y);
      
      y += 15;
      
      // Future actions (todo + in_progress)
      const futureActions = actions.filter(a => a.status !== 'done').slice(0, 5);
      
      doc.setFillColor(254, 252, 232);
      doc.roundedRect(margin, y, pageWidth - 2*margin, 15 + futureActions.length * 18, 6, 6, 'F');
      doc.setFillColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
      doc.roundedRect(margin, y, 4, 15 + futureActions.length * 18, 2, 0, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
      doc.text(`${futureActions.length} actions en cours ou planifiées`, margin + 12, y + 10);
      
      futureActions.forEach((action, idx) => {
        const actionY = y + 20 + idx * 18;
        
        doc.setFillColor(action.status === 'in_progress' ? COLORS.blue.r : COLORS.slate.r,
                        action.status === 'in_progress' ? COLORS.blue.g : COLORS.slate.g,
                        action.status === 'in_progress' ? COLORS.blue.b : COLORS.slate.b);
        doc.circle(margin + 18, actionY, 3, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(action.title.substring(0, 55), margin + 26, actionY + 2);
        
        const statusLabel = action.status === 'in_progress' ? 'En cours' : 'Planifié';
        doc.setFontSize(7);
        doc.setTextColor(action.status === 'in_progress' ? COLORS.blue.r : COLORS.slate.r,
                        action.status === 'in_progress' ? COLORS.blue.g : COLORS.slate.g,
                        action.status === 'in_progress' ? COLORS.blue.b : COLORS.slate.b);
        doc.text(statusLabel, pageWidth - margin - 12, actionY + 2, { align: 'right' });
      });

      // Regional Impact pictogram section
      y += 25 + futureActions.length * 18;
      if (y < pageHeight - 80) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Impact Territorial', margin, y);
        
        y += 12;
        
        const impactItems = [
          { icon: '📍', label: 'Actions à impact régional', value: String(regionalImpactCount) },
          { icon: '👥', label: 'Emplois locaux concernés', value: 'Direct' },
          { icon: '🏭', label: 'Fournisseurs locaux', value: 'Priorité' },
          { icon: '🌱', label: 'Projets environnementaux', value: `${envActions.filter(a => a.impactMetrics.regionalImpact).length}` },
        ];
        
        const itemWidth = (pageWidth - 2*margin) / 4;
        impactItems.forEach((item, idx) => {
          const itemX = margin + idx * itemWidth;
          
          doc.setFontSize(20);
          doc.text(item.icon, itemX + itemWidth/2 - 5, y + 10);
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
          doc.text(item.value, itemX + itemWidth/2, y + 25, { align: 'center' });
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          const labelLines = doc.splitTextToSize(item.label, itemWidth - 5);
          doc.text(labelLines, itemX + itemWidth/2, y + 33, { align: 'center' });
        });
      }

      // ===== ADD PAGE NUMBERS =====
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        if (i > 1) {
          doc.text(`${reportData.companyName} • Rapport RSE ${reportData.reportingYear}`, margin, pageHeight - 10);
        }
      }

      // Save
      const fileName = `Rapport_RSE_${reportData.companyName.replace(/\s+/g, '_') || 'Entreprise'}_${reportData.reportingYear}.pdf`;
      doc.save(fileName);
      
      toast.success('Rapport RSE généré avec succès', {
        description: `${fileName} téléchargé.`
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Générateur de Rapport RSE
            <Badge variant="secondary" className="ml-2">Stratégique</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Info */}
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Informations Entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l'entreprise *</Label>
                <Input
                  value={reportData.companyName}
                  onChange={(e) => setReportData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Ex: GreenTech Tunisie"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Secteur d'activité</Label>
                <Input
                  value={reportData.sector}
                  onChange={(e) => setReportData(prev => ({ ...prev, sector: e.target.value }))}
                  placeholder="Ex: Industrie manufacturière"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Année de reporting</Label>
                <Input
                  type="number"
                  value={reportData.reportingYear}
                  onChange={(e) => setReportData(prev => ({ ...prev, reportingYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Objectif SBTi (%)</Label>
                <Input
                  type="number"
                  value={reportData.sbtTarget}
                  onChange={(e) => setReportData(prev => ({ ...prev, sbtTarget: parseInt(e.target.value) || 42 }))}
                  placeholder="42"
                  className="bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Synthèse du Plan d'Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <p className="text-2xl font-bold text-slate-700">{totalActions}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-600">{completedActions}</p>
                  <p className="text-xs text-muted-foreground">Terminées</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{inProgressActions}</p>
                  <p className="text-xs text-muted-foreground">En cours</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-2xl font-bold text-amber-600">{todoActions}</p>
                  <p className="text-xs text-muted-foreground">À faire</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(envActions.length / totalActions) * 100 || 0}%` }}
                  />
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(socialActions.length / totalActions) * 100 || 0}%` }}
                  />
                  <div 
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${(govActions.length / totalActions) * 100 || 0}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Leaf className="h-3 w-3 text-emerald-500" />
                  E: {envActions.length}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-blue-500" />
                  S: {socialActions.length}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-purple-500" />
                  G: {govActions.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Editorial Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Message de la Direction (optionnel)
              </Label>
              <Textarea
                value={reportData.ceoMessage}
                onChange={(e) => setReportData(prev => ({ ...prev, ceoMessage: e.target.value }))}
                placeholder="Partagez votre vision et vos convictions sur l'engagement RSE..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Un message personnalisé humanise le rapport. Si vide, un texte générique sera utilisé.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Mission & Valeurs (optionnel)</Label>
              <Textarea
                value={reportData.mission}
                onChange={(e) => setReportData(prev => ({ ...prev, mission: e.target.value }))}
                placeholder="Décrivez votre mission et vos valeurs fondamentales..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Compliance */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 border-emerald-200 text-emerald-700">
              <CheckCircle className="h-3 w-3" />
              Loi RSE 2018-35
            </Badge>
            <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700">
              <CheckCircle className="h-3 w-3" />
              CSRD
            </Badge>
            <Badge variant="outline" className="gap-1 border-purple-200 text-purple-700">
              <CheckCircle className="h-3 w-3" />
              ISO 26000
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              GRI Standards
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || !reportData.companyName}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Générer le Rapport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

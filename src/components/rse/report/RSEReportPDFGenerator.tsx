// RSE Report PDF Generator - Full Regulatory Compliant Document
// Uses jsPDF for vector-based PDF generation

import { useState } from 'react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { RSEReportData } from '@/hooks/useRSEReport';

interface PDFGeneratorProps {
  reportData: RSEReportData;
  onStart?: () => void;
  onComplete?: () => void;
}

// Color palette
const COLORS = {
  emerald: { r: 16, g: 185, b: 129 },
  blue: { r: 59, g: 130, b: 246 },
  purple: { r: 139, g: 92, b: 246 },
  slate: { r: 100, g: 116, b: 139 },
  dark: { r: 30, g: 41, b: 59 },
  amber: { r: 245, g: 158, b: 11 },
  red: { r: 239, g: 68, b: 68 },
  white: { r: 255, g: 255, b: 255 },
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

  // Helper functions
  const drawRoundedRect = (x: number, yPos: number, w: number, h: number, r: number, color: typeof COLORS.emerald, fill = true) => {
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yPos, w, h, r, r, fill ? 'F' : 'S');
  };

  const addNewPage = () => {
    doc.addPage();
    y = margin;
    // Header bar
    doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.rect(0, 0, pageWidth, 8, 'F');
    y = 20;
  };

  const drawKPICard = (x: number, yPos: number, w: number, h: number, value: string, label: string, color: typeof COLORS.emerald) => {
    doc.setFillColor(248, 250, 252);
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
    doc.setTextColor(100, 116, 139);
    const labelLines = doc.splitTextToSize(label, w - 6);
    doc.text(labelLines, x + w/2, yPos + 30, { align: 'center' });
  };

  const drawProgressBar = (x: number, yPos: number, w: number, h: number, percentage: number, color: typeof COLORS.emerald) => {
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, yPos, w, h, 2, 2, 'F');
    const progressWidth = (percentage / 100) * w;
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, yPos, progressWidth, h, 2, 2, 'F');
  };

  onProgress?.('Génération de la page de couverture...');

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
  doc.text('Responsabilité Sociétale de l\'Entreprise', pageWidth / 2, 55, { align: 'center' });
  
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

  // Key metrics cards
  y = 165;
  const cardWidth = (pageWidth - 2*margin - 15) / 4;
  
  drawKPICard(margin, y, cardWidth, 42, `${reportData.esgScores.totalScore.toFixed(0)}`, 'Score ESG Global', COLORS.emerald);
  drawKPICard(margin + cardWidth + 5, y, cardWidth, 42, `${reportData.actionStats.completionRate}%`, 'Taux de Réalisation', COLORS.blue);
  drawKPICard(margin + 2*(cardWidth + 5), y, cardWidth, 42, `${reportData.csrdProgress}%`, 'Progression CSRD', COLORS.purple);
  drawKPICard(margin + 3*(cardWidth + 5), y, cardWidth, 42, `${reportData.regionalImpact.percentage}%`, 'Impact Territorial', COLORS.amber);

  // Source attribution
  y = 225;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 25, 4, 4, 'F');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.setFont('helvetica', 'bold');
  const sourceText = 'Ce rapport RSE est généré à partir du module de Scoring ESG et du module de Pilotage RSE de la plateforme GreenInsight.';
  const sourceLines = doc.splitTextToSize(sourceText, pageWidth - 2*margin - 12);
  doc.text(sourceLines, pageWidth / 2, y + 10, { align: 'center' });

  // Regulatory compliance badges
  y = 260;
  doc.setFontSize(9);
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  doc.text('Conforme aux référentiels :', margin, y);
  
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
  doc.text(`Généré le ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Génération de la table des matières...');

  // ===== PAGE 2: TABLE OF CONTENTS =====
  addNewPage();
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Sommaire', margin, y);
  
  y += 20;
  const tocItems = [
    { num: '1', title: 'Introduction & Contexte Réglementaire', page: '3' },
    { num: '2', title: 'Résultats ESG Globaux', page: '4' },
    { num: '3', title: 'Analyse par Pilier ESG', page: '5' },
    { num: '4', title: 'Plan d\'Actions RSE Détaillé', page: '7' },
    { num: '5', title: 'Gouvernance & Conformité', page: '9' },
    { num: '6', title: 'Indicateurs Clés ESG', page: '10' },
    { num: '7', title: 'Perspectives & Feuille de Route', page: '11' },
    { num: '8', title: 'Méthodologie', page: '12' },
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

  onProgress?.('Génération du contexte réglementaire...');

  // ===== PAGE 3: REGULATORY CONTEXT =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('1. Introduction & Contexte Réglementaire', margin, y);
  
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const introText = `Ce rapport RSE de ${reportData.companyName} présente une synthèse complète de la performance extra-financière de l'entreprise pour l'exercice ${reportData.fiscalYear}. Il agrège les données issues du module de Scoring ESG (mesure, benchmark, méthodologie) et du module de Pilotage RSE (actions, budgets, statuts, impacts).`;
  const introTextLines = doc.splitTextToSize(introText, pageWidth - 2*margin);
  doc.text(introTextLines, margin, y);
  
  y += introTextLines.length * 5 + 15;

  // Tunisian regulations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('🇹🇳 Réglementation Tunisienne', margin, y);
  
  y += 10;
  reportData.regulatoryFramework.tunisian.forEach(reg => {
    doc.setFillColor(248, 250, 252);
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
  doc.text('🌍 Référentiels Internationaux', margin, y);
  
  y += 10;
  reportData.regulatoryFramework.international.forEach(reg => {
    doc.setFillColor(248, 250, 252);
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

  onProgress?.('Génération des résultats ESG...');

  // ===== PAGE 4: ESG RESULTS =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('2. Résultats ESG Globaux', margin, y);
  
  y += 20;

  // Global score card
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 50, 6, 6, 'F');
  
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.text(`${reportData.esgScores.totalScore.toFixed(0)}/100`, margin + 30, y + 30);
  
  doc.setFontSize(24);
  doc.text(reportData.esgScores.grade, margin + 90, y + 30);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`Score ESG Global • ${reportData.esgScores.gradeLabel}`, margin + 30, y + 42);

  // Benchmark position
  doc.setFontSize(10);
  doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
  const positionLabels: Record<string, string> = {
    'top10': 'Top 10% du secteur',
    'top25': 'Top 25% du secteur',
    'average': 'Dans la moyenne sectorielle',
    'below': 'Sous la moyenne sectorielle',
  };
  doc.text(positionLabels[reportData.benchmark.position], pageWidth - margin - 5, y + 30, { align: 'right' });
  
  y += 65;

  // Category scores
  const categoryWidth = (pageWidth - 2*margin - 20) / 3;
  const categories = [
    { id: 'E', name: 'Environnement', color: COLORS.emerald, score: reportData.esgScores.categoryScores.E || 0 },
    { id: 'S', name: 'Social', color: COLORS.blue, score: reportData.esgScores.categoryScores.S || 0 },
    { id: 'G', name: 'Gouvernance', color: COLORS.purple, score: reportData.esgScores.categoryScores.G || 0 },
  ];
  
  categories.forEach((cat, idx) => {
    const x = margin + idx * (categoryWidth + 10);
    
    // Category box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, categoryWidth, 60, 4, 4, 'F');
    
    // Colored header
    doc.setFillColor(cat.color.r, cat.color.g, cat.color.b);
    doc.roundedRect(x, y, categoryWidth, 6, 4, 4, 'F');
    doc.rect(x, y + 4, categoryWidth, 2, 'F');
    
    // Score
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cat.color.r, cat.color.g, cat.color.b);
    doc.text(`${cat.score.toFixed(0)}`, x + categoryWidth/2, y + 28, { align: 'center' });
    
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(cat.name, x + categoryWidth/2, y + 42, { align: 'center' });
    
    // Progress bar
    drawProgressBar(x + 10, y + 50, categoryWidth - 20, 4, cat.score, cat.color);
  });

  y += 80;

  // Weighting info
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 25, 4, 4, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Pondération appliquée :', margin + 10, y + 10);
  
  doc.setFont('helvetica', 'normal');
  const weightText = `E: ${reportData.weightingConfig.e.toFixed(0)}% • S: ${reportData.weightingConfig.s.toFixed(0)}% • G: ${reportData.weightingConfig.g.toFixed(0)}% (Mode ${reportData.weightingConfig.mode})`;
  doc.text(weightText, margin + 10, y + 18);

  onProgress?.('Génération de l\'analyse par pilier...');

  // ===== PAGE 5-6: PILLAR ANALYSIS =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('3. Analyse par Pilier ESG', margin, y);
  
  y += 15;

  // For each category
  const categoryConfigs = [
    { id: 'E', name: 'Environnement', color: COLORS.emerald, icon: '🌱' },
    { id: 'S', name: 'Social', color: COLORS.blue, icon: '👥' },
    { id: 'G', name: 'Gouvernance', color: COLORS.purple, icon: '⚖️' },
  ];

  categoryConfigs.forEach((catConfig, idx) => {
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
    
    doc.setFontSize(16);
    doc.text(`${catScore.toFixed(0)}/100`, pageWidth - margin - 10, y + 16, { align: 'right' });
    
    y += 35;
    
    // Key indicators (first 5)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text('Indicateurs clés :', margin, y);
    
    y += 8;
    catData?.indicators.slice(0, 5).forEach(ind => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
      doc.text(`• ${ind.label}`, margin + 5, y);
      
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
    doc.text('Actions associées :', margin, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const actionsText = `${catActions.completed}/${catActions.count} actions terminées (${catActions.count > 0 ? Math.round((catActions.completed / catActions.count) * 100) : 0}%)`;
    doc.text(actionsText, margin + 5, y);
    
    drawProgressBar(margin + 80, y - 3, 60, 4, catActions.count > 0 ? (catActions.completed / catActions.count) * 100 : 0, catConfig.color);
    
    y += 20;
  });

  onProgress?.('Génération du plan d\'actions...');

  // ===== PAGE 7-8: ACTION PLAN =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('4. Plan d\'Actions RSE Détaillé', margin, y);
  
  y += 15;

  // Action stats cards
  const actionCardWidth = (pageWidth - 2*margin - 20) / 5;
  const actionStats = [
    { label: 'Total', value: reportData.actionStats.total, color: COLORS.slate },
    { label: 'Terminées', value: reportData.actionStats.completed, color: COLORS.emerald },
    { label: 'En cours', value: reportData.actionStats.inProgress, color: COLORS.blue },
    { label: 'À faire', value: reportData.actionStats.todo, color: COLORS.slate },
    { label: 'Bloquées', value: reportData.actionStats.blocked, color: COLORS.red },
  ];
  
  actionStats.forEach((stat, idx) => {
    const x = margin + idx * (actionCardWidth + 5);
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, actionCardWidth, 30, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color.r, stat.color.g, stat.color.b);
    doc.text(String(stat.value), x + actionCardWidth/2, y + 14, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(stat.label, x + actionCardWidth/2, y + 24, { align: 'center' });
  });
  
  y += 45;

  // Budget section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Suivi Budgétaire', margin, y);
  
  y += 10;
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 40, 4, 4, 'F');
  
  const budgetItems = [
    { label: 'Budget Alloué', value: `${formatNum(reportData.budgetStats.allocated)} TND` },
    { label: 'Budget Consommé', value: `${formatNum(reportData.budgetStats.spent)} TND` },
    { label: 'Budget Restant', value: `${formatNum(reportData.budgetStats.remaining)} TND` },
    { label: 'Taux d\'Utilisation', value: `${reportData.budgetStats.utilizationRate}%` },
  ];
  
  const budgetItemWidth = (pageWidth - 2*margin - 30) / 4;
  budgetItems.forEach((item, idx) => {
    const x = margin + 10 + idx * budgetItemWidth;
    
    doc.setFontSize(8);
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    doc.text(item.label, x, y + 12);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.text(item.value, x, y + 24);
  });
  
  // Progress bar
  drawProgressBar(margin + 10, y + 32, pageWidth - 2*margin - 20, 4, reportData.budgetStats.utilizationRate, COLORS.emerald);
  
  y += 55;

  // Regional Impact
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.amber.r, COLORS.amber.g, COLORS.amber.b);
  doc.text('🗺️ Impact Territorial (Loi 2018-35)', margin, y);
  
  y += 10;
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageWidth - 2*margin, 30, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`${reportData.regionalImpact.actionsCount} actions contribuant au développement régional`, margin + 10, y + 12);
  doc.text(`${formatNum(reportData.regionalImpact.co2Reduction)} tCO₂e évitées grâce aux actions terminées`, margin + 10, y + 22);

  onProgress?.('Génération de la méthodologie...');

  // ===== PAGE: METHODOLOGY =====
  addNewPage();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('8. Méthodologie', margin, y);
  
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
  doc.text('Source des Données', margin, y);
  
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
  doc.text('⚠️ Limites Méthodologiques', margin, y);
  
  y += 10;
  reportData.methodology.limitations.forEach(limitation => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.slate.r, COLORS.slate.g, COLORS.slate.b);
    const limitLines = doc.splitTextToSize(`• ${limitation}`, pageWidth - 2*margin - 10);
    doc.text(limitLines, margin + 5, y);
    y += limitLines.length * 5 + 3;
  });

  y += 15;

  // Scope
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text('Périmètre du Rapport', margin, y);
  
  y += 10;
  const scopeItems = [
    { label: 'Entité', value: reportData.companyName },
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
  doc.text(`Rapport généré automatiquement par GreenInsight • ${formatDate(reportData.reportGeneratedAt)}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  onProgress?.('Finalisation du document...');

  // Save the PDF
  const fileName = `Rapport_RSE_${reportData.companyName.replace(/\s+/g, '_')}_${reportData.fiscalYear}.pdf`;
  doc.save(fileName);
  
  toast.success('Rapport RSE généré avec succès !', {
    description: fileName,
  });
}

export default generateRSEReportPDF;

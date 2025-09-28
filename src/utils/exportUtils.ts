import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';
import { CBAMComplianceReport } from '@/services/cbamRegulatoryEngine';

interface Action {
  id: string;
  title: string;
  description: string;
  impact: number;
  status: 'todo' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  deadline: string;
  scope: string;
  cost: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  responsible?: string;
}

export const exportActionsToPDF = (actions: Action[], companyName = "Mon Entreprise") => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Plan d\'Actions Carbone', 20, 30);
  
  // Company name
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(companyName, 20, 40);
  
  // Date
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 50);
  
  // Summary
  const totalImpact = actions.reduce((sum, action) => sum + action.impact, 0);
  const completedImpact = actions.filter(a => a.status === 'completed').reduce((sum, action) => sum + action.impact, 0);
  const totalCost = actions.reduce((sum, action) => sum + action.cost, 0);
  
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Résumé du Plan', 20, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`Nombre d'actions: ${actions.length}`, 20, 85);
  doc.text(`Impact total: ${totalImpact.toFixed(1)} tCO2e`, 20, 95);
  doc.text(`Impact réalisé: ${completedImpact.toFixed(1)} tCO2e`, 20, 105);
  doc.text(`Investissement total: ${(totalCost / 1000).toFixed(0)}k€`, 20, 115);
  
  // Actions table
  const tableData = actions.map(action => [
    action.title,
    getStatusLabel(action.status),
    action.scope,
    `${action.impact.toFixed(1)} tCO2e`,
    `${(action.cost / 1000).toFixed(0)}k€`,
    action.deadline,
    getPriorityLabel(action.priority),
    action.responsible || '-'
  ]);
  
  autoTable(doc, {
    head: [['Action', 'Statut', 'Scope', 'Impact', 'Coût', 'Échéance', 'Priorité', 'Responsable']],
    body: tableData,
    startY: 130,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  });
  
  doc.save(`plan-actions-carbone-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportActionsToExcel = (actions: Action[], companyName = "Mon Entreprise") => {
  // Create CSV content
  const headers = [
    'Titre',
    'Description', 
    'Statut',
    'Scope',
    'Impact (tCO2e)',
    'Coût (€)',
    'Échéance',
    'Priorité',
    'Responsable',
    'Progression (%)',
    'Catégorie'
  ];
  
  const csvContent = [
    headers.join(';'),
    ...actions.map(action => [
      `"${action.title}"`,
      `"${action.description}"`,
      getStatusLabel(action.status),
      action.scope,
      action.impact.toFixed(2),
      action.cost,
      action.deadline,
      getPriorityLabel(action.priority),
      action.responsible || '',
      action.progress,
      action.category
    ].join(';'))
  ].join('\n');
  
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `plan-actions-carbone-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportComplianceReportToPDF = (report: any) => {
  const doc = new jsPDF();
  
  // Configuration PDF
  const primaryColor: [number, number, number] = [34, 197, 94]; // green-500
  const secondaryColor: [number, number, number] = [59, 130, 246]; // blue-500
  
  // En-tête principal
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Rapport de Conformité CBAM', 20, 30);
  
  // Sous-titre règlementaire
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Conforme au règlement UE 2023/956 et GHG Protocol', 20, 40);
  
  // Date et métadonnées
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 50);
  
  // Résumé exécutif
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Résumé Exécutif', 20, 75);
  
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Émissions totales: ${report.summary.total_emissions.toFixed(3)} tCO₂e`, 20, 90);
  doc.text(`Intensité carbone: ${report.summary.emissions_intensity.toFixed(4)} tCO₂e/tonne`, 20, 98);
  doc.text(`Score de conformité: ${report.summary.compliance_score}/100`, 20, 106);
  doc.text(`Niveau de risque: ${report.summary.regulatory_risk_level.toUpperCase()}`, 20, 114);
  
  // Tableau détaillé des émissions
  const emissionsTableData = [
    [
      'Scope 1 - Direct',
      `${report.detailed_calculations.scope1_direct.total.toFixed(3)} tCO₂e`,
      `± ${report.detailed_calculations.scope1_direct.uncertainty_expanded.toFixed(3)}`,
      'Méthode directe'
    ],
    [
      'Scope 2 - Indirect',
      `${report.detailed_calculations.scope2_indirect.total.toFixed(3)} tCO₂e`,
      `± ${report.detailed_calculations.scope2_indirect.uncertainty_expanded.toFixed(3)}`,
      'Facteur réseau'
    ],
    [
      'Scope 3 - Précurseurs',
      `${report.detailed_calculations.scope3_precursors.total.toFixed(3)} tCO₂e`,
      `± ${report.detailed_calculations.scope3_precursors.uncertainty_expanded.toFixed(3)}`,
      'Précurseurs CBAM'
    ]
  ];
  
  autoTable(doc, {
    head: [['Scope', 'Émissions', 'Incertitude (U)', 'Méthode']],
    body: emissionsTableData,
    startY: 130,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  // Nouvelle page pour les recommandations
  doc.addPage();
  
  // Recommandations
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Recommandations Prioritaires', 20, 30);
  
  const recommendationsData = report.recommendations.slice(0, 5).map((rec: any, index: number) => [
    `${index + 1}`,
    rec.description.substring(0, 60) + '...',
    rec.priority.toUpperCase(),
    rec.timeline,
    `${rec.implementation_cost}€`
  ]);
  
  autoTable(doc, {
    head: [['#', 'Recommandation', 'Priorité', 'Délai', 'Coût']],
    body: recommendationsData,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [168, 85, 247] as [number, number, number], // purple-500
      textColor: 255
    },
    columnStyles: {
      1: { cellWidth: 80 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' }
    }
  });
  
  // Pied de page règlementaire
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'Rapport conforme EU 2023/956 - Mécanisme d\'ajustement carbone aux frontières (CBAM)',
      20,
      doc.internal.pageSize.height - 15
    );
    doc.text(
      `Page ${i}/${pageCount} - Généré avec CarbonTrack`,
      doc.internal.pageSize.width - 70,
      doc.internal.pageSize.height - 15
    );
  }
  
  doc.save(`rapport-conformite-cbam-${new Date().toISOString().split('T')[0]}.pdf`);
  
  // Toast de confirmation
  toast({
    title: "Export réussi",
    description: "Le rapport de conformité CBAM a été généré avec succès."
  });
};

const getStatusLabel = (status: string): string => {
  const labels = {
    'todo': 'À faire',
    'in-progress': 'En cours',
    'completed': 'Terminée',
    'delayed': 'En retard'
  };
  return labels[status as keyof typeof labels] || status;
};

const getPriorityLabel = (priority: string): string => {
  const labels = {
    'low': 'Faible',
    'medium': 'Moyenne',
    'high': 'Haute'
  };
  return labels[priority as keyof typeof labels] || priority;
};
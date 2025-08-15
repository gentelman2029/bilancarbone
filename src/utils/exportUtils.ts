import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  
  (doc as any).autoTable({
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
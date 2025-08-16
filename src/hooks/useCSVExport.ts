import { useCarbonReports } from './useCarbonReports';
import { useEmissions } from '@/contexts/EmissionsContext';
import { useActions } from '@/contexts/ActionsContext';

export const useCSVExport = () => {
  const { reports } = useCarbonReports();
  const { emissions } = useEmissions();
  const { actions, getTotalImpact, getCompletedImpact, getTotalCost, getActionsProgress } = useActions();

  const exportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      console.warn('Aucune donnée à exporter');
      return;
    }

    // Conversion des données en CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Échapper les valeurs qui contiennent des virgules ou des guillemets
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Création et téléchargement du fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportCurrentData = () => {
    const exportData = [
      {
        'Date Export': new Date().toLocaleDateString('fr-FR'),
        'Émissions Scope 1 (tCO₂e)': (emissions.scope1 / 1000).toFixed(2),
        'Émissions Scope 2 (tCO₂e)': (emissions.scope2 / 1000).toFixed(2),
        'Émissions Scope 3 (tCO₂e)': (emissions.scope3 / 1000).toFixed(2),
        'Total Émissions (tCO₂e)': (emissions.total / 1000).toFixed(2),
        'Intensité Carbone': '1.2',
        'Émissions par Employé': '8.4',
        'Dernière Mise à Jour': emissions.lastUpdated || new Date().toISOString()
      }
    ];

    exportCSV(exportData, `emissions_carbone_${new Date().toISOString().split('T')[0]}`);
  };

  const exportReports = () => {
    if (reports.length === 0) {
      console.warn('Aucun rapport à exporter');
      return;
    }

    const exportData = reports.map(report => ({
      'ID Rapport': report.report_id,
      'Nom du Rapport': report.report_name,
      'Période': report.period,
      'Date Création': new Date(report.created_at).toLocaleDateString('fr-FR'),
      'Scope 1 (tCO₂e)': report.scope1_total.toFixed(2),
      'Scope 2 (tCO₂e)': report.scope2_total.toFixed(2),
      'Scope 3 (tCO₂e)': report.scope3_total.toFixed(2),
      'Total (tCO₂e)': report.total_co2e.toFixed(2),
      'Intensité Carbone': report.carbon_intensity || 'N/A'
    }));

    exportCSV(exportData, `rapports_carbone_${new Date().toISOString().split('T')[0]}`);
  };

  const exportSiteData = (siteData: any[]) => {
    const exportData = siteData.map(site => ({
      'Nom du Site': site.name,
      'Émissions (tCO₂e)': (site.emissions / 1000).toFixed(2),
      'Pourcentage du Total': site.percentage.toFixed(1) + '%',
      'Nombre d\'Employés': site.employees,
      'Émissions par Employé': ((site.emissions / 1000) / site.employees).toFixed(2)
    }));

    exportCSV(exportData, `emissions_par_site_${new Date().toISOString().split('T')[0]}`);
  };

  const exportCategoryData = (categoryData: any[]) => {
    const exportData = categoryData.map(category => ({
      'Catégorie': category.category,
      'Scope 1 (tCO₂e)': category.scope1.toFixed(2),
      'Scope 2 (tCO₂e)': category.scope2.toFixed(2),
      'Scope 3 (tCO₂e)': category.scope3.toFixed(2),
      'Total Catégorie (tCO₂e)': (category.scope1 + category.scope2 + category.scope3).toFixed(2)
    }));

    exportCSV(exportData, `emissions_par_categorie_${new Date().toISOString().split('T')[0]}`);
  };

  const exportActionsData = () => {
    if (actions.length === 0) {
      console.warn('Aucune action à exporter');
      return;
    }

    const exportData = actions.map(action => ({
      'ID Action': action.id,
      'Titre': action.title,
      'Description': action.description || 'N/A',
      'Statut': action.status,
      'Priorité': action.priority,
      'Impact CO₂ (tCO₂e)': action.impact?.toFixed(2) || '0',
      'Coût (€)': action.cost?.toFixed(2) || '0',
      'Échéance': action.deadline ? new Date(action.deadline).toLocaleDateString('fr-FR') : 'N/A',
      'Responsable': action.responsible || 'N/A',
      'Scope': action.scope || 'N/A',
      'Catégorie': action.category || 'N/A'
    }));

    exportCSV(exportData, `actions_carbone_${new Date().toISOString().split('T')[0]}`);
  };

  const exportCompleteData = (dashboardData?: any) => {
    // Données principales du dashboard
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentDateTime = new Date().toISOString();
    
    const completeExportData = [];

    // Section 1: Résumé Exécutif
    completeExportData.push({
      'Section': 'RÉSUMÉ EXÉCUTIF',
      'Type': 'Émissions Totales',
      'Valeur': (emissions.total / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Détail': `Scope 1: ${(emissions.scope1 / 1000).toFixed(2)} | Scope 2: ${(emissions.scope2 / 1000).toFixed(2)} | Scope 3: ${(emissions.scope3 / 1000).toFixed(2)}`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    // Calculs dynamiques depuis les données réelles
    const nombrePersonnels = emissions.nombrePersonnels || 50;
    const chiffreAffaires = emissions.chiffreAffaires || 1000;
    const emissionsAnneePrecedente = emissions.emissionsAnneePrecedente || 0;
    const currentEmissions = emissions.total / 1000;
    
    const intensiteCarbone = chiffreAffaires > 0 ? currentEmissions / chiffreAffaires : 0;
    const emissionsEmploye = nombrePersonnels > 0 ? currentEmissions / nombrePersonnels : 0;
    const reductionAnnuelle = emissionsAnneePrecedente > 0 ? 
      ((emissionsAnneePrecedente - currentEmissions) / emissionsAnneePrecedente) * 100 : 0;

    completeExportData.push({
      'Section': 'INDICATEURS CLÉS',
      'Type': 'Intensité Carbone',
      'Valeur': intensiteCarbone.toFixed(2),
      'Unité': 'tCO₂e/k€',
      'Détail': `Basé sur CA: ${chiffreAffaires}k€`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    completeExportData.push({
      'Section': 'INDICATEURS CLÉS',
      'Type': 'Émissions par Employé',
      'Valeur': emissionsEmploye.toFixed(2),
      'Unité': 'tCO₂e/employé',
      'Détail': `Basé sur ${nombrePersonnels} employés`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    completeExportData.push({
      'Section': 'PERFORMANCE',
      'Type': 'Réduction Annuelle',
      'Valeur': reductionAnnuelle.toFixed(1),
      'Unité': '%',
      'Détail': `Évolution vs année N-1: ${emissionsAnneePrecedente.toFixed(2)} tCO₂e`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    // Section 2: Plan d'Actions Carbone
    const totalImpact = getTotalImpact();
    const completedImpact = getCompletedImpact();
    const totalCost = getTotalCost();
    const actionsProgress = getActionsProgress();

    completeExportData.push({
      'Section': 'PLAN D\'ACTIONS - RÉSUMÉ',
      'Type': 'Nombre Total d\'Actions',
      'Valeur': actions.length.toString(),
      'Unité': 'actions',
      'Détail': `Progrès: ${actionsProgress.toFixed(1)}%`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    completeExportData.push({
      'Section': 'PLAN D\'ACTIONS - RÉSUMÉ',
      'Type': 'Impact Total Planifié',
      'Valeur': totalImpact.toFixed(2),
      'Unité': 'tCO₂e',
      'Détail': `Impact Réalisé: ${completedImpact.toFixed(2)} tCO₂e`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    completeExportData.push({
      'Section': 'PLAN D\'ACTIONS - RÉSUMÉ',
      'Type': 'Coût Total',
      'Valeur': totalCost.toFixed(2),
      'Unité': '€',
      'Détail': `ROI Carbone: ${totalImpact > 0 ? (totalCost / totalImpact).toFixed(2) : 'N/A'} €/tCO₂e`,
      'Date Export': currentDate,
      'Timestamp': currentDateTime
    });

    // Section 3: Détail des Actions
    actions.forEach((action, index) => {
      completeExportData.push({
        'Section': 'ACTIONS DÉTAILLÉES',
        'Type': `Action ${index + 1}`,
        'Valeur': action.title,
        'Unité': action.status,
        'Détail': `Priorité: ${action.priority} | Impact: ${action.impact?.toFixed(2) || 0} tCO₂e | Coût: ${action.cost?.toFixed(2) || 0}€ | Responsable: ${action.responsible || 'N/A'} | Échéance: ${action.deadline ? new Date(action.deadline).toLocaleDateString('fr-FR') : 'N/A'}`,
        'Date Export': currentDate,
        'Timestamp': currentDateTime
      });
    });

    // Section 4: Analyse des Sources d'Émissions
    const savedCalculations = localStorage.getItem('calculator-calculations');
    if (savedCalculations) {
      try {
        const calculations = JSON.parse(savedCalculations);
        Object.entries(calculations).forEach(([source, data]: [string, any]) => {
          if (data && typeof data === 'object' && data.co2) {
            completeExportData.push({
              'Section': 'SOURCES D\'ÉMISSIONS',
              'Type': source,
              'Valeur': (data.co2 / 1000).toFixed(2),
              'Unité': 'tCO₂e',
              'Détail': `Données calculées: ${data.quantity || 'N/A'} ${data.unit || ''}`,
              'Date Export': currentDate,
              'Timestamp': currentDateTime
            });
          }
        });
      } catch (e) {
        console.error('Erreur parsing calculations:', e);
      }
    }

    // Section 5: Benchmark Sectoriel
    const moyenneSectorielle = localStorage.getItem('calculator-moyenne-sectorielle');
    const leadersSecteur = localStorage.getItem('calculator-leaders-secteur');
    
    if (moyenneSectorielle) {
      completeExportData.push({
        'Section': 'BENCHMARK SECTORIEL',
        'Type': 'Moyenne Sectorielle',
        'Valeur': moyenneSectorielle,
        'Unité': 'tCO₂e',
        'Détail': `Position relative: ${currentEmissions > parseFloat(moyenneSectorielle) ? 'Au-dessus' : 'En-dessous'} de la moyenne`,
        'Date Export': currentDate,
        'Timestamp': currentDateTime
      });
    }

    if (leadersSecteur) {
      completeExportData.push({
        'Section': 'BENCHMARK SECTORIEL',
        'Type': 'Leaders du Secteur',
        'Valeur': leadersSecteur,
        'Unité': 'tCO₂e',
        'Détail': `Écart vs leaders: ${(currentEmissions - parseFloat(leadersSecteur)).toFixed(2)} tCO₂e`,
        'Date Export': currentDate,
        'Timestamp': currentDateTime
      });
    }

    // Section 6: Objectifs SBTi
    const objectifSBTI = emissions.objectifSBTI || 0;
    const objectifsSBTParAnnee = emissions.objectifsSBTParAnnee || {};
    
    if (objectifSBTI > 0) {
      completeExportData.push({
        'Section': 'TRAJECTOIRE SBTi',
        'Type': 'Objectif SBTi Global',
        'Valeur': objectifSBTI.toString(),
        'Unité': 'tCO₂e',
        'Détail': `Écart actuel: ${(currentEmissions - objectifSBTI).toFixed(2)} tCO₂e`,
        'Date Export': currentDate,
        'Timestamp': currentDateTime
      });
    }

    // Objectifs par année
    Object.entries(objectifsSBTParAnnee).forEach(([year, target]: [string, any]) => {
      completeExportData.push({
        'Section': 'TRAJECTOIRE SBTi ANNUELLE',
        'Type': `Objectif ${year}`,
        'Valeur': target.toString(),
        'Unité': 'tCO₂e',
        'Détail': `Année cible: ${year}`,
        'Date Export': currentDate,
        'Timestamp': currentDateTime
      });
    });

    exportCSV(completeExportData, `dashboard_complet_${new Date().toISOString().split('T')[0]}`);
  };

  return {
    exportCurrentData,
    exportReports,
    exportSiteData,
    exportCategoryData,
    exportActionsData,
    exportCompleteData,
    exportCSV
  };
};
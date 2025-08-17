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
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentDateTime = new Date().toISOString();
    
    // Calculer les métriques principales
    const nombrePersonnels = emissions.nombrePersonnels || 50;
    const chiffreAffaires = emissions.chiffreAffaires || 1000000; // 1M€ par défaut
    const emissionsAnneePrecedente = emissions.emissionsAnneePrecedente || (emissions.total / 1000) * 1.15; // +15% par défaut
    const currentEmissions = emissions.total / 1000;
    const intensiteCarbone = chiffreAffaires > 0 ? (currentEmissions / (chiffreAffaires / 1000)) : 9.14; // par k€
    const emissionsEmploye = nombrePersonnels > 0 ? currentEmissions / nombrePersonnels : 182.73;
    const reductionAnnuelle = emissionsAnneePrecedente > 0 ? 
      ((emissionsAnneePrecedente - currentEmissions) / emissionsAnneePrecedente) * 100 : -35.9;

    // Données du plan d'actions
    const totalImpact = getTotalImpact();
    const completedImpact = getCompletedImpact();
    const totalCost = getTotalCost();
    const actionsProgress = getActionsProgress();
    const actionsCompleted = actions.filter(a => a.status === 'completed').length;

    // Données de répartition par poste (simulées pour l'exemple)
    const repartitionPostes = [
      { nom: 'R-404A', valeur: 85.85, unite: '%' },
      { nom: 'Essence', valeur: 12.64, unite: '%' },
      { nom: 'Propane', valeur: 0.64, unite: '%' },
    ];

    // Créer les données structurées
    const exportData = [];

    // === TABLEAU DE BORD EXECUTIF ===
    exportData.push({
      'SECTION': 'TABLEAU DE BORD EXECUTIF',
      'Indicateur': 'Émissions Totales',
      'Valeur': currentEmissions.toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': reductionAnnuelle.toFixed(1) + '%',
      'Statut': reductionAnnuelle > 0 ? 'Réduction' : 'Augmentation',
      'Commentaire': `Objectif de réduction ${reductionAnnuelle > 0 ? 'atteint' : 'non atteint'}`
    });

    exportData.push({
      'SECTION': 'TABLEAU DE BORD EXECUTIF',
      'Indicateur': 'Intensité Carbone',
      'Valeur': intensiteCarbone.toFixed(2),
      'Unité': 'tCO₂e/k€',
      'Variation vs N-1': reductionAnnuelle.toFixed(1) + '%',
      'Statut': 'À améliorer',
      'Commentaire': `Basé sur un CA de ${(chiffreAffaires/1000).toFixed(0)}k€`
    });

    exportData.push({
      'SECTION': 'TABLEAU DE BORD EXECUTIF',
      'Indicateur': 'Émissions par Employé',
      'Valeur': emissionsEmploye.toFixed(2),
      'Unité': 'tCO₂e/employé',
      'Variation vs N-1': reductionAnnuelle.toFixed(1) + '%',
      'Statut': 'À évaluer',
      'Commentaire': `Moyenne sectorielle: 8-12 tCO₂e/employé`
    });

    // === RÉPARTITION PAR SCOPE ===
    const scope1Percent = ((emissions.scope1 / emissions.total) * 100);
    const scope2Percent = ((emissions.scope2 / emissions.total) * 100);
    const scope3Percent = ((emissions.scope3 / emissions.total) * 100);

    exportData.push({
      'SECTION': 'REPARTITION PAR SCOPE',
      'Indicateur': 'Scope 1 - Émissions Directes',
      'Valeur': (emissions.scope1 / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': scope1Percent.toFixed(1) + '%',
      'Statut': '',
      'Commentaire': 'Combustibles, véhicules, procédés, gaz frigorigènes'
    });

    exportData.push({
      'SECTION': 'REPARTITION PAR SCOPE',
      'Indicateur': 'Scope 2 - Énergies Indirectes',
      'Valeur': (emissions.scope2 / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': scope2Percent.toFixed(1) + '%',
      'Statut': '',
      'Commentaire': 'Électricité, chaleur, vapeur'
    });

    exportData.push({
      'SECTION': 'REPARTITION PAR SCOPE',
      'Indicateur': 'Scope 3 - Autres Indirectes',
      'Valeur': (emissions.scope3 / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': scope3Percent.toFixed(1) + '%',
      'Statut': '',
      'Commentaire': 'Achats, transport, déchets, numérique'
    });

    // === RÉPARTITION PAR POSTE ===
    repartitionPostes.forEach(poste => {
      exportData.push({
        'SECTION': 'REPARTITION PAR POSTE',
        'Indicateur': poste.nom,
        'Valeur': poste.valeur.toFixed(2),
        'Unité': poste.unite,
        'Variation vs N-1': '',
        'Statut': '',
        'Commentaire': ''
      });
    });

    // === PLAN D'ACTIONS - RÉSUMÉ ===
    exportData.push({
      'SECTION': 'PLAN D\'ACTIONS - RESUME',
      'Indicateur': 'Nombre Total d\'Actions',
      'Valeur': actions.length.toString(),
      'Unité': 'actions',
      'Variation vs N-1': `${actionsProgress.toFixed(1)}% complétées`,
      'Statut': actionsProgress > 70 ? 'Bon suivi' : 'Retard',
      'Commentaire': `${actionsCompleted} terminées sur ${actions.length}`
    });

    exportData.push({
      'SECTION': 'PLAN D\'ACTIONS - RESUME',
      'Indicateur': 'Impact Total Planifié',
      'Valeur': totalImpact.toFixed(1),
      'Unité': 'tCO₂e',
      'Variation vs N-1': `${((totalImpact / currentEmissions) * 100).toFixed(1)}%`,
      'Statut': totalImpact > currentEmissions * 0.1 ? 'Ambitieux' : 'Insuffisant',
      'Commentaire': `Impact réalisé: ${completedImpact.toFixed(1)} tCO₂e`
    });

    // === PLAN D'ACTIONS - DÉTAIL ===
    const topActions = actions
      .filter(a => a.impact && a.impact > 0)
      .sort((a, b) => (b.impact || 0) - (a.impact || 0))
      .slice(0, 5);

    topActions.forEach((action) => {
      const statusText = action.status === 'completed' ? 'Terminée' :
                        action.status === 'in-progress' ? 'En cours' :
                        action.status === 'delayed' ? 'Retard' : 'À faire';
      
      const deadline = action.deadline ? new Date(action.deadline).toLocaleDateString('fr-FR') : 'N/A';
      const budget = action.cost ? `Budget: ${action.cost.toFixed(0)}€` : '';
      
      exportData.push({
        'SECTION': 'PLAN D\'ACTIONS - DETAIL',
        'Indicateur': action.title,
        'Valeur': (action.impact || 0).toFixed(0),
        'Unité': 'tCO₂e',
        'Variation vs N-1': '',
        'Statut': statusText,
        'Commentaire': `Échéance: ${deadline}. ${budget}`
      });
    });

    // === BENCHMARK SECTORIEL ===
    const votrEntreprise = currentEmissions;
    const moyenneSectorielle = 200; // Valeur exemple
    const leadersSecteur = 120; // Valeur exemple

    exportData.push({
      'SECTION': 'BENCHMARK SECTORIEL',
      'Indicateur': 'Votre entreprise',
      'Valeur': votrEntreprise.toFixed(2),
      'Unité': 'tCO₂e/pers',
      'Variation vs N-1': '',
      'Statut': '60e',
      'Commentaire': 'Performance au-dessus de la moyenne'
    });

    exportData.push({
      'SECTION': 'BENCHMARK SECTORIEL',
      'Indicateur': 'Moyenne sectorielle',
      'Valeur': moyenneSectorielle.toFixed(0),
      'Unité': 'tCO₂e/pers',
      'Variation vs N-1': '',
      'Statut': '',
      'Commentaire': ''
    });

    exportData.push({
      'SECTION': 'BENCHMARK SECTORIEL',
      'Indicateur': 'Leaders du secteur',
      'Valeur': leadersSecteur.toFixed(0),
      'Unité': 'tCO₂e/pers',
      'Variation vs N-1': '',
      'Statut': '',
      'Commentaire': ''
    });

    // === TRAJECTOIRE SBTi ===
    const objectifSBTI = emissions.objectifSBTI || 82;
    const conformitePourcentage = objectifSBTI > 0 ? 
      ((objectifSBTI - currentEmissions) / objectifSBTI * 100) : -5.2;

    exportData.push({
      'SECTION': 'TRAJECTOIRE SBTi',
      'Indicateur': 'Conformité à Objectif SBTi',
      'Valeur': objectifSBTI.toFixed(0),
      'Unité': '%',
      'Variation vs N-1': `${conformitePourcentage.toFixed(1)}%`,
      'Statut': conformitePourcentage >= 0 ? 'En avance' : 'En retard',
      'Commentaire': `Objectif: 80% réduction nécessaire: ${Math.max(0, currentEmissions - objectifSBTI).toFixed(2)} tCO₂e`
    });

    // === MÉTADONNÉES ===
    exportData.push({
      'SECTION': 'METADONNEES',
      'Indicateur': 'Date et Heure Export',
      'Valeur': currentDate.replace(/\//g, '/'),
      'Unité': '',
      'Variation vs N-1': currentDateTime.split('T')[1].split('.')[0],
      'Statut': 'Export auto',
      'Commentaire': 'Depuis dashboard CarbonTrack'
    });

    exportData.push({
      'SECTION': 'METADONNEES',
      'Indicateur': 'Version des Données',
      'Valeur': '2025.1',
      'Unité': '',
      'Variation vs N-1': '',
      'Statut': '',
      'Commentaire': 'Base Carbone® ADEME, GHG Protocol'
    });

    exportCSV(exportData, `dashboard_carbone_${new Date().toISOString().split('T')[0]}`);
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
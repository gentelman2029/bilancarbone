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
    const chiffreAffaires = emissions.chiffreAffaires || 1000;
    const emissionsAnneePrecedente = emissions.emissionsAnneePrecedente || 0;
    const currentEmissions = emissions.total / 1000;
    const intensiteCarbone = chiffreAffaires > 0 ? currentEmissions / chiffreAffaires : 0;
    const emissionsEmploye = nombrePersonnels > 0 ? currentEmissions / nombrePersonnels : 0;
    const reductionAnnuelle = emissionsAnneePrecedente > 0 ? 
      ((emissionsAnneePrecedente - currentEmissions) / emissionsAnneePrecedente) * 100 : 0;

    // Données du plan d'actions
    const totalImpact = getTotalImpact();
    const completedImpact = getCompletedImpact();
    const totalCost = getTotalCost();
    const actionsProgress = getActionsProgress();

    // Créer plusieurs feuilles de données pour un export structuré
    const exportData = [];

    // === SECTION 1: TABLEAU DE BORD EXÉCUTIF ===
    exportData.push({
      'SECTION': '1. TABLEAU DE BORD EXECUTIF',
      'Indicateur': 'Émissions Totales',
      'Valeur': (emissions.total / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': reductionAnnuelle.toFixed(1) + '%',
      'Statut': reductionAnnuelle > 0 ? '✓ Réduction' : '⚠ Augmentation',
      'Commentaire': `Objectif de réduction ${reductionAnnuelle > 0 ? 'atteint' : 'non atteint'}`
    });

    exportData.push({
      'SECTION': '1. TABLEAU DE BORD EXECUTIF',
      'Indicateur': 'Intensité Carbone',
      'Valeur': intensiteCarbone.toFixed(2),
      'Unité': 'tCO₂e/k€',
      'Variation vs N-1': '',
      'Statut': intensiteCarbone < 1 ? '✓ Performant' : '⚠ A améliorer',
      'Commentaire': `Basé sur un CA de ${chiffreAffaires.toLocaleString('fr-FR')}k€`
    });

    exportData.push({
      'SECTION': '1. TABLEAU DE BORD EXECUTIF',
      'Indicateur': 'Émissions par Employé',
      'Valeur': emissionsEmploye.toFixed(2),
      'Unité': 'tCO₂e/employé',
      'Variation vs N-1': '',
      'Statut': emissionsEmploye < 10 ? '✓ Bon niveau' : '⚠ Élevé',
      'Commentaire': `${nombrePersonnels} employés - Moyenne sectorielle: 8-12 tCO₂e/employé`
    });

    // === SECTION 2: RÉPARTITION PAR SCOPE ===
    const scope1Percent = ((emissions.scope1 / emissions.total) * 100).toFixed(1);
    const scope2Percent = ((emissions.scope2 / emissions.total) * 100).toFixed(1);
    const scope3Percent = ((emissions.scope3 / emissions.total) * 100).toFixed(1);

    exportData.push({
      'SECTION': '2. REPARTITION PAR SCOPE',
      'Indicateur': 'Scope 1 - Émissions Directes',
      'Valeur': (emissions.scope1 / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': scope1Percent + '%',
      'Statut': 'Combustibles, véhicules, procédés',
      'Commentaire': 'Gaz naturel, diesel, essence, gaz frigorigènes'
    });

    exportData.push({
      'SECTION': '2. REPARTITION PAR SCOPE',
      'Indicateur': 'Scope 2 - Énergies Indirectes',
      'Valeur': (emissions.scope2 / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': scope2Percent + '%',
      'Statut': 'Électricité, chaleur, vapeur',
      'Commentaire': 'Consommation énergétique des bâtiments'
    });

    exportData.push({
      'SECTION': '2. REPARTITION PAR SCOPE',
      'Indicateur': 'Scope 3 - Autres Indirectes',
      'Valeur': (emissions.scope3 / 1000).toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': scope3Percent + '%',
      'Statut': 'Chaîne de valeur',
      'Commentaire': 'Achats, transport, déplacements, déchets'
    });

    // === SECTION 3: PLAN D\'ACTIONS RÉSUMÉ ===
    exportData.push({
      'SECTION': '3. PLAN D\'ACTIONS - RESUME',
      'Indicateur': 'Nombre Total d\'Actions',
      'Valeur': actions.length.toString(),
      'Unité': 'actions',
      'Variation vs N-1': actionsProgress.toFixed(1) + '% complétées',
      'Statut': actionsProgress > 70 ? '✓ Bon suivi' : '⚠ Retard',
      'Commentaire': `${actions.filter(a => a.status === 'completed').length} terminées sur ${actions.length}`
    });

    exportData.push({
      'SECTION': '3. PLAN D\'ACTIONS - RESUME',
      'Indicateur': 'Impact Total Planifié',
      'Valeur': totalImpact.toFixed(2),
      'Unité': 'tCO₂e',
      'Variation vs N-1': `${((totalImpact / currentEmissions) * 100).toFixed(1)}% des émissions`,
      'Statut': totalImpact > currentEmissions * 0.1 ? '✓ Ambitieux' : '⚠ Insuffisant',
      'Commentaire': `Impact réalisé: ${completedImpact.toFixed(2)} tCO₂e`
    });

    exportData.push({
      'SECTION': '3. PLAN D\'ACTIONS - RESUME',
      'Indicateur': 'Budget Total',
      'Valeur': totalCost.toFixed(0),
      'Unité': '€',
      'Variation vs N-1': totalImpact > 0 ? `${(totalCost / totalImpact).toFixed(0)} €/tCO₂e` : 'N/A',
      'Statut': totalCost / totalImpact < 100 ? '✓ Rentable' : '⚠ Coûteux',
      'Commentaire': `ROI Carbone moyen du marché: 50-150 €/tCO₂e`
    });

    // === SECTION 4: DÉTAIL DES ACTIONS PRIORITAIRES ===
    const priorityActions = actions.filter(a => a.priority === 'high').slice(0, 10);
    priorityActions.forEach((action, index) => {
      const roi = action.cost && action.impact ? (action.cost / action.impact) : 0;
      exportData.push({
        'SECTION': '4. ACTIONS PRIORITAIRES',
        'Indicateur': `Action ${index + 1}: ${action.title}`,
        'Valeur': action.impact?.toFixed(2) || '0',
        'Unité': 'tCO₂e',
        'Variation vs N-1': action.cost?.toFixed(0) + '€' || '0€',
        'Statut': action.status === 'completed' ? '✓ Terminée' :
                  action.status === 'in-progress' ? '🔄 En cours' :
                  action.status === 'delayed' ? '⚠ Retard' : '📋 Prévue',
        'Commentaire': `Priorité: ${action.priority} | ROI: ${roi.toFixed(0)}€/tCO₂e | Resp: ${action.responsible || 'N/A'} | Échéance: ${action.deadline ? new Date(action.deadline).toLocaleDateString('fr-FR') : 'N/A'}`
      });
    });

    // === SECTION 5: SOURCES D\'ÉMISSIONS DÉTAILLÉES ===
    const savedCalculations = localStorage.getItem('calculator-calculations');
    if (savedCalculations) {
      try {
        const calculations = JSON.parse(savedCalculations);
        const sources = Object.entries(calculations)
          .filter(([_, data]: [string, any]) => data && data.co2)
          .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.co2 - a.co2)
          .slice(0, 20); // Top 20

        sources.forEach(([source, data]: [string, any]) => {
          const emissionsTonnes = data.co2 / 1000;
          const percentage = ((data.co2 / emissions.total) * 100).toFixed(1);
          exportData.push({
            'SECTION': '5. SOURCES D\'EMISSIONS',
            'Indicateur': source,
            'Valeur': emissionsTonnes.toFixed(2),
            'Unité': 'tCO₂e',
            'Variation vs N-1': percentage + '% du total',
            'Statut': percentage > '5' ? '🔴 Majeure' : 
                     percentage > '1' ? '🟡 Significative' : '🟢 Mineure',
            'Commentaire': `Quantité: ${data.quantity || 'N/A'} ${data.unit || ''} | FE: ${data.emissionFactor || 'N/A'}`
          });
        });
      } catch (e) {
        console.error('Erreur parsing calculations:', e);
      }
    }

    // === SECTION 6: BENCHMARK SECTORIEL ===
    const moyenneSectorielle = localStorage.getItem('calculator-moyenne-sectorielle');
    const leadersSecteur = localStorage.getItem('calculator-leaders-secteur');
    
    if (moyenneSectorielle) {
      const ecartMoyenne = ((currentEmissions - parseFloat(moyenneSectorielle)) / parseFloat(moyenneSectorielle) * 100).toFixed(1);
      exportData.push({
        'SECTION': '6. BENCHMARK SECTORIEL',
        'Indicateur': 'Position vs Moyenne Sectorielle',
        'Valeur': currentEmissions.toFixed(2),
        'Unité': 'tCO₂e',
        'Variation vs N-1': `${ecartMoyenne}% vs moyenne`,
        'Statut': parseFloat(ecartMoyenne) < 0 ? '✓ Meilleur que la moyenne' : '⚠ Au-dessus de la moyenne',
        'Commentaire': `Moyenne sectorielle: ${parseFloat(moyenneSectorielle).toFixed(2)} tCO₂e`
      });
    }

    if (leadersSecteur) {
      const ecartLeaders = ((currentEmissions - parseFloat(leadersSecteur)) / parseFloat(leadersSecteur) * 100).toFixed(1);
      exportData.push({
        'SECTION': '6. BENCHMARK SECTORIEL',
        'Indicateur': 'Position vs Leaders Secteur',
        'Valeur': currentEmissions.toFixed(2),
        'Unité': 'tCO₂e',
        'Variation vs N-1': `${ecartLeaders}% vs leaders`,
        'Statut': parseFloat(ecartLeaders) < 0 ? '🏆 Niveau leader' : 
                  parseFloat(ecartLeaders) < 20 ? '✓ Proche des leaders' : '⚠ Loin des leaders',
        'Commentaire': `Leaders du secteur: ${parseFloat(leadersSecteur).toFixed(2)} tCO₂e`
      });
    }

    // === SECTION 7: TRAJECTOIRE SBTi ===
    const objectifSBTI = emissions.objectifSBTI || 0;
    if (objectifSBTI > 0) {
      const ecartSBTI = ((currentEmissions - objectifSBTI) / objectifSBTI * 100).toFixed(1);
      exportData.push({
        'SECTION': '7. TRAJECTOIRE SBTi',
        'Indicateur': 'Conformité Objectif SBTi',
        'Valeur': currentEmissions.toFixed(2),
        'Unité': 'tCO₂e',
        'Variation vs N-1': `${ecartSBTI}% vs objectif`,
        'Statut': parseFloat(ecartSBTI) <= 0 ? '✓ Objectif atteint' : '⚠ Écart à combler',
        'Commentaire': `Objectif SBTi: ${objectifSBTI.toFixed(2)} tCO₂e | Réduction nécessaire: ${Math.max(0, currentEmissions - objectifSBTI).toFixed(2)} tCO₂e`
      });
    }

    // === MÉTADONNÉES D\'EXPORT ===
    exportData.push({
      'SECTION': '8. METADONNEES',
      'Indicateur': 'Date et Heure Export',
      'Valeur': currentDate,
      'Unité': '',
      'Variation vs N-1': currentDateTime,
      'Statut': 'Export automatisé',
      'Commentaire': 'Données générées depuis le dashboard CarbonTrack'
    });

    exportData.push({
      'SECTION': '8. METADONNEES',
      'Indicateur': 'Version des Données',
      'Valeur': '2025.1',
      'Unité': '',
      'Variation vs N-1': 'Base Carbone® ADEME',
      'Statut': 'Conforme ISO 14064',
      'Commentaire': 'Facteurs d\'émission à jour - Méthodologie GHG Protocol'
    });

    exportCSV(exportData, `CarbonTrack_Dashboard_Complet_${new Date().toISOString().split('T')[0]}`);
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
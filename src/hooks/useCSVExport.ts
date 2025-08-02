import { useCarbonReports } from './useCarbonReports';
import { useEmissions } from '@/contexts/EmissionsContext';

export const useCSVExport = () => {
  const { reports } = useCarbonReports();
  const { emissions } = useEmissions();

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

  return {
    exportCurrentData,
    exportReports,
    exportSiteData,
    exportCategoryData,
    exportCSV
  };
};
// RSE Excel Export Component
// Exports raw RSE data for auditors (Ernst & Young, Deloitte, etc.)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet as ExcelIcon,
  Download,
  FileSpreadsheet,
  Check,
  Info,
} from 'lucide-react';
import { RSEReportData } from '@/hooks/useRSEReport';
import { toast } from 'sonner';

interface RSEExcelExportProps {
  reportData: RSEReportData;
}

interface ExportSection {
  id: string;
  label: string;
  description: string;
  rowCount: number;
}

export function RSEExcelExport({ reportData }: RSEExcelExportProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'actions',
    'esg_scores',
    'budget',
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const sections: ExportSection[] = [
    {
      id: 'actions',
      label: 'Actions RSE',
      description: 'Tableau complet des actions avec statuts, budgets et impacts',
      rowCount: reportData.actions.length,
    },
    {
      id: 'esg_scores',
      label: 'Scores ESG',
      description: 'Scores par pilier E/S/G avec indicateurs détaillés',
      rowCount: reportData.categories.reduce((sum, c) => sum + c.indicators.length, 0),
    },
    {
      id: 'budget',
      label: 'Suivi Budgétaire',
      description: 'Allocation et consommation budgétaire par action',
      rowCount: reportData.actions.filter(a => a.impactMetrics.costEstimated > 0).length,
    },
    {
      id: 'stakeholders',
      label: 'Parties Prenantes',
      description: 'Matrice des parties prenantes (Power/Interest)',
      rowCount: 20, // Approximation
    },
    {
      id: 'compliance',
      label: 'Conformité',
      description: 'Alertes réglementaires et seuils BVMT',
      rowCount: reportData.complianceAlerts.length,
    },
    {
      id: 'methodology',
      label: 'Méthodologie',
      description: 'Notes méthodologiques et hypothèses',
      rowCount: 5,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  };

  // Generate CSV content for export
  const generateCSVContent = (): string => {
    const lines: string[] = [];
    const separator = ';'; // Use semicolon for French Excel compatibility

    // Header info
    lines.push(`Rapport RSE - ${reportData.companyName}`);
    lines.push(`Exercice ${reportData.fiscalYear}`);
    lines.push(`Généré le ${formatDate(reportData.reportGeneratedAt)}`);
    lines.push('');

    // Actions Section
    if (selectedSections.includes('actions')) {
      lines.push('=== ACTIONS RSE ===');
      lines.push(['ID', 'Titre', 'Catégorie', 'Statut', 'Priorité', 'Budget (TND)', 'Réduction CO2 (tCO2e)', 'Deadline', 'Responsable'].join(separator));
      
      reportData.actions.forEach(action => {
        lines.push([
          action.id,
          `"${action.title.replace(/"/g, '""')}"`,
          action.category,
          action.status,
          action.priority,
          formatCurrency(action.impactMetrics.costEstimated),
          action.impactMetrics.co2ReductionTarget || 0,
          action.deadline,
          action.assignedTo,
        ].join(separator));
      });
      lines.push('');
    }

    // ESG Scores Section
    if (selectedSections.includes('esg_scores')) {
      lines.push('=== SCORES ESG ===');
      lines.push(['Pilier', 'Score', 'Pondération'].join(separator));
      lines.push(['Environnement (E)', reportData.esgScores.categoryScores.E?.toFixed(1) || '0', `${reportData.weightingConfig.e.toFixed(0)}%`].join(separator));
      lines.push(['Social (S)', reportData.esgScores.categoryScores.S?.toFixed(1) || '0', `${reportData.weightingConfig.s.toFixed(0)}%`].join(separator));
      lines.push(['Gouvernance (G)', reportData.esgScores.categoryScores.G?.toFixed(1) || '0', `${reportData.weightingConfig.g.toFixed(0)}%`].join(separator));
      lines.push(['SCORE GLOBAL', reportData.esgScores.totalScore.toFixed(1), '100%'].join(separator));
      lines.push('');

      // Detailed indicators
      lines.push('--- Indicateurs Détaillés ---');
      lines.push(['ID', 'Indicateur', 'Pilier', 'Type', 'Valeur', 'Unité'].join(separator));
      
      reportData.categories.forEach(category => {
        category.indicators.forEach(ind => {
          const value = ind.type === 'binary' 
            ? (ind.value ? 'Oui' : 'Non')
            : (ind.value !== undefined ? String(ind.value) : '—');
          
          lines.push([
            ind.id,
            `"${ind.label.replace(/"/g, '""')}"`,
            category.id,
            ind.type,
            value,
            ind.unit || '',
          ].join(separator));
        });
      });
      lines.push('');
    }

    // Budget Section
    if (selectedSections.includes('budget')) {
      lines.push('=== SUIVI BUDGÉTAIRE ===');
      lines.push(['Métrique', 'Valeur (TND)'].join(separator));
      lines.push(['Budget Alloué', formatCurrency(reportData.budgetStats.allocated)].join(separator));
      lines.push(['Budget Consommé', formatCurrency(reportData.budgetStats.spent)].join(separator));
      lines.push(['Budget Restant', formatCurrency(reportData.budgetStats.remaining)].join(separator));
      lines.push(['Taux d\'Utilisation', `${reportData.budgetStats.utilizationRate}%`].join(separator));
      lines.push('');
    }

    // Compliance Section
    if (selectedSections.includes('compliance')) {
      lines.push('=== CONFORMITÉ RÉGLEMENTAIRE ===');
      lines.push(['Type', 'Titre', 'Description', 'Réglementation', 'Action Recommandée'].join(separator));
      
      reportData.complianceAlerts.forEach(alert => {
        lines.push([
          alert.type || 'info',
          `"${(alert.title || '').replace(/"/g, '""')}"`,
          `"${(alert.description || '').replace(/"/g, '""')}"`,
          alert.regulation || '',
          `"${(alert.action || '').replace(/"/g, '""')}"`,
        ].join(separator));
      });
      lines.push('');
    }

    // Methodology Section
    if (selectedSections.includes('methodology')) {
      lines.push('=== MÉTHODOLOGIE ===');
      lines.push(['Élément', 'Description'].join(separator));
      lines.push(['Formule de Scoring', `"${reportData.methodology.scoringFormula}"`].join(separator));
      lines.push(['Pondération', `"${reportData.methodology.weights}"`].join(separator));
      lines.push(['Source des Données', `"${reportData.methodology.dataSource}"`].join(separator));
      lines.push('');
      lines.push('Limitations:');
      reportData.methodology.limitations.forEach((lim, idx) => {
        lines.push([`${idx + 1}`, `"${lim.replace(/"/g, '""')}"`].join(separator));
      });
    }

    return lines.join('\n');
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast.error('Veuillez sélectionner au moins une section à exporter');
      return;
    }

    setIsExporting(true);

    try {
      const csvContent = generateCSVContent();
      
      // Add BOM for Excel UTF-8 compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rapport_RSE_${reportData.companyName.replace(/\s+/g, '_')}_${reportData.fiscalYear}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export Excel généré avec succès');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de la génération de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const totalRows = sections
    .filter(s => selectedSections.includes(s.id))
    .reduce((sum, s) => sum + s.rowCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          Export Excel pour Auditeurs
        </CardTitle>
        <CardDescription>
          Exportez les données brutes du rapport RSE au format CSV (compatible Excel) pour les audits externes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Selection */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Sections à inclure
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.map(section => (
              <div
                key={section.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSections.includes(section.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
                onClick={() => toggleSection(section.id)}
              >
                <Checkbox
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium cursor-pointer">{section.label}</Label>
                    <Badge variant="outline" className="text-xs">
                      {section.rowCount} lignes
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Info className="h-4 w-4" />
            Aperçu de l'export
          </h4>
          
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Lignes</TableHead>
                  <TableHead className="text-center">Inclus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map(section => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.label}</TableCell>
                    <TableCell className="text-right">{section.rowCount}</TableCell>
                    <TableCell className="text-center">
                      {selectedSections.includes(section.id) ? (
                        <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalRows}</TableCell>
                  <TableCell className="text-center">
                    {selectedSections.length}/{sections.length}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedSections.length === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Télécharger Excel ({selectedSections.length} sections)
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Format CSV avec séparateur point-virgule, compatible Microsoft Excel et Google Sheets.
        </p>
      </CardContent>
    </Card>
  );
}

export default RSEExcelExport;

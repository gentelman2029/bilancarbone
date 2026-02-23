import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, RotateCcw, FileText, Save, Download, Flame, Zap, Globe, Loader2 } from "lucide-react";
import { CalculationDetail } from '@/hooks/useCalculationDetails';
import { CalculationDetailsSection } from '@/components/CalculationDetailsSection';
import { useTranslation } from 'react-i18next';

interface DetailsViewProps {
  sectionDetails: {
    scope1: CalculationDetail[];
    scope2: CalculationDetail[];
    scope3: CalculationDetail[];
  };
  scope3CombinedDetails: CalculationDetail[];
  scope1Total: number;
  scope2Total: number;
  scope3TotalWithAdvanced: number;
  totalGlobal: number;
  totalEntries: number;
  advancedCount: number;
  isAdvancedMode: boolean;
  hasAnyData: boolean;
  isAuthenticated: boolean;
  isSaving: boolean;
  onRemoveScope1Detail: (id: string) => void;
  onRemoveScope2Detail: (id: string) => void;
  onRemoveScope3Detail: (id: string) => void;
  onClearScope1: () => void;
  onClearScope2: () => void;
  onClearScope3: () => void;
  onResetAll: () => void;
  onSave: () => void;
  onExportCSV: () => void;
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  sectionDetails,
  scope3CombinedDetails,
  scope1Total,
  scope2Total,
  scope3TotalWithAdvanced,
  totalGlobal,
  totalEntries,
  advancedCount,
  isAdvancedMode,
  hasAnyData,
  isAuthenticated,
  isSaving,
  onRemoveScope1Detail,
  onRemoveScope2Detail,
  onRemoveScope3Detail,
  onClearScope1,
  onClearScope2,
  onClearScope3,
  onResetAll,
  onSave,
  onExportCSV,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('ghg.details.title', 'Détail des Calculs - Année 2025')}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <Calculator className="h-3 w-3 mr-1" />
              {totalEntries + advancedCount} {t('ghg.details.calculations', 'calcul(s)')}
            </Badge>
            <Button onClick={onResetAll} variant="outline" size="sm" className="h-8" disabled={!hasAnyData}>
              <RotateCcw className="h-4 w-4 mr-1" />{t('ghg.details.reset_all', 'Réinitialiser tout')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Résumé des totaux */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center border-r border-border/50">
            <div className="text-sm text-muted-foreground">Scope 1</div>
            <div className="text-xl font-bold text-red-600">{(scope1Total / 1000).toFixed(2)} tCO₂e</div>
          </div>
          <div className="text-center border-r border-border/50">
            <div className="text-sm text-muted-foreground">Scope 2</div>
            <div className="text-xl font-bold text-amber-600">{(scope2Total / 1000).toFixed(2)} tCO₂e</div>
          </div>
          <div className="text-center border-r border-border/50">
            <div className="text-sm text-muted-foreground">Scope 3</div>
            <div className="text-xl font-bold text-blue-600">{(scope3TotalWithAdvanced / 1000).toFixed(2)} tCO₂e</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">TOTAL</div>
            <div className="text-xl font-bold text-primary">{(totalGlobal / 1000).toFixed(2)} tCO₂e</div>
          </div>
        </div>

        {/* Sections de détails par scope */}
        <div className="space-y-6">
          <CalculationDetailsSection
            title={t('ghg.details.scope1_title', 'Scope 1 - Émissions Directes')}
            icon={<Flame className="h-5 w-5 text-red-500" />}
            details={sectionDetails.scope1}
            sectionColor="destructive"
            onRemoveDetail={onRemoveScope1Detail}
            onClearSection={onClearScope1}
          />
          <CalculationDetailsSection
            title={t('ghg.details.scope2_title', 'Scope 2 - Émissions Indirectes Énergie')}
            icon={<Zap className="h-5 w-5 text-amber-500" />}
            details={sectionDetails.scope2}
            sectionColor="default"
            onRemoveDetail={onRemoveScope2Detail}
            onClearSection={onClearScope2}
          />
          <CalculationDetailsSection
            title={t('ghg.details.scope3_title', 'Scope 3 - Autres Émissions Indirectes')}
            icon={<Globe className="h-5 w-5 text-blue-500" />}
            details={scope3CombinedDetails}
            sectionColor="secondary"
            onRemoveDetail={onRemoveScope3Detail}
            onClearSection={onClearScope3}
          />

          {!hasAnyData && (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('ghg.details.no_data', 'Aucun calcul enregistré')}</p>
              <p className="text-sm">{t('ghg.details.no_data_hint', 'Ajoutez des données dans les onglets Scope 1, 2 ou 3 pour voir les détails ici')}</p>
            </div>
          )}
        </div>

        {/* Actions d'export */}
        {hasAnyData && (
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button onClick={onSave} variant="default" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving
                ? t('common.loading', 'Chargement...')
                : isAuthenticated
                  ? t('ghg.summary.save_dashboard', 'Sauvegarder au Dashboard')
                  : t('ghg.summary.login_required', 'Connexion requise')}
            </Button>
            <Button onClick={onExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('ghg.summary.export_csv', 'Exporter CSV')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

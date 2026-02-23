import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, Download, RotateCcw, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface GHGSummaryProps {
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  totalGlobal: number;
  scope3AdvancedTotal: number;
  isAdvancedMode: boolean;
  isAuthenticated: boolean;
  isSaving: boolean;
  hasAnyData: boolean;
  onSave: () => void;
  onExportCSV: () => void;
  onReset: () => void;
}

export const GHGSummary: React.FC<GHGSummaryProps> = ({
  scope1Total,
  scope2Total,
  scope3Total,
  totalGlobal,
  scope3AdvancedTotal,
  isAdvancedMode,
  isAuthenticated,
  isSaving,
  hasAnyData,
  onSave,
  onExportCSV,
  onReset,
}) => {
  const { t } = useTranslation();

  if (!hasAnyData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t('ghg.summary.title', 'Bilan Carbone par Scope')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{(scope1Total / 1000).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Scope 1 (tCO₂e)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{(scope2Total / 1000).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Scope 2 (tCO₂e)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{(scope3Total / 1000).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Scope 3 (tCO₂e)</div>
            {isAdvancedMode && scope3AdvancedTotal > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                ({t('ghg.summary.including', 'incl.')} {(scope3AdvancedTotal / 1000).toFixed(1)}t {t('ghg.summary.advanced', 'avancé')})
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{(totalGlobal / 1000).toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Total (tCO₂e)</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={onSave} variant="default" size="sm" disabled={isSaving}>
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
          <Button onClick={onExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('ghg.summary.export_csv', 'Exporter CSV')}
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('common.reset', 'Réinitialiser')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

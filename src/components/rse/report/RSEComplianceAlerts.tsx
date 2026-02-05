// RSE Compliance Alerts Component
// Displays BVMT and regulatory compliance warnings

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingDown,
  TrendingUp,
  Leaf,
  Info,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  ComplianceCheckResult,
  ComplianceAlert,
  ComplianceLevel,
  getComplianceLevelConfig,
  calculateEnvironmentalROI,
  getOverallStatus,
} from '@/lib/rse/complianceEngine';
import { RSEAction } from '@/lib/rse/types';

interface RSEComplianceAlertsProps {
  complianceResult: ComplianceCheckResult;
  actions: RSEAction[];
  onNavigateToActions?: () => void;
}

const getLevelIcon = (level: ComplianceLevel) => {
  switch (level) {
    case 'conformant':
      return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
    case 'warning':
      return <ShieldAlert className="h-5 w-5 text-amber-500" />;
    case 'critical':
      return <ShieldX className="h-5 w-5 text-red-500" />;
  }
};

const getAlertVariant = (level: ComplianceLevel): 'default' | 'destructive' => {
  return level === 'critical' ? 'destructive' : 'default';
};

// Format number with space separator for thousands
const formatNumber = (n: number) => {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/,/g, ' ');
};

export function RSEComplianceAlerts({ complianceResult, actions, onNavigateToActions }: RSEComplianceAlertsProps) {
  const levelConfig = getComplianceLevelConfig(complianceResult.overallLevel);
  const envROI = calculateEnvironmentalROI(actions);
  const overallStatus = getOverallStatus(complianceResult.alerts);

  const criticalAlerts = complianceResult.alerts.filter(a => a.level === 'critical');
  const warningAlerts = complianceResult.alerts.filter(a => a.level === 'warning');

  // Determine badge color based on alerts (not just score)
  const getBadgeConfig = () => {
    if (criticalAlerts.length > 0) {
      return { className: 'bg-red-100 text-red-600 border-red-200', label: 'Non-conforme' };
    }
    if (warningAlerts.length > 0) {
      return { className: 'bg-amber-100 text-amber-600 border-amber-200', label: 'Attention requise' };
    }
    return { className: 'bg-emerald-100 text-emerald-600 border-emerald-200', label: 'Conforme' };
  };

  const badgeConfig = getBadgeConfig();

  // Format ROI display
  const renderROIValue = () => {
    if (envROI.roiStatus === 'no_investment') {
      return (
        <div className="flex flex-col items-center">
          <HelpCircle className="h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-sm text-muted-foreground">Aucun investissement</p>
        </div>
      );
    }
    if (envROI.roiStatus === 'evaluating') {
      return (
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold text-blue-600">En cours</p>
          <p className="text-xs text-muted-foreground">d'évaluation</p>
        </div>
      );
    }
    return (
      <>
        {envROI.roiPerTonne >= 0 ? (
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
        ) : (
          <TrendingDown className="h-5 w-5 mx-auto mb-1 text-red-500" />
        )}
        <p className={`text-2xl font-bold ${envROI.roiPerTonne >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {envROI.roiPerTonne.toFixed(0)}%
        </p>
        <p className="text-xs text-muted-foreground">ROI Carbone</p>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className={`border-2 ${
        complianceResult.overallLevel === 'conformant' ? 'border-emerald-200 bg-emerald-50/30' :
        complianceResult.overallLevel === 'warning' ? 'border-amber-200 bg-amber-50/30' :
        'border-red-200 bg-red-50/30'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {getLevelIcon(complianceResult.overallLevel)}
              <span>Conformité Réglementaire</span>
            </CardTitle>
            <Badge className={`${badgeConfig.className} border`}>
              {levelConfig.icon} {badgeConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Compliance Score */}
            <div className="text-center">
              <p className={`text-4xl font-bold ${
                criticalAlerts.length > 0 ? 'text-red-600' :
                warningAlerts.length > 0 ? 'text-amber-600' :
                'text-emerald-600'
              }`}>{complianceResult.score}</p>
              <p className="text-sm text-muted-foreground">Score de Conformité</p>
              <Progress 
                value={complianceResult.score} 
                className={`h-2 mt-2 ${
                  criticalAlerts.length > 0 ? '[&>div]:bg-red-500' :
                  warningAlerts.length > 0 ? '[&>div]:bg-amber-500' :
                  ''
                }`}
              />
              {complianceResult.hasGovernanceIssue && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Plafonné à 50 (Art. 2)
                </p>
              )}
            </div>

            {/* Alert Summary */}
            <div className="text-center">
              <div className="flex justify-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-red-500">{criticalAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Critiques</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-2xl font-bold text-amber-500">{warningAlerts.length}</p>
                  <p className="text-xs text-muted-foreground">Avertissements</p>
                </div>
              </div>
            </div>

            {/* Last Check */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Dernière vérification</p>
              <p className="font-medium">
                {new Date(complianceResult.timestamp).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Corrective Actions Button */}
          {complianceResult.score < 100 && onNavigateToActions && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <Button 
                variant="outline" 
                className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20"
                onClick={onNavigateToActions}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Voir les actions correctives
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environmental ROI Card */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Leaf className="h-5 w-5" />
            ROI Environnemental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/60">
              <p className="text-2xl font-bold text-emerald-600">
                {formatNumber(envROI.totalCO2Avoided)}
              </p>
              <p className="text-xs text-muted-foreground">tCO₂e Évitées</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60">
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(envROI.totalInvestment)}
              </p>
              <p className="text-xs text-muted-foreground">TND Investis</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60">
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(envROI.totalSavings)}
              </p>
              <p className="text-xs text-muted-foreground">TND Économisés</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60">
              {renderROIValue()}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            <Info className="h-3 w-3 inline mr-1" />
            ROI = ((Économies - Investissements) / Investissements) × 100 | Prix carbone : 80 TND/tCO₂e
          </p>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertes Critiques ({criticalAlerts.length})
          </h3>
          {criticalAlerts.map(alert => (
            <Alert key={alert.id} variant="destructive">
              <ShieldX className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {alert.title}
                <Badge variant="outline" className="ml-2 text-xs">
                  {alert.regulation}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>{alert.description}</p>
                {alert.requiredAction && (
                  <p className="text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    → Action requise : {alert.requiredAction}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Avertissements ({warningAlerts.length})
          </h3>
          {warningAlerts.map(alert => (
            <Alert key={alert.id} className="border-amber-200 bg-amber-50/50">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <AlertTitle className="flex items-center justify-between text-amber-700">
                {alert.title}
                <Badge variant="outline" className="ml-2 text-xs border-amber-300">
                  {alert.regulation}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2 text-amber-900/80">
                <p>{alert.description}</p>
                {alert.threshold !== undefined && alert.currentValue !== undefined && (
                  <div className="flex items-center gap-4 text-sm">
                    <span>Seuil : {alert.threshold}</span>
                    <span>Actuel : {alert.currentValue.toFixed(1)}</span>
                  </div>
                )}
                {alert.requiredAction && (
                  <p className="text-sm font-medium bg-amber-100 p-2 rounded">
                    → Recommandation : {alert.requiredAction}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* No Alerts Message */}
      {complianceResult.alerts.length === 0 && (
        <Alert className="border-emerald-200 bg-emerald-50/50">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <AlertTitle className="text-emerald-700">Conformité validée</AlertTitle>
          <AlertDescription className="text-emerald-600">
            Aucune alerte de conformité détectée. Votre entreprise respecte les seuils réglementaires BVMT et les directives de la Loi RSE 2018-35.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default RSEComplianceAlerts;

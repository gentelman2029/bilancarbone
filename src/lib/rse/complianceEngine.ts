// RSE Compliance Engine - BVMT & Regulatory Compliance Checks
// Validates emission thresholds and generates non-conformity warnings

import { RSEAction } from './types';

export type ComplianceLevel = 'conformant' | 'warning' | 'critical';

export interface ComplianceAlert {
  id: string;
  level: ComplianceLevel;
  title: string;
  description: string;
  regulation: string;
  threshold?: number;
  currentValue?: number;
  requiredAction?: string;
}

// BVMT ESG Reporting Thresholds (configurable defaults)
export interface ComplianceThresholds {
  // Environmental thresholds
  maxEmissionsIntensity: number; // tCO2e / M TND revenue
  maxWaterIntensity: number; // m³ / M TND revenue
  minRenewableEnergyPct: number; // % of total energy
  
  // Social thresholds
  minTrainingHours: number; // hours per employee
  maxAccidentRate: number; // accidents per 100 employees
  minWomenManagementPct: number; // % women in management
  
  // Governance thresholds
  minBoardIndependence: number; // % independent members
  minAuditCommitteeMeetings: number; // per year
  
  // Action thresholds
  minActionCompletionRate: number; // % of actions completed
  maxBlockedActionsRatio: number; // % of actions blocked
}

// Default thresholds based on BVMT guidelines and Tunisian best practices
export const DEFAULT_COMPLIANCE_THRESHOLDS: ComplianceThresholds = {
  // Environmental
  maxEmissionsIntensity: 50, // tCO2e per M TND
  maxWaterIntensity: 500, // m³ per M TND
  minRenewableEnergyPct: 10, // 10% renewable by 2025
  
  // Social
  minTrainingHours: 20, // 20h per employee
  maxAccidentRate: 5, // max 5 accidents per 100 employees
  minWomenManagementPct: 25, // 25% women in leadership
  
  // Governance
  minBoardIndependence: 30, // 30% independent
  minAuditCommitteeMeetings: 4, // quarterly
  
  // Action plan
  minActionCompletionRate: 50, // at least 50% actions done
  maxBlockedActionsRatio: 20, // max 20% blocked
};

export interface ComplianceCheckResult {
  overallLevel: ComplianceLevel;
  alerts: ComplianceAlert[];
  score: number; // 0-100
  timestamp: string;
}

/**
 * Check compliance based on actions and ESG data
 */
export function checkCompliance(
  actions: RSEAction[],
  esgData: {
    emissionsIntensity?: number;
    waterIntensity?: number;
    renewableEnergyPct?: number;
    trainingHours?: number;
    accidentRate?: number;
    womenManagementPct?: number;
    boardIndependence?: number;
    auditMeetings?: number;
    totalCO2Emissions?: number;
  },
  thresholds: ComplianceThresholds = DEFAULT_COMPLIANCE_THRESHOLDS
): ComplianceCheckResult {
  const alerts: ComplianceAlert[] = [];
  let criticalCount = 0;
  let warningCount = 0;

  // Action Plan Compliance
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'done').length;
  const blockedActions = actions.filter(a => a.status === 'blocked').length;
  const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  const blockedRatio = totalActions > 0 ? (blockedActions / totalActions) * 100 : 0;

  // Check action completion rate
  if (completionRate < thresholds.minActionCompletionRate && totalActions > 0) {
    const isCritical = completionRate < thresholds.minActionCompletionRate / 2;
    alerts.push({
      id: 'action_completion',
      level: isCritical ? 'critical' : 'warning',
      title: 'Taux de réalisation insuffisant',
      description: `Le plan d'actions RSE affiche un taux de réalisation de ${completionRate.toFixed(0)}%, inférieur au seuil de ${thresholds.minActionCompletionRate}%.`,
      regulation: 'Loi RSE 2018-35 - Plan d\'actions',
      threshold: thresholds.minActionCompletionRate,
      currentValue: completionRate,
      requiredAction: 'Accélérer la mise en œuvre des actions prioritaires et débloquer les actions en attente.',
    });
    if (isCritical) criticalCount++;
    else warningCount++;
  }

  // Check blocked actions ratio
  if (blockedRatio > thresholds.maxBlockedActionsRatio && totalActions > 0) {
    alerts.push({
      id: 'blocked_actions',
      level: 'warning',
      title: 'Trop d\'actions bloquées',
      description: `${blockedRatio.toFixed(0)}% des actions sont bloquées, dépassant le seuil de ${thresholds.maxBlockedActionsRatio}%.`,
      regulation: 'Gouvernance RSE - Efficacité opérationnelle',
      threshold: thresholds.maxBlockedActionsRatio,
      currentValue: blockedRatio,
      requiredAction: 'Identifier et lever les obstacles bloquant ces actions.',
    });
    warningCount++;
  }

  // Environmental Compliance Checks
  if (esgData.emissionsIntensity !== undefined) {
    if (esgData.emissionsIntensity > thresholds.maxEmissionsIntensity) {
      const isCritical = esgData.emissionsIntensity > thresholds.maxEmissionsIntensity * 2;
      alerts.push({
        id: 'emissions_intensity',
        level: isCritical ? 'critical' : 'warning',
        title: 'Intensité carbone excessive',
        description: `Intensité de ${esgData.emissionsIntensity.toFixed(1)} tCO₂e/M TND dépasse le seuil BVMT de ${thresholds.maxEmissionsIntensity} tCO₂e/M TND.`,
        regulation: 'Guide BVMT - Reporting extra-financier',
        threshold: thresholds.maxEmissionsIntensity,
        currentValue: esgData.emissionsIntensity,
        requiredAction: 'Mettre en place un plan de réduction des émissions avec objectifs chiffrés.',
      });
      if (isCritical) criticalCount++;
      else warningCount++;
    }
  }

  // Check if high emissions without corrective actions
  if (esgData.totalCO2Emissions !== undefined && esgData.totalCO2Emissions > 1000) {
    const hasCorrectiveActions = actions.some(a => 
      a.category === 'E' && 
      a.impactMetrics.co2ReductionTarget !== undefined &&
      a.impactMetrics.co2ReductionTarget > 0
    );
    
    if (!hasCorrectiveActions) {
      alerts.push({
        id: 'no_corrective_actions',
        level: 'critical',
        title: 'Risque de non-conformité BVMT',
        description: `Émissions totales de ${esgData.totalCO2Emissions.toLocaleString('fr-FR')} tCO₂e sans actions correctives définies dans le plan RSE.`,
        regulation: 'Directive BVMT - Exigences de transition climatique',
        threshold: 0,
        currentValue: esgData.totalCO2Emissions,
        requiredAction: 'Définir des actions de réduction carbone avec objectifs mesurables (tCO₂e économisées).',
      });
      criticalCount++;
    }
  }

  if (esgData.renewableEnergyPct !== undefined && esgData.renewableEnergyPct < thresholds.minRenewableEnergyPct) {
    alerts.push({
      id: 'renewable_energy',
      level: 'warning',
      title: 'Part d\'énergie renouvelable insuffisante',
      description: `${esgData.renewableEnergyPct.toFixed(1)}% d'énergie renouvelable, inférieur à l'objectif de ${thresholds.minRenewableEnergyPct}%.`,
      regulation: 'ANME - Transition énergétique',
      threshold: thresholds.minRenewableEnergyPct,
      currentValue: esgData.renewableEnergyPct,
      requiredAction: 'Investir dans des installations solaires ou souscrire à des contrats d\'électricité verte.',
    });
    warningCount++;
  }

  // Social Compliance Checks
  if (esgData.trainingHours !== undefined && esgData.trainingHours < thresholds.minTrainingHours) {
    alerts.push({
      id: 'training_hours',
      level: 'warning',
      title: 'Formation insuffisante',
      description: `${esgData.trainingHours}h de formation par employé, en dessous du minimum recommandé de ${thresholds.minTrainingHours}h.`,
      regulation: 'Code du Travail - Formation professionnelle',
      threshold: thresholds.minTrainingHours,
      currentValue: esgData.trainingHours,
      requiredAction: 'Développer le plan de formation et suivre les heures par collaborateur.',
    });
    warningCount++;
  }

  if (esgData.accidentRate !== undefined && esgData.accidentRate > thresholds.maxAccidentRate) {
    const isCritical = esgData.accidentRate > thresholds.maxAccidentRate * 2;
    alerts.push({
      id: 'accident_rate',
      level: isCritical ? 'critical' : 'warning',
      title: 'Taux d\'accidents préoccupant',
      description: `Taux de ${esgData.accidentRate.toFixed(1)} accidents/100 employés dépasse le seuil de ${thresholds.maxAccidentRate}.`,
      regulation: 'Sécurité au Travail - Inspection du Travail',
      threshold: thresholds.maxAccidentRate,
      currentValue: esgData.accidentRate,
      requiredAction: 'Renforcer les mesures de prévention et former les équipes à la sécurité.',
    });
    if (isCritical) criticalCount++;
    else warningCount++;
  }

  if (esgData.womenManagementPct !== undefined && esgData.womenManagementPct < thresholds.minWomenManagementPct) {
    alerts.push({
      id: 'women_management',
      level: 'warning',
      title: 'Représentation féminine à améliorer',
      description: `${esgData.womenManagementPct.toFixed(0)}% de femmes aux postes de direction, objectif: ${thresholds.minWomenManagementPct}%.`,
      regulation: 'BVMT - Indicateurs de diversité',
      threshold: thresholds.minWomenManagementPct,
      currentValue: esgData.womenManagementPct,
      requiredAction: 'Mettre en place une politique de promotion de la diversité.',
    });
    warningCount++;
  }

  // Governance Compliance Checks
  if (esgData.boardIndependence !== undefined && esgData.boardIndependence < thresholds.minBoardIndependence) {
    alerts.push({
      id: 'board_independence',
      level: 'warning',
      title: 'Indépendance du conseil insuffisante',
      description: `${esgData.boardIndependence.toFixed(0)}% d'administrateurs indépendants, minimum requis: ${thresholds.minBoardIndependence}%.`,
      regulation: 'CMF - Gouvernance d\'entreprise',
      threshold: thresholds.minBoardIndependence,
      currentValue: esgData.boardIndependence,
      requiredAction: 'Recruter des administrateurs indépendants au conseil.',
    });
    warningCount++;
  }

  // Calculate overall compliance score
  const totalChecks = 10; // Maximum number of checks
  const passedChecks = totalChecks - (criticalCount * 2) - warningCount;
  const score = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

  // Determine overall level
  let overallLevel: ComplianceLevel = 'conformant';
  if (criticalCount > 0) {
    overallLevel = 'critical';
  } else if (warningCount > 2) {
    overallLevel = 'warning';
  }

  return {
    overallLevel,
    alerts,
    score,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate Environmental ROI (TND saved per tCO2e avoided)
 */
export function calculateEnvironmentalROI(actions: RSEAction[]): {
  totalInvestment: number;
  totalCO2Avoided: number;
  roiPerTonne: number;
  tndSavedPerTonne: number;
} {
  const completedActions = actions.filter(a => a.status === 'done' && a.category === 'E');
  
  const totalInvestment = completedActions.reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0);
  const totalCO2Avoided = completedActions.reduce((sum, a) => sum + (a.impactMetrics.co2ReductionTarget || 0), 0);
  
  // Assume average carbon price of 80 TND/tCO2e (aligned with future EU ETS projections)
  const carbonPricePerTonne = 80; // TND
  const tndSavedPerTonne = totalCO2Avoided > 0 ? (totalCO2Avoided * carbonPricePerTonne) / totalCO2Avoided : 0;
  
  // ROI = (Savings - Investment) / Investment
  const savings = totalCO2Avoided * carbonPricePerTonne;
  const roiPerTonne = totalInvestment > 0 ? ((savings - totalInvestment) / totalInvestment) * 100 : 0;

  return {
    totalInvestment,
    totalCO2Avoided,
    roiPerTonne,
    tndSavedPerTonne: carbonPricePerTonne, // TND value per tonne
  };
}

/**
 * Get compliance level color
 */
export function getComplianceLevelConfig(level: ComplianceLevel): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (level) {
    case 'conformant':
      return {
        label: 'Conforme',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        icon: '✓',
      };
    case 'warning':
      return {
        label: 'Attention requise',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        icon: '⚠',
      };
    case 'critical':
      return {
        label: 'Non-conformité',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '✗',
      };
  }
}

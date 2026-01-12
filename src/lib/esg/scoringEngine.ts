// ESG Scoring Engine for Tunisia BVMT Standard

import { ESGCategory, ESGData, ESGIndicator, ESG_GRADES, MaterialityPoint, ComplianceAlert } from './types';

// Sector-specific weight multipliers for water-intensive sectors
const SECTOR_WEIGHT_MULTIPLIERS: Record<string, Record<string, number>> = {
  textile: {
    E4: 1.5, // Water consumption
    E5: 1.5, // Water recycling
    E9: 1.5, // Waste production
    E10: 1.5, // Waste valorization
  },
  agroalimentaire: {
    E4: 1.5,
    E5: 1.5,
    E9: 1.5,
    E10: 1.5,
  },
};

// Benchmark thresholds for scoring (Tunisian context)
const INDICATOR_BENCHMARKS: Record<string, { min: number; max: number; optimal: number; inverse?: boolean }> = {
  // Environment - lower is better for consumption metrics
  E1: { min: 10000, max: 10000000, optimal: 50000, inverse: true },
  E2: { min: 0.001, max: 0.5, optimal: 0.01, inverse: true },
  E3: { min: 0, max: 100, optimal: 50 },
  E4: { min: 100, max: 500000, optimal: 5000, inverse: true },
  E5: { min: 0, max: 100, optimal: 30 },
  E6: { min: 10, max: 50000, optimal: 500, inverse: true },
  E7: { min: 10, max: 30000, optimal: 300, inverse: true },
  E8: { min: 0.1, max: 100, optimal: 5, inverse: true },
  E9: { min: 1, max: 10000, optimal: 100, inverse: true },
  E10: { min: 0, max: 100, optimal: 50 },
  E11: { min: 0, max: 10000000, optimal: 500000 },
  // Social
  S1: { min: 10, max: 10000, optimal: 500 },
  S2: { min: 0, max: 100, optimal: 50 },
  S3: { min: 0, max: 50, optimal: 0, inverse: true },
  S4: { min: 0, max: 50, optimal: 5, inverse: true },
  S5: { min: 0, max: 20, optimal: 2, inverse: true },
  S6: { min: 0, max: 50, optimal: 0, inverse: true },
  S7: { min: 0, max: 100, optimal: 40 },
  S8: { min: 0, max: 10, optimal: 3 },
  S9: { min: 0, max: 24, optimal: 12 },
  S10: { min: 0, max: 100, optimal: 0, inverse: true },
  S11: { min: 0, max: 100, optimal: 80 },
  S12: { min: 0, max: 1000000, optimal: 100000 },
  // Governance
  G1: { min: 0, max: 100, optimal: 40 },
  G2: { min: 0, max: 100, optimal: 50 },
  G6: { min: 0, max: 50000000, optimal: 5000000 },
  G9: { min: 0, max: 100, optimal: 70 },
};

/**
 * Calculate automatic KPIs (E2 - Energy Intensity, E8 - Carbon Intensity)
 */
export function calculateAutomaticKPIs(categories: ESGCategory[], revenue: number): ESGCategory[] {
  if (!revenue || revenue <= 0) return categories;

  return categories.map(category => {
    if (category.id !== 'E') return category;

    const indicators = category.indicators.map(indicator => {
      if (indicator.id === 'E2') {
        // Energy Intensity = E1 / Revenue
        const e1 = category.indicators.find(i => i.id === 'E1')?.value as number || 0;
        return { ...indicator, value: revenue > 0 ? e1 / revenue : 0 };
      }
      if (indicator.id === 'E8') {
        // Carbon Intensity = (E6 + E7) / (Revenue / 1000000)
        const e6 = category.indicators.find(i => i.id === 'E6')?.value as number || 0;
        const e7 = category.indicators.find(i => i.id === 'E7')?.value as number || 0;
        const revenueInMillions = revenue / 1000000;
        return { ...indicator, value: revenueInMillions > 0 ? (e6 + e7) / revenueInMillions : 0 };
      }
      return indicator;
    });

    return { ...category, indicators };
  });
}

/**
 * Calculate individual indicator score (0-100)
 */
function calculateIndicatorScore(indicator: ESGIndicator, sectorMultiplier: number = 1): number {
  if (indicator.type === 'binary') {
    return (indicator.value === true) ? 100 : 0;
  }

  if (indicator.type === 'calculated' || indicator.type === 'numeric') {
    const value = indicator.value as number;
    if (value === undefined || value === null) return 0;

    const benchmark = INDICATOR_BENCHMARKS[indicator.id];
    if (!benchmark) return 50; // Default middle score if no benchmark

    let score: number;
    if (benchmark.inverse) {
      // Lower is better
      if (value <= benchmark.optimal) {
        score = 100;
      } else if (value >= benchmark.max) {
        score = 0;
      } else {
        score = 100 - ((value - benchmark.optimal) / (benchmark.max - benchmark.optimal)) * 100;
      }
    } else {
      // Higher is better
      if (value >= benchmark.optimal) {
        score = 100;
      } else if (value <= benchmark.min) {
        score = 0;
      } else {
        score = ((value - benchmark.min) / (benchmark.optimal - benchmark.min)) * 100;
      }
    }

    return Math.max(0, Math.min(100, score * sectorMultiplier));
  }

  return 0;
}

/**
 * Calculate category score (E, S, or G)
 */
export function calculateCategoryScore(category: ESGCategory, sector: string): number {
  const sectorMultipliers = SECTOR_WEIGHT_MULTIPLIERS[sector] || {};
  let totalWeight = 0;
  let weightedScore = 0;

  category.indicators.forEach(indicator => {
    const multiplier = sectorMultipliers[indicator.id] || 1;
    const indicatorWeight = indicator.weight || 1;
    const score = calculateIndicatorScore(indicator, 1);
    
    weightedScore += score * indicatorWeight * multiplier;
    totalWeight += indicatorWeight * multiplier;
  });

  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

/**
 * Calculate total ESG score with custom weights
 */
export function calculateTotalScore(
  categories: ESGCategory[], 
  sector: string,
  customWeights?: { e: number; s: number; g: number }
): {
  totalScore: number;
  categoryScores: Record<string, number>;
  grade: string;
  gradeColor: string;
  gradeLabel: string;
} {
  const categoryScores: Record<string, number> = {};
  let totalScore = 0;

  // Use custom weights if provided, otherwise use default from schema
  const weights: Record<string, number> = customWeights 
    ? { E: customWeights.e / 100, S: customWeights.s / 100, G: customWeights.g / 100 }
    : {};

  categories.forEach(category => {
    const score = calculateCategoryScore(category, sector);
    categoryScores[category.id] = score;
    
    // Use custom weight or default category weight
    const weight = weights[category.id] !== undefined ? weights[category.id] : category.weight;
    totalScore += score * weight;
  });

  // Determine grade
  const gradeInfo = ESG_GRADES.find(g => totalScore >= g.min) || ESG_GRADES[ESG_GRADES.length - 1];

  return {
    totalScore,
    categoryScores,
    grade: gradeInfo.grade,
    gradeColor: gradeInfo.color,
    gradeLabel: gradeInfo.label,
  };
}

/**
 * Generate Double Materiality Matrix data
 */
export function generateMaterialityMatrix(categories: ESGCategory[]): MaterialityPoint[] {
  const materialityMap: Record<string, { envImpact: number; finRisk: number; cat: 'E' | 'S' | 'G' }> = {
    // Environment
    E1: { envImpact: 75, finRisk: 60, cat: 'E' },
    E3: { envImpact: 65, finRisk: 55, cat: 'E' },
    E4: { envImpact: 85, finRisk: 80, cat: 'E' }, // Water stress - critical for Tunisia
    E6: { envImpact: 90, finRisk: 85, cat: 'E' }, // Direct emissions - MACF exposure
    E7: { envImpact: 80, finRisk: 75, cat: 'E' },
    E9: { envImpact: 70, finRisk: 50, cat: 'E' },
    E10: { envImpact: 60, finRisk: 45, cat: 'E' },
    E11: { envImpact: 50, finRisk: 30, cat: 'E' },
    // Social
    S2: { envImpact: 20, finRisk: 55, cat: 'S' },
    S3: { envImpact: 15, finRisk: 65, cat: 'S' },
    S4: { envImpact: 10, finRisk: 70, cat: 'S' },
    S6: { envImpact: 25, finRisk: 80, cat: 'S' },
    S7: { envImpact: 15, finRisk: 45, cat: 'S' },
    // Governance
    G1: { envImpact: 30, finRisk: 50, cat: 'G' },
    G2: { envImpact: 25, finRisk: 60, cat: 'G' },
    G5: { envImpact: 20, finRisk: 85, cat: 'G' },
    G9: { envImpact: 40, finRisk: 55, cat: 'G' },
  };

  const points: MaterialityPoint[] = [];

  categories.forEach(category => {
    category.indicators.forEach(indicator => {
      const mapping = materialityMap[indicator.id];
      if (mapping && indicator.value !== undefined) {
        points.push({
          id: indicator.id,
          label: indicator.label,
          environmentalImpact: mapping.envImpact,
          financialRisk: mapping.finRisk,
          category: mapping.cat,
        });
      }
    });
  });

  return points;
}

/**
 * Generate compliance alerts based on data
 */
export function generateComplianceAlerts(data: ESGData, categoryScores: Record<string, number>): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];

  // Check MACF exposure (Carbon Border Adjustment Mechanism)
  const e6 = data.categories.find(c => c.id === 'E')?.indicators.find(i => i.id === 'E6')?.value as number || 0;
  const e7 = data.categories.find(c => c.id === 'E')?.indicators.find(i => i.id === 'E7')?.value as number || 0;
  const totalEmissions = e6 + e7;

  if (totalEmissions > 1000) {
    alerts.push({
      id: 'macf-exposure',
      type: 'warning',
      title: 'Exposition MACF Significative',
      description: `Vos émissions (${totalEmissions.toFixed(0)} tCO₂e) vous exposent au Mécanisme d'Ajustement Carbone aux Frontières de l'UE.`,
      regulation: 'Règlement UE 2023/956 - MACF',
      action: 'Préparer un plan de décarbonation pour réduire l\'exposition.',
    });
  }

  // Check Tunisian RSE Law compliance
  const hasCSRCommittee = data.categories.find(c => c.id === 'G')?.indicators.find(i => i.id === 'G4')?.value === true;
  const hasEthicsCode = data.categories.find(c => c.id === 'G')?.indicators.find(i => i.id === 'G5')?.value === true;

  if (!hasCSRCommittee || !hasEthicsCode) {
    alerts.push({
      id: 'rse-tunisia',
      type: 'error',
      title: 'Non-conformité Loi RSE Tunisie',
      description: 'La Loi 2018-35 exige un comité RSE et un code éthique pour les grandes entreprises.',
      regulation: 'Loi tunisienne 2018-35 (RSE)',
      action: 'Mettre en place les structures de gouvernance requises.',
    });
  }

  // Check water stress (critical for Tunisia)
  const waterConsumption = data.categories.find(c => c.id === 'E')?.indicators.find(i => i.id === 'E4')?.value as number || 0;
  const waterRecycling = data.categories.find(c => c.id === 'E')?.indicators.find(i => i.id === 'E5')?.value as number || 0;

  if (waterConsumption > 10000 && waterRecycling < 20) {
    alerts.push({
      id: 'water-stress',
      type: 'warning',
      title: 'Stress Hydrique Critique',
      description: `Consommation d'eau élevée (${waterConsumption.toLocaleString()} m³) avec faible recyclage (${waterRecycling}%).`,
      regulation: 'Plan National de l\'Eau Tunisie 2050',
      action: 'Investir dans des technologies de recyclage de l\'eau.',
    });
  }

  // Check gender equality
  const genderPayGap = data.categories.find(c => c.id === 'S')?.indicators.find(i => i.id === 'S3')?.value as number || 0;
  if (genderPayGap > 15) {
    alerts.push({
      id: 'gender-equality',
      type: 'info',
      title: 'Écart Salarial H/F Notable',
      description: `L'écart de ${genderPayGap}% dépasse les bonnes pratiques CSRD (<15%).`,
      regulation: 'Directive CSRD - Égalité de genre',
      action: 'Analyser et corriger les écarts de rémunération.',
    });
  }

  // Success alerts
  if (categoryScores.E >= 70) {
    alerts.push({
      id: 'env-performance',
      type: 'success',
      title: 'Performance Environnementale Excellente',
      description: `Score E de ${categoryScores.E.toFixed(0)}/100 - Éligible aux crédits verts BCT.`,
      regulation: 'Circulaire BCT 2023-08',
    });
  }

  return alerts;
}

/**
 * Generate sector benchmarks for Tunisia
 */
export function getSectorBenchmarks(): Record<string, {
  avgScore: number;
  topScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
}> {
  return {
    textile: { avgScore: 52, topScore: 78, eScore: 48, sScore: 55, gScore: 54 },
    agroalimentaire: { avgScore: 55, topScore: 82, eScore: 52, sScore: 58, gScore: 56 },
    chimie: { avgScore: 48, topScore: 75, eScore: 42, sScore: 52, gScore: 50 },
    mecanique: { avgScore: 50, topScore: 76, eScore: 46, sScore: 53, gScore: 52 },
    electronique: { avgScore: 58, topScore: 85, eScore: 55, sScore: 60, gScore: 60 },
    materiaux: { avgScore: 45, topScore: 72, eScore: 38, sScore: 50, gScore: 48 },
    services: { avgScore: 62, topScore: 88, eScore: 65, sScore: 62, gScore: 60 },
    banque: { avgScore: 65, topScore: 90, eScore: 70, sScore: 65, gScore: 62 },
    energie: { avgScore: 42, topScore: 70, eScore: 35, sScore: 48, gScore: 45 },
    tourisme: { avgScore: 53, topScore: 79, eScore: 50, sScore: 56, gScore: 54 },
  };
}

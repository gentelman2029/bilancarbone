// ESG Scoring Engine for Tunisia BVMT Standard - 32 KPIs

import { ESGCategory, ESGData, ESGIndicator, ESG_GRADES, MaterialityPoint, ComplianceAlert } from './types';

// Sector-specific weight multipliers
const SECTOR_WEIGHT_MULTIPLIERS: Record<string, Record<string, number>> = {
  textile: {
    'E4.1': 1.5, 'E4.2': 1.5, 'E9': 1.5, 'E10': 1.5,
  },
  agroalimentaire: {
    'E4.1': 1.5, 'E4.2': 1.5, 'E9': 1.5, 'E10': 1.5,
  },
};

// Benchmark thresholds for numeric indicators
const INDICATOR_BENCHMARKS: Record<string, { min: number; max: number; optimal: number; inverse?: boolean }> = {
  // Environment
  'E1.1': { min: 10000, max: 10000000, optimal: 50000, inverse: true },
  'E1.2': { min: 0, max: 5000000, optimal: 10000, inverse: true },
  'E2.1': { min: 0.001, max: 0.5, optimal: 0.01, inverse: true },
  'E2.2': { min: 0, max: 1000000, optimal: 100000 },
  'E3': { min: 0, max: 100, optimal: 50 },
  'E4.1': { min: 100, max: 500000, optimal: 5000, inverse: true },
  'E4.2': { min: 0, max: 100, optimal: 30 },
  'E5.1': { min: 10, max: 50000, optimal: 500, inverse: true },
  'E5.2': { min: 10, max: 30000, optimal: 300, inverse: true },
  'E5.3': { min: 0, max: 100000, optimal: 1000, inverse: true },
  'E6': { min: 0.1, max: 100, optimal: 5, inverse: true },
  'E9': { min: 1, max: 10000, optimal: 100, inverse: true },
  'E10': { min: 0, max: 100000, optimal: 10000, inverse: true },
  // Social
  'S1': { min: 50, max: 150, optimal: 100 }, // 100% = equal pay
  'S2.1': { min: 10, max: 10000, optimal: 500 },
  'S2.2': { min: 0, max: 100, optimal: 20 },
  'S2.3': { min: 0, max: 50, optimal: 5, inverse: true },
  'S3': { min: 0, max: 100, optimal: 50 },
  'S5.2': { min: 0, max: 50, optimal: 0, inverse: true },
  'S9.1': { min: 0, max: 100, optimal: 40 },
  'S9.2': { min: 0, max: 50, optimal: 10 },
  'S10.2': { min: 0, max: 10, optimal: 2 },
  // Governance
  'G1.1': { min: 0, max: 100, optimal: 40 },
  'G1.2': { min: 0, max: 100, optimal: 30 },
  'G2.2': { min: 0, max: 100, optimal: 50 },
  'G4': { min: 0, max: 100, optimal: 70 },
  'G5.3': { min: 0, max: 100, optimal: 50 },
  'G6.2': { min: 0, max: 100, optimal: 50 },
  'G8': { min: 0, max: 100, optimal: 70 },
  'G9.2': { min: 0, max: 24, optimal: 12 },
  'G10.1': { min: 0, max: 50, optimal: 10 },
  'G10.2': { min: 0, max: 50, optimal: 15 },
  'G10.3': { min: 0, max: 120, optimal: 30, inverse: true },
};

/**
 * Auto-populate ESG indicators from calculator/dashboard data stored in localStorage
 */
export function autoPopulateFromCalculator(categories: ESGCategory[]): ESGCategory[] {
  try {
    // Read emissions from localStorage (same keys used by the calculator)
    const emissionsRaw = localStorage.getItem('emissions-data');
    const emissions = emissionsRaw ? JSON.parse(emissionsRaw) : null;

    // Also check calculation-section-details
    const detailsRaw = localStorage.getItem('calculation-section-details');
    const details = detailsRaw ? JSON.parse(detailsRaw) : null;

    let scope1 = 0, scope2 = 0, scope3 = 0;

    if (emissions) {
      scope1 = parseFloat(emissions.scope1) || 0;
      scope2 = parseFloat(emissions.scope2) || 0;
      scope3 = parseFloat(emissions.scope3) || 0;
    }

    // Fallback: check detailed entries
    if (details && Array.isArray(details)) {
      const s1 = details.filter((d: any) => d.scope === 'scope1' || d.scope === 'Scope 1');
      const s2 = details.filter((d: any) => d.scope === 'scope2' || d.scope === 'Scope 2');
      const s3 = details.filter((d: any) => d.scope === 'scope3' || d.scope === 'Scope 3');
      
      const sumEntries = (entries: any[]) => entries.reduce((sum, e) => {
        const val = parseFloat(e.emissions) || parseFloat(e.total) || 0;
        return sum + val;
      }, 0);

      if (scope1 === 0 && s1.length > 0) scope1 = sumEntries(s1);
      if (scope2 === 0 && s2.length > 0) scope2 = sumEntries(s2);
      if (scope3 === 0 && s3.length > 0) scope3 = sumEntries(s3);
    }

    const autoValues: Record<string, number> = {
      scope1, scope2, scope3,
    };

    return categories.map(category => ({
      ...category,
      indicators: category.indicators.map(indicator => {
        if (!indicator.autoPopulate) return indicator;
        const autoVal = autoValues[indicator.autoPopulate];
        if (autoVal !== undefined && autoVal > 0) {
          return { ...indicator, value: autoVal };
        }
        return indicator;
      }),
    }));
  } catch {
    return categories;
  }
}

/**
 * Calculate automatic KPIs (E2.1 - Energy Intensity, E6 - Carbon Intensity)
 */
export function calculateAutomaticKPIs(categories: ESGCategory[], revenue: number): ESGCategory[] {
  if (!revenue || revenue <= 0) return categories;

  return categories.map(category => {
    if (category.id !== 'E') return category;

    const getVal = (id: string) => {
      const ind = category.indicators.find(i => i.id === id);
      return typeof ind?.value === 'number' ? ind.value : 0;
    };

    const indicators = category.indicators.map(indicator => {
      if (indicator.id === 'E2.1') {
        const e11 = getVal('E1.1');
        return { ...indicator, value: revenue > 0 ? e11 / revenue : 0 };
      }
      if (indicator.id === 'E6') {
        const scope1 = getVal('E5.1');
        const scope2 = getVal('E5.2');
        const revenueInMillions = (revenue * 1000) / 1000000; // kTND to millions TND
        return { ...indicator, value: revenueInMillions > 0 ? (scope1 + scope2) / revenueInMillions : 0 };
      }
      return indicator;
    });

    return { ...category, indicators };
  });
}

/**
 * Calculate individual indicator score (0-100)
 */
function calculateIndicatorScore(indicator: ESGIndicator): number {
  if (indicator.type === 'binary') {
    return (indicator.value === true) ? 100 : 0;
  }

  if (indicator.type === 'text') {
    return (indicator.value && String(indicator.value).length > 0) ? 100 : 0;
  }

  if (indicator.type === 'calculated' || indicator.type === 'numeric') {
    const value = indicator.value as number;
    if (value === undefined || value === null || value === 0) return 0;

    const benchmark = INDICATOR_BENCHMARKS[indicator.id];
    if (!benchmark) return 50;

    let score: number;
    if (benchmark.inverse) {
      if (value <= benchmark.optimal) score = 100;
      else if (value >= benchmark.max) score = 0;
      else score = 100 - ((value - benchmark.optimal) / (benchmark.max - benchmark.optimal)) * 100;
    } else {
      if (value >= benchmark.optimal) score = 100;
      else if (value <= benchmark.min) score = 0;
      else score = ((value - benchmark.min) / (benchmark.optimal - benchmark.min)) * 100;
    }

    return Math.max(0, Math.min(100, score));
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
    const score = calculateIndicatorScore(indicator);
    
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

  const weights: Record<string, number> = customWeights 
    ? { E: customWeights.e / 100, S: customWeights.s / 100, G: customWeights.g / 100 }
    : {};

  categories.forEach(category => {
    const score = calculateCategoryScore(category, sector);
    categoryScores[category.id] = score;
    const weight = weights[category.id] !== undefined ? weights[category.id] : category.weight;
    totalScore += score * weight;
  });

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
    'E1.1': { envImpact: 75, finRisk: 60, cat: 'E' },
    'E3': { envImpact: 65, finRisk: 55, cat: 'E' },
    'E4.1': { envImpact: 85, finRisk: 80, cat: 'E' },
    'E5.1': { envImpact: 90, finRisk: 85, cat: 'E' },
    'E5.2': { envImpact: 80, finRisk: 75, cat: 'E' },
    'E5.3': { envImpact: 70, finRisk: 65, cat: 'E' },
    'E9': { envImpact: 70, finRisk: 50, cat: 'E' },
    'E10': { envImpact: 60, finRisk: 45, cat: 'E' },
    'S1': { envImpact: 20, finRisk: 55, cat: 'S' },
    'S2.3': { envImpact: 15, finRisk: 65, cat: 'S' },
    'S5.2': { envImpact: 10, finRisk: 70, cat: 'S' },
    'S9.1': { envImpact: 15, finRisk: 45, cat: 'S' },
    'G1.1': { envImpact: 30, finRisk: 50, cat: 'G' },
    'G2.2': { envImpact: 25, finRisk: 60, cat: 'G' },
    'G6.1': { envImpact: 20, finRisk: 85, cat: 'G' },
    'G4': { envImpact: 40, finRisk: 55, cat: 'G' },
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
 * Generate compliance alerts
 */
export function generateComplianceAlerts(data: ESGData, categoryScores: Record<string, number>): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];

  const getVal = (catId: string, indId: string) => {
    const cat = data.categories.find(c => c.id === catId);
    const ind = cat?.indicators.find(i => i.id === indId);
    return ind?.value;
  };

  // MACF exposure
  const scope1 = (getVal('E', 'E5.1') as number) || 0;
  const scope2 = (getVal('E', 'E5.2') as number) || 0;
  const totalEmissions = scope1 + scope2;

  if (totalEmissions > 1000) {
    alerts.push({
      id: 'macf-exposure', type: 'warning',
      title: 'Exposition MACF Significative',
      description: `Vos émissions (${totalEmissions.toFixed(0)} tCO₂e) vous exposent au Mécanisme d'Ajustement Carbone aux Frontières de l'UE.`,
      regulation: 'Règlement UE 2023/956 - MACF',
      action: 'Préparer un plan de décarbonation.',
    });
  }

  // Tunisian RSE Law
  const hasEthicsCode = getVal('G', 'G6.1') === true;
  const hasAntiCorruption = getVal('G', 'G6.3') === true;
  const hasESGReport = getVal('G', 'G11') === true;

  if (!hasEthicsCode || !hasAntiCorruption) {
    alerts.push({
      id: 'rse-tunisia', type: 'error',
      title: 'Non-conformité Loi RSE Tunisie',
      description: 'La Loi 2018-35 exige un code d\'éthique et une politique anti-corruption.',
      regulation: 'Loi tunisienne 2018-35 (RSE)',
      action: 'Mettre en place les structures de gouvernance requises.',
    });
  }

  if (!hasESGReport) {
    alerts.push({
      id: 'esg-report-missing', type: 'warning',
      title: 'Rapport RSE-DD non publié',
      description: 'La publication d\'un rapport RSE-DD est recommandée par le Guide BVMT.',
      regulation: 'Guide Reporting ESG BVMT',
      action: 'Préparer et publier un rapport RSE-DD annuel.',
    });
  }

  // Water stress
  const waterConsumption = (getVal('E', 'E4.1') as number) || 0;
  const waterRecycling = (getVal('E', 'E4.2') as number) || 0;

  if (waterConsumption > 10000 && waterRecycling < 20) {
    alerts.push({
      id: 'water-stress', type: 'warning',
      title: 'Stress Hydrique Critique',
      description: `Consommation d'eau élevée (${waterConsumption.toLocaleString()} m³) avec faible recyclage (${waterRecycling}%).`,
      regulation: 'Plan National de l\'Eau Tunisie 2050',
      action: 'Investir dans des technologies de recyclage de l\'eau.',
    });
  }

  // Gender equality
  const genderRatio = (getVal('S', 'S1') as number) || 0;
  if (genderRatio > 0 && Math.abs(genderRatio - 100) > 15) {
    alerts.push({
      id: 'gender-equality', type: 'info',
      title: 'Écart Salarial H/F Notable',
      description: `Le ratio de rémunération H/F (${genderRatio}%) s'écarte de la parité.`,
      regulation: 'Directive CSRD - Égalité de genre',
      action: 'Analyser et corriger les écarts de rémunération.',
    });
  }

  // Success
  if (categoryScores.E >= 70) {
    alerts.push({
      id: 'env-performance', type: 'success',
      title: 'Performance Environnementale Excellente',
      description: `Score E de ${categoryScores.E.toFixed(0)}/100 - Éligible aux crédits verts BCT.`,
      regulation: 'Circulaire BCT 2023-08',
    });
  }

  return alerts;
}

/**
 * Sector benchmarks for Tunisia
 */
export function getSectorBenchmarks(): Record<string, {
  avgScore: number; topScore: number; eScore: number; sScore: number; gScore: number;
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

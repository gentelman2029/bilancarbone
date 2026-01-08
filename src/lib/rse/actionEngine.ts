// RSE Action Engine - Auto-generates suggestions based on ESG scores

import { ESGCategory, ESGIndicator } from '../esg/types';
import { RSEAction } from './types';
import { ACTION_SUGGESTIONS_LIBRARY } from './actionSuggestions';

// Benchmark thresholds matching scoringEngine.ts
const INDICATOR_BENCHMARKS: Record<string, { min: number; max: number; optimal: number; inverse?: boolean }> = {
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
  G1: { min: 0, max: 100, optimal: 40 },
  G2: { min: 0, max: 100, optimal: 50 },
  G6: { min: 0, max: 50000000, optimal: 5000000 },
  G9: { min: 0, max: 100, optimal: 70 },
};

/**
 * Calculate individual indicator score (0-100)
 */
function calculateIndicatorScore(indicator: ESGIndicator): number {
  if (indicator.type === 'binary') {
    return (indicator.value === true) ? 100 : 0;
  }

  if (indicator.type === 'calculated' || indicator.type === 'numeric') {
    const value = indicator.value as number;
    if (value === undefined || value === null) return 0;

    const benchmark = INDICATOR_BENCHMARKS[indicator.id];
    if (!benchmark) return 50;

    let score: number;
    if (benchmark.inverse) {
      if (value <= benchmark.optimal) {
        score = 100;
      } else if (value >= benchmark.max) {
        score = 0;
      } else {
        score = 100 - ((value - benchmark.optimal) / (benchmark.max - benchmark.optimal)) * 100;
      }
    } else {
      if (value >= benchmark.optimal) {
        score = 100;
      } else if (value <= benchmark.min) {
        score = 0;
      } else {
        score = ((value - benchmark.min) / (benchmark.optimal - benchmark.min)) * 100;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  return 0;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate action suggestions based on ESG scores
 */
export function generateActionSuggestions(categories: ESGCategory[]): RSEAction[] {
  const suggestions: RSEAction[] = [];
  const now = new Date().toISOString();

  categories.forEach(category => {
    category.indicators.forEach(indicator => {
      const score = calculateIndicatorScore(indicator);
      
      // Find matching suggestions for low-scoring KPIs
      const matchingLib = ACTION_SUGGESTIONS_LIBRARY.find(
        lib => lib.kpiId === indicator.id && score < lib.threshold
      );

      if (matchingLib) {
        matchingLib.suggestions.forEach(suggestion => {
          suggestions.push({
            ...suggestion,
            id: generateId(),
            status: 'todo',
            createdAt: now,
            updatedAt: now,
            isSuggestion: true,
          });
        });
      }
    });
  });

  return suggestions;
}

/**
 * Calculate CSRD transition progress
 */
export function calculateCSRDProgress(actions: RSEAction[]): number {
  const csrdActions = actions.filter(a => 
    a.legislationRef.some(ref => ref.includes('CSRD'))
  );
  
  if (csrdActions.length === 0) return 0;
  
  const completedCsrd = csrdActions.filter(a => a.status === 'done').length;
  return Math.round((completedCsrd / csrdActions.length) * 100);
}

/**
 * Calculate regional impact actions count
 */
export function countRegionalImpactActions(actions: RSEAction[]): number {
  return actions.filter(a => a.impactMetrics.regionalImpact).length;
}

/**
 * Calculate budget stats
 */
export function calculateBudgetStats(actions: RSEAction[]): { allocated: number; spent: number } {
  const allocated = actions.reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0);
  const spent = actions
    .filter(a => a.status === 'done')
    .reduce((sum, a) => sum + a.impactMetrics.costEstimated, 0);
  
  return { allocated, spent };
}

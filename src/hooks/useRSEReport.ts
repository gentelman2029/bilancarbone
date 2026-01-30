// RSE Report Data Aggregation Hook
// Combines ESG Scoring + Pilotage RSE modules for regulatory compliance

import { useState, useEffect, useMemo, useCallback } from 'react';
import { RSEAction } from '@/lib/rse/types';
import { ESGData, ESGCategory, BVMT_ESG_SCHEMA, TUNISIAN_SECTORS } from '@/lib/esg/types';
import { 
  calculateTotalScore, 
  calculateAutomaticKPIs,
  generateComplianceAlerts,
  getSectorBenchmarks
} from '@/lib/esg/scoringEngine';
import { 
  calculateCSRDProgress, 
  countRegionalImpactActions, 
  calculateBudgetStats 
} from '@/lib/rse/actionEngine';

// Regulatory Framework References
export const REGULATORY_FRAMEWORK = {
  tunisian: [
    { id: 'loi-2018-35', name: 'Loi RSE n°2018-35', description: 'Loi relative à la responsabilité sociétale des entreprises' },
    { id: 'bvmt', name: 'Guide BVMT', description: 'Bourse des Valeurs Mobilières de Tunis - Reporting extra-financier' },
    { id: 'anme', name: 'ANME', description: 'Agence Nationale pour la Maîtrise de l\'Énergie' },
    { id: 'anpe', name: 'ANPE', description: 'Agence Nationale de Protection de l\'Environnement' },
  ],
  international: [
    { id: 'csrd', name: 'CSRD (UE)', description: 'Directive européenne 2022/2464 sur le reporting de durabilité' },
    { id: 'gri', name: 'GRI Standards', description: 'Global Reporting Initiative - Standards de reporting' },
    { id: 'iso-26000', name: 'ISO 26000', description: 'Lignes directrices relatives à la responsabilité sociétale' },
    { id: 'ghg-protocol', name: 'GHG Protocol', description: 'Protocole des gaz à effet de serre' },
  ],
};

export interface ESGScoreResult {
  totalScore: number;
  categoryScores: Record<string, number>;
  grade: string;
  gradeColor: string;
  gradeLabel: string;
}

export interface BudgetStats {
  allocated: number;
  spent: number;
  remaining: number;
  utilizationRate: number;
}

export interface ActionStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  blocked: number;
  completionRate: number;
  byCategory: {
    E: { count: number; completed: number };
    S: { count: number; completed: number };
    G: { count: number; completed: number };
  };
}

export interface RegionalImpactStats {
  actionsCount: number;
  percentage: number;
  co2Reduction: number;
}

export interface SectorBenchmark {
  avgScore: number;
  topScore: number;
  eScore: number;
  sScore: number;
  gScore: number;
  position: 'top10' | 'top25' | 'average' | 'below';
}

export interface RSEReportData {
  // Company Info
  companyName: string;
  sector: string;
  sectorLabel: string;
  fiscalYear: number;
  revenue: number;
  reportGeneratedAt: string;
  
  // ESG Scores (from Scoring ESG module)
  esgScores: ESGScoreResult;
  categories: ESGCategory[];
  weightingConfig: {
    mode: 'standard' | 'sectoriel' | 'expert';
    e: number;
    s: number;
    g: number;
  };
  
  // Benchmark
  benchmark: SectorBenchmark;
  
  // Actions (from Pilotage RSE module)
  actions: RSEAction[];
  actionStats: ActionStats;
  budgetStats: BudgetStats;
  csrdProgress: number;
  regionalImpact: RegionalImpactStats;
  
  // Compliance
  complianceAlerts: ReturnType<typeof generateComplianceAlerts>;
  regulatoryFramework: typeof REGULATORY_FRAMEWORK;
  
  // Methodology
  methodology: {
    scoringFormula: string;
    weights: string;
    dataSource: string;
    limitations: string[];
  };
}

export function useRSEReport(actions: RSEAction[]) {
  const [reportData, setReportData] = useState<RSEReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load ESG Data from localStorage (persisted by ESGDashboard)
  const loadESGData = useCallback((): ESGData => {
    try {
      const stored = localStorage.getItem('esg-dashboard-data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading ESG data:', error);
    }
    
    // Default empty data
    return {
      companyName: '',
      sector: 'services',
      fiscalYear: new Date().getFullYear(),
      revenue: 0,
      categories: JSON.parse(JSON.stringify(BVMT_ESG_SCHEMA)),
    };
  }, []);

  // Load Weighting Config from localStorage
  const loadWeightingConfig = useCallback(() => {
    try {
      const stored = localStorage.getItem('esg-weighting-config');
      if (stored) {
        const config = JSON.parse(stored);
        return {
          mode: config.mode || 'standard',
          e: config.environmentWeight || 33.33,
          s: config.socialWeight || 33.33,
          g: config.governanceWeight || 33.34,
        };
      }
    } catch (error) {
      console.error('Error loading weighting config:', error);
    }
    return { mode: 'standard' as const, e: 33.33, s: 33.33, g: 33.34 };
  }, []);

  // Calculate Action Statistics
  const calculateActionStats = useCallback((actions: RSEAction[]): ActionStats => {
    const total = actions.length;
    const completed = actions.filter(a => a.status === 'done').length;
    const inProgress = actions.filter(a => a.status === 'in_progress').length;
    const todo = actions.filter(a => a.status === 'todo').length;
    const blocked = actions.filter(a => a.status === 'blocked').length;
    
    const byCategory = {
      E: { 
        count: actions.filter(a => a.category === 'E').length,
        completed: actions.filter(a => a.category === 'E' && a.status === 'done').length,
      },
      S: { 
        count: actions.filter(a => a.category === 'S').length,
        completed: actions.filter(a => a.category === 'S' && a.status === 'done').length,
      },
      G: { 
        count: actions.filter(a => a.category === 'G').length,
        completed: actions.filter(a => a.category === 'G' && a.status === 'done').length,
      },
    };

    return {
      total,
      completed,
      inProgress,
      todo,
      blocked,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory,
    };
  }, []);

  // Calculate Budget Statistics
  const calculateBudgetStatsExtended = useCallback((actions: RSEAction[]): BudgetStats => {
    const base = calculateBudgetStats(actions);
    const remaining = base.allocated - base.spent;
    const utilizationRate = base.allocated > 0 ? Math.round((base.spent / base.allocated) * 100) : 0;
    
    return {
      ...base,
      remaining,
      utilizationRate,
    };
  }, []);

  // Calculate Regional Impact
  const calculateRegionalImpact = useCallback((actions: RSEAction[]): RegionalImpactStats => {
    const regionalActions = actions.filter(a => a.impactMetrics.regionalImpact);
    const co2Reduction = actions
      .filter(a => a.status === 'done')
      .reduce((sum, a) => sum + (a.impactMetrics.co2ReductionTarget || 0), 0);
    
    return {
      actionsCount: regionalActions.length,
      percentage: actions.length > 0 ? Math.round((regionalActions.length / actions.length) * 100) : 0,
      co2Reduction,
    };
  }, []);

  // Calculate Sector Benchmark Position
  const calculateBenchmarkPosition = useCallback((totalScore: number, sectorBenchmarks: ReturnType<typeof getSectorBenchmarks>[string]): SectorBenchmark['position'] => {
    if (totalScore >= sectorBenchmarks.topScore) return 'top10';
    if (totalScore >= (sectorBenchmarks.topScore + sectorBenchmarks.avgScore) / 2) return 'top25';
    if (totalScore >= sectorBenchmarks.avgScore) return 'average';
    return 'below';
  }, []);

  // Build Report Data
  const buildReportData = useCallback(() => {
    setIsLoading(true);
    
    try {
      const esgData = loadESGData();
      const weightingConfig = loadWeightingConfig();
      
      // Calculate ESG scores with automatic KPIs
      const updatedCategories = calculateAutomaticKPIs(esgData.categories, esgData.revenue);
      const esgScores = calculateTotalScore(
        updatedCategories, 
        esgData.sector,
        { e: weightingConfig.e, s: weightingConfig.s, g: weightingConfig.g }
      );
      
      // Get sector benchmark
      const allBenchmarks = getSectorBenchmarks();
      const sectorBenchmark = allBenchmarks[esgData.sector] || allBenchmarks.services;
      const position = calculateBenchmarkPosition(esgScores.totalScore, sectorBenchmark);
      
      // Generate compliance alerts
      const complianceAlerts = generateComplianceAlerts(
        { ...esgData, categories: updatedCategories },
        esgScores.categoryScores
      );
      
      // Get sector label
      const sectorInfo = TUNISIAN_SECTORS.find(s => s.value === esgData.sector);
      
      // Build complete report data
      const data: RSEReportData = {
        // Company Info
        companyName: esgData.companyName || 'Entreprise non définie',
        sector: esgData.sector,
        sectorLabel: sectorInfo?.label || esgData.sector,
        fiscalYear: esgData.fiscalYear,
        revenue: esgData.revenue,
        reportGeneratedAt: new Date().toISOString(),
        
        // ESG Scores
        esgScores,
        categories: updatedCategories,
        weightingConfig,
        
        // Benchmark
        benchmark: {
          ...sectorBenchmark,
          position,
        },
        
        // Actions
        actions,
        actionStats: calculateActionStats(actions),
        budgetStats: calculateBudgetStatsExtended(actions),
        csrdProgress: calculateCSRDProgress(actions),
        regionalImpact: calculateRegionalImpact(actions),
        
        // Compliance
        complianceAlerts,
        regulatoryFramework: REGULATORY_FRAMEWORK,
        
        // Methodology
        methodology: {
          scoringFormula: `Score Global = (E × ${weightingConfig.e.toFixed(0)}%) + (S × ${weightingConfig.s.toFixed(0)}%) + (G × ${weightingConfig.g.toFixed(0)}%)`,
          weights: weightingConfig.mode === 'standard' 
            ? 'Pondération standard équilibrée (E:S:G = 33:33:34)'
            : weightingConfig.mode === 'sectoriel'
            ? 'Pondération sectorielle basée sur SASB/GRI'
            : 'Pondération experte personnalisée',
          dataSource: 'Ce rapport agrège les données du module Scoring ESG et du module Pilotage RSE de la plateforme GreenInsight.',
          limitations: [
            'Les données sont auto-déclarées et nécessitent une vérification externe pour certification.',
            'Les benchmarks sectoriels sont basés sur des moyennes estimées pour le contexte tunisien.',
            'Les facteurs d\'émission utilisent les références ANME/STEG pour la Tunisie.',
          ],
        },
      };
      
      setReportData(data);
    } catch (error) {
      console.error('Error building report data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [actions, loadESGData, loadWeightingConfig, calculateActionStats, calculateBudgetStatsExtended, calculateRegionalImpact, calculateBenchmarkPosition]);

  // Initial load and refresh on actions change
  useEffect(() => {
    buildReportData();
  }, [buildReportData]);

  // Expose refresh function for manual updates
  const refreshReport = useCallback(() => {
    buildReportData();
  }, [buildReportData]);

  return {
    reportData,
    isLoading,
    refreshReport,
  };
}

export default useRSEReport;

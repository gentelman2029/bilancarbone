// Custom Hook pour les stats de progression par Scope (depuis Supabase)
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScopeStats {
  scope: string;
  label: string;
  icon: 'flame' | 'zap' | 'globe';
  colorClass: string;
  totalActivities: number;
  validatedCount: number;
  completionPercent: number;
  totalCO2Kg: number;
}

interface UseScopeProgressReturn {
  stats: ScopeStats[];
  isLoading: boolean;
  error: string | null;
  totalCO2: number;
  totalActivities: number;
  refresh: () => void;
}

const SCOPE_CONFIGS = [
  { 
    scope: 'scope1', 
    label: 'Scope 1 - Émissions directes', 
    icon: 'flame' as const, 
    colorClass: 'bg-red-500' 
  },
  { 
    scope: 'scope2', 
    label: 'Scope 2 - Énergie indirecte', 
    icon: 'zap' as const, 
    colorClass: 'bg-amber-500' 
  },
  { 
    scope: 'scope3', 
    label: 'Scope 3 - Autres indirectes', 
    icon: 'globe' as const, 
    colorClass: 'bg-blue-500' 
  }
];

export function useScopeProgress(refreshTrigger?: number): UseScopeProgressReturn {
  const [stats, setStats] = useState<ScopeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('activity_data')
        .select('ghg_scope, status, co2_equivalent_kg');

      if (queryError) throw queryError;

      if (!isMountedRef.current) return;

      // Calculate stats per scope - ONLY count validated emissions for CO2 totals
      const scopeMap = new Map<string, { total: number; validated: number; co2: number; validatedCo2: number }>();
      
      for (const activity of data || []) {
        const scope = activity.ghg_scope;
        if (!scopeMap.has(scope)) {
          scopeMap.set(scope, { total: 0, validated: 0, co2: 0, validatedCo2: 0 });
        }
        const current = scopeMap.get(scope)!;
        current.total++;
        current.co2 += activity.co2_equivalent_kg || 0;
        
        // Only count validated/integrated activities for the official CO2 total
        if (activity.status === 'validated' || activity.status === 'integrated') {
          current.validated++;
          current.validatedCo2 += activity.co2_equivalent_kg || 0;
        }
      }

      const statsData: ScopeStats[] = SCOPE_CONFIGS.map(config => {
        const scopeData = scopeMap.get(config.scope) || { total: 0, validated: 0, co2: 0, validatedCo2: 0 };
        return {
          ...config,
          totalActivities: scopeData.total,
          validatedCount: scopeData.validated,
          completionPercent: scopeData.total > 0 
            ? Math.round((scopeData.validated / scopeData.total) * 100) 
            : 0,
          // CRITICAL: Only show validated CO2 for audit compliance
          totalCO2Kg: scopeData.validatedCo2
        };
      });

      setStats(statsData);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      console.error('Error loading scope stats:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    loadStats();
  }, [loadStats]);

  // Lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    loadStats();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [loadStats, refreshTrigger]);

  // Derived calculations
  const totalCO2 = stats.reduce((sum, s) => sum + s.totalCO2Kg, 0);
  const totalActivities = stats.reduce((sum, s) => sum + s.totalActivities, 0);

  return {
    stats,
    isLoading,
    error,
    totalCO2,
    totalActivities,
    refresh,
  };
}

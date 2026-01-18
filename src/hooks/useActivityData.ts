// Custom Hook pour la gestion des données d'activité
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { ActivityData, GhgScope } from '@/lib/dataCollection/types';

interface UseActivityDataOptions {
  autoLoad?: boolean;
  filters?: {
    ghg_scope?: GhgScope;
    status?: string;
    period_from?: string;
    period_to?: string;
  };
}

interface ScopeStats {
  scope: GhgScope;
  label: string;
  totalActivities: number;
  validatedCount: number;
  completionPercent: number;
  totalCO2Kg: number;
}

interface UseActivityDataReturn {
  activities: ActivityData[];
  isLoading: boolean;
  error: string | null;
  totalEmissions: number;
  validatedCount: number;
  scopeStats: ScopeStats[];
  loadActivities: () => Promise<void>;
  calculateEmissions: (activityId: string) => Promise<boolean>;
  validateActivity: (activityId: string) => Promise<boolean>;
  updateActivity: (id: string, updates: Partial<ActivityData>) => Promise<boolean>;
  refresh: () => void;
}

export function useActivityData(
  options: UseActivityDataOptions = {}
): UseActivityDataReturn {
  const { autoLoad = true, filters } = options;
  
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadActivities = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await activityDataService.getActivityData(filters);
      
      if (!isMountedRef.current) return;
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setActivities(result.data || []);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      console.error('Error loading activities:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  const calculateEmissions = useCallback(async (activityId: string): Promise<boolean> => {
    try {
      const result = await activityDataService.validateAndCalculate(activityId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Calcul effectué', {
        description: `${result.data?.co2_equivalent_kg?.toFixed(2) || 0} kg CO₂e`
      });
      
      await loadActivities();
      return true;
    } catch (err) {
      console.error('Calculation error:', err);
      toast.error('Erreur lors du calcul');
      return false;
    }
  }, [loadActivities]);

  const validateActivity = useCallback(async (activityId: string): Promise<boolean> => {
    try {
      const result = await activityDataService.updateActivityData(activityId, { 
        status: 'validated' 
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Activité validée');
      await loadActivities();
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Erreur lors de la validation');
      return false;
    }
  }, [loadActivities]);

  const updateActivity = useCallback(async (
    id: string, 
    updates: Partial<ActivityData>
  ): Promise<boolean> => {
    try {
      const result = await activityDataService.updateActivityData(id, updates);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (isMountedRef.current) {
        setActivities(prev => 
          prev.map(a => a.id === id ? { ...a, ...updates } : a)
        );
      }
      
      return true;
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  }, []);

  const refresh = useCallback(() => {
    loadActivities();
  }, [loadActivities]);

  // Lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoLoad) {
      loadActivities();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadActivities]);

  // Calculate derived stats
  const totalEmissions = activities.reduce(
    (sum, a) => sum + (a.co2_equivalent_kg || 0), 
    0
  );
  
  const validatedCount = activities.filter(
    a => a.status === 'validated' || a.status === 'integrated'
  ).length;

  // Calculate scope stats
  const scopeStats: ScopeStats[] = (['scope1', 'scope2', 'scope3'] as GhgScope[]).map(scope => {
    const scopeActivities = activities.filter(a => a.ghg_scope === scope);
    const validated = scopeActivities.filter(
      a => a.status === 'validated' || a.status === 'integrated'
    ).length;
    const total = scopeActivities.length;
    const co2 = scopeActivities.reduce((sum, a) => sum + (a.co2_equivalent_kg || 0), 0);
    
    const labels: Record<GhgScope, string> = {
      scope1: 'Scope 1 - Émissions directes',
      scope2: 'Scope 2 - Énergie indirecte',
      scope3: 'Scope 3 - Autres indirectes'
    };

    return {
      scope,
      label: labels[scope],
      totalActivities: total,
      validatedCount: validated,
      completionPercent: total > 0 ? Math.round((validated / total) * 100) : 0,
      totalCO2Kg: co2
    };
  });

  return {
    activities,
    isLoading,
    error,
    totalEmissions,
    validatedCount,
    scopeStats,
    loadActivities,
    calculateEmissions,
    validateActivity,
    updateActivity,
    refresh,
  };
}

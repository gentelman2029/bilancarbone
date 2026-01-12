import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MaterialityIssue } from '@/components/esg/ESGMaterialityTable';
import { WeightingConfig } from '@/components/esg/ESGWeightingConfig';

const LOCAL_STORAGE_KEY_ISSUES = 'esg-materiality-issues';
const LOCAL_STORAGE_KEY_WEIGHTS = 'esg-weighting-config';

export const useESGMateriality = () => {
  const { toast } = useToast();
  const [issues, setIssues] = useState<MaterialityIssue[]>([]);
  const [weightingConfig, setWeightingConfig] = useState<WeightingConfig>({
    mode: 'standard',
    environmentWeight: 33.33,
    socialWeight: 33.33,
    governanceWeight: 33.34,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkAuth();
  }, []);

  // Load data from Supabase or localStorage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      if (userId) {
        // Try to load from Supabase
        try {
          const [issuesResult, configResult] = await Promise.all([
            supabase.from('esg_materiality_issues').select('*').eq('user_id', userId),
            supabase.from('esg_weighting_config').select('*').eq('user_id', userId).single(),
          ]);

          if (issuesResult.data && issuesResult.data.length > 0) {
            setIssues(issuesResult.data.map(row => ({
              id: row.id,
              issueName: row.issue_name,
              category: row.category as 'E' | 'S' | 'G',
              impactNature: row.impact_nature as 'positive' | 'negative',
              severity: row.severity,
              probability: row.probability,
              riskScore: row.risk_score,
              opportunity: row.opportunity || '',
            })));
          }

          if (configResult.data) {
            setWeightingConfig({
              mode: configResult.data.mode as 'standard' | 'sectoriel' | 'expert',
              sector: configResult.data.sector || undefined,
              environmentWeight: Number(configResult.data.environment_weight),
              socialWeight: Number(configResult.data.social_weight),
              governanceWeight: Number(configResult.data.governance_weight),
            });
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }

      setIsLoading(false);
    };

    const loadFromLocalStorage = () => {
      const storedIssues = localStorage.getItem(LOCAL_STORAGE_KEY_ISSUES);
      const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY_WEIGHTS);

      if (storedIssues) {
        try {
          setIssues(JSON.parse(storedIssues));
        } catch {}
      }

      if (storedConfig) {
        try {
          setWeightingConfig(JSON.parse(storedConfig));
        } catch {}
      }
    };

    loadData();
  }, [userId]);

  // Save issues
  const saveIssues = useCallback(async (newIssues: MaterialityIssue[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ISSUES, JSON.stringify(newIssues));
    setIssues(newIssues);
  }, []);

  // Save weighting config
  const saveWeightingConfig = useCallback(async (config: WeightingConfig) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WEIGHTS, JSON.stringify(config));
    setWeightingConfig(config);

    if (userId) {
      try {
        const { error } = await supabase.from('esg_weighting_config').upsert({
          user_id: userId,
          mode: config.mode,
          sector: config.sector || null,
          environment_weight: config.environmentWeight,
          social_weight: config.socialWeight,
          governance_weight: config.governanceWeight,
        }, { onConflict: 'user_id' });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      }
    }
  }, [userId]);

  // Add issue
  const addIssue = useCallback(async (issue: Omit<MaterialityIssue, 'id' | 'riskScore'>) => {
    const newIssue: MaterialityIssue = {
      ...issue,
      id: crypto.randomUUID(),
      riskScore: issue.severity * issue.probability,
    };

    const newIssues = [...issues, newIssue];
    await saveIssues(newIssues);

    if (userId) {
      try {
        await supabase.from('esg_materiality_issues').insert({
          id: newIssue.id,
          user_id: userId,
          issue_name: issue.issueName,
          category: issue.category,
          impact_nature: issue.impactNature,
          severity: issue.severity,
          probability: issue.probability,
          opportunity: issue.opportunity || null,
        });
      } catch (error) {
        console.error('Error saving issue to Supabase:', error);
      }
    }

    toast({
      title: 'Enjeu ajouté',
      description: `"${issue.issueName}" a été ajouté à la matrice de matérialité.`,
    });
  }, [issues, saveIssues, userId, toast]);

  // Update issue
  const updateIssue = useCallback(async (id: string, updates: Partial<MaterialityIssue>) => {
    const newIssues = issues.map(issue => {
      if (issue.id !== id) return issue;
      const updated = { ...issue, ...updates };
      if (updates.severity !== undefined || updates.probability !== undefined) {
        updated.riskScore = updated.severity * updated.probability;
      }
      return updated;
    });
    await saveIssues(newIssues);

    if (userId) {
      try {
        const updateData: Record<string, any> = {};
        if (updates.issueName !== undefined) updateData.issue_name = updates.issueName;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.impactNature !== undefined) updateData.impact_nature = updates.impactNature;
        if (updates.severity !== undefined) updateData.severity = updates.severity;
        if (updates.probability !== undefined) updateData.probability = updates.probability;
        if (updates.opportunity !== undefined) updateData.opportunity = updates.opportunity;

        await supabase.from('esg_materiality_issues').update(updateData).eq('id', id);
      } catch (error) {
        console.error('Error updating issue in Supabase:', error);
      }
    }

    toast({
      title: 'Enjeu mis à jour',
      description: 'Les modifications ont été enregistrées.',
    });
  }, [issues, saveIssues, userId, toast]);

  // Delete issue
  const deleteIssue = useCallback(async (id: string) => {
    const issue = issues.find(i => i.id === id);
    const newIssues = issues.filter(i => i.id !== id);
    await saveIssues(newIssues);

    if (userId) {
      try {
        await supabase.from('esg_materiality_issues').delete().eq('id', id);
      } catch (error) {
        console.error('Error deleting issue from Supabase:', error);
      }
    }

    toast({
      title: 'Enjeu supprimé',
      description: issue ? `"${issue.issueName}" a été supprimé.` : 'L\'enjeu a été supprimé.',
      variant: 'destructive',
    });
  }, [issues, saveIssues, userId, toast]);

  return {
    issues,
    weightingConfig,
    isLoading,
    addIssue,
    updateIssue,
    deleteIssue,
    saveWeightingConfig,
  };
};

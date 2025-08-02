import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CarbonReport {
  report_id: string;
  user_id: string;
  report_name: string;
  period: string;
  total_co2e: number;
  scope1_total: number;
  scope2_total: number;
  scope3_total: number;
  carbon_intensity: number;
  company_info: any;
  created_at: string;
  updated_at: string;
  emissions_breakdown: Array<{
    category: string;
    subcategory?: string;
    scope_type: string;
    value: number;
    co2_equivalent: number;
  }>;
}

export interface CreateReportData {
  report_name: string;
  period: string;
  total_co2e: number;
  scope1_total: number;
  scope2_total: number;
  scope3_total: number;
  carbon_intensity?: number;
  company_info?: any;
  calculation_id?: string;
}

export const useCarbonReports = () => {
  const [reports, setReports] = useState<CarbonReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Récupérer tous les rapports de l'utilisateur
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('dashboard_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transformer les données pour s'assurer du bon type
      const transformedData = (data || []).map(report => ({
        ...report,
        emissions_breakdown: Array.isArray(report.emissions_breakdown) 
          ? report.emissions_breakdown 
          : []
      })) as CarbonReport[];
      
      setReports(transformedData);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur lors de la récupération des rapports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau rapport
  const createReport = async (reportData: CreateReportData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error: createError } = await supabase
        .from('carbon_reports')
        .insert({
          user_id: user.id,
          ...reportData
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: "Rapport créé",
        description: "Le rapport carbone a été créé avec succès",
      });

      // Rafraîchir la liste des rapports
      await fetchReports();
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Récupérer le dernier rapport (pour le dashboard)
  const getLatestReport = (): CarbonReport | null => {
    return reports.length > 0 ? reports[0] : null;
  };

  // Écouter les changements en temps réel
  useEffect(() => {
    fetchReports();

    // Configurer la subscription pour les mises à jour temps réel
    const subscription = supabase
      .channel('carbon_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'carbon_reports'
        },
        () => {
          fetchReports(); // Rafraîchir les données quand il y a des changements
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    reports,
    loading,
    error,
    createReport,
    fetchReports,
    getLatestReport
  };
};
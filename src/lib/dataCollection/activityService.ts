// Service pour la gestion des données d'activité et calculs carbone
import { supabase } from '@/integrations/supabase/client';
import type { ActivityData, CarbonCalculation, EmissionFactorLocal, ExtractedData, GhgScope, SourceType } from './types';

interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

class ActivityDataService {

  // Créer une donnée d'activité à partir des données extraites
  async createFromExtractedData(
    documentId: string,
    extractedData: ExtractedData,
    organizationId?: string
  ): Promise<ServiceResponse<ActivityData>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer le facteur d'émission approprié
      const emissionFactor = await this.getEmissionFactor(
        extractedData.ghg_category || 'electricite',
        'TN'
      );

      // Calculer les émissions CO2
      let co2Kg: number | null = null;
      if (extractedData.quantity && emissionFactor.data) {
        co2Kg = extractedData.quantity * emissionFactor.data.factor_value;
      }

      const { data, error } = await supabase
        .from('activity_data')
        .insert({
          user_id: user.id,
          organization_id: organizationId || null,
          source_type: 'ocr' as SourceType,
          source_document_id: documentId,
          source_reference: extractedData.invoice_number,
          period_start: extractedData.period_start,
          period_end: extractedData.period_end,
          ghg_scope: extractedData.ghg_scope as GhgScope || 'scope2',
          ghg_category: extractedData.ghg_category || 'electricite',
          quantity: extractedData.quantity || 0,
          unit: extractedData.unit || 'kWh',
          amount_ht: extractedData.amount_ht,
          amount_ttc: extractedData.amount_ttc,
          currency_code: extractedData.currency || 'TND',
          supplier_name: extractedData.supplier_name,
          emission_factor_value: emissionFactor.data?.factor_value,
          emission_factor_unit: emissionFactor.data?.factor_unit,
          emission_factor_source: emissionFactor.data?.source_name,
          co2_equivalent_kg: co2Kg,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as ActivityData };
    } catch (error) {
      return { error: `Erreur lors de la création: ${error}` };
    }
  }

  // Créer une donnée d'activité manuellement
  async createManual(
    activityData: Omit<ActivityData, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>
  ): Promise<ServiceResponse<ActivityData>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('activity_data')
        .insert({
          ...activityData,
          user_id: user.id,
          source_type: 'manual' as SourceType,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as ActivityData };
    } catch (error) {
      return { error: `Erreur lors de la création: ${error}` };
    }
  }

  // Récupérer les données d'activité
  async getActivityData(filters?: {
    ghg_scope?: GhgScope;
    status?: string;
    period_from?: string;
    period_to?: string;
  }): Promise<ServiceResponse<ActivityData[]>> {
    try {
      let query = supabase
        .from('activity_data')
        .select('*')
        .order('period_start', { ascending: false });

      if (filters?.ghg_scope) {
        query = query.eq('ghg_scope', filters.ghg_scope);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.period_from) {
        query = query.gte('period_start', filters.period_from);
      }
      if (filters?.period_to) {
        query = query.lte('period_end', filters.period_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: (data || []) as unknown as ActivityData[] };
    } catch (error) {
      return { error: `Erreur lors de la récupération: ${error}` };
    }
  }

  // Mettre à jour une donnée d'activité
  async updateActivityData(
    id: string,
    updates: Partial<ActivityData>
  ): Promise<ServiceResponse<ActivityData>> {
    try {
      const { data, error } = await supabase
        .from('activity_data')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as ActivityData };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour: ${error}` };
    }
  }

  // Valider une donnée d'activité et créer le calcul carbone
  async validateAndCalculate(
    activityId: string,
    organizationId?: string
  ): Promise<ServiceResponse<CarbonCalculation>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer la donnée d'activité
      const { data: activity, error: fetchError } = await supabase
        .from('activity_data')
        .select('*')
        .eq('id', activityId)
        .single();

      if (fetchError) throw fetchError;

      // Récupérer le facteur d'émission
      const emissionFactor = await this.getEmissionFactor(
        activity.ghg_category,
        'TN'
      );

      if (!emissionFactor.data) {
        throw new Error('Facteur d\'émission non trouvé');
      }

      // Calculer les émissions
      const co2Kg = activity.quantity * emissionFactor.data.factor_value;

      // Créer le calcul carbone
      const { data: calculation, error: calcError } = await supabase
        .from('carbon_calculations_v2')
        .insert({
          user_id: user.id,
          organization_id: organizationId || activity.organization_id,
          activity_data_id: activityId,
          input_quantity: activity.quantity,
          input_unit: activity.unit,
          emission_factor_value: emissionFactor.data.factor_value,
          emission_factor_unit: emissionFactor.data.factor_unit,
          emission_factor_source: emissionFactor.data.source_name,
          emission_factor_reference: emissionFactor.data.source_reference,
          co2_equivalent_kg: co2Kg,
          methodology: 'GHG Protocol',
          verification_status: 'unverified'
        })
        .select()
        .single();

      if (calcError) throw calcError;

      // Mettre à jour la donnée d'activité
      await supabase
        .from('activity_data')
        .update({
          status: 'validated',
          co2_equivalent_kg: co2Kg,
          emission_factor_value: emissionFactor.data.factor_value,
          emission_factor_unit: emissionFactor.data.factor_unit,
          emission_factor_source: emissionFactor.data.source_name
        })
        .eq('id', activityId);

      return { data: calculation as unknown as CarbonCalculation };
    } catch (error) {
      return { error: `Erreur lors du calcul: ${error}` };
    }
  }

  // Récupérer un facteur d'émission
  async getEmissionFactor(
    category: string,
    countryCode: string = 'TN'
  ): Promise<ServiceResponse<EmissionFactorLocal>> {
    try {
      const { data, error } = await supabase
        .from('emission_factors_local')
        .select('*')
        .eq('category', category)
        .eq('country_code', countryCode)
        .eq('is_active', true)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      
      // Si pas de facteur pour ce pays, chercher un facteur générique
      if (!data) {
        const { data: genericData, error: genericError } = await supabase
          .from('emission_factors_local')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .eq('is_default', true)
          .limit(1)
          .maybeSingle();

        if (genericError) throw genericError;
        return { data: genericData as unknown as EmissionFactorLocal };
      }

      return { data: data as unknown as EmissionFactorLocal };
    } catch (error) {
      return { error: `Erreur lors de la récupération du facteur: ${error}` };
    }
  }

  // Récupérer tous les facteurs d'émission
  async getAllEmissionFactors(countryCode?: string): Promise<ServiceResponse<EmissionFactorLocal[]>> {
    try {
      let query = supabase
        .from('emission_factors_local')
        .select('*')
        .eq('is_active', true)
        .order('category');

      if (countryCode) {
        query = query.eq('country_code', countryCode);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: (data || []) as unknown as EmissionFactorLocal[] };
    } catch (error) {
      return { error: `Erreur lors de la récupération: ${error}` };
    }
  }

  // Récupérer les calculs carbone
  async getCarbonCalculations(activityId?: string): Promise<ServiceResponse<CarbonCalculation[]>> {
    try {
      let query = supabase
        .from('carbon_calculations_v2')
        .select('*')
        .order('calculation_date', { ascending: false });

      if (activityId) {
        query = query.eq('activity_data_id', activityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: (data || []) as unknown as CarbonCalculation[] };
    } catch (error) {
      return { error: `Erreur lors de la récupération: ${error}` };
    }
  }
}

export const activityDataService = new ActivityDataService();

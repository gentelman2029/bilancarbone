// Service pour les métadonnées de calcul CBAM
// Assure la traçabilité des calculs avec références réglementaires
import { supabase } from '@/integrations/supabase/client';
import { auditService } from './auditService';

// Types pour les métadonnées
export interface CalculationMetadata {
  id: string;
  organization_id: string;
  user_id: string;
  entity_type: 'shipment_item' | 'product' | 'emissions_data';
  entity_id: string;
  calculation_version: number;
  emission_factor_source: EmissionFactorSource;
  emission_factor_value?: number;
  emission_factor_unit: string;
  regulation_reference?: string;
  methodology_reference?: string;
  default_factor_source?: string;
  assumptions: Assumption[];
  uncertainty_percent?: number;
  uncertainty_method?: UncertaintyMethod;
  data_source: DataSource;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  supporting_documents: SupportingDocument[];
  previous_version_id?: string;
  change_reason?: string;
  created_at: string;
  updated_at: string;
}

export type EmissionFactorSource = 'EU_DEFAULT' | 'ACTUAL' | 'HYBRID' | 'CUSTOM';
export type UncertaintyMethod = 'statistical' | 'conservative' | 'expert_judgment';
export type DataSource = 'supplier_declaration' | 'measurement' | 'default' | 'estimation';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Assumption {
  id: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  justification?: string;
}

export interface SupportingDocument {
  id: string;
  name: string;
  type: string;
  path: string;
  uploaded_at: string;
}

// Références réglementaires CBAM
export const CBAM_REGULATION_REFERENCES = {
  main: 'Règlement (UE) 2023/956 du 10 mai 2023',
  implementation: 'Règlement d\'exécution (UE) 2023/1773 du 17 août 2023',
  transition: 'Règlement délégué (UE) 2023/1774 du 17 août 2023',
  methodology: {
    direct: 'Annexe IV, Section 2 - Émissions directes',
    indirect: 'Annexe IV, Section 3 - Émissions indirectes',
    precursors: 'Annexe IV, Section 4 - Précurseurs',
    default_values: 'Annexe III - Valeurs par défaut'
  },
  sectors: {
    cement: 'Annexe I, Catégorie 2520',
    iron_steel: 'Annexe I, Catégorie 7201-7229',
    aluminium: 'Annexe I, Catégorie 7601-7609',
    fertilizers: 'Annexe I, Catégorie 2808-3105',
    electricity: 'Annexe I, Catégorie 2716',
    hydrogen: 'Annexe I, Catégorie 2804'
  }
};

interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

// ============================================================================
// SERVICE MÉTADONNÉES DE CALCUL
// ============================================================================

class CalculationMetadataService {
  
  // Créer des métadonnées de calcul
  async create(
    metadata: Omit<CalculationMetadata, 'id' | 'user_id' | 'calculation_version' | 'created_at' | 'updated_at' | 'verification_status'>
  ): Promise<ServiceResponse<CalculationMetadata>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer la dernière version pour cet entity
      const { data: existingVersions } = await supabase
        .from('cbam_calculation_metadata')
        .select('calculation_version')
        .eq('entity_type', metadata.entity_type)
        .eq('entity_id', metadata.entity_id)
        .order('calculation_version', { ascending: false })
        .limit(1);

      const nextVersion = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].calculation_version + 1 
        : 1;

      const insertData = {
        organization_id: metadata.organization_id,
        entity_type: metadata.entity_type as string,
        entity_id: metadata.entity_id,
        emission_factor_source: metadata.emission_factor_source as string,
        emission_factor_value: metadata.emission_factor_value,
        emission_factor_unit: metadata.emission_factor_unit,
        regulation_reference: metadata.regulation_reference,
        methodology_reference: metadata.methodology_reference,
        default_factor_source: metadata.default_factor_source,
        assumptions: JSON.parse(JSON.stringify(metadata.assumptions)),
        uncertainty_percent: metadata.uncertainty_percent,
        uncertainty_method: metadata.uncertainty_method,
        data_source: metadata.data_source,
        supporting_documents: JSON.parse(JSON.stringify(metadata.supporting_documents)),
        user_id: user.id,
        calculation_version: nextVersion,
        verification_status: 'unverified'
      };

      const { data, error } = await supabase
        .from('cbam_calculation_metadata')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      const typedData = data as unknown as CalculationMetadata;

      // Logger l'audit
      await auditService.logCreate(
        'calculation',
        typedData.id,
        typedData as unknown as Record<string, unknown>,
        metadata.organization_id
      );

      return { data: typedData };
    } catch (error) {
      return { error: `Erreur lors de la création des métadonnées: ${error}` };
    }
  }

  // Récupérer les métadonnées d'une entité
  async getByEntity(
    entityType: CalculationMetadata['entity_type'],
    entityId: string
  ): Promise<ServiceResponse<CalculationMetadata[]>> {
    try {
      const { data, error } = await supabase
        .from('cbam_calculation_metadata')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('calculation_version', { ascending: false });

      if (error) throw error;
      return { data: (data || []) as unknown as CalculationMetadata[] };
    } catch (error) {
      return { error: `Erreur lors de la récupération des métadonnées: ${error}` };
    }
  }

  // Récupérer la dernière version des métadonnées
  async getLatestVersion(
    entityType: CalculationMetadata['entity_type'],
    entityId: string
  ): Promise<ServiceResponse<CalculationMetadata | null>> {
    try {
      const { data, error } = await supabase
        .from('cbam_calculation_metadata')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('calculation_version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return { data: data as unknown as CalculationMetadata | null };
    } catch (error) {
      return { error: `Erreur lors de la récupération des métadonnées: ${error}` };
    }
  }

  // Créer une nouvelle version (avec lien vers version précédente)
  async createNewVersion(
    previousVersionId: string,
    updates: Partial<CalculationMetadata>,
    changeReason: string
  ): Promise<ServiceResponse<CalculationMetadata>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer la version précédente
      const { data: previousVersion, error: fetchError } = await supabase
        .from('cbam_calculation_metadata')
        .select('*')
        .eq('id', previousVersionId)
        .single();

      if (fetchError) throw fetchError;

      const nextVersion = previousVersion.calculation_version + 1;

      // Créer la nouvelle version
      const newMetadata = {
        organization_id: previousVersion.organization_id,
        entity_type: previousVersion.entity_type,
        entity_id: previousVersion.entity_id,
        emission_factor_source: (updates.emission_factor_source || previousVersion.emission_factor_source) as string,
        emission_factor_value: updates.emission_factor_value ?? previousVersion.emission_factor_value,
        emission_factor_unit: updates.emission_factor_unit || previousVersion.emission_factor_unit,
        regulation_reference: updates.regulation_reference ?? previousVersion.regulation_reference,
        methodology_reference: updates.methodology_reference ?? previousVersion.methodology_reference,
        default_factor_source: updates.default_factor_source ?? previousVersion.default_factor_source,
        assumptions: JSON.parse(JSON.stringify(updates.assumptions || previousVersion.assumptions)),
        uncertainty_percent: updates.uncertainty_percent ?? previousVersion.uncertainty_percent,
        uncertainty_method: updates.uncertainty_method ?? previousVersion.uncertainty_method,
        data_source: updates.data_source ?? previousVersion.data_source,
        supporting_documents: JSON.parse(JSON.stringify(updates.supporting_documents || previousVersion.supporting_documents)),
        user_id: user.id,
        calculation_version: nextVersion,
        previous_version_id: previousVersionId,
        change_reason: changeReason,
        verification_status: 'unverified'
      };

      const { data, error } = await supabase
        .from('cbam_calculation_metadata')
        .insert([newMetadata])
        .select()
        .single();

      if (error) throw error;

      // Logger l'audit
      await auditService.logUpdate(
        'calculation',
        data.id,
        previousVersion as unknown as Record<string, unknown>,
        data as unknown as Record<string, unknown>,
        data.organization_id
      );

      return { data: data as unknown as CalculationMetadata };
    } catch (error) {
      return { error: `Erreur lors de la création de la nouvelle version: ${error}` };
    }
  }

  // Vérifier des métadonnées
  async verify(
    metadataId: string,
    status: 'verified' | 'rejected',
    comments?: string
  ): Promise<ServiceResponse<CalculationMetadata>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('cbam_calculation_metadata')
        .update({
          verification_status: status,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', metadataId)
        .select()
        .single();

      if (error) throw error;

      // Logger l'audit
      await auditService.log('verify', 'calculation', {
        entity_id: metadataId,
        organization_id: data.organization_id,
        metadata: { status, comments }
      });

      return { data: data as unknown as CalculationMetadata };
    } catch (error) {
      return { error: `Erreur lors de la vérification: ${error}` };
    }
  }

  // Générer les métadonnées par défaut pour un calcul
  generateDefaultMetadata(
    organizationId: string,
    entityType: CalculationMetadata['entity_type'],
    entityId: string,
    sector: string,
    emissionFactorValue: number,
    isActualData: boolean
  ): Omit<CalculationMetadata, 'id' | 'user_id' | 'calculation_version' | 'created_at' | 'updated_at' | 'verification_status'> {
    const sectorRef = CBAM_REGULATION_REFERENCES.sectors[sector as keyof typeof CBAM_REGULATION_REFERENCES.sectors] || '';
    
    return {
      organization_id: organizationId,
      entity_type: entityType,
      entity_id: entityId,
      emission_factor_source: isActualData ? 'ACTUAL' : 'EU_DEFAULT',
      emission_factor_value: emissionFactorValue,
      emission_factor_unit: 'tCO2e/t',
      regulation_reference: CBAM_REGULATION_REFERENCES.main,
      methodology_reference: isActualData 
        ? CBAM_REGULATION_REFERENCES.methodology.direct
        : CBAM_REGULATION_REFERENCES.methodology.default_values,
      default_factor_source: !isActualData ? CBAM_REGULATION_REFERENCES.implementation : undefined,
      assumptions: isActualData ? [] : [
        {
          id: 'default_1',
          description: 'Utilisation des valeurs par défaut UE en l\'absence de données réelles du fournisseur',
          impact: 'high',
          justification: 'Conformément à l\'Article 4 du Règlement d\'exécution 2023/1773'
        }
      ],
      uncertainty_percent: isActualData ? 5 : 15,
      uncertainty_method: isActualData ? 'statistical' : 'conservative',
      data_source: isActualData ? 'supplier_declaration' : 'default',
      supporting_documents: []
    };
  }

  // Exporter les métadonnées pour audit
  async exportForAudit(
    organizationId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<ServiceResponse<CalculationMetadata[]>> {
    try {
      const { data, error } = await supabase
        .from('cbam_calculation_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Logger l'export
      await auditService.logExport('calculation', {
        format: 'json',
        record_count: data?.length || 0,
        file_name: `calculation_metadata_${dateFrom}_${dateTo}.json`
      }, organizationId);

      return { data: (data || []) as unknown as CalculationMetadata[] };
    } catch (error) {
      return { error: `Erreur lors de l'export: ${error}` };
    }
  }
}

export const calculationMetadataService = new CalculationMetadataService();

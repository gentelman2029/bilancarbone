// Types TypeScript pour le module CBAM
// Alignés sur le schéma Supabase et le règlement UE 2023/956

export type CBAMSector = 'cement' | 'iron_steel' | 'aluminium' | 'fertilizers' | 'electricity' | 'hydrogen';

export type EmissionMethod = 'ACTUAL' | 'DEFAULT' | 'HYBRID';

export type CBAMStatus = 'draft' | 'submitted' | 'corrected' | 'validated' | 'rejected';

export type CBAMPhase = 'transitional' | 'operational';

export type PriorityLevel = 'high' | 'medium' | 'low';

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface CBAMImporter {
  id: string;
  user_id: string;
  eori_number: string;
  company_name: string;
  country_code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CBAMDeclarant {
  id: string;
  user_id: string;
  importer_id: string;
  company_name: string;
  eori_number?: string;
  country_code: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface CBAMSupplier {
  id: string;
  user_id: string;
  company_name: string;
  country_code: string;
  address?: string;
  contact_email?: string;
  tax_number?: string;
  carbon_pricing_system?: string;
  created_at: string;
  updated_at: string;
}

export interface CBAMInstallation {
  id: string;
  user_id: string;
  supplier_id: string;
  installation_name: string;
  country_code: string;
  address: string;
  coordinates?: { x: number; y: number }; // PostGIS POINT
  permit_number?: string;
  sector: CBAMSector;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CBAMProduct {
  id: string;
  user_id: string;
  cn8_code: string;
  product_name: string;
  sector: CBAMSector;
  description?: string;
  unit_measure: string;
  is_precursor: boolean;
  parent_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CBAMShipment {
  id: string;
  user_id: string;
  importer_id: string;
  supplier_id: string;
  installation_id?: string;
  reference_number: string;
  import_date: string; // Date ISO
  country_of_origin: string;
  total_value_eur?: number;
  currency_code?: string;
  exchange_rate?: number;
  exchange_rate_date?: string;
  status: CBAMStatus;
  phase: CBAMPhase;
  created_at: string;
  updated_at: string;
}

export interface CBAMShipmentItem {
  id: string;
  user_id: string;
  shipment_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  unit_value_eur?: number;
  total_value_eur?: number;
  created_at: string;
  updated_at: string;
}

export interface CBAMEmissionsData {
  id: string;
  user_id: string;
  shipment_item_id: string;
  installation_id?: string;
  direct_emissions: number; // tCO2e/tonne
  direct_method: EmissionMethod;
  direct_verified: boolean;
  indirect_emissions: number; // tCO2e/tonne
  indirect_method: EmissionMethod;
  indirect_verified: boolean;
  reporting_period: string; // Q1-2024, Q2-2024, etc.
  verification_date?: string;
  verifier_name?: string;
  measurement_uncertainty?: number; // %
  supporting_documents: any; // JSONB - compatible avec Supabase Json type
  calculation_details: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface CBAMDefaultEmissionFactor {
  id: string;
  sector: CBAMSector;
  product_category: string;
  country_code: string;
  direct_factor: number; // tCO2e/tonne
  indirect_factor: number;
  valid_from: string;
  valid_to?: string;
  source_regulation: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

export interface CBAMCarbonPriceOrigin {
  id: string;
  user_id: string;
  shipment_item_id: string;
  carbon_pricing_system: string;
  country_code: string;
  carbon_price_local: number;
  local_currency: string;
  carbon_price_eur: number;
  exchange_rate: number;
  period_start: string;
  period_end: string;
  supporting_documents: any; // JSONB - compatible avec Supabase Json type
  verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CBAMQuarterlyReport {
  id: string;
  user_id: string;
  importer_id: string;
  quarter: number; // 1-4
  year: number;
  status: CBAMStatus;
  phase: CBAMPhase;
  submission_deadline: string;
  submitted_at?: string;
  total_shipments: number;
  total_emissions_direct: number;
  total_emissions_indirect: number;
  total_value_eur: number;
  export_file_path?: string;
  export_generated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CBAMQuarterlyReportItem {
  id: string;
  user_id: string;
  report_id: string;
  product_id: string;
  country_of_origin: string;
  total_quantity: number;
  total_direct_emissions: number;
  total_indirect_emissions: number;
  total_value_eur: number;
  predominant_direct_method: EmissionMethod;
  predominant_indirect_method: EmissionMethod;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PHASE OPÉRATIONNELLE 2026+
// ============================================================================

export interface CBAMDeclaration {
  id: string;
  user_id: string;
  importer_id: string;
  year: number;
  total_cbam_obligation_eur: number;
  certificates_required: number;
  status: CBAMStatus;
  submission_deadline: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CBAMCertificate {
  id: string;
  user_id: string;
  importer_id: string;
  certificate_serial: string;
  certificate_type: string;
  quantity: number;
  transaction_type: 'purchase' | 'surrender' | 'transfer';
  transaction_date: string;
  unit_price_eur?: number;
  total_cost_eur?: number;
  declaration_id?: string;
  validity_period_start?: string;
  validity_period_end?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DONNÉES DE RÉFÉRENCE EXTERNES
// ============================================================================

export interface CBAMExchangeRate {
  id: string;
  currency_code: string;
  date: string;
  rate_to_eur: number;
  source: string;
  created_at: string;
}

export interface CBAMETSPrice {
  id: string;
  date: string;
  price_eur_per_tonne: number;
  contract_type: string;
  source: string;
  created_at: string;
}

// ============================================================================
// TYPES POUR L'UI ET LES CALCULS
// ============================================================================

export interface CBAMCalculationResult {
  shipment_item_id: string;
  product_name: string;
  quantity: number;
  total_direct_emissions: number;
  total_indirect_emissions: number;
  total_emissions: number;
  emission_intensity: number; // tCO2e/tonne
  carbon_price_origin?: number;
  cbam_obligation_eur?: number; // Phase opérationnelle
  method_used: {
    direct: EmissionMethod;
    indirect: EmissionMethod;
  };
}

export interface CBAMReportSummary {
  quarter?: number;
  year: number;
  phase: CBAMPhase;
  total_products: number;
  total_shipments: number;
  total_quantity: number;
  total_emissions: number;
  total_value_eur: number;
  top_sectors: Array<{
    sector: CBAMSector;
    quantity: number;
    emissions: number;
  }>;
  top_countries: Array<{
    country_code: string;
    quantity: number;
    emissions: number;
  }>;
}

export interface CBAMDashboardStats {
  active_importers: number;
  pending_reports: number;
  total_shipments_ytd: number;
  total_emissions_ytd: number;
  compliance_rate: number; // %
  next_deadline?: string;
  urgent_tasks: number;
}

// ============================================================================
// TYPES POUR LES FORMULAIRES
// ============================================================================

export interface CreateCBAMProductForm {
  cn8_code: string;
  product_name: string;
  sector: CBAMSector;
  description?: string;
  unit_measure: string;
  is_precursor: boolean;
  parent_product_id?: string;
}

export interface CreateCBAMShipmentForm {
  importer_id: string;
  supplier_id: string;
  installation_id?: string;
  reference_number: string;
  import_date: string;
  country_of_origin: string;
  total_value_eur?: number;
  currency_code?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit?: string;
    unit_value_eur?: number;
  }>;
}

export interface CreateEmissionsDataForm {
  shipment_item_id: string;
  installation_id?: string;
  direct_emissions: number;
  direct_method: EmissionMethod;
  direct_verified: boolean;
  indirect_emissions: number;
  indirect_method: EmissionMethod;
  indirect_verified: boolean;
  reporting_period: string;
  verification_date?: string;
  verifier_name?: string;
  measurement_uncertainty?: number;
}

// ============================================================================
// TYPES POUR LES ERREURS ET VALIDATIONS
// ============================================================================

export interface CBAMValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CBAMServiceResponse<T> {
  data?: T;
  error?: string;
  validationErrors?: CBAMValidationError[];
}

// ============================================================================
// CONSTANTES UTILES
// ============================================================================

export const CBAM_SECTORS: Record<CBAMSector, string> = {
  cement: 'Ciment',
  iron_steel: 'Fer et Acier',
  aluminium: 'Aluminium', 
  fertilizers: 'Engrais',
  electricity: 'Électricité',
  hydrogen: 'Hydrogène'
};

export const EMISSION_METHODS: Record<EmissionMethod, string> = {
  ACTUAL: 'Données réelles vérifiées',
  DEFAULT: 'Valeurs par défaut UE',
  HYBRID: 'Mélange réel/défaut'
};

export const CBAM_STATUSES: Record<CBAMStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  corrected: 'Corrigé',
  validated: 'Validé',
  rejected: 'Rejeté'
};

export const PHASES: Record<CBAMPhase, string> = {
  transitional: 'Phase transitoire (2023-2025)',
  operational: 'Phase opérationnelle (2026+)'
};

// Codes CN8 principaux par secteur (liste non exhaustive - à compléter)
export const CN8_CODES_BY_SECTOR: Record<CBAMSector, string[]> = {
  cement: ['25232100', '25232900', '25239000'],
  iron_steel: ['72081000', '72082500', '72083600'],
  aluminium: ['76011000', '76012000', '76020000'],
  fertilizers: ['31021000', '31022100', '31023000'],
  electricity: ['27160000'], // Code spécial pour électricité
  hydrogen: ['28047000', '28048000'] // Hydrogène et précurseurs
};
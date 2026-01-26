// Types pour le module de collecte de données

// Scope 1 - Émissions directes
// Scope 2 - Émissions indirectes liées à l'énergie  
// Scope 3 - Autres émissions indirectes
export type DocumentType = 
  // Scope 1 - Combustibles et carburants
  | 'gas_bill'              // Facture gaz naturel
  | 'fuel_invoice'          // Facture carburant (diesel, essence)
  | 'fuel_voucher'          // Bon carburant (ticket prépayé)
  | 'heating_oil_invoice'   // Facture fioul domestique
  | 'lpg_invoice'           // Facture GPL/propane
  | 'refrigerant_invoice'   // Facture fluides frigorigènes
  // Scope 2 - Énergie
  | 'electricity_bill'      // Facture électricité
  | 'district_heating'      // Facture chaleur réseau
  | 'district_cooling'      // Facture froid réseau
  // Scope 3 - Transport et déplacements
  | 'transport_invoice'     // Facture transport de marchandises
  | 'business_travel'       // Note de frais déplacements professionnels
  | 'employee_commuting'    // Enquête/données déplacements domicile-travail
  | 'freight_invoice'       // Facture fret (aérien, maritime, routier)
  // Scope 3 - Achats et déchets
  | 'purchase_invoice'      // Facture achats biens/services
  | 'waste_invoice'         // Facture traitement déchets
  | 'water_bill'            // Facture eau
  // Scope 3 - Autres
  | 'asset_invoice'         // Facture immobilisations (équipements, bâtiments)
  | 'leasing_invoice'       // Contrat leasing/location
  | 'csv_import'            // Import CSV comptable
  | 'accounting_entries'    // Écritures comptables
  | 'other';                // Autre document

export type OcrStatus = 'pending' | 'processing' | 'processed' | 'failed' | 'manual_required';
export type ValidationStatus = 'pending' | 'validated' | 'rejected' | 'modified';
export type GhgScope = 'scope1' | 'scope2' | 'scope3';
export type SourceType = 'ocr' | 'erp_api' | 'manual' | 'import_csv';
export type ActivityStatus = 'draft' | 'validated' | 'integrated' | 'archived';

export interface DataCollectionDocument {
  id: string;
  user_id: string;
  organization_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: DocumentType;
  supplier_name?: string;
  country_code: string;
  ocr_status: OcrStatus;
  ocr_processed_at?: string;
  ocr_raw_result?: Record<string, unknown>;
  ocr_confidence_score?: number;
  ocr_error_message?: string;
  extracted_data: ExtractedData;
  validation_status: ValidationStatus;
  validated_by?: string;
  validated_at?: string;
  validation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FuelItem {
  product_name: string;
  quantity: number;
  unit: string;
  ghg_category: string;
  emission_factor: number;
  co2_kg: number;
}

export interface ExtractedData {
  document_type?: string;
  supplier_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  client_name?: string;
  period_start?: string;
  period_end?: string;
  quantity?: number;
  unit?: string;
  amount_ht?: number;
  amount_ttc?: number;
  currency?: string;
  ghg_scope?: string;
  ghg_category?: string;
  confidence_score?: number;
  extraction_notes?: string;
  // Field-level confidence scores
  field_confidences?: Record<string, number>;
  // Emission factor fields
  emission_factor_value?: number;
  emission_factor_source?: string;
  // Calculated emissions
  calculated_co2_kg?: number;
  co2_equivalent_kg?: number;
  // Multi-line fuel items (for fuel_invoice)
  fuel_items?: FuelItem[];
  total_quantity?: number;
  total_co2_kg?: number;
}

export interface ActivityData {
  id: string;
  user_id: string;
  organization_id?: string;
  source_type: SourceType;
  source_document_id?: string;
  source_reference?: string;
  period_start: string;
  period_end: string;
  ghg_scope: GhgScope;
  ghg_category: string;
  ghg_subcategory?: string;
  quantity: number;
  unit: string;
  amount_ht?: number;
  amount_ttc?: number;
  currency_code: string;
  supplier_name?: string;
  supplier_country?: string;
  emission_factor_value?: number;
  emission_factor_unit?: string;
  emission_factor_source?: string;
  co2_equivalent_kg?: number;
  calculation_metadata_id?: string;
  status: ActivityStatus;
  // Audit trail fields
  uncertainty_percent?: number;
  uncertainty_source?: 'invoice' | 'estimate' | 'monetary_ratio';
  created_at: string;
  updated_at: string;
}

export interface CarbonCalculation {
  id: string;
  user_id: string;
  organization_id?: string;
  activity_data_id: string;
  calculation_date: string;
  calculation_version: number;
  input_quantity: number;
  input_unit: string;
  emission_factor_value: number;
  emission_factor_unit: string;
  emission_factor_source: string;
  emission_factor_reference?: string;
  co2_equivalent_kg: number;
  co2_equivalent_tonnes: number;
  uncertainty_percent?: number;
  uncertainty_method?: string;
  methodology?: string;
  regulation_reference?: string;
  previous_calculation_id?: string;
  change_reason?: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmissionFactorLocal {
  id: string;
  country_code: string;
  category: string;
  subcategory?: string;
  factor_value: number;
  factor_unit: string;
  source_name: string;
  source_reference?: string;
  source_url?: string;
  valid_from: string;
  valid_to?: string;
  is_default: boolean;
  is_active: boolean;
  notes?: string;
}

export interface ErpConnection {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  erp_type: string;
  connection_type: 'webhook' | 'api_pull' | 'sftp';
  api_endpoint?: string;
  webhook_secret?: string;
  auth_type?: 'api_key' | 'oauth2' | 'basic';
  field_mapping: Record<string, string>;
  is_active: boolean;
  last_sync_at?: string;
  last_sync_status?: string;
  last_sync_records_count?: number;
  created_at: string;
  updated_at: string;
}

// GHG Categories mapping
export const GHG_CATEGORIES = {
  scope1: [
    { id: 'gaz_naturel', label: 'Gaz naturel', unit: 'thermies' },
    { id: 'diesel', label: 'Diesel (véhicules)', unit: 'litres' },
    { id: 'essence', label: 'Essence (véhicules)', unit: 'litres' },
    { id: 'gpl', label: 'GPL', unit: 'litres' },
    { id: 'fioul', label: 'Fioul domestique', unit: 'litres' },
  ],
  scope2: [
    { id: 'electricite', label: 'Électricité', unit: 'kWh' },
    { id: 'chaleur_reseau', label: 'Chaleur réseau', unit: 'kWh' },
    { id: 'froid_reseau', label: 'Froid réseau', unit: 'kWh' },
  ],
  scope3: [
    { id: 'transport_routier', label: 'Transport routier', unit: 't.km' },
    { id: 'transport_aerien', label: 'Transport aérien', unit: 't.km' },
    { id: 'transport_maritime', label: 'Transport maritime', unit: 't.km' },
    { id: 'dechets', label: 'Déchets', unit: 'tonnes' },
    { id: 'achats_biens', label: 'Achats de biens', unit: 'EUR' },
    { id: 'achats_services', label: 'Achats de services', unit: 'EUR' },
    { id: 'fret_routier', label: 'Fret routier', unit: 't.km' },
    { id: 'fret_maritime', label: 'Fret maritime', unit: 't.km' },
    { id: 'fret_aerien', label: 'Fret aérien', unit: 't.km' },
  ],
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  // Scope 1
  gas_bill: 'Facture gaz naturel',
  fuel_invoice: 'Facture carburant (diesel/essence)',
  fuel_voucher: 'Bon carburant',
  heating_oil_invoice: 'Facture fioul domestique',
  lpg_invoice: 'Facture GPL/propane',
  refrigerant_invoice: 'Facture fluides frigorigènes',
  // Scope 2
  electricity_bill: 'Facture électricité',
  district_heating: 'Facture chaleur réseau',
  district_cooling: 'Facture froid réseau',
  // Scope 3 - Transport
  transport_invoice: 'Facture transport marchandises',
  business_travel: 'Note de frais déplacements pro',
  employee_commuting: 'Données déplacements domicile-travail',
  freight_invoice: 'Facture fret (aérien/maritime/routier)',
  // Scope 3 - Achats et déchets
  purchase_invoice: 'Facture achats biens/services',
  waste_invoice: 'Facture traitement déchets',
  water_bill: 'Facture eau',
  // Scope 3 - Autres
  asset_invoice: 'Facture immobilisations',
  leasing_invoice: 'Contrat leasing/location',
  csv_import: 'Import CSV comptable',
  accounting_entries: 'Écritures comptables',
  other: 'Autre document',
};

export const OCR_STATUS_LABELS: Record<OcrStatus, string> = {
  pending: 'En attente',
  processing: 'En cours',
  processed: 'Traité',
  failed: 'Échec',
  manual_required: 'Vérification manuelle',
};

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  pending: 'À valider',
  validated: 'Validé',
  rejected: 'Rejeté',
  modified: 'Modifié',
};

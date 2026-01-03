-- Ajouter le champ uncertainty_percent à activity_data
ALTER TABLE public.activity_data 
ADD COLUMN IF NOT EXISTS uncertainty_percent numeric DEFAULT NULL;

-- Ajouter un champ pour le type d'incertitude (facture réelle vs estimation)
ALTER TABLE public.activity_data 
ADD COLUMN IF NOT EXISTS uncertainty_source text DEFAULT NULL;

-- Ajouter un champ rejection_reason pour le workflow de rejet
ALTER TABLE public.data_collection_documents
ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT NULL;

-- Créer une vue pour les statistiques par scope
CREATE OR REPLACE VIEW public.scope_completion_stats AS
SELECT 
  ghg_scope,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN status = 'validated' OR status = 'integrated' THEN 1 END) as validated_count,
  SUM(COALESCE(co2_equivalent_kg, 0)) as total_co2_kg,
  ROUND(
    (COUNT(CASE WHEN status = 'validated' OR status = 'integrated' THEN 1 END)::numeric / 
     NULLIF(COUNT(*), 0) * 100), 
    0
  ) as completion_percent,
  user_id
FROM public.activity_data
GROUP BY ghg_scope, user_id;

-- Ajouter les nouveaux types de documents pour import CSV
ALTER TABLE public.data_collection_documents 
DROP CONSTRAINT IF EXISTS data_collection_documents_document_type_check;

ALTER TABLE public.data_collection_documents 
ADD CONSTRAINT data_collection_documents_document_type_check 
CHECK (document_type IN (
  'gas_bill', 'fuel_invoice', 'fuel_voucher', 'heating_oil_invoice', 'lpg_invoice', 'refrigerant_invoice',
  'electricity_bill', 'district_heating', 'district_cooling',
  'transport_invoice', 'business_travel', 'employee_commuting', 'freight_invoice',
  'purchase_invoice', 'waste_invoice', 'water_bill',
  'asset_invoice', 'leasing_invoice', 'other',
  'csv_import', 'accounting_entries'
));
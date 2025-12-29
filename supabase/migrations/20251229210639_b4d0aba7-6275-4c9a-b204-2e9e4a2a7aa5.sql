-- Drop the existing check constraint and recreate with fuel_voucher
ALTER TABLE data_collection_documents 
DROP CONSTRAINT IF EXISTS data_collection_documents_document_type_check;

-- Add new check constraint including fuel_voucher
ALTER TABLE data_collection_documents 
ADD CONSTRAINT data_collection_documents_document_type_check 
CHECK (document_type IN (
  'gas_bill', 
  'fuel_invoice', 
  'fuel_voucher',
  'heating_oil_invoice', 
  'lpg_invoice', 
  'refrigerant_invoice',
  'electricity_bill', 
  'district_heating', 
  'district_cooling',
  'transport_invoice', 
  'business_travel', 
  'employee_commuting', 
  'freight_invoice',
  'purchase_invoice', 
  'waste_invoice', 
  'water_bill',
  'asset_invoice', 
  'leasing_invoice', 
  'other'
));
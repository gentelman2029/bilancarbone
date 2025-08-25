-- CBAM Compliance Module - Phase 1: Core Database Schema
-- Conforme au Règlement (UE) 2023/956

-- ============================================================================
-- 1. TYPES ÉNUMÉRATIONS
-- ============================================================================

-- Secteurs CBAM officiels
CREATE TYPE cbam_sector AS ENUM (
  'cement',
  'iron_steel', 
  'aluminium',
  'fertilizers',
  'electricity',
  'hydrogen'
);

-- Méthodes de calcul des émissions
CREATE TYPE emission_method AS ENUM (
  'ACTUAL',     -- Données réelles vérifiées
  'DEFAULT',    -- Valeurs par défaut UE
  'HYBRID'      -- Mélange ACTUAL/DEFAULT
);

-- Statuts des rapports/déclarations
CREATE TYPE cbam_status AS ENUM (
  'draft',
  'submitted', 
  'corrected',
  'validated',
  'rejected'
);

-- Phases CBAM
CREATE TYPE cbam_phase AS ENUM (
  'transitional',  -- 2023-2025
  'operational'    -- 2026+
);

-- Priorités
CREATE TYPE priority_level AS ENUM (
  'high',
  'medium', 
  'low'
);

-- ============================================================================
-- 2. TABLES DE RÉFÉRENCE
-- ============================================================================

-- Importateurs avec identifiants EORI
CREATE TABLE cbam_importers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  eori_number TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Déclarants (peuvent être différents des importateurs)
CREATE TABLE cbam_declarants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  importer_id UUID REFERENCES cbam_importers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  eori_number TEXT,
  country_code CHAR(2) NOT NULL,
  contact_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fournisseurs/Producteurs
CREATE TABLE cbam_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  address TEXT,
  contact_email TEXT,
  tax_number TEXT,
  carbon_pricing_system TEXT, -- ETS équivalent du pays
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Installations de production
CREATE TABLE cbam_installations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id UUID REFERENCES cbam_suppliers(id) ON DELETE CASCADE,
  installation_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT, -- Coordonnées géographiques
  permit_number TEXT,
  sector cbam_sector NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produits avec codes CN8
CREATE TABLE cbam_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cn8_code CHAR(8) NOT NULL,
  product_name TEXT NOT NULL,
  sector cbam_sector NOT NULL,
  description TEXT,
  unit_measure TEXT NOT NULL DEFAULT 'tonnes',
  is_precursor BOOLEAN NOT NULL DEFAULT false,
  parent_product_id UUID REFERENCES cbam_products(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(cn8_code, sector)
);

-- ============================================================================
-- 3. DONNÉES TRANSACTIONNELLES
-- ============================================================================

-- Expéditions/Consignments
CREATE TABLE cbam_shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  importer_id UUID REFERENCES cbam_importers(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES cbam_suppliers(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES cbam_installations(id),
  
  -- Identification de l'expédition
  reference_number TEXT NOT NULL,
  import_date DATE NOT NULL,
  country_of_origin CHAR(2) NOT NULL,
  
  -- Données financières
  total_value_eur DECIMAL(12,2),
  currency_code CHAR(3),
  exchange_rate DECIMAL(10,4),
  exchange_rate_date DATE,
  
  -- Statut
  status cbam_status NOT NULL DEFAULT 'draft',
  phase cbam_phase NOT NULL DEFAULT 'transitional',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(reference_number, importer_id)
);

-- Détails des produits par expédition
CREATE TABLE cbam_shipment_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shipment_id UUID REFERENCES cbam_shipments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES cbam_products(id) ON DELETE RESTRICT,
  
  -- Quantités
  quantity DECIMAL(12,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'tonnes',
  
  -- Valeur unitaire
  unit_value_eur DECIMAL(10,2),
  total_value_eur DECIMAL(12,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. DONNÉES D'ÉMISSIONS
-- ============================================================================

-- Données d'émissions par produit/lot
CREATE TABLE cbam_emissions_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shipment_item_id UUID REFERENCES cbam_shipment_items(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES cbam_installations(id),
  
  -- Émissions directes (Scope 1)
  direct_emissions DECIMAL(10,4) NOT NULL DEFAULT 0, -- tCO2e/tonne
  direct_method emission_method NOT NULL,
  direct_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Émissions indirectes (Scope 2)
  indirect_emissions DECIMAL(10,4) NOT NULL DEFAULT 0, -- tCO2e/tonne
  indirect_method emission_method NOT NULL,
  indirect_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Métadonnées
  reporting_period TEXT NOT NULL, -- Q1-2024, Q2-2024, etc.
  verification_date DATE,
  verifier_name TEXT,
  measurement_uncertainty DECIMAL(5,2), -- %
  
  -- Documentation
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  calculation_details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Facteurs d'émission par défaut (valeurs UE officielles)
CREATE TABLE cbam_default_emission_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector cbam_sector NOT NULL,
  product_category TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  
  -- Facteurs par défaut
  direct_factor DECIMAL(10,4) NOT NULL, -- tCO2e/tonne
  indirect_factor DECIMAL(10,4) NOT NULL DEFAULT 0,
  
  -- Métadonnées
  valid_from DATE NOT NULL,
  valid_to DATE,
  source_regulation TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(sector, product_category, country_code, valid_from)
);

-- ============================================================================
-- 5. PRIX CARBONE PAYÉ À L'ORIGINE
-- ============================================================================

-- Prix carbone payé dans le pays d'origine
CREATE TABLE cbam_carbon_price_origin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shipment_item_id UUID REFERENCES cbam_shipment_items(id) ON DELETE CASCADE,
  
  -- Système de tarification carbone
  carbon_pricing_system TEXT NOT NULL, -- ETS, taxe carbone, etc.
  country_code CHAR(2) NOT NULL,
  
  -- Prix payé
  carbon_price_local DECIMAL(10,2) NOT NULL, -- Prix en devise locale
  local_currency CHAR(3) NOT NULL,
  carbon_price_eur DECIMAL(10,2) NOT NULL, -- Prix converti en EUR
  exchange_rate DECIMAL(10,4) NOT NULL,
  
  -- Période couverte
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Preuves documentaires
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. REPORTING ET CONFORMITÉ
-- ============================================================================

-- Rapports trimestriels (phase transitoire)
CREATE TABLE cbam_quarterly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  importer_id UUID REFERENCES cbam_importers(id) ON DELETE CASCADE,
  
  -- Période
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  year INTEGER NOT NULL CHECK (year >= 2023),
  
  -- Statut
  status cbam_status NOT NULL DEFAULT 'draft',
  phase cbam_phase NOT NULL DEFAULT 'transitional',
  
  -- Dates importantes
  submission_deadline DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Résumé du rapport
  total_shipments INTEGER NOT NULL DEFAULT 0,
  total_emissions_direct DECIMAL(12,3) NOT NULL DEFAULT 0,
  total_emissions_indirect DECIMAL(12,3) NOT NULL DEFAULT 0,
  total_value_eur DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Export
  export_file_path TEXT,
  export_generated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(importer_id, quarter, year)
);

-- Articles du rapport (détail par produit/pays)
CREATE TABLE cbam_quarterly_report_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_id UUID REFERENCES cbam_quarterly_reports(id) ON DELETE CASCADE,
  product_id UUID REFERENCES cbam_products(id) ON DELETE RESTRICT,
  
  -- Groupement par pays d'origine
  country_of_origin CHAR(2) NOT NULL,
  
  -- Agrégations
  total_quantity DECIMAL(12,3) NOT NULL,
  total_direct_emissions DECIMAL(12,3) NOT NULL,
  total_indirect_emissions DECIMAL(12,3) NOT NULL,
  total_value_eur DECIMAL(15,2) NOT NULL,
  
  -- Méthodes prédominantes
  predominant_direct_method emission_method NOT NULL,
  predominant_indirect_method emission_method NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. PHASE OPÉRATIONNELLE 2026+ (PRÉPARATION)
-- ============================================================================

-- Déclarations CBAM (phase opérationnelle)
CREATE TABLE cbam_declarations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  importer_id UUID REFERENCES cbam_importers(id) ON DELETE CASCADE,
  
  -- Période annuelle
  year INTEGER NOT NULL CHECK (year >= 2026),
  
  -- Obligation CBAM calculée
  total_cbam_obligation_eur DECIMAL(15,2) NOT NULL DEFAULT 0,
  certificates_required INTEGER NOT NULL DEFAULT 0,
  
  -- Statut
  status cbam_status NOT NULL DEFAULT 'draft',
  submission_deadline DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(importer_id, year)
);

-- Certificats CBAM (gestion des achats/surrender)
CREATE TABLE cbam_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  importer_id UUID REFERENCES cbam_importers(id) ON DELETE CASCADE,
  
  -- Certificat
  certificate_serial TEXT NOT NULL UNIQUE,
  certificate_type TEXT NOT NULL DEFAULT 'CBAM',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Transaction
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'surrender', 'transfer')),
  transaction_date DATE NOT NULL,
  unit_price_eur DECIMAL(8,2),
  total_cost_eur DECIMAL(12,2),
  
  -- Référence à la déclaration (pour surrender)
  declaration_id UUID REFERENCES cbam_declarations(id),
  
  -- Métadonnées
  validity_period_start DATE,
  validity_period_end DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. DONNÉES DE RÉFÉRENCE EXTERNES
-- ============================================================================

-- Taux de change ECB
CREATE TABLE cbam_exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency_code CHAR(3) NOT NULL,
  date DATE NOT NULL,
  rate_to_eur DECIMAL(10,6) NOT NULL,
  source TEXT NOT NULL DEFAULT 'ECB',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(currency_code, date)
);

-- Prix EU ETS (référence pour calcul obligation)
CREATE TABLE cbam_ets_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  price_eur_per_tonne DECIMAL(8,2) NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'front_month',
  source TEXT NOT NULL DEFAULT 'EEX',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(date, contract_type)
);

-- ============================================================================
-- 9. AUDIT ET LOGS
-- ============================================================================

-- Journal d'audit (traçabilité complète)
CREATE TABLE cbam_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Action
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Données
  old_values JSONB,
  new_values JSONB,
  
  -- Métadonnées
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. CONTRAINTES ET INDEX
-- ============================================================================

-- Index pour performance
CREATE INDEX idx_cbam_shipments_user_date ON cbam_shipments(user_id, import_date DESC);
CREATE INDEX idx_cbam_emissions_period ON cbam_emissions_data(reporting_period, user_id);
CREATE INDEX idx_cbam_products_sector ON cbam_products(sector, cn8_code);
CREATE INDEX idx_cbam_audit_user_table ON cbam_audit_log(user_id, table_name, timestamp DESC);

-- Index géographique
CREATE INDEX idx_cbam_installations_country ON cbam_installations(country_code);
CREATE INDEX idx_cbam_shipments_origin ON cbam_shipments(country_of_origin);

-- Index pour les rapports
CREATE INDEX idx_cbam_quarterly_reports_period ON cbam_quarterly_reports(year, quarter, user_id);
CREATE INDEX idx_cbam_declarations_year ON cbam_declarations(year, user_id);

-- ============================================================================
-- 11. FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction de mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_cbam_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_cbam_importers_updated_at BEFORE UPDATE ON cbam_importers FOR EACH ROW EXECUTE FUNCTION update_cbam_updated_at_column();
CREATE TRIGGER update_cbam_suppliers_updated_at BEFORE UPDATE ON cbam_suppliers FOR EACH ROW EXECUTE FUNCTION update_cbam_updated_at_column();
CREATE TRIGGER update_cbam_installations_updated_at BEFORE UPDATE ON cbam_installations FOR EACH ROW EXECUTE FUNCTION update_cbam_updated_at_column();
CREATE TRIGGER update_cbam_products_updated_at BEFORE UPDATE ON cbam_products FOR EACH ROW EXECUTE FUNCTION update_cbam_updated_at_column();
CREATE TRIGGER update_cbam_shipments_updated_at BEFORE UPDATE ON cbam_shipments FOR EACH ROW EXECUTE FUNCTION update_cbam_updated_at_column();
CREATE TRIGGER update_cbam_emissions_data_updated_at BEFORE UPDATE ON cbam_emissions_data FOR EACH ROW EXECUTE FUNCTION update_cbam_updated_at_column();

-- Fonction d'audit automatique
CREATE OR REPLACE FUNCTION cbam_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cbam_audit_log (
    user_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers d'audit sur les tables critiques
CREATE TRIGGER cbam_shipments_audit AFTER INSERT OR UPDATE OR DELETE ON cbam_shipments FOR EACH ROW EXECUTE FUNCTION cbam_audit_trigger();
CREATE TRIGGER cbam_emissions_data_audit AFTER INSERT OR UPDATE OR DELETE ON cbam_emissions_data FOR EACH ROW EXECUTE FUNCTION cbam_audit_trigger();
CREATE TRIGGER cbam_quarterly_reports_audit AFTER INSERT OR UPDATE OR DELETE ON cbam_quarterly_reports FOR EACH ROW EXECUTE FUNCTION cbam_audit_trigger();
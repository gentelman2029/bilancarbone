-- ============================================================
-- MODULE DE COLLECTE AUTOMATISÉE DE DONNÉES CARBONE
-- Tables pour OCR, API ERP et workflow de validation
-- ============================================================

-- Table des documents téléchargés (factures STEG, carburant, transport)
CREATE TABLE public.data_collection_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Métadonnées du fichier
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Classification du document
  document_type TEXT NOT NULL CHECK (document_type IN ('electricity_bill', 'fuel_invoice', 'transport_invoice', 'gas_bill', 'water_bill', 'other')),
  supplier_name TEXT, -- Ex: STEG, Total, Engie
  country_code CHAR(2) DEFAULT 'TN',
  
  -- Statut OCR
  ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'processed', 'failed', 'manual_required')),
  ocr_processed_at TIMESTAMP WITH TIME ZONE,
  ocr_raw_result JSONB, -- Résultat brut de l'OCR
  ocr_confidence_score NUMERIC(5,2), -- Score de confiance 0-100
  ocr_error_message TEXT,
  
  -- Données extraites par OCR (avant validation)
  extracted_data JSONB DEFAULT '{}',
  
  -- Statut de validation
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected', 'modified')),
  validated_by UUID,
  validated_at TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  
  -- Horodatage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des données d'activité (consommations validées)
CREATE TABLE public.activity_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Source de la donnée
  source_type TEXT NOT NULL CHECK (source_type IN ('ocr', 'erp_api', 'manual', 'import_csv')),
  source_document_id UUID REFERENCES public.data_collection_documents(id),
  source_reference TEXT, -- Référence ERP ou numéro de facture
  
  -- Période de la consommation
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Classification GHG Protocol
  ghg_scope TEXT NOT NULL CHECK (ghg_scope IN ('scope1', 'scope2', 'scope3')),
  ghg_category TEXT NOT NULL, -- Ex: 'electricite', 'transport_routier', 'gaz_naturel'
  ghg_subcategory TEXT, -- Sous-catégorie plus précise
  
  -- Données de consommation
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- kWh, litres, km, m3, tonnes
  
  -- Données financières (optionnel)
  amount_ht NUMERIC,
  amount_ttc NUMERIC,
  currency_code CHAR(3) DEFAULT 'TND',
  
  -- Fournisseur
  supplier_name TEXT,
  supplier_country TEXT,
  
  -- Facteur d'émission appliqué
  emission_factor_value NUMERIC,
  emission_factor_unit TEXT,
  emission_factor_source TEXT, -- ADEME, GIEC, EPA, etc.
  
  -- Calcul carbone
  co2_equivalent_kg NUMERIC, -- Résultat en kg CO2e
  calculation_metadata_id UUID, -- Lien vers les métadonnées de calcul
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'integrated', 'archived')),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des résultats de calcul carbone
CREATE TABLE public.carbon_calculations_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Référence à la donnée d'activité
  activity_data_id UUID REFERENCES public.activity_data(id) NOT NULL,
  
  -- Calcul
  calculation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  calculation_version INTEGER NOT NULL DEFAULT 1,
  
  -- Entrées du calcul
  input_quantity NUMERIC NOT NULL,
  input_unit TEXT NOT NULL,
  
  -- Facteur d'émission
  emission_factor_value NUMERIC NOT NULL,
  emission_factor_unit TEXT NOT NULL, -- Ex: kgCO2e/kWh, kgCO2e/litre
  emission_factor_source TEXT NOT NULL, -- Ex: ADEME 2023, STEG 2024
  emission_factor_reference TEXT, -- URL ou référence documentaire
  
  -- Résultat
  co2_equivalent_kg NUMERIC NOT NULL,
  co2_equivalent_tonnes NUMERIC GENERATED ALWAYS AS (co2_equivalent_kg / 1000) STORED,
  
  -- Incertitude
  uncertainty_percent NUMERIC,
  uncertainty_method TEXT,
  
  -- Métadonnées réglementaires
  methodology TEXT, -- GHG Protocol, BEGES, ISO 14064
  regulation_reference TEXT,
  
  -- Traçabilité
  previous_calculation_id UUID REFERENCES public.carbon_calculations_v2(id),
  change_reason TEXT,
  
  -- Vérification
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Horodatage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de configuration des connexions ERP
CREATE TABLE public.erp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Configuration
  name TEXT NOT NULL,
  erp_type TEXT NOT NULL, -- SAP, Sage, Odoo, Custom, etc.
  connection_type TEXT NOT NULL CHECK (connection_type IN ('webhook', 'api_pull', 'sftp')),
  
  -- Paramètres de connexion (chiffrés)
  api_endpoint TEXT,
  webhook_secret TEXT,
  auth_type TEXT CHECK (auth_type IN ('api_key', 'oauth2', 'basic')),
  
  -- Mapping des champs
  field_mapping JSONB NOT NULL DEFAULT '{}',
  
  -- Statut
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT,
  last_sync_records_count INTEGER,
  
  -- Horodatage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de log des imports ERP
CREATE TABLE public.erp_import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.erp_connections(id) NOT NULL,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Import
  import_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  import_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Statistiques
  records_received INTEGER DEFAULT 0,
  records_processed INTEGER DEFAULT 0,
  records_validated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  error_message TEXT,
  error_details JSONB,
  
  -- Données brutes reçues
  raw_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Facteurs d'émission tunisiens (STEG, carburants locaux)
CREATE TABLE public.emission_factors_local (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Classification
  country_code CHAR(2) NOT NULL DEFAULT 'TN',
  category TEXT NOT NULL, -- electricite, gaz_naturel, diesel, essence, etc.
  subcategory TEXT,
  
  -- Valeurs
  factor_value NUMERIC NOT NULL,
  factor_unit TEXT NOT NULL, -- kgCO2e/kWh, kgCO2e/litre, etc.
  
  -- Source et validité
  source_name TEXT NOT NULL, -- STEG, Ministère Environnement, ADEME
  source_reference TEXT,
  source_url TEXT,
  valid_from DATE NOT NULL,
  valid_to DATE,
  
  -- Métadonnées
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertion des facteurs d'émission tunisiens par défaut
INSERT INTO public.emission_factors_local (country_code, category, subcategory, factor_value, factor_unit, source_name, source_reference, valid_from, is_default, is_active) VALUES
-- Électricité STEG (mix tunisien)
('TN', 'electricite', 'mix_national_steg', 0.456, 'kgCO2e/kWh', 'STEG', 'Rapport annuel STEG 2023', '2023-01-01', true, true),
-- Gaz naturel
('TN', 'gaz_naturel', 'combustion', 2.0, 'kgCO2e/m3', 'GIEC', 'AR6 2021', '2021-01-01', true, true),
-- Carburants
('TN', 'carburant', 'diesel', 2.68, 'kgCO2e/litre', 'ADEME', 'Base Carbone 2023', '2023-01-01', true, true),
('TN', 'carburant', 'essence', 2.31, 'kgCO2e/litre', 'ADEME', 'Base Carbone 2023', '2023-01-01', true, true),
('TN', 'carburant', 'gpl', 1.66, 'kgCO2e/litre', 'ADEME', 'Base Carbone 2023', '2023-01-01', true, true),
-- Transport
('TN', 'transport', 'camion_diesel', 0.15, 'kgCO2e/t.km', 'ADEME', 'Base Carbone 2023', '2023-01-01', true, true),
('TN', 'transport', 'vehicule_leger', 0.22, 'kgCO2e/km', 'ADEME', 'Base Carbone 2023', '2023-01-01', true, true);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- data_collection_documents
ALTER TABLE public.data_collection_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" 
ON public.data_collection_documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.data_collection_documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.data_collection_documents FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.data_collection_documents FOR DELETE 
USING (auth.uid() = user_id);

-- activity_data
ALTER TABLE public.activity_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity data" 
ON public.activity_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity data" 
ON public.activity_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity data" 
ON public.activity_data FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity data" 
ON public.activity_data FOR DELETE 
USING (auth.uid() = user_id);

-- carbon_calculations_v2
ALTER TABLE public.carbon_calculations_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calculations" 
ON public.carbon_calculations_v2 FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculations" 
ON public.carbon_calculations_v2 FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" 
ON public.carbon_calculations_v2 FOR UPDATE 
USING (auth.uid() = user_id);

-- erp_connections
ALTER TABLE public.erp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ERP connections" 
ON public.erp_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ERP connections" 
ON public.erp_connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ERP connections" 
ON public.erp_connections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ERP connections" 
ON public.erp_connections FOR DELETE 
USING (auth.uid() = user_id);

-- erp_import_logs
ALTER TABLE public.erp_import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own import logs" 
ON public.erp_import_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import logs" 
ON public.erp_import_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- emission_factors_local (public read)
ALTER TABLE public.emission_factors_local ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view local emission factors" 
ON public.emission_factors_local FOR SELECT 
USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_data_collection_documents_updated_at
BEFORE UPDATE ON public.data_collection_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_data_updated_at
BEFORE UPDATE ON public.activity_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carbon_calculations_v2_updated_at
BEFORE UPDATE ON public.carbon_calculations_v2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_erp_connections_updated_at
BEFORE UPDATE ON public.erp_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emission_factors_local_updated_at
BEFORE UPDATE ON public.emission_factors_local
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_documents_user_status ON public.data_collection_documents(user_id, ocr_status);
CREATE INDEX idx_documents_org_type ON public.data_collection_documents(organization_id, document_type);
CREATE INDEX idx_activity_data_user_period ON public.activity_data(user_id, period_start, period_end);
CREATE INDEX idx_activity_data_scope ON public.activity_data(ghg_scope, ghg_category);
CREATE INDEX idx_calculations_activity ON public.carbon_calculations_v2(activity_data_id);
CREATE INDEX idx_emission_factors_category ON public.emission_factors_local(country_code, category, is_active);

-- ============================================================
-- STORAGE BUCKET pour les documents
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-collection-documents',
  'data-collection-documents',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'data-collection-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'data-collection-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'data-collection-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
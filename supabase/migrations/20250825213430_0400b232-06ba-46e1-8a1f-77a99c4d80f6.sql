-- CBAM Security Fix - Activation RLS et Politiques de Sécurité
-- Corrige les erreurs critiques de sécurité détectées par le linter

-- ============================================================================
-- 1. ACTIVATION RLS SUR TOUTES LES TABLES CBAM
-- ============================================================================

-- Tables de référence
ALTER TABLE cbam_importers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_declarants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_products ENABLE ROW LEVEL SECURITY;

-- Tables transactionnelles
ALTER TABLE cbam_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_shipment_items ENABLE ROW LEVEL SECURITY;

-- Données d'émissions
ALTER TABLE cbam_emissions_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_default_emission_factors ENABLE ROW LEVEL SECURITY;

-- Prix carbone
ALTER TABLE cbam_carbon_price_origin ENABLE ROW LEVEL SECURITY;

-- Reporting
ALTER TABLE cbam_quarterly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_quarterly_report_items ENABLE ROW LEVEL SECURITY;

-- Phase opérationnelle 2026+
ALTER TABLE cbam_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_certificates ENABLE ROW LEVEL SECURITY;

-- Données de référence externes (publiques)
ALTER TABLE cbam_exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbam_ets_prices ENABLE ROW LEVEL SECURITY;

-- Audit
ALTER TABLE cbam_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLITIQUES RLS - TABLES DE RÉFÉRENCE
-- ============================================================================

-- IMPORTATEURS
CREATE POLICY "Users can view their own importers" 
ON cbam_importers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own importers" 
ON cbam_importers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own importers" 
ON cbam_importers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own importers" 
ON cbam_importers FOR DELETE 
USING (auth.uid() = user_id);

-- DÉCLARANTS
CREATE POLICY "Users can view their own declarants" 
ON cbam_declarants FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own declarants" 
ON cbam_declarants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own declarants" 
ON cbam_declarants FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own declarants" 
ON cbam_declarants FOR DELETE 
USING (auth.uid() = user_id);

-- FOURNISSEURS
CREATE POLICY "Users can view their own suppliers" 
ON cbam_suppliers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suppliers" 
ON cbam_suppliers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" 
ON cbam_suppliers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" 
ON cbam_suppliers FOR DELETE 
USING (auth.uid() = user_id);

-- INSTALLATIONS
CREATE POLICY "Users can view their own installations" 
ON cbam_installations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own installations" 
ON cbam_installations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installations" 
ON cbam_installations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installations" 
ON cbam_installations FOR DELETE 
USING (auth.uid() = user_id);

-- PRODUITS
CREATE POLICY "Users can view their own products" 
ON cbam_products FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON cbam_products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON cbam_products FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON cbam_products FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 3. POLITIQUES RLS - DONNÉES TRANSACTIONNELLES
-- ============================================================================

-- EXPÉDITIONS
CREATE POLICY "Users can view their own shipments" 
ON cbam_shipments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipments" 
ON cbam_shipments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipments" 
ON cbam_shipments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipments" 
ON cbam_shipments FOR DELETE 
USING (auth.uid() = user_id);

-- ARTICLES D'EXPÉDITION
CREATE POLICY "Users can view their own shipment items" 
ON cbam_shipment_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipment items" 
ON cbam_shipment_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipment items" 
ON cbam_shipment_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipment items" 
ON cbam_shipment_items FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 4. POLITIQUES RLS - DONNÉES D'ÉMISSIONS
-- ============================================================================

-- DONNÉES D'ÉMISSIONS
CREATE POLICY "Users can view their own emissions data" 
ON cbam_emissions_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emissions data" 
ON cbam_emissions_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emissions data" 
ON cbam_emissions_data FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emissions data" 
ON cbam_emissions_data FOR DELETE 
USING (auth.uid() = user_id);

-- FACTEURS D'ÉMISSION PAR DÉFAUT (lectures publiques pour les valeurs officielles UE)
CREATE POLICY "Everyone can view default emission factors" 
ON cbam_default_emission_factors FOR SELECT 
USING (true);

-- Seuls les administrateurs peuvent modifier les facteurs par défaut (simulation)
CREATE POLICY "Admins can manage default emission factors" 
ON cbam_default_emission_factors FOR ALL 
USING (false); -- Temporaire - à remplacer par une vérification de rôle admin

-- ============================================================================
-- 5. POLITIQUES RLS - PRIX CARBONE
-- ============================================================================

-- PRIX CARBONE À L'ORIGINE
CREATE POLICY "Users can view their own carbon price origins" 
ON cbam_carbon_price_origin FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own carbon price origins" 
ON cbam_carbon_price_origin FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carbon price origins" 
ON cbam_carbon_price_origin FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carbon price origins" 
ON cbam_carbon_price_origin FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 6. POLITIQUES RLS - REPORTING
-- ============================================================================

-- RAPPORTS TRIMESTRIELS
CREATE POLICY "Users can view their own quarterly reports" 
ON cbam_quarterly_reports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quarterly reports" 
ON cbam_quarterly_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quarterly reports" 
ON cbam_quarterly_reports FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quarterly reports" 
ON cbam_quarterly_reports FOR DELETE 
USING (auth.uid() = user_id);

-- ARTICLES DE RAPPORT TRIMESTRIEL
CREATE POLICY "Users can view their own quarterly report items" 
ON cbam_quarterly_report_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quarterly report items" 
ON cbam_quarterly_report_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quarterly report items" 
ON cbam_quarterly_report_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quarterly report items" 
ON cbam_quarterly_report_items FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 7. POLITIQUES RLS - PHASE OPÉRATIONNELLE 2026+
-- ============================================================================

-- DÉCLARATIONS CBAM
CREATE POLICY "Users can view their own declarations" 
ON cbam_declarations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own declarations" 
ON cbam_declarations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own declarations" 
ON cbam_declarations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own declarations" 
ON cbam_declarations FOR DELETE 
USING (auth.uid() = user_id);

-- CERTIFICATS CBAM
CREATE POLICY "Users can view their own certificates" 
ON cbam_certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates" 
ON cbam_certificates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates" 
ON cbam_certificates FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates" 
ON cbam_certificates FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 8. POLITIQUES RLS - DONNÉES DE RÉFÉRENCE EXTERNES
-- ============================================================================

-- TAUX DE CHANGE ECB (lecture publique pour tous)
CREATE POLICY "Everyone can view exchange rates" 
ON cbam_exchange_rates FOR SELECT 
USING (true);

-- Seuls les services automatisés peuvent insérer les taux (simulation)
CREATE POLICY "System can manage exchange rates" 
ON cbam_exchange_rates FOR ALL 
USING (false); -- Temporaire - à remplacer par une vérification de service

-- PRIX EU ETS (lecture publique pour tous)
CREATE POLICY "Everyone can view ETS prices" 
ON cbam_ets_prices FOR SELECT 
USING (true);

-- Seuls les services automatisés peuvent insérer les prix (simulation)
CREATE POLICY "System can manage ETS prices" 
ON cbam_ets_prices FOR ALL 
USING (false); -- Temporaire - à remplacer par une vérification de service

-- ============================================================================
-- 9. POLITIQUES RLS - AUDIT
-- ============================================================================

-- LOGS D'AUDIT
CREATE POLICY "Users can view their own audit logs" 
ON cbam_audit_log FOR SELECT 
USING (auth.uid() = user_id);

-- Les logs d'audit sont créés automatiquement par les triggers
CREATE POLICY "System can create audit logs" 
ON cbam_audit_log FOR INSERT 
WITH CHECK (true);

-- Pas de modification/suppression des logs d'audit pour l'intégrité
-- CREATE POLICY "No modification of audit logs" 
-- ON cbam_audit_log FOR UPDATE USING (false);
-- CREATE POLICY "No deletion of audit logs" 
-- ON cbam_audit_log FOR DELETE USING (false);

-- ============================================================================
-- 10. CORRECTION SEARCH_PATH POUR LES FONCTIONS
-- ============================================================================

-- Correction de la fonction update_cbam_updated_at_column
CREATE OR REPLACE FUNCTION update_cbam_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Correction de la fonction cbam_audit_trigger
CREATE OR REPLACE FUNCTION cbam_audit_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;
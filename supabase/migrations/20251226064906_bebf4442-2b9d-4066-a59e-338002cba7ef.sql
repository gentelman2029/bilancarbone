-- ==============================================
-- PHASE 1: PERSISTANCE + AUDIT TRAIL COMMERCIAL
-- Migration complète corrigée
-- ==============================================

-- 1. Enum pour les rôles granulaires
CREATE TYPE public.app_role AS ENUM (
  'admin_org',
  'supervisor',
  'user',
  'accountant',
  'auditor'
);

-- 2. Table Organizations (multi-tenant)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  registration_number TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'FR',
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  cbam_registration_id TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table Organization Members
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

-- 4. Table User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 5. Table CBAM Calculation Metadata
CREATE TABLE public.cbam_calculation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  calculation_version INTEGER NOT NULL DEFAULT 1,
  emission_factor_source TEXT NOT NULL,
  emission_factor_value NUMERIC,
  emission_factor_unit TEXT DEFAULT 'tCO2e/t',
  regulation_reference TEXT,
  methodology_reference TEXT,
  default_factor_source TEXT,
  assumptions JSONB DEFAULT '[]'::jsonb,
  uncertainty_percent NUMERIC,
  uncertainty_method TEXT,
  data_source TEXT,
  verification_status TEXT DEFAULT 'unverified',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  previous_version_id UUID REFERENCES public.cbam_calculation_metadata(id),
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table CBAM Audit Events
CREATE TABLE public.cbam_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  previous_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Ajouter organization_id aux tables CBAM existantes
ALTER TABLE public.cbam_importers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_suppliers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_products ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_shipments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_installations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_emissions_data ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_quarterly_reports ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_declarations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cbam_certificates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- 8. RLS sur les nouvelles tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbam_calculation_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbam_audit_events ENABLE ROW LEVEL SECURITY;

-- 9. Fonction helper pour vérifier l'appartenance
CREATE OR REPLACE FUNCTION public.user_has_org_access(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND is_active = true
  )
$$;

-- 10. Fonction pour obtenir le rôle
CREATE OR REPLACE FUNCTION public.user_org_role(_user_id UUID, _org_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id
    AND organization_id = _org_id
    AND is_active = true
  LIMIT 1
$$;

-- 11. Fonction pour vérifier niveau de rôle minimum (corrigée)
CREATE OR REPLACE FUNCTION public.user_has_min_role(_user_id UUID, _org_id UUID, _min_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND is_active = true
      AND role = ANY(
        CASE 
          WHEN _min_role = 'auditor' THEN ARRAY['admin_org', 'supervisor', 'user', 'accountant', 'auditor']::app_role[]
          WHEN _min_role = 'accountant' THEN ARRAY['admin_org', 'supervisor', 'user', 'accountant']::app_role[]
          WHEN _min_role = 'user' THEN ARRAY['admin_org', 'supervisor', 'user']::app_role[]
          WHEN _min_role = 'supervisor' THEN ARRAY['admin_org', 'supervisor']::app_role[]
          WHEN _min_role = 'admin_org' THEN ARRAY['admin_org']::app_role[]
        END
      )
  )
$$;

-- 12. RLS Policies - Organizations
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (public.user_has_org_access(auth.uid(), id));

CREATE POLICY "Admins can update their organizations"
ON public.organizations FOR UPDATE
USING (public.user_org_role(auth.uid(), id) = 'admin_org');

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 13. RLS Policies - Organization Members
CREATE POLICY "Users can view members of their organizations"
ON public.organization_members FOR SELECT
USING (public.user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins can manage organization members"
ON public.organization_members FOR ALL
USING (public.user_org_role(auth.uid(), organization_id) = 'admin_org');

CREATE POLICY "Users can join organizations"
ON public.organization_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 14. RLS Policies - User Roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- 15. RLS Policies - Calculation Metadata
CREATE POLICY "View calculation metadata"
ON public.cbam_calculation_metadata FOR SELECT
USING (public.user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Create calculation metadata"
ON public.cbam_calculation_metadata FOR INSERT
WITH CHECK (public.user_has_min_role(auth.uid(), organization_id, 'user'));

CREATE POLICY "Update calculation metadata"
ON public.cbam_calculation_metadata FOR UPDATE
USING (public.user_has_min_role(auth.uid(), organization_id, 'user'));

-- 16. RLS Policies - Audit Events
CREATE POLICY "View audit events"
ON public.cbam_audit_events FOR SELECT
USING (
  organization_id IS NULL 
  OR public.user_has_org_access(auth.uid(), organization_id)
);

CREATE POLICY "Create audit events"
ON public.cbam_audit_events FOR INSERT
WITH CHECK (true);

-- 17. Triggers pour updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cbam_calculation_metadata_updated_at
  BEFORE UPDATE ON public.cbam_calculation_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 18. Index pour performance
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_calc_metadata_entity ON public.cbam_calculation_metadata(entity_type, entity_id);
CREATE INDEX idx_calc_metadata_org ON public.cbam_calculation_metadata(organization_id);
CREATE INDEX idx_audit_events_org ON public.cbam_audit_events(organization_id);
CREATE INDEX idx_audit_events_entity ON public.cbam_audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_occurred ON public.cbam_audit_events(occurred_at DESC);
CREATE INDEX idx_cbam_importers_org ON public.cbam_importers(organization_id);
CREATE INDEX idx_cbam_suppliers_org ON public.cbam_suppliers(organization_id);
CREATE INDEX idx_cbam_products_org ON public.cbam_products(organization_id);
CREATE INDEX idx_cbam_shipments_org ON public.cbam_shipments(organization_id);
CREATE INDEX idx_cbam_installations_org ON public.cbam_installations(organization_id);
CREATE INDEX idx_cbam_emissions_data_org ON public.cbam_emissions_data(organization_id);
CREATE INDEX idx_cbam_quarterly_reports_org ON public.cbam_quarterly_reports(organization_id);
CREATE INDEX idx_cbam_declarations_org ON public.cbam_declarations(organization_id);
CREATE INDEX idx_cbam_certificates_org ON public.cbam_certificates(organization_id);
-- Améliorer la table emissions_calculations pour supporter les KPIs du dashboard
ALTER TABLE public.emissions_calculations 
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS period_start DATE,
ADD COLUMN IF NOT EXISTS period_end DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'::text,
ADD COLUMN IF NOT EXISTS carbon_intensity NUMERIC DEFAULT 0;

-- Créer une table pour les bilans carbone complets
CREATE TABLE IF NOT EXISTS public.carbon_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calculation_id UUID REFERENCES public.emissions_calculations(id),
  report_name TEXT NOT NULL,
  period TEXT NOT NULL,
  total_co2e NUMERIC NOT NULL DEFAULT 0,
  scope1_total NUMERIC NOT NULL DEFAULT 0,
  scope2_total NUMERIC NOT NULL DEFAULT 0,
  scope3_total NUMERIC NOT NULL DEFAULT 0,
  carbon_intensity NUMERIC DEFAULT 0,
  company_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carbon_reports ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour carbon_reports
CREATE POLICY "Users can view their own reports" 
ON public.carbon_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.carbon_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
ON public.carbon_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
ON public.carbon_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger pour la mise à jour automatique des timestamps
CREATE TRIGGER update_carbon_reports_updated_at
BEFORE UPDATE ON public.carbon_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer une vue pour les données du dashboard
CREATE OR REPLACE VIEW public.dashboard_data AS
SELECT 
  r.id as report_id,
  r.user_id,
  r.report_name,
  r.period,
  r.total_co2e,
  r.scope1_total,
  r.scope2_total,
  r.scope3_total,
  r.carbon_intensity,
  r.company_info,
  r.created_at,
  r.updated_at,
  -- Données détaillées des émissions
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'category', category,
        'subcategory', subcategory,
        'scope_type', scope_type,
        'value', value,
        'co2_equivalent', co2_equivalent
      )
    )
    FROM public.emissions_data ed 
    WHERE ed.calculation_id = r.calculation_id), 
    '[]'::json
  ) as emissions_breakdown
FROM public.carbon_reports r
LEFT JOIN public.emissions_calculations ec ON r.calculation_id = ec.id;
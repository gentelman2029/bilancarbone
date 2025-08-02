-- Supprimer la vue existante qui pose un problème de sécurité
DROP VIEW IF EXISTS public.dashboard_data;

-- Créer la vue sans SECURITY DEFINER et avec les bonnes permissions
CREATE VIEW public.dashboard_data AS
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
LEFT JOIN public.emissions_calculations ec ON r.calculation_id = ec.id
WHERE r.user_id = auth.uid(); -- Assurer que seules les données de l'utilisateur sont accessibles

-- Activer RLS sur la vue
ALTER VIEW public.dashboard_data SET (security_invoker = true);
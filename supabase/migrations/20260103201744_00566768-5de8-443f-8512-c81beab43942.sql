-- Fixer la vue pour qu'elle respecte RLS (pas de SECURITY DEFINER)
DROP VIEW IF EXISTS public.scope_completion_stats;

-- Recréer la vue avec SECURITY INVOKER (comportement par défaut, mais explicite)
CREATE VIEW public.scope_completion_stats 
WITH (security_invoker = on) AS
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
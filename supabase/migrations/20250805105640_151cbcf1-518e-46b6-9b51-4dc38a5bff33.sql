-- Ajouter le champ progress à la table carbon_actions
ALTER TABLE public.carbon_actions 
ADD COLUMN IF NOT EXISTS progress numeric DEFAULT 0;
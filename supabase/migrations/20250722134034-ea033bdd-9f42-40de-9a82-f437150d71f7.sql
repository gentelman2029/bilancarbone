-- Créer les tables pour les données d'émissions et actions

-- Table pour stocker les calculs d'émissions
CREATE TABLE public.emissions_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope1 DECIMAL(15,3) NOT NULL DEFAULT 0,
  scope2 DECIMAL(15,3) NOT NULL DEFAULT 0,
  scope3 DECIMAL(15,3) NOT NULL DEFAULT 0,
  total DECIMAL(15,3) NOT NULL DEFAULT 0,
  calculation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour stocker les données de collecte détaillées
CREATE TABLE public.emissions_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID REFERENCES public.emissions_calculations(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('scope1', 'scope2', 'scope3')),
  category TEXT NOT NULL,
  subcategory TEXT,
  value DECIMAL(15,3) NOT NULL,
  unit TEXT NOT NULL,
  emission_factor DECIMAL(10,6),
  co2_equivalent DECIMAL(15,3) NOT NULL,
  data_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les actions recommandées et personnalisées
CREATE TABLE public.carbon_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calculation_id UUID REFERENCES public.emissions_calculations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('scope1', 'scope2', 'scope3')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  estimated_reduction_kg DECIMAL(15,3),
  estimated_reduction_percent DECIMAL(5,2),
  estimated_cost DECIMAL(15,2),
  implementation_time TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'in_progress', 'completed', 'cancelled')),
  target_date DATE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.emissions_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emissions_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_actions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour emissions_calculations
CREATE POLICY "Users can view their own emissions calculations" 
ON public.emissions_calculations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emissions calculations" 
ON public.emissions_calculations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emissions calculations" 
ON public.emissions_calculations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emissions calculations" 
ON public.emissions_calculations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Politiques RLS pour emissions_data
CREATE POLICY "Users can view their emissions data" 
ON public.emissions_data 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.emissions_calculations 
  WHERE id = emissions_data.calculation_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can insert emissions data" 
ON public.emissions_data 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.emissions_calculations 
  WHERE id = emissions_data.calculation_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update emissions data" 
ON public.emissions_data 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.emissions_calculations 
  WHERE id = emissions_data.calculation_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can delete emissions data" 
ON public.emissions_data 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.emissions_calculations 
  WHERE id = emissions_data.calculation_id 
  AND user_id = auth.uid()
));

-- Politiques RLS pour carbon_actions
CREATE POLICY "Users can view their own actions" 
ON public.carbon_actions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions" 
ON public.carbon_actions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions" 
ON public.carbon_actions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions" 
ON public.carbon_actions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger pour update_updated_at sur emissions_calculations
CREATE TRIGGER update_emissions_calculations_updated_at
BEFORE UPDATE ON public.emissions_calculations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour update_updated_at sur carbon_actions
CREATE TRIGGER update_carbon_actions_updated_at
BEFORE UPDATE ON public.carbon_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes pour améliorer les performances
CREATE INDEX idx_emissions_calculations_user_id ON public.emissions_calculations(user_id);
CREATE INDEX idx_emissions_calculations_created_at ON public.emissions_calculations(created_at DESC);
CREATE INDEX idx_emissions_data_calculation_id ON public.emissions_data(calculation_id);
CREATE INDEX idx_carbon_actions_user_id ON public.carbon_actions(user_id);
CREATE INDEX idx_carbon_actions_calculation_id ON public.carbon_actions(calculation_id);
CREATE INDEX idx_carbon_actions_status ON public.carbon_actions(status);
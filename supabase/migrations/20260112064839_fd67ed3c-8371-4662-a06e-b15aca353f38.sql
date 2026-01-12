-- ESG Configuration & Materiality Tables

-- Table for ESG weighting configuration
CREATE TABLE public.esg_weighting_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  mode TEXT NOT NULL CHECK (mode IN ('standard', 'sectoriel', 'expert')),
  sector TEXT,
  environment_weight NUMERIC(5,2) NOT NULL DEFAULT 33.33 CHECK (environment_weight >= 0 AND environment_weight <= 100),
  social_weight NUMERIC(5,2) NOT NULL DEFAULT 33.33 CHECK (social_weight >= 0 AND social_weight <= 100),
  governance_weight NUMERIC(5,2) NOT NULL DEFAULT 33.34 CHECK (governance_weight >= 0 AND governance_weight <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT weights_sum_100 CHECK (ABS((environment_weight + social_weight + governance_weight) - 100) < 0.01)
);

-- Table for custom materiality issues
CREATE TABLE public.esg_materiality_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  issue_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('E', 'S', 'G')),
  impact_nature TEXT NOT NULL CHECK (impact_nature IN ('positive', 'negative')),
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (severity * probability) STORED,
  opportunity TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.esg_weighting_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_materiality_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for esg_weighting_config
CREATE POLICY "Users can view their own weighting config"
ON public.esg_weighting_config FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weighting config"
ON public.esg_weighting_config FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weighting config"
ON public.esg_weighting_config FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weighting config"
ON public.esg_weighting_config FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for esg_materiality_issues
CREATE POLICY "Users can view their own materiality issues"
ON public.esg_materiality_issues FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own materiality issues"
ON public.esg_materiality_issues FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materiality issues"
ON public.esg_materiality_issues FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materiality issues"
ON public.esg_materiality_issues FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_esg_weighting_config_updated_at
BEFORE UPDATE ON public.esg_weighting_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esg_materiality_issues_updated_at
BEFORE UPDATE ON public.esg_materiality_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_esg_weighting_config_user_id ON public.esg_weighting_config(user_id);
CREATE INDEX idx_esg_materiality_issues_user_id ON public.esg_materiality_issues(user_id);
CREATE INDEX idx_esg_materiality_issues_category ON public.esg_materiality_issues(category);
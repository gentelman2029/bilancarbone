-- Create storage bucket for carbon footprint justification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'carbon-documents',
  'carbon-documents',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
);

-- Create table to track uploaded documents metadata
CREATE TABLE IF NOT EXISTS public.carbon_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES public.emissions_calculations(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carbon_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carbon_documents table
CREATE POLICY "Users can view their own documents"
  ON public.carbon_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.carbon_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.carbon_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.carbon_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for carbon-documents bucket
CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'carbon-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'carbon-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'carbon-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'carbon-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger to update updated_at
CREATE TRIGGER update_carbon_documents_updated_at
  BEFORE UPDATE ON public.carbon_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
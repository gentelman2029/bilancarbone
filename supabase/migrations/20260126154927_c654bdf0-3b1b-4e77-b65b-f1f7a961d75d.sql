-- Drop the existing check constraint
ALTER TABLE public.activity_data DROP CONSTRAINT IF EXISTS activity_data_source_type_check;

-- Add the updated check constraint with 'questionnaire' as a valid source type
ALTER TABLE public.activity_data 
ADD CONSTRAINT activity_data_source_type_check 
CHECK (source_type IN ('manual', 'ocr', 'csv', 'api', 'questionnaire'));
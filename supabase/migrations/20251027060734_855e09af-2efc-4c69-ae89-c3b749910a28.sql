-- Fix carbon_documents table: remove invalid foreign key to auth.users
ALTER TABLE public.carbon_documents 
DROP CONSTRAINT IF EXISTS carbon_documents_user_id_fkey;

-- Add proper user_id column constraint without foreign key
ALTER TABLE public.carbon_documents 
ALTER COLUMN user_id SET NOT NULL;
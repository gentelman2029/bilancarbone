-- Créer les policies RLS pour le bucket carbon-documents
-- Permettre aux utilisateurs authentifiés d'uploader leurs propres fichiers
CREATE POLICY "Users can upload their own cbam documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'carbon-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs authentifiés de lire leurs propres fichiers
CREATE POLICY "Users can read their own cbam documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'carbon-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs authentifiés de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own cbam documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'carbon-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs authentifiés de mettre à jour leurs propres fichiers
CREATE POLICY "Users can update their own cbam documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'carbon-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
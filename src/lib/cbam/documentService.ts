import { supabase } from '@/integrations/supabase/client';

export interface CBAMDocument {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  productId: string;
  uploadedAt: string;
}

const BUCKET_NAME = 'carbon-documents';

/**
 * Upload un fichier vers Supabase Storage et retourne les métadonnées
 */
export async function uploadCBAMDocument(
  file: File,
  productId: string,
  userId: string
): Promise<{ data: CBAMDocument | null; error: string | null }> {
  try {
    // Générer un chemin unique pour le fichier
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${productId}/${timestamp}_${safeName}`;

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      return { data: null, error: uploadError.message };
    }

    const doc: CBAMDocument = {
      id: `${productId}_${timestamp}`,
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
      productId,
      uploadedAt: new Date().toISOString(),
    };

    return { data: doc, error: null };
  } catch (err) {
    console.error('Erreur lors de l\'upload:', err);
    return { data: null, error: 'Erreur inattendue lors de l\'upload' };
  }
}

/**
 * Télécharge un fichier depuis Supabase Storage
 */
export async function downloadCBAMDocument(
  filePath: string
): Promise<{ data: Blob | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('Erreur download:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err);
    return { data: null, error: 'Erreur inattendue lors du téléchargement' };
  }
}

/**
 * Supprime un fichier depuis Supabase Storage
 */
export async function deleteCBAMDocument(
  filePath: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Erreur delete:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    return { error: 'Erreur inattendue lors de la suppression' };
  }
}

/**
 * Liste les documents d'un produit depuis le localStorage (métadonnées)
 */
export function getStoredDocuments(productId: string): CBAMDocument[] {
  try {
    const raw = localStorage.getItem(`cbam_documents_${productId}`);
    if (!raw) return [];
    return JSON.parse(raw) as CBAMDocument[];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde les métadonnées des documents dans le localStorage
 */
export function saveStoredDocuments(productId: string, docs: CBAMDocument[]): void {
  try {
    localStorage.setItem(`cbam_documents_${productId}`, JSON.stringify(docs));
  } catch (err) {
    console.error('Erreur sauvegarde documents:', err);
  }
}

/**
 * Ajoute un document aux métadonnées stockées
 */
export function addStoredDocument(productId: string, doc: CBAMDocument): void {
  const existing = getStoredDocuments(productId);
  existing.push(doc);
  saveStoredDocuments(productId, existing);
}

/**
 * Supprime un document des métadonnées stockées
 */
export function removeStoredDocument(productId: string, docId: string): void {
  const existing = getStoredDocuments(productId);
  const filtered = existing.filter((d) => d.id !== docId);
  saveStoredDocuments(productId, filtered);
}

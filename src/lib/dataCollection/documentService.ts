// Service pour la gestion des documents de collecte de données
import { supabase } from '@/integrations/supabase/client';
import type { DataCollectionDocument, ExtractedData, DocumentType } from './types';

interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

class DocumentCollectionService {
  
  // Uploader un document
  async uploadDocument(
    file: File,
    documentType: DocumentType,
    organizationId?: string
  ): Promise<ServiceResponse<DataCollectionDocument>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Générer un chemin unique
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}_${safeName}`;

      // Uploader vers le storage
      const { error: uploadError } = await supabase.storage
        .from('data-collection-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Créer l'entrée en base
      const { data, error } = await supabase
        .from('data_collection_documents')
        .insert({
          user_id: user.id,
          organization_id: organizationId || null,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          document_type: documentType,
          country_code: 'TN',
          ocr_status: 'pending',
          validation_status: 'pending',
          extracted_data: {}
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as DataCollectionDocument };
    } catch (error) {
      return { error: `Erreur lors de l'upload: ${error}` };
    }
  }

  // Lancer l'OCR sur un document
  async processOCR(documentId: string, imageBase64?: string, documentType?: DocumentType): Promise<ServiceResponse<ExtractedData>> {
    try {
      const { data, error } = await supabase.functions.invoke('ocr-invoice', {
        body: { 
          document_id: documentId,
          image_base64: imageBase64,
          document_type: documentType
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        return { error: data.error || 'OCR processing failed' };
      }

      return { data: data.data };
    } catch (error) {
      return { error: `Erreur OCR: ${error}` };
    }
  }

  // Récupérer les documents de l'utilisateur
  async getDocuments(filters?: {
    ocr_status?: string;
    validation_status?: string;
    document_type?: string;
  }): Promise<ServiceResponse<DataCollectionDocument[]>> {
    try {
      let query = supabase
        .from('data_collection_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.ocr_status) {
        query = query.eq('ocr_status', filters.ocr_status);
      }
      if (filters?.validation_status) {
        query = query.eq('validation_status', filters.validation_status);
      }
      if (filters?.document_type) {
        query = query.eq('document_type', filters.document_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: (data || []) as unknown as DataCollectionDocument[] };
    } catch (error) {
      return { error: `Erreur lors de la récupération: ${error}` };
    }
  }

  // Récupérer un document par ID
  async getDocument(id: string): Promise<ServiceResponse<DataCollectionDocument>> {
    try {
      const { data, error } = await supabase
        .from('data_collection_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as unknown as DataCollectionDocument };
    } catch (error) {
      return { error: `Erreur lors de la récupération: ${error}` };
    }
  }

  // Mettre à jour les données extraites (après validation/modification)
  async updateExtractedData(
    documentId: string,
    extractedData: ExtractedData,
    validationStatus: 'validated' | 'modified' | 'rejected',
    notes?: string
  ): Promise<ServiceResponse<DataCollectionDocument>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('data_collection_documents')
        .update({
          extracted_data: JSON.parse(JSON.stringify(extractedData)),
          validation_status: validationStatus,
          validated_by: user.id,
          validated_at: new Date().toISOString(),
          validation_notes: notes
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as DataCollectionDocument };
    } catch (error) {
      return { error: `Erreur lors de la mise à jour: ${error}` };
    }
  }

  // Helper: Supprimer les calculs et l'activité de manière séquentielle
  private async deleteActivityWithCalculations(activityId: string): Promise<void> {
    try {
      // 1. D'abord supprimer les calculs liés à cette activité
      const { error: calcError } = await supabase
        .from('carbon_calculations_v2')
        .delete()
        .eq('activity_data_id', activityId);
      
      if (calcError) {
        console.warn('Error deleting calculations for activity', activityId, calcError);
      }
      
      // 2. Puis supprimer l'activité elle-même
      const { error: actError } = await supabase
        .from('activity_data')
        .delete()
        .eq('id', activityId);
      
      if (actError) {
        console.warn('Error deleting activity', activityId, actError);
      }
    } catch (error) {
      console.warn('Error in deleteActivityWithCalculations:', error);
    }
  }

  // Supprimer un document et ses activités associées
  async deleteDocument(documentId: string): Promise<ServiceResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // 1. Récupérer le document avec son chemin fichier
      const { data: doc } = await supabase
        .from('data_collection_documents')
        .select('file_path')
        .eq('id', documentId)
        .maybeSingle();

      // 2. Récupérer les activités liées à ce document
      const { data: activities } = await supabase
        .from('activity_data')
        .select('id')
        .eq('source_document_id', documentId);

      // 3. Supprimer les activités et leurs calculs SÉQUENTIELLEMENT
      if (activities && activities.length > 0) {
        for (const activity of activities) {
          await this.deleteActivityWithCalculations(activity.id);
        }
      }

      // 4. Supprimer le fichier du storage
      if (doc?.file_path) {
        try {
          await supabase.storage
            .from('data-collection-documents')
            .remove([doc.file_path]);
        } catch (storageError) {
          console.warn('Storage deletion failed:', storageError);
        }
      }

      // 5. Supprimer le document de la base
      const { error } = await supabase
        .from('data_collection_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Document deletion error:', error);
        throw error;
      }
      
      return {};
    } catch (error) {
      console.error('Delete document error:', error);
      return { error: `Erreur lors de la suppression: ${error}` };
    }
  }

  // Supprimer tous les documents et les activités associées
  async deleteAllDocuments(): Promise<ServiceResponse<{ deleted: number }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // 1. Récupérer tous les documents pour le comptage et les fichiers
      const { data: docs } = await supabase
        .from('data_collection_documents')
        .select('id, file_path')
        .eq('user_id', user.id);

      const docCount = docs?.length || 0;

      // 2. Récupérer toutes les activités de l'utilisateur
      const { data: activities } = await supabase
        .from('activity_data')
        .select('id')
        .eq('user_id', user.id);

      // 3. Supprimer séquentiellement: calculs -> activités pour chaque activité
      if (activities && activities.length > 0) {
        for (const activity of activities) {
          await this.deleteActivityWithCalculations(activity.id);
        }
      }

      // 4. Supprimer tous les fichiers du storage
      if (docs && docs.length > 0) {
        const filePaths = docs.filter(d => d.file_path).map(d => d.file_path);
        if (filePaths.length > 0) {
          try {
            await supabase.storage
              .from('data-collection-documents')
              .remove(filePaths);
          } catch (storageError) {
            console.warn('Storage cleanup failed:', storageError);
          }
        }
      }

      // 5. Supprimer tous les documents de la base
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          await supabase
            .from('data_collection_documents')
            .delete()
            .eq('id', doc.id);
        }
      }
      
      // Clear localStorage workflow data
      localStorage.removeItem('workflow-data');
      
      return { data: { deleted: docCount } };
    } catch (error) {
      console.error('Reset all documents error:', error);
      return { error: `Erreur lors de la réinitialisation: ${error}` };
    }
  }

  // Obtenir l'URL de téléchargement d'un document
  async getDocumentUrl(filePath: string): Promise<ServiceResponse<string>> {
    try {
      const { data, error } = await supabase.storage
        .from('data-collection-documents')
        .createSignedUrl(filePath, 3600); // 1 heure

      if (error) throw error;
      return { data: data.signedUrl };
    } catch (error) {
      return { error: `Erreur lors de la génération de l'URL: ${error}` };
    }
  }
}

export const documentCollectionService = new DocumentCollectionService();
// Custom Hook pour la gestion des documents de collecte
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { DataCollectionDocument } from '@/lib/dataCollection/types';

interface UseDocumentsOptions {
  autoLoad?: boolean;
  filters?: {
    ocr_status?: string;
    validation_status?: string;
    document_type?: string;
  };
}

interface UseDocumentsReturn {
  documents: DataCollectionDocument[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  loadDocuments: () => Promise<void>;
  deleteDocument: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function useDataCollectionDocuments(
  options: UseDocumentsOptions = {}
): UseDocumentsReturn {
  const { autoLoad = true, filters } = options;
  
  const [documents, setDocuments] = useState<DataCollectionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadDocuments = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await documentCollectionService.getDocuments(filters);
      
      if (!isMountedRef.current) return;
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setDocuments(result.data || []);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      console.error('Error loading documents:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await documentCollectionService.deleteDocument(id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (isMountedRef.current) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
      
      toast.success('Document supprimé');
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  const refresh = useCallback(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    if (autoLoad) {
      loadDocuments();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [autoLoad, loadDocuments]);

  // Calculate pending count
  const pendingCount = documents.filter(
    d => d.ocr_status === 'processed' && d.validation_status === 'pending'
  ).length;

  return {
    documents,
    isLoading,
    error,
    pendingCount,
    loadDocuments,
    deleteDocument,
    refresh,
  };
}

// Hook spécifique pour le compteur de documents en attente
export function usePendingDocumentsCount(refreshTrigger?: number) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadCount = async () => {
      try {
        const result = await documentCollectionService.getDocuments({
          ocr_status: 'processed',
          validation_status: 'pending'
        });
        
        if (isMountedRef.current) {
          setCount(result.data?.length || 0);
        }
      } catch (error) {
        console.error('Error loading pending count:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadCount();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshTrigger]);

  return { count, isLoading };
}

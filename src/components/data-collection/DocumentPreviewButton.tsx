import { useState } from 'react';
import { FileText, Eye, ExternalLink, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { toast } from 'sonner';

interface DocumentPreviewButtonProps {
  documentId?: string;
  documentPath?: string;
  fileName?: string;
  compact?: boolean;
}

export function DocumentPreviewButton({ 
  documentId, 
  documentPath,
  fileName,
  compact = true 
}: DocumentPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    if (!documentPath && !documentId) {
      toast.info('Aucun justificatif lié', {
        description: 'Cette donnée provient d\'un import CSV ou d\'un questionnaire.'
      });
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      let filePath = documentPath;
      let docFileName = fileName;
      
      // Si on a un documentId mais pas de path, on récupère le document
      if (!filePath && documentId) {
        const result = await documentCollectionService.getDocument(documentId);
        if (result.error) {
          console.warn('Document fetch error:', result.error);
          throw new Error('Document non trouvé dans la base de données');
        }
        if (!result.data) {
          throw new Error('Document introuvable');
        }
        filePath = result.data.file_path;
        docFileName = result.data.file_name || fileName;
      }

      if (!filePath) {
        throw new Error('Chemin du fichier non disponible');
      }

      const urlResult = await documentCollectionService.getDocumentUrl(filePath);
      if (urlResult.error) {
        console.warn('URL generation error:', urlResult.error);
        throw new Error('Impossible de générer l\'URL de prévisualisation');
      }
      if (urlResult.data) {
        setPreviewUrl(urlResult.data);
      } else {
        throw new Error('URL non générée');
      }
    } catch (error: any) {
      console.error('Error loading document:', error);
      toast.error('Erreur lors du chargement', {
        description: error.message || 'Le document n\'est pas accessible'
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  if (!documentId && !documentPath) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled 
        className="text-muted-foreground"
        title="Aucun justificatif"
      >
        <FileText className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleOpen}
        className="hover:bg-primary/10"
        title="Voir le justificatif"
      >
        {compact ? (
          <Eye className="h-4 w-4" />
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Justificatif
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {fileName || 'Justificatif'}
              </span>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ouvrir
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="relative min-h-[400px] max-h-[70vh] overflow-auto rounded-lg border bg-muted/30">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : previewUrl ? (
              <div className="flex items-center justify-center p-4">
                <img 
                  src={previewUrl} 
                  alt="Justificatif" 
                  className="max-w-full max-h-[60vh] object-contain rounded"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                Aperçu non disponible
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

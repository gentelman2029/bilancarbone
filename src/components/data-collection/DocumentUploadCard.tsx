import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { DOCUMENT_TYPE_LABELS, DocumentType } from '@/lib/dataCollection/types';

interface DocumentUploadCardProps {
  onUploadComplete?: () => void;
}

export function DocumentUploadCard({ onUploadComplete }: DocumentUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>('electricity_bill');
  const [supplierName, setSupplierName] = useState('');
  const [countryCode, setCountryCode] = useState('TN');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      // Upload document
      const result = await documentCollectionService.uploadDocument(file, documentType);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Document téléchargé', {
        description: 'Extraction OCR en cours...'
      });

      // Trigger OCR processing
      if (result.data) {
        const ocrResult = await documentCollectionService.processOCR(result.data.id);
        
        if (ocrResult.error) {
          toast.warning('OCR partiel', {
            description: 'Le document nécessite une vérification manuelle.'
          });
        } else {
          toast.success('Extraction terminée', {
            description: 'Les données extraites sont prêtes pour validation.'
          });
        }
      }

      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer'
      });
    } finally {
      setIsUploading(false);
    }
  }, [documentType, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Télécharger un document
        </CardTitle>
        <CardDescription>
          Factures STEG, carburant, transport - extraction automatique par OCR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fournisseur (optionnel)</Label>
            <Input 
              placeholder="Ex: STEG, Total..."
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Pays</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TN">Tunisie</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="DE">Allemagne</SelectItem>
                <SelectItem value="IT">Italie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Traitement en cours...</p>
              </>
            ) : isDragActive ? (
              <>
                <FileText className="h-10 w-10 text-primary" />
                <p className="text-primary font-medium">Déposez le fichier ici</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">Glissez-déposez un fichier</p>
                  <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                </div>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (max 10 MB)</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

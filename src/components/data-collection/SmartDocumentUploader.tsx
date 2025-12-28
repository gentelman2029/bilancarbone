import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle, Sparkles, Zap, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { DocumentType, DOCUMENT_TYPE_LABELS, ExtractedData } from '@/lib/dataCollection/types';
import { DocumentExtractionReview } from './DocumentExtractionReview';

interface SmartDocumentUploaderProps {
  onUploadComplete?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface ProcessedDocument {
  id: string;
  file_name: string;
  file_path: string;
  extracted_data: ExtractedData;
  confidence_score: number;
  preview_url?: string;
}

export function SmartDocumentUploader({ onUploadComplete }: SmartDocumentUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    if (!selectedDocumentType) {
      toast.error('Type de document requis', {
        description: 'Veuillez sélectionner un type de document avant de télécharger.'
      });
      return;
    }

    const file = acceptedFiles[0];
    
    // Create local preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    setUploadState('uploading');
    setProgress(0);
    setProcessingMessage('Téléchargement du document...');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 30));
      }, 100);

      // Upload document with selected type
      const result = await documentCollectionService.uploadDocument(file, selectedDocumentType);
      
      clearInterval(progressInterval);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setProgress(40);
      setUploadState('processing');
      setProcessingMessage('🔍 Analyse intelligente en cours...');

      // Process OCR
      if (result.data) {
        // Simulate OCR progress
        const ocrProgressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 5, 90));
          const messages = [
            '🔍 Analyse intelligente en cours...',
            '📄 Détection du type de document...',
            '💡 Extraction des données clés...',
            '🧮 Calcul des émissions carbone...',
            '✨ Finalisation de l\'analyse...'
          ];
          setProcessingMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 800);

        // Convert file to base64 for OCR if it's an image
        let imageBase64: string | undefined;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          imageBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        const ocrResult = await documentCollectionService.processOCR(result.data.id, imageBase64, selectedDocumentType);
        
        clearInterval(ocrProgressInterval);

        if (ocrResult.error) {
          setUploadState('error');
          toast.warning('Extraction partielle', {
            description: 'Le document nécessite une vérification manuelle.'
          });
        } else {
          setProgress(100);
          setUploadState('complete');
          
          // Fetch updated document with extracted data
          const docResult = await documentCollectionService.getDocument(result.data.id);
          
          if (docResult.data) {
            // Get preview URL from storage
            const urlResult = await documentCollectionService.getDocumentUrl(docResult.data.file_path);
            
            setProcessedDocument({
              id: docResult.data.id,
              file_name: docResult.data.file_name,
              file_path: docResult.data.file_path,
              extracted_data: docResult.data.extracted_data || {},
              confidence_score: docResult.data.ocr_confidence_score || 0,
              preview_url: urlResult.data || undefined
            });
          }

          toast.success('Extraction terminée', {
            description: 'Les données ont été extraites avec succès.'
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState('error');
      toast.error('Erreur lors du traitement', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer'
      });
    }
  }, [selectedDocumentType]);

  const handleValidationComplete = () => {
    setUploadState('idle');
    setProgress(0);
    setProcessedDocument(null);
    setPreviewUrl(null);
    setSelectedDocumentType(null);
    onUploadComplete?.();
  };

  const handleReset = () => {
    setUploadState('idle');
    setProgress(0);
    setProcessedDocument(null);
    setSelectedDocumentType(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const documentTypes: { type: DocumentType; label: string; icon: string }[] = [
    { type: 'electricity_bill', label: 'Électricité', icon: '⚡' },
    { type: 'fuel_invoice', label: 'Carburant', icon: '⛽' },
    { type: 'gas_bill', label: 'Gaz', icon: '🔥' },
    { type: 'transport_invoice', label: 'Transport', icon: '🚚' },
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: uploadState !== 'idle' || !selectedDocumentType
  });

  // Show comparison view when document is processed
  if (processedDocument && uploadState === 'complete') {
    return (
      <DocumentExtractionReview
        document={processedDocument}
        previewUrl={previewUrl || processedDocument.preview_url}
        onValidate={handleValidationComplete}
        onReject={handleReset}
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Upload States */}
        {uploadState === 'idle' && (
          <div className="p-6 space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-center">
                1. Sélectionnez le type de document
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {documentTypes.map(({ type, label, icon }) => (
                  <Button
                    key={type}
                    variant={selectedDocumentType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDocumentType(type)}
                    className={`flex items-center gap-2 ${
                      selectedDocumentType === type 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : ''
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Upload Zone */}
            <div
              {...getRootProps()}
              className={`
                relative p-8 text-center transition-all duration-300 border-2 border-dashed rounded-lg
                ${!selectedDocumentType 
                  ? 'border-muted-foreground/15 bg-muted/30 cursor-not-allowed opacity-60' 
                  : isDragActive 
                    ? 'border-primary bg-primary/5 scale-[1.02] cursor-pointer' 
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 cursor-pointer'}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center gap-4">
                <div className={`
                  relative p-5 rounded-full transition-all duration-300
                  ${isDragActive ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Upload className={`h-10 w-10 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {selectedDocumentType && (
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500 animate-pulse" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {!selectedDocumentType 
                      ? '2. Déposez votre document' 
                      : isDragActive 
                        ? 'Déposez votre document ici' 
                        : '2. Glissez-déposez votre document'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {!selectedDocumentType 
                      ? 'Sélectionnez d\'abord un type de document ci-dessus'
                      : `Téléchargez votre facture ${documentTypes.find(d => d.type === selectedDocumentType)?.label || ''} pour extraction automatique`}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG (max 10 MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <div className="p-12 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full border-4 border-primary/20 animate-ping" />
              </div>
              <div className="relative z-10 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{processingMessage}</h3>
              <p className="text-sm text-muted-foreground">
                Notre IA Vision analyse votre document en profondeur
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <div className="p-12 text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Erreur d'extraction</h3>
              <p className="text-sm text-muted-foreground">
                L'analyse du document a échoué. Vérifiez la qualité de l'image.
              </p>
            </div>

            <Button onClick={handleReset} variant="outline">
              Réessayer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Split-View pour la validation des documents (PDF à gauche, formulaire à droite)
import { useState, useEffect, useRef } from 'react';
import { FileText, Check, X, Loader2, AlertTriangle, Eye, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { DataCollectionDocument, ExtractedData, GHG_CATEGORIES } from '@/lib/dataCollection/types';

interface DocumentSplitViewProps {
  document: DataCollectionDocument;
  onValidated: () => void;
  onCancel: () => void;
}

// Threshold for requiring human validation
const CONFIDENCE_THRESHOLD = 0.80;

export function DocumentSplitView({ document, onValidated, onCancel }: DocumentSplitViewProps) {
  const [editedData, setEditedData] = useState<ExtractedData>(document.extracted_data || {});
  const [validationNotes, setValidationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const isMountedRef = useRef(true);

  // Load document preview URL
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadPreview = async () => {
      try {
        const result = await documentCollectionService.getDocumentUrl(document.file_path);
        if (isMountedRef.current && result.data) {
          setDocumentUrl(result.data);
        }
      } catch (error) {
        console.error('Error loading preview:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMountedRef.current = false;
    };
  }, [document.file_path]);

  const confidenceScore = document.ocr_confidence_score || 0;
  const requiresHumanValidation = confidenceScore < CONFIDENCE_THRESHOLD;
  const fieldConfidences = editedData.field_confidences || {};

  // Get field confidence class
  const getFieldConfidenceClass = (fieldName: string): string => {
    const confidence = fieldConfidences[fieldName];
    if (confidence === undefined) return '';
    if (confidence < 0.7) return 'ring-2 ring-red-500/50 bg-red-50';
    if (confidence < 0.85) return 'ring-2 ring-amber-500/50 bg-amber-50';
    return '';
  };

  // Handle validation
  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      // Update document with validated data
      await documentCollectionService.updateExtractedData(
        document.id,
        editedData,
        'validated',
        validationNotes || undefined
      );

      // Create activity data from validated document
      await activityDataService.createFromExtractedData(document.id, editedData);

      toast.success('Document validé', {
        description: 'Les données ont été intégrées aux activités.'
      });

      onValidated();
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await documentCollectionService.updateExtractedData(
        document.id,
        editedData,
        'rejected',
        validationNotes || 'Rejeté par l\'utilisateur'
      );

      toast.info('Document rejeté');
      onValidated();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
      {/* Left Panel - Document Preview */}
      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5" />
            {document.file_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {isLoadingPreview ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : documentUrl ? (
            document.mime_type === 'application/pdf' ? (
              <iframe
                src={documentUrl}
                className="w-full h-full border-0"
                title="Document preview"
              />
            ) : (
              <img
                src={documentUrl}
                alt="Document preview"
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12 mr-2" />
              Aperçu non disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Validation Form */}
      <Card className="overflow-auto">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Validation des données
            </span>
            <Badge 
              variant={requiresHumanValidation ? 'destructive' : 'default'}
              className={requiresHumanValidation ? '' : 'bg-green-600'}
            >
              Confiance: {Math.round(confidenceScore * 100)}%
            </Badge>
          </CardTitle>
          
          {/* Confidence indicator */}
          {requiresHumanValidation && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>
                Confiance IA insuffisante ({Math.round(confidenceScore * 100)}% &lt; {CONFIDENCE_THRESHOLD * 100}%). 
                <strong className="ml-1">Validation humaine requise.</strong>
                Les champs incertains sont surlignés.
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Score de confiance OCR</span>
              <span>{Math.round(confidenceScore * 100)}%</span>
            </div>
            <Progress 
              value={confidenceScore * 100} 
              className={`h-2 ${
                confidenceScore >= 0.8 ? '[&>div]:bg-green-500' : 
                confidenceScore >= 0.5 ? '[&>div]:bg-amber-500' : 
                '[&>div]:bg-red-500'
              }`}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Editable Fields with confidence highlighting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input
                id="supplier"
                value={editedData.supplier_name || ''}
                onChange={(e) => setEditedData({ ...editedData, supplier_name: e.target.value })}
                className={getFieldConfidenceClass('supplier_name')}
                aria-label="Nom du fournisseur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice">N° Facture</Label>
              <Input
                id="invoice"
                value={editedData.invoice_number || ''}
                onChange={(e) => setEditedData({ ...editedData, invoice_number: e.target.value })}
                className={getFieldConfidenceClass('invoice_number')}
                aria-label="Numéro de facture"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_start">Début période</Label>
              <Input
                id="period_start"
                type="date"
                value={editedData.period_start || ''}
                onChange={(e) => setEditedData({ ...editedData, period_start: e.target.value })}
                className={getFieldConfidenceClass('period_start')}
                aria-label="Date de début de période"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Fin période</Label>
              <Input
                id="period_end"
                type="date"
                value={editedData.period_end || ''}
                onChange={(e) => setEditedData({ ...editedData, period_end: e.target.value })}
                className={getFieldConfidenceClass('period_end')}
                aria-label="Date de fin de période"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={editedData.quantity || ''}
                onChange={(e) => setEditedData({ ...editedData, quantity: parseFloat(e.target.value) || undefined })}
                className={getFieldConfidenceClass('quantity')}
                aria-label="Quantité"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unité</Label>
              <Input
                id="unit"
                value={editedData.unit || ''}
                onChange={(e) => setEditedData({ ...editedData, unit: e.target.value })}
                placeholder="kWh, litres, t.km..."
                className={getFieldConfidenceClass('unit')}
                aria-label="Unité de mesure"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount_ht">Montant HT</Label>
              <Input
                id="amount_ht"
                type="number"
                step="0.01"
                value={editedData.amount_ht || ''}
                onChange={(e) => setEditedData({ ...editedData, amount_ht: parseFloat(e.target.value) || undefined })}
                className={getFieldConfidenceClass('amount_ht')}
                aria-label="Montant hors taxes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Scope GHG</Label>
              <Select
                value={editedData.ghg_scope || ''}
                onValueChange={(v) => setEditedData({ ...editedData, ghg_scope: v, ghg_category: undefined })}
              >
                <SelectTrigger 
                  id="scope" 
                  className={getFieldConfidenceClass('ghg_scope')}
                  aria-label="Scope GHG"
                >
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scope1">Scope 1 - Émissions directes</SelectItem>
                  <SelectItem value="scope2">Scope 2 - Énergie indirecte</SelectItem>
                  <SelectItem value="scope3">Scope 3 - Autres indirectes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category selection based on scope */}
          {editedData.ghg_scope && (
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie GHG</Label>
              <Select
                value={editedData.ghg_category || ''}
                onValueChange={(v) => setEditedData({ ...editedData, ghg_category: v })}
              >
                <SelectTrigger 
                  id="category"
                  className={getFieldConfidenceClass('ghg_category')}
                  aria-label="Catégorie GHG"
                >
                  <SelectValue placeholder="Sélectionner une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {GHG_CATEGORIES[editedData.ghg_scope as keyof typeof GHG_CATEGORIES]?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label} ({cat.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Validation Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes de validation (optionnel)</Label>
            <Textarea
              id="notes"
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder="Commentaires sur les modifications effectuées..."
              rows={2}
              aria-label="Notes de validation"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Rejeter
              </Button>
              <Button
                onClick={handleValidate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Valider et intégrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

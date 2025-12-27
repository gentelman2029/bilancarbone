import { useState, useEffect } from 'react';
import { FileText, Check, X, Eye, Loader2, AlertTriangle, Clock, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { 
  DataCollectionDocument, 
  ExtractedData,
  OCR_STATUS_LABELS
} from '@/lib/dataCollection/types';

interface DocumentReviewListProps {
  onDataValidated?: () => void;
}

export function DocumentReviewList({ onDataValidated }: DocumentReviewListProps) {
  const [documents, setDocuments] = useState<DataCollectionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DataCollectionDocument | null>(null);
  const [editedData, setEditedData] = useState<ExtractedData>({});
  const [validationNotes, setValidationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DataCollectionDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = async () => {
    try {
      const result = await documentCollectionService.getDocuments();
      if (result.error) throw new Error(result.error);
      setDocuments(result.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleReview = (doc: DataCollectionDocument) => {
    setSelectedDoc(doc);
    setEditedData(doc.extracted_data || {});
    setValidationNotes('');
  };

  const handleValidate = async () => {
    if (!selectedDoc) return;

    setIsProcessing(true);
    try {
      // Validate document
      await documentCollectionService.updateExtractedData(
        selectedDoc.id, 
        editedData, 
        'validated', 
        validationNotes || undefined
      );
      
      // Create activity data from validated document
      await activityDataService.createFromExtractedData(selectedDoc.id, editedData);

      toast.success('Document validé', {
        description: 'Les données ont été intégrées aux activités.'
      });

      setSelectedDoc(null);
      loadDocuments();
      onDataValidated?.();
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;

    setIsProcessing(true);
    try {
      await documentCollectionService.updateExtractedData(
        selectedDoc.id, 
        editedData, 
        'rejected', 
        validationNotes || 'Rejeté par l\'utilisateur'
      );
      
      toast.info('Document rejeté');
      setSelectedDoc(null);
      loadDocuments();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (doc: DataCollectionDocument) => {
    setDocToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;

    setIsDeleting(true);
    try {
      const result = await documentCollectionService.deleteDocument(docToDelete.id);
      if (result.error) throw new Error(result.error);

      toast.success('Document supprimé');
      setDeleteDialogOpen(false);
      setDocToDelete(null);
      loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (doc: DataCollectionDocument) => {
    if (doc.ocr_status === 'processing') {
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />En traitement</Badge>;
    }
    if (doc.ocr_status === 'failed') {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Échec OCR</Badge>;
    }
    if (doc.validation_status === 'validated') {
      return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />Validé</Badge>;
    }
    if (doc.validation_status === 'rejected') {
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejeté</Badge>;
    }
    if (doc.ocr_status === 'processed') {
      return <Badge variant="outline" className="border-amber-500 text-amber-600"><Clock className="h-3 w-3 mr-1" />À valider</Badge>;
    }
    return <Badge variant="secondary">{OCR_STATUS_LABELS[doc.ocr_status]}</Badge>;
  };

  const pendingDocs = documents.filter(d => d.ocr_status === 'processed' && d.validation_status === 'pending');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents à valider
            </span>
            {pendingDocs.length > 0 && (
              <Badge variant="secondary">{pendingDocs.length} en attente</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Vérifiez et validez les données extraites avant intégration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun document téléchargé
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.supplier_name || 'Fournisseur inconnu'} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doc)}
                    {doc.ocr_status === 'processed' && doc.validation_status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleReview(doc)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Réviser
                      </Button>
                    )}
                    {doc.validation_status === 'validated' && (
                      <Button size="sm" variant="ghost" onClick={() => handleReview(doc)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document "{docToDelete?.file_name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Validation des données extraites</DialogTitle>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4">
              {/* Confidence Score */}
              {selectedDoc.ocr_confidence_score && (
                <div className={`p-3 rounded-lg ${
                  selectedDoc.ocr_confidence_score > 0.8 ? 'bg-green-500/10 border border-green-500/30' :
                  selectedDoc.ocr_confidence_score > 0.5 ? 'bg-amber-500/10 border border-amber-500/30' :
                  'bg-red-500/10 border border-red-500/30'
                }`}>
                  <p className="text-sm">
                    Confiance OCR: <strong>{Math.round(selectedDoc.ocr_confidence_score * 100)}%</strong>
                    {selectedDoc.ocr_confidence_score < 0.7 && (
                      <span className="ml-2 text-muted-foreground">⚠️ Vérification recommandée</span>
                    )}
                  </p>
                </div>
              )}

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Input 
                    value={editedData.supplier_name || ''} 
                    onChange={(e) => setEditedData({...editedData, supplier_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° Facture</Label>
                  <Input 
                    value={editedData.invoice_number || ''} 
                    onChange={(e) => setEditedData({...editedData, invoice_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Début période</Label>
                  <Input 
                    type="date"
                    value={editedData.period_start || ''} 
                    onChange={(e) => setEditedData({...editedData, period_start: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin période</Label>
                  <Input 
                    type="date"
                    value={editedData.period_end || ''} 
                    onChange={(e) => setEditedData({...editedData, period_end: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input 
                    type="number"
                    value={editedData.quantity || ''} 
                    onChange={(e) => setEditedData({...editedData, quantity: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unité</Label>
                  <Input 
                    value={editedData.unit || ''} 
                    onChange={(e) => setEditedData({...editedData, unit: e.target.value})}
                    placeholder="kWh, litres, t.km..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Montant HT</Label>
                  <Input 
                    type="number"
                    value={editedData.amount_ht || ''} 
                    onChange={(e) => setEditedData({...editedData, amount_ht: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scope GHG</Label>
                  <Select 
                    value={editedData.ghg_scope || ''} 
                    onValueChange={(v) => setEditedData({...editedData, ghg_scope: v})}
                  >
                    <SelectTrigger>
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

              {/* Validation Notes */}
              <div className="space-y-2">
                <Label>Notes de validation (optionnel)</Label>
                <Textarea 
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Commentaires sur les modifications effectuées..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
              Rejeter
            </Button>
            <Button 
              onClick={handleValidate}
              disabled={isProcessing || !editedData.quantity}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Valider et intégrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

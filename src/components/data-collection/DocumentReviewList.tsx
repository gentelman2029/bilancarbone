import { useState, useEffect } from 'react';
import { FileText, Check, X, Eye, Loader2, AlertTriangle, Clock, Trash2, Pencil, MessageSquare, RotateCcw } from 'lucide-react';
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
  
  // Nouveau state pour le workflow de rejet
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [docToReject, setDocToReject] = useState<DataCollectionDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // State pour la réinitialisation complète
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleRejectClick = (doc: DataCollectionDocument) => {
    setDocToReject(doc);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!docToReject) return;

    setIsRejecting(true);
    try {
      await documentCollectionService.updateExtractedData(
        docToReject.id, 
        docToReject.extracted_data || {}, 
        'rejected', 
        rejectReason || 'Rejeté par l\'utilisateur'
      );
      
      toast.info('Document rejeté', {
        description: 'L\'extraction a été marquée comme erronée.'
      });
      
      setRejectDialogOpen(false);
      setDocToReject(null);
      setRejectReason('');
      loadDocuments();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsRejecting(false);
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

  const handleResetAll = async () => {
    setIsResetting(true);
    try {
      const result = await documentCollectionService.deleteAllDocuments();
      if (result.error) throw new Error(result.error);

      toast.success(`${result.data?.deleted || 0} document(s) supprimé(s)`, {
        description: 'Tous les documents ont été réinitialisés.'
      });
      setResetDialogOpen(false);
      setDocuments([]);
      onDataValidated?.();
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsResetting(false);
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents à valider
              {pendingDocs.length > 0 && (
                <Badge variant="secondary">{pendingDocs.length} en attente</Badge>
              )}
            </CardTitle>
            {documents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setResetDialogOpen(true)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Tout réinitialiser
              </Button>
            )}
          </div>
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
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleReview(doc)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Réviser
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRejectClick(doc)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
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

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Rejeter l'extraction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Indiquez la raison du rejet pour aider à améliorer l'extraction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Données incorrectes, document illisible, mauvais type de document..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectConfirm}
              disabled={isRejecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
              Confirmer le rejet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Reset All Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <RotateCcw className="h-5 w-5" />
              Réinitialiser tous les documents ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les documents ({documents.length}) seront définitivement supprimés, 
              y compris les fichiers et les données extraites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetAll}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
              Réinitialiser tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              variant="outline" 
              onClick={() => setSelectedDoc(null)}
              disabled={isProcessing}
            >
              Annuler
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

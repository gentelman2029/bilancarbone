import { useState, useEffect } from 'react';
import { Check, X, Loader2, AlertTriangle, Leaf, Calculator, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { documentCollectionService } from '@/lib/dataCollection/documentService';
import { activityDataService } from '@/lib/dataCollection/activityService';
import { 
  ExtractedData,
  FuelItem,
  DOCUMENT_TYPE_LABELS,
  GHG_CATEGORIES,
  DocumentType
} from '@/lib/dataCollection/types';
import { supabase } from '@/integrations/supabase/client';

interface DocumentExtractionReviewProps {
  document: {
    id: string;
    file_name: string;
    file_path: string;
    extracted_data: ExtractedData;
    confidence_score: number;
    preview_url?: string;
  };
  previewUrl?: string | null;
  onValidate: () => void;
  onReject: () => void;
}

interface FieldConfidence {
  [key: string]: number;
}

interface EmissionFactor {
  id: string;
  category: string;
  factor_value: number;
  factor_unit: string;
  source_name: string;
}

export function DocumentExtractionReview({ 
  document, 
  previewUrl,
  onValidate, 
  onReject 
}: DocumentExtractionReviewProps) {
  const [editedData, setEditedData] = useState<ExtractedData>(document.extracted_data);
  const [editedFuelItems, setEditedFuelItems] = useState<FuelItem[]>(document.extracted_data.fuel_items || []);
  const [validationNotes, setValidationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldConfidences, setFieldConfidences] = useState<FieldConfidence>({});
  const [calculatedEmissions, setCalculatedEmissions] = useState<number | null>(null);
  const [emissionFactor, setEmissionFactor] = useState<EmissionFactor | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Check if this is a multi-line fuel document (invoice or voucher)
  const isFuelInvoice = editedData.document_type === 'fuel_invoice' && editedFuelItems.length > 0;
  const isFuelVoucher = editedData.document_type === 'fuel_voucher' && editedFuelItems.length > 0;
  const isFuelDocument = isFuelInvoice || isFuelVoucher;

  // Parse field confidences from extracted data or generate based on overall score
  useEffect(() => {
    if (document.extracted_data.field_confidences) {
      setFieldConfidences(document.extracted_data.field_confidences as FieldConfidence);
    } else {
      // Generate approximate confidences from overall score
      const baseConfidence = document.confidence_score || 0.7;
      setFieldConfidences({
        supplier_name: Math.min(1, baseConfidence * 1.1),
        quantity: baseConfidence,
        unit: Math.min(1, baseConfidence * 1.05),
        period_start: baseConfidence * 0.95,
        period_end: baseConfidence * 0.95,
        amount_ttc: baseConfidence * 0.9,
        ghg_category: baseConfidence * 0.85
      });
    }
  }, [document]);

  // Calculate emissions when quantity or category changes (for single-line documents)
  useEffect(() => {
    const calculateEmissions = async () => {
      // For fuel documents with multi-line items, use the sum from fuel_items
      if (isFuelDocument) {
        const totalCo2 = editedFuelItems.reduce((sum, item) => sum + (item.co2_kg || 0), 0);
        setCalculatedEmissions(totalCo2);
        setEmissionFactor(null);
        return;
      }
      
      if (!editedData.quantity || !editedData.ghg_category) {
        setCalculatedEmissions(null);
        return;
      }

      setIsCalculating(true);
      try {
        // Fetch emission factor from database
        const { data: factors, error } = await supabase
          .from('emission_factors_local')
          .select('*')
          .eq('category', editedData.ghg_category)
          .eq('is_active', true)
          .limit(1);

        if (error) throw error;

        if (factors && factors.length > 0) {
          const factor = factors[0];
          setEmissionFactor(factor);
          const emissions = editedData.quantity * factor.factor_value;
          setCalculatedEmissions(emissions);
        } else {
          // Use default factors if not found
          const defaultFactors: Record<string, number> = {
            'electricite': 0.42,
            'gaz_naturel': 2.04,
            'diesel': 2.67,
            'essence': 2.31,
            'gpl': 1.67,
            'fioul': 2.72,
            'transport_routier': 0.1
          };
          
          const factor = defaultFactors[editedData.ghg_category] || 0.5;
          setEmissionFactor({
            id: 'default',
            category: editedData.ghg_category,
            factor_value: factor,
            factor_unit: 'kgCO2e',
            source_name: 'Facteurs par défaut ADEME'
          });
          setCalculatedEmissions(editedData.quantity * factor);
        }
      } catch (error) {
        console.error('Error calculating emissions:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateEmissions();
  }, [editedData.quantity, editedData.ghg_category, isFuelDocument, editedFuelItems]);
  
  // Update fuel item quantity and recalculate CO2
  const updateFuelItem = (index: number, field: keyof FuelItem, value: number | string) => {
    setEditedFuelItems(prev => {
      const updated = [...prev];
      if (field === 'quantity' && typeof value === 'number') {
        updated[index] = {
          ...updated[index],
          quantity: value,
          co2_kg: value * updated[index].emission_factor
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'border-green-500';
    if (confidence >= 0.5) return 'border-amber-500 bg-amber-500/5';
    return 'border-red-500 bg-red-500/5';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return null;
    return (
      <Badge variant="outline" className="ml-2 text-amber-600 border-amber-500">
        <AlertTriangle className="h-3 w-3 mr-1" />
        À vérifier
      </Badge>
    );
  };

  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      // Update document with validated data
      await documentCollectionService.updateExtractedData(
        document.id, 
        { ...editedData, fuel_items: editedFuelItems, calculated_co2_kg: calculatedEmissions },
        'validated', 
        validationNotes || undefined
      );
      
      // Create activity data - different logic for fuel documents with multi-line items
      if (isFuelDocument && editedFuelItems.length > 0) {
        // Create multiple activity entries for each fuel type
        await activityDataService.createMultipleFuelActivities(
          document.id, 
          editedData, 
          editedFuelItems
        );
        
        const docTypeLabel = isFuelVoucher ? 'Bon carburant' : 'Facture carburant';
        toast.success(`${docTypeLabel} validé`, {
          description: `${editedFuelItems.length} lignes de carburant créées. Total: ${calculatedEmissions?.toFixed(2)} kg CO2e`
        });
      } else {
        // Single activity for other document types
        await activityDataService.createFromExtractedData(document.id, {
          ...editedData,
          co2_equivalent_kg: calculatedEmissions
        });

        toast.success('Document validé', {
          description: `${calculatedEmissions?.toFixed(2)} kg CO2e calculé et intégré aux données d'activité.`
        });
      }

      onValidate();
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
      onReject();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setIsProcessing(false);
    }
  };

  const imageUrl = previewUrl || document.preview_url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Document Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Document source
          </CardTitle>
          <CardDescription>{document.file_name}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative rounded-lg border bg-muted/50 overflow-hidden" style={{ minHeight: '400px' }}>
            {imageUrl ? (
              <>
                <img 
                  src={imageUrl} 
                  alt="Document preview" 
                  className="w-full h-auto object-contain max-h-[500px]"
                />
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2"
                >
                  <Button size="sm" variant="secondary">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ouvrir
                  </Button>
                </a>
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Aperçu non disponible pour les fichiers PDF</p>
                  <p className="text-sm mt-1">Téléchargez le document pour le visualiser</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right: Extracted Data Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Données extraites
            </span>
            <Badge 
              variant={document.confidence_score >= 0.8 ? 'default' : 'secondary'}
              className={document.confidence_score >= 0.8 ? 'bg-green-600' : 'bg-amber-500'}
            >
              Confiance: {Math.round((document.confidence_score || 0) * 100)}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Vérifiez et corrigez les données avant validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Identity Section for Fuel Invoices - Simplified */}
          {isFuelInvoice && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="space-y-2">
                <Label className="flex items-center text-blue-700 font-medium">
                  📄 N° Facture
                </Label>
                <Input 
                  value={editedData.invoice_number || ''} 
                  onChange={(e) => setEditedData({...editedData, invoice_number: e.target.value})}
                  placeholder="N° BLF ou Facture"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-blue-700 font-medium">
                  📅 Date de facture
                </Label>
                <Input 
                  type="date"
                  value={editedData.invoice_date || ''} 
                  onChange={(e) => setEditedData({...editedData, invoice_date: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Document Identity Section for Fuel Vouchers */}
          {isFuelVoucher && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="space-y-2">
                <Label className="flex items-center text-amber-700 font-medium">
                  🎫 N° Bon
                </Label>
                <Input 
                  value={(editedData as any).voucher_number || editedData.invoice_number || ''} 
                  onChange={(e) => setEditedData({...editedData, invoice_number: e.target.value})}
                  placeholder="N° du bon carburant"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-amber-700 font-medium">
                  📅 Date de validité
                </Label>
                <Input 
                  type="date"
                  value={(editedData as any).validity_date || editedData.invoice_date || ''} 
                  onChange={(e) => setEditedData({...editedData, invoice_date: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Document Type & Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Type de document
                {getConfidenceBadge(fieldConfidences.document_type || 0.8)}
              </Label>
              <Select 
                value={editedData.document_type || ''} 
                onValueChange={(v) => setEditedData({...editedData, document_type: v})}
              >
                <SelectTrigger className={getConfidenceColor(fieldConfidences.document_type || 0.8)}>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                Fournisseur
                {getConfidenceBadge(fieldConfidences.supplier_name || 0.8)}
              </Label>
              <Input 
                value={editedData.supplier_name || ''} 
                onChange={(e) => setEditedData({...editedData, supplier_name: e.target.value})}
                className={getConfidenceColor(fieldConfidences.supplier_name || 0.8)}
              />
            </div>
          </div>

          {/* Period - Hidden for Fuel Documents */}
          {!isFuelDocument && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                Début période
                {getConfidenceBadge(fieldConfidences.period_start || 0.8)}
              </Label>
              <Input 
                type="date"
                value={editedData.period_start || ''} 
                onChange={(e) => setEditedData({...editedData, period_start: e.target.value})}
                className={getConfidenceColor(fieldConfidences.period_start || 0.8)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                Fin période
                {getConfidenceBadge(fieldConfidences.period_end || 0.8)}
              </Label>
              <Input 
                type="date"
                value={editedData.period_end || ''} 
                onChange={(e) => setEditedData({...editedData, period_end: e.target.value})}
                className={getConfidenceColor(fieldConfidences.period_end || 0.8)}
              />
            </div>
          </div>
          )}

          {/* Multi-line Fuel Items Table (for fuel invoices and vouchers) */}
          {isFuelDocument && editedFuelItems.length > 0 && (
            <div className="space-y-3">
              <Label className="font-semibold text-primary flex items-center gap-2">
                {isFuelVoucher ? '🎫' : '⛽'} Détail des carburants ({editedFuelItems.length} ligne{editedFuelItems.length > 1 ? 's' : ''})
              </Label>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Produit</th>
                      {isFuelVoucher && <th className="px-3 py-2 text-right">Montant (TND)</th>}
                      <th className="px-3 py-2 text-right">Quantité (L)</th>
                      <th className="px-3 py-2 text-right">Facteur</th>
                      <th className="px-3 py-2 text-right">CO₂ (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedFuelItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2 font-medium">{item.product_name}</td>
                        {isFuelVoucher && (
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            {(item as any).amount_tnd?.toFixed(2) || '-'}
                          </td>
                        )}
                        <td className="px-3 py-2 text-right">
                          <Input 
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateFuelItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-28 h-8 text-right ml-auto"
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{item.emission_factor}</td>
                        <td className="px-3 py-2 text-right font-medium text-green-600">{item.co2_kg.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="border-t bg-green-500/10 font-bold">
                      <td className="px-3 py-2">TOTAL</td>
                      {isFuelVoucher && <td className="px-3 py-2"></td>}
                      <td className="px-3 py-2 text-right">{editedFuelItems.reduce((s, i) => s + i.quantity, 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-right text-green-600">{editedFuelItems.reduce((s, i) => s + i.co2_kg, 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {isFuelVoucher && (
                <p className="text-xs text-muted-foreground italic">
                  ℹ️ Quantité calculée à partir du montant et du prix unitaire de référence
                </p>
              )}
            </div>
          )}

          {/* Consumption Value - SINGLE LINE (hide for fuel documents) */}
          {!isFuelDocument && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center font-semibold text-primary">
                  🔢 Consommation
                  {getConfidenceBadge(fieldConfidences.quantity || 0.8)}
                </Label>
                <Input 
                  type="number"
                  value={editedData.quantity ?? ''} 
                  onChange={(e) => setEditedData({...editedData, quantity: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className={`text-lg font-medium ${getConfidenceColor(fieldConfidences.quantity || 0.8)}`}
                  placeholder="Quantité consommée"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  Unité
                  {getConfidenceBadge(fieldConfidences.unit || 0.8)}
                </Label>
                <Select 
                  value={editedData.unit || ''} 
                  onValueChange={(v) => setEditedData({...editedData, unit: v})}
                >
                  <SelectTrigger className={getConfidenceColor(fieldConfidences.unit || 0.8)}>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="thermies">Thermies</SelectItem>
                    <SelectItem value="litres">Litres</SelectItem>
                    <SelectItem value="m3">m³</SelectItem>
                    <SelectItem value="km">km</SelectItem>
                    <SelectItem value="tonnes">Tonnes</SelectItem>
                    <SelectItem value="t.km">Tonnes.km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* GHG Scope & Category */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label className="flex items-center">
                Catégorie
                {getConfidenceBadge(fieldConfidences.ghg_category || 0.8)}
              </Label>
              <Select 
                value={editedData.ghg_category || ''} 
                onValueChange={(v) => setEditedData({...editedData, ghg_category: v})}
              >
                <SelectTrigger className={getConfidenceColor(fieldConfidences.ghg_category || 0.8)}>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricite">Électricité</SelectItem>
                  <SelectItem value="gaz_naturel">Gaz naturel</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="essence">Essence</SelectItem>
                  <SelectItem value="gpl">GPL</SelectItem>
                  <SelectItem value="fioul">Fioul domestique</SelectItem>
                  <SelectItem value="transport_routier">Transport routier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Montant TTC</Label>
              <Input 
                type="number"
                value={editedData.amount_ttc || ''} 
                onChange={(e) => setEditedData({...editedData, amount_ttc: parseFloat(e.target.value) || undefined})}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-2">
              <Label>Devise</Label>
              <Select 
                value={editedData.currency || 'TND'} 
                onValueChange={(v) => setEditedData({...editedData, currency: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TND">TND</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Carbon Calculation Preview */}
          <div className={`p-4 rounded-lg border-2 ${calculatedEmissions ? 'bg-green-500/10 border-green-500/30' : 'bg-muted border-muted-foreground/20'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${calculatedEmissions ? 'bg-green-500/20' : 'bg-muted-foreground/20'}`}>
                <Leaf className={`h-6 w-6 ${calculatedEmissions ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Émissions CO₂ calculées</p>
                {isCalculating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Calcul en cours...</span>
                  </div>
                ) : calculatedEmissions ? (
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {calculatedEmissions.toFixed(2)} kg CO₂e
                    </p>
                    {emissionFactor && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {editedData.quantity} {editedData.unit} × {emissionFactor.factor_value} {emissionFactor.factor_unit}/{editedData.unit}
                        <span className="ml-2">({emissionFactor.source_name})</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Renseignez la consommation et la catégorie pour calculer les émissions
                  </p>
                )}
              </div>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
              Rejeter
            </Button>
            <Button 
              onClick={handleValidate}
              disabled={isProcessing || (!isFuelInvoice && !editedData.quantity) || !calculatedEmissions}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Valider et calculer CO₂
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

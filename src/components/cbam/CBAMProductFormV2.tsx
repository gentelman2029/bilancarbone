// Nouveau composant CBAMProductForm intégré à Supabase
// Remplace l'ancienne version mockée par une vraie intégration base de données

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Calculator, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cbamService } from '@/lib/cbam/supabaseService';
import type { 
  CBAMSector, 
  CreateCBAMProductForm,
  CBAMProduct 
} from '@/lib/cbam/types';
import { CBAM_SECTORS, CN8_CODES_BY_SECTOR } from '@/lib/cbam/types';
import { CBAM_PRODUCTS_DATABASE, getProductsBySector, getProductByCN8Code } from '@/lib/cbam/products-data';

interface CBAMProductFormV2Props {
  open: boolean;
  onClose: () => void;
  onProductCreated?: (product: CBAMProduct) => void;
  editProduct?: CBAMProduct; // Pour l'édition (optionnel)
}

export const CBAMProductFormV2 = ({ 
  open, 
  onClose, 
  onProductCreated,
  editProduct 
}: CBAMProductFormV2Props) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateCBAMProductForm>({
    cn8_code: editProduct?.cn8_code || '',
    product_name: editProduct?.product_name || '',
    sector: editProduct?.sector || 'iron_steel',
    description: editProduct?.description || '',
    unit_measure: editProduct?.unit_measure || 'tonnes',
    is_precursor: editProduct?.is_precursor || false,
    parent_product_id: editProduct?.parent_product_id || undefined
  });

  // Secteurs disponibles avec icônes
  const sectors = [
    { value: 'iron_steel', label: 'Fer et acier', icon: <Calculator className="h-4 w-4" /> },
    { value: 'cement', label: 'Ciment', icon: <FileText className="h-4 w-4" /> },
    { value: 'fertilizers', label: 'Engrais', icon: <Zap className="h-4 w-4" /> },
    { value: 'aluminium', label: 'Aluminium', icon: <Upload className="h-4 w-4" /> },
    { value: 'electricity', label: 'Électricité', icon: <Zap className="h-4 w-4" /> },
    { value: 'hydrogen', label: 'Hydrogène', icon: <Calculator className="h-4 w-4" /> }
  ] as const;

  const unitsOfMeasure = [
    { value: 'tonnes', label: 'Tonnes' },
    { value: 'kg', label: 'Kilogrammes' },
    { value: 'MWh', label: 'Mégawattheures (électricité)' },
    { value: 'm3', label: 'Mètres cubes' },
    { value: 'liters', label: 'Litres' }
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation code CN8
    if (!formData.cn8_code.trim()) {
      errors.cn8_code = 'Le code CN8 est obligatoire';
    } else if (!/^\d{8}$/.test(formData.cn8_code)) {
      errors.cn8_code = 'Le code CN8 doit contenir exactement 8 chiffres';
    }

    // Validation nom du produit
    if (!formData.product_name.trim()) {
      errors.product_name = 'Le nom du produit est obligatoire';
    } else if (formData.product_name.length < 3) {
      errors.product_name = 'Le nom doit contenir au moins 3 caractères';
    }

    // Validation secteur
    if (!formData.sector) {
      errors.sector = 'Le secteur CBAM est obligatoire';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs avant de continuer",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (editProduct) {
        // Mode édition
        result = await cbamService.updateProduct(editProduct.id, formData);
      } else {
        // Mode création
        result = await cbamService.createProduct(formData);
      }

      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      if (result.validationErrors && result.validationErrors.length > 0) {
        const errors: Record<string, string> = {};
        result.validationErrors.forEach(error => {
          errors[error.field] = error.message;
        });
        setValidationErrors(errors);
        
        toast({
          title: "Erreurs de validation",
          description: result.validationErrors[0].message,
          variant: "destructive"
        });
        return;
      }

      if (result.data) {
        toast({
          title: editProduct ? "Produit modifié" : "Produit créé",
          description: `Le produit "${result.data.product_name}" a été ${editProduct ? 'modifié' : 'créé'} avec succès`,
        });

        onProductCreated?.(result.data);
        resetForm();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors de l'opération",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cn8_code: '',
      product_name: '',
      sector: 'iron_steel',
      description: '',
      unit_measure: 'tonnes',
      is_precursor: false,
      parent_product_id: undefined
    });
    setStep(1);
    setValidationErrors({});
  };

  // Obtenir les produits disponibles pour le secteur sélectionné
  const getAvailableProducts = () => {
    if (!formData.sector) return [];
    return getProductsBySector(formData.sector);
  };

  // Handler pour sélectionner un produit depuis la liste
  const handleProductSelect = (selectedProductName: string) => {
    const availableProducts = getAvailableProducts();
    const selectedProduct = availableProducts.find(p => p.product_name === selectedProductName);
    
    if (selectedProduct) {
      setFormData(prev => ({ 
        ...prev, 
        product_name: selectedProduct.product_name,
        cn8_code: selectedProduct.cn8_code,
        description: selectedProduct.description
      }));
    }
  };

  const getSuggestedCN8Codes = (sector: CBAMSector): string[] => {
    return CN8_CODES_BY_SECTOR[sector] || [];
  };

  const handleCN8Suggestion = (code: string) => {
    const product = getProductByCN8Code(code);
    if (product) {
      setFormData(prev => ({ 
        ...prev, 
        cn8_code: code,
        product_name: product.product_name,
        description: product.description
      }));
    } else {
      setFormData(prev => ({ ...prev, cn8_code: code }));
    }
    if (validationErrors.cn8_code) {
      setValidationErrors(prev => ({ ...prev, cn8_code: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {editProduct ? 'Modifier le Produit CBAM' : 'Nouveau Produit CBAM'}
          </DialogTitle>
          <DialogDescription>
            Renseignez les champs puis validez pour créer ou modifier un produit CBAM.
          </DialogDescription>
          
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Étape {step} sur 3
          </div>
        </DialogHeader>

        <Tabs value={step.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1" disabled={isLoading}>
              Identification
            </TabsTrigger>
            <TabsTrigger value="2" disabled={isLoading}>
              Spécifications
            </TabsTrigger>
            <TabsTrigger value="3" disabled={isLoading}>
              Validation
            </TabsTrigger>
          </TabsList>

          {/* ÉTAPE 1: IDENTIFICATION DU PRODUIT */}
          <TabsContent value="1" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Identification du Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Secteur CBAM */}
                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur CBAM *</Label>
                  <Select 
                    value={formData.sector} 
                    onValueChange={(value: CBAMSector) => {
                      setFormData(prev => ({ ...prev, sector: value, cn8_code: '' }));
                      if (validationErrors.sector) {
                        setValidationErrors(prev => ({ ...prev, sector: '' }));
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                     <SelectContent className="z-50 bg-popover text-popover-foreground border border-border">
                      {sectors.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          <div className="flex items-center gap-2">
                            {sector.icon}
                            {sector.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.sector && (
                    <p className="text-sm text-red-600">{validationErrors.sector}</p>
                  )}
                </div>

                {/* Code CN8 avec suggestions */}
                <div className="space-y-2">
                  <Label htmlFor="cn8_code">Code de nomenclature douanière (CN8) *</Label>
                  {formData.sector ? (
                    <Select
                      value={formData.cn8_code}
                      onValueChange={(value) => {
                        handleCN8Suggestion(value);
                        if (validationErrors.cn8_code) {
                          setValidationErrors(prev => ({ ...prev, cn8_code: '' }));
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un code CN8" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover text-popover-foreground border border-border">
                        {getAvailableProducts().map((product) => (
                          <SelectItem key={product.cn8_code} value={product.cn8_code}>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.cn8_code}</span>
                              <span className="text-xs text-muted-foreground">{product.product_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                      Veuillez d'abord sélectionner un secteur CBAM pour voir les codes disponibles.
                    </div>
                  )}
                  {validationErrors.cn8_code && (
                    <p className="text-sm text-red-600">{validationErrors.cn8_code}</p>
                  )}
                </div>

                {/* Nom du produit */}
                <div className="space-y-2">
                  <Label htmlFor="product_name">Nom du produit *</Label>
                  {formData.sector ? (
                    <Select 
                      value={formData.product_name} 
                      onValueChange={(value) => {
                        handleProductSelect(value);
                        if (validationErrors.product_name) {
                          setValidationErrors(prev => ({ ...prev, product_name: '' }));
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit" />
                      </SelectTrigger>
                       <SelectContent className="z-50 bg-popover text-popover-foreground border border-border">
                        {getAvailableProducts().map((product) => (
                          <SelectItem key={product.cn8_code} value={product.product_name}>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.product_name}</span>
                              <span className="text-xs text-muted-foreground">CN8: {product.cn8_code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                      Veuillez d'abord sélectionner un secteur CBAM pour voir les produits disponibles.
                    </div>
                  )}
                  {validationErrors.product_name && (
                    <p className="text-sm text-red-600">{validationErrors.product_name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description détaillée</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du produit et de son processus de fabrication"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.product_name || !formData.cn8_code || !formData.sector || isLoading}
              >
                Suivant: Spécifications →
              </Button>
            </div>
          </TabsContent>

          {/* ÉTAPE 2: SPÉCIFICATIONS */}
          <TabsContent value="2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Spécifications Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Unité de mesure */}
                <div className="space-y-2">
                  <Label htmlFor="unit_measure">Unité de mesure *</Label>
                  <Select 
                    value={formData.unit_measure} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit_measure: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une unité" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover text-popover-foreground border border-border">
                      {unitsOfMeasure.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Produit précurseur */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_precursor"
                    checked={formData.is_precursor}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_precursor: e.target.checked }))}
                    className="rounded border-gray-300"
                    disabled={isLoading}
                  />
                  <Label htmlFor="is_precursor" className="text-sm font-medium">
                    Ce produit est un précurseur (matière première d'un autre produit CBAM)
                  </Label>
                </div>

                {/* Information contextuelle */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Secteur sélectionné:</strong> {CBAM_SECTORS[formData.sector]}
                    <br />
                    Les spécifications peuvent varier selon le secteur. Assurez-vous que les informations 
                    correspondent aux exigences CBAM pour ce secteur.
                  </AlertDescription>
                </Alert>

              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                ← Précédent
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={isLoading}
              >
                Suivant: Validation →
              </Button>
            </div>
          </TabsContent>

          {/* ÉTAPE 3: VALIDATION ET CONFIRMATION */}
          <TabsContent value="3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Validation et Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Récapitulatif */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Code CN8</Label>
                    <p className="font-semibold">{formData.cn8_code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nom du produit</Label>
                    <p className="font-semibold">{formData.product_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Secteur CBAM</Label>
                    <p className="font-semibold">{CBAM_SECTORS[formData.sector]}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Unité de mesure</Label>
                    <p className="font-semibold">{formData.unit_measure}</p>
                  </div>
                  {formData.description && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-sm">{formData.description}</p>
                    </div>
                  )}
                  {formData.is_precursor && (
                    <div className="md:col-span-2">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ce produit est marqué comme précurseur. Il pourra être utilisé 
                          comme matière première dans les calculs d'émissions d'autres produits.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>

                {/* Message d'information */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Une fois créé, ce produit sera disponible pour créer des expéditions 
                    et calculer les émissions embarquées selon le règlement CBAM.
                  </AlertDescription>
                </Alert>

              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                disabled={isLoading}
              >
                ← Précédent
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editProduct ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  editProduct ? 'Modifier le Produit' : 'Créer le Produit'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
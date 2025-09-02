import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Calculator, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CBAM_PRODUCTS_DATABASE } from '@/lib/cbam/products-data';

interface CBAMProductFormProps {
  open: boolean;
  onClose: () => void;
  onProductAdd?: (product: {
    name: string;
    cnCode: string;
    sector: string;
    volume: number;
    status: 'Conforme' | 'En cours' | 'À réviser';
    emissions: number;
    lastUpdate: string;
  }) => void;
}

export const CBAMProductForm = ({ open, onClose, onProductAdd }: CBAMProductFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    cnCode: '',
    sector: '',
    description: '',
    productionVolume: '',
    exportVolume: '',
    productionMethod: '',
    // Energy data
    electricity: '',
    naturalGas: '',
    coal: '',
    heavyFuel: '',
    diesel: '',
    // Materials data
    rawMaterials: [],
    // Documents
    documents: []
  });

  const sectors = [
    { value: 'iron-steel', label: 'Fer et acier' },
    { value: 'cement', label: 'Ciment' },
    { value: 'fertilizers', label: 'Engrais' },
    { value: 'aluminium', label: 'Aluminium' },
    { value: 'electricity', label: 'Électricité' }
  ];

  // Listes déroulantes synchronisées (produit <-> code CN8)
  const sectorMap: Record<string, string> = {
    'iron-steel': 'iron_steel',
    cement: 'cement',
    fertilizers: 'fertilizers',
    aluminium: 'aluminium',
    electricity: 'electricity',
    hydrogen: 'hydrogen'
  };

  const availableProducts = React.useMemo(() => {
    const mapped = sectorMap[formData.sector as keyof typeof sectorMap];
    if (mapped) {
      return CBAM_PRODUCTS_DATABASE.filter(p => p.sector === mapped);
    }
    return CBAM_PRODUCTS_DATABASE;
  }, [formData.sector]);

  const handleSelectProduct = (name: string) => {
    const p = availableProducts.find(p => p.product_name === name);
    setFormData(prev => ({ ...prev, name, cnCode: p ? p.cn8_code : prev.cnCode }));
  };

  const handleSelectCode = (code: string) => {
    const p = availableProducts.find(p => p.cn8_code === code);
    setFormData(prev => ({ ...prev, cnCode: code, name: p ? p.product_name : prev.name }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.cnCode || !formData.sector) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newProduct = {
      name: formData.name,
      cnCode: formData.cnCode,
      sector: sectors.find(s => s.value === formData.sector)?.label || formData.sector,
      volume: parseFloat(formData.productionVolume) || 0,
      status: 'En cours' as const,
      emissions: 0,
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    onProductAdd?.(newProduct);
    
    toast({
      title: "Produit créé",
      description: "Le nouveau produit CBAM a été ajouté avec succès"
    });
    
    // Reset form
    setFormData({
      name: '',
      cnCode: '',
      sector: '',
      description: '',
      productionVolume: '',
      exportVolume: '',
      productionMethod: '',
      electricity: '',
      naturalGas: '',
      coal: '',
      heavyFuel: '',
      diesel: '',
      rawMaterials: [],
      documents: []
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Nouveau Produit CBAM
          </DialogTitle>
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <Tabs value={step.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1">Informations Générales</TabsTrigger>
            <TabsTrigger value="2">Consommation Énergétique</TabsTrigger>
            <TabsTrigger value="3">Matières Premières</TabsTrigger>
            <TabsTrigger value="4">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Identification du Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Select value={formData.name} onValueChange={(value) => handleSelectProduct(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un produit" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover text-popover-foreground border border-border">
                        {availableProducts.map((p) => (
                          <SelectItem key={p.cn8_code} value={p.product_name}>
                            <div className="flex flex-col">
                              <span className="font-medium">{p.product_name}</span>
                              <span className="text-xs text-muted-foreground">CN8: {p.cn8_code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnCode">Code de nomenclature douanière (CN) *</Label>
                    <Select value={formData.cnCode} onValueChange={(value) => handleSelectCode(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un code CN8" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover text-popover-foreground border border-border">
                        {availableProducts.map((p) => (
                          <SelectItem key={p.cn8_code} value={p.cn8_code}>
                            <div className="flex flex-col">
                              <span className="font-medium">{p.cn8_code}</span>
                              <span className="text-xs text-muted-foreground">{p.product_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur CBAM *</Label>
                  <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description détaillée du produit et de son processus de fabrication"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productionVolume">Volume de production annuel (tonnes)</Label>
                    <Input
                      id="productionVolume"
                      type="number"
                      value={formData.productionVolume}
                      onChange={(e) => setFormData({ ...formData, productionVolume: e.target.value })}
                      placeholder="Ex: 50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exportVolume">Volume d'exportation vers l'UE (tonnes)</Label>
                    <Input
                      id="exportVolume"
                      type="number"
                      value={formData.exportVolume}
                      onChange={(e) => setFormData({ ...formData, exportVolume: e.target.value })}
                      placeholder="Ex: 25000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Suivant: Énergie →
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Consommation Énergétique
                </CardTitle>
                <p className="text-muted-foreground">
                  Renseignez les consommations d'énergie spécifiques à ce produit
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="electricity">Électricité (MWh/an)</Label>
                    <Input
                      id="electricity"
                      type="number"
                      value={formData.electricity}
                      onChange={(e) => setFormData({ ...formData, electricity: e.target.value })}
                      placeholder="Ex: 1200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="naturalGas">Gaz naturel (m³/an)</Label>
                    <Input
                      id="naturalGas"
                      type="number"
                      value={formData.naturalGas}
                      onChange={(e) => setFormData({ ...formData, naturalGas: e.target.value })}
                      placeholder="Ex: 50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coal">Charbon (tonnes/an)</Label>
                    <Input
                      id="coal"
                      type="number"
                      value={formData.coal}
                      onChange={(e) => setFormData({ ...formData, coal: e.target.value })}
                      placeholder="Ex: 200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heavyFuel">Fioul lourd (tonnes/an)</Label>
                    <Input
                      id="heavyFuel"
                      type="number"
                      value={formData.heavyFuel}
                      onChange={(e) => setFormData({ ...formData, heavyFuel: e.target.value })}
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Conseil</h4>
                  <p className="text-sm text-muted-foreground">
                    Pour une mesure précise, utilisez les données de consommation spécifiques 
                    à la ligne de production de ce produit. Si non disponible, vous pouvez 
                    faire une répartition proportionnelle basée sur le volume de production.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Précédent
              </Button>
              <Button onClick={() => setStep(3)}>
                Suivant: Matières Premières →
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="3" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Matières Premières (Précurseurs)
                </CardTitle>
                <p className="text-muted-foreground">
                  Listez les principales matières premières utilisées
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Module Matières Premières</h3>
                  <p className="text-muted-foreground mb-4">
                    Fonctionnalité en cours de développement
                  </p>
                  <Button variant="outline">
                    Ajouter des Matières Premières
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Précédent
              </Button>
              <Button onClick={() => setStep(4)}>
                Suivant: Documents →
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="4" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents Justificatifs
                </CardTitle>
                <p className="text-muted-foreground">
                  Associez les documents de preuve à vos données
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Télécharger des Documents</h3>
                  <p className="text-muted-foreground mb-4">
                    Factures d'énergie, certificats, fiches techniques...
                  </p>
                  <Button variant="outline">
                    Choisir des fichiers
                  </Button>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">📋 Documents recommandés</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Factures d'électricité et de gaz</li>
                    <li>• Certificats d'origine des matières premières</li>
                    <li>• Fiches techniques des produits</li>
                    <li>• Rapports d'audit énergétique</li>
                    <li>• Certificats de conformité</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                ← Précédent
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Créer le Produit
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
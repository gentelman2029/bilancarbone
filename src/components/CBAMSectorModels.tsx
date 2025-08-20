import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Factory, Zap, Building, Wrench, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface SectorModel {
  id: string;
  name: string;
  sector: string;
  icon: React.ReactNode;
  description: string;
  products: string[];
  defaultEmissions: {
    scope1: number;
    scope2: number;
    scope3: number;
  };
  rawMaterials: string[];
  productionTypes: string[];
}

interface CBAMSectorModelsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: SectorModel) => void;
}

export const CBAMSectorModels = ({ open, onOpenChange, onSelectModel }: CBAMSectorModelsProps) => {
  const [selectedModel, setSelectedModel] = useState<SectorModel | null>(null);

  const sectorModels: SectorModel[] = [
    {
      id: 'steel',
      name: 'Sidérurgie',
      sector: 'Fer et Acier',
      icon: <Factory className="h-6 w-6" />,
      description: 'Modèles pour la production d\'acier, fonte et produits sidérurgiques',
      products: ['Acier laminé à chaud', 'Acier laminé à froid', 'Fonte brute', 'Acier inoxydable'],
      defaultEmissions: { scope1: 1.8, scope2: 0.6, scope3: 0.4 },
      rawMaterials: ['Minerai de fer', 'Charbon', 'Ferraille', 'Calcaire'],
      productionTypes: ['Haut fourneau', 'Four électrique', 'Acier électrique']
    },
    {
      id: 'cement',
      name: 'Cimenterie',
      sector: 'Ciment',
      icon: <Building className="h-6 w-6" />,
      description: 'Modèles pour la production de ciment et produits cimentiers',
      products: ['Ciment Portland', 'Ciment blanc', 'Ciment composé', 'Clinker'],
      defaultEmissions: { scope1: 0.5, scope2: 0.3, scope3: 0.7 },
      rawMaterials: ['Calcaire', 'Argile', 'Sable', 'Minerai de fer'],
      productionTypes: ['Voie sèche', 'Voie semi-sèche', 'Voie humide']
    },
    {
      id: 'aluminum',
      name: 'Aluminium',
      sector: 'Aluminium',
      icon: <Zap className="h-6 w-6" />,
      description: 'Modèles pour la production d\'aluminium primaire et secondaire',
      products: ['Aluminium primaire', 'Aluminium secondaire', 'Alliages d\'aluminium'],
      defaultEmissions: { scope1: 1.2, scope2: 8.5, scope3: 2.1 },
      rawMaterials: ['Bauxite', 'Alumine', 'Électrodes carbone', 'Ferrailles d\'aluminium'],
      productionTypes: ['Électrolyse primaire', 'Refonte secondaire', 'Coulée continue']
    },
    {
      id: 'fertilizers',
      name: 'Engrais',
      sector: 'Engrais',
      icon: <Wrench className="h-6 w-6" />,
      description: 'Modèles pour la production d\'engrais azotés et phosphatés',
      products: ['Urée', 'Nitrate d\'ammonium', 'Phosphate diammonique', 'Sulfate d\'ammonium'],
      defaultEmissions: { scope1: 2.1, scope2: 0.4, scope3: 1.8 },
      rawMaterials: ['Gaz naturel', 'Ammoniac', 'Acide phosphorique', 'Acide sulfurique'],
      productionTypes: ['Synthèse Haber-Bosch', 'Neutralisation', 'Granulation']
    }
  ];

  const handleSelectModel = (model: SectorModel) => {
    setSelectedModel(model);
  };

  const handleApplyModel = () => {
    if (selectedModel) {
      onSelectModel(selectedModel);
      onOpenChange(false);
      toast.success(`Modèle ${selectedModel.name} appliqué avec succès!`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Modèles Sectoriels CBAM
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Models List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Secteurs Disponibles</h3>
            {sectorModels.map((model) => (
              <Card
                key={model.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedModel?.id === model.id ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => handleSelectModel(model)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {model.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{model.name}</h4>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {model.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {model.products.length} produits types
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Model Details */}
          <div className="space-y-4">
            {selectedModel ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {selectedModel.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedModel.name}</h3>
                    <p className="text-muted-foreground">{selectedModel.sector}</p>
                  </div>
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Produits Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.products.map((product, index) => (
                      <Badge key={index} variant="outline">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Émissions Moyennes (tCO₂e/tonne)</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {selectedModel.defaultEmissions.scope1}
                      </div>
                      <div className="text-xs text-muted-foreground">Scope 1</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedModel.defaultEmissions.scope2}
                      </div>
                      <div className="text-xs text-muted-foreground">Scope 2</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedModel.defaultEmissions.scope3}
                      </div>
                      <div className="text-xs text-muted-foreground">Scope 3</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Matières Premières Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.rawMaterials.map((material, index) => (
                      <Badge key={index} variant="secondary">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Types de Production</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.productionTypes.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Factory className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sélectionnez un secteur pour voir les détails</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleApplyModel} 
            disabled={!selectedModel}
          >
            Appliquer le Modèle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
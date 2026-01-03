import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Scope3Category, 
  CalculationMethod, 
  calculateEmissions 
} from '@/lib/ghg/scope3Categories';

interface Scope3CategoryCardProps {
  category: Scope3Category;
  isEnabled: boolean;
  onToggle: (categoryId: string, enabled: boolean) => void;
  onAddCalculation: (data: {
    categoryId: string;
    categoryNumber: number;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    quantity: number;
    unit: string;
    method: CalculationMethod;
    emissions: number;
    uncertainty: number;
    source: string;
  }) => void;
}

const methodLabels: Record<CalculationMethod, string> = {
  actual: 'Données réelles',
  technical: 'Estimation technique',
  monetary: 'Approche monétaire (€)'
};

const methodColors: Record<CalculationMethod, string> = {
  actual: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  monetary: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
};

export const Scope3CategoryCard: React.FC<Scope3CategoryCardProps> = ({
  category,
  isEnabled,
  onToggle,
  onAddCalculation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<CalculationMethod>(category.defaultMethod);
  const [quantity, setQuantity] = useState('');

  const handleAddCalculation = () => {
    const subcategory = category.subcategories.find(s => s.id === selectedSubcategory);
    if (!subcategory || !quantity) return;

    const result = calculateEmissions(selectedSubcategory, category.id, Number(quantity), selectedMethod);
    if (!result) return;

    onAddCalculation({
      categoryId: category.id,
      categoryNumber: category.number,
      categoryName: category.name,
      subcategoryId: selectedSubcategory,
      subcategoryName: subcategory.name,
      quantity: Number(quantity),
      unit: subcategory.unit,
      method: selectedMethod,
      emissions: result.emissions,
      uncertainty: result.uncertainty,
      source: result.source
    });

    // Reset form
    setSelectedSubcategory('');
    setQuantity('');
  };

  // Filter subcategories that have the selected method available
  const availableSubcategories = category.subcategories.filter(
    sub => sub.emissionFactors[selectedMethod]
  );

  const selectedSubcat = category.subcategories.find(s => s.id === selectedSubcategory);
  const currentFactor = selectedSubcat?.emissionFactors[selectedMethod];

  return (
    <Card className={`transition-all duration-200 ${isEnabled ? 'border-primary/50' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                Cat. {category.number}
              </Badge>
              <Badge 
                variant="secondary" 
                className={category.direction === 'upstream' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
              >
                {category.direction === 'upstream' ? 'Amont' : 'Aval'}
              </Badge>
            </div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription className="mt-1">{category.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium mb-1">Pertinence</p>
                  <p className="text-xs">{category.relevance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => onToggle(category.id, checked)}
            />
          </div>
        </div>
      </CardHeader>

      {isEnabled && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">
                {category.subcategories.length} sous-catégories disponibles
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-4 space-y-4">
              {/* Method selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Méthode de calcul</Label>
                <div className="flex flex-wrap gap-2">
                  {category.availableMethods.map(method => (
                    <Button
                      key={method}
                      variant={selectedMethod === method ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedMethod(method);
                        setSelectedSubcategory('');
                      }}
                      className="text-xs"
                    >
                      {methodLabels[method]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subcategory selector */}
              <div className="space-y-2">
                <Label>Sous-catégorie</Label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>
                        <div className="flex items-center gap-2">
                          <span>{sub.name}</span>
                          <span className="text-xs text-muted-foreground">({sub.unit})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSubcat && (
                  <p className="text-xs text-muted-foreground">{selectedSubcat.description}</p>
                )}
              </div>

              {/* Quantity input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unité</Label>
                  <Input value={selectedSubcat?.unit || '-'} disabled />
                </div>
              </div>

              {/* Factor info */}
              {currentFactor && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Facteur d'émission</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Valeur: </span>
                      <span className="font-medium">{currentFactor.value} {currentFactor.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Incertitude: </span>
                      <span className="font-medium">±{currentFactor.uncertainty}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Source: {currentFactor.source}
                  </div>
                  {quantity && Number(quantity) > 0 && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-sm font-medium text-primary">
                        Émissions estimées: {(Number(quantity) * currentFactor.value).toFixed(2)} kgCO₂e
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Add button */}
              <Button
                onClick={handleAddCalculation}
                disabled={!selectedSubcategory || !quantity || Number(quantity) <= 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter au calcul
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};

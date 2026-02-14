import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Trash2, Sparkles } from "lucide-react";
import { baseCarbone } from '@/lib/ghg/emissionFactors';
import { validateQuantity } from '@/lib/ghg/unitConverter';

interface Scope3FormData {
  transportType: string;
  transportQuantity: string;
  materiauType: string;
  materiauQuantity: string;
  dechetType: string;
  dechetQuantity: string;
  alimentationType: string;
  alimentationQuantity: string;
  numeriqueType: string;
  numeriqueQuantity: string;
}

interface Scope3StandardFormProps {
  data: Scope3FormData;
  onChange: (updates: Partial<Scope3FormData>) => void;
  onAddCalculation: (scope: string, category: string, subcategory: string, quantity: number) => void;
  onEnableAdvanced: () => void;
}

export const Scope3StandardForm: React.FC<Scope3StandardFormProps> = ({
  data,
  onChange,
  onAddCalculation,
  onEnableAdvanced,
}) => {
  const handleAdd = (category: string, type: string, rawQty: string) => {
    const validated = validateQuantity(rawQty);
    if (validated === null || validated === 0 || !type) return;
    onAddCalculation('scope3', category, type, validated);
  };

  const categories = [
    {
      key: 'transport',
      title: 'Transport',
      icon: <Plane className="h-5 w-5" />,
      entries: baseCarbone.scope3.transport,
      typeField: 'transportType' as const,
      qtyField: 'transportQuantity' as const,
      qtyLabel: 'Quantité',
    },
    {
      key: 'materiaux',
      title: 'Matériaux',
      icon: null,
      entries: baseCarbone.scope3.materiaux,
      typeField: 'materiauType' as const,
      qtyField: 'materiauQuantity' as const,
      qtyLabel: 'Quantité (kg)',
    },
    {
      key: 'dechets',
      title: 'Déchets',
      icon: <Trash2 className="h-5 w-5" />,
      entries: baseCarbone.scope3.dechets,
      typeField: 'dechetType' as const,
      qtyField: 'dechetQuantity' as const,
      qtyLabel: 'Quantité (kg)',
    },
    {
      key: 'alimentation',
      title: 'Alimentation',
      icon: null,
      entries: baseCarbone.scope3.alimentation,
      typeField: 'alimentationType' as const,
      qtyField: 'alimentationQuantity' as const,
      qtyLabel: 'Quantité',
    },
    {
      key: 'numerique',
      title: 'Numérique',
      icon: null,
      entries: baseCarbone.scope3.numerique,
      typeField: 'numeriqueType' as const,
      qtyField: 'numeriqueQuantity' as const,
      qtyLabel: 'Quantité',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Card key={cat.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cat.icon}
                {cat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={data[cat.typeField]}
                    onValueChange={(v) => onChange({ [cat.typeField]: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(cat.entries).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.description} ({value.unite})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{cat.qtyLabel}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data[cat.qtyField]}
                    onChange={(e) => onChange({ [cat.qtyField]: e.target.value })}
                  />
                </div>
                <Button
                  onClick={() => handleAdd(cat.key, data[cat.typeField], data[cat.qtyField])}
                  disabled={!data[cat.typeField] || !data[cat.qtyField]}
                  className="w-full"
                >
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invitation vers mode avancé */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Besoin d'une couverture complète Scope 3 ?</h3>
                <p className="text-sm text-muted-foreground">
                  Activez le mode avancé pour accéder aux 15 catégories du GHG Protocol
                </p>
              </div>
            </div>
            <Button onClick={onEnableAdvanced} variant="default">
              <Sparkles className="h-4 w-4 mr-2" />
              Activer le mode avancé
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

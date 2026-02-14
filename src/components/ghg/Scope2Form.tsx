import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, AlertTriangle } from "lucide-react";
import { baseCarbone } from '@/lib/ghg/emissionFactors';
import { convertToBaseUnit, validateQuantity } from '@/lib/ghg/unitConverter';

interface Scope2FormData {
  electriciteType: string;
  electriciteQuantity: string;
  electriciteUnit: string;
  vapeurType: string;
  vapeurQuantity: string;
  vapeurUnit: string;
}

interface Scope2FormProps {
  data: Scope2FormData;
  onChange: (updates: Partial<Scope2FormData>) => void;
  onAddCalculation: (scope: string, category: string, subcategory: string, quantity: number) => void;
}

export const Scope2Form: React.FC<Scope2FormProps> = ({ data, onChange, onAddCalculation }) => {
  const handleAdd = (category: string, type: string, rawQty: string, unit: string) => {
    const validated = validateQuantity(rawQty);
    if (validated === null || validated === 0 || !type) return;
    const finalQty = convertToBaseUnit(validated, unit);
    onAddCalculation('scope2', category, type, finalQty);
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6 pb-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important :</strong> Les facteurs d'émission sont en kg CO₂e par kWh.
            Si vous avez des MWh, utilisez le sélecteur d'unité pour une conversion automatique (×1000).
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Électricité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Mix électrique</Label>
                <Select value={data.electriciteType} onValueChange={(v) => onChange({ electriciteType: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(baseCarbone.scope2.electricite).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.description} ({value.unite})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Consommation</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.electriciteQuantity}
                  onChange={(e) => onChange({ electriciteQuantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Unité saisie</Label>
                <Select value={data.electriciteUnit || "kWh"} onValueChange={(v) => onChange({ electriciteUnit: v })}>
                  <SelectTrigger><SelectValue placeholder="Unité..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kWh">Kilowattheure (kWh)</SelectItem>
                    <SelectItem value="MWh">Mégawattheure (MWh) → ×1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => handleAdd('electricite', data.electriciteType, data.electriciteQuantity, data.electriciteUnit)}
                  disabled={!data.electriciteType || !data.electriciteQuantity}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vapeur et chaleur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Type d'énergie thermique</Label>
                <Select value={data.vapeurType} onValueChange={(v) => onChange({ vapeurType: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(baseCarbone.scope2.vapeur).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.description} ({value.unite})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.vapeurQuantity}
                  onChange={(e) => onChange({ vapeurQuantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Unité saisie</Label>
                <Select value={data.vapeurUnit || "kWh"} onValueChange={(v) => onChange({ vapeurUnit: v })}>
                  <SelectTrigger><SelectValue placeholder="Unité..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kWh">Kilowattheure (kWh)</SelectItem>
                    <SelectItem value="MWh">Mégawattheure (MWh) → ×1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => handleAdd('vapeur', data.vapeurType, data.vapeurQuantity, data.vapeurUnit)}
                  disabled={!data.vapeurType || !data.vapeurQuantity}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

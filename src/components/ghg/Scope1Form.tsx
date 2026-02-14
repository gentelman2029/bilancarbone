import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flame, Car, AlertTriangle } from "lucide-react";
import { baseCarbone } from '@/lib/ghg/emissionFactors';
import { convertToBaseUnit, validateQuantity } from '@/lib/ghg/unitConverter';

interface Scope1FormData {
  combustibleType: string;
  combustibleQuantity: string;
  combustibleUnit: string;
  refrigerantType: string;
  refrigerantQuantity: string;
  refrigerantUnit: string;
  vehiculeType: string;
  vehiculeQuantity: string;
  vehiculeUnit: string;
}

interface Scope1FormProps {
  data: Scope1FormData;
  onChange: (updates: Partial<Scope1FormData>) => void;
  onAddCalculation: (scope: string, category: string, subcategory: string, quantity: number) => void;
}

export const Scope1Form: React.FC<Scope1FormProps> = ({ data, onChange, onAddCalculation }) => {
  const handleAdd = (category: string, type: string, rawQty: string, unit: string) => {
    const validated = validateQuantity(rawQty);
    if (validated === null || validated === 0 || !type) return;
    const finalQty = convertToBaseUnit(validated, unit);
    onAddCalculation('scope1', category, type, finalQty);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Important :</strong> Les facteurs d'émission Base Carbone® ADEME sont en <strong>kg CO₂e</strong> par unité.
          Les résultats sont automatiquement convertis en tonnes (tCO₂e) pour l'affichage dans le dashboard.
        </AlertDescription>
      </Alert>

      {/* Combustibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Combustibles
          </CardTitle>
          <CardDescription>
            Combustion de combustibles fossiles et biomasse dans vos installations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Type de combustible</Label>
              <Select value={data.combustibleType} onValueChange={(v) => onChange({ combustibleType: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(baseCarbone.scope1.combustibles).map(([key, value]) => (
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
                value={data.combustibleQuantity}
                onChange={(e) => onChange({ combustibleQuantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Unité saisie</Label>
              <Select value={data.combustibleUnit || "standard"} onValueChange={(v) => onChange({ combustibleUnit: v })}>
                <SelectTrigger><SelectValue placeholder="Unité..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Unité standard (facteur ADEME)</SelectItem>
                  <SelectItem value="tonne">Tonne → auto-conversion ×1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleAdd('combustibles', data.combustibleType, data.combustibleQuantity, data.combustibleUnit)}
                disabled={!data.combustibleType || !data.combustibleQuantity}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Véhicules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Véhicules d'entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Type de véhicule</Label>
              <Select value={data.vehiculeType} onValueChange={(v) => onChange({ vehiculeType: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(baseCarbone.scope1.vehicules).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.description} ({value.unite})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Distance/Quantité</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.vehiculeQuantity}
                onChange={(e) => onChange({ vehiculeQuantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Unité saisie</Label>
              <Select value={data.vehiculeUnit || "km"} onValueChange={(v) => onChange({ vehiculeUnit: v })}>
                <SelectTrigger><SelectValue placeholder="Unité..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilomètres (km)</SelectItem>
                  <SelectItem value="1000km">Milliers km → ×1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleAdd('vehicules', data.vehiculeType, data.vehiculeQuantity, data.vehiculeUnit)}
                disabled={!data.vehiculeType || !data.vehiculeQuantity}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Réfrigérants */}
      <Card>
        <CardHeader>
          <CardTitle>Réfrigérants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Type de réfrigérant</Label>
              <Select value={data.refrigerantType} onValueChange={(v) => onChange({ refrigerantType: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(baseCarbone.scope1.refrigerants).map(([key, value]) => (
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
                value={data.refrigerantQuantity}
                onChange={(e) => onChange({ refrigerantQuantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Unité saisie</Label>
              <Select value={data.refrigerantUnit || "kg"} onValueChange={(v) => onChange({ refrigerantUnit: v })}>
                <SelectTrigger><SelectValue placeholder="Unité..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                  <SelectItem value="tonne">Tonnes → ×1000 kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleAdd('refrigerants', data.refrigerantType, data.refrigerantQuantity, data.refrigerantUnit)}
                disabled={!data.refrigerantType || !data.refrigerantQuantity}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

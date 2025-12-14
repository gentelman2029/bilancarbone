import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Factory, 
  Plus, 
  Trash2, 
  Calculator, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Precursor {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  origin_country: string;
  emission_factor: number;
  emissions: number;
  supplier: string;
  certification: 'Verified' | 'Default' | 'Missing';
}

interface PrecursorCalculation {
  total_precursor_emissions: number;
  total_quantity: number;
  average_emission_factor: number;
  precursors: Precursor[];
}

const PRECURSORS_STORAGE_KEY = 'cbam_precursors_data';
const CALCULATION_STORAGE_KEY = 'cbam_precursors_calculation';

// Fonctions de persistance localStorage
const loadPrecursorsFromStorage = (): Precursor[] => {
  try {
    const stored = localStorage.getItem(PRECURSORS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const savePrecursorsToStorage = (precursors: Precursor[]) => {
  localStorage.setItem(PRECURSORS_STORAGE_KEY, JSON.stringify(precursors));
};

const loadCalculationFromStorage = (): PrecursorCalculation | null => {
  try {
    const stored = localStorage.getItem(CALCULATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveCalculationToStorage = (calculation: PrecursorCalculation | null) => {
  if (calculation) {
    localStorage.setItem(CALCULATION_STORAGE_KEY, JSON.stringify(calculation));
  } else {
    localStorage.removeItem(CALCULATION_STORAGE_KEY);
  }
};

export const CBAMPrecursorsModule = () => {
  const [precursors, setPrecursors] = useState<Precursor[]>([]);
  const [newPrecursor, setNewPrecursor] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    origin_country: '',
    emission_factor: '',
    supplier: '',
    certification: 'Default' as const
  });
  const [calculation, setCalculation] = useState<PrecursorCalculation | null>(null);

  // Charger les données au montage
  useEffect(() => {
    const storedPrecursors = loadPrecursorsFromStorage();
    const storedCalculation = loadCalculationFromStorage();
    if (storedPrecursors.length > 0) {
      setPrecursors(storedPrecursors);
    }
    if (storedCalculation) {
      setCalculation(storedCalculation);
    }
  }, []);

  // Sauvegarder automatiquement les précurseurs à chaque modification
  useEffect(() => {
    savePrecursorsToStorage(precursors);
  }, [precursors]);

  // Sauvegarder automatiquement le calcul à chaque modification
  useEffect(() => {
    saveCalculationToStorage(calculation);
  }, [calculation]);

  // Catégories de matières premières pour différents secteurs CBAM
  const precursorCategories = {
    iron_steel: [
      { name: 'Minerai de fer', factor: 0.024, unit: 'kg' },
      { name: 'Charbon de coke', factor: 2.87, unit: 'kg' },
      { name: 'Ferraille', factor: 0.095, unit: 'kg' },
      { name: 'Calcaire', factor: 0.008, unit: 'kg' },
      { name: 'Dolomie', factor: 0.012, unit: 'kg' }
    ],
    cement: [
      { name: 'Calcaire', factor: 0.008, unit: 'kg' },
      { name: 'Argile', factor: 0.015, unit: 'kg' },
      { name: 'Gypse', factor: 0.006, unit: 'kg' },
      { name: 'Sable siliceux', factor: 0.003, unit: 'kg' }
    ],
    aluminium: [
      { name: 'Bauxite', factor: 0.045, unit: 'kg' },
      { name: 'Cryolithe', factor: 2.1, unit: 'kg' },
      { name: 'Anodes carbone', factor: 8.5, unit: 'kg' }
    ],
    fertilizers: [
      { name: 'Ammoniaque', factor: 1.87, unit: 'kg' },
      { name: 'Acide phosphorique', factor: 0.65, unit: 'kg' },
      { name: 'Chlorure de potassium', factor: 0.12, unit: 'kg' },
      { name: 'Acide sulfurique', factor: 0.08, unit: 'kg' }
    ]
  };

  // Pays et leurs facteurs d'émission
  const countries = [
    { code: 'TN', name: '🇹🇳 Tunisie', factor: 0.48 },
    { code: 'CN', name: '🇨🇳 Chine', factor: 0.555 },
    { code: 'IN', name: '🇮🇳 Inde', factor: 0.82 },
    { code: 'BR', name: '🇧🇷 Brésil', factor: 0.074 },
    { code: 'AU', name: '🇦🇺 Australie', factor: 0.79 },
    { code: 'RU', name: '🇷🇺 Russie', factor: 0.322 },
    { code: 'ZA', name: '🇿🇦 Afrique du Sud', factor: 0.928 }
  ];

  const addPrecursor = () => {
    if (!newPrecursor.name || !newPrecursor.quantity || !newPrecursor.emission_factor) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(newPrecursor.quantity);
    const emissionFactor = parseFloat(newPrecursor.emission_factor);
    const emissions = quantity * emissionFactor;

    const precursor: Precursor = {
      id: Date.now().toString(),
      name: newPrecursor.name,
      category: newPrecursor.category,
      quantity,
      unit: newPrecursor.unit,
      origin_country: newPrecursor.origin_country,
      emission_factor: emissionFactor,
      emissions,
      supplier: newPrecursor.supplier,
      certification: newPrecursor.certification
    };

    setPrecursors(prev => [...prev, precursor]);
    
    // Reset form
    setNewPrecursor({
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      origin_country: '',
      emission_factor: '',
      supplier: '',
      certification: 'Default'
    });

    toast({
      title: "Précurseur ajouté",
      description: `${precursor.name} - ${emissions.toFixed(3)} tCO₂e`
    });
  };

  const removePrecursor = (id: string) => {
    setPrecursors(prev => prev.filter(p => p.id !== id));
  };

  const calculatePrecursorEmissions = () => {
    if (precursors.length === 0) {
      toast({
        title: "Aucun précurseur",
        description: "Veuillez ajouter au moins un précurseur",
        variant: "destructive"
      });
      return;
    }

    const totalEmissions = precursors.reduce((sum, p) => sum + p.emissions, 0);
    const totalQuantity = precursors.reduce((sum, p) => sum + p.quantity, 0);
    const averageEmissionFactor = totalQuantity > 0 ? totalEmissions / totalQuantity : 0;

    console.log('Calcul des précurseurs:', {
      precursors: precursors.map(p => ({ name: p.name, quantity: p.quantity, emissions: p.emissions })),
      totalEmissions,
      totalQuantity,
      averageEmissionFactor
    });

    const calc: PrecursorCalculation = {
      total_precursor_emissions: totalEmissions,
      total_quantity: totalQuantity,
      average_emission_factor: averageEmissionFactor,
      precursors: precursors
    };

    setCalculation(calc);

    toast({
      title: "Calcul effectué ✅",
      description: `Émissions totales: ${totalEmissions.toFixed(3)} tCO₂e (${precursors.length} précurseurs)`
    });
  };

  const getCertificationColor = (cert: string) => {
    switch (cert) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Default': return 'bg-orange-100 text-orange-800';
      case 'Missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationIcon = (cert: string) => {
    switch (cert) {
      case 'Verified': return <CheckCircle className="h-4 w-4" />;
      case 'Default': return <AlertTriangle className="h-4 w-4" />;
      case 'Missing': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const selectPredefinedMaterial = (material: any) => {
    setNewPrecursor(prev => ({
      ...prev,
      name: material.name,
      emission_factor: material.factor.toString(),
      unit: material.unit
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            Module Matières Premières et Précurseurs
            <Badge variant="secondary">CBAM Scope 3</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Traçabilité complète des émissions des matières premières utilisées dans votre production
          </p>
        </CardHeader>
      </Card>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un Précurseur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nom du matériau</Label>
              <Input
                value={newPrecursor.name}
                onChange={(e) => setNewPrecursor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Minerai de fer"
              />
            </div>
            <div>
              <Label>Fournisseur</Label>
              <Input
                value={newPrecursor.supplier}
                onChange={(e) => setNewPrecursor(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="Nom du fournisseur"
              />
            </div>
            <div>
              <Label>Pays d'origine</Label>
              <Select 
                value={newPrecursor.origin_country} 
                onValueChange={(value) => setNewPrecursor(prev => ({ ...prev, origin_country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Quantité</Label>
              <Input
                type="number"
                value={newPrecursor.quantity}
                onChange={(e) => setNewPrecursor(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Unité</Label>
              <Select 
                value={newPrecursor.unit} 
                onValueChange={(value) => setNewPrecursor(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="tonnes">tonnes</SelectItem>
                  <SelectItem value="m³">m³</SelectItem>
                  <SelectItem value="litres">litres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Facteur d'émission (kgCO₂e/unité)</Label>
              <Input
                type="number"
                step="0.001"
                value={newPrecursor.emission_factor}
                onChange={(e) => setNewPrecursor(prev => ({ ...prev, emission_factor: e.target.value }))}
                placeholder="0.000"
              />
            </div>
            <div>
              <Label>Certification</Label>
              <Select 
                value={newPrecursor.certification} 
                onValueChange={(value) => setNewPrecursor(prev => ({ ...prev, certification: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verified">✅ Vérifiée</SelectItem>
                  <SelectItem value="Default">⚠️ Par défaut</SelectItem>
                  <SelectItem value="Missing">❌ Manquante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Matériaux prédéfinis */}
          <div>
            <h4 className="font-semibold mb-2">Matériaux Prédéfinis par Secteur</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(precursorCategories).map(([sector, materials]) => (
                <div key={sector} className="space-y-1">
                  <h5 className="text-sm font-medium capitalize">{sector.replace('_', ' ')}</h5>
                  {materials.map((material) => (
                    <Button
                      key={material.name}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start text-xs"
                      onClick={() => selectPredefinedMaterial(material)}
                    >
                      {material.name}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={addPrecursor} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Précurseur
          </Button>
        </CardContent>
      </Card>

      {/* Liste des précurseurs */}
      {precursors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Précurseurs Configurés ({precursors.length})
              </span>
              <Button onClick={calculatePrecursorEmissions}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculer Total
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="text-left p-2">Matériau</th>
                    <th className="text-left p-2">Fournisseur</th>
                    <th className="text-left p-2">Origine</th>
                    <th className="text-right p-2">Quantité</th>
                    <th className="text-right p-2">Facteur</th>
                    <th className="text-right p-2">Émissions</th>
                    <th className="text-center p-2">Certification</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {precursors.map((precursor) => (
                    <tr key={precursor.id} className="border-b">
                      <td className="p-2 font-medium">{precursor.name}</td>
                      <td className="p-2 text-sm">{precursor.supplier || '-'}</td>
                      <td className="p-2 text-sm">
                        {countries.find(c => c.code === precursor.origin_country)?.name || precursor.origin_country}
                      </td>
                      <td className="p-2 text-right text-sm">
                        {precursor.quantity.toLocaleString()} {precursor.unit}
                      </td>
                      <td className="p-2 text-right text-sm">
                        {precursor.emission_factor.toFixed(3)}
                      </td>
                      <td className="p-2 text-right font-semibold">
                        {precursor.emissions.toFixed(3)} tCO₂e
                      </td>
                      <td className="p-2 text-center">
                        <Badge className={getCertificationColor(precursor.certification)}>
                          {getCertificationIcon(precursor.certification)}
                          <span className="ml-1">{precursor.certification}</span>
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrecursor(precursor.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Résultats des Émissions Précurseurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculation.total_precursor_emissions.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Émissions (tCO₂e)
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {calculation.total_quantity.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quantité Totale (toutes unités)
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {calculation.average_emission_factor.toFixed(4)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Facteur Moyen (kgCO₂e/unité)
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">Analyse de Traçabilité</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Données Vérifiées:</strong> {calculation.precursors.filter(p => p.certification === 'Verified').length}
                </div>
                <div>
                  <strong>Valeurs par Défaut:</strong> {calculation.precursors.filter(p => p.certification === 'Default').length}
                </div>
                <div>
                  <strong>Données Manquantes:</strong> {calculation.precursors.filter(p => p.certification === 'Missing').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
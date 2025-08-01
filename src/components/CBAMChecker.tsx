import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, ArrowLeft, ArrowRight, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CBAMProduct {
  id: string;
  sector: string;
  category: string;
  country: string;
  volume: number;
  emissionFactor: number;
  euEmissionFactor: number;
}

interface CBAMResult {
  totalProducts: number;
  totalEmissions: number;
  totalCost: number;
  riskLevel: string;
}

export const CBAMChecker = () => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<CBAMProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    sector: '',
    category: '',
    country: '',
    volume: ''
  });
  const [result, setResult] = useState<CBAMResult | null>(null);

  // CBAM emission factors by sector and category
  const emissionFactors = {
    'Iron': {
      'Pig iron': 2.1,
      'Cast iron': 1.8,
      'Ferro-alloys': 2.5,
      'Steel products': 1.9
    },
    'Fertilizers': {
      'Ammonia': 2.8,
      'Nitric acid': 1.2,
      'Urea': 1.8,
      'Other fertilizers': 2.0
    },
    'Aluminium': {
      'Primary aluminium': 11.5,
      'Secondary aluminium': 2.1,
      'Aluminium products': 8.2
    },
    'Cement': {
      'Clinker': 0.85,
      'Cement': 0.82,
      'Quicklime': 0.78
    }
  };

  // EU benchmark emission factors
  const euBenchmarks = {
    'Iron': 1.2,
    'Fertilizers': 1.5,
    'Aluminium': 6.8,
    'Cement': 0.55
  };

  // CBAM price (€/tonne CO2)
  const cbamPrice = 90;

  const addProduct = () => {
    if (!currentProduct.sector || !currentProduct.category || !currentProduct.country || !currentProduct.volume) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs pour ajouter la marchandise.",
        variant: "destructive"
      });
      return;
    }

    const sectorEmissions = emissionFactors[currentProduct.sector as keyof typeof emissionFactors];
    const categoryEmissionFactor = sectorEmissions[currentProduct.category as keyof typeof sectorEmissions];
    const euBenchmark = euBenchmarks[currentProduct.sector as keyof typeof euBenchmarks];

    const newProduct: CBAMProduct = {
      id: Math.random().toString(36).substr(2, 9),
      sector: currentProduct.sector,
      category: currentProduct.category,
      country: currentProduct.country,
      volume: parseFloat(currentProduct.volume),
      emissionFactor: categoryEmissionFactor,
      euEmissionFactor: euBenchmark
    };

    setProducts([...products, newProduct]);
    setCurrentProduct({ sector: '', category: '', country: '', volume: '' });
    
    toast({
      title: "Marchandise ajoutée",
      description: "La marchandise a été ajoutée à votre liste."
    });
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const calculateResults = () => {
    if (products.length === 0) {
      toast({
        title: "Aucune marchandise",
        description: "Veuillez ajouter au moins une marchandise.",
        variant: "destructive"
      });
      return;
    }

    const totalEmissions = products.reduce((sum, product) => 
      sum + (product.volume * product.emissionFactor), 0
    );
    
    const totalCost = totalEmissions * cbamPrice;
    
    let riskLevel = 'Faible';
    if (totalCost > 100000) riskLevel = 'Élevé';
    else if (totalCost > 50000) riskLevel = 'Modéré';

    setResult({
      totalProducts: products.length,
      totalEmissions,
      totalCost,
      riskLevel
    });
    
    setStep(2);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Élevé': return 'bg-red-100 text-red-800 border-red-200';
      case 'Modéré': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getAvailableCategories = () => {
    if (!currentProduct.sector) return [];
    return Object.keys(emissionFactors[currentProduct.sector as keyof typeof emissionFactors] || {});
  };

  // Available sectors
  const sectors = [
    { value: 'Iron', label: 'Iron' },
    { value: 'Fertilizers', label: 'Fertilizers' },
    { value: 'Aluminium', label: 'Aluminium' },
    { value: 'Cement', label: 'Cement' }
  ];

  // Available countries
  const countries = [
    { value: 'Chine', label: 'Chine' },
    { value: 'Inde', label: 'Inde' },
    { value: 'Russie', label: 'Russie' },
    { value: 'Turquie', label: 'Turquie' },
    { value: 'Ukraine', label: 'Ukraine' },
    { value: 'États-Unis', label: 'États-Unis' },
    { value: 'Brésil', label: 'Brésil' },
    { value: 'Autre', label: 'Autre' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Vérificateur CBAM
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step === 2) {
                  setStep(1);
                  setResult(null);
                }
              }}
              className={step === 1 ? "invisible" : ""}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="text-sm text-muted-foreground">
              {step}/3
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <DialogTitle className="text-center text-2xl">
            {step === 1 
              ? "Ajoutez chaque marchandise MACF importée chaque année"
              : "Vos résultats CBAM"
            }
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Product categories tabs */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {sectors.map((sector) => (
                <Button
                  key={sector.value}
                  variant={currentProduct.sector === sector.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentProduct({ ...currentProduct, sector: sector.value, category: '' })}
                  className="flex-1"
                >
                  {sector.label}
                </Button>
              ))}
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={currentProduct.category} 
                  onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value })}
                  disabled={!currentProduct.sector}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Select 
                  value={currentProduct.country} 
                  onValueChange={(value) => setCurrentProduct({ ...currentProduct, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume importé par an (en tonnes)</Label>
                <Input
                  id="volume"
                  type="number"
                  value={currentProduct.volume}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, volume: e.target.value })}
                  placeholder="Volume"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addProduct} className="w-full">
                  Ajouter la marchandise
                </Button>
              </div>
            </div>

            {/* Products table */}
            {products.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-sm text-muted-foreground">
                          <th className="text-left p-2">Secteur</th>
                          <th className="text-left p-2">Catégorie</th>
                          <th className="text-left p-2">Pays</th>
                          <th className="text-left p-2">Volume (t)</th>
                          <th className="text-left p-2">Facteur d'émission</th>
                          <th className="text-left p-2">Facteur d'émission EU</th>
                          <th className="text-center p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr key={product.id} className="border-b text-sm">
                            <td className="p-2">{product.sector}</td>
                            <td className="p-2">{product.category}</td>
                            <td className="p-2">{product.country}</td>
                            <td className="p-2">{product.volume}</td>
                            <td className="p-2">{product.emissionFactor}</td>
                            <td className="p-2">{product.euEmissionFactor}</td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProduct(product.id)}
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

            <div className="flex justify-end">
              <Button 
                onClick={calculateResults} 
                disabled={products.length === 0}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8"
              >
                Voir les résultats →
              </Button>
            </div>

            {/* Information section */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">Qu'est-ce qu'une marchandise MACF ?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Une marchandise MACF est un produit importé dans l'UE qui entre dans le champ d'application 
                      du MACF (Mécanisme d'Ajustement Carbone aux Frontières). En tant que déclarant UE, je dois 
                      déclarer les émissions intégrées (directes et indirectes) associées à ces marchandises, 
                      afin de garantir la conformité avec les réglementations de l'UE en matière de tarification du carbone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Résultats de votre évaluation CBAM
                  <Badge className={getRiskColor(result.riskLevel)}>
                    Risque {result.riskLevel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600">{result.totalProducts}</div>
                    <div className="text-sm text-muted-foreground mt-2">Marchandises</div>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <div className="text-4xl font-bold text-orange-600">{result.totalEmissions.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground mt-2">tonnes CO₂e</div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <div className="text-4xl font-bold text-red-600">€{result.totalCost.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-2">Coût CBAM estimé</div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-4 text-lg">Analyse et recommandations</h4>
                  {result.riskLevel === 'Élevé' && (
                    <div className="space-y-3">
                      <p className="text-red-700 font-medium flex items-center gap-2">
                        ⚠️ Impact financier significatif détecté
                      </p>
                      <ul className="text-sm space-y-1 ml-4 text-gray-700">
                        <li>• Explorez des fournisseurs dans des pays avec une tarification carbone plus élevée</li>
                        <li>• Investissez dans des technologies plus propres</li>
                        <li>• Considérez la relocalisation de certaines activités</li>
                        <li>• Négociez des contrats incluant les coûts CBAM</li>
                      </ul>
                    </div>
                  )}
                  {result.riskLevel === 'Modéré' && (
                    <div className="space-y-3">
                      <p className="text-yellow-700 font-medium flex items-center gap-2">
                        📊 Impact modéré - surveillance recommandée
                      </p>
                      <ul className="text-sm space-y-1 ml-4 text-gray-700">
                        <li>• Surveillez l'évolution des prix CBAM</li>
                        <li>• Explorez des options de fournisseurs plus propres</li>
                        <li>• Préparez des stratégies d'atténuation</li>
                        <li>• Sensibilisez vos fournisseurs aux enjeux carbone</li>
                      </ul>
                    </div>
                  )}
                  {result.riskLevel === 'Faible' && (
                    <div className="space-y-3">
                      <p className="text-green-700 font-medium flex items-center gap-2">
                        ✅ Impact limité - bonne position
                      </p>
                      <ul className="text-sm space-y-1 ml-4 text-gray-700">
                        <li>• Votre chaîne d'approvisionnement est bien positionnée</li>
                        <li>• Continuez à surveiller les évolutions réglementaires</li>
                        <li>• Maintenez vos bonnes pratiques actuelles</li>
                        <li>• Communiquez sur votre avantage concurrentiel</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="text-center pt-6 border-t">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Préparez-vous : le MACF arrive</h3>
                    <div className="text-6xl font-mono font-bold text-red-600">
                      152 : 00 : 05 : 19
                    </div>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                      Commencez avec Greenly
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
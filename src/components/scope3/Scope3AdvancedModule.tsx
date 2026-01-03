import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Trash2,
  FileSpreadsheet,
  Building,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  SCOPE3_CATEGORIES, 
  getUpstreamCategories, 
  getDownstreamCategories,
  CalculationMethod 
} from '@/lib/ghg/scope3Categories';
import { Scope3CategoryCard } from './Scope3CategoryCard';

interface Scope3Calculation {
  id: string;
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
  timestamp: Date;
}

interface Scope3AdvancedModuleProps {
  onCalculationsChange?: (calculations: Scope3Calculation[]) => void;
  onTotalChange?: (total: number) => void;
}

const methodLabels: Record<CalculationMethod, string> = {
  actual: 'Données réelles',
  technical: 'Estimation technique',
  monetary: 'Approche monétaire'
};

export const Scope3AdvancedModule: React.FC<Scope3AdvancedModuleProps> = ({
  onCalculationsChange,
  onTotalChange
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upstream');
  const [enabledCategories, setEnabledCategories] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('scope3-enabled-categories');
    if (saved) return JSON.parse(saved);
    // By default, enable first 5 most common categories
    return {
      'purchased_goods_services': true,
      'business_travel': true,
      'employee_commuting': true,
      'waste_generated': true,
      'upstream_transport': true
    };
  });
  const [calculations, setCalculations] = useState<Scope3Calculation[]>(() => {
    const saved = localStorage.getItem('scope3-advanced-calculations');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('scope3-enabled-categories', JSON.stringify(enabledCategories));
  }, [enabledCategories]);

  useEffect(() => {
    localStorage.setItem('scope3-advanced-calculations', JSON.stringify(calculations));
    onCalculationsChange?.(calculations);
    onTotalChange?.(getTotalEmissions());
  }, [calculations]);

  const handleToggleCategory = (categoryId: string, enabled: boolean) => {
    setEnabledCategories(prev => ({ ...prev, [categoryId]: enabled }));
  };

  const handleAddCalculation = (data: Omit<Scope3Calculation, 'id' | 'timestamp'>) => {
    const newCalc: Scope3Calculation = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    setCalculations(prev => [...prev, newCalc]);
    toast({
      title: "Calcul ajouté",
      description: `${data.emissions.toFixed(2)} kgCO₂e - Cat. ${data.categoryNumber}: ${data.subcategoryName}`
    });
  };

  const handleRemoveCalculation = (id: string) => {
    setCalculations(prev => prev.filter(c => c.id !== id));
  };

  const getTotalEmissions = () => {
    return calculations.reduce((sum, c) => sum + c.emissions, 0);
  };

  const getEmissionsByCategory = () => {
    const byCategory: Record<number, number> = {};
    calculations.forEach(c => {
      byCategory[c.categoryNumber] = (byCategory[c.categoryNumber] || 0) + c.emissions;
    });
    return byCategory;
  };

  const getUpstreamTotal = () => {
    return calculations
      .filter(c => getUpstreamCategories().some(cat => cat.id === c.categoryId))
      .reduce((sum, c) => sum + c.emissions, 0);
  };

  const getDownstreamTotal = () => {
    return calculations
      .filter(c => getDownstreamCategories().some(cat => cat.id === c.categoryId))
      .reduce((sum, c) => sum + c.emissions, 0);
  };

  const getAverageUncertainty = () => {
    if (calculations.length === 0) return 0;
    const totalWeightedUncertainty = calculations.reduce(
      (sum, c) => sum + (c.uncertainty * c.emissions), 0
    );
    return totalWeightedUncertainty / getTotalEmissions();
  };

  const exportToCSV = () => {
    const headers = [
      'Catégorie N°',
      'Catégorie',
      'Sous-catégorie',
      'Méthode',
      'Quantité',
      'Unité',
      'Facteur source',
      'Émissions (kgCO2e)',
      'Incertitude (%)',
      'Date'
    ];
    
    const rows = calculations.map(c => [
      c.categoryNumber,
      c.categoryName,
      c.subcategoryName,
      methodLabels[c.method],
      c.quantity,
      c.unit,
      c.source,
      c.emissions.toFixed(3),
      c.uncertainty,
      new Date(c.timestamp).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scope3-ghg-protocol-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const enabledCount = Object.values(enabledCategories).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header with compliance badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scope 3 - Calculateur Avancé</h2>
          <p className="text-muted-foreground">15 catégories conformes au GHG Protocol</p>
        </div>
        <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          GHG Protocol Compliant
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Amont (1-8)</p>
                <p className="text-2xl font-bold">{(getUpstreamTotal() / 1000).toFixed(1)} tCO₂e</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowDownRight className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aval (9-15)</p>
                <p className="text-2xl font-bold">{(getDownstreamTotal() / 1000).toFixed(1)} tCO₂e</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Scope 3</p>
                <p className="text-2xl font-bold">{(getTotalEmissions() / 1000).toFixed(1)} tCO₂e</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Incertitude moy.</p>
                <p className="text-2xl font-bold">±{getAverageUncertainty().toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories enabled indicator */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            <strong>{enabledCount}</strong> catégories activées sur 15
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setCalculations([]);
              toast({ title: "Calculs réinitialisés" });
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Categories tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upstream" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Amont (Cat. 1-8)
          </TabsTrigger>
          <TabsTrigger value="downstream" className="flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4" />
            Aval (Cat. 9-15)
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Résumé ({calculations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upstream">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4 pb-4">
              {getUpstreamCategories().map(category => (
                <Scope3CategoryCard
                  key={category.id}
                  category={category}
                  isEnabled={enabledCategories[category.id] || false}
                  onToggle={handleToggleCategory}
                  onAddCalculation={handleAddCalculation}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="downstream">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4 pb-4">
              {getDownstreamCategories().map(category => (
                <Scope3CategoryCard
                  key={category.id}
                  category={category}
                  isEnabled={enabledCategories[category.id] || false}
                  onToggle={handleToggleCategory}
                  onAddCalculation={handleAddCalculation}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Détail des calculs Scope 3</CardTitle>
              <CardDescription>
                Traçabilité complète avec méthodes, sources et incertitudes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun calcul enregistré. Activez des catégories et ajoutez des données.
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {calculations.map((calc, index) => (
                      <div 
                        key={calc.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Cat. {calc.categoryNumber}
                            </Badge>
                            <Badge className={
                              calc.method === 'actual' ? 'bg-green-100 text-green-800' :
                              calc.method === 'technical' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {methodLabels[calc.method]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              ±{calc.uncertainty}%
                            </Badge>
                          </div>
                          <p className="font-medium">{calc.subcategoryName}</p>
                          <p className="text-sm text-muted-foreground">
                            {calc.quantity.toLocaleString('fr-FR')} {calc.unit} × {calc.source}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {calc.emissions.toFixed(2)} kgCO₂e
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(calc.timestamp).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCalculation(calc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {calculations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Scope 3</span>
                    <span className="text-2xl font-bold text-primary">
                      {(getTotalEmissions() / 1000).toFixed(2)} tCO₂e
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Leaf, Users, Building2, HelpCircle, Calculator } from 'lucide-react';
import { ESGCategory, ESGIndicator } from '@/lib/esg/types';

interface ESGIndicatorFormProps {
  categories: ESGCategory[];
  revenue: number;
  onIndicatorChange: (categoryId: string, indicatorId: string, value: number | boolean) => void;
  onRevenueChange: (revenue: number) => void;
}

const CategoryIcon = ({ id }: { id: string }) => {
  switch (id) {
    case 'E': return <Leaf className="h-5 w-5 text-emerald-500" />;
    case 'S': return <Users className="h-5 w-5 text-blue-500" />;
    case 'G': return <Building2 className="h-5 w-5 text-purple-500" />;
    default: return null;
  }
};

const IndicatorInput: React.FC<{
  indicator: ESGIndicator;
  onChange: (value: number | boolean) => void;
}> = ({ indicator, onChange }) => {
  if (indicator.type === 'binary') {
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={indicator.value === true}
          onCheckedChange={(checked) => onChange(checked)}
        />
        <span className="text-sm text-muted-foreground">
          {indicator.value ? 'Oui' : 'Non'}
        </span>
      </div>
    );
  }

  if (indicator.type === 'calculated') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">
            {typeof indicator.value === 'number' 
              ? indicator.value.toLocaleString('fr-FR', { maximumFractionDigits: 4 })
              : '—'}
          </span>
          <span className="text-xs text-muted-foreground">{indicator.unit}</span>
        </div>
        <Badge variant="secondary" className="text-xs">Auto</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={typeof indicator.value === 'number' ? indicator.value : ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-32"
        step={indicator.unit === '%' ? '0.1' : '1'}
        min="0"
      />
      <span className="text-sm text-muted-foreground min-w-[60px]">{indicator.unit}</span>
    </div>
  );
};

export const ESGIndicatorForm: React.FC<ESGIndicatorFormProps> = ({
  categories,
  revenue,
  onIndicatorChange,
  onRevenueChange,
}) => {
  return (
    <TooltipProvider>
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Saisie des Indicateurs BVMT
          </CardTitle>
          <CardDescription>
            32 indicateurs conformes au Guide de Reporting ESG de la Bourse de Tunis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Revenue Input - Required for calculated KPIs */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              Chiffre d'Affaires Annuel
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Requis pour calculer l'intensité énergétique (E2) et carbone (E8)</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={revenue || ''}
                onChange={(e) => onRevenueChange(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 15000000"
                className="w-48"
              />
              <span className="text-sm text-muted-foreground">TND</span>
            </div>
          </div>

          <Tabs defaultValue="E" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <CategoryIcon id={category.id} />
                  <span>{category.label}</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {Math.round(category.weight * 100)}%
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="grid gap-4">
                  {category.indicators.map((indicator, idx) => (
                    <div
                      key={indicator.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="outline" className="font-mono text-xs w-10 justify-center">
                          {indicator.id}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{indicator.label}</span>
                            {indicator.description && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{indicator.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                      <IndicatorInput
                        indicator={indicator}
                        onChange={(value) => onIndicatorChange(category.id, indicator.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

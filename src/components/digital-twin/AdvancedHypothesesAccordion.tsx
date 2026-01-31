import { useState } from 'react';
import { ChevronDown, Settings2, Percent, Calendar, CloudRain, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AdvancedHypothesesAccordionProps {
  // Fiscal & Finance
  corporateTaxRate: string;
  setCorporateTaxRate: (value: string) => void;
  discountRate: string;
  setDiscountRate: (value: string) => void;
  
  // Maintenance
  omPercentage: string;
  setOmPercentage: (value: string) => void;
  
  // Lifetimes
  panelLifetime: string;
  setPanelLifetime: (value: string) => void;
  batteryLifetime: string;
  setBatteryLifetime: (value: string) => void;
  depreciationYears: string;
  setDepreciationYears: (value: string) => void;
  
  // Weather Risk
  weatherScenario: 'P50' | 'P90';
  setWeatherScenario: (value: 'P50' | 'P90') => void;
}

const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-white border-gray-200 text-gray-700 shadow-lg">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const AdvancedHypothesesAccordion = ({
  corporateTaxRate,
  setCorporateTaxRate,
  discountRate,
  setDiscountRate,
  omPercentage,
  setOmPercentage,
  panelLifetime,
  setPanelLifetime,
  batteryLifetime,
  setBatteryLifetime,
  depreciationYears,
  setDepreciationYears,
  weatherScenario,
  setWeatherScenario,
}: AdvancedHypothesesAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-white border-gray-200 shadow-sm" data-tour="config-advanced-hypotheses">
        <CollapsibleTrigger asChild>
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Settings2 className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-medium text-gray-900">Hypothèses de Calcul</h3>
                <p className="text-xs text-gray-500">Fiscalité, durées de vie, risques</p>
              </div>
            </div>
            <ChevronDown 
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 px-5 space-y-6">
            <div className="border-t border-gray-100 pt-4" />

            {/* Section: Fiscalité & Finance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-gray-800">Fiscalité & Finance</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-xs text-gray-600">Taux IS</Label>
                    <InfoTooltip content="Taux d'Impôt sur les Sociétés applicable. En Tunisie, taux réduit de 15% pour les énergies renouvelables." />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={35}
                      step={0.5}
                      value={corporateTaxRate}
                      onChange={(e) => setCorporateTaxRate(e.target.value)}
                      className="pr-8 bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-xs text-gray-600">Taux d'Actualisation (WACC)</Label>
                    <InfoTooltip content="Weighted Average Cost of Capital. Utilisé pour calculer la VAN. Représente le coût du capital pondéré de l'entreprise." />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      step={0.5}
                      value={discountRate}
                      onChange={(e) => setDiscountRate(e.target.value)}
                      className="pr-8 bg-white border-gray-300 text-gray-900 focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Maintenance O&M */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-800">Maintenance (O&M)</h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Label className="text-xs text-gray-600">Coût O&M annuel</Label>
                    <InfoTooltip content="Coûts d'Opération & Maintenance exprimés en pourcentage du CAPEX. Inclut nettoyage, monitoring, remplacement onduleurs." />
                  </div>
                  <span className="text-sm font-semibold text-orange-600">{omPercentage}% du CAPEX</span>
                </div>
                <Slider
                  value={[parseFloat(omPercentage) || 1.5]}
                  onValueChange={(v) => setOmPercentage(v[0].toString())}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0.5%</span>
                  <span>3%</span>
                </div>
              </div>
            </div>

            {/* Section: Durées de Vie & Amortissement */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-800">Durées de Vie & Amortissement</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-xs text-gray-600">Panneaux</Label>
                    <InfoTooltip content="Durée de vie technique des panneaux solaires. Standard industriel : 25-30 ans avec dégradation progressive." />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={15}
                      max={35}
                      value={panelLifetime}
                      onChange={(e) => setPanelLifetime(e.target.value)}
                      className="pr-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ans</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-xs text-gray-600">Batteries</Label>
                    <InfoTooltip content="Durée de vie des batteries lithium. Remplacement prévu (Re-vamping) à cette échéance dans les flux de trésorerie." />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={5}
                      max={15}
                      value={batteryLifetime}
                      onChange={(e) => setBatteryLifetime(e.target.value)}
                      className="pr-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ans</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-xs text-gray-600">Amort. fiscal</Label>
                    <InfoTooltip content="Durée d'amortissement comptable pour le calcul des déductions fiscales (IS). Accéléré pour les EnR." />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={3}
                      max={15}
                      value={depreciationYears}
                      onChange={(e) => setDepreciationYears(e.target.value)}
                      className="pr-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ans</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Facteur de Risque Météo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-cyan-500" />
                <h4 className="text-sm font-semibold text-gray-800">Facteur de Risque Météo</h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label className="text-xs text-gray-600">Scénario de production</Label>
                  <InfoTooltip content="P50 = production médiane attendue. P90 = production garantie à 90% (conservateur, -5% sur le productible). Utilisé pour les financements bancaires." />
                </div>
                <Select value={weatherScenario} onValueChange={(v) => setWeatherScenario(v as 'P50' | 'P90')}>
                  <SelectTrigger className="focus:border-cyan-500 bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="P50" className="text-gray-900 focus:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">P50 - Standard</span>
                        <span className="text-xs text-gray-500">(Production médiane)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="P90" className="text-gray-900 focus:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">P90 - Conservateur</span>
                        <span className="text-xs text-gray-500">(-5% production)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {weatherScenario === 'P50' 
                    ? "Production attendue dans 50% des années. Scénario de référence."
                    : "Production minimale garantie dans 90% des années. Exigé par les banques pour le financement projet."}
                </p>
              </div>
            </div>

          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Info, Calculator, Clock, Zap, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CalculationNotes = () => {
  const [isOpen, setIsOpen] = useState(false);

  const assumptions = [
    {
      icon: TrendingDown,
      label: 'Dégradation panneaux',
      value: '0.7% / an',
      description: 'Perte de rendement annuelle des modules PV (standard industriel)',
    },
    {
      icon: Clock,
      label: 'Durée de vie projet',
      value: '25 ans',
      description: 'Horizon de calcul pour la VAN et les économies cumulées',
    },
    {
      icon: Calculator,
      label: 'Taux d\'actualisation',
      value: '8%',
      description: 'Utilisé pour calculer la Valeur Actuelle Nette (VAN)',
    },
    {
      icon: Zap,
      label: 'Intensité carbone STEG',
      value: '0.48 kgCO₂/kWh',
      description: 'Facteur d\'émission du réseau électrique tunisien',
    },
  ];

  const formulas = [
    {
      name: 'LCOE (Levelized Cost of Energy)',
      formula: 'LCOE = Σ(CAPEX + OPEX) / Σ(Énergie produite)',
      unit: 'TND/MWh',
    },
    {
      name: 'VAN (Valeur Actuelle Nette)',
      formula: 'VAN = Σ(Flux / (1 + r)^n) - Investissement',
      unit: 'TND',
    },
    {
      name: 'Économie CBAM',
      formula: 'CBAM = CO₂ évité (t) × Prix carbone UE (€/t)',
      unit: '€/an',
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card/50 border-border/50">
        <CollapsibleTrigger asChild>
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Info className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-foreground">Notes de Calcul</h3>
                <p className="text-xs text-muted-foreground">Hypothèses et formules utilisées</p>
              </div>
            </div>
            <ChevronDown 
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 px-5">
            <div className="border-t border-border/50 pt-4 space-y-6">
              {/* Hypothèses */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Hypothèses par défaut
                </h4>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {assumptions.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-card rounded-lg p-3 border border-border/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formules */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Formules de calcul
                </h4>
                <div className="space-y-2">
                  {formulas.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border border-border/30"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <code className="text-xs bg-muted text-primary px-2 py-1 rounded font-mono">
                          {item.formula}
                        </code>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3 border border-border/20">
                <strong className="text-foreground">Sources :</strong> Tarifs STEG 2024, Commission Européenne (CBAM), 
                IEA Solar PV Tracking Report, ANME Tunisie. Les projections tiennent compte de l'escalade 
                des prix du carbone UE de 65€ (2026) à 130€/tCO₂ (2036).
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

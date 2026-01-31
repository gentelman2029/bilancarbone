import { TrendingDown, TrendingUp, Coins, Gauge, Leaf, Wrench, Calculator, BadgeDollarSign, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DigitalTwinMetrics } from "@/hooks/useDigitalTwin";

interface KPICardsProps {
  metrics: DigitalTwinMetrics;
  isLoading?: boolean;
}

// Static color mapping to prevent Tailwind purge
const colorClasses = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    hoverBorder: "hover:border-emerald-500/50",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    hoverBorder: "hover:border-amber-500/50",
  },
  slate: {
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    hoverBorder: "hover:border-slate-500/50",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    hoverBorder: "hover:border-purple-500/50",
  },
  indigo: {
    text: "text-indigo-400",
    bg: "bg-indigo-500/10",
    hoverBorder: "hover:border-indigo-500/50",
  },
} as const;

type ColorKey = keyof typeof colorClasses;

interface FormulaTooltipContent {
  title: string;
  definition: string;
  formula?: string;
  interpretation: string;
}

export const KPICards = ({ metrics, isLoading = false }: KPICardsProps) => {
  const { 
    payback, cbamSavingsYear1, cbamSavingsLifetime, lcoe, lcoeWithoutOM, 
    co2Avoided, annualOMCost, fiscalBenefits, savingsRange, van 
  } = metrics;

  const cards: {
    label: string;
    value: string;
    unit: string;
    subtext: string;
    trend: "positive" | "neutral";
    icon: typeof TrendingDown;
    color: ColorKey;
    formulaInfo: FormulaTooltipContent;
  }[] = [
    {
      label: "TRI / Payback",
      value: payback === Infinity ? "∞" : `${payback.toFixed(1)}`,
      unit: "Ans",
      subtext: payback < 5 ? "Excellent ROI" : payback < 7 ? "ROI standard" : "ROI long terme",
      trend: payback < 5 ? "positive" : "neutral",
      icon: TrendingDown,
      color: "emerald",
      formulaInfo: {
        title: "Temps de Retour sur Investissement",
        definition: "Le TRI indique le nombre d'années nécessaires pour que les économies cumulées couvrent l'investissement initial.",
        formula: "TRI = CAPEX ÷ Économies annuelles nettes",
        interpretation: `Avec un O&M de ${Math.round(annualOMCost).toLocaleString('fr-FR')} TND/an, votre investissement sera rentabilisé en ${payback.toFixed(1)} ans.`
      }
    },
    {
      label: "Économie CBAM",
      value: Math.round(cbamSavingsYear1).toLocaleString('fr-FR'),
      unit: "€/an",
      subtext: `${Math.round(cbamSavingsLifetime / 1000)}k€ sur 25 ans`,
      trend: "positive",
      icon: Coins,
      color: "emerald",
      formulaInfo: {
        title: "Économie Taxe Carbone UE (CBAM)",
        definition: "Le CBAM (Carbon Border Adjustment Mechanism) taxe les importations selon leur empreinte carbone. Le solaire évite ces coûts.",
        formula: "CBAM = CO₂ évité (t) × Prix carbone UE (€/t)",
        interpretation: `Prix CBAM évolutif : 65€ (2026) → 130€/tCO₂ (2036). Économie totale sur 25 ans : ${Math.round(cbamSavingsLifetime).toLocaleString('fr-FR')} €.`
      }
    },
    {
      label: "LCOE",
      value: lcoe.toFixed(0),
      unit: "TND/MWh",
      subtext: `${lcoeWithoutOM.toFixed(0)} sans O&M`,
      trend: lcoe < 150 ? "positive" : "neutral",
      icon: Gauge,
      color: lcoe < 150 ? "emerald" : "amber",
      formulaInfo: {
        title: "Coût Actualisé de l'Énergie (LCOE)",
        definition: "Le LCOE représente le coût total de production d'un MWh d'électricité sur la durée de vie du projet.",
        formula: "LCOE = Σ(CAPEX + OPEX) ÷ Σ(Énergie produite)",
        interpretation: `LCOE avec O&M : ${lcoe.toFixed(1)} TND/MWh. Sans O&M : ${lcoeWithoutOM.toFixed(1)} TND/MWh. Inclut dégradation panneau 0.7%/an.`
      }
    },
    {
      label: "CO₂ Évité",
      value: co2Avoided.toFixed(1),
      unit: "t/an",
      subtext: `${(co2Avoided * 25 * 0.88).toFixed(0)}t sur 25 ans`,
      trend: "positive",
      icon: Leaf,
      color: "emerald",
      formulaInfo: {
        title: "Émissions de CO₂ Évitées",
        definition: "Quantité de CO₂ non émise grâce à la substitution de l'électricité STEG par le solaire.",
        formula: "CO₂ évité = Production (MWh) × Intensité carbone STEG (kgCO₂/kWh)",
        interpretation: `Intensité carbone STEG : 0.48 kgCO₂/kWh. Impact cumulé sur 25 ans avec dégradation : ${(co2Avoided * 25 * 0.88).toFixed(0)} tonnes.`
      }
    },
    {
      label: "Coût O&M",
      value: Math.round(annualOMCost / 1000).toLocaleString('fr-FR'),
      unit: "kTND/an",
      subtext: "1.5% du CAPEX",
      trend: "neutral",
      icon: Wrench,
      color: "slate",
      formulaInfo: {
        title: "Coûts d'Opération et Maintenance",
        definition: "Budget annuel pour l'entretien de l'installation : nettoyage, monitoring, remplacement onduleurs.",
        formula: "O&M = CAPEX × 1.5%",
        interpretation: `Maintenance annuelle : ${Math.round(annualOMCost).toLocaleString('fr-FR')} TND. Standard industriel pour installations > 100 kWc.`
      }
    },
    {
      label: "Avantage Fiscal",
      value: Math.round(fiscalBenefits.taxSavings / 1000).toLocaleString('fr-FR'),
      unit: "kTND/an",
      subtext: `sur ${fiscalBenefits.depreciationYears} ans`,
      trend: "positive",
      icon: Calculator,
      color: "purple",
      formulaInfo: {
        title: "Avantage Fiscal (Amortissement Accéléré)",
        definition: "Économie d'impôt grâce à l'amortissement accéléré des équipements EnR (Code des Investissements Tunisien).",
        formula: "Économie IS = (CAPEX ÷ Durée amort.) × Taux IS",
        interpretation: `Amortissement sur ${fiscalBenefits.depreciationYears} ans. Économie d'impôt annuelle : ${Math.round(fiscalBenefits.taxSavings).toLocaleString('fr-FR')} TND (IS 15%).`
      }
    },
    {
      label: "VAN (25 ans)",
      value: Math.round(van / 1000).toLocaleString('fr-FR'),
      unit: "kTND",
      subtext: van > 0 ? "Projet rentable" : "Projet non rentable",
      trend: van > 0 ? "positive" : "neutral",
      icon: BadgeDollarSign,
      color: "indigo",
      formulaInfo: {
        title: "Valeur Actuelle Nette (VAN)",
        definition: "La VAN mesure la richesse réelle créée par le projet, en actualisant tous les flux futurs à leur valeur présente.",
        formula: "VAN = Σ(Flux_n ÷ (1 + r)^n) - Investissement",
        interpretation: `Taux d'actualisation : 8%. Une VAN positive (${Math.round(van / 1000).toLocaleString('fr-FR')} kTND) signifie que l'investissement crée de la valeur après déduction de l'inflation et du coût du capital.`
      }
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4" data-tour="kpi-cards">
        {cards.map((card, idx) => {
          const colors = colorClasses[card.color];
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <Card 
                  className={`bg-slate-800/50 border-slate-700 ${colors.hoverBorder} transition-colors cursor-help ${isLoading ? 'animate-pulse' : ''}`}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className={`flex items-start justify-between ${isLoading ? 'opacity-50' : ''}`}>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold ${colors.text}`}>
                          {card.value} <span className="text-base font-normal">{card.unit}</span>
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {card.trend === "positive" && (
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          <span className={`text-xs ${card.trend === "positive" ? "text-emerald-500" : "text-slate-500"}`}>
                            {card.subtext}
                          </span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <card.icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="max-w-sm bg-slate-900 border-slate-700 text-slate-100 shadow-xl p-0 z-[100]"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-400">{card.formulaInfo.title}</p>
                      <p className="text-sm text-slate-300 mt-1">{card.formulaInfo.definition}</p>
                    </div>
                  </div>
                  {card.formulaInfo.formula && (
                    <div className="bg-slate-800/80 rounded-lg px-3 py-2 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Formule :</p>
                      <code className="text-sm font-mono text-amber-400">{card.formulaInfo.formula}</code>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 border-t border-slate-700/50 pt-2">
                    {card.formulaInfo.interpretation}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Savings Range Indicator */}
      <Card className="bg-slate-800/30 border-slate-700/50 mt-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-slate-500">Pessimiste</p>
              <p className="text-red-400 font-semibold">{Math.round(savingsRange.pessimistic / 1000)} kTND</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-red-500/30 via-emerald-500/50 to-emerald-500/30 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-slate-500">Attendu</p>
              <p className="text-emerald-400 font-semibold">{Math.round(savingsRange.expected / 1000)} kTND</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-emerald-500/50 via-emerald-500/30 to-emerald-500/20 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-slate-500">Optimiste</p>
              <p className="text-emerald-300 font-semibold">{Math.round(savingsRange.optimistic / 1000)} kTND</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Économies annuelles selon variabilité météo</p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

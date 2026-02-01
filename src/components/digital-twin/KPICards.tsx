import { TrendingDown, TrendingUp, Coins, Gauge, Leaf, Wrench, Calculator, BadgeDollarSign, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FormulaModal } from "./FormulaModal";
import type { DigitalTwinMetrics } from "@/hooks/useDigitalTwin";

// Format number with space separator (French style)
const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString('fr-FR').replace(/,/g, ' ');
};

interface KPICardsProps {
  metrics: DigitalTwinMetrics;
  isLoading?: boolean;
}

// Static color mapping - using specific colors for financial indicators
const colorClasses = {
  emerald: {
    text: "text-emerald-600",
    bg: "bg-emerald-500/10",
    hoverBorder: "hover:border-emerald-500/50",
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-500/10",
    hoverBorder: "hover:border-amber-500/50",
  },
  muted: {
    text: "text-gray-600",
    bg: "bg-gray-100",
    hoverBorder: "hover:border-gray-400/50",
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-500/10",
    hoverBorder: "hover:border-purple-500/50",
  },
  indigo: {
    text: "text-indigo-600",
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
    co2Avoided, annualOMCost, fiscalBenefits, savingsRange, van,
    effectiveSolar, annualSavings, investment
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
    formulaModal?: {
      title: string;
      formula: string;
      description: string;
      variables: { name: string; value: string; unit: string; description?: string }[];
      result: string;
      resultUnit: string;
      sources?: string[];
    };
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
      },
      formulaModal: {
        title: "Temps de Retour sur Investissement (TRI)",
        formula: "TRI = Investissement ÷ (Économies - O&M)",
        description: "Le TRI mesure le temps nécessaire pour récupérer l'investissement initial grâce aux économies générées.",
        variables: [
          { name: "Investissement", value: formatNumber(investment), unit: "TND", description: "Investissement Initial (CAPEX)" },
          { name: "Économies/an", value: formatNumber(annualSavings), unit: "TND", description: "Économies facture STEG" },
          { name: "O&M/an", value: formatNumber(annualOMCost), unit: "TND", description: "OPEX (Maintenance annuelle)" },
        ],
        result: payback === Infinity ? "∞" : payback.toFixed(1),
        resultUnit: "années",
        sources: ["Méthodologie IEA PVPS", "Standards ADEME"]
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
      },
      formulaModal: {
        title: "Économie Taxe Carbone CBAM",
        formula: "Économie = Production × FE_STEG × Prix_CBAM",
        description: "Le mécanisme CBAM taxe les émissions CO₂ aux frontières UE. Produire localement en solaire évite cette taxe sur vos exportations.",
        variables: [
          { name: "Production", value: formatNumber(effectiveSolar * 1600 / 1000), unit: "MWh/an", description: "Énergie solaire produite" },
          { name: "FE_STEG", value: "0.48", unit: "tCO₂/MWh", description: "Facteur émission réseau tunisien" },
          { name: "Prix_CBAM", value: "65", unit: "€/tCO₂", description: "Prix carbone UE 2026" },
        ],
        result: formatNumber(cbamSavingsYear1),
        resultUnit: "€/an",
        sources: ["Règlement UE 2023/956 (CBAM)", "Commission Européenne"]
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
      },
      formulaModal: {
        title: "Coût Actualisé de l'Énergie (LCOE)",
        formula: "LCOE = (CAPEX + Σ OPEX) ÷ Σ Production",
        description: "Le LCOE permet de comparer le coût de différentes sources d'énergie sur leur durée de vie complète.",
        variables: [
          { name: "CAPEX", value: formatNumber(investment), unit: "TND", description: "Investissement Initial (CAPEX)" },
          { name: "OPEX total", value: formatNumber(annualOMCost * 25), unit: "TND", description: "OPEX (Maintenance) sur 25 ans" },
          { name: "Production", value: formatNumber(effectiveSolar * 1600 * 25 * 0.88 / 1000), unit: "MWh", description: "Total sur 25 ans" },
        ],
        result: lcoe.toFixed(0),
        resultUnit: "TND/MWh",
        sources: ["IEA World Energy Outlook", "IRENA Renewable Cost Database"]
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
      label: "OPEX (Maintenance)",
      value: formatNumber(annualOMCost / 1000),
      unit: "kTND/an",
      subtext: "Frais annuels d'entretien",
      trend: "neutral",
      icon: Wrench,
      color: "muted",
      formulaInfo: {
        title: "OPEX (Maintenance)",
        definition: "Budget annuel pour l'entretien de l'installation : nettoyage, monitoring, remplacement onduleurs.",
        formula: "OPEX = CAPEX × Taux O&M (%)",
        interpretation: `Maintenance annuelle : ${formatNumber(annualOMCost)} TND. Calculé à 1.5% du CAPEX brut.`
      }
    },
    {
      label: "Avantage Fiscal",
      value: formatNumber(fiscalBenefits.taxSavings / 1000),
      unit: "kTND/an",
      subtext: `sur ${fiscalBenefits.depreciationYears} ans`,
      trend: "positive",
      icon: Calculator,
      color: "purple",
      formulaInfo: {
        title: "Avantage Fiscal (Amortissement Accéléré)",
        definition: "Économie d'impôt grâce à l'amortissement accéléré des équipements EnR (Code des Investissements Tunisien).",
        formula: "Économie IS = (CAPEX ÷ Durée amort.) × Taux IS",
        interpretation: `Amortissement sur ${fiscalBenefits.depreciationYears} ans. Économie d'impôt annuelle : ${formatNumber(fiscalBenefits.taxSavings)} TND.`
      }
    },
    {
      label: "VAN (25 ans)",
      value: formatNumber(van / 1000),
      unit: "kTND",
      subtext: van > 0 ? "Projet rentable" : "Projet non rentable",
      trend: van > 0 ? "positive" : "neutral",
      icon: BadgeDollarSign,
      color: "indigo",
      formulaInfo: {
        title: "Valeur Actuelle Nette (VAN)",
        definition: "La VAN mesure la richesse réelle créée par le projet, en actualisant tous les flux futurs à leur valeur présente.",
        formula: "VAN = Σ(Flux_n ÷ (1 + r)^n) - Investissement",
        interpretation: `Une VAN positive (${formatNumber(van / 1000)} kTND) signifie que l'investissement crée de la valeur après déduction de l'inflation et du coût du capital.`
      },
      formulaModal: {
        title: "Valeur Actuelle Nette (VAN)",
        formula: "VAN = Σ(Flux_t ÷ (1+r)^t) - I₀",
        description: "La VAN représente la création de valeur nette du projet. Une VAN positive signifie que le projet génère plus que le coût du capital.",
        variables: [
          { name: "I₀", value: formatNumber(investment), unit: "TND", description: "Investissement Initial (CAPEX)" },
          { name: "Flux annuel", value: formatNumber(annualSavings - annualOMCost), unit: "TND", description: "Économies nettes moyennes" },
          { name: "r", value: "8", unit: "%", description: "Taux d'actualisation (WACC)" },
          { name: "t", value: "25", unit: "ans", description: "Durée du projet" },
        ],
        result: formatNumber(van / 1000),
        resultUnit: "kTND",
        sources: ["Finance d'entreprise", "Méthodologie ADEME"]
      }
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4" data-tour="kpi-cards">
        {cards.map((card, idx) => {
          const colors = colorClasses[card.color];
          return (
            <Card 
              key={idx}
              className={`bg-white border-gray-200 ${colors.hoverBorder} transition-colors ${isLoading ? 'animate-pulse' : ''}`}
            >
              <CardContent className="pt-5 pb-4">
                <div className={`flex items-start justify-between ${isLoading ? 'opacity-50' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-gray-600">{card.label}</p>
                      
                      {/* Formula Modal Button */}
                      {card.formulaModal && (
                        <FormulaModal {...card.formulaModal} />
                      )}
                      
                      {/* Info Tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="bottom" 
                          className="max-w-sm bg-white border-gray-200 text-gray-700 shadow-xl p-0 z-[100]"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-indigo-600">{card.formulaInfo.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{card.formulaInfo.definition}</p>
                              </div>
                            </div>
                            {card.formulaInfo.formula && (
                              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Formule :</p>
                                <code className="text-sm font-mono text-amber-600">{card.formulaInfo.formula}</code>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                              {card.formulaInfo.interpretation}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {card.value} <span className="text-base font-normal">{card.unit}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {card.trend === "positive" && (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      <span className={`text-xs ${card.trend === "positive" ? "text-emerald-600" : "text-gray-500"}`}>
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
          );
        })}
      </div>

      {/* Savings Range Indicator */}
      <Card className="bg-white/50 border-gray-200/50 mt-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-gray-500">Pessimiste</p>
              <p className="text-red-600 font-semibold">{Math.round(savingsRange.pessimistic / 1000)} kTND</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-red-500/30 via-emerald-500/50 to-emerald-500/30 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-gray-500">Attendu</p>
              <p className="text-emerald-600 font-semibold">{Math.round(savingsRange.expected / 1000)} kTND</p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gradient-to-r from-emerald-500/50 via-emerald-500/30 to-emerald-500/20 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-gray-500">Optimiste</p>
              <p className="text-emerald-500 font-semibold">{Math.round(savingsRange.optimistic / 1000)} kTND</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">Économies annuelles selon variabilité météo</p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
import { TrendingDown, TrendingUp, Coins, Gauge, Leaf, Wrench, Calculator, BadgeDollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DigitalTwinMetrics } from "@/hooks/useDigitalTwin";

interface KPICardsProps {
  metrics: DigitalTwinMetrics;
  isLoading?: boolean;
}

export const KPICards = ({ metrics, isLoading = false }: KPICardsProps) => {
  const { 
    payback, cbamSavingsYear1, cbamSavingsLifetime, lcoe, lcoeWithoutOM, 
    co2Avoided, annualOMCost, fiscalBenefits, savingsRange, van 
  } = metrics;

  const cards = [
    {
      label: "TRI / Payback",
      value: payback === Infinity ? "∞" : `${payback.toFixed(1)}`,
      unit: "Ans",
      subtext: payback < 5 ? "Excellent ROI" : payback < 7 ? "ROI standard" : "ROI long terme",
      trend: payback < 5 ? "positive" : "neutral",
      icon: TrendingDown,
      color: "emerald",
      tooltip: `Temps de retour sur investissement incluant O&M (${Math.round(annualOMCost).toLocaleString('fr-FR')} TND/an)`
    },
    {
      label: "Économie CBAM",
      value: Math.round(cbamSavingsYear1).toLocaleString('fr-FR'),
      unit: "€/an",
      subtext: `${Math.round(cbamSavingsLifetime / 1000)}k€ sur 25 ans`,
      trend: "positive",
      icon: Coins,
      color: "emerald",
      tooltip: `Prix CBAM évolutif: 65€ (2026) → 130€/tCO2 (2036). Économie totale: ${Math.round(cbamSavingsLifetime).toLocaleString('fr-FR')} €`
    },
    {
      label: "LCOE",
      value: lcoe.toFixed(0),
      unit: "TND/MWh",
      subtext: `${lcoeWithoutOM.toFixed(0)} sans O&M`,
      trend: lcoe < 150 ? "positive" : "neutral",
      icon: Gauge,
      color: lcoe < 150 ? "emerald" : "amber",
      tooltip: `LCOE avec O&M: ${lcoe.toFixed(1)} TND/MWh. Sans O&M: ${lcoeWithoutOM.toFixed(1)} TND/MWh. Inclut dégradation panneau 0.7%/an.`
    },
    {
      label: "CO₂ Évité",
      value: co2Avoided.toFixed(1),
      unit: "t/an",
      subtext: `${(co2Avoided * 25 * 0.88).toFixed(0)}t sur 25 ans`,
      trend: "positive",
      icon: Leaf,
      color: "emerald",
      tooltip: `Intensité carbone STEG: 0.48 kgCO2/kWh. Impact cumulé sur 25 ans avec dégradation.`
    },
    {
      label: "Coût O&M",
      value: Math.round(annualOMCost / 1000).toLocaleString('fr-FR'),
      unit: "kTND/an",
      subtext: "1.5% du CAPEX",
      trend: "neutral",
      icon: Wrench,
      color: "slate",
      tooltip: `Maintenance annuelle: ${Math.round(annualOMCost).toLocaleString('fr-FR')} TND. Inclut: nettoyage, monitoring, remplacement onduleurs.`
    },
    {
      label: "Avantage Fiscal",
      value: Math.round(fiscalBenefits.taxSavings / 1000).toLocaleString('fr-FR'),
      unit: "kTND/an",
      subtext: `sur ${fiscalBenefits.depreciationYears} ans`,
      trend: "positive",
      icon: Calculator,
      color: "purple",
      tooltip: `Amortissement accéléré sur ${fiscalBenefits.depreciationYears} ans. Économie d'impôt annuelle: ${Math.round(fiscalBenefits.taxSavings).toLocaleString('fr-FR')} TND (IS 15%).`
    },
    {
      label: "VAN (25 ans)",
      value: Math.round(van / 1000).toLocaleString('fr-FR'),
      unit: "kTND",
      subtext: van > 0 ? "Projet rentable" : "Projet non rentable",
      trend: van > 0 ? "positive" : "neutral",
      icon: BadgeDollarSign,
      color: "indigo",
      tooltip: `Valeur Actuelle Nette sur 25 ans avec un taux d'actualisation de 8%. La VAN représente la richesse réelle créée aujourd'hui, déduite de l'inflation et du coût du capital. Une VAN positive signifie que l'investissement crée de la valeur.`
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Card 
                className={`bg-slate-800/50 border-slate-700 hover:border-${card.color}-500/30 transition-colors cursor-help ${isLoading ? 'animate-pulse' : ''}`}
              >
                <CardContent className="pt-5 pb-4">
                  <div className={`flex items-start justify-between ${isLoading ? 'opacity-50' : ''}`}>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                      <p className={`text-2xl font-bold text-${card.color}-400`}>
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
                    <div className={`p-2 rounded-lg bg-${card.color}-500/10`}>
                      <card.icon className={`h-5 w-5 text-${card.color}-400`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs bg-slate-900 border-slate-700">
              <p className="text-sm">{card.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
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

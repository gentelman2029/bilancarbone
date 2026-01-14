import { TrendingDown, Coins, Gauge, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DigitalTwinMetrics } from "@/hooks/useDigitalTwin";

interface KPICardsProps {
  metrics: DigitalTwinMetrics;
  isLoading?: boolean;
}

export const KPICards = ({ metrics, isLoading = false }: KPICardsProps) => {
  const { payback, cbamSavings, lcoe, co2Avoided } = metrics;

  const cards = [
    {
      label: "TRI / Payback",
      value: payback === Infinity ? "∞" : `${payback.toFixed(1)}`,
      unit: "Ans",
      subtext: payback < 5 ? "-20% vs Standard" : payback < 7 ? "Performance moyenne" : "ROI long terme",
      trend: payback < 5 ? "positive" : "neutral",
      icon: TrendingDown,
      color: "emerald"
    },
    {
      label: "Économie CBAM",
      value: Math.round(cbamSavings).toLocaleString('fr-FR'),
      unit: "€/an",
      subtext: "Taxe carbone évitée",
      trend: "positive",
      icon: Coins,
      color: "emerald"
    },
    {
      label: "LCOE",
      value: lcoe.toFixed(3),
      unit: "TND/kWh",
      subtext: "Coût actualisé énergie",
      trend: "neutral",
      icon: Gauge,
      color: "amber"
    },
    {
      label: "CO₂ Évité",
      value: co2Avoided.toFixed(1),
      unit: "t/an",
      subtext: "Impact environnemental",
      trend: "positive",
      icon: Leaf,
      color: "emerald"
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card 
          key={idx}
          className={`bg-slate-800/50 border-slate-700 hover:border-${card.color}-500/30 transition-colors ${isLoading ? 'animate-pulse' : ''}`}
        >
          <CardContent className="pt-6">
            <div className={`flex items-start justify-between ${isLoading ? 'opacity-50' : ''}`}>
              <div>
                <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                <p className={`text-2xl xl:text-3xl font-bold text-${card.color}-400`}>
                  {card.value} <span className="text-lg">{card.unit}</span>
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trend === "positive" && (
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
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
      ))}
    </div>
  );
};

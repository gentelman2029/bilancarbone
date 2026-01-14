import { AlertTriangle, Sun, Zap, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DigitalTwinMetrics } from "@/hooks/useDigitalTwin";

interface AdditionalInfoProps {
  metrics: DigitalTwinMetrics;
}

export const AdditionalInfo = ({ metrics }: AdditionalInfoProps) => {
  const infoCards = [
    {
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      title: "Risque Réglementaire",
      description: "CBAM Phase 3 applicable dès 2026"
    },
    {
      icon: Sun,
      iconColor: "text-amber-400",
      title: "Irradiation Moyenne",
      description: "1 850 kWh/m²/an (Tunisie)"
    },
    {
      icon: Zap,
      iconColor: "text-blue-400",
      title: "Tarif STEG Pointe",
      description: "0.285 TND/kWh (18h-22h)"
    },
    {
      icon: Timer,
      iconColor: "text-emerald-400",
      title: "Durée de Vie",
      description: "25 ans (panneaux), 10 ans (batteries)"
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {infoCards.map((card, idx) => (
        <Card key={idx} className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              <div>
                <p className="text-sm font-medium text-slate-200">{card.title}</p>
                <p className="text-xs text-slate-500">{card.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

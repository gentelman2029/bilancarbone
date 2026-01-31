import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SensitivityInsightProps {
  previousMetrics: {
    payback: number;
    lcoe: number;
    van: number;
  } | null;
  currentMetrics: {
    payback: number;
    lcoe: number;
    van: number;
    annualSavings: number;
  };
  changedParameter: string | null;
}

export const SensitivityInsight = ({
  previousMetrics,
  currentMetrics,
  changedParameter,
}: SensitivityInsightProps) => {
  if (!previousMetrics || !changedParameter) return null;

  const paybackChange = currentMetrics.payback - previousMetrics.payback;
  const lcoeChange = currentMetrics.lcoe - previousMetrics.lcoe;
  const vanChange = currentMetrics.van - previousMetrics.van;

  // Generate contextual insight based on what changed
  const generateInsight = (): { message: string; type: 'positive' | 'negative' | 'neutral' } => {
    const absPaybackChange = Math.abs(paybackChange);
    const absLcoeChange = Math.abs(lcoeChange);
    const absVanChange = Math.abs(vanChange);

    switch (changedParameter) {
      case 'solarPower':
        if (lcoeChange < -5 && paybackChange > 0.3) {
          return {
            message: `Augmenter la puissance a réduit le LCOE de ${absLcoeChange.toFixed(0)} TND/MWh grâce aux économies d'échelle, mais a légèrement allongé le TRI (+${absPaybackChange.toFixed(1)} ans) dû à l'investissement supplémentaire.`,
            type: 'neutral'
          };
        } else if (lcoeChange < 0) {
          return {
            message: `La nouvelle puissance améliore le LCOE de ${absLcoeChange.toFixed(0)} TND/MWh. Les économies d'échelle compensent l'investissement.`,
            type: 'positive'
          };
        }
        break;

      case 'batteryCapacity':
        if (vanChange > 0) {
          return {
            message: `L'ajout de stockage augmente la VAN de ${(absVanChange / 1000).toFixed(0)} kTND grâce au décalage de consommation vers les heures creuses.`,
            type: 'positive'
          };
        } else {
          return {
            message: `Le stockage additionnel n'est pas optimal dans cette configuration. Envisagez un ratio batterie/puissance de 20-30%.`,
            type: 'negative'
          };
        }

      case 'discountRate':
        if (vanChange < 0) {
          return {
            message: `Un taux d'actualisation plus élevé réduit la VAN de ${(absVanChange / 1000).toFixed(0)} kTND. Les flux futurs ont moins de valeur aujourd'hui.`,
            type: 'neutral'
          };
        }
        break;

      case 'omPercentage':
        return {
          message: `Le coût O&M impacte directement le LCOE (${lcoeChange > 0 ? '+' : ''}${lcoeChange.toFixed(0)} TND/MWh) et le TRI (${paybackChange > 0 ? '+' : ''}${paybackChange.toFixed(1)} ans).`,
          type: lcoeChange > 0 ? 'negative' : 'positive'
        };

      case 'corporateTaxRate':
        return {
          message: `La fiscalité modifie l'avantage de l'amortissement accéléré. Impact VAN : ${vanChange > 0 ? '+' : ''}${(vanChange / 1000).toFixed(0)} kTND.`,
          type: vanChange >= 0 ? 'positive' : 'negative'
        };

      case 'weatherScenario':
        return {
          message: `Le passage en P90 (conservateur) réduit le productible de 5%, sécurisant les projections pour le financement bancaire.`,
          type: 'neutral'
        };
    }

    // Default insight
    if (vanChange > 10000) {
      return {
        message: `Ce changement améliore significativement la rentabilité : VAN +${(vanChange / 1000).toFixed(0)} kTND.`,
        type: 'positive'
      };
    } else if (vanChange < -10000) {
      return {
        message: `Ce paramètre réduit la rentabilité : VAN ${(vanChange / 1000).toFixed(0)} kTND. Vérifiez l'impact sur vos objectifs.`,
        type: 'negative'
      };
    }

    return {
      message: `Modification mineure des indicateurs. TRI : ${paybackChange > 0 ? '+' : ''}${paybackChange.toFixed(1)} ans, LCOE : ${lcoeChange > 0 ? '+' : ''}${lcoeChange.toFixed(0)} TND/MWh.`,
      type: 'neutral'
    };
  };

  const insight = generateInsight();

  const getAlertStyle = () => {
    switch (insight.type) {
      case 'positive':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'negative':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (insight.type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-amber-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Alert className={`${getAlertStyle()} transition-all duration-300 animate-in fade-in slide-in-from-top-2`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <AlertDescription className="text-sm">
          {insight.message}
        </AlertDescription>
      </div>
    </Alert>
  );
};

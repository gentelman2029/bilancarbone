import { TrendingUp, TrendingDown, Lightbulb, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

  // Helper to format delta with color
  const formatDelta = (delta: number, metric: 'payback' | 'lcoe' | 'van') => {
    const isPositiveGood = metric === 'van';
    const isImprovement = isPositiveGood ? delta > 0 : delta < 0;
    const colorClass = isImprovement ? 'text-emerald-600' : delta === 0 ? 'text-gray-500' : 'text-red-600';
    const prefix = delta > 0 ? '+' : '';
    
    if (metric === 'van') {
      return <span className={`font-medium ${colorClass}`}>{prefix}{(delta / 1000).toFixed(1)} kTND</span>;
    } else if (metric === 'payback') {
      return <span className={`font-medium ${colorClass}`}>{prefix}{delta.toFixed(2)} ans</span>;
    } else {
      return <span className={`font-medium ${colorClass}`}>{prefix}{delta.toFixed(0)} TND/MWh</span>;
    }
  };

  // Comparison data for the table
  const comparisonData = [
    {
      metric: 'Payback (TRI)',
      before: `${previousMetrics.payback.toFixed(2)} ans`,
      after: `${currentMetrics.payback.toFixed(2)} ans`,
      delta: paybackChange,
      type: 'payback' as const
    },
    {
      metric: 'LCOE',
      before: `${previousMetrics.lcoe.toFixed(0)} TND/MWh`,
      after: `${currentMetrics.lcoe.toFixed(0)} TND/MWh`,
      delta: lcoeChange,
      type: 'lcoe' as const
    },
    {
      metric: 'VAN (25 ans)',
      before: `${(previousMetrics.van / 1000).toFixed(1)} kTND`,
      after: `${(currentMetrics.van / 1000).toFixed(1)} kTND`,
      delta: vanChange,
      type: 'van' as const
    }
  ];

  return (
    <Alert className={`${getAlertStyle()} transition-all duration-300 animate-in fade-in slide-in-from-top-2`}>
      <div className="space-y-4">
        {/* Message explicatif */}
        <div className="flex items-start gap-3">
          {getIcon()}
          <AlertDescription className="text-sm">
            {insight.message}
          </AlertDescription>
        </div>

        {/* Tableau de comparaison */}
        <div className="bg-white/60 rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold text-gray-700 py-2">Métrique</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 py-2 text-right">Avant</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 py-2 text-center w-8">
                  <ArrowRight className="h-3 w-3 mx-auto" />
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 py-2 text-right">Après</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 py-2 text-right">Δ Variation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.metric} className="hover:bg-gray-50/50">
                  <TableCell className="text-xs font-medium text-gray-700 py-2">{row.metric}</TableCell>
                  <TableCell className="text-xs text-gray-500 py-2 text-right">{row.before}</TableCell>
                  <TableCell className="py-2 text-center">
                    <ArrowRight className="h-3 w-3 text-gray-400 mx-auto" />
                  </TableCell>
                  <TableCell className="text-xs text-gray-900 py-2 text-right font-medium">{row.after}</TableCell>
                  <TableCell className="text-xs py-2 text-right">{formatDelta(row.delta, row.type)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Alert>
  );
};

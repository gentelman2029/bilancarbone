import { Zap, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIRecommendationProps {
  recommendation: {
    type: 'optimization' | 'warning' | 'info';
    message: string;
  };
}

export const AIRecommendation = ({ recommendation }: AIRecommendationProps) => {
  const config = {
    optimization: {
      icon: Zap,
      title: "Optimisation Détectée",
      borderClass: "border-emerald-500/30 border-l-emerald-500",
      iconClass: "text-emerald-400",
      titleClass: "text-emerald-400"
    },
    warning: {
      icon: AlertTriangle,
      title: "Attention Recommandée",
      borderClass: "border-amber-500/30 border-l-amber-500",
      iconClass: "text-amber-400",
      titleClass: "text-amber-400"
    },
    info: {
      icon: Info,
      title: "Information CBAM",
      borderClass: "border-blue-500/30 border-l-blue-500",
      iconClass: "text-blue-400",
      titleClass: "text-blue-400"
    }
  };

  const { icon: Icon, title, borderClass, iconClass, titleClass } = config[recommendation.type];

  // Parse the message to highlight numbers
  const highlightNumbers = (text: string) => {
    return text.split(/(\d[\d\s,.]*(?:kWh|kWc|%|€|TND|années?)?)/).map((part, idx) => {
      if (/\d/.test(part)) {
        return (
          <strong key={idx} className={titleClass}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <Alert className={`bg-gradient-to-r from-slate-800/80 to-slate-800/50 ${borderClass} border-l-4`}>
      <Icon className={`h-5 w-5 ${iconClass}`} />
      <AlertTitle className={`${titleClass} font-semibold`}>{title}</AlertTitle>
      <AlertDescription className="text-slate-300 mt-2">
        {highlightNumbers(recommendation.message)}
      </AlertDescription>
    </Alert>
  );
};

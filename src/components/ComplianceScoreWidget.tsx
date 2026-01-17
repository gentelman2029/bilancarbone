import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { useComplianceScore } from "@/hooks/useComplianceScore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const ComplianceScoreWidget = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const compliance = useComplianceScore();

  // Déterminer la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getIndicatorColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  // Calculer le changement par rapport à une valeur fictive précédente
  // (Dans une vraie application, on stockerait l'historique)
  const previousScore = Math.max(0, compliance.score - 5);
  const changePercent = compliance.score > 0 ? ((compliance.score - previousScore) / Math.max(1, previousScore)) * 100 : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${getIndicatorColor(compliance.score)}`}></div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("dashboard.regulatory_compliance")}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Score basé sur la complétude des 9 catégories obligatoires du bilan carbone CSRD/BEGES</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(compliance.score)}`}>
                    {compliance.score}% <span className="text-lg text-foreground">{t("dashboard.complete_compliance")}</span>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(compliance.score)}`}
                      style={{ width: `${compliance.score}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{compliance.filledCount}/{compliance.totalCount} catégories renseignées</span>
                    {compliance.missingCategories.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {compliance.missingCategories.length} manquante(s)
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </HoverCardTrigger>
          
          <HoverCardContent className="w-96" side="bottom" align="start">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold">Détail de la conformité CSRD/BEGES</h4>
              </div>
              
              {/* Catégories manquantes */}
              {compliance.missingCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Catégories non renseignées :
                  </p>
                  <ul className="space-y-1 pl-5">
                    {compliance.missingCategories.map((cat) => (
                      <li key={cat.id} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">
                          {cat.scope === 'scope1' ? 'S1' : cat.scope === 'scope2' ? 'S2' : 'S3'}
                        </span>
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Catégories renseignées */}
              {compliance.filledCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Catégories renseignées :
                  </p>
                  <ul className="space-y-1 pl-5">
                    {compliance.filledCategories.map((cat) => (
                      <li key={cat.id} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">
                          {cat.scope === 'scope1' ? 'S1' : cat.scope === 'scope2' ? 'S2' : 'S3'}
                        </span>
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Bouton d'action */}
              {compliance.missingCategories.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/calculator')}
                >
                  Compléter dans le Calculateur Avancé
                </Button>
              )}
              
              {compliance.score === 100 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Toutes les catégories obligatoires sont renseignées !
                  </p>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </CardContent>
    </Card>
  );
};

export default ComplianceScoreWidget;

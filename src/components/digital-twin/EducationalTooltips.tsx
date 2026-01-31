import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EducationalTooltipProps {
  term: string;
  definition: string;
  example?: string;
  className?: string;
}

export const educationalContent: Record<string, { definition: string; example?: string }> = {
  'risque_reglementaire': {
    definition: "Impact potentiel des changements de tarifs d'achat ou taxes futures sur la rentabilité du projet.",
    example: "Ex: Modification des tarifs STEG ou nouvelles taxes sur l'autoconsommation."
  },
  'cbam_phase3': {
    definition: "Carbon Border Adjustment Mechanism (CBAM) - Taxe carbone aux frontières de l'UE applicable dès 2026 sur les importations de produits à forte intensité carbone.",
    example: "Prix prévu: 65€/tCO₂ en 2026 → 130€/tCO₂ en 2036."
  },
  'tarif_steg_pointe': {
    definition: "Tarif du kWh durant les heures de forte consommation (18h-22h). C'est la période la plus chère où l'autoconsommation est la plus rentable.",
    example: "MT: 285 mill/kWh, HT: 245 mill/kWh"
  },
  'intensite_carbone_steg': {
    definition: "Facteur d'émission du réseau électrique tunisien, représentant la quantité de CO₂ émise pour produire 1 kWh d'électricité.",
    example: "0.48 kgCO₂/kWh (mix gaz naturel + renouvelables)"
  },
  'lcoe': {
    definition: "Levelized Cost of Energy - Coût actualisé de l'énergie. Représente le coût total de production d'un MWh sur la durée de vie du projet, permettant de comparer différentes sources d'énergie.",
    example: "Un LCOE de 80 TND/MWh signifie que chaque MWh produit coûte 80 TND."
  },
  'tri_payback': {
    definition: "Temps de Retour sur Investissement - Nombre d'années nécessaires pour que les économies cumulées couvrent l'investissement initial.",
    example: "Un TRI de 5 ans signifie que l'investissement sera remboursé en 5 ans."
  },
  'van': {
    definition: "Valeur Actuelle Nette - Mesure la richesse réelle créée par le projet en actualisant tous les flux futurs à leur valeur présente. Une VAN positive signifie que le projet est rentable.",
    example: "VAN = Σ(Flux futurs actualisés) - Investissement initial"
  },
  'wacc': {
    definition: "Weighted Average Cost of Capital - Coût moyen pondéré du capital. Représente le rendement minimum exigé par les investisseurs.",
    example: "Un WACC de 8% signifie que les investisseurs attendent un retour de 8%/an minimum."
  },
  'p50_p90': {
    definition: "P50 = production médiane attendue (50% de probabilité de faire mieux). P90 = production garantie dans 90% des cas (scénario conservateur, utilisé par les banques).",
    example: "P90 applique généralement un coefficient de -5% sur la production P50."
  },
  'om_costs': {
    definition: "Coûts d'Opération & Maintenance - Budget annuel pour l'entretien de l'installation : nettoyage des panneaux, monitoring, remplacement onduleurs, assurance.",
    example: "Standard industriel: 1-2% du CAPEX par an."
  },
  'degradation_panneaux': {
    definition: "Perte de rendement progressive des panneaux photovoltaïques due au vieillissement des cellules. Standard garanti par les fabricants.",
    example: "0.7%/an = un panneau produira 82.5% de sa capacité initiale après 25 ans."
  }
};

export const EducationalTooltip = ({ 
  term, 
  definition, 
  example,
  className = ''
}: EducationalTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-gray-400 hover:border-indigo-500 transition-colors ${className}`}>
            {term}
            <Info className="h-3 w-3 text-gray-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm bg-white border-gray-200 shadow-xl p-4 z-[100]"
        >
          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium">{definition}</p>
            {example && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5 border border-gray-100">
                💡 {example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Composant réutilisable pour les termes connus
export const KnownTermTooltip = ({ 
  termKey, 
  displayText,
  className = ''
}: { 
  termKey: keyof typeof educationalContent;
  displayText: string;
  className?: string;
}) => {
  const content = educationalContent[termKey];
  if (!content) return <span>{displayText}</span>;
  
  return (
    <EducationalTooltip 
      term={displayText}
      definition={content.definition}
      example={content.example}
      className={className}
    />
  );
};

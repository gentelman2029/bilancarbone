import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';

interface CBAMHelpTooltipProps {
  term: string;
  className?: string;
  variant?: 'tooltip' | 'hovercard';
}

// Base de connaissances des termes CBAM
const cbamGlossary: Record<string, { definition: string; example?: string; formula?: string; source?: string }> = {
  // Termes Scope
  'scope1': {
    definition: "Émissions directes provenant de sources que vous contrôlez directement (combustion de carburants, procédés industriels).",
    example: "Brûler du gaz naturel dans une chaudière de votre usine produit des émissions Scope 1.",
    source: "GHG Protocol"
  },
  'scope2': {
    definition: "Émissions indirectes liées à l'énergie achetée (électricité, vapeur, chauffage/refroidissement).",
    example: "L'électricité que vous achetez au réseau génère des émissions Scope 2.",
    source: "GHG Protocol"
  },
  'scope3': {
    definition: "Toutes les autres émissions indirectes de votre chaîne de valeur (matières premières, transport, déchets).",
    example: "Le fer que vous achetez a généré des émissions lors de son extraction = Scope 3.",
    source: "GHG Protocol"
  },
  
  // Termes techniques GES
  'prg': {
    definition: "Pouvoir de Réchauffement Global - mesure l'impact d'un gaz à effet de serre par rapport au CO₂ sur 100 ans.",
    example: "Le méthane (CH₄) a un PRG de 25, donc 1 kg de CH₄ = 25 kg CO₂e.",
    formula: "Impact GES = Quantité (kg) × PRG",
    source: "GIEC AR6"
  },
  'co2e': {
    definition: "CO₂ équivalent - unité qui convertit tous les gaz à effet de serre en équivalent CO₂ pour faciliter les comparaisons.",
    example: "1 tonne de N₂O = 298 tonnes CO₂e (car PRG du N₂O = 298).",
    source: "GIEC"
  },
  'ch4': {
    definition: "Méthane - gaz à effet de serre 25 fois plus puissant que le CO₂ (PRG = 25).",
    example: "Produit par la digestion animale, les décharges, l'extraction de gaz naturel.",
    source: "GIEC AR6"
  },
  'n2o': {
    definition: "Protoxyde d'azote - gaz à effet de serre 298 fois plus puissant que le CO₂.",
    example: "Produit par l'agriculture (engrais azotés), l'industrie chimique.",
    source: "GIEC AR6"
  },
  
  // Termes marché carbone
  'eex': {
    definition: "European Energy Exchange - bourse européenne de l'énergie où s'échangent les quotas d'émission (EUA).",
    example: "Le prix EEX actuel d'environ 68€/tCO₂ détermine le coût des certificats CBAM.",
    source: "Commission Européenne"
  },
  'eua': {
    definition: "European Union Allowances - quotas d'émission échangeables dans le système ETS européen.",
    example: "1 EUA = droit d'émettre 1 tonne de CO₂.",
    source: "EU ETS"
  },
  'ets': {
    definition: "Système d'Échange de Quotas d'Émission - marché européen du carbone.",
    example: "Les industriels européens achètent/vendent des quotas EUA sur le marché ETS.",
    source: "Commission Européenne"
  },
  
  // Termes CBAM spécifiques
  'cbam': {
    definition: "Carbon Border Adjustment Mechanism - taxe carbone aux frontières de l'UE sur les produits importés.",
    example: "Un importateur d'acier devra acheter des certificats CBAM équivalents aux émissions de production.",
    source: "Règlement UE 2023/956"
  },
  'facteur_emission': {
    definition: "Quantité de CO₂ émise par unité de consommation d'énergie ou de matière.",
    example: "Le gaz naturel a un facteur d'émission de ~0.2 kgCO₂/kWh.",
    formula: "Émissions = Consommation × Facteur d'émission",
    source: "GIEC, ADEME"
  },
  'intensite_carbone': {
    definition: "Émissions totales divisées par la quantité produite - mesure l'efficacité carbone.",
    example: "Produire 1 tonne d'acier avec 1.8 tCO₂e = intensité de 1.8 tCO₂e/tonne.",
    formula: "Intensité = Émissions totales ÷ Production",
    source: "GHG Protocol"
  },
  'precurseur': {
    definition: "Matière première ou produit semi-fini utilisé dans la fabrication, dont les émissions sont incluses.",
    example: "Le minerai de fer est un précurseur pour la production d'acier.",
    source: "CBAM Règlement UE"
  },
  
  // Termes incertitude
  'incertitude': {
    definition: "Marge d'erreur possible sur une mesure ou un calcul, exprimée en pourcentage.",
    example: "Une incertitude de ±5% sur 100 tCO₂ signifie que la vraie valeur est entre 95 et 105 tCO₂.",
    source: "Guide GUM"
  },
  'gum': {
    definition: "Guide to the Expression of Uncertainty in Measurement - norme internationale pour calculer les incertitudes.",
    formula: "U_combinée = √(u₁² + u₂² + ... + uₙ²)",
    source: "BIPM/ISO"
  },
  
  // Unités
  'kwh': {
    definition: "Kilowatt-heure - unité d'énergie (1 kWh = 3.6 MJ).",
    example: "Un appareil de 1000W fonctionnant 1h consomme 1 kWh.",
  },
  'gj': {
    definition: "Gigajoule - unité d'énergie (1 GJ = 277.8 kWh).",
    example: "Utilisé pour mesurer la consommation de combustibles (charbon, fioul).",
  },
  'mwh': {
    definition: "Mégawatt-heure - unité d'énergie (1 MWh = 1000 kWh).",
    example: "Utilisé pour les grandes consommations électriques industrielles.",
  },
  'tco2': {
    definition: "Tonne de CO₂ - unité standard pour mesurer les émissions de gaz à effet de serre.",
    example: "Un vol Paris-New York émet environ 1 tCO₂ par passager.",
  },
};

export const CBAMHelpTooltip: React.FC<CBAMHelpTooltipProps> = ({ 
  term, 
  className = '',
  variant = 'tooltip'
}) => {
  const termKey = term.toLowerCase().replace(/[₂₄]/g, match => {
    if (match === '₂') return '2';
    if (match === '₄') return '4';
    return match;
  }).replace(/\s+/g, '_');
  
  const info = cbamGlossary[termKey];
  
  if (!info) {
    return <span className={className}>{term}</span>;
  }

  if (variant === 'tooltip') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50 ${className}`}>
              {term}
              <HelpCircle className="h-3 w-3 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">{term}</p>
              <p className="text-xs text-muted-foreground">{info.definition}</p>
              {info.example && (
                <p className="text-xs text-primary/80 italic">💡 {info.example}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50 ${className}`}>
          {term}
          <Info className="h-3 w-3 text-muted-foreground" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{term}</h4>
            {info.source && (
              <Badge variant="outline" className="text-xs">{info.source}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{info.definition}</p>
          {info.formula && (
            <div className="bg-muted/50 p-2 rounded text-xs font-mono">
              📐 {info.formula}
            </div>
          )}
          {info.example && (
            <p className="text-xs text-primary/80 italic">
              💡 Exemple: {info.example}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// Composant pour afficher une formule de manière accessible
interface FormulaExplainerProps {
  title: string;
  formula: string;
  variables: { symbol: string; name: string; value?: string | number }[];
  result?: string | number;
  explanation?: string;
}

export const FormulaExplainer: React.FC<FormulaExplainerProps> = ({
  title,
  formula,
  variables,
  result,
  explanation
}) => {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
      <h5 className="font-medium text-sm flex items-center gap-2">
        <span className="text-lg">📐</span> {title}
      </h5>
      
      {/* Formule */}
      <div className="bg-background p-3 rounded border text-center font-mono text-sm">
        {formula}
      </div>
      
      {/* Variables expliquées */}
      <div className="grid gap-2">
        <p className="text-xs font-medium text-muted-foreground">Où :</p>
        {variables.map((v, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <code className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{v.symbol}</code>
            <span className="text-muted-foreground">=</span>
            <span>{v.name}</span>
            {v.value !== undefined && (
              <span className="ml-auto text-muted-foreground">({v.value})</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Résultat */}
      {result !== undefined && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Résultat :</span>
          <Badge variant="default" className="text-sm">{result}</Badge>
        </div>
      )}
      
      {/* Explication */}
      {explanation && (
        <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
          💡 {explanation}
        </p>
      )}
    </div>
  );
};

export default CBAMHelpTooltip;

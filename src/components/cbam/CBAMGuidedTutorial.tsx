import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Lightbulb,
  Play,
  RotateCcw,
  X,
  Factory,
  Zap,
  Calculator,
  FileText,
  HelpCircle
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  tips: string[];
  action?: string;
  completed?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'step1',
    title: '1. Identifier votre produit CBAM',
    description: 'Commencez par sélectionner le type de produit que vous importez ou exportez. Les secteurs couverts par le CBAM sont : fer et acier, ciment, aluminium, engrais, électricité et hydrogène.',
    tips: [
      'Vérifiez le code NC/CN8 de votre produit dans vos documents douaniers',
      'Les codes CN8 sont des codes à 8 chiffres de la nomenclature combinée européenne',
      'Chaque secteur a des facteurs d\'émission différents'
    ],
    action: 'add_product'
  },
  {
    id: 'step2',
    title: '2. Renseigner les consommations énergétiques',
    description: 'Entrez les données de consommation d\'énergie utilisées pour produire votre produit. Ces données servent à calculer les émissions directes (Scope 1) et indirectes liées à l\'électricité (Scope 2).',
    tips: [
      'L\'électricité se mesure en kWh (kilowatt-heures) - consultez vos factures',
      'Le gaz naturel se mesure aussi en kWh ou parfois en m³',
      'Le charbon et le fioul se mesurent en GJ (gigajoules) ou en tonnes',
      'Si vous ne connaissez pas une valeur, laissez le champ vide (une valeur par défaut sera utilisée)'
    ],
    action: 'enter_energy'
  },
  {
    id: 'step3',
    title: '3. Ajouter les matières premières (précurseurs)',
    description: 'Les "précurseurs" sont les matières premières dont les émissions de production doivent être comptées. Elles constituent les émissions Scope 3 de votre produit.',
    tips: [
      'Pour l\'acier : minerai de fer, ferraille, charbon de coke',
      'Pour le ciment : calcaire, argile, gypse',
      'Indiquez la quantité utilisée par tonne de produit fini',
      'Si vous connaissez le pays d\'origine, les facteurs seront plus précis'
    ],
    action: 'add_precursors'
  },
  {
    id: 'step4',
    title: '4. Lancer le calcul des émissions',
    description: 'Le calculateur additionne toutes les sources d\'émissions et calcule le total en tCO₂e (tonnes d\'équivalent CO₂). Une "intensité carbone" est aussi calculée (émissions par tonne de produit).',
    tips: [
      'Le résultat est exprimé en tCO₂e (tonnes d\'équivalent CO₂)',
      'L\'incertitude (±%) indique la précision du calcul',
      'Un score de conformité évalue la qualité de vos données',
      'Vous pouvez exporter les résultats détaillés'
    ],
    action: 'calculate'
  },
  {
    id: 'step5',
    title: '5. Générer les rapports de conformité',
    description: 'Une fois les calculs terminés, vous pouvez générer des rapports conformes au règlement européen CBAM pour vos déclarations trimestrielles ou annuelles.',
    tips: [
      'Les rapports incluent toutes les formules et sources utilisées',
      'Conservez les justificatifs (factures, certificats) pour audit',
      'Les rapports peuvent être exportés en PDF ou CSV',
      'Vérifiez les échéances de déclaration dans l\'onglet Échéances'
    ],
    action: 'generate_report'
  }
];

interface CBAMGuidedTutorialProps {
  onClose?: () => void;
  onNavigate?: (action: string) => void;
  isCompact?: boolean;
}

export const CBAMGuidedTutorial: React.FC<CBAMGuidedTutorialProps> = ({
  onClose,
  onNavigate,
  isCompact = false
}) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>('step1');
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const progress = (completedSteps.length / tutorialSteps.length) * 100;

  const handleStepAction = (action?: string) => {
    if (action && onNavigate) {
      onNavigate(action);
    }
  };

  if (isMinimized) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Guide CBAM ({completedSteps.length}/{tutorialSteps.length})
      </Button>
    );
  }

  if (isCompact) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Guide pas-à-pas CBAM
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {completedSteps.length}/{tutorialSteps.length}
              </Badge>
              {onClose && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-1">
            {tutorialSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = !isCompleted && completedSteps.length === index;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                    isCurrent ? 'bg-primary/10 text-primary' : 
                    isCompleted ? 'text-muted-foreground' : 'hover:bg-muted/50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className={`h-4 w-4 flex-shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={isCompleted ? 'line-through' : ''}>{step.title}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Guide pas-à-pas CBAM
            <Badge variant="secondary">Pour débutants</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCompletedSteps([])}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Recommencer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)}>
              Réduire
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {completedSteps.length}/{tutorialSteps.length} étapes
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tutorialSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isExpanded = expandedStep === step.id;
          const isCurrent = !isCompleted && completedSteps.length === index;

          return (
            <Collapsible key={step.id} open={isExpanded} onOpenChange={() => setExpandedStep(isExpanded ? null : step.id)}>
              <CollapsibleTrigger asChild>
                <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isCurrent ? 'bg-primary/10 border border-primary/20' :
                  isCompleted ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/50'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepComplete(step.id);
                    }}
                    className="flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className={`h-6 w-6 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {step.title}
                    </h4>
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{step.description}</p>
                    )}
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-12 pr-3 pb-3">
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Conseils pratiques
                    </h5>
                    <ul className="space-y-1">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {step.action && (
                      <Button size="sm" onClick={() => handleStepAction(step.action)}>
                        <Play className="h-3 w-3 mr-1" />
                        Commencer cette étape
                      </Button>
                    )}
                    {!isCompleted && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleStepComplete(step.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Marquer comme terminé
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        
        {completedSteps.length === tutorialSteps.length && (
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-700 dark:text-green-400">
              Félicitations ! 🎉
            </h4>
            <p className="text-sm text-green-600 dark:text-green-500">
              Vous avez terminé le guide CBAM. Vous êtes prêt à gérer vos déclarations !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant glossaire rapide
export const CBAMQuickGlossary: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const terms = [
    { term: 'CBAM', def: 'Taxe carbone aux frontières de l\'UE' },
    { term: 'Scope 1', def: 'Émissions directes (combustion sur site)' },
    { term: 'Scope 2', def: 'Émissions de l\'électricité achetée' },
    { term: 'Scope 3', def: 'Émissions des matières premières' },
    { term: 'PRG', def: 'Pouvoir de réchauffement d\'un gaz vs CO₂' },
    { term: 'tCO₂e', def: 'Tonnes d\'équivalent CO₂' },
    { term: 'EEX', def: 'Bourse européenne du carbone' },
    { term: 'Facteur d\'émission', def: 'CO₂ émis par unité d\'énergie' },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Glossaire rapide
          </span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="grid grid-cols-2 gap-2">
          {terms.map((item, i) => (
            <div key={i} className="bg-muted/30 p-2 rounded text-sm">
              <span className="font-medium text-primary">{item.term}:</span>{' '}
              <span className="text-muted-foreground">{item.def}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CBAMGuidedTutorial;

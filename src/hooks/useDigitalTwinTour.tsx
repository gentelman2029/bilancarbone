import { useState, useCallback } from 'react';
import type { Step, CallBackProps, STATUS } from 'react-joyride';

export const useDigitalTwinTour = () => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: '[data-tour="config-solar"]',
      title: '⚡ Configuration Solaire',
      content: (
        <div className="text-sm space-y-2">
          <p>Configurez votre installation photovoltaïque :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Puissance (kWc)</strong> : Capacité crête de vos panneaux solaires</li>
            <li><strong>Tracker</strong> : Augmente le rendement de 15-25% via un suivi solaire</li>
          </ul>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="config-battery"]',
      title: '🔋 Stockage Batterie',
      content: (
        <div className="text-sm space-y-2">
          <p>Le stockage permet d'optimiser l'autoconsommation :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Stockez l'excédent solaire pour les heures de pointe</li>
            <li>Réduisez votre dépendance au réseau STEG</li>
            <li>Durée de vie moyenne : 10 ans (remplacement prévu)</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="config-financial"]',
      title: '💰 Paramètres Financiers',
      content: (
        <div className="text-sm space-y-2">
          <p>Ajustez les hypothèses économiques :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Tarifs STEG</strong> : MT/HT avec différenciation Pointe/Jour/Nuit</li>
            <li><strong>Inflation</strong> : Impact sur la valeur future des économies</li>
            <li><strong>Subvention ANME</strong> : Aide à l'investissement (30% CAPEX)</li>
          </ul>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="kpi-cards"]',
      title: '📊 Indicateurs Clés (KPIs)',
      content: (
        <div className="text-sm space-y-2">
          <p>Analysez la rentabilité de votre projet :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>TRI</strong> : Temps de retour sur investissement</li>
            <li><strong>LCOE</strong> : Coût de l'énergie produite (TND/MWh)</li>
            <li><strong>VAN</strong> : Valeur créée sur 25 ans (actualisée à 8%)</li>
            <li><strong>CBAM</strong> : Économies sur la taxe carbone UE</li>
          </ul>
          <p className="text-emerald-400 mt-2">💡 Survolez chaque carte pour voir la formule détaillée</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="projection-chart"]',
      title: '📈 Flux de Trésorerie Projetés',
      content: (
        <div className="text-sm space-y-2">
          <p>Visualisez l'évolution financière sur 10 ans :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Barres vertes</strong> : Cash-flow net annuel (économies - O&M)</li>
            <li><strong>Ligne orange</strong> : Économies cumulées depuis l'installation</li>
            <li><strong>Seuil de rentabilité</strong> : Quand la ligne croise le zéro</li>
          </ul>
          <p className="text-amber-400 mt-2">⚠️ Intègre la dégradation des panneaux (0.7%/an)</p>
        </div>
      ),
      placement: 'top',
    },
  ];

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRunTour(true);
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, index, type } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status as string)) {
      setRunTour(false);
      setStepIndex(0);
      // Save to localStorage that tour was completed
      localStorage.setItem('digital-twin-tour-completed', 'true');
    } else if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  }, []);

  const isTourCompleted = () => {
    return localStorage.getItem('digital-twin-tour-completed') === 'true';
  };

  const resetTour = useCallback(() => {
    localStorage.removeItem('digital-twin-tour-completed');
  }, []);

  return {
    runTour,
    stepIndex,
    steps,
    startTour,
    handleJoyrideCallback,
    isTourCompleted,
    resetTour,
  };
};

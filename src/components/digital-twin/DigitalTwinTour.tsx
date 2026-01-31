import Joyride, { TooltipRenderProps } from 'react-joyride';
import { useDigitalTwinTour } from '@/hooks/useDigitalTwinTour';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

// Custom Tooltip Component matching dark theme
const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  size,
}: TooltipRenderProps) => (
  <div
    {...tooltipProps}
    className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm overflow-hidden"
  >
    {/* Header */}
    <div className="bg-gradient-to-r from-emerald-600/20 to-slate-800 px-5 py-3 flex items-center justify-between border-b border-slate-700">
      <h3 className="text-emerald-400 font-semibold text-base">
        {step.title}
      </h3>
      <button
        {...closeProps}
        className="text-slate-400 hover:text-white transition-colors p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    {/* Content */}
    <div className="px-5 py-4 text-slate-300">
      {step.content}
    </div>

    {/* Footer with navigation */}
    <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
      <span className="text-xs text-slate-500">
        Étape {index + 1} / {size}
      </span>
      <div className="flex items-center gap-2">
        {index > 0 && (
          <Button
            {...backProps}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
        )}
        {continuous && (
          <Button
            {...primaryProps}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {index === size - 1 ? 'Terminer' : 'Suivant'}
            {index < size - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        )}
      </div>
    </div>
  </div>
);

interface DigitalTwinTourProps {
  runTour: boolean;
  steps: any[];
  stepIndex: number;
  handleCallback: (data: any) => void;
}

export const DigitalTwinTour = ({
  runTour,
  steps,
  stepIndex,
  handleCallback,
}: DigitalTwinTourProps) => {
  return (
    <Joyride
      callback={handleCallback}
      continuous
      run={runTour}
      steps={steps}
      stepIndex={stepIndex}
      scrollToFirstStep
      showSkipButton
      showProgress
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          arrowColor: '#1e293b',
          backgroundColor: '#0f172a',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: '#10b981',
          textColor: '#f1f5f9',
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 12,
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))',
          },
        },
      }}
    />
  );
};

// Guide Button Component
interface GuideButtonProps {
  onClick: () => void;
}

export const GuideButton = ({ onClick }: GuideButtonProps) => (
  <Button
    onClick={onClick}
    variant="outline"
    size="sm"
    className="bg-slate-800/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 gap-2"
  >
    <HelpCircle className="h-4 w-4" />
    Guide
  </Button>
);

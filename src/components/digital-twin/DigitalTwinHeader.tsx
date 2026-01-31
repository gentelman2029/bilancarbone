import { ChevronRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DigitalTwinHeaderProps {
  onStartTour?: () => void;
}

export const DigitalTwinHeader = ({ onStartTour }: DigitalTwinHeaderProps) => {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm border-gray-200">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Modules</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <span className="font-medium text-gray-900">Jumeau Numérique</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Guide Button */}
        {onStartTour && (
          <Button
            onClick={onStartTour}
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500/50"
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </Button>
        )}

        {/* Network Status Badge */}
        <Badge 
          variant="outline" 
          className="gap-2 py-1.5 bg-amber-50 border-amber-300 text-amber-600"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Intensité Mix STEG : Élevée (480g CO₂/kWh)
        </Badge>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Mohamed Trabelsi</div>
            <div className="text-xs text-gray-500">Directeur Technique</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
            MT
          </div>
        </div>
      </div>
    </header>
  );
};

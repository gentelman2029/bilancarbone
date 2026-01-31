import { ChevronRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DigitalTwinHeaderProps {
  onStartTour?: () => void;
}

export const DigitalTwinHeader = ({ onStartTour }: DigitalTwinHeaderProps) => {
  return (
    <header className="h-16 bg-card/50 border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Modules</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        <span className="text-foreground font-medium">Jumeau Numérique</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Guide Button */}
        {onStartTour && (
          <Button
            onClick={onStartTour}
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </Button>
        )}

        {/* Network Status Badge */}
        <Badge 
          variant="outline" 
          className="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 gap-2 py-1.5"
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
            <div className="text-sm font-medium text-foreground">Mohamed Trabelsi</div>
            <div className="text-xs text-muted-foreground">Directeur Technique</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-semibold text-sm">
            MT
          </div>
        </div>
      </div>
    </header>
  );
};

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DigitalTwinHeader = () => {
  return (
    <header className="h-16 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Modules</span>
        <ChevronRight className="h-4 w-4 text-slate-600" />
        <span className="text-slate-200 font-medium">Jumeau Numérique</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Status Badge */}
        <Badge 
          variant="outline" 
          className="bg-amber-500/10 border-amber-500/30 text-amber-400 gap-2 py-1.5"
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
            <div className="text-sm font-medium">Mohamed Trabelsi</div>
            <div className="text-xs text-slate-500">Directeur Technique</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
            MT
          </div>
        </div>
      </div>
    </header>
  );
};

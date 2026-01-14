import { 
  LayoutDashboard, 
  Activity, 
  Calculator, 
  FileText, 
  Settings,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  active: boolean;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: false },
  { icon: Activity, label: "Suivi Temps Réel", active: false },
  { icon: Calculator, label: "Simulateur Investissement", active: true },
  { icon: FileText, label: "Rapports Réglementaires", active: false },
  { icon: Settings, label: "Paramètres", active: false },
];

export const DigitalTwinSidebar = () => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">
          <span className="text-emerald-500">Green</span>Insight
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
              item.active 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">Version 2.1.0</div>
      </div>
    </aside>
  );
};

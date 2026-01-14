import { 
  LayoutDashboard, 
  Activity, 
  Calculator, 
  FileText, 
  Settings,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
  { icon: Activity, label: "Suivi Temps Réel", path: "/data" },
  { icon: Calculator, label: "Simulateur Investissement", path: "/digital-twin" },
  { icon: FileText, label: "Rapports Réglementaires", path: "/cbam" },
  { icon: Settings, label: "Paramètres", path: "/contact" },
];

export const DigitalTwinSidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
          <span className="text-emerald-500">Green</span>Insight
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 active:bg-slate-700/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">Version 2.1.0</div>
      </div>
    </aside>
  );
};

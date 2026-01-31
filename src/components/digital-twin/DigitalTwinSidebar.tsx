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
import { useDigitalTwinTheme } from "@/contexts/DigitalTwinThemeContext";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/digital-twin" },
  { icon: Activity, label: "Suivi Temps Réel", path: "/digital-twin/real-time" },
  { icon: Calculator, label: "Simulateur Investissement", path: "/digital-twin/simulator" },
  { icon: FileText, label: "Rapports Réglementaires", path: "/digital-twin/reports" },
  { icon: Settings, label: "Paramètres", path: "/digital-twin/settings" },
];

export const DigitalTwinSidebar = () => {
  const location = useLocation();
  const { theme } = useDigitalTwinTheme();
  const isDark = theme === "dark";
  
  return (
    <aside className={cn(
      "w-64 border-r flex flex-col",
      isDark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "p-6 border-b",
        isDark ? "border-slate-800" : "border-gray-200"
      )}>
        <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
          <span className="text-emerald-500">Green</span>
          <span className={isDark ? "text-white" : "text-gray-900"}>Insight</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/digital-twin" && location.pathname === "/digital-twin") ||
            (item.path !== "/digital-twin" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : isDark 
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "p-4 border-t",
        isDark ? "border-slate-800" : "border-gray-200"
      )}>
        <div className={cn(
          "text-xs",
          isDark ? "text-slate-500" : "text-gray-400"
        )}>Version 2.1.0</div>
      </div>
    </aside>
  );
};

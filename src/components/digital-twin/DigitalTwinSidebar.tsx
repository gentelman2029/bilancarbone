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
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/digital-twin" },
  { icon: Activity, label: "Suivi Temps Réel", path: "/digital-twin/real-time" },
  { icon: Calculator, label: "Simulateur Investissement", path: "/digital-twin/simulator" },
  { icon: FileText, label: "Rapports Réglementaires", path: "/digital-twin/reports" },
  { icon: Settings, label: "Paramètres", path: "/digital-twin/settings" },
];

export const DigitalTwinSidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
          <span className="text-primary">Green</span><span className="text-foreground">Insight</span>
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
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/80"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">Version 2.1.0</div>
      </div>
    </aside>
  );
};

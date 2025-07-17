import { Leaf, BarChart3, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Accueil", icon: Leaf },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/data", label: "Collecte", icon: Users },
    { path: "/actions", label: "Actions", icon: Settings },
  ];

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CarbonTrack</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
            <Button variant="eco" size="sm">
              Essai gratuit
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
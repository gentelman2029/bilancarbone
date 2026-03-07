import { 
  Leaf, BarChart3, Users, Settings, LogOut, Menu, X, Calculator, 
  ShieldCheck, AlertTriangle, LogIn, UserPlus, FileText, Target, 
  ClipboardList, Activity, ScanLine, Scale, Gauge, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useCBAMDeadlines } from "@/hooks/useCBAMDeadlines";

import type { User } from "@supabase/supabase-js";

interface NavGroup {
  label: string;
  items: { path: string; label: string; icon: any; badge?: number }[];
}

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { criticalOverdueCount } = useCBAMDeadlines();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navGroups: NavGroup[] = [
    {
      label: "Mesure",
      items: [
        { path: "/calculator", label: "Bilan Carbone", icon: Calculator },
        { path: "/dashboard", label: t("navigation.dashboard"), icon: BarChart3 },
        { path: "/digital-twin", label: "Jumeau Numérique", icon: Activity },
        { path: "/data-ocr", label: "Collecte Carbone", icon: ScanLine },
      ],
    },
    {
      label: "Réglementation",
      items: [
        { path: "/esg", label: "CSRD / ESG", icon: Target },
        { path: "/cbam", label: "CBAM / MACF", icon: ShieldCheck, badge: criticalOverdueCount },
        { path: "/documents", label: "Documents", icon: FileText },
      ],
    },
    {
      label: "Action",
      items: [
        { path: "/actions", label: "Plan d'Actions", icon: Settings },
        { path: "/rse-pilotage", label: "Pilotage RSE", icon: ClipboardList },
      ],
    },
  ];

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
      toast({ title: t("auth.signout_success"), description: t("auth.signout_message") });
    } catch (error: any) {
      toast({ title: t("auth.signout_error"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => location.pathname === item.path);

  return (
    <header className="bg-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              <span className="text-primary">Green</span>Insight
            </span>
          </Link>

          {/* Desktop Navigation — grouped dropdowns */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                location.pathname === "/"
                  ? "bg-gradient-primary text-primary-foreground shadow-eco"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span className="font-medium">{t("navigation.home")}</span>
            </Link>

            {navGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === group.label ? null : group.label)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isGroupActive(group)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <span className="font-medium">{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === group.label ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.path === "/cbam" && item.badge && item.badge > 0 && (
                          <div className="relative flex-shrink-0 ml-auto">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                              {item.badge}
                            </Badge>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden xl:block">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={loading} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>{t("auth.logout")}</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>{t("auth.login")}</Button>
                <Button variant="default" size="sm" onClick={() => navigate("/trial")} className="bg-gradient-primary hover:scale-105 transition-transform shadow-eco">
                  {t("auth.signup")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-1 mt-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === "/"
                    ? "bg-gradient-primary text-primary-foreground shadow-eco"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Leaf className="w-5 h-5" />
                <span className="font-medium">{t("navigation.home")}</span>
              </Link>

              {navGroups.map((group) => (
                <div key={group.label}>
                  <div className="px-4 py-2 mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        location.pathname === item.path
                          ? "bg-gradient-primary text-primary-foreground shadow-eco"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.path === "/cbam" && item.badge && item.badge > 0 && (
                        <div className="relative ml-auto">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {item.badge}
                          </Badge>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            {/* Mobile Auth */}
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">{user.email}</div>
                  <Button variant="ghost" onClick={handleSignOut} disabled={loading} className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("auth.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="w-full justify-start">
                    {t("auth.login")}
                  </Button>
                  <Button variant="default" onClick={() => { navigate("/trial"); setMobileMenuOpen(false); }} className="w-full bg-gradient-primary shadow-eco">
                    {t("auth.signup")}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

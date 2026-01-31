import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDigitalTwinTheme } from "@/contexts/DigitalTwinThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useDigitalTwinTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={
        theme === "dark"
          ? "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 gap-2 transition-colors"
          : "bg-white border-gray-200 hover:bg-gray-100 gap-2 transition-colors"
      }
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-slate-300">Clair</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-indigo-500" />
          <span className="text-gray-700">Sombre</span>
        </>
      )}
    </Button>
  );
}

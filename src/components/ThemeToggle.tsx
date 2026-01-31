import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="border-border bg-background/80 hover:bg-muted gap-2 transition-colors"
    >
      {resolvedTheme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-muted-foreground">Clair</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Sombre</span>
        </>
      )}
    </Button>
  );
}

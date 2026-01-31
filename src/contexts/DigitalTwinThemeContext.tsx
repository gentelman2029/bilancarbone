import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface DigitalTwinThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const DigitalTwinThemeContext = createContext<DigitalTwinThemeContextType | undefined>(undefined);

const STORAGE_KEY = "greeninsight-digital-twin-theme";

export function DigitalTwinThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored as Theme) || "light";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <DigitalTwinThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </DigitalTwinThemeContext.Provider>
  );
}

export function useDigitalTwinTheme() {
  const context = useContext(DigitalTwinThemeContext);
  if (context === undefined) {
    throw new Error("useDigitalTwinTheme must be used within a DigitalTwinThemeProvider");
  }
  return context;
}

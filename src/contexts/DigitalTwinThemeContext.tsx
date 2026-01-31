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
  // Force light mode by default, clear any old dark theme stored
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Clear old dark theme preference and set to light
    localStorage.setItem(STORAGE_KEY, "light");
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
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

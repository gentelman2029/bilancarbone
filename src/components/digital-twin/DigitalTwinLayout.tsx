import { ReactNode } from "react";
import { DigitalTwinThemeProvider, useDigitalTwinTheme } from "@/contexts/DigitalTwinThemeContext";
import { DigitalTwinSidebar } from "./DigitalTwinSidebar";
import { DigitalTwinHeader } from "./DigitalTwinHeader";
import { cn } from "@/lib/utils";

interface DigitalTwinLayoutInnerProps {
  children: ReactNode;
  onStartTour?: () => void;
}

function DigitalTwinLayoutInner({ children, onStartTour }: DigitalTwinLayoutInnerProps) {
  const { theme } = useDigitalTwinTheme();

  return (
    <div 
      className={cn(
        "min-h-screen flex",
        theme === "dark" 
          ? "bg-slate-900 text-slate-100" 
          : "bg-gray-50 text-gray-900"
      )}
      data-theme={theme}
    >
      <DigitalTwinSidebar />
      <div className="flex-1 flex flex-col">
        <DigitalTwinHeader onStartTour={onStartTour} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

interface DigitalTwinLayoutProps {
  children: ReactNode;
  onStartTour?: () => void;
}

export function DigitalTwinLayout({ children, onStartTour }: DigitalTwinLayoutProps) {
  return (
    <DigitalTwinThemeProvider>
      <DigitalTwinLayoutInner onStartTour={onStartTour}>
        {children}
      </DigitalTwinLayoutInner>
    </DigitalTwinThemeProvider>
  );
}

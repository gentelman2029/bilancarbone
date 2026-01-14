import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { DataCollection } from "./pages/DataCollection";
import DataCollectionOCR from "./pages/DataCollectionOCR";
import { AdvancedGHGCalculator } from "./components/AdvancedGHGCalculator";
import { OtherGHGCalculator } from "./components/OtherGHGCalculator";
import { Actions } from "./pages/Actions";
import { Contact } from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import Trial from "./pages/Trial";
import Pricing from "./pages/Pricing";
import CBAM from "./pages/CBAM";
import Documents from "./pages/Documents";
import ESGDashboard from "./pages/ESGDashboard";
import RSEPilotage from "./pages/RSEPilotage";
import DigitalTwin from "./pages/DigitalTwin";
import { EmissionsProvider } from "./contexts/EmissionsContext";
import { ActionsProvider } from "./contexts/ActionsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EmissionsProvider>
      <ActionsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/trial" element={<Trial />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="data" element={<DataCollection />} />
                <Route path="data-ocr" element={<DataCollectionOCR />} />
                <Route path="calculator" element={<AdvancedGHGCalculator />} />
                <Route path="other-ghg" element={<OtherGHGCalculator />} />
                <Route path="actions" element={<Actions />} />
                <Route path="cbam" element={<CBAM />} />
                <Route path="documents" element={<Documents />} />
                <Route path="esg" element={<ESGDashboard />} />
                <Route path="rse-pilotage" element={<RSEPilotage />} />
                <Route path="contact" element={<Contact />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ActionsProvider>
    </EmissionsProvider>
  </QueryClientProvider>
);

export default App;

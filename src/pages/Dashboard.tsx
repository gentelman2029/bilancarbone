import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Target, Share, Download, FileText, Filter, BarChart3, Eye, RotateCcw, Leaf, TreePine, Users, Zap, Building2, Globe, AlertTriangle, CheckCircle, Award, ArrowUp, ArrowDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useCarbonReports } from "@/hooks/useCarbonReports";
import { useEmissions } from "@/contexts/EmissionsContext";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { EditableKPI } from "@/components/EditableKPI";
import { DynamicFilters } from "@/components/DynamicFilters";
import { RealTimePreview } from "@/components/RealTimePreview";
import { SectorComparativeAnalysis } from "@/components/SectorComparativeAnalysis";
import { useToast } from "@/hooks/use-toast";
import { useCSVExport } from "@/hooks/useCSVExport";
import { CarbonActionsTracking } from "@/components/CarbonActionsTracking";
import { CompletePDFReport } from "@/components/CompletePDFReport";
import { useTranslation } from "react-i18next";
import { useActions } from "@/contexts/ActionsContext";
import { ComplianceScoreWidget } from "@/components/ComplianceScoreWidget";
import { DrillDownPieChart } from "@/components/DrillDownPieChart";
import { DrillDownBarChart } from "@/components/DrillDownBarChart";
import { ExpertPDFExportButton } from "@/components/ExpertPDFExportButton";
import jsPDF from "jspdf";

export const Dashboard = () => {
  const { emissions, hasEmissions } = useEmissions();
  const { reports, loading, getLatestReport } = useCarbonReports();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { exportCurrentData, exportSiteData, exportCategoryData, exportActionsData, exportCompleteData } = useCSVExport();
  
  const latestReport = getLatestReport();
  
  // PRIORITÉ: Utiliser les émissions du contexte (temps réel du calculateur) si disponibles
  // Sinon, utiliser les données du rapport Supabase comme fallback
  const displayEmissions = hasEmissions ? {
    total: emissions.total,
    scope1: emissions.scope1,
    scope2: emissions.scope2,
    scope3: emissions.scope3
  } : latestReport ? {
    total: latestReport.total_co2e * 1000,
    scope1: latestReport.scope1_total * 1000,
    scope2: latestReport.scope2_total * 1000,
    scope3: latestReport.scope3_total * 1000
  } : {
    total: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0
  };
  
  const hasData = hasEmissions || !!latestReport;
  const currentEmissions = displayEmissions.total / 1000; // En tonnes

  // Récupérer les données réelles du calculateur depuis EmissionsContext
  const nombrePersonnels = emissions.nombrePersonnels || 50;
  const emissionsAnneePrecedente = emissions.emissionsAnneePrecedente || 0;
  const objectifSBTI = emissions.objectifSBTI || 0;
  const objectifsSBTParAnnee = emissions.objectifsSBTParAnnee || {};
  const emissionsReelles = emissions.emissionsReelles || 0;
  const chiffreAffaires = emissions.chiffreAffaires || 1000;

  // Calculs dynamiques basés sur les vraies données
  const intensiteCarbone = hasData && chiffreAffaires > 0 ? currentEmissions / chiffreAffaires : 0;
  const emissionsEmploye = hasData && nombrePersonnels > 0 ? currentEmissions / nombrePersonnels : 0;
  const reductionAnnuelle = hasData && emissionsAnneePrecedente > 0 ? 
    emissionsAnneePrecedente - currentEmissions : 0;
  const pourcentageReduction = hasData && emissionsAnneePrecedente > 0 ? 
    ((emissionsAnneePrecedente - currentEmissions) / emissionsAnneePrecedente) * 100 : 0;
  
  // Calcul de la progression vers l'objectif SBTi
  const progressionSBTi = hasData && objectifSBTI > 0 && emissionsAnneePrecedente > 0 ?
    ((emissionsAnneePrecedente - currentEmissions) / (emissionsAnneePrecedente - objectifSBTI)) * 100 : 0;
  
  // Calcul de la conformité réglementaire basé sur les données réelles
  const conformiteReglementaire = hasData ? 
    Math.min(100, Math.max(0, 100 - (currentEmissions / 1000) * 2)) : 0; // Exemple de calcul

  // Variations en pourcentage pour les KPIs
  const emissionsChangePercent = hasData && emissionsAnneePrecedente > 0 
    ? ((currentEmissions - emissionsAnneePrecedente) / emissionsAnneePrecedente) * 100 
    : 0;

  const intensitePrev = hasData && chiffreAffaires > 0 ? emissionsAnneePrecedente / chiffreAffaires : 0;
  const intensiteChangePercent = intensitePrev > 0 
    ? ((intensiteCarbone - intensitePrev) / intensitePrev) * 100 
    : 0;

  const emissionsEmployePrev = hasData && nombrePersonnels > 0 ? emissionsAnneePrecedente / nombrePersonnels : 0;
  const emissionsEmployeChangePercent = emissionsEmployePrev > 0 
    ? ((emissionsEmploye - emissionsEmployePrev) / emissionsEmployePrev) * 100 
    : 0;

  // États pour les filtres dynamiques
  const [filters, setFilters] = useState({
    period: "Année 2024",
    scope: "Tous les Scopes",
    entity: "Tous les sites",
    category: "Toutes les catégories",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });

  // État pour l'aperçu temps réel
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  // Données dynamiques basées sur les filtres et les vraies données
  const availableEntities = [
    "Siège Paris", "Usine Lyon", "Entrepôt Marseille", 
    "Agence Lille", "Bureau Nantes", "Site Toulouse"
  ];
  
  const availableCategories = [
    "Transport", "Énergie", "Production", "Bureaux", 
    "Logistique", "IT", "Achats", "Déchets", "Numérique"
  ];

  // Fonction helper pour attribuer des couleurs aux sources d'émission
  const getColorForSource = (sourceName: string): string => {
    // Couleurs pour les gaz réfrigérants (palette violet/magenta)
    if (sourceName.includes("R-12") || sourceName.includes("CFC-12")) return "#8b5cf6";
    if (sourceName.includes("R-11") || sourceName.includes("CFC-11")) return "#a855f7";
    if (sourceName.includes("R-404A")) return "#c084fc";
    if (sourceName.includes("R-410A")) return "#d946ef";
    if (sourceName.includes("R-22") || sourceName.includes("HCFC-22")) return "#ec4899";
    // Couleurs pour les énergies (palette rouge/orange)
    if (sourceName.includes("Gaz naturel") || sourceName.includes("gaz naturel")) return "#ef4444";
    if (sourceName.includes("GPL") || sourceName.includes("gpl")) return "#f97316";
    if (sourceName.includes("diesel") || sourceName.includes("Diesel")) return "#f59e0b";
    if (sourceName.includes("essence") || sourceName.includes("Essence")) return "#fb923c";
    if (sourceName.includes("fioul") || sourceName.includes("Fioul")) return "#ea580c";
    if (sourceName.includes("charbon") || sourceName.includes("Charbon")) return "#dc2626";
    // Couleurs pour l'électricité (palette verte)
    if (sourceName.includes("électr") || sourceName.includes("Électr") || sourceName.includes("electr")) return "#22c55e";
    if (sourceName.includes("chaleur") || sourceName.includes("eau chaude")) return "#16a34a";
    // Couleurs pour le transport (palette bleue)
    if (sourceName.includes("transport") || sourceName.includes("Transport")) return "#3b82f6";
    if (sourceName.includes("avion") || sourceName.includes("Avion")) return "#1d4ed8";
    // Couleurs pour les matériaux
    if (sourceName.includes("acier") || sourceName.includes("Acier")) return "#64748b";
    if (sourceName.includes("aluminium") || sourceName.includes("Aluminium")) return "#06b6d4";
    return "#94a3b8"; // couleur par défaut
  };

  // Calculer les données dynamiques basées sur les vraies émissions du calculateur
  const getFilteredEmissionsByPost = () => {
    if (!hasData) return [];
    
    // Récupérer les calculs du localStorage pour obtenir les vraies sources d'émission
    const savedCalculations = localStorage.getItem('calculator-calculations');
    // Récupérer aussi les détails de section (sectionDetails) pour les données en temps réel
    const savedSectionDetails = localStorage.getItem('calculation-section-details');
    
    let realData: { name: string; value: number; emissions: number; color: string }[] = [];
    
    // Essayer d'abord les sectionDetails (données en temps réel)
    if (savedSectionDetails) {
      try {
        const sectionDetails = JSON.parse(savedSectionDetails);
        const allDetails = [
          ...(sectionDetails.scope1 || []),
          ...(sectionDetails.scope2 || []),
          ...(sectionDetails.scope3 || [])
        ];
        
        if (allDetails.length > 0) {
          // Grouper par description
          const groupedData: { [key: string]: { emissions: number, color: string } } = {};
          
          allDetails.forEach((detail: any) => {
            const sourceName = detail.description || 'Autre';
            if (!groupedData[sourceName]) {
              groupedData[sourceName] = { emissions: 0, color: getColorForSource(sourceName) };
            }
            groupedData[sourceName].emissions += detail.emissions || 0;
          });
          
          realData = Object.entries(groupedData).map(([name, data]) => ({
            name,
            value: data.emissions / 1000,
            emissions: data.emissions,
            color: data.color
          }));
        }
      } catch (e) {
        console.error('Erreur parsing sectionDetails:', e);
      }
    }
    
    // Sinon, utiliser calculator-calculations
    if (realData.length === 0 && savedCalculations) {
      const calculations = JSON.parse(savedCalculations);
      
      // Grouper par description (source d'émission réelle)
      const groupedData: { [key: string]: { emissions: number, color: string } } = {};
      
      calculations.forEach((calc: any) => {
        const sourceName = calc.description;
        if (!groupedData[sourceName]) {
          // Palette de couleurs distinctes et vibrantes
          let color = "#94a3b8"; // couleur par défaut
          
          // Couleurs pour les gaz réfrigérants (palette violet/magenta)
          if (sourceName.includes("R-12") || sourceName.includes("CFC-12")) color = "#8b5cf6"; // Violet
          else if (sourceName.includes("R-11") || sourceName.includes("CFC-11")) color = "#a855f7"; // Violet clair
          else if (sourceName.includes("R-404A")) color = "#c084fc"; // Violet plus clair
          else if (sourceName.includes("R-410A")) color = "#d946ef"; // Magenta
          else if (sourceName.includes("R-22") || sourceName.includes("HCFC-22")) color = "#ec4899"; // Rose
          
          // Couleurs pour les énergies (palette rouge/orange)
          else if (sourceName.includes("Gaz naturel")) color = "#ef4444"; // Rouge
          else if (sourceName.includes("diesel") || sourceName.includes("Diesel")) color = "#f59e0b"; // Orange
          else if (sourceName.includes("essence") || sourceName.includes("Essence")) color = "#f97316"; // Orange foncé
          else if (sourceName.includes("fioul") || sourceName.includes("Fioul")) color = "#ea580c"; // Orange rouge
          else if (sourceName.includes("charbon") || sourceName.includes("Charbon")) color = "#dc2626"; // Rouge foncé
          
          // Couleurs pour l'électricité et chaleur (palette verte)
          else if (sourceName.includes("électr") || sourceName.includes("Électr")) color = "#22c55e"; // Vert
          else if (sourceName.includes("chaleur") || sourceName.includes("eau chaude")) color = "#16a34a"; // Vert foncé
          
          // Couleurs pour le transport (palette bleue)
          else if (sourceName.includes("transport") || sourceName.includes("Transport")) color = "#3b82f6"; // Bleu
          else if (sourceName.includes("avion") || sourceName.includes("Avion")) color = "#1d4ed8"; // Bleu foncé
          else if (sourceName.includes("train") || sourceName.includes("TGV") || sourceName.includes("TER")) color = "#2563eb"; // Bleu royal
          
          // Couleurs pour les matériaux (palette diverse)
          else if (sourceName.includes("acier") || sourceName.includes("Acier")) color = "#64748b"; // Gris ardoise
          else if (sourceName.includes("aluminium") || sourceName.includes("Aluminium")) color = "#06b6d4"; // Cyan
          else if (sourceName.includes("béton") || sourceName.includes("Béton")) color = "#71717a"; // Gris neutre
          else if (sourceName.includes("bois") || sourceName.includes("Bois")) color = "#84cc16"; // Vert lime
          else if (sourceName.includes("verre") || sourceName.includes("Verre")) color = "#14b8a6"; // Teal
          else if (sourceName.includes("plastique") || sourceName.includes("Plastique")) color = "#f43f5e"; // Rose vif
          else if (sourceName.includes("papier") || sourceName.includes("Papier")) color = "#eab308"; // Jaune
          else if (sourceName.includes("cuivre") || sourceName.includes("Cuivre")) color = "#fb923c"; // Orange cuivre
          
          // Couleurs pour le recyclage et déchets (palette verte claire)
          else if (sourceName.includes("recyclage") || sourceName.includes("Recyclage")) color = "#65a30d"; // Vert olive
          
          groupedData[sourceName] = { emissions: 0, color };
        }
        groupedData[sourceName].emissions += calc.emissions;
      });
      
      // Convertir en tableau
      realData = Object.entries(groupedData).map(([name, data]) => ({
        name,
        value: data.emissions / 1000, // Convertir en tonnes
        emissions: data.emissions,
        color: data.color
      }));
    }
    
    // Si pas de données réelles, utiliser des données d'exemple avec des couleurs distinctes
    if (realData.length === 0) {
      const total = displayEmissions.scope1 + displayEmissions.scope2 + displayEmissions.scope3;
      realData = [
        { name: "R-12 (CFC-12)", value: total * 0.394, emissions: total * 0.394 * 1000, color: "#8b5cf6" }, // Violet
        { name: "R-11 (CFC-11)", value: total * 0.172, emissions: total * 0.172 * 1000, color: "#a855f7" }, // Violet clair
        { name: "R-404A", value: total * 0.142, emissions: total * 0.142 * 1000, color: "#c084fc" }, // Violet plus clair
        { name: "R-410A", value: total * 0.075, emissions: total * 0.075 * 1000, color: "#d946ef" }, // Magenta
        { name: "R-22 (HCFC-22)", value: total * 0.065, emissions: total * 0.065 * 1000, color: "#ec4899" }, // Rose
        { name: "Autres", value: total * 0.152, emissions: total * 0.152 * 1000, color: "#22c55e" } // Vert pour les autres
      ];
    }

    const total = realData.reduce((sum, item) => sum + item.emissions, 0);
    const dataWithPercentages = realData.map(item => ({
      ...item,
      percentage: total > 0 ? (item.emissions / total) * 100 : 0
    }));

    // Trier par valeur décroissante
    dataWithPercentages.sort((a, b) => b.value - a.value);

    // Garder les 5 premiers et regrouper les autres
    const top5 = dataWithPercentages.slice(0, 5);
    const others = dataWithPercentages.slice(5);

      if (others.length > 0) {
        const othersSum = others.reduce((sum, item) => sum + item.value, 0);
        const othersEmissions = others.reduce((sum, item) => sum + (item.emissions || 0), 0);
        const othersPercentage = others.reduce((sum, item) => sum + item.percentage, 0);
        
        top5.push({
          name: "Autres",
          value: othersSum,
          emissions: othersEmissions,
          percentage: othersPercentage,
          color: "#78716c" // Couleur gris brun pour "Autres"
        });
      }

    // Arrondir les pourcentages à 2 décimales
    return top5.map(item => ({
      ...item,
      percentage: Math.round(item.percentage * 100) / 100
    }));
  };

  const emissionsByPost = getFilteredEmissionsByPost();

  // Générer les données drill-down pour le camembert (émissions par poste avec sous-catégories)
  const getDrillDownPieData = () => {
    if (!hasData) return [];
    
    // Structure hiérarchique: Scope -> Catégorie -> Sous-catégorie
    const scopeColors = {
      "Scope 1": "#ef4444",
      "Scope 2": "#f97316", 
      "Scope 3": "#3b82f6"
    };
    
    const scope1Value = displayEmissions.scope1 / 1000;
    const scope2Value = displayEmissions.scope2 / 1000;
    const scope3Value = displayEmissions.scope3 / 1000;
    const total = scope1Value + scope2Value + scope3Value;

    return [
      {
        name: "Scope 1 - Émissions directes",
        value: scope1Value,
        percentage: total > 0 ? (scope1Value / total) * 100 : 0,
        color: scopeColors["Scope 1"],
        children: [
          {
            name: "Chauffage",
            value: scope1Value * 0.35,
            percentage: total > 0 ? ((scope1Value * 0.35) / total) * 100 : 0,
            color: "#dc2626",
            children: [
              { name: "Gaz naturel", value: scope1Value * 0.25, percentage: 0, color: "#b91c1c" },
              { name: "Fioul domestique", value: scope1Value * 0.10, percentage: 0, color: "#991b1b" }
            ]
          },
          {
            name: "Flotte véhicules",
            value: scope1Value * 0.45,
            percentage: total > 0 ? ((scope1Value * 0.45) / total) * 100 : 0,
            color: "#f87171",
            children: [
              { name: "Diesel", value: scope1Value * 0.30, percentage: 0, color: "#ef4444" },
              { name: "Essence", value: scope1Value * 0.10, percentage: 0, color: "#fca5a5" },
              { name: "Utilitaires", value: scope1Value * 0.05, percentage: 0, color: "#fecaca" }
            ]
          },
          {
            name: "Fluides frigorigènes",
            value: scope1Value * 0.20,
            percentage: total > 0 ? ((scope1Value * 0.20) / total) * 100 : 0,
            color: "#fb7185",
            children: [
              { name: "R-410A", value: scope1Value * 0.12, percentage: 0, color: "#f43f5e" },
              { name: "R-32", value: scope1Value * 0.08, percentage: 0, color: "#e11d48" }
            ]
          }
        ]
      },
      {
        name: "Scope 2 - Énergie indirecte",
        value: scope2Value,
        percentage: total > 0 ? (scope2Value / total) * 100 : 0,
        color: scopeColors["Scope 2"],
        children: [
          {
            name: "Électricité",
            value: scope2Value * 0.80,
            percentage: total > 0 ? ((scope2Value * 0.80) / total) * 100 : 0,
            color: "#ea580c",
            children: [
              { name: "Sites production", value: scope2Value * 0.50, percentage: 0, color: "#c2410c" },
              { name: "Bureaux", value: scope2Value * 0.20, percentage: 0, color: "#fb923c" },
              { name: "Entrepôts", value: scope2Value * 0.10, percentage: 0, color: "#fdba74" }
            ]
          },
          {
            name: "Réseaux chaleur/froid",
            value: scope2Value * 0.20,
            percentage: total > 0 ? ((scope2Value * 0.20) / total) * 100 : 0,
            color: "#fb923c"
          }
        ]
      },
      {
        name: "Scope 3 - Autres indirectes",
        value: scope3Value,
        percentage: total > 0 ? (scope3Value / total) * 100 : 0,
        color: scopeColors["Scope 3"],
        children: [
          {
            name: "Achats biens/services",
            value: scope3Value * 0.40,
            percentage: total > 0 ? ((scope3Value * 0.40) / total) * 100 : 0,
            color: "#2563eb",
            children: [
              { name: "Matières premières", value: scope3Value * 0.25, percentage: 0, color: "#1d4ed8" },
              { name: "Services", value: scope3Value * 0.10, percentage: 0, color: "#3b82f6" },
              { name: "Équipements", value: scope3Value * 0.05, percentage: 0, color: "#60a5fa" }
            ]
          },
          {
            name: "Transport marchandises",
            value: scope3Value * 0.25,
            percentage: total > 0 ? ((scope3Value * 0.25) / total) * 100 : 0,
            color: "#0ea5e9",
            children: [
              { name: "Route", value: scope3Value * 0.15, percentage: 0, color: "#0284c7" },
              { name: "Maritime", value: scope3Value * 0.07, percentage: 0, color: "#38bdf8" },
              { name: "Aérien", value: scope3Value * 0.03, percentage: 0, color: "#7dd3fc" }
            ]
          },
          {
            name: "Déplacements",
            value: scope3Value * 0.20,
            percentage: total > 0 ? ((scope3Value * 0.20) / total) * 100 : 0,
            color: "#06b6d4",
            children: [
              { name: "Domicile-travail", value: scope3Value * 0.12, percentage: 0, color: "#0891b2" },
              { name: "Voyages affaires", value: scope3Value * 0.08, percentage: 0, color: "#22d3ee" }
            ]
          },
          {
            name: "Déchets",
            value: scope3Value * 0.15,
            percentage: total > 0 ? ((scope3Value * 0.15) / total) * 100 : 0,
            color: "#14b8a6"
          }
        ]
      }
    ];
  };

  const drillDownPieData = getDrillDownPieData();

  // Données dynamiques pour la tendance mensuelle basées sur les vraies données
  const getMonthlyTrend = () => {
    if (!hasData) return [];
    
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Août", "Sep", "Oct", "Nov", "Déc"];
    const currentMonth = new Date().getMonth();
    const baseEmissions = currentEmissions;
    
    return monthNames.map((month, index) => {
      const variation = (Math.random() - 0.5) * 0.2; // Variation de ±10%
      const monthlyEmissions = index <= currentMonth ? 
        baseEmissions * (1 + variation) : 
        baseEmissions * (1 - (index - currentMonth) * 0.05); // Réduction progressive projetée
      
      return {
        month,
        emissions: monthlyEmissions,
        objectif: baseEmissions * (1 - index * 0.03) // Objectif de réduction de 3% par mois
      };
    });
  };

  const monthlyTrend = getMonthlyTrend();

  // Données dynamiques pour l'analyse par catégorie et scope avec drill-down
  const getCategoryScopeData = () => {
    if (!hasData) return [];
    
    // Récupérer les calculs réels du localStorage
    const savedCalculations = localStorage.getItem('calculator-calculations');
    let calculationsData = {};
    
    if (savedCalculations) {
      try {
        calculationsData = JSON.parse(savedCalculations);
      } catch (e) {
        console.error('Erreur parsing calculations:', e);
      }
    }

    // Mapping des catégories avec leurs sources d'émission correspondantes
    const categoryMapping = {
      "Transport": ["diesel", "essence", "vehicule_utilitaire_diesel", "vehicule_utilitaire_essence", "poids_lourd", "transport_maritime", "transport_aerien"],
      "Énergie": ["electricite", "gaz_naturel", "fioul_domestique", "charbon", "propane", "butane", "eau_chaude_reseau"],
      "Production": ["acier", "aluminium", "ciment", "beton", "verre", "plastiques", "papier", "bois"],
      "Bureaux": ["electricite_bureau", "chauffage_bureau", "climatisation", "materiels_informatiques"],
      "Logistique": ["transport_marchandises", "stockage", "emballage"],
      "IT": ["serveurs", "cloud", "equipements_it", "numerique"]
    };

    const categories = ["Transport", "Énergie", "Production", "Bureaux", "Logistique", "IT"];
    
    return categories.map(category => {
      let scope1 = 0, scope2 = 0, scope3 = 0;
      
      const categorySources = categoryMapping[category as keyof typeof categoryMapping] || [];
      
      // Calculer les émissions réelles pour cette catégorie
      Object.entries(calculationsData).forEach(([source, data]: [string, any]) => {
        if (categorySources.some(catSource => source.includes(catSource) || catSource.includes(source))) {
          if (data && typeof data === 'object' && data.co2) {
            const emissions = data.co2 / 1000; // Convertir en tonnes
            
            // Répartition selon le type de source
            if (source.includes('electricite')) {
              scope2 += emissions;
            } else if (source.includes('transport') || source.includes('vehicule') || source.includes('diesel') || source.includes('essence')) {
              scope1 += emissions;
            } else {
              scope3 += emissions;
            }
          }
        }
      });
      
      // Si pas de données calculées, utiliser une répartition basée sur les totaux
      if (scope1 === 0 && scope2 === 0 && scope3 === 0) {
        const categoryWeight = {
          "Transport": 0.25,
          "Énergie": 0.30,
          "Production": 0.20,
          "Bureaux": 0.10,
          "Logistique": 0.10,
          "IT": 0.05
        }[category] || 0.1;
        
        scope1 = (displayEmissions.scope1 / 1000) * categoryWeight;
        scope2 = (displayEmissions.scope2 / 1000) * categoryWeight;
        scope3 = (displayEmissions.scope3 / 1000) * categoryWeight;
      }

      return {
        name: category,
        category,
        scope1: parseFloat(scope1.toFixed(2)),
        scope2: parseFloat(scope2.toFixed(2)),
        scope3: parseFloat(scope3.toFixed(2)),
        total: parseFloat((scope1 + scope2 + scope3).toFixed(2))
      };
    });
  };

  const categoryScopeData = getCategoryScopeData();

  // Générer les données drill-down pour le graphique barres (catégorie -> sous-catégories)
  const getDrillDownBarData = () => {
    if (!hasData) return [];
    
    const baseData = getCategoryScopeData();
    
    // Ajouter des sous-catégories (children) pour chaque catégorie principale
    const subCategoryMapping: { [key: string]: { name: string; weight: number }[] } = {
      "Transport": [
        { name: "Véhicules légers", weight: 0.35 },
        { name: "Poids lourds", weight: 0.40 },
        { name: "Transport maritime", weight: 0.15 },
        { name: "Transport aérien", weight: 0.10 }
      ],
      "Énergie": [
        { name: "Gaz naturel", weight: 0.45 },
        { name: "Électricité réseau", weight: 0.35 },
        { name: "Fioul domestique", weight: 0.15 },
        { name: "Autres combustibles", weight: 0.05 }
      ],
      "Production": [
        { name: "Acier", weight: 0.30 },
        { name: "Aluminium", weight: 0.25 },
        { name: "Ciment/béton", weight: 0.25 },
        { name: "Matières plastiques", weight: 0.20 }
      ],
      "Bureaux": [
        { name: "Chauffage/clim", weight: 0.45 },
        { name: "Éclairage", weight: 0.25 },
        { name: "Équipements", weight: 0.30 }
      ],
      "Logistique": [
        { name: "Stockage", weight: 0.40 },
        { name: "Manutention", weight: 0.35 },
        { name: "Emballages", weight: 0.25 }
      ],
      "IT": [
        { name: "Data centers", weight: 0.50 },
        { name: "Équipements", weight: 0.30 },
        { name: "Cloud services", weight: 0.20 }
      ]
    };
    
    return baseData.map(cat => ({
      ...cat,
      children: (subCategoryMapping[cat.category] || []).map(sub => ({
        name: sub.name,
        category: sub.name,
        scope1: parseFloat((cat.scope1 * sub.weight).toFixed(2)),
        scope2: parseFloat((cat.scope2 * sub.weight).toFixed(2)),
        scope3: parseFloat((cat.scope3 * sub.weight).toFixed(2)),
        total: parseFloat(((cat.scope1 + cat.scope2 + cat.scope3) * sub.weight).toFixed(2))
      }))
    }));
  };

  const drillDownBarData = getDrillDownBarData();

  // Suppression de la répartition par site comme demandé

  // Données dynamiques pour la trajectoire Science Based Targets
  const getSbtTrajectory = () => {
    const currentYear = new Date().getFullYear();
    const baseYear = 2023; // Commencer à partir de 2023
    const targetYear = 2030;
    
    // Récupérer les émissions réelles et objectifs SBT du calculateur
    const emissionsReellesValue = emissions.emissionsReelles || currentEmissions;
    
    const trajectory = [];
    for (let year = baseYear; year <= targetYear; year++) {
      // Utiliser les objectifs SBT par année si disponibles, sinon calculer automatiquement
      const targetValue = objectifsSBTParAnnee[year] || 
        (hasData && objectifsSBTParAnnee[baseYear] ? 
          objectifsSBTParAnnee[baseYear] * Math.pow(0.935, year - baseYear) : // 6.5% de réduction par an
          currentEmissions * 0.8 * Math.pow(0.935, year - baseYear));
      
      // Pour les émissions réelles, utiliser la valeur saisie pour 2024 et projeter
      let actualValue = null;
      if (year === 2023) {
        actualValue = emissionsAnneePrecedente; // Année N-1
      } else if (year === 2024) {
        actualValue = emissionsReellesValue; // Année N (calculée)
      } else if (year <= currentYear) {
        // Projeter pour les années futures déjà passées
        actualValue = Math.round(emissionsReellesValue * Math.pow(0.935, year - 2024));
      }
      
      trajectory.push({
        year: year.toString(),
        target: Math.round(targetValue),
        actual: actualValue
      });
    }
    
    return trajectory;
  };

  const sbtTrajectory = getSbtTrajectory();

  // Données dynamiques pour le benchmark sectoriel connectées au calculateur
  const getSectorBenchmark = () => {
    // Récupérer les valeurs saisies dans le calculateur
    const moyenneSectorielle = localStorage.getItem('calculator-moyenne-sectorielle');
    const leadersSecteur = localStorage.getItem('calculator-leaders-secteur');
    const positionClassement = localStorage.getItem('calculator-position-classement');
    
    // Parser les valeurs ou utiliser des valeurs par défaut
    const moyenneValue = moyenneSectorielle ? JSON.parse(moyenneSectorielle) : 0;
    const leadersValue = leadersSecteur ? JSON.parse(leadersSecteur) : 0;
    const positionValue = positionClassement ? JSON.parse(positionClassement) : 0;

    const companyValue = hasData ? emissionsEmploye : 0;

    return [
      { 
        category: "Votre entreprise", 
        value: parseFloat(companyValue.toFixed(2)), 
        color: "#10b981", 
        rank: positionValue > 0 ? `${positionValue}ème` : "" 
      },
      { 
        category: "Moyenne sectorielle", 
        value: parseFloat(moyenneValue.toFixed(2)), 
        color: "#f59e0b", 
        rank: "" 
      },
      { 
        category: "Leaders du secteur", 
        value: parseFloat(leadersValue.toFixed(2)), 
        color: "#3b82f6", 
        rank: "" 
      }
    ];
  };

  const sectorBenchmark = getSectorBenchmark();

  // Suppression des fonctions KPI car les valeurs sont maintenant calculées automatiquement

  // Fonction de gestion des filtres
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Ici vous pourriez implémenter la logique de filtrage des données
    toast({
      title: t("dashboard.filters_applied"),
      description: t("dashboard.dashboard_updated"),
    });
  };

  // Export CSV complet avec toutes les données du dashboard
  const exportCompleteCSV = () => {
    const emissionsByCategory = getFilteredEmissionsByPost();
    const monthlyTrend = getMonthlyTrend();
    const categoryScopeData = getCategoryScopeData();
    const sbtTrajectory = getSbtTrajectory();
    const sectorBenchmark = getSectorBenchmark();

    // Données principales
    const mainData = [
      ['=== INDICATEURS PRINCIPAUX ==='],
      ['Indicateur', 'Valeur', 'Unité'],
      ['Émissions Scope 1', (displayEmissions.scope1 / 1000).toFixed(2), 'tCO2e'],
      ['Émissions Scope 2', (displayEmissions.scope2 / 1000).toFixed(2), 'tCO2e'],
      ['Émissions Scope 3', (displayEmissions.scope3 / 1000).toFixed(2), 'tCO2e'],
      ['Total Émissions', (displayEmissions.total / 1000).toFixed(2), 'tCO2e'],
      ['Réduction Annuelle', reductionAnnuelle.toFixed(1), '%'],
      ['Intensité Carbone', intensiteCarbone.toFixed(2), 'kgCO2e/k€'],
      ['Objectif SBTi', objectifSBTI, 'tCO2e'],
      ['Chiffre d\'affaires', chiffreAffaires, 'k€'],
      [''],
      
      // Émissions par catégorie
      ['=== ÉMISSIONS PAR CATÉGORIE ==='],
      ['Catégorie', 'Émissions (tCO2e)', 'Pourcentage (%)'],
      ...emissionsByCategory.map(item => [
        item.name,
        (item.value).toFixed(2),
        item.percentage.toFixed(1)
      ]),
      [''],
      
      // Tendance mensuelle
      ['=== TENDANCE MENSUELLE ==='],
      ['Mois', 'Émissions (tCO2e)'],
      ...monthlyTrend.map(item => [item.month, (item.emissions).toFixed(2)]),
      [''],
      
      // Analyse par scope et catégorie
      ['=== ANALYSE PAR SCOPE ET CATÉGORIE ==='],
      ['Catégorie', 'Scope 1', 'Scope 2', 'Scope 3', 'Total'],
      ...categoryScopeData.map(item => [
        item.category,
        item.scope1.toFixed(2),
        item.scope2.toFixed(2),
        item.scope3.toFixed(2),
        (item.scope1 + item.scope2 + item.scope3).toFixed(2)
      ]),
      [''],
      
      // Trajectoire SBTi
      ['=== TRAJECTOIRE SBTI ==='],
      ['Année', 'Objectif (tCO2e)', 'Réalisé (tCO2e)', 'Écart (%)'],
      ...sbtTrajectory.map(item => [
        item.year,
        item.target.toFixed(2),
        item.actual ? item.actual.toFixed(2) : 'N/A',
        'N/A'
      ]),
      [''],
      
      // Benchmark sectoriel
      ['=== BENCHMARK SECTORIEL ==='],
      ['Indicateur', 'Valeur'],
      ...sectorBenchmark.map(item => [item.category, item.value.toFixed(2) + ' tCO2e'])
    ];

    const csvContent = mainData.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_carbone_complet_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export CSV réussi",
      description: "Toutes les données du dashboard ont été exportées.",
    });
  };

  const exportCSV = () => {
    const csvData = [
      ['Dashboard Carbone - Export', format(new Date(), 'dd/MM/yyyy')],
      [''],
      ['=== INDICATEURS CLÉS ==='],
      ['Émissions totales', hasData ? currentEmissions.toFixed(1) : '0', 'tCO2e'],
      ['Réduction annuelle', reductionAnnuelle, 'tCO2e'],
      ['Objectif SBTi', objectifSBTI, '%'],
      ['Intensité carbone', intensiteCarbone, 'tCO2e/k€'],
      ['Émissions/employé', emissionsEmploye, 'tCO2e/pers'],
      ['Conformité réglementaire', conformiteReglementaire, '%'],
      [''],
      ['=== RÉPARTITION PAR POSTE ==='],
      ['Poste', 'Pourcentage', 'Valeur'],
      ...emissionsByPost.map(item => [item.name, `${item.percentage}%`, `${item.value}`]),
      [''],
      ['=== DONNÉES CALCULATEUR ==='],
      ['Nombre de personnels', nombrePersonnels, 'pers.'],
      ['Émissions année précédente', emissionsAnneePrecedente, 'tCO2e'],
      ['Objectif SBTi', objectifSBTI, 'tCO2e'],
      ['Chiffre d\'affaires', chiffreAffaires, 'k€']
    ];

    const csvContent = csvData.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_carbone_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction de partage du dashboard
  const handleShare = async () => {
    const shareData = {
      title: "Dashboard Carbone - Rapport d'Émissions GES",
      text: `Émissions totales: ${hasData ? currentEmissions.toFixed(0) : '4,200'} tCO2e | Réduction: ${hasData ? pourcentageReduction.toFixed(1) : '16.3'}% vs année précédente`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: t("dashboard.share_success"),
          description: t("dashboard.share_success_desc"),
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          fallbackShare(shareData);
        }
      }
    } else {
      fallbackShare(shareData);
    }
  };

  // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
  const fallbackShare = (shareData: any) => {
    if (navigator.clipboard) {
      const textToShare = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(textToShare).then(() => {
        toast({
          title: t("dashboard.link_copied"),
          description: t("dashboard.link_copied_desc"),
        });
      }).catch(() => {
        showShareOptions(shareData);
      });
    } else {
      showShareOptions(shareData);
    }
  };

  // Afficher les options de partage manuel
  const showShareOptions = (shareData: any) => {
    const emailSubject = encodeURIComponent(shareData.title);
    const emailBody = encodeURIComponent(`${shareData.text}\n\nConsultez le dashboard: ${shareData.url}`);
    
    // Ouvrir par email par défaut
    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank');
    
    toast({
      title: t("dashboard.share_options"),
      description: t("dashboard.share_options_desc"),
    });
  };

  // Génération rapide du PDF sectoriel (bouton "Rapport détaillé sectoriel")
  const handleSectorReport = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rapport détaillé sectoriel', pageWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });

      let y = 45;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Indicateurs clés', 20, y);
      y += 10;

      pdf.setFont('helvetica', 'normal');
      sectorBenchmark.forEach((item) => {
        const rankText = item.rank ? ` (${item.rank})` : '';
        pdf.text(`• ${item.category}: ${item.value.toFixed(2)} tCO2e/pers${rankText}`, 25, y);
        y += 8;
      });

      const filename = `rapport_sectoriel_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: t("dashboard.sector_report_generated"),
        description: t("dashboard.pdf_download_started"),
      });
    } catch (e) {
      console.error('Erreur rapport sectoriel:', e);
      toast({
        title: t("common.error"),
        description: t("dashboard.error_generating_report"),
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border/40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <ExpertPDFExportButton />
              <Button variant="outline" size="sm" onClick={() => exportCompleteData()}>
                <Download className="w-4 h-4 mr-2" />
                {t("dashboard.export_csv_complete")}
              </Button>
              <CompletePDFReport
                emissionsData={{
                  scope1: displayEmissions.scope1,
                  scope2: displayEmissions.scope2,
                  scope3: displayEmissions.scope3,
                  total: displayEmissions.total,
                  reductionAnnuelle,
                  intensiteCarbone
                }}
                emissionsByCategory={getFilteredEmissionsByPost()}
                monthlyTrend={getMonthlyTrend()}
                categoryScopeData={getCategoryScopeData()}
                sbtTrajectory={getSbtTrajectory()}
                sectorBenchmark={{
                  average: sectorBenchmark[1]?.value || 0,
                  leaders: sectorBenchmark[2]?.value || 0,
                  company: sectorBenchmark[0]?.value || 0
                }}
               />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Émissions totales */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">{t("dashboard.total_emissions")}</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {hasData ? currentEmissions.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "4,200"} <span className="text-lg">tCO2e</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {emissionsChangePercent > 0 ? (
                      <ArrowUp className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={(emissionsChangePercent > 0 ? "text-primary" : "text-destructive") + " font-medium"}>
                      {Math.abs(emissionsChangePercent).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.total_emissions_period")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Réduction annuelle */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">{t("dashboard.annual_reduction")}</span>
                  </div>
                   <div className="text-3xl font-bold text-foreground mb-1">
                     {hasData ? reductionAnnuelle.toFixed(0) : "600"} <span className="text-lg">tCO2e</span>
                   </div>
                   <div className="flex items-center gap-1 text-sm">
                     {(hasData ? pourcentageReduction : 16.3) >= 0 ? (
                       <ArrowUp className="w-4 h-4 text-primary" />
                     ) : (
                       <ArrowDown className="w-4 h-4 text-destructive" />
                     )}
                     <span className={((hasData ? pourcentageReduction : 16.3) >= 0 ? "text-primary" : "text-destructive") + " font-medium"}>
                       {(hasData ? Math.abs(pourcentageReduction).toFixed(1) : "16.3")}%
                     </span>
                   </div>
                   <div className="text-xs text-muted-foreground mt-1">
                     {t("dashboard.reduction_vs_previous")}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Objectif SBTi */}
           <Card className="border-0 shadow-sm">
             <CardContent className="p-6">
               <div className="flex items-start justify-between">
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <span className="text-sm font-medium text-muted-foreground">{t("dashboard.sbt_target")}</span>
                   </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {hasData && objectifsSBTParAnnee[2024] ? objectifsSBTParAnnee[2024].toFixed(0) : "87"} <span className="text-lg">tCO2e</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {(hasData ? progressionSBTi : 8.7) >= 0 ? (
                        <ArrowUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={((hasData ? progressionSBTi : 8.7) >= 0 ? "text-primary" : "text-destructive") + " font-medium"}>
                        {(hasData ? Math.abs(progressionSBTi).toFixed(1) : "8.7")}%
                      </span>
                    </div>
                 </div>
               </div>
             </CardContent>
           </Card>

          {/* Intensité carbone */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">{t("dashboard.carbon_intensity")}</span>
                  </div>
                   <div className="text-3xl font-bold text-destructive mb-1">
                     {hasData ? intensiteCarbone.toFixed(1) : "1.2"} <span className="text-lg">tCO2e/k€</span>
                   </div>
                  <div className="flex items-center gap-1 text-sm">
                    {intensiteChangePercent > 0 ? (
                      <ArrowUp className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={(intensiteChangePercent > 0 ? "text-primary" : "text-destructive") + " font-medium"}>
                      {Math.abs(intensiteChangePercent).toFixed(1)}%
                    </span>
                  </div>
                   <div className="text-xs text-muted-foreground mt-1">
                     {t("dashboard.emissions_per_revenue")}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Émissions/employé */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">{t("dashboard.emissions_per_employee")}</span>
                  </div>
                   <div className="text-3xl font-bold text-foreground mb-1">
                     {hasData ? emissionsEmploye.toFixed(1) : "8.4"} <span className="text-lg">tCO2e/pers</span>
                   </div>
                  <div className="flex items-center gap-1 text-sm">
                    {emissionsEmployeChangePercent > 0 ? (
                      <ArrowUp className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={(emissionsEmployeChangePercent > 0 ? "text-primary" : "text-destructive") + " font-medium"}>
                      {Math.abs(emissionsEmployeChangePercent).toFixed(1)}%
                    </span>
                  </div>
                   <div className="text-xs text-muted-foreground mt-1">
                     {t("dashboard.carbon_intensity_employee")}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conformité réglementaire - Score basé sur la complétude des catégories */}
          <ComplianceScoreWidget />
        </div>

        {/* Graphiques principaux avec Drill-Down */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par Scope avec Drill-Down */}
          <DrillDownPieChart
            data={drillDownPieData}
            title={t("dashboard.emissions_by_source")}
          />

          {/* Analyse Comparative Sectorielle */}
          <SectorComparativeAnalysis 
            totalEmissions={displayEmissions.total}
            annualRevenue={chiffreAffaires}
          />
        </div>

        {/* Section inférieure - Vue d'ensemble */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analyse par Catégorie et Scope avec Drill-Down */}
          <DrillDownBarChart
            data={drillDownBarData}
            title={t("dashboard.category_scope_analysis")}
          />

          {/* Répartition par Scope GES */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t("dashboard.scope_breakdown")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Scope 1 - Émissions directes
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Combustibles, véhicules, réfrigérants
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{hasData ? (displayEmissions.scope1 / 1000).toFixed(1) : '1,200'} tCO2e</div>
                      <div className="text-xs text-muted-foreground">
                        {hasData ? ((displayEmissions.scope1 / displayEmissions.total) * 100).toFixed(1) : '28.6'}%
                      </div>
                    </div>
                  </div>
                  <Progress value={hasData ? (displayEmissions.scope1 / displayEmissions.total) * 100 : 28.6} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        Scope 2 - Énergie indirecte
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Électricité, vapeur, chauffage
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{hasData ? (displayEmissions.scope2 / 1000).toFixed(1) : '800'} tCO2e</div>
                      <div className="text-xs text-muted-foreground">
                        {hasData ? ((displayEmissions.scope2 / displayEmissions.total) * 100).toFixed(1) : '19.0'}%
                      </div>
                    </div>
                  </div>
                  <Progress value={hasData ? (displayEmissions.scope2 / displayEmissions.total) * 100 : 19.0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Scope 3 - Autres indirectes
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Transport, achats, déchets, numérique
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{hasData ? (displayEmissions.scope3 / 1000).toFixed(1) : '2,200'} tCO2e</div>
                      <div className="text-xs text-muted-foreground">
                        {hasData ? ((displayEmissions.scope3 / displayEmissions.total) * 100).toFixed(1) : '52.4'}%
                      </div>
                    </div>
                  </div>
                  <Progress value={hasData ? (displayEmissions.scope3 / displayEmissions.total) * 100 : 52.4} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section finale - Trajectoire et Benchmark */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trajectoire Science Based Targets */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t("dashboard.sbt_trajectory")}
                <div className="flex gap-1 ml-auto">
                  <Badge variant="secondary" className="text-xs">En avance</Badge>
                  <Badge variant="outline" className="text-xs">4.2% vs objectif</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sbtTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Objectifs SBT"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Émissions réelles"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

           {/* Benchmark Sectoriel */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                {t("dashboard.sector_benchmark")}
                <Badge variant="default" className="ml-auto text-lg font-bold">{sectorBenchmark[0]?.rank}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{sectorBenchmark[0]?.rank}</div>
                  <div className="text-sm text-muted-foreground">position sur 500 entreprises</div>
                  <div className="text-sm font-medium text-green-600">Performance above average</div>
                </div>
                
                <div className="space-y-4">
                  {sectorBenchmark.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.value} tCO2e/pers</div>
                        {item.rank && <div className="text-xs text-muted-foreground">{item.rank}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={handleSectorReport}>
                  <FileText className="w-4 h-4 mr-2" />
                  Rapport détaillé sectoriel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan d'Actions Carbone */}
        <CarbonActionsTracking />
      </div>
    </div>
  );
};
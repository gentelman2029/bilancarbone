import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Download, RotateCcw, Factory, Zap, Building, Save, CheckCircle2, Sparkles, FileText, Flame, Globe } from "lucide-react";
import { useEmissions } from '@/contexts/EmissionsContext';
import { useCarbonReports } from '@/hooks/useCarbonReports';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useCalculationDetails, CalculationDetail } from '@/hooks/useCalculationDetails';
import { CalculationDetailsSection } from '@/components/CalculationDetailsSection';
import { Scope3AdvancedModule } from '@/components/scope3/Scope3AdvancedModule';
import { ScopeDetailModal } from '@/components/ScopeDetailModal';
import { GHGDashboardHeader } from '@/components/ghg/GHGDashboardHeader';
import { Scope1Form } from '@/components/ghg/Scope1Form';
import { Scope2Form } from '@/components/ghg/Scope2Form';
import { Scope3StandardForm } from '@/components/ghg/Scope3StandardForm';
import { CompanyDataSection } from '@/components/ghg/CompanyDataSection';
import { baseCarbone, getEmissionFactor } from '@/lib/ghg/emissionFactors';
import { safeGetJSON, safeSetJSON, safeRemove } from '@/lib/ghg/safeStorage';
import { validateQuantity } from '@/lib/ghg/unitConverter';

// ============================================================
// SOURCE DE VÉRITÉ UNIQUE: sectionDetails (useCalculationDetails)
// L'ancien état `calculations` est supprimé.
// Tous les totaux sont dérivés de sectionDetails.
// ============================================================

export const AdvancedGHGCalculator = () => {
  const { toast } = useToast();
  const { updateEmissions } = useEmissions();
  const { createReport } = useCarbonReports();
  const [activeTab, setActiveTab] = useState("scope1");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(() => safeGetJSON('calculator-advanced-mode', false));

  // Modale de détail des scopes
  const [openScopeModal, setOpenScopeModal] = useState<1 | 2 | 3 | null>(null);

  // ============================================================
  // SOURCE UNIQUE: useCalculationDetails
  // ============================================================
  const {
    sectionDetails,
    setSectionDetails,
    addCalculationDetail,
    removeCalculationDetail,
    clearSectionDetails,
    clearAllDetails,
  } = useCalculationDetails();

  // ============================================================
  // Scope 3 avancé: callback au lieu de polling localStorage
  // ============================================================
  const [scope3AdvancedTotal, setScope3AdvancedTotal] = useState(() => {
    const calcs = safeGetJSON<any[]>('scope3-advanced-calculations', []);
    return calcs.reduce((sum, c) => sum + (c.emissions || 0), 0);
  });

  // Sync Scope 3 avancé depuis localStorage (pour changements cross-tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const calcs = safeGetJSON<any[]>('scope3-advanced-calculations', []);
      const newTotal = calcs.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0);
      setScope3AdvancedTotal(newTotal);
    };

    window.addEventListener('storage', handleStorageChange);
    // Polling réduit à 1s (fallback pour même tab)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // Formulaires avec persistance sécurisée
  // ============================================================
  const [scope1Data, setScope1Data] = useState(() => safeGetJSON('calculator-scope1', {
    combustibleType: "", combustibleQuantity: "", combustibleUnit: "kg",
    refrigerantType: "", refrigerantQuantity: "", refrigerantUnit: "kg",
    vehiculeType: "", vehiculeQuantity: "", vehiculeUnit: "km"
  }));

  const [scope2Data, setScope2Data] = useState(() => safeGetJSON('calculator-scope2', {
    electriciteType: "", electriciteQuantity: "", electriciteUnit: "kWh",
    vapeurType: "", vapeurQuantity: "", vapeurUnit: "kWh"
  }));

  const [scope3Data, setScope3Data] = useState(() => safeGetJSON('calculator-scope3', {
    transportType: "", transportQuantity: "", materiauType: "", materiauQuantity: "",
    dechetType: "", dechetQuantity: "", alimentationType: "", alimentationQuantity: "",
    numeriqueType: "", numeriqueQuantity: ""
  }));

  // Données d'entreprise
  const [companyData, setCompanyData] = useState(() => safeGetJSON('calculator-company-data', {
    chiffreAffaires: 1000,
    nombrePersonnels: 50,
    emissionsAnneePrecedente: 0,
    objectifSBTI: 0,
    objectifsSBTParAnnee: {} as Record<string, number>,
    emissionsReelles: 0,
    moyenneSectorielle: 0,
    leadersSecteur: 0,
    positionClassement: 0,
    benchmarkSectorName: '',
    benchmarkSectorAverage: 0,
    benchmarkSectorTop10: 0,
    benchmarkSectorCritical: 0,
  }));

  // ============================================================
  // Auth check
  // ============================================================
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuthenticated(!!user));
  }, []);

  // ============================================================
  // Persistence - formulaires
  // ============================================================
  useEffect(() => { safeSetJSON('calculator-advanced-mode', isAdvancedMode); }, [isAdvancedMode]);
  useEffect(() => { safeSetJSON('calculator-scope1', scope1Data); }, [scope1Data]);
  useEffect(() => { safeSetJSON('calculator-scope2', scope2Data); }, [scope2Data]);
  useEffect(() => { safeSetJSON('calculator-scope3', scope3Data); }, [scope3Data]);

  // Persistence - données d'entreprise + sync contexte
  useEffect(() => {
    safeSetJSON('calculator-company-data', companyData);
    // Also write individual keys for backward compat with other modules
    safeSetJSON('calculator-chiffre-affaires', companyData.chiffreAffaires);
    safeSetJSON('calculator-nombre-personnels', companyData.nombrePersonnels);
    safeSetJSON('calculator-emissions-annee-precedente', companyData.emissionsAnneePrecedente);
    safeSetJSON('calculator-objectif-sbti', companyData.objectifSBTI);
    safeSetJSON('calculator-objectifs-sbt-par-annee', companyData.objectifsSBTParAnnee);
    safeSetJSON('calculator-emissions-reelles', companyData.emissionsReelles);
    safeSetJSON('calculator-moyenne-sectorielle', companyData.moyenneSectorielle);
    safeSetJSON('calculator-leaders-secteur', companyData.leadersSecteur);
    safeSetJSON('calculator-position-classement', companyData.positionClassement);
    safeSetJSON('calculator-benchmark-sector-name', companyData.benchmarkSectorName);
    safeSetJSON('calculator-benchmark-sector-average', companyData.benchmarkSectorAverage);
    safeSetJSON('calculator-benchmark-sector-top10', companyData.benchmarkSectorTop10);
    safeSetJSON('calculator-benchmark-sector-critical', companyData.benchmarkSectorCritical);

    updateEmissions({
      chiffreAffaires: companyData.chiffreAffaires,
      nombrePersonnels: companyData.nombrePersonnels,
      emissionsAnneePrecedente: companyData.emissionsAnneePrecedente,
      objectifSBTI: companyData.objectifSBTI,
      objectifsSBTParAnnee: companyData.objectifsSBTParAnnee,
      emissionsReelles: companyData.emissionsReelles,
      moyenneSectorielle: companyData.moyenneSectorielle,
      leadersSecteur: companyData.leadersSecteur,
      positionClassement: companyData.positionClassement,
      benchmarkSectorName: companyData.benchmarkSectorName,
      benchmarkSectorAverage: companyData.benchmarkSectorAverage,
      benchmarkSectorTop10: companyData.benchmarkSectorTop10,
      benchmarkSectorCritical: companyData.benchmarkSectorCritical,
    });
  }, [companyData, updateEmissions]);

  // ============================================================
  // CALCUL DES TOTAUX (source unique: sectionDetails)
  // ============================================================
  const scope1Total = useMemo(
    () => sectionDetails.scope1.reduce((sum, d) => sum + d.emissions, 0),
    [sectionDetails.scope1]
  );

  const scope2Total = useMemo(
    () => sectionDetails.scope2.reduce((sum, d) => sum + d.emissions, 0),
    [sectionDetails.scope2]
  );

  const scope3StandardTotal = useMemo(
    () => sectionDetails.scope3.reduce((sum, d) => sum + d.emissions, 0),
    [sectionDetails.scope3]
  );

  const scope3TotalWithAdvanced = useMemo(
    () => scope3StandardTotal + (isAdvancedMode ? scope3AdvancedTotal : 0),
    [scope3StandardTotal, scope3AdvancedTotal, isAdvancedMode]
  );

  const totalGlobal = scope1Total + scope2Total + scope3TotalWithAdvanced;

  // Count total entries for display
  const totalEntries = sectionDetails.scope1.length + sectionDetails.scope2.length + sectionDetails.scope3.length;

  // ============================================================
  // Sync totaux → EmissionsContext
  // ============================================================
  useEffect(() => {
    updateEmissions({
      scope1: scope1Total,
      scope2: scope2Total,
      scope3: scope3TotalWithAdvanced,
    });
  }, [scope1Total, scope2Total, scope3TotalWithAdvanced, updateEmissions]);

  // ============================================================
  // AJOUT DE CALCUL (source unique: sectionDetails)
  // ============================================================
  const addCalculation = useCallback((scope: string, category: string, subcategory: string, quantity: number) => {
    const validated = validateQuantity(quantity);
    if (validated === null || validated === 0) {
      toast({ title: "Quantité invalide", description: "La quantité doit être un nombre positif", variant: "destructive" });
      return;
    }

    const factor = getEmissionFactor(scope, category, subcategory);
    if (!factor) {
      toast({ title: "Facteur introuvable", description: `Aucun facteur d'émission pour ${subcategory}`, variant: "destructive" });
      return;
    }

    const emissions = validated * factor.facteur;

    addCalculationDetail(scope as 'scope1' | 'scope2' | 'scope3', {
      type: category,
      description: factor.description,
      quantity: validated,
      unit: factor.unite,
      emissionFactor: factor.facteur,
      emissions,
      formuleDetail: `${validated} ${factor.unite} × ${factor.facteur} kg CO₂e/${factor.unite} = ${emissions.toFixed(2)} kg CO₂e`
    });

    toast({
      title: "Calcul ajouté ✅",
      description: `${emissions.toFixed(2)} kg CO₂e ajoutés au ${scope.toUpperCase()}`,
    });
  }, [addCalculationDetail, toast]);

  // ============================================================
  // SCOPE ENTRIES pour les modales
  // ============================================================
  const getScopeEntries = useCallback((scopeNumber: 1 | 2 | 3) => {
    const scopeKey = `scope${scopeNumber}` as keyof typeof sectionDetails;
    const details = sectionDetails[scopeKey];

    const entriesFromDetails = details.map(detail => ({
      id: detail.id,
      source: detail.description,
      quantity: detail.quantity,
      unit: detail.unit,
      emissionFactor: detail.emissionFactor,
      total: detail.emissions
    }));

    // Pour Scope 3, ajouter les calculs du module avancé
    if (scopeNumber === 3 && isAdvancedMode) {
      const advancedCalcs = safeGetJSON<any[]>('scope3-advanced-calculations', []);
      const entriesFromAdvanced = advancedCalcs.map((calc: any) => {
        const quantity = calc.quantity || 0;
        const emissions = calc.emissions || 0;
        const factor = quantity > 0 ? emissions / quantity : 0;
        return {
          id: calc.id || `scope3-adv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: `${calc.categoryName || 'Catégorie'} - ${calc.subcategoryName || 'Calcul avancé'}`,
          quantity, unit: calc.unit || 'unités', emissionFactor: factor, total: emissions
        };
      });
      return [...entriesFromDetails, ...entriesFromAdvanced];
    }

    return entriesFromDetails;
  }, [sectionDetails, isAdvancedMode]);

  // ============================================================
  // HANDLER: mise à jour depuis la modale
  // ============================================================
  const handleScopeEntriesChange = useCallback((scopeNumber: 1 | 2 | 3, entries: { id: string; source: string; quantity: number; unit: string; emissionFactor: number; total: number }[]) => {
    const scopeKey = `scope${scopeNumber}` as 'scope1' | 'scope2' | 'scope3';

    const isAdvancedEntry = (entry: { id: string }) => entry.id.startsWith('scope3-adv-');

    let standardEntries = entries;
    let advancedEntries: typeof entries = [];

    if (scopeNumber === 3 && isAdvancedMode) {
      standardEntries = entries.filter(e => !isAdvancedEntry(e));
      advancedEntries = entries.filter(e => isAdvancedEntry(e));
    }

    // Sync standard entries → sectionDetails
    const newDetails = standardEntries.map(entry => ({
      id: entry.id,
      type: entry.source.toLowerCase().replace(/\s+/g, '-'),
      description: entry.source,
      quantity: entry.quantity,
      unit: entry.unit,
      emissionFactor: entry.emissionFactor,
      emissions: entry.total,
      timestamp: new Date().toLocaleString('fr-FR'),
      formuleDetail: `${entry.quantity} ${entry.unit} × ${entry.emissionFactor} kg CO₂e/${entry.unit}`
    }));

    setSectionDetails(scopeKey, newDetails);

    // Sync advanced Scope3 entries → localStorage
    if (scopeNumber === 3 && isAdvancedMode) {
      const originalAdvanced = safeGetJSON<any[]>('scope3-advanced-calculations', []);
      const remainingIds = advancedEntries.map(e => e.id);
      const updatedAdvanced = originalAdvanced
        .filter((calc: any) => remainingIds.includes(calc.id))
        .map((calc: any) => {
          const match = advancedEntries.find(e => e.id === calc.id);
          return match ? { ...calc, quantity: match.quantity, emissions: match.total } : calc;
        });
      safeSetJSON('scope3-advanced-calculations', updatedAdvanced);
      setScope3AdvancedTotal(updatedAdvanced.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0));
    }
  }, [setSectionDetails, isAdvancedMode]);

  // ============================================================
  // RESET
  // ============================================================
  const resetCalculations = useCallback(() => {
    safeRemove('calculator-scope1');
    safeRemove('calculator-scope2');
    safeRemove('calculator-scope3');

    setScope1Data({
      combustibleType: "", combustibleQuantity: "", combustibleUnit: "kg",
      refrigerantType: "", refrigerantQuantity: "", refrigerantUnit: "kg",
      vehiculeType: "", vehiculeQuantity: "", vehiculeUnit: "km"
    });
    setScope2Data({
      electriciteType: "", electriciteQuantity: "", electriciteUnit: "kWh",
      vapeurType: "", vapeurQuantity: "", vapeurUnit: "kWh"
    });
    setScope3Data({
      transportType: "", transportQuantity: "", materiauType: "", materiauQuantity: "",
      dechetType: "", dechetQuantity: "", alimentationType: "", alimentationQuantity: "",
      numeriqueType: "", numeriqueQuantity: ""
    });

    clearAllDetails();
    updateEmissions({ scope1: 0, scope2: 0, scope3: 0 });

    toast({ title: "Calculs réinitialisés ✅", description: "Tous les calculs et détails ont été supprimés" });
  }, [clearAllDetails, updateEmissions, toast]);

  // ============================================================
  // SAUVEGARDE DB
  // ============================================================
  const saveToDatabase = useCallback(async () => {
    if (!isAuthenticated) {
      toast({ title: "Authentification requise", description: "Connectez-vous pour sauvegarder", variant: "destructive" });
      return;
    }
    if (totalEntries === 0) {
      toast({ title: "Aucun calcul", description: "Ajoutez au moins un calcul avant de sauvegarder", variant: "destructive" });
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data: calculationData, error: calcError } = await supabase
        .from('emissions_calculations')
        .insert({
          user_id: user.id,
          scope1: scope1Total,
          scope2: scope2Total,
          scope3: scope3TotalWithAdvanced,
          total: totalGlobal,
          carbon_intensity: totalGlobal / 1000 / companyData.chiffreAffaires,
          calculation_data: JSON.stringify({
            chiffre_affaires: companyData.chiffreAffaires,
            nombre_personnels: companyData.nombrePersonnels,
            emissions_annee_precedente: companyData.emissionsAnneePrecedente,
            objectif_sbti: companyData.objectifSBTI,
          }) as any
        })
        .select()
        .single();

      if (calcError) throw calcError;

      await createReport({
        report_name: `Bilan Carbone ${new Date().toLocaleDateString('fr-FR')}`,
        period: `Année ${new Date().getFullYear()}`,
        total_co2e: totalGlobal / 1000,
        scope1_total: scope1Total / 1000,
        scope2_total: scope2Total / 1000,
        scope3_total: scope3TotalWithAdvanced / 1000,
        carbon_intensity: totalGlobal / 1000 / companyData.chiffreAffaires,
        company_info: {
          chiffre_affaires: companyData.chiffreAffaires,
          nombre_personnels: companyData.nombrePersonnels,
          emissions_annee_precedente: companyData.emissionsAnneePrecedente,
          objectif_sbti: companyData.objectifSBTI,
          date_calcul: new Date().toISOString()
        },
        calculation_id: calculationData.id
      });

      toast({ title: "Données sauvegardées", description: "Vos calculs sont maintenant visibles sur le dashboard" });
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({ title: "Erreur de sauvegarde", description: error.message, variant: "destructive" });
    }
  }, [isAuthenticated, totalEntries, scope1Total, scope2Total, scope3TotalWithAdvanced, totalGlobal, companyData, createReport, toast]);

  // ============================================================
  // EXPORT CSV
  // ============================================================
  const exportToCSV = useCallback(() => {
    const allDetails = [
      ...sectionDetails.scope1.map(d => ({ ...d, scope: 'SCOPE1' })),
      ...sectionDetails.scope2.map(d => ({ ...d, scope: 'SCOPE2' })),
      ...sectionDetails.scope3.map(d => ({ ...d, scope: 'SCOPE3' })),
    ];

    const headers = ['Scope', 'Description', 'Quantité', 'Unité', "Facteur d'émission", 'Émissions (kg CO2e)'];
    const csvContent = [
      headers.join(','),
      ...allDetails.map(d => [
        d.scope, d.description, d.quantity, d.unit, d.emissionFactor, d.emissions.toFixed(3)
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bilan-carbone-detaille-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [sectionDetails]);

  // ============================================================
  // Scope 3 combined details (standard + avancé)
  // ============================================================
  const scope3CombinedDetails = useMemo((): CalculationDetail[] => {
    const standardDetails = sectionDetails.scope3;
    if (!isAdvancedMode) return standardDetails;

    const advancedCalcs = safeGetJSON<any[]>('scope3-advanced-calculations', []);
    const advancedDetails: CalculationDetail[] = advancedCalcs.map((calc: any) => ({
      id: calc.id || `scope3-adv-${Date.now()}-${Math.random()}`,
      type: 'ghg-protocol-advanced',
      description: `${calc.categoryName || 'Catégorie'} - ${calc.subcategoryName || 'Calcul avancé'}`,
      quantity: calc.quantity || 0,
      unit: calc.unit || 'unités',
      emissionFactor: calc.quantity > 0 ? (calc.emissions / calc.quantity) : 0,
      emissions: calc.emissions || 0,
      timestamp: new Date().toLocaleString('fr-FR'),
      formuleDetail: `${calc.quantity || 0} ${calc.unit || 'unités'} × ${calc.quantity > 0 ? (calc.emissions / calc.quantity).toFixed(4) : 0} kg CO₂e/${calc.unit || 'unités'}`
    }));
    return [...standardDetails, ...advancedDetails];
  }, [sectionDetails.scope3, isAdvancedMode, scope3AdvancedTotal]);

  const hasAnyData = totalEntries > 0 || (isAdvancedMode && scope3AdvancedTotal > 0);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard Global */}
      <GHGDashboardHeader
        scope1={scope1Total}
        scope2={scope2Total}
        scope3Total={scope3TotalWithAdvanced}
        totalGlobal={totalGlobal}
        chiffreAffaires={companyData.chiffreAffaires}
        nombrePersonnels={companyData.nombrePersonnels}
        emissionsAnneePrecedente={companyData.emissionsAnneePrecedente}
        isAdvancedMode={isAdvancedMode}
        onChiffreAffairesChange={(v) => setCompanyData(prev => ({ ...prev, chiffreAffaires: v }))}
        onScopeClick={setOpenScopeModal}
      />

      {/* Header with mode toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Calculateur GES {isAdvancedMode ? 'Avancé' : 'Standard'} - Base Carbone® ADEME
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isAdvancedMode
              ? 'Calculateur expert avec 15 catégories Scope 3 conformes au GHG Protocol.'
              : 'Calculateur basé sur les facteurs d\'émissions officiels de la Base Carbone® ADEME.'}
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Standard</span>
          </div>
          <Switch checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Avancé</span>
          </div>
        </div>
      </div>

      {/* Company Data Section - visible when data exists */}
      {hasAnyData && (
        <CompanyDataSection
          data={companyData}
          totalGlobal={totalGlobal}
          onChange={(updates) => setCompanyData(prev => ({ ...prev, ...updates }))}
        />
      )}

      {/* Résumé des émissions par scope */}
      {hasAnyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Bilan Carbone par Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{(scope1Total / 1000).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Scope 1 (tCO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{(scope2Total / 1000).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Scope 2 (tCO2e)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{(scope3TotalWithAdvanced / 1000).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Scope 3 (tCO2e)</div>
                {isAdvancedMode && scope3AdvancedTotal > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">(incl. {(scope3AdvancedTotal / 1000).toFixed(1)}t avancé)</div>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{(totalGlobal / 1000).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Total (tCO2e)</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveToDatabase} variant="default" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isAuthenticated ? "Sauvegarder au Dashboard" : "Connexion requise"}
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
              <Button onClick={resetCalculations} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scope1" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />Scope 1
          </TabsTrigger>
          <TabsTrigger value="scope2" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />Scope 2
          </TabsTrigger>
          <TabsTrigger value="scope3" className="flex items-center gap-2">
            <Building className="h-4 w-4" />Scope 3
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />Détails calcul
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scope1" className="space-y-6">
          <Scope1Form
            data={scope1Data}
            onChange={(updates) => setScope1Data(prev => ({ ...prev, ...updates }))}
            onAddCalculation={addCalculation}
          />
        </TabsContent>

        <TabsContent value="scope2" className="space-y-6">
          <Scope2Form
            data={scope2Data}
            onChange={(updates) => setScope2Data(prev => ({ ...prev, ...updates }))}
            onAddCalculation={addCalculation}
          />
        </TabsContent>

        <TabsContent value="scope3" className="space-y-6">
          {isAdvancedMode ? (
            <Scope3AdvancedModule onTotalChange={setScope3AdvancedTotal} />
          ) : (
            <Scope3StandardForm
              data={scope3Data}
              onChange={(updates) => setScope3Data(prev => ({ ...prev, ...updates }))}
              onAddCalculation={addCalculation}
              onEnableAdvanced={() => setIsAdvancedMode(true)}
            />
          )}
        </TabsContent>

        {/* Détails de calcul */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Détail des Calculs - Année 2025
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    <Calculator className="h-3 w-3 mr-1" />
                    {totalEntries + (isAdvancedMode ? safeGetJSON<any[]>('scope3-advanced-calculations', []).length : 0)} calcul(s)
                  </Badge>
                  <Button onClick={resetCalculations} variant="outline" size="sm" className="h-8" disabled={!hasAnyData}>
                    <RotateCcw className="h-4 w-4 mr-1" />Réinitialiser tout
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Résumé des totaux */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center border-r border-border/50">
                  <div className="text-sm text-muted-foreground">Scope 1</div>
                  <div className="text-xl font-bold text-red-600">{(scope1Total / 1000).toFixed(2)} tCO₂e</div>
                </div>
                <div className="text-center border-r border-border/50">
                  <div className="text-sm text-muted-foreground">Scope 2</div>
                  <div className="text-xl font-bold text-amber-600">{(scope2Total / 1000).toFixed(2)} tCO₂e</div>
                </div>
                <div className="text-center border-r border-border/50">
                  <div className="text-sm text-muted-foreground">Scope 3</div>
                  <div className="text-xl font-bold text-blue-600">{(scope3TotalWithAdvanced / 1000).toFixed(2)} tCO₂e</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">TOTAL</div>
                  <div className="text-xl font-bold text-primary">{(totalGlobal / 1000).toFixed(2)} tCO₂e</div>
                </div>
              </div>

              {/* Sections de détails par scope */}
              <div className="space-y-6">
                <CalculationDetailsSection
                  title="Scope 1 - Émissions Directes"
                  icon={<Flame className="h-5 w-5 text-red-500" />}
                  details={sectionDetails.scope1}
                  sectionColor="destructive"
                  onRemoveDetail={(id) => removeCalculationDetail('scope1', id)}
                  onClearSection={() => clearSectionDetails('scope1')}
                />
                <CalculationDetailsSection
                  title="Scope 2 - Émissions Indirectes Énergie"
                  icon={<Zap className="h-5 w-5 text-amber-500" />}
                  details={sectionDetails.scope2}
                  sectionColor="default"
                  onRemoveDetail={(id) => removeCalculationDetail('scope2', id)}
                  onClearSection={() => clearSectionDetails('scope2')}
                />
                <CalculationDetailsSection
                  title="Scope 3 - Autres Émissions Indirectes"
                  icon={<Globe className="h-5 w-5 text-blue-500" />}
                  details={scope3CombinedDetails}
                  sectionColor="secondary"
                  onRemoveDetail={(detailId) => {
                    if (detailId.startsWith('scope3-adv-')) {
                      const advancedCalcs = safeGetJSON<any[]>('scope3-advanced-calculations', []);
                      const filtered = advancedCalcs.filter((calc: any) => calc.id !== detailId);
                      safeSetJSON('scope3-advanced-calculations', filtered);
                      setScope3AdvancedTotal(filtered.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0));
                      window.dispatchEvent(new Event('storage'));
                    }
                    removeCalculationDetail('scope3', detailId);
                  }}
                  onClearSection={() => {
                    clearSectionDetails('scope3');
                    if (isAdvancedMode) {
                      safeSetJSON('scope3-advanced-calculations', []);
                      setScope3AdvancedTotal(0);
                      window.dispatchEvent(new Event('storage'));
                    }
                  }}
                />

                {!hasAnyData && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucun calcul enregistré</p>
                    <p className="text-sm">Ajoutez des données dans les onglets Scope 1, 2 ou 3 pour voir les détails ici</p>
                  </div>
                )}
              </div>

              {/* Actions d'export */}
              {hasAnyData && (
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Button onClick={saveToDatabase} variant="default">
                    <Save className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Sauvegarder au Dashboard" : "Connexion requise"}
                  </Button>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales de détail des scopes */}
      <ScopeDetailModal
        isOpen={openScopeModal === 1}
        onClose={() => setOpenScopeModal(null)}
        scopeNumber={1}
        scopeTitle="Scope 1"
        entries={getScopeEntries(1)}
        onEntriesChange={(entries) => handleScopeEntriesChange(1, entries)}
      />
      <ScopeDetailModal
        isOpen={openScopeModal === 2}
        onClose={() => setOpenScopeModal(null)}
        scopeNumber={2}
        scopeTitle="Scope 2"
        entries={getScopeEntries(2)}
        onEntriesChange={(entries) => handleScopeEntriesChange(2, entries)}
      />
      <ScopeDetailModal
        isOpen={openScopeModal === 3}
        onClose={() => setOpenScopeModal(null)}
        scopeNumber={3}
        scopeTitle="Scope 3"
        entries={getScopeEntries(3)}
        onEntriesChange={(entries) => handleScopeEntriesChange(3, entries)}
      />
    </div>
  );
};

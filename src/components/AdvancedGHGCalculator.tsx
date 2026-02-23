import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Sparkles } from "lucide-react";
import { useEmissions } from '@/contexts/EmissionsContext';
import { useCarbonReports } from '@/hooks/useCarbonReports';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useCalculationDetails, CalculationDetail } from '@/hooks/useCalculationDetails';
import { ScopeDetailModal } from '@/components/ScopeDetailModal';
import { GHGDashboardHeader } from '@/components/ghg/GHGDashboardHeader';
import { GHGSummary } from '@/components/ghg/GHGSummary';
import { ScopeTabs } from '@/components/ghg/ScopeTabs';
import { CompanyDataSection } from '@/components/ghg/CompanyDataSection';
import { getEmissionFactor } from '@/lib/ghg/emissionFactors';
import { safeGetJSON, safeSetJSON, safeRemove } from '@/lib/ghg/safeStorage';
import { validateQuantity } from '@/lib/ghg/unitConverter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================
// SOURCE DE VÉRITÉ UNIQUE: sectionDetails (useCalculationDetails)
// Scope 3 avancé communique via callback direct (pas de polling)
// ============================================================

export const AdvancedGHGCalculator = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { updateEmissions } = useEmissions();
  const { createReport } = useCarbonReports();
  const [activeTab, setActiveTab] = useState("scope1");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(() => safeGetJSON('calculator-advanced-mode', false));
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
  // Scope 3 avancé: callback DIRECT (plus de polling)
  // ============================================================
  const [scope3AdvancedTotal, setScope3AdvancedTotal] = useState(() => {
    const calcs = safeGetJSON<any[]>('scope3-advanced-calculations', []);
    return calcs.reduce((sum, c) => sum + (c.emissions || 0), 0);
  });
  const [scope3AdvancedCalcs, setScope3AdvancedCalcs] = useState<any[]>(() =>
    safeGetJSON<any[]>('scope3-advanced-calculations', [])
  );

  // Callback direct du Scope3AdvancedModule → plus de polling
  const handleScope3TotalChange = useCallback((total: number) => {
    setScope3AdvancedTotal(total);
  }, []);

  const handleScope3CalcsChange = useCallback((calcs: any[]) => {
    setScope3AdvancedCalcs(calcs);
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

  // Données d'entreprise - champs individuels pour optimiser les useEffect
  const [chiffreAffaires, setChiffreAffaires] = useState(() => safeGetJSON('calculator-chiffre-affaires', 1000));
  const [nombrePersonnels, setNombrePersonnels] = useState(() => safeGetJSON('calculator-nombre-personnels', 50));
  const [emissionsAnneePrecedente, setEmissionsAnneePrecedente] = useState(() => safeGetJSON('calculator-emissions-annee-precedente', 0));
  const [objectifSBTI, setObjectifSBTI] = useState(() => safeGetJSON('calculator-objectif-sbti', 0));
  const [objectifsSBTParAnnee, setObjectifsSBTParAnnee] = useState<Record<string, number>>(() => safeGetJSON('calculator-objectifs-sbt-par-annee', {}));
  const [emissionsReelles, setEmissionsReelles] = useState(() => safeGetJSON('calculator-emissions-reelles', 0));
  const [moyenneSectorielle, setMoyenneSectorielle] = useState(() => safeGetJSON('calculator-moyenne-sectorielle', 0));
  const [leadersSecteur, setLeadersSecteur] = useState(() => safeGetJSON('calculator-leaders-secteur', 0));
  const [positionClassement, setPositionClassement] = useState(() => safeGetJSON('calculator-position-classement', 0));
  const [benchmarkSectorName, setBenchmarkSectorName] = useState(() => safeGetJSON('calculator-benchmark-sector-name', ''));
  const [benchmarkSectorAverage, setBenchmarkSectorAverage] = useState(() => safeGetJSON('calculator-benchmark-sector-average', 0));
  const [benchmarkSectorTop10, setBenchmarkSectorTop10] = useState(() => safeGetJSON('calculator-benchmark-sector-top10', 0));
  const [benchmarkSectorCritical, setBenchmarkSectorCritical] = useState(() => safeGetJSON('calculator-benchmark-sector-critical', 0));

  // Objet companyData dérivé pour les sous-composants
  const companyData = useMemo(() => ({
    chiffreAffaires, nombrePersonnels, emissionsAnneePrecedente,
    objectifSBTI, objectifsSBTParAnnee, emissionsReelles,
    moyenneSectorielle, leadersSecteur, positionClassement,
    benchmarkSectorName, benchmarkSectorAverage, benchmarkSectorTop10, benchmarkSectorCritical,
  }), [chiffreAffaires, nombrePersonnels, emissionsAnneePrecedente, objectifSBTI, objectifsSBTParAnnee, emissionsReelles, moyenneSectorielle, leadersSecteur, positionClassement, benchmarkSectorName, benchmarkSectorAverage, benchmarkSectorTop10, benchmarkSectorCritical]);

  const handleCompanyDataChange = useCallback((updates: Partial<typeof companyData>) => {
    if ('chiffreAffaires' in updates) setChiffreAffaires(Math.max(1, updates.chiffreAffaires || 1));
    if ('nombrePersonnels' in updates) setNombrePersonnels(Math.max(1, updates.nombrePersonnels || 1));
    if ('emissionsAnneePrecedente' in updates) setEmissionsAnneePrecedente(Math.max(0, updates.emissionsAnneePrecedente || 0));
    if ('objectifSBTI' in updates) setObjectifSBTI(Math.max(0, updates.objectifSBTI || 0));
    if ('objectifsSBTParAnnee' in updates) setObjectifsSBTParAnnee(updates.objectifsSBTParAnnee || {});
    if ('emissionsReelles' in updates) setEmissionsReelles(Math.max(0, updates.emissionsReelles || 0));
    if ('moyenneSectorielle' in updates) setMoyenneSectorielle(Math.max(0, updates.moyenneSectorielle || 0));
    if ('leadersSecteur' in updates) setLeadersSecteur(Math.max(0, updates.leadersSecteur || 0));
    if ('positionClassement' in updates) setPositionClassement(Math.max(0, updates.positionClassement || 0));
    if ('benchmarkSectorName' in updates) setBenchmarkSectorName(updates.benchmarkSectorName || '');
    if ('benchmarkSectorAverage' in updates) setBenchmarkSectorAverage(Math.max(0, updates.benchmarkSectorAverage || 0));
    if ('benchmarkSectorTop10' in updates) setBenchmarkSectorTop10(Math.max(0, updates.benchmarkSectorTop10 || 0));
    if ('benchmarkSectorCritical' in updates) setBenchmarkSectorCritical(Math.max(0, updates.benchmarkSectorCritical || 0));
  }, []);

  // ============================================================
  // Auth check
  // ============================================================
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuthenticated(!!user));
  }, []);

  // ============================================================
  // Persistence - formulaires (dépendances fines)
  // ============================================================
  useEffect(() => { safeSetJSON('calculator-advanced-mode', isAdvancedMode); }, [isAdvancedMode]);
  useEffect(() => { safeSetJSON('calculator-scope1', scope1Data); }, [scope1Data]);
  useEffect(() => { safeSetJSON('calculator-scope2', scope2Data); }, [scope2Data]);
  useEffect(() => { safeSetJSON('calculator-scope3', scope3Data); }, [scope3Data]);

  // Persistence - champs individuels (optimisé vs un gros objet)
  useEffect(() => { safeSetJSON('calculator-chiffre-affaires', chiffreAffaires); }, [chiffreAffaires]);
  useEffect(() => { safeSetJSON('calculator-nombre-personnels', nombrePersonnels); }, [nombrePersonnels]);
  useEffect(() => { safeSetJSON('calculator-emissions-annee-precedente', emissionsAnneePrecedente); }, [emissionsAnneePrecedente]);
  useEffect(() => { safeSetJSON('calculator-objectif-sbti', objectifSBTI); }, [objectifSBTI]);
  useEffect(() => { safeSetJSON('calculator-objectifs-sbt-par-annee', objectifsSBTParAnnee); }, [objectifsSBTParAnnee]);
  useEffect(() => { safeSetJSON('calculator-emissions-reelles', emissionsReelles); }, [emissionsReelles]);
  useEffect(() => { safeSetJSON('calculator-moyenne-sectorielle', moyenneSectorielle); }, [moyenneSectorielle]);
  useEffect(() => { safeSetJSON('calculator-leaders-secteur', leadersSecteur); }, [leadersSecteur]);
  useEffect(() => { safeSetJSON('calculator-position-classement', positionClassement); }, [positionClassement]);
  useEffect(() => { safeSetJSON('calculator-benchmark-sector-name', benchmarkSectorName); }, [benchmarkSectorName]);
  useEffect(() => { safeSetJSON('calculator-benchmark-sector-average', benchmarkSectorAverage); }, [benchmarkSectorAverage]);
  useEffect(() => { safeSetJSON('calculator-benchmark-sector-top10', benchmarkSectorTop10); }, [benchmarkSectorTop10]);
  useEffect(() => { safeSetJSON('calculator-benchmark-sector-critical', benchmarkSectorCritical); }, [benchmarkSectorCritical]);

  // Sync companyData → EmissionsContext (dépendances fines)
  useEffect(() => {
    updateEmissions({
      chiffreAffaires, nombrePersonnels, emissionsAnneePrecedente,
      objectifSBTI, objectifsSBTParAnnee, emissionsReelles,
      moyenneSectorielle, leadersSecteur, positionClassement,
      benchmarkSectorName, benchmarkSectorAverage, benchmarkSectorTop10, benchmarkSectorCritical,
    });
  }, [chiffreAffaires, nombrePersonnels, emissionsAnneePrecedente, objectifSBTI, objectifsSBTParAnnee, emissionsReelles, moyenneSectorielle, leadersSecteur, positionClassement, benchmarkSectorName, benchmarkSectorAverage, benchmarkSectorTop10, benchmarkSectorCritical, updateEmissions]);

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
  const totalEntries = sectionDetails.scope1.length + sectionDetails.scope2.length + sectionDetails.scope3.length;
  const advancedCount = isAdvancedMode ? scope3AdvancedCalcs.length : 0;

  // ============================================================
  // Sync totaux → EmissionsContext
  // ============================================================
  useEffect(() => {
    updateEmissions({ scope1: scope1Total, scope2: scope2Total, scope3: scope3TotalWithAdvanced });
  }, [scope1Total, scope2Total, scope3TotalWithAdvanced, updateEmissions]);

  // ============================================================
  // AJOUT DE CALCUL avec validation stricte
  // ============================================================
  const addCalculation = useCallback((scope: string, category: string, subcategory: string, quantity: number) => {
    const validated = validateQuantity(quantity);
    if (validated === null || validated <= 0) {
      toast({ title: t('ghg.validation.invalid_quantity', 'Quantité invalide'), description: t('ghg.validation.positive_required', 'La quantité doit être un nombre positif'), variant: "destructive" });
      return;
    }
    const factor = getEmissionFactor(scope, category, subcategory);
    if (!factor) {
      toast({ title: t('ghg.validation.factor_not_found', 'Facteur introuvable'), description: `${t('ghg.validation.no_factor', "Aucun facteur d'émission pour")} ${subcategory}`, variant: "destructive" });
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
    toast({ title: t('ghg.calc_added', 'Calcul ajouté ✅'), description: `${emissions.toFixed(2)} kg CO₂e ${t('ghg.added_to', 'ajoutés au')} ${scope.toUpperCase()}` });
  }, [addCalculationDetail, toast, t]);

  // ============================================================
  // SCOPE ENTRIES pour les modales
  // ============================================================
  const getScopeEntries = useCallback((scopeNumber: 1 | 2 | 3) => {
    const scopeKey = `scope${scopeNumber}` as keyof typeof sectionDetails;
    const details = sectionDetails[scopeKey];
    const entriesFromDetails = details.map(detail => ({
      id: detail.id, source: detail.description, quantity: detail.quantity,
      unit: detail.unit, emissionFactor: detail.emissionFactor, total: detail.emissions
    }));
    if (scopeNumber === 3 && isAdvancedMode) {
      const entriesFromAdvanced = scope3AdvancedCalcs.map((calc: any) => {
        const quantity = calc.quantity || 0;
        const emissions = calc.emissions || 0;
        return {
          id: calc.id || `scope3-adv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: `${calc.categoryName || 'Catégorie'} - ${calc.subcategoryName || 'Calcul avancé'}`,
          quantity, unit: calc.unit || 'unités',
          emissionFactor: quantity > 0 ? emissions / quantity : 0,
          total: emissions
        };
      });
      return [...entriesFromDetails, ...entriesFromAdvanced];
    }
    return entriesFromDetails;
  }, [sectionDetails, isAdvancedMode, scope3AdvancedCalcs]);

  // ============================================================
  // HANDLER: mise à jour depuis la modale (bug de persistance corrigé)
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

    // FIX: Préserver le type original des entrées existantes lors de la persistence
    const existingDetailsMap = new Map(sectionDetails[scopeKey].map(d => [d.id, d]));
    const newDetails: CalculationDetail[] = standardEntries.map(entry => {
      const existing = existingDetailsMap.get(entry.id);
      return {
        id: entry.id,
        type: existing?.type || entry.source.toLowerCase().replace(/\s+/g, '-'),
        description: entry.source,
        quantity: entry.quantity,
        unit: entry.unit,
        emissionFactor: entry.emissionFactor,
        emissions: entry.total,
        timestamp: existing?.timestamp || new Date().toLocaleString('fr-FR'),
        formuleDetail: existing?.formuleDetail || `${entry.quantity} ${entry.unit} × ${entry.emissionFactor} kg CO₂e/${entry.unit}`
      };
    });
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
      setScope3AdvancedCalcs(updatedAdvanced);
    }
  }, [setSectionDetails, isAdvancedMode, sectionDetails]);

  // ============================================================
  // RESET étendu (inclut données avancées)
  // ============================================================
  const resetCalculations = useCallback(() => {
    safeRemove('calculator-scope1');
    safeRemove('calculator-scope2');
    safeRemove('calculator-scope3');
    // FIX: Effacer aussi les données Scope 3 avancé
    safeRemove('scope3-advanced-calculations');
    safeRemove('scope3-enabled-categories');

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
    setScope3AdvancedTotal(0);
    setScope3AdvancedCalcs([]);
    updateEmissions({ scope1: 0, scope2: 0, scope3: 0 });
    // Notifier les autres composants
    window.dispatchEvent(new Event('storage'));

    toast({ title: t('ghg.reset_success', 'Calculs réinitialisés ✅'), description: t('ghg.reset_desc', 'Tous les calculs et détails ont été supprimés') });
    setShowResetConfirm(false);
  }, [clearAllDetails, updateEmissions, toast, t]);

  // ============================================================
  // SAUVEGARDE DB avec état de chargement
  // ============================================================
  const saveToDatabase = useCallback(async () => {
    if (!isAuthenticated) {
      toast({ title: t('ghg.auth_required', 'Authentification requise'), description: t('ghg.auth_desc', 'Connectez-vous pour sauvegarder'), variant: "destructive" });
      return;
    }
    if (totalEntries === 0 && advancedCount === 0) {
      toast({ title: t('ghg.no_calc', 'Aucun calcul'), description: t('ghg.no_calc_desc', 'Ajoutez au moins un calcul avant de sauvegarder'), variant: "destructive" });
      return;
    }
    // Validation chiffreAffaires non nul
    if (!chiffreAffaires || chiffreAffaires <= 0) {
      toast({ title: t('ghg.validation.ca_required', "Chiffre d'affaires requis"), description: t('ghg.validation.ca_positive', "Le chiffre d'affaires doit être supérieur à 0"), variant: "destructive" });
      return;
    }
    setIsSaving(true);
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
          carbon_intensity: totalGlobal / 1000 / chiffreAffaires,
          calculation_data: JSON.stringify({
            chiffre_affaires: chiffreAffaires,
            nombre_personnels: nombrePersonnels,
            emissions_annee_precedente: emissionsAnneePrecedente,
            objectif_sbti: objectifSBTI,
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
        carbon_intensity: totalGlobal / 1000 / chiffreAffaires,
        company_info: {
          chiffre_affaires: chiffreAffaires,
          nombre_personnels: nombrePersonnels,
          emissions_annee_precedente: emissionsAnneePrecedente,
          objectif_sbti: objectifSBTI,
          date_calcul: new Date().toISOString()
        },
        calculation_id: calculationData.id
      });

      toast({ title: t('ghg.save_success', 'Données sauvegardées'), description: t('ghg.save_desc', 'Vos calculs sont maintenant visibles sur le dashboard') });
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({ title: t('ghg.save_error', 'Erreur de sauvegarde'), description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, totalEntries, advancedCount, scope1Total, scope2Total, scope3TotalWithAdvanced, totalGlobal, chiffreAffaires, nombrePersonnels, emissionsAnneePrecedente, objectifSBTI, createReport, toast, t]);

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
      ...allDetails.map(d => [d.scope, d.description, d.quantity, d.unit, d.emissionFactor, d.emissions.toFixed(3)].join(','))
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
    const advancedDetails: CalculationDetail[] = scope3AdvancedCalcs.map((calc: any) => ({
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
  }, [sectionDetails.scope3, isAdvancedMode, scope3AdvancedCalcs]);

  const hasAnyData = totalEntries > 0 || (isAdvancedMode && scope3AdvancedTotal > 0);

  // Scope 3 detail removal handler
  const handleRemoveScope3Detail = useCallback((detailId: string) => {
    if (detailId.startsWith('scope3-adv-')) {
      const filtered = scope3AdvancedCalcs.filter((calc: any) => calc.id !== detailId);
      safeSetJSON('scope3-advanced-calculations', filtered);
      setScope3AdvancedTotal(filtered.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0));
      setScope3AdvancedCalcs(filtered);
      window.dispatchEvent(new Event('storage'));
    }
    removeCalculationDetail('scope3', detailId);
  }, [scope3AdvancedCalcs, removeCalculationDetail]);

  const handleClearScope3 = useCallback(() => {
    clearSectionDetails('scope3');
    if (isAdvancedMode) {
      safeSetJSON('scope3-advanced-calculations', []);
      setScope3AdvancedTotal(0);
      setScope3AdvancedCalcs([]);
      window.dispatchEvent(new Event('storage'));
    }
  }, [clearSectionDetails, isAdvancedMode]);

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
        chiffreAffaires={chiffreAffaires}
        nombrePersonnels={nombrePersonnels}
        emissionsAnneePrecedente={emissionsAnneePrecedente}
        isAdvancedMode={isAdvancedMode}
        onChiffreAffairesChange={setChiffreAffaires}
        onScopeClick={setOpenScopeModal}
      />

      {/* Header with mode toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {t('ghg.title', 'Calculateur GES')} {isAdvancedMode ? t('ghg.advanced', 'Avancé') : t('ghg.standard', 'Standard')} - Base Carbone® ADEME
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isAdvancedMode
              ? t('ghg.desc_advanced', 'Calculateur expert avec 15 catégories Scope 3 conformes au GHG Protocol.')
              : t('ghg.desc_standard', "Calculateur basé sur les facteurs d'émissions officiels de la Base Carbone® ADEME.")}
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{t('ghg.standard', 'Standard')}</span>
          </div>
          <Switch checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{t('ghg.advanced', 'Avancé')}</span>
          </div>
        </div>
      </div>

      {/* Company Data Section */}
      {hasAnyData && (
        <CompanyDataSection
          data={companyData}
          totalGlobal={totalGlobal}
          onChange={handleCompanyDataChange}
        />
      )}

      {/* Résumé des émissions */}
      <GHGSummary
        scope1Total={scope1Total}
        scope2Total={scope2Total}
        scope3Total={scope3TotalWithAdvanced}
        totalGlobal={totalGlobal}
        scope3AdvancedTotal={scope3AdvancedTotal}
        isAdvancedMode={isAdvancedMode}
        isAuthenticated={isAuthenticated}
        isSaving={isSaving}
        hasAnyData={hasAnyData}
        onSave={saveToDatabase}
        onExportCSV={exportToCSV}
        onReset={() => setShowResetConfirm(true)}
      />

      {/* Tabs */}
      <ScopeTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scope1Data={scope1Data}
        onScope1Change={(updates) => setScope1Data(prev => ({ ...prev, ...updates }))}
        scope2Data={scope2Data}
        onScope2Change={(updates) => setScope2Data(prev => ({ ...prev, ...updates }))}
        scope3Data={scope3Data}
        onScope3Change={(updates) => setScope3Data(prev => ({ ...prev, ...updates }))}
        isAdvancedMode={isAdvancedMode}
        onEnableAdvanced={() => setIsAdvancedMode(true)}
        onScope3AdvancedTotalChange={handleScope3TotalChange}
        onScope3AdvancedCalcsChange={handleScope3CalcsChange}
        onAddCalculation={addCalculation}
        sectionDetails={sectionDetails}
        scope3CombinedDetails={scope3CombinedDetails}
        scope1Total={scope1Total}
        scope2Total={scope2Total}
        scope3TotalWithAdvanced={scope3TotalWithAdvanced}
        totalGlobal={totalGlobal}
        totalEntries={totalEntries}
        advancedCount={advancedCount}
        hasAnyData={hasAnyData}
        isAuthenticated={isAuthenticated}
        isSaving={isSaving}
        onRemoveScope1Detail={(id) => removeCalculationDetail('scope1', id)}
        onRemoveScope2Detail={(id) => removeCalculationDetail('scope2', id)}
        onRemoveScope3Detail={handleRemoveScope3Detail}
        onClearScope1={() => clearSectionDetails('scope1')}
        onClearScope2={() => clearSectionDetails('scope2')}
        onClearScope3={handleClearScope3}
        onResetAll={() => setShowResetConfirm(true)}
        onSave={saveToDatabase}
        onExportCSV={exportToCSV}
      />

      {/* Modales de détail des scopes */}
      <ScopeDetailModal
        isOpen={openScopeModal === 1} onClose={() => setOpenScopeModal(null)}
        scopeNumber={1} scopeTitle="Scope 1"
        entries={getScopeEntries(1)} onEntriesChange={(entries) => handleScopeEntriesChange(1, entries)}
      />
      <ScopeDetailModal
        isOpen={openScopeModal === 2} onClose={() => setOpenScopeModal(null)}
        scopeNumber={2} scopeTitle="Scope 2"
        entries={getScopeEntries(2)} onEntriesChange={(entries) => handleScopeEntriesChange(2, entries)}
      />
      <ScopeDetailModal
        isOpen={openScopeModal === 3} onClose={() => setOpenScopeModal(null)}
        scopeNumber={3} scopeTitle="Scope 3"
        entries={getScopeEntries(3)} onEntriesChange={(entries) => handleScopeEntriesChange(3, entries)}
      />

      {/* Confirmation de réinitialisation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ghg.reset_confirm_title', 'Confirmer la réinitialisation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ghg.reset_confirm_desc', 'Cette action supprimera tous vos calculs (Scope 1, 2, 3 standard et avancé). Cette action est irréversible.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Annuler')}</AlertDialogCancel>
            <AlertDialogAction onClick={resetCalculations} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('ghg.reset_confirm_button', 'Réinitialiser tout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

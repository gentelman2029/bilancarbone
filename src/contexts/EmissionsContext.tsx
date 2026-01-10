import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmissionsData {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  lastUpdated?: string;
  calculationId?: string;
  nombrePersonnels?: number;
  emissionsAnneePrecedente?: number;
  objectifSBTI?: number;
  objectifsSBTParAnnee?: { [key: string]: number }; // Objectifs SBT par année (2023-2030)
  emissionsReelles?: number;
  chiffreAffaires?: number;
  moyenneSectorielle?: number;
  leadersSecteur?: number;
  positionClassement?: number;
}

interface EmissionsContextType {
  emissions: EmissionsData;
  updateEmissions: (newEmissions: Partial<EmissionsData>) => void;
  resetEmissions: () => void;
  hasEmissions: boolean;
  saveToSupabase: (emissionsData: any) => Promise<string | null>;
  loadFromSupabase: () => Promise<void>;
}

const EmissionsContext = createContext<EmissionsContextType | undefined>(undefined);

const initialEmissions: EmissionsData = {
  scope1: 0,
  scope2: 0,
  scope3: 0,
  total: 0
};

// Fonction pour charger les émissions depuis localStorage (synchronisé avec le calculateur)
const loadFromLocalStorage = (): EmissionsData | null => {
  try {
    const sectionDetails = localStorage.getItem('calculation-section-details');
    if (sectionDetails) {
      const details = JSON.parse(sectionDetails);
      const scope1 = (details.scope1 || []).reduce((sum: number, d: any) => sum + (d.emissions || 0), 0);
      const scope2 = (details.scope2 || []).reduce((sum: number, d: any) => sum + (d.emissions || 0), 0);
      let scope3 = (details.scope3 || []).reduce((sum: number, d: any) => sum + (d.emissions || 0), 0);
      
      // Ajouter aussi le Scope 3 avancé si disponible
      const scope3Advanced = localStorage.getItem('scope3-advanced-calculations');
      if (scope3Advanced) {
        const advCalcs = JSON.parse(scope3Advanced);
        scope3 += advCalcs.reduce((sum: number, c: any) => sum + (c.emissions || 0), 0);
      }
      
      if (scope1 > 0 || scope2 > 0 || scope3 > 0) {
        // Charger aussi les autres données d'entreprise
        const chiffreAffaires = localStorage.getItem('calculator-chiffre-affaires');
        const nombrePersonnels = localStorage.getItem('calculator-nombre-personnels');
        const emissionsAnneePrecedente = localStorage.getItem('calculator-emissions-annee-precedente');
        const objectifSBTI = localStorage.getItem('calculator-objectif-sbti');
        const objectifsSBTParAnnee = localStorage.getItem('calculator-objectifs-sbt-par-annee');
        const moyenneSectorielle = localStorage.getItem('calculator-moyenne-sectorielle');
        const leadersSecteur = localStorage.getItem('calculator-leaders-secteur');
        const positionClassement = localStorage.getItem('calculator-position-classement');
        
        return {
          scope1,
          scope2,
          scope3,
          total: scope1 + scope2 + scope3,
          chiffreAffaires: chiffreAffaires ? JSON.parse(chiffreAffaires) : 1000,
          nombrePersonnels: nombrePersonnels ? JSON.parse(nombrePersonnels) : 50,
          emissionsAnneePrecedente: emissionsAnneePrecedente ? JSON.parse(emissionsAnneePrecedente) : 0,
          objectifSBTI: objectifSBTI ? JSON.parse(objectifSBTI) : 0,
          objectifsSBTParAnnee: objectifsSBTParAnnee ? JSON.parse(objectifsSBTParAnnee) : {},
          moyenneSectorielle: moyenneSectorielle ? JSON.parse(moyenneSectorielle) : 0,
          leadersSecteur: leadersSecteur ? JSON.parse(leadersSecteur) : 0,
          positionClassement: positionClassement ? JSON.parse(positionClassement) : 0,
        };
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement localStorage:', error);
  }
  return null;
};

export const EmissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialiser avec les données localStorage si disponibles
  const [emissions, setEmissions] = useState<EmissionsData>(() => {
    const localData = loadFromLocalStorage();
    return localData || initialEmissions;
  });

  // Charger les données depuis Supabase au démarrage (pour utilisateurs connectés)
  useEffect(() => {
    loadFromSupabase();
  }, []);
  
  // Synchroniser les émissions avec localStorage quand elles changent
  useEffect(() => {
    // Écouter les changements du localStorage (pour sync multi-pages)
    const handleStorageChange = () => {
      const localData = loadFromLocalStorage();
      if (localData && (localData.scope1 > 0 || localData.scope2 > 0 || localData.scope3 > 0)) {
        setEmissions(prev => ({
          ...prev,
          ...localData,
          total: localData.scope1 + localData.scope2 + localData.scope3
        }));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: calculations, error } = await supabase
        .from('emissions_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erreur lors du chargement des émissions:', error);
        return;
      }

      // Ne pas écraser les données localStorage si elles existent et sont plus récentes
      const localData = loadFromLocalStorage();
      if (localData && (localData.scope1 > 0 || localData.scope2 > 0 || localData.scope3 > 0)) {
        // Les données localStorage sont prioritaires (temps réel du calculateur)
        return;
      }

      if (calculations && calculations.length > 0) {
        const calc = calculations[0];
        const calculationData = calc.calculation_data as any || {};
        setEmissions({
          scope1: Number(calc.scope1),
          scope2: Number(calc.scope2),
          scope3: Number(calc.scope3),
          total: Number(calc.total),
          lastUpdated: calc.updated_at,
          calculationId: calc.id,
          nombrePersonnels: calculationData.nombre_personnels || 50,
          emissionsAnneePrecedente: calculationData.emissions_annee_precedente || 0,
          objectifSBTI: calculationData.objectif_sbti || 0,
          objectifsSBTParAnnee: calculationData.objectifs_sbt_par_annee || {},
          emissionsReelles: calculationData.emissions_reelles || 0,
          chiffreAffaires: calculationData.chiffre_affaires || 1000
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des émissions:', error);
    }
  };

  const saveToSupabase = async (emissionsData: any): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        return null;
      }

      const { data: calculation, error } = await supabase
        .from('emissions_calculations')
        .insert({
          user_id: user.id,
          scope1: emissionsData.scope1,
          scope2: emissionsData.scope2,
          scope3: emissionsData.scope3,
          total: emissionsData.total,
          calculation_data: emissionsData
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return null;
      }

      return calculation.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return null;
    }
  };

  const updateEmissions = (newEmissions: Partial<EmissionsData>) => {
    setEmissions(prev => {
      const updated = { ...prev, ...newEmissions };
      updated.total = updated.scope1 + updated.scope2 + updated.scope3;
      return updated;
    });
  };

  const resetEmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && emissions.calculationId) {
        await supabase
          .from('emissions_calculations')
          .delete()
          .eq('id', emissions.calculationId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
    
    setEmissions(initialEmissions);
  };

  const hasEmissions = emissions.scope1 > 0 || emissions.scope2 > 0 || emissions.scope3 > 0;

  return (
    <EmissionsContext.Provider value={{
      emissions,
      updateEmissions,
      resetEmissions,
      hasEmissions,
      saveToSupabase,
      loadFromSupabase
    }}>
      {children}
    </EmissionsContext.Provider>
  );
};

export const useEmissions = () => {
  const context = useContext(EmissionsContext);
  if (context === undefined) {
    throw new Error('useEmissions doit être utilisé dans un EmissionsProvider');
  }
  return context;
};
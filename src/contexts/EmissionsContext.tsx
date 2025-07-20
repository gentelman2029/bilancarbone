import React, { createContext, useContext, useState, useEffect } from 'react';

interface EmissionsData {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  lastUpdated?: string;
}

interface EmissionsContextType {
  emissions: EmissionsData;
  updateEmissions: (newEmissions: Partial<EmissionsData>) => void;
  resetEmissions: () => void;
  hasEmissions: boolean;
}

const EmissionsContext = createContext<EmissionsContextType | undefined>(undefined);

const STORAGE_KEY = 'carbontrack_emissions';

const initialEmissions: EmissionsData = {
  scope1: 0,
  scope2: 0,
  scope3: 0,
  total: 0
};

export const EmissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emissions, setEmissions] = useState<EmissionsData>(initialEmissions);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedEmissions = localStorage.getItem(STORAGE_KEY);
    if (savedEmissions) {
      try {
        const parsed = JSON.parse(savedEmissions);
        setEmissions(parsed);
      } catch (error) {
        console.error('Erreur lors du chargement des émissions:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque modification
  useEffect(() => {
    if (emissions.scope1 > 0 || emissions.scope2 > 0 || emissions.scope3 > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...emissions,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [emissions]);

  const updateEmissions = (newEmissions: Partial<EmissionsData>) => {
    setEmissions(prev => {
      const updated = { ...prev, ...newEmissions };
      updated.total = updated.scope1 + updated.scope2 + updated.scope3;
      return updated;
    });
  };

  const resetEmissions = () => {
    setEmissions(initialEmissions);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasEmissions = emissions.scope1 > 0 || emissions.scope2 > 0 || emissions.scope3 > 0;

  return (
    <EmissionsContext.Provider value={{
      emissions,
      updateEmissions,
      resetEmissions,
      hasEmissions
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
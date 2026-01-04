import { useState, useCallback } from 'react';

export interface CalculationDetail {
  id: string;
  type: string;
  description: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  emissions: number;
  timestamp: string;
  formuleDetail: string;
}

export interface SectionDetails {
  scope1: CalculationDetail[];
  scope2: CalculationDetail[];
  scope3: CalculationDetail[];
}

export const useCalculationDetails = () => {
  const [sectionDetails, setSectionDetails] = useState<SectionDetails>(() => {
    const saved = localStorage.getItem('calculation-section-details');
    return saved ? JSON.parse(saved) : {
      scope1: [],
      scope2: [],
      scope3: []
    };
  });

  const addCalculationDetail = useCallback((
    section: keyof SectionDetails,
    detail: Omit<CalculationDetail, 'id' | 'timestamp'>
  ) => {
    const newDetail: CalculationDetail = {
      ...detail,
      id: `${section}-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR')
    };

    setSectionDetails(prev => {
      const updated = {
        ...prev,
        [section]: [...prev[section], newDetail]
      };
      localStorage.setItem('calculation-section-details', JSON.stringify(updated));
      return updated;
    });

    return newDetail;
  }, []);

  const removeCalculationDetail = useCallback((
    section: keyof SectionDetails,
    detailId: string
  ) => {
    setSectionDetails(prev => {
      const updated = {
        ...prev,
        [section]: prev[section].filter(detail => detail.id !== detailId)
      };
      localStorage.setItem('calculation-section-details', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateCalculationDetail = useCallback((
    section: keyof SectionDetails,
    detailId: string,
    updates: Partial<Omit<CalculationDetail, 'id' | 'timestamp'>>
  ) => {
    setSectionDetails(prev => {
      const updated = {
        ...prev,
        [section]: prev[section].map(detail => 
          detail.id === detailId 
            ? { ...detail, ...updates, emissions: (updates.quantity ?? detail.quantity) * (updates.emissionFactor ?? detail.emissionFactor) }
            : detail
        )
      };
      localStorage.setItem('calculation-section-details', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setSectionDetailsDirectly = useCallback((
    section: keyof SectionDetails,
    details: CalculationDetail[]
  ) => {
    setSectionDetails(prev => {
      const updated = {
        ...prev,
        [section]: details
      };
      localStorage.setItem('calculation-section-details', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSectionDetails = useCallback((section: keyof SectionDetails) => {
    setSectionDetails(prev => {
      const updated = {
        ...prev,
        [section]: []
      };
      localStorage.setItem('calculation-section-details', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllDetails = useCallback(() => {
    const empty: SectionDetails = {
      scope1: [],
      scope2: [],
      scope3: []
    };
    setSectionDetails(empty);
    localStorage.setItem('calculation-section-details', JSON.stringify(empty));
  }, []);

  const getTotalEmissionsBySection = useCallback((section: keyof SectionDetails) => {
    return sectionDetails[section].reduce((total, detail) => total + detail.emissions, 0);
  }, [sectionDetails]);

  return {
    sectionDetails,
    setSectionDetails: setSectionDetailsDirectly,
    addCalculationDetail,
    removeCalculationDetail,
    updateCalculationDetail,
    clearSectionDetails,
    clearAllDetails,
    getTotalEmissionsBySection
  };
};
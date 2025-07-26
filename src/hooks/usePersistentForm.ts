import { useState, useEffect } from 'react';

interface PersistentFormHook<T> {
  data: T;
  updateData: (updates: Partial<T>) => void;
  resetData: () => void;
  hasData: boolean;
}

export function usePersistentForm<T>(
  storageKey: string,
  initialData: T
): PersistentFormHook<T> {
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialData;
    } catch {
      return initialData;
    }
  });

  const updateData = (updates: Partial<T>) => {
    setData(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const resetData = () => {
    localStorage.removeItem(storageKey);
    setData(initialData);
  };

  const hasData = Object.values(data as any).some(value => 
    value !== "" && value !== null && value !== undefined
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  return { data, updateData, resetData, hasData };
}
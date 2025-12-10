import { useState, useEffect } from 'react';

// Hook para gerenciar localStorage de forma reativa
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook para gerenciar conjuntos salvos de etiquetas
export function useSavedLabelSets() {
  const [savedSets, setSavedSets] = useLocalStorage<any[]>('dun-saved-labels', []);
  
  const saveLabelSet = (name: string, labels: any[], orientation: 'portrait' | 'landscape' = 'portrait') => {
    const newSet = {
      id: Date.now().toString(),
      name,
      labels,
      createdAt: new Date().toISOString(),
      orientation,
    };
    setSavedSets(prev => [...prev, newSet]);
    return newSet;
  };
  
  const deleteLabelSet = (id: string) => {
    setSavedSets(prev => prev.filter(set => set.id !== id));
  };
  
  const loadLabelSet = (id: string) => {
    return savedSets.find(set => set.id === id);
  };
  
  return {
    savedSets,
    saveLabelSet,
    deleteLabelSet,
    loadLabelSet,
  };
}

// Hook para gerenciar conjuntos salvos de QR Codes
export function useSavedQrSets() {
  const [savedSets, setSavedSets] = useLocalStorage<any[]>('qr-saved-sets', []);
  
  const saveQrSet = (name: string, qrList: any[], orientation: 'portrait' | 'landscape', settings: any) => {
    const newSet = {
      id: Date.now().toString(),
      name,
      qrList,
      createdAt: new Date().toISOString(),
      orientation,
      settings,
    };
    setSavedSets(prev => [...prev, newSet]);
    return newSet;
  };
  
  const deleteQrSet = (id: string) => {
    setSavedSets(prev => prev.filter(set => set.id !== id));
  };
  
  const loadQrSet = (id: string) => {
    return savedSets.find(set => set.id === id);
  };
  
  return {
    savedSets,
    saveQrSet,
    deleteQrSet,
    loadQrSet,
  };
}
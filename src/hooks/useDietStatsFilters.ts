
import { useState, useCallback } from 'react';

interface DietStatsFilters {
  minVeganPct: number;
  minVegetarianPct: number;
  minGlutenFreePct: number;
  minHealthyPct: number;
}

interface UseDietStatsFiltersReturn {
  dietFilters: DietStatsFilters;
  setMinVeganPct: (pct: number) => void;
  setMinVegetarianPct: (pct: number) => void;
  setMinGlutenFreePct: (pct: number) => void;
  setMinHealthyPct: (pct: number) => void;
  resetDietFilters: () => void;
  hasActiveFilters: boolean;
  getMinDietPercentages: () => Record<string, number>;
}

const DEFAULT_FILTERS: DietStatsFilters = {
  minVeganPct: 0,
  minVegetarianPct: 0,
  minGlutenFreePct: 0,
  minHealthyPct: 0,
};

export const useDietStatsFilters = (): UseDietStatsFiltersReturn => {
  const [dietFilters, setDietFilters] = useState<DietStatsFilters>(DEFAULT_FILTERS);

  const setMinVeganPct = useCallback((pct: number) => {
    setDietFilters(prev => ({ ...prev, minVeganPct: pct }));
  }, []);

  const setMinVegetarianPct = useCallback((pct: number) => {
    setDietFilters(prev => ({ ...prev, minVegetarianPct: pct }));
  }, []);

  const setMinGlutenFreePct = useCallback((pct: number) => {
    setDietFilters(prev => ({ ...prev, minGlutenFreePct: pct }));
  }, []);

  const setMinHealthyPct = useCallback((pct: number) => {
    setDietFilters(prev => ({ ...prev, minHealthyPct: pct }));
  }, []);

  const resetDietFilters = useCallback(() => {
    setDietFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = dietFilters.minVeganPct > 0 || 
                          dietFilters.minVegetarianPct > 0 || 
                          dietFilters.minGlutenFreePct > 0 || 
                          dietFilters.minHealthyPct > 0;

  const getMinDietPercentages = useCallback((): Record<string, number> => {
    const result: Record<string, number> = {};
    
    if (dietFilters.minVeganPct > 0) {
      result.vegan = dietFilters.minVeganPct;
    }
    if (dietFilters.minVegetarianPct > 0) {
      result.vegetarian = dietFilters.minVegetarianPct;
    }
    if (dietFilters.minGlutenFreePct > 0) {
      result.glutenfree = dietFilters.minGlutenFreePct;
    }
    if (dietFilters.minHealthyPct > 0) {
      result.healthy = dietFilters.minHealthyPct;
    }
    
    return result;
  }, [dietFilters]);

  return {
    dietFilters,
    setMinVeganPct,
    setMinVegetarianPct,
    setMinGlutenFreePct,
    setMinHealthyPct,
    resetDietFilters,
    hasActiveFilters,
    getMinDietPercentages
  };
};

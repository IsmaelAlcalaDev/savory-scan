
import { useState, useEffect } from 'react';

interface LocationHistoryItem {
  id: string;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'poi' | 'manual';
  latitude?: number;
  longitude?: number;
  parent?: string;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 5;
const STORAGE_KEY = 'location_history';

export const useLocationHistory = () => {
  const [history, setHistory] = useState<LocationHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading location history:', error);
      }
    }
  }, []);

  const addToHistory = (location: {
    name: string;
    type: 'city' | 'municipality' | 'district' | 'poi' | 'manual';
    latitude?: number;
    longitude?: number;
    parent?: string;
  }) => {
    const newItem: LocationHistoryItem = {
      id: `${location.type}-${location.name}-${Date.now()}`,
      ...location,
      timestamp: Date.now()
    };

    setHistory(prev => {
      // Remove duplicates based on name and type
      const filtered = prev.filter(item => 
        !(item.name === location.name && item.type === location.type)
      );
      
      // Add new item at the beginning and limit to MAX_HISTORY_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, clearHistory };
};


import { useState, useEffect, useCallback } from 'react';

interface LocationHistoryItem {
  id: string;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'poi' | 'manual';
  latitude?: number;
  longitude?: number;
  parent?: string;
  timestamp: number;
  usage_count: number;
}

const MAX_HISTORY_ITEMS = 8;
const STORAGE_KEY = 'location_history_v2';

export const useOptimizedLocationHistory = () => {
  const [history, setHistory] = useState<LocationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedHistory = JSON.parse(saved);
          // Sort by usage count and timestamp
          const sortedHistory = parsedHistory.sort((a: LocationHistoryItem, b: LocationHistoryItem) => {
            if (a.usage_count !== b.usage_count) {
              return b.usage_count - a.usage_count;
            }
            return b.timestamp - a.timestamp;
          });
          setHistory(sortedHistory);
        }
      } catch (error) {
        console.error('Error loading location history:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const addToHistory = useCallback((location: {
    name: string;
    type: 'city' | 'municipality' | 'district' | 'poi' | 'manual';
    latitude?: number;
    longitude?: number;
    parent?: string;
  }) => {
    setHistory(prev => {
      // Check if location already exists
      const existingIndex = prev.findIndex(item => 
        item.name === location.name && item.type === location.type
      );

      let updatedHistory: LocationHistoryItem[];

      if (existingIndex >= 0) {
        // Update existing item - increase usage count and timestamp
        updatedHistory = prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, timestamp: Date.now(), usage_count: item.usage_count + 1 }
            : item
        );
      } else {
        // Add new item
        const newItem: LocationHistoryItem = {
          id: `${location.type}-${location.name}-${Date.now()}`,
          ...location,
          timestamp: Date.now(),
          usage_count: 1
        };
        updatedHistory = [newItem, ...prev];
      }

      // Sort by usage count and timestamp, then limit items
      const sortedHistory = updatedHistory
        .sort((a, b) => {
          if (a.usage_count !== b.usage_count) {
            return b.usage_count - a.usage_count;
          }
          return b.timestamp - a.timestamp;
        })
        .slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedHistory));
      } catch (error) {
        console.error('Error saving location history:', error);
      }

      return sortedHistory;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error('Error updating location history:', error);
      }
      return filtered;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing location history:', error);
    }
  }, []);

  const getTopLocations = useCallback((limit: number = 5) => {
    return history
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  }, [history]);

  return { 
    history, 
    loading,
    addToHistory, 
    removeFromHistory,
    clearHistory,
    getTopLocations
  };
};

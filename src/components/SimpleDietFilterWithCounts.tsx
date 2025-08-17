
import { Badge } from '@/components/ui/badge';
import { useOptimizedDietCounts } from '@/hooks/useOptimizedDietCounts';

interface SimpleDietFilterWithCountsProps {
  selectedDietCategories: string[];
  onDietCategoryChange: (categories: string[]) => void;
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  minRating?: number;
}

const dietConfig = {
  vegetarian: { 
    label: 'Vegetariano', 
    icon: '🥬', 
    key: 'vegetarian' as const,
    description: 'Al menos 20% de platos vegetarianos'
  },
  vegan: { 
    label: 'Vegano', 
    icon: '🌱', 
    key: 'vegan' as const,
    description: 'Al menos 20% de platos veganos'
  },
  gluten_free: { 
    label: 'Sin Gluten', 
    icon: '🌾', 
    key: 'gluten_free' as const,
    description: 'Al menos 20% de platos sin gluten'
  },
  healthy: { 
    label: 'Saludable', 
    icon: '💚', 
    key: 'healthy' as const,
    description: 'Al menos 20% de platos saludables'
  }
};

export default function SimpleDietFilterWithCounts({ 
  selectedDietCategories, 
  onDietCategoryChange,
  searchQuery,
  userLat,
  userLng,
  maxDistance,
  cuisineTypeIds,
  priceRanges,
  selectedEstablishmentTypes,
  minRating
}: SimpleDietFilterWithCountsProps) {
  
  const { dietCounts, loading, error } = useOptimizedDietCounts({
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    cuisineTypeIds,
    priceRanges,
    selectedEstablishmentTypes,
    minRating
  });

  const handleDietToggle = (dietKey: string) => {
    const newSelected = selectedDietCategories.includes(dietKey)
      ? selectedDietCategories.filter(d => d !== dietKey)
      : [...selectedDietCategories, dietKey];
    onDietCategoryChange(newSelected);
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        {Object.keys(dietConfig).map((key) => (
          <Badge key={key} variant="outline" className="animate-pulse">
            {dietConfig[key as keyof typeof dietConfig].label}
          </Badge>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading diet filter counts:', error);
    // Show filters without counts on error
    return (
      <div className="flex gap-2 flex-wrap">
        {Object.entries(dietConfig).map(([key, config]) => {
          const isSelected = selectedDietCategories.includes(key);
          
          return (
            <Badge
              key={key}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handleDietToggle(key)}
              title={config.description}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(dietConfig).map(([key, config]) => {
        const count = dietCounts[config.key] || 0;
        const isSelected = selectedDietCategories.includes(key);
        
        // Don't show categories with zero restaurants unless selected
        if (count === 0 && !isSelected) return null;
        
        return (
          <Badge
            key={key}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleDietToggle(key)}
            title={config.description}
          >
            <span className="mr-1">{config.icon}</span>
            {config.label}
            <span className="ml-1 text-xs">({count})</span>
          </Badge>
        );
      })}
    </div>
  );
}

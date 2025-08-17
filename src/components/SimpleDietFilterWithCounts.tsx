
import { Badge } from '@/components/ui/badge';
import { useFacetCounts } from '@/hooks/useFacetCounts';

interface SimpleDietFilterWithCountsProps {
  selectedDietCategories: string[];
  onDietCategoryChange: (categories: string[]) => void;
  cityId?: number;
  userLat?: number;
  userLng?: number;
}

const dietConfig = {
  vegetarian: { label: 'Vegetariano', icon: '🥬', key: 'vegetarian' as const },
  vegan: { label: 'Vegano', icon: '🌱', key: 'vegan' as const },
  gluten_free: { label: 'Sin Gluten', icon: '🌾', key: 'gluten_free' as const },
  healthy: { label: 'Saludable', icon: '💚', key: 'healthy' as const }
};

export default function SimpleDietFilterWithCounts({ 
  selectedDietCategories, 
  onDietCategoryChange,
  cityId,
  userLat,
  userLng
}: SimpleDietFilterWithCountsProps) {
  const { facetData, loading, error } = useFacetCounts({ cityId, userLat, userLng });

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
    console.error('Error loading diet facets:', error);
    return null;
  }

  const dietCounts = facetData?.diet_categories || {
    vegetarian: 0,
    vegan: 0,
    gluten_free: 0,
    healthy: 0
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(dietConfig).map(([key, config]) => {
        const count = dietCounts[config.key] || 0;
        const isSelected = selectedDietCategories.includes(key);
        
        if (count === 0) return null; // Don't show categories with zero restaurants
        
        return (
          <Badge
            key={key}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleDietToggle(key)}
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

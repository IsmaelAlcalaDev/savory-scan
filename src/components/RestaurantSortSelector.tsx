
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface RestaurantSortSelectorProps {
  value: 'distance' | 'rating' | 'favorites';
  onChange: (value: 'distance' | 'rating' | 'favorites') => void;
  hasLocation?: boolean;
  className?: string;
}

export default function RestaurantSortSelector({ 
  value, 
  onChange, 
  hasLocation = false,
  className = "" 
}: RestaurantSortSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="favorites">Más populares</SelectItem>
          <SelectItem value="rating">Mejor valorados</SelectItem>
          {hasLocation && (
            <SelectItem value="distance">Más cercanos</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

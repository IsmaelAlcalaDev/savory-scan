
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DishSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  onFiltersClick?: () => void;
  activeFiltersCount?: number;
}

export default function DishSearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Buscar platos...",
  onFiltersClick,
  activeFiltersCount = 0
}: DishSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-16 bg-gray-100 border-0 rounded-full text-gray-900 placeholder:text-gray-600 focus:bg-gray-100 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {onFiltersClick && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onFiltersClick}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-2 rounded-full hover:bg-gray-200 relative"
        >
          <Filter className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}

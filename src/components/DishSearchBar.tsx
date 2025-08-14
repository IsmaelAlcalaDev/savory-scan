
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DishSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function DishSearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Buscar platos..." 
}: DishSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-background border-border"
      />
    </div>
  );
}

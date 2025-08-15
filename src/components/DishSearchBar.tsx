
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
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-gray-50 border-gray-200 rounded-full text-gray-900 placeholder:text-gray-600 focus:bg-white focus:border-primary"
      />
    </div>
  );
}

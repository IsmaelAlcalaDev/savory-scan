import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  onLocationSelect: () => void;
  className?: string;
}

export default function SearchBar({ onSearchChange, onLocationSelect, className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const debounced = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);

    return () => clearTimeout(debounced);
  }, [searchQuery, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Card className={cn(
      "relative bg-glass backdrop-blur-sm border-glass shadow-card hover:shadow-float transition-smooth",
      className
    )}>
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar restaurantes, platos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 h-12 text-base bg-background/50 border-glass backdrop-blur-sm focus:bg-background/80 transition-smooth"
          />
        </div>
        <Button 
          variant="outline" 
          size="lg"
          onClick={onLocationSelect}
          className="flex items-center gap-2 px-6"
        >
          <MapPin className="h-4 w-4" />
          Ubicación
        </Button>
      </div>
    </Card>
  );
}
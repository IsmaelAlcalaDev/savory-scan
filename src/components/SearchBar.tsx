
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
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Buscar restaurantes, platos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-12 pr-4 h-14 text-base bg-background/50 border-border/30 backdrop-blur-sm focus:bg-background/80 transition-smooth rounded-full border-2 focus:border-border/50"
          />
        </div>
        <Button 
          variant="outline" 
          size="lg"
          onClick={onLocationSelect}
          className="flex items-center gap-2 px-6 h-14 rounded-full border-border/30 hover:border-border/50"
        >
          <MapPin className="h-4 w-4" />
          Ubicación
        </Button>
      </div>
    </Card>
  );
}

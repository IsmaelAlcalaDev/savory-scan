
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, X } from 'lucide-react';
import { useDietTypes } from '@/hooks/useDietTypes';
import LanguageSelector from '@/components/LanguageSelector';

interface MenuFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedAllergens: string[];
  onAllergensChange: (allergens: string[]) => void;
  selectedDietTypes: string[];
  onDietTypesChange: (dietTypes: string[]) => void;
  onClearFilters: () => void;
}

const allergensList = [
  { id: 'gluten', name: 'Sin gluten', icon: '🌾' },
  { id: 'lactose', name: 'Sin lactosa', icon: '🥛' },
  { id: 'nuts', name: 'Sin frutos secos', icon: '🥜' },
  { id: 'seafood', name: 'Sin mariscos', icon: '🦐' },
  { id: 'eggs', name: 'Sin huevos', icon: '🥚' },
  { id: 'soy', name: 'Sin soja', icon: '🫘' },
];

export default function MenuFilters({
  searchTerm,
  onSearchChange,
  selectedAllergens,
  onAllergensChange,
  selectedDietTypes,
  onDietTypesChange,
  onClearFilters,
}: MenuFiltersProps) {
  const { dietTypes } = useDietTypes();
  const [showFilters, setShowFilters] = useState(false);

  const toggleAllergen = (allergenId: string) => {
    if (selectedAllergens.includes(allergenId)) {
      onAllergensChange(selectedAllergens.filter(id => id !== allergenId));
    } else {
      onAllergensChange([...selectedAllergens, allergenId]);
    }
  };

  const toggleDietType = (dietTypeId: string) => {
    if (selectedDietTypes.includes(dietTypeId)) {
      onDietTypesChange(selectedDietTypes.filter(id => id !== dietTypeId));
    } else {
      onDietTypesChange([...selectedDietTypes, dietTypeId]);
    }
  };

  const hasActiveFilters = selectedAllergens.length > 0 || selectedDietTypes.length > 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Search and main controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar platos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {selectedAllergens.length + selectedDietTypes.length}
              </Badge>
            )}
          </Button>
          
          <LanguageSelector />
          
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="bg-gradient-card border-glass">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Allergens */}
              <div>
                <h4 className="font-medium mb-3">Alérgenos</h4>
                <div className="flex flex-wrap gap-2">
                  {allergensList.map((allergen) => (
                    <Badge
                      key={allergen.id}
                      variant={selectedAllergens.includes(allergen.id) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => toggleAllergen(allergen.id)}
                    >
                      <span className="mr-1">{allergen.icon}</span>
                      {allergen.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Diet Types */}
              <div>
                <h4 className="font-medium mb-3">Tipo de dieta</h4>
                <div className="flex flex-wrap gap-2">
                  {dietTypes.map((dietType) => (
                    <Badge
                      key={dietType.id}
                      variant={selectedDietTypes.includes(dietType.slug) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => toggleDietType(dietType.slug)}
                    >
                      {dietType.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

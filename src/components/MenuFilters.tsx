
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllergenFilter from './AllergenFilter';
import DietFilter from './DietFilter';

interface MenuFiltersProps {
  selectedAllergens: string[];
  selectedDietTypes: number[];
  onAllergenChange: (allergens: string[]) => void;
  onDietTypeChange: (types: number[]) => void;
}

export default function MenuFilters({
  selectedAllergens,
  selectedDietTypes,
  onAllergenChange,
  onDietTypeChange
}: MenuFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFiltersCount = selectedAllergens.length + selectedDietTypes.length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros de carta</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="allergens" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="allergens">Alérgenos</TabsTrigger>
              <TabsTrigger value="diet">Dieta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="allergens" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Filtra platos que NO contengan estos alérgenos:
                </p>
                <AllergenFilter
                  selectedAllergens={selectedAllergens}
                  onAllergenChange={onAllergenChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="diet" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Filtra platos según tu tipo de dieta:
                </p>
                <DietFilter
                  selectedDietTypes={selectedDietTypes}
                  onDietTypeChange={onDietTypeChange}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {activeFiltersCount > 0 && (
          <div className="mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onAllergenChange([]);
                onDietTypeChange([]);
              }}
              className="w-full"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

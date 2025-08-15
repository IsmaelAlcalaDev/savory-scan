
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AllergenFilter from './AllergenFilter';
import DietFilter from './DietFilter';

interface UnifiedFiltersModalProps {
  selectedAllergens: string[];
  selectedDietTypes: number[];
  onAllergenChange: (allergens: string[]) => void;
  onDietTypeChange: (types: number[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function UnifiedFiltersModal({
  selectedAllergens,
  selectedDietTypes,
  onAllergenChange,
  onDietTypeChange,
  isOpen = false,
  onClose
}: UnifiedFiltersModalProps) {
  const activeFiltersCount = selectedAllergens.length + selectedDietTypes.length;

  const clearAllFilters = () => {
    onAllergenChange([]);
    onDietTypeChange([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de carta
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
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
              onClick={clearAllFilters}
              className="w-full"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

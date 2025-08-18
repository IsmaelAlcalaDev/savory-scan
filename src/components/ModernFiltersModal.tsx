
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ModernModal,
  ModernModalContent,
  ModernModalHeader,
  ModernModalBody,
  ModernModalTitle,
} from '@/components/ui/modern-modal';
import AllergenFilter from './AllergenFilter';
import DietFilter from './DietFilter';
import DishDietFilter from './DishDietFilter';
import SpiceFilter from './SpiceFilter';

interface ModernFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab?: 'restaurants' | 'dishes';
  selectedAllergens: string[];
  selectedDietTypes: number[];
  selectedDishDietTypes?: string[];
  selectedSpiceLevels?: number[];
  onAllergenChange: (allergens: string[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onDishDietTypeChange?: (types: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
  trigger?: ReactNode;
}

export default function ModernFiltersModal({
  open,
  onOpenChange,
  activeTab = 'restaurants',
  selectedAllergens,
  selectedDietTypes,
  selectedDishDietTypes = [],
  selectedSpiceLevels = [],
  onAllergenChange,
  onDietTypeChange,
  onDishDietTypeChange = () => {},
  onSpiceLevelChange = () => {},
  trigger
}: ModernFiltersModalProps) {
  
  const activeFiltersCount = selectedAllergens.length + 
    (activeTab === 'restaurants' ? selectedDietTypes.length : selectedDishDietTypes.length + selectedSpiceLevels.length);

  const clearAllFilters = () => {
    onAllergenChange([]);
    if (activeTab === 'restaurants') {
      onDietTypeChange([]);
    } else {
      onDishDietTypeChange([]);
      onSpiceLevelChange([]);
    }
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="relative flex items-center gap-2 rounded-full"
    >
      <Filter className="h-4 w-4" />
      Filtros
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      {/* Trigger */}
      <div onClick={() => onOpenChange(true)}>
        {trigger || defaultTrigger}
      </div>

      {/* Modal */}
      <ModernModal open={open} onOpenChange={onOpenChange}>
        <ModernModalContent className="max-w-lg">
          <ModernModalHeader>
            <ModernModalTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de carta
            </ModernModalTitle>
          </ModernModalHeader>
          
          <ModernModalBody className="space-y-0 px-0 pb-0">
            {/* Tabs */}
            <div className="px-6 pb-4">
              <Tabs defaultValue="allergens" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="allergens" className="text-lg">
                    Alérgenos
                  </TabsTrigger>
                  <TabsTrigger value="diet" className="text-lg">
                    Dieta
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="allergens" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-lg">
                        Filtra platos que NO contengan estos alérgenos:
                      </p>
                      <ScrollArea className="max-h-64">
                        <AllergenFilter
                          selectedAllergens={selectedAllergens}
                          onAllergenChange={onAllergenChange}
                        />
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="diet" className="mt-0">
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-lg">
                        Filtra platos según tu tipo de dieta:
                      </p>
                      <ScrollArea className="max-h-64">
                        {activeTab === 'restaurants' ? (
                          <DietFilter
                            selectedDietTypes={selectedDietTypes}
                            onDietTypeChange={onDietTypeChange}
                          />
                        ) : (
                          <div className="space-y-6">
                            <DishDietFilter
                              selectedDishDietTypes={selectedDishDietTypes}
                              onDishDietTypeChange={onDishDietTypeChange}
                            />
                            <SpiceFilter
                              selectedSpiceLevels={selectedSpiceLevels}
                              onSpiceLevelChange={onSpiceLevelChange}
                            />
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <div className="px-6 py-4 border-t border-border/30 bg-muted/10">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="w-full h-12 text-lg font-bold rounded-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </ModernModalBody>
        </ModernModalContent>
      </ModernModal>
    </>
  );
}

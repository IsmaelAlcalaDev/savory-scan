
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ModernModal,
  ModernModalContent,
  ModernModalHeader,
  ModernModalBody,
  ModernModalTitle,
} from '@/components/ui/modern-modal';
import { Filter, X } from 'lucide-react';

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
  onDishDietTypeChange,
  onSpiceLevelChange,
  trigger
}: ModernFiltersModalProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Mock data - in real app these would come from your data hooks
  const allergens = [
    'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Mariscos', 'Pescado', 'Soja', 'Sulfitos'
  ];

  const dietTypes = [
    { id: 1, name: 'Vegano' },
    { id: 2, name: 'Vegetariano' },
    { id: 3, name: 'Sin Gluten' },
    { id: 4, name: 'Keto' },
    { id: 5, name: 'Paleo' }
  ];

  const dishDietTypes = [
    'Vegano', 'Vegetariano', 'Sin Gluten', 'Keto', 'Paleo', 'Mediterráneo'
  ];

  const spiceLevels = [
    { id: 1, name: 'Suave', emoji: '🌶️' },
    { id: 2, name: 'Medio', emoji: '🌶️🌶️' },
    { id: 3, name: 'Picante', emoji: '🌶️🌶️🌶️' },
    { id: 4, name: 'Muy Picante', emoji: '🌶️🌶️🌶️🌶️' }
  ];

  const handleAllergenToggle = (allergen: string) => {
    const newAllergens = selectedAllergens.includes(allergen)
      ? selectedAllergens.filter(a => a !== allergen)
      : [...selectedAllergens, allergen];
    onAllergenChange(newAllergens);
  };

  const handleDietTypeToggle = (dietTypeId: number) => {
    const newDietTypes = selectedDietTypes.includes(dietTypeId)
      ? selectedDietTypes.filter(id => id !== dietTypeId)
      : [...selectedDietTypes, dietTypeId];
    onDietTypeChange(newDietTypes);
  };

  const handleDishDietTypeToggle = (dietType: string) => {
    if (!onDishDietTypeChange) return;
    const newDishDietTypes = selectedDishDietTypes.includes(dietType)
      ? selectedDishDietTypes.filter(t => t !== dietType)
      : [...selectedDishDietTypes, dietType];
    onDishDietTypeChange(newDishDietTypes);
  };

  const handleSpiceLevelToggle = (level: number) => {
    if (!onSpiceLevelChange) return;
    const newSpiceLevels = selectedSpiceLevels.includes(level)
      ? selectedSpiceLevels.filter(l => l !== level)
      : [...selectedSpiceLevels, level];
    onSpiceLevelChange(newSpiceLevels);
  };

  const clearAllFilters = () => {
    onAllergenChange([]);
    onDietTypeChange([]);
    if (onDishDietTypeChange) onDishDietTypeChange([]);
    if (onSpiceLevelChange) onSpiceLevelChange([]);
  };

  const totalFilters = selectedAllergens.length + selectedDietTypes.length + selectedDishDietTypes.length + selectedSpiceLevels.length;

  return (
    <ModernModal open={open} onOpenChange={onOpenChange}>
      <ModernModalContent className="max-w-lg">
        <ModernModalHeader>
          <ModernModalTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros {totalFilters > 0 && `(${totalFilters})`}
          </ModernModalTitle>
        </ModernModalHeader>
        
        <ModernModalBody>
          <div className="space-y-0 px-0 pb-0">
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'restaurants' | 'dishes')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/30 rounded-full p-1">
                <TabsTrigger 
                  value="restaurants" 
                  className="rounded-full font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Restaurantes
                </TabsTrigger>
                <TabsTrigger 
                  value="dishes"
                  className="rounded-full font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Platos
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="max-h-96">
                <TabsContent value="restaurants" className="space-y-6 px-6 pb-6">
                  {/* Alérgenos */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Alérgenos a evitar</h3>
                    <div className="flex flex-wrap gap-2">
                      {allergens.map((allergen) => (
                        <Badge
                          key={allergen}
                          variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-3 py-1 ${
                            selectedAllergens.includes(allergen)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleAllergenToggle(allergen)}
                        >
                          {allergen}
                          {selectedAllergens.includes(allergen) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tipos de dieta */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Tipos de dieta</h3>
                    <div className="flex flex-wrap gap-2">
                      {dietTypes.map((dietType) => (
                        <Badge
                          key={dietType.id}
                          variant={selectedDietTypes.includes(dietType.id) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-3 py-1 ${
                            selectedDietTypes.includes(dietType.id)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleDietTypeToggle(dietType.id)}
                        >
                          {dietType.name}
                          {selectedDietTypes.includes(dietType.id) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dishes" className="space-y-6 px-6 pb-6">
                  {/* Tipos de dieta para platos */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Tipos de dieta</h3>
                    <div className="flex flex-wrap gap-2">
                      {dishDietTypes.map((dietType) => (
                        <Badge
                          key={dietType}
                          variant={selectedDishDietTypes.includes(dietType) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-3 py-1 ${
                            selectedDishDietTypes.includes(dietType)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleDishDietTypeToggle(dietType)}
                        >
                          {dietType}
                          {selectedDishDietTypes.includes(dietType) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Niveles de picante */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Nivel de picante</h3>
                    <div className="flex flex-wrap gap-2">
                      {spiceLevels.map((level) => (
                        <Badge
                          key={level.id}
                          variant={selectedSpiceLevels.includes(level.id) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-3 py-1 ${
                            selectedSpiceLevels.includes(level.id)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleSpiceLevelToggle(level.id)}
                        >
                          <span className="mr-1">{level.emoji}</span>
                          {level.name}
                          {selectedSpiceLevels.includes(level.id) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Alérgenos para platos */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Alérgenos a evitar</h3>
                    <div className="flex flex-wrap gap-2">
                      {allergens.map((allergen) => (
                        <Badge
                          key={allergen}
                          variant={selectedAllergens.includes(allergen) ? "default" : "outline"}
                          className={`cursor-pointer rounded-full px-3 py-1 ${
                            selectedAllergens.includes(allergen)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleAllergenToggle(allergen)}
                        >
                          {allergen}
                          {selectedAllergens.includes(allergen) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Footer with actions */}
            {totalFilters > 0 && (
              <div className="px-6 py-4 border-t border-border/30 bg-muted/10 flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Limpiar todo
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-full"
                >
                  Aplicar filtros
                </Button>
              </div>
            )}
          </div>
        </ModernModalBody>
      </ModernModalContent>
    </ModernModal>
  );
}

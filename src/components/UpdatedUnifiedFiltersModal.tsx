
import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import ImprovedAllergenFilter from './ImprovedAllergenFilter';
import SimpleDietFilter from './SimpleDietFilter';
import CustomTagsFilter from './CustomTagsFilter';
import SpiceLevelFilter from './SpiceLevelFilter';

interface UpdatedUnifiedFiltersModalProps {
  // Filtros existentes
  selectedPriceRanges: string[];
  selectedFoodTypes: number[];
  onPriceRangeChange: (ranges: string[]) => void;
  onFoodTypeChange: (types: number[]) => void;
  
  // Nuevos filtros
  selectedDietOptions: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isHealthy?: boolean;
  };
  onDietOptionsChange: (options: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isHealthy?: boolean;
  }) => void;
  
  selectedCustomTags: string[];
  onCustomTagsChange: (tags: string[]) => void;
  
  excludedAllergens: string[];
  onAllergensChange: (allergens: string[]) => void;
  
  selectedSpiceLevels: number[];
  onSpiceLevelsChange: (levels: number[]) => void;
  
  trigger?: ReactNode;
}

export default function UpdatedUnifiedFiltersModal({
  selectedPriceRanges,
  selectedFoodTypes,
  onPriceRangeChange,
  onFoodTypeChange,
  selectedDietOptions,
  onDietOptionsChange,
  selectedCustomTags,
  onCustomTagsChange,
  excludedAllergens,
  onAllergensChange,
  selectedSpiceLevels,
  onSpiceLevelsChange,
  trigger
}: UpdatedUnifiedFiltersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const activeFiltersCount = selectedPriceRanges.length + 
    selectedFoodTypes.length + 
    Object.values(selectedDietOptions).filter(Boolean).length +
    selectedCustomTags.length +
    excludedAllergens.length +
    selectedSpiceLevels.length;

  const clearAllFilters = () => {
    onPriceRangeChange([]);
    onFoodTypeChange([]);
    onDietOptionsChange({});
    onCustomTagsChange([]);
    onAllergensChange([]);
    onSpiceLevelsChange([]);
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="relative flex items-center gap-2"
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

  const ModalContent = () => (
    <div className={`flex flex-col ${isMobile ? 'h-full' : ''}`}>
      {/* Header */}
      <div className={`flex-shrink-0 ${isMobile ? 'border-b border-gray-100 pb-4' : ''}`}>
        {isMobile ? (
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros de platos
            </SheetTitle>
          </SheetHeader>
        ) : (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de platos
            </DialogTitle>
          </DialogHeader>
        )}
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'flex-1 overflow-y-auto px-6 py-4 min-h-0' : 'mt-4'}`}>
        <Tabs defaultValue="diet" className="w-full">
          <TabsList className={`grid w-full grid-cols-4 ${isMobile ? 'h-12' : ''}`}>
            <TabsTrigger value="diet" className={isMobile ? 'text-sm' : 'text-xs'}>
              Dieta
            </TabsTrigger>
            <TabsTrigger value="allergens" className={isMobile ? 'text-sm' : 'text-xs'}>
              Alérgenos
            </TabsTrigger>
            <TabsTrigger value="tags" className={isMobile ? 'text-sm' : 'text-xs'}>
              Etiquetas
            </TabsTrigger>
            <TabsTrigger value="spice" className={isMobile ? 'text-sm' : 'text-xs'}>
              Picante
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="diet" className={`${isMobile ? 'mt-6' : 'mt-4'}`}>
            <div className="space-y-4">
              <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>
                Filtrar platos según tipo de dieta:
              </p>
              <SimpleDietFilter
                selectedDietOptions={selectedDietOptions}
                onDietOptionsChange={onDietOptionsChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="allergens" className={`${isMobile ? 'mt-6' : 'mt-4'}`}>
            <ImprovedAllergenFilter
              excludedAllergens={excludedAllergens}
              onAllergensChange={onAllergensChange}
            />
          </TabsContent>
          
          <TabsContent value="tags" className={`${isMobile ? 'mt-6' : 'mt-4'}`}>
            <div className="space-y-4">
              <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>
                Filtrar por etiquetas personalizadas:
              </p>
              <CustomTagsFilter
                selectedTags={selectedCustomTags}
                onTagsChange={onCustomTagsChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="spice" className={`${isMobile ? 'mt-6' : 'mt-4'}`}>
            <SpiceLevelFilter
              selectedLevels={selectedSpiceLevels}
              onLevelsChange={onSpiceLevelsChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer with buttons */}
      {activeFiltersCount > 0 && (
        <div className={`flex-shrink-0 ${isMobile ? 'p-4 border-t border-gray-100 bg-background' : 'mt-6'}`}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className={`w-full ${isMobile ? 'h-12 text-base' : ''}`}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
        
        <SheetContent 
          side="bottom" 
          className="p-0 h-[100dvh] rounded-none max-h-[100dvh]"
        >
          <ModalContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
}

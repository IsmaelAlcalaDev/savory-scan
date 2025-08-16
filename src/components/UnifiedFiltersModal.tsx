
import { useState, ReactNode, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
import AllergenFilter from './AllergenFilter';
import DietFilter from './DietFilter';

interface UnifiedFiltersModalProps {
  selectedAllergens: string[];
  selectedDietTypes: number[];
  onAllergenChange: (allergens: string[]) => void;
  onDietTypeChange: (types: number[]) => void;
  trigger?: ReactNode;
}

export default function UnifiedFiltersModal({
  selectedAllergens,
  selectedDietTypes,
  onAllergenChange,
  onDietTypeChange,
  trigger
}: UnifiedFiltersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Lock scroll when modal is open
  useModalScrollLock(isOpen);
  
  // Memoize activeFiltersCount to prevent unnecessary re-renders
  const activeFiltersCount = useMemo(() => {
    return selectedAllergens.length + selectedDietTypes.length;
  }, [selectedAllergens.length, selectedDietTypes.length]);

  // Stabilize callback functions
  const handleAllergenChange = useCallback((allergens: string[]) => {
    onAllergenChange(allergens);
  }, [onAllergenChange]);

  const handleDietTypeChange = useCallback((types: number[]) => {
    onDietTypeChange(types);
  }, [onDietTypeChange]);

  const clearAllFilters = useCallback(() => {
    onAllergenChange([]);
    onDietTypeChange([]);
  }, [onAllergenChange, onDietTypeChange]);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

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
    <div className={`flex flex-col ${isMobile ? 'h-full' : ''}`} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className={`flex-shrink-0 ${isMobile ? 'border-b border-gray-100 pb-4' : ''}`}>
        {isMobile ? (
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtros de carta
            </SheetTitle>
          </SheetHeader>
        ) : (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de carta
            </DialogTitle>
          </DialogHeader>
        )}
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'flex-1 overflow-y-auto px-6 py-4 min-h-0' : 'mt-4'}`}>
        <Tabs defaultValue="allergens" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-12' : ''}`}>
            <TabsTrigger value="allergens" className={isMobile ? 'text-base' : ''}>
              Alérgenos
            </TabsTrigger>
            <TabsTrigger value="diet" className={isMobile ? 'text-base' : ''}>
              Dieta
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="allergens" className={`${isMobile ? 'mt-6' : 'mt-4'}`}>
            <div className="space-y-4">
              <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>
                Filtra platos que NO contengan estos alérgenos:
              </p>
              <AllergenFilter
                selectedAllergens={selectedAllergens}
                onAllergenChange={handleAllergenChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="diet" className={`${isMobile ? 'mt-6' : 'mt-4'}`}>
            <div className="space-y-4">
              <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>
                Filtra platos según tu tipo de dieta:
              </p>
              <DietFilter
                selectedDietTypes={selectedDietTypes}
                onDietTypeChange={handleDietTypeChange}
              />
            </div>
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
      <Sheet open={isOpen} onOpenChange={handleModalOpenChange}>
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
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
}

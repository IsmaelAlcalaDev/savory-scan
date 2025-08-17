
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, Carrot, Wheat, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SimpleDietFilterProps {
  selectedDietCategories: string[];
  onDietCategoryChange: (categories: string[]) => void;
}

const DIET_OPTIONS = [
  {
    id: 'vegetarian',
    name: 'Vegetariano',
    icon: Leaf,
    description: 'Restaurantes con al menos 20% de platos vegetarianos',
    color: 'text-green-600'
  },
  {
    id: 'vegan',
    name: 'Vegano',
    icon: Carrot,
    description: 'Restaurantes con al menos 20% de platos veganos',
    color: 'text-emerald-600'
  },
  {
    id: 'gluten_free',
    name: 'Sin Gluten',
    icon: Wheat,
    description: 'Restaurantes con al menos 20% de platos sin gluten',
    color: 'text-amber-600'
  },
  {
    id: 'healthy',
    name: 'Saludable',
    icon: Heart,
    description: 'Restaurantes con al menos 20% de platos saludables',
    color: 'text-pink-600'
  }
];

export default function SimpleDietFilter({ 
  selectedDietCategories, 
  onDietCategoryChange 
}: SimpleDietFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleToggle = (categoryId: string) => {
    if (selectedDietCategories.includes(categoryId)) {
      onDietCategoryChange(selectedDietCategories.filter(id => id !== categoryId));
    } else {
      onDietCategoryChange([...selectedDietCategories, categoryId]);
    }
  };

  const clearAll = () => {
    onDietCategoryChange([]);
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="relative flex items-center gap-2"
    >
      <Leaf className="h-4 w-4" />
      Dieta
      {selectedDietCategories.length > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
          {selectedDietCategories.length}
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
              <Leaf className="h-5 w-5" />
              Filtros de Dieta
            </SheetTitle>
          </SheetHeader>
        ) : (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Filtros de Dieta
            </DialogTitle>
          </DialogHeader>
        )}
        <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
          Selecciona tipos de dieta para encontrar restaurantes especializados
        </p>
      </div>

      {/* Content */}
      <div className={`${isMobile ? 'flex-1 overflow-y-auto px-6 py-4 min-h-0' : 'mt-4'}`}>
        <div className="space-y-4">
          {DIET_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedDietCategories.includes(option.id);
            
            return (
              <div
                key={option.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => handleToggle(option.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggle(option.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${option.color}`} />
                    <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                      {option.name}
                    </span>
                  </div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {selectedDietCategories.length > 0 && (
        <div className={`flex-shrink-0 ${isMobile ? 'p-4 border-t border-gray-100 bg-background' : 'mt-6'}`}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
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
          {defaultTrigger}
        </SheetTrigger>
        
        <SheetContent 
          side="bottom" 
          className="p-0 h-[80dvh] rounded-t-lg max-h-[80dvh]"
        >
          <ModalContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
}

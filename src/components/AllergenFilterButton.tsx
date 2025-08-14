
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import AllergenFilter from './AllergenFilter';

interface AllergenFilterButtonProps {
  selectedAllergens: string[];
  onAllergenChange: (allergens: string[]) => void;
}

export default function AllergenFilterButton({ selectedAllergens, onAllergenChange }: AllergenFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alérgenos
          {selectedAllergens.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {selectedAllergens.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Filtrar por Alérgenos
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona los alérgenos que quieres evitar
          </p>
          <AllergenFilter
            selectedAllergens={selectedAllergens}
            onAllergenChange={onAllergenChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

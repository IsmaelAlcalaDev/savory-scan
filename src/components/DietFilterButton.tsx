
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Leaf } from 'lucide-react';
import { useState } from 'react';
import DietFilter from './DietFilter';

interface DietFilterButtonProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilterButton({ selectedDietTypes, onDietTypeChange }: DietFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative gap-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-0 text-xs px-3 py-1 h-7"
        >
          <Leaf className="h-3 w-3" />
          Dieta
          {selectedDietTypes.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
              {selectedDietTypes.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Filtrar por Tipo de Dieta
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona los tipos de dieta que prefieres
          </p>
          <DietFilter
            selectedDietTypes={selectedDietTypes}
            onDietTypeChange={onDietTypeChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

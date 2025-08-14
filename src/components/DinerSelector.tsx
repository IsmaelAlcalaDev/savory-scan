
import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface DinerSelectorProps {
  onDinerSelect: (dinerId: string) => void;
  onManageDiners: () => void;
}

export default function DinerSelector({ onDinerSelect, onManageDiners }: DinerSelectorProps) {
  const { diners } = useOrderSimulator();

  // If only one diner, add directly without showing selector
  if (diners.length === 1) {
    onDinerSelect(diners[0].id);
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between bg-background"
        >
          Seleccionar comensal
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Asignar plato a:
          </div>
          {diners.map((diner) => (
            <Button
              key={diner.id}
              variant="ghost"
              size="sm"
              onClick={() => onDinerSelect(diner.id)}
              className="w-full justify-start h-8"
            >
              {diner.name}
            </Button>
          ))}
          <hr className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageDiners}
            className="w-full justify-start h-8 text-primary"
          >
            Gestionar comensales
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

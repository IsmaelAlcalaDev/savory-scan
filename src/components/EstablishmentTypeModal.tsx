
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from 'react';

interface EstablishmentTypeModalProps {
  selectedEstablishmentTypes: number[];
  onEstablishmentTypeChange: (types: number[]) => void;
}

const mockEstablishmentTypes = [
  { id: 1, name: 'Restaurante' },
  { id: 2, name: 'Cafetería' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Food Truck' },
];

export default function EstablishmentTypeModal({
  selectedEstablishmentTypes,
  onEstablishmentTypeChange
}: EstablishmentTypeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeToggle = (typeId: number) => {
    const newTypes = selectedEstablishmentTypes.includes(typeId)
      ? selectedEstablishmentTypes.filter(id => id !== typeId)
      : [...selectedEstablishmentTypes, typeId];
    
    onEstablishmentTypeChange(newTypes);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="mb-4"
      >
        Tipo de Establecimiento ({selectedEstablishmentTypes.length})
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tipo de Establecimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {mockEstablishmentTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`establishment-${type.id}`}
                  checked={selectedEstablishmentTypes.includes(type.id)}
                  onCheckedChange={() => handleTypeToggle(type.id)}
                />
                <label htmlFor={`establishment-${type.id}`}>
                  {type.name}
                </label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

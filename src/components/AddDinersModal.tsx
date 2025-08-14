
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal-wrapper';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface AddDinersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDinersModal({ isOpen, onClose }: AddDinersModalProps) {
  const { diners, addDiner, removeDiner } = useOrderSimulator();
  const [newDinerName, setNewDinerName] = useState('');

  const handleAddDiner = () => {
    if (newDinerName.trim()) {
      addDiner(newDinerName.trim());
      setNewDinerName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDiner();
    }
  };

  return (
    <ModalWrapper open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Gestionar Comensales</ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          {/* Current Diners */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Comensales actuales:</h4>
            <div className="space-y-2">
              {diners.map((diner) => (
                <div key={diner.id} className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">{diner.name}</span>
                  {diners.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiner(diner.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Diner */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Añadir comensal:</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del comensal"
                value={newDinerName}
                onChange={(e) => setNewDinerName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleAddDiner}
                disabled={!newDinerName.trim()}
                size="sm"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cerrar
            </Button>
          </div>
        </div>
      </ModalContent>
    </ModalWrapper>
  );
}


import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal-wrapper';

interface SaveTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<{ success: boolean; error?: string }>;
  defaultName?: string;
  isLoading?: boolean;
}

export default function SaveTicketModal({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = '',
  isLoading = false 
}: SaveTicketModalProps) {
  const [ticketName, setTicketName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!ticketName.trim()) {
      setError('Por favor ingresa un nombre para el ticket');
      return;
    }

    setError(null);
    const result = await onSave(ticketName.trim());
    
    if (result.success) {
      setTicketName('');
      onClose();
    } else {
      setError(result.error || 'Error al guardar el ticket');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleClose = () => {
    setTicketName('');
    setError(null);
    onClose();
  };

  return (
    <ModalWrapper open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Guardar Ticket
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="ticket-name" className="block text-sm font-medium mb-2">
              Nombre del ticket
            </label>
            <Input
              id="ticket-name"
              placeholder="Ej: Cena familiar, Almuerzo trabajo..."
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading || !ticketName.trim()}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </ModalContent>
    </ModalWrapper>
  );
}

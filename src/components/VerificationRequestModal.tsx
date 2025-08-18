
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRestaurantVerification } from '@/hooks/useRestaurantVerification';
import { toast } from 'sonner';
import { Shield, ShieldCheck, Crown } from 'lucide-react';

interface VerificationRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  restaurantName: string;
}

export default function VerificationRequestModal({
  open,
  onOpenChange,
  restaurantId,
  restaurantName
}: VerificationRequestModalProps) {
  const { createVerificationRequest, loading } = useRestaurantVerification();
  const [formData, setFormData] = useState({
    requested_level: 'basic' as 'basic' | 'standard' | 'premium',
    business_name: restaurantName,
    business_type: '',
    contact_phone: '',
    contact_email: '',
    business_address: '',
    additional_info: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createVerificationRequest({
        restaurant_id: restaurantId,
        ...formData
      });
      
      toast.success('Solicitud de verificación enviada exitosamente');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        requested_level: 'basic',
        business_name: restaurantName,
        business_type: '',
        contact_phone: '',
        contact_email: '',
        business_address: '',
        additional_info: ''
      });
    } catch (error) {
      toast.error('Error al enviar la solicitud de verificación');
      console.error('Error:', error);
    }
  };

  const verificationLevels = [
    {
      value: 'basic',
      label: 'Básico',
      icon: Shield,
      description: 'Verificación automática de datos básicos',
      color: 'text-gray-600'
    },
    {
      value: 'standard',
      label: 'Estándar',
      icon: ShieldCheck,
      description: 'Verificación manual con documentos oficiales',
      color: 'text-blue-600'
    },
    {
      value: 'premium',
      label: 'Premium',
      icon: Crown,
      description: 'Verificación exhaustiva con inspección física',
      color: 'text-emerald-600'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Verificación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="level">Nivel de Verificación</Label>
              <Select
                value={formData.requested_level}
                onValueChange={(value: 'basic' | 'standard' | 'premium') =>
                  setFormData(prev => ({ ...prev, requested_level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {verificationLevels.map((level) => {
                    const Icon = level.icon;
                    return (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${level.color}`} />
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {level.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="business_name">Nombre del Negocio</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="business_type">Tipo de Negocio</Label>
              <Input
                id="business_type"
                value={formData.business_type}
                onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                placeholder="Ej: Restaurante, Cafetería, Bar..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Email de Contacto</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="business_address">Dirección del Negocio</Label>
              <Textarea
                id="business_address"
                value={formData.business_address}
                onChange={(e) => setFormData(prev => ({ ...prev, business_address: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="additional_info">Información Adicional</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                placeholder="Cualquier información adicional que pueda ayudar con la verificación..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

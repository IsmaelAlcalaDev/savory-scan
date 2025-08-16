
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import EmailConfirmationAlert from './EmailConfirmationAlert';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendConfirmation?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  email,
  onResendConfirmation,
  onSwitchToLogin
}: RegistrationSuccessModalProps) {
  const handleSwitchToLogin = () => {
    onClose();
    onSwitchToLogin?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <DialogTitle className="text-xl">¡Registro Exitoso!</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Ya casi terminamos!
            </h3>
            <p className="text-gray-600">
              Tu cuenta ha sido creada exitosamente. Solo necesitas confirmarla.
            </p>
          </div>

          <EmailConfirmationAlert 
            email={email}
            onResendEmail={onResendConfirmation}
          />

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Próximos pasos:</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Revisa tu correo (incluyendo spam)</li>
              <li>2. Haz clic en el enlace de confirmación</li>
              <li>3. ¡Inicia sesión y disfruta de SavorySearch!</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleSwitchToLogin} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Ir al inicio de sesión
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              El enlace de confirmación expira en 24 horas por seguridad
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

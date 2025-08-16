
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useSecureAuthFlow } from '@/hooks/useSecureAuthFlow';

interface EmailConfirmationAlertProps {
  email: string;
  onResendEmail?: () => void;
}

export default function EmailConfirmationAlert({ 
  email, 
  onResendEmail 
}: EmailConfirmationAlertProps) {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (onResendEmail) {
      setIsResending(true);
      try {
        await onResendEmail();
        setResent(true);
        setTimeout(() => setResent(false), 3000);
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Mail className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex flex-col gap-3">
        <div className="text-blue-800">
          <strong>¡Confirma tu cuenta!</strong>
        </div>
        <div className="text-blue-700 text-sm">
          Te hemos enviado un correo de confirmación a{' '}
          <strong>{email}</strong>. Haz clic en el enlace del correo para activar tu cuenta.
        </div>
        <div className="text-blue-600 text-xs">
          ⚠️ Revisa tu carpeta de spam si no encuentras el correo
        </div>
        
        {onResendEmail && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isResending || resent}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              {isResending ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : resent ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <Mail className="h-3 w-3 mr-1" />
              )}
              {resent ? 'Correo enviado' : 'Reenviar correo'}
            </Button>
            {resent && (
              <span className="text-xs text-green-600">
                ✅ Correo reenviado exitosamente
              </span>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

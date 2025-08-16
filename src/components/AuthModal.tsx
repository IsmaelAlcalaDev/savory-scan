
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
import SecureRegistrationForm from './SecureRegistrationForm';
import SecureLoginForm from './SecureLoginForm';
import AccountProfileView from './AccountProfileView';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, loading } = useAuth();
  const isMobile = useMobile();
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
  };

  // Show loading state
  if (loading) {
    const LoadingContent = (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

    return isMobile ? (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          {LoadingContent}
        </SheetContent>
      </Sheet>
    ) : (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          {LoadingContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Show profile view if user is authenticated
  if (user) {
    return isMobile ? (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <AccountProfileView onClose={onClose} />
        </SheetContent>
      </Sheet>
    ) : (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <AccountProfileView onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  // Show auth forms for non-authenticated users
  const AuthContent = (
    <div className="p-4">
      {isLogin ? (
        <SecureLoginForm 
          onSuccess={handleSuccess}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <SecureRegistrationForm 
          onSuccess={handleSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );

  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        {AuthContent}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        {AuthContent}
      </DialogContent>
    </Dialog>
  );
}

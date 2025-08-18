
import ModernAuthModal from './ModernAuthModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <ModernAuthModal 
      open={isOpen} 
      onOpenChange={onClose} 
    />
  );
}

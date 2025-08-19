
import ModernProfileModal from './ModernProfileModal';

interface FullScreenProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FullScreenProfileModal({ open, onOpenChange }: FullScreenProfileModalProps) {
  return (
    <ModernProfileModal 
      open={open} 
      onOpenChange={onOpenChange} 
    />
  );
}

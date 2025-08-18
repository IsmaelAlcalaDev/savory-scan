
import { ModernFiltersModal } from './ModernFiltersModal';
import { ReactNode } from 'react';

interface UnifiedFiltersModalProps {
  activeTab?: 'restaurants' | 'dishes';
  selectedAllergens: string[];
  selectedDietTypes: number[];
  selectedDishDietTypes?: string[];
  selectedSpiceLevels?: number[];
  onAllergenChange: (allergens: string[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onDishDietTypeChange?: (types: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
  trigger?: ReactNode;
}

export default function UnifiedFiltersModal(props: UnifiedFiltersModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModernFiltersModal 
      open={isOpen}
      onOpenChange={setIsOpen}
      {...props}
    />
  );
}

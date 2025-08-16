
import React from 'react';
import { MapPin, Star, Euro, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuickActionTagsProps {
  onOpenNowToggle: () => void;
  onHighRatedToggle: () => void;
  onBudgetFriendlyToggle: () => void;
  isOpenNow: boolean;
  isHighRated: boolean;
  isBudgetFriendly: boolean;
}

export const QuickActionTags = ({
  onOpenNowToggle,
  onHighRatedToggle,
  onBudgetFriendlyToggle,
  isOpenNow,
  isHighRated,
  isBudgetFriendly,
}: QuickActionTagsProps) => {
  const baseClasses = "cursor-pointer transition-colors text-sm font-medium px-4 py-2 rounded-full border-0 flex items-center gap-2";
  const normalClasses = "text-black bg-[#F3F3F3] hover:bg-[#D0D0D0]";
  const activeClasses = "text-white bg-black hover:bg-black";

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge
        variant="outline"
        className={`${baseClasses} ${isOpenNow ? activeClasses : normalClasses}`}
        onClick={onOpenNowToggle}
        style={{ fontSize: '14px' }}
      >
        <Clock className="w-3 h-3" />
        Abierto ahora
      </Badge>
      
      <Badge
        variant="outline"
        className={`${baseClasses} ${isHighRated ? activeClasses : normalClasses}`}
        onClick={onHighRatedToggle}
        style={{ fontSize: '14px' }}
      >
        <Star className="w-3 h-3" />
        Mejor valorados
      </Badge>
      
      <Badge
        variant="outline"
        className={`${baseClasses} ${isBudgetFriendly ? activeClasses : normalClasses}`}
        onClick={onBudgetFriendlyToggle}
        style={{ fontSize: '14px' }}
      >
        <Euro className="w-3 h-3" />
        Económico
      </Badge>
    </div>
  );
};

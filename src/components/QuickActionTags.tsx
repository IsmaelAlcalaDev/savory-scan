
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
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge
        variant={isOpenNow ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/80 transition-colors"
        onClick={onOpenNowToggle}
      >
        <Clock className="w-3 h-3 mr-1" />
        Abierto ahora
      </Badge>
      
      <Badge
        variant={isHighRated ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/80 transition-colors"
        onClick={onHighRatedToggle}
      >
        <Star className="w-3 h-3 mr-1" />
        Mejor valorados
      </Badge>
      
      <Badge
        variant={isBudgetFriendly ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/80 transition-colors"
        onClick={onBudgetFriendlyToggle}
      >
        <Euro className="w-3 h-3 mr-1" />
        Económico
      </Badge>
    </div>
  );
};

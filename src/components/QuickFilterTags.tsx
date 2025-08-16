
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface QuickFilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedPriceRanges: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  selectedSpiceLevels?: number[];
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  onPriceRangeChange: (ranges: string[]) => void;
  onHighRatedChange: (value: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
  onOpenNowChange: (value: boolean) => void;
  onBudgetFriendlyChange: (value: boolean) => void;
}

export default function QuickFilterTags({
  activeTab,
  selectedPriceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  selectedSpiceLevels = [],
  isOpenNow,
  isBudgetFriendly,
  onPriceRangeChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietTypeChange,
  onSpiceLevelChange = () => {},
  onOpenNowChange,
  onBudgetFriendlyChange
}: QuickFilterTagsProps) {

  const quickFilters = [
    {
      key: 'budget',
      label: 'Económico',
      active: isBudgetFriendly,
      onClick: () => onBudgetFriendlyChange(!isBudgetFriendly)
    },
    {
      key: 'highRated',
      label: 'Bien valorado',
      active: isHighRated,
      onClick: () => onHighRatedChange(!isHighRated)
    },
    {
      key: 'openNow',
      label: 'Abierto ahora',
      active: isOpenNow,
      onClick: () => onOpenNowChange(!isOpenNow)
    }
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
        {quickFilters.map((filter) => (
          <Button
            key={filter.key}
            size="sm"
            variant={filter.active ? "default" : "outline"}
            className={`px-3 py-1.5 h-auto rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
              filter.active 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
            }`}
            onClick={filter.onClick}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

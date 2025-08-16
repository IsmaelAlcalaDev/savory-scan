
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { SPICE_LEVEL_OPTIONS } from '@/types/dishFilters';
import { Info } from 'lucide-react';

interface SpiceLevelFilterProps {
  selectedLevels: number[];
  onLevelsChange: (levels: number[]) => void;
}

export default function SpiceLevelFilter({ selectedLevels, onLevelsChange }: SpiceLevelFilterProps) {
  const isMobile = useIsMobile();

  const handleLevelToggle = (level: number) => {
    const newSelected = selectedLevels.includes(level)
      ? selectedLevels.filter(l => l !== level)
      : [...selectedLevels, level];
    onLevelsChange(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-orange-700">
          Algunos platos pueden no tener información de nivel de picante
        </p>
      </div>
      
      <div className={`space-y-${isMobile ? '4' : '3'}`}>
        {SPICE_LEVEL_OPTIONS.map((option) => (
          <div key={option.level} className={`flex items-center ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
            <Checkbox 
              id={`spice-${option.level}`}
              checked={selectedLevels.includes(option.level)}
              onCheckedChange={() => handleLevelToggle(option.level)}
              className={isMobile ? 'w-6 h-6' : ''}
            />
            <label 
              htmlFor={`spice-${option.level}`}
              className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 ${
                isMobile ? 'text-base min-h-[44px] flex items-center' : 'text-sm'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span>{option.name}</span>
                  <span className="text-xs">
                    {'🌶️'.repeat(Math.max(1, option.level))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

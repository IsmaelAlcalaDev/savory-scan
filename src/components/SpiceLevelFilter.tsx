
import { useState } from 'react';
import { ChevronDown, Flame } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SpiceLevelFilterProps {
  selectedSpiceLevels: number[];
  onSpiceLevelChange: (spiceLevels: number[]) => void;
}

const spiceLevels = [
  { id: 0, label: 'Sin picante', icon: '🟢' },
  { id: 1, label: 'Suave', icon: '🟡' },
  { id: 2, label: 'Medio', icon: '🟠' },
  { id: 3, label: 'Picante', icon: '🔴' },
  { id: 4, label: 'Muy picante', icon: '🌶️' }
];

export default function SpiceLevelFilter({ selectedSpiceLevels, onSpiceLevelChange }: SpiceLevelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSpiceLevelToggle = (levelId: number) => {
    const newSelected = selectedSpiceLevels.includes(levelId)
      ? selectedSpiceLevels.filter(id => id !== levelId)
      : [...selectedSpiceLevels, levelId];
    onSpiceLevelChange(newSelected);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Nivel de Picante
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {spiceLevels.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`spice-${level.id}`}
                    checked={selectedSpiceLevels.includes(level.id)}
                    onCheckedChange={() => handleSpiceLevelToggle(level.id)}
                  />
                  <label 
                    htmlFor={`spice-${level.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <span>{level.icon}</span>
                    {level.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

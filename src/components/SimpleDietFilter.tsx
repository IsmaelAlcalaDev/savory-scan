
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';

interface DietOption {
  key: 'isVegetarian' | 'isVegan' | 'isGlutenFree' | 'isHealthy';
  name: string;
  icon: string;
  description: string;
}

const DIET_OPTIONS: DietOption[] = [
  {
    key: 'isVegetarian',
    name: 'Vegetariano',
    icon: '🥬',
    description: 'Sin carne ni pescado'
  },
  {
    key: 'isVegan',
    name: 'Vegano',
    icon: '🌱',
    description: 'Sin productos animales'
  },
  {
    key: 'isGlutenFree',
    name: 'Sin Gluten',
    icon: '🌾',
    description: 'Para celíacos'
  },
  {
    key: 'isHealthy',
    name: 'Saludable',
    icon: '💚',
    description: 'Opción equilibrada'
  }
];

interface SimpleDietFilterProps {
  selectedDietOptions: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isHealthy?: boolean;
  };
  onDietOptionsChange: (options: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isHealthy?: boolean;
  }) => void;
}

export default function SimpleDietFilter({ selectedDietOptions, onDietOptionsChange }: SimpleDietFilterProps) {
  const isMobile = useIsMobile();

  const handleOptionToggle = (key: DietOption['key']) => {
    const newOptions = {
      ...selectedDietOptions,
      [key]: !selectedDietOptions[key]
    };
    onDietOptionsChange(newOptions);
  };

  return (
    <div className={`space-y-${isMobile ? '4' : '3'}`}>
      {DIET_OPTIONS.map((option) => (
        <div key={option.key} className={`flex items-center ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
          <Checkbox 
            id={`diet-${option.key}`}
            checked={selectedDietOptions[option.key] || false}
            onCheckedChange={() => handleOptionToggle(option.key)}
            className={isMobile ? 'w-6 h-6' : ''}
          />
          <label 
            htmlFor={`diet-${option.key}`}
            className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 flex-1 ${
              isMobile ? 'text-base min-h-[44px]' : 'text-sm'
            }`}
          >
            <span className={isMobile ? 'text-lg' : ''}>{option.icon}</span>
            <div>
              <div>{option.name}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {option.description}
              </p>
            </div>
          </label>
        </div>
      ))}
    </div>
  );
}


import { Leaf, ShieldCheck } from 'lucide-react';
import type { DietaryIcon } from '@/utils/dishTagUtils';

interface DietaryIconsProps {
  icons: DietaryIcon[];
  size?: 'sm' | 'md';
}

export default function DietaryIcons({ icons, size = 'md' }: DietaryIconsProps) {
  if (icons.length === 0) return null;

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1">
      {icons.map((icon, index) => {
        const key = `${icon.type}-${index}`;
        
        switch (icon.type) {
          case 'vegan':
            return (
              <Leaf 
                key={key}
                className={`${iconSize} ${icon.style}`}
                aria-label="Vegano"
                title="Vegano"
              />
            );
          case 'vegetarian':
            return (
              <Leaf 
                key={key}
                className={`${iconSize} ${icon.style}`}
                aria-label="Vegetariano"
                title="Vegetariano"
              />
            );
          case 'gluten-free':
            return (
              <ShieldCheck 
                key={key}
                className={`${iconSize} ${icon.style}`}
                aria-label="Sin Gluten"
                title="Sin Gluten"
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

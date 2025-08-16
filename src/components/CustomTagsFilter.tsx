
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomTags } from '@/hooks/useCustomTags';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomTagsFilterProps {
  selectedCustomTags: string[];
  onCustomTagsChange: (tags: string[]) => void;
}

export default function CustomTagsFilter({ selectedCustomTags, onCustomTagsChange }: CustomTagsFilterProps) {
  const { customTags, loading, error } = useCustomTags();
  const isMobile = useIsMobile();

  const handleTagToggle = (tagName: string) => {
    const newSelected = selectedCustomTags.includes(tagName)
      ? selectedCustomTags.filter(tag => tag !== tagName)
      : [...selectedCustomTags, tagName];
    onCustomTagsChange(newSelected);
  };

  const getTagIcon = (tagName: string): string => {
    const tagIcons: Record<string, string> = {
      'premiado': '🏆',
      'nuevo': '✨',
      'popular': '🔥',
      'recomendado': '⭐',
      'especialidad': '👑',
      'oferta': '💰',
      'vegano': '🌱',
      'sin gluten': '🌾',
      'picante': '🌶️',
      'tradicional': '🏛️',
      'fusion': '🌐',
      'temporada': '🍂'
    };
    return tagIcons[tagName.toLowerCase()] || '🏷️';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`w-full ${isMobile ? 'h-12' : 'h-5'}`} />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading custom tags:', error);
    return null;
  }

  if (customTags.length === 0) {
    return (
      <div className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'} text-center py-4`}>
        No hay etiquetas disponibles
      </div>
    );
  }

  return (
    <div className={`space-y-${isMobile ? '4' : '3'}`}>
      {customTags.map((tag) => (
        <div key={tag.name} className={`flex items-center justify-between ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
          <div className="flex items-center space-x-2 flex-1">
            <Checkbox 
              id={`custom-tag-${tag.name}`}
              checked={selectedCustomTags.includes(tag.name)}
              onCheckedChange={() => handleTagToggle(tag.name)}
              className={isMobile ? 'w-6 h-6' : ''}
            />
            <label 
              htmlFor={`custom-tag-${tag.name}`}
              className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 flex-1 ${
                isMobile ? 'text-base min-h-[44px]' : 'text-sm'
              }`}
            >
              <span className={isMobile ? 'text-lg' : ''}>{getTagIcon(tag.name)}</span>
              {tag.name}
            </label>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tag.count}
          </Badge>
        </div>
      ))}
    </div>
  );
}

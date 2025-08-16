
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CustomTag } from '@/types/dishFilters';

interface CustomTagsFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function CustomTagsFilter({ selectedTags, onTagsChange }: CustomTagsFilterProps) {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCustomTags = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las etiquetas únicas de los platos activos
        const { data, error } = await supabase
          .from('dishes')
          .select('custom_tags')
          .eq('is_active', true)
          .is('deleted_at', null);

        if (error) throw error;

        // Procesar las etiquetas para obtener una lista única con conteos
        const tagCounts: Record<string, number> = {};
        
        data?.forEach(dish => {
          if (dish.custom_tags && Array.isArray(dish.custom_tags)) {
            dish.custom_tags.forEach((tag: string) => {
              if (tag && tag.trim()) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              }
            });
          }
        });

        const processedTags: CustomTag[] = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count); // Ordenar por popularidad

        setCustomTags(processedTags);
      } catch (err) {
        console.error('Error fetching custom tags:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar etiquetas');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTags();
  }, []);

  const handleTagToggle = (tagName: string) => {
    const newSelected = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={`w-full ${isMobile ? 'h-12' : 'h-5'}`} />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading custom tags:', error);
    return (
      <div className="text-sm text-destructive p-2">
        Error cargando etiquetas: {error}
      </div>
    );
  }

  if (customTags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No hay etiquetas personalizadas disponibles
      </div>
    );
  }

  return (
    <div className={`space-y-${isMobile ? '4' : '3'}`}>
      {customTags.map((tag) => (
        <div key={tag.name} className={`flex items-center ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
          <Checkbox 
            id={`tag-${tag.name}`}
            checked={selectedTags.includes(tag.name)}
            onCheckedChange={() => handleTagToggle(tag.name)}
            className={isMobile ? 'w-6 h-6' : ''}
          />
          <label 
            htmlFor={`tag-${tag.name}`}
            className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center justify-between flex-1 ${
              isMobile ? 'text-base min-h-[44px]' : 'text-sm'
            }`}
          >
            <span>{tag.name}</span>
            <span className="text-xs text-muted-foreground ml-2">({tag.count})</span>
          </label>
        </div>
      ))}
    </div>
  );
}

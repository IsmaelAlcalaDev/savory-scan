
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface Allergen {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface AllergenFilterProps {
  selectedAllergens: string[];
  onAllergenChange: (allergens: string[]) => void;
}

export default function AllergenFilter({ selectedAllergens, onAllergenChange }: AllergenFilterProps) {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('allergens')
          .select('id, name, slug, icon')
          .order('name');

        if (error) throw error;
        setAllergens(data || []);
      } catch (err) {
        console.error('Error fetching allergens:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar alérgenos');
      } finally {
        setLoading(false);
      }
    };

    fetchAllergens();
  }, []);

  const handleAllergenChange = useCallback((allergenSlug: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedAllergens, allergenSlug]
      : selectedAllergens.filter(slug => slug !== allergenSlug);
    onAllergenChange(newSelected);
  }, [selectedAllergens, onAllergenChange]);

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
    console.error('Error loading allergens:', error);
    return null;
  }

  return (
    <div className={`space-y-${isMobile ? '4' : '3'}`}>
      {allergens.map((allergen) => (
        <div key={allergen.id} className={`flex items-center ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
          <Checkbox 
            id={`allergen-${allergen.id}`}
            checked={selectedAllergens.includes(allergen.slug)}
            onCheckedChange={(checked) => handleAllergenChange(allergen.slug, checked === true)}
            className={isMobile ? 'w-6 h-6' : ''}
          />
          <label 
            htmlFor={`allergen-${allergen.id}`}
            className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 select-none ${
              isMobile ? 'text-base min-h-[44px] flex-1' : 'text-sm'
            }`}
          >
            {allergen.icon && <span className={isMobile ? 'text-lg' : ''}>{allergen.icon}</span>}
            {allergen.name}
          </label>
        </div>
      ))}
    </div>
  );
}

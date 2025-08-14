
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

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

  const handleAllergenToggle = (allergenSlug: string) => {
    const newSelected = selectedAllergens.includes(allergenSlug)
      ? selectedAllergens.filter(slug => slug !== allergenSlug)
      : [...selectedAllergens, allergenSlug];
    onAllergenChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading allergens:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {allergens.map((allergen) => (
        <div key={allergen.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`allergen-${allergen.id}`}
            checked={selectedAllergens.includes(allergen.slug)}
            onCheckedChange={() => handleAllergenToggle(allergen.slug)}
          />
          <label 
            htmlFor={`allergen-${allergen.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            {allergen.icon && <span>{allergen.icon}</span>}
            {allergen.name}
          </label>
        </div>
      ))}
    </div>
  );
}

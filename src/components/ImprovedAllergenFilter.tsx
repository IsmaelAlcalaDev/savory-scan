
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';
import type { AllergenOption } from '@/types/dishFilters';

interface ImprovedAllergenFilterProps {
  excludedAllergens: string[];
  onAllergensChange: (allergens: string[]) => void;
}

export default function ImprovedAllergenFilter({ excludedAllergens, onAllergensChange }: ImprovedAllergenFilterProps) {
  const [allergens, setAllergens] = useState<AllergenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        setLoading(true);
        
        // Obtener alérgenos únicos de los platos activos
        const { data, error } = await supabase
          .from('dishes')
          .select('allergens')
          .eq('is_active', true)
          .is('deleted_at', null);

        if (error) throw error;

        // Procesar los alérgenos para obtener una lista única
        const allergenSet = new Set<string>();
        
        data?.forEach(dish => {
          if (dish.allergens && Array.isArray(dish.allergens)) {
            dish.allergens.forEach((allergen: string) => {
              if (allergen && allergen.trim()) {
                allergenSet.add(allergen);
              }
            });
          }
        });

        const processedAllergens: AllergenOption[] = Array.from(allergenSet)
          .map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllergens(processedAllergens);
      } catch (err) {
        console.error('Error fetching allergens:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar alérgenos');
      } finally {
        setLoading(false);
      }
    };

    fetchAllergens();
  }, []);

  const handleAllergenToggle = (allergenName: string) => {
    const newExcluded = excludedAllergens.includes(allergenName)
      ? excludedAllergens.filter(name => name !== allergenName)
      : [...excludedAllergens, allergenName];
    onAllergensChange(newExcluded);
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
    console.error('Error loading allergens:', error);
    return (
      <div className="text-sm text-destructive p-2">
        Error cargando alérgenos: {error}
      </div>
    );
  }

  if (allergens.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No hay información de alérgenos disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          Puede que no se muestren todos los platos ya que no todos contienen información completa de alérgenos
        </p>
      </div>
      
      <div className={`space-y-${isMobile ? '4' : '3'}`}>
        <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
          Excluir platos que contengan:
        </p>
        
        {allergens.map((allergen) => (
          <div key={allergen.name} className={`flex items-center ${isMobile ? 'space-x-4 py-2' : 'space-x-2'}`}>
            <Checkbox 
              id={`allergen-${allergen.slug}`}
              checked={excludedAllergens.includes(allergen.name)}
              onCheckedChange={() => handleAllergenToggle(allergen.name)}
              className={isMobile ? 'w-6 h-6' : ''}
            />
            <label 
              htmlFor={`allergen-${allergen.slug}`}
              className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 flex-1 ${
                isMobile ? 'text-base min-h-[44px]' : 'text-sm'
              }`}
            >
              {allergen.icon && <span className={isMobile ? 'text-lg' : ''}>{allergen.icon}</span>}
              {allergen.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

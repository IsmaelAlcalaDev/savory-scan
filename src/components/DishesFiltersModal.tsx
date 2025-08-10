
import React, { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDishCategories } from '@/hooks/useDishCategories';
import { useDishPriceRanges } from '@/hooks/useDishPriceRanges';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useDietTypes } from '@/hooks/useDietTypes';

interface DishesFiltersModalProps {
  selectedCategories: number[];
  onCategoryChange: (ids: number[]) => void;
  selectedPriceRanges: number[];
  onPriceRangeChange: (ids: number[]) => void;
  selectedCuisines: number[];
  onCuisineChange: (ids: number[]) => void;
  selectedDietTypes: string[];
  onDietTypeChange: (slugs: string[]) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium">{title}</h4>
    {children}
  </div>
);

const Chip: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-xs rounded-full border transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-foreground hover:bg-muted border-border'}`}
  >
    {children}
  </button>
);

const DishesFiltersModal: React.FC<DishesFiltersModalProps> = ({
  selectedCategories,
  onCategoryChange,
  selectedPriceRanges,
  onPriceRangeChange,
  selectedCuisines,
  onCuisineChange,
  selectedDietTypes,
  onDietTypeChange
}) => {
  const { categories } = useDishCategories();
  const { priceRanges } = useDishPriceRanges();
  const { cuisineTypes } = useCuisineTypes();
  const { dietTypes } = useDietTypes();

  const [open, setOpen] = useState(false);

  const toggleInArray = (arr: any[], value: any) => {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  const appliedCount = useMemo(() => {
    return selectedCategories.length + selectedPriceRanges.length + selectedCuisines.length + selectedDietTypes.length;
  }, [selectedCategories, selectedPriceRanges, selectedCuisines, selectedDietTypes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros {appliedCount > 0 ? `(${appliedCount})` : ''}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filtros de platos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <Section title="Categorías">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Chip
                  key={cat.id}
                  selected={selectedCategories.includes(cat.id)}
                  onClick={() => onCategoryChange(toggleInArray(selectedCategories, cat.id))}
                >
                  {cat.name}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Tipos de cocina">
            <div className="flex flex-wrap gap-2">
              {cuisineTypes?.map(ct => (
                <Chip
                  key={ct.id}
                  selected={selectedCuisines.includes(ct.id)}
                  onClick={() => onCuisineChange(toggleInArray(selectedCuisines, ct.id))}
                >
                  {ct.name}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Rango de precio">
            <div className="flex flex-wrap gap-2">
              {priceRanges.map(pr => (
                <Chip
                  key={pr.id}
                  selected={selectedPriceRanges.includes(pr.id)}
                  onClick={() => onPriceRangeChange(toggleInArray(selectedPriceRanges, pr.id))}
                >
                  {pr.display_text}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Dietas">
            <div className="flex flex-wrap gap-2">
              {dietTypes?.map(dt => (
                <Chip
                  key={dt.id}
                  selected={selectedDietTypes.includes(dt.slug)}
                  onClick={() => onDietTypeChange(toggleInArray(selectedDietTypes, dt.slug))}
                >
                  {dt.name}
                </Chip>
              ))}
            </div>
          </Section>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => {
              onCategoryChange([]);
              onCuisineChange([]);
              onPriceRangeChange([]);
              onDietTypeChange([]);
            }}>
              Limpiar
            </Button>
            <Button onClick={() => setOpen(false)}>Aplicar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishesFiltersModal;


import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CuisineFilter from '@/components/CuisineFilter';
import FoodTypeFilter from '@/components/FoodTypeFilter';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Slider } from '@/components/ui/slider';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'restaurants' | 'dishes';
  // Restaurant filters
  cuisineFilters: number[];
  onCuisineChange: (cuisines: number[]) => void;
  // Dish filters
  foodTypeFilters: number[];
  onFoodTypeChange: (foodTypes: number[]) => void;
  // Common filters
  priceRanges: ('€' | '€€' | '€€€' | '€€€€')[];
  onPriceRangeChange: (ranges: string[]) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  maxDistance: number;
  onDistanceChange: (distance: number) => void;
  dietTypes: string[];
  onDietTypeChange: (types: string[]) => void;
}

export default function FiltersModal({
  isOpen,
  onClose,
  activeTab,
  cuisineFilters,
  onCuisineChange,
  foodTypeFilters,
  onFoodTypeChange,
  priceRanges,
  onPriceRangeChange,
  minRating,
  onRatingChange,
  maxDistance,
  onDistanceChange,
  dietTypes,
  onDietTypeChange
}: FiltersModalProps) {
  const { priceRanges: availablePriceRanges } = usePriceRanges();
  const { dietTypes: availableDietTypes } = useDietTypes();

  const handlePriceRangeToggle = (range: string) => {
    const newRanges = priceRanges.includes(range as '€' | '€€' | '€€€' | '€€€€')
      ? priceRanges.filter(r => r !== range)
      : [...priceRanges, range as '€' | '€€' | '€€€' | '€€€€'];
    onPriceRangeChange(newRanges);
  };

  const handleDietTypeToggle = (type: string) => {
    const newTypes = dietTypes.includes(type)
      ? dietTypes.filter(t => t !== type)
      : [...dietTypes, type];
    onDietTypeChange(newTypes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Type filters section */}
          <div className="space-y-3">
            <h4 className="font-medium">
              {activeTab === 'restaurants' ? 'Tipos de cocina' : 'Tipos de comida'}
            </h4>
            {activeTab === 'restaurants' ? (
              <CuisineFilter
                selectedCuisines={cuisineFilters}
                onCuisineChange={onCuisineChange}
              />
            ) : (
              <FoodTypeFilter
                selectedFoodTypes={foodTypeFilters}
                onFoodTypeChange={onFoodTypeChange}
              />
            )}
          </div>

          {/* Price range filter section */}
          <div className="space-y-3">
            <h4 className="font-medium">Rango de precios</h4>
            <div className="flex flex-wrap gap-2">
              {availablePriceRanges.map((range) => (
                <Button
                  key={range.id}
                  variant={priceRanges.includes(range.value as '€' | '€€' | '€€€' | '€€€€') ? "secondary" : "outline"}
                  onClick={() => handlePriceRangeToggle(range.value)}
                >
                  {range.value}
                </Button>
              ))}
            </div>
          </div>

          {/* Rating filter section */}
          <div className="space-y-3">
            <h4 className="font-medium">Rating mínimo: {minRating}</h4>
            <Slider
              value={[minRating]}
              onValueChange={(value) => onRatingChange(value[0])}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Distance filter section */}
          <div className="space-y-3">
            <h4 className="font-medium">Distancia máxima: {maxDistance} km</h4>
            <Slider
              value={[maxDistance]}
              onValueChange={(value) => onDistanceChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Diet types filter section */}
          <div className="space-y-3">
            <h4 className="font-medium">Dietas</h4>
            <div className="flex flex-wrap gap-2">
              {availableDietTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={dietTypes.includes(type.name) ? "secondary" : "outline"}
                  onClick={() => handleDietTypeToggle(type.name)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>Aplicar filtros</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

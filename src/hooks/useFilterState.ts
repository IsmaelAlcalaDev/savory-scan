
import { useState } from 'react';

export const useFilterState = () => {
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedDistance, setSelectedDistance] = useState<number>(0);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(0);

  return {
    selectedCuisineTypes,
    selectedEstablishmentTypes,
    selectedServices,
    selectedPriceRange,
    selectedRating,
    selectedDistance,
    selectedFoodTypes,
    selectedDietTypes,
    selectedTimeRange,
    setSelectedCuisineTypes,
    setSelectedEstablishmentTypes,
    setSelectedServices,
    setSelectedPriceRange,
    setSelectedRating,
    setSelectedDistance,
    setSelectedFoodTypes,
    setSelectedDietTypes,
    setSelectedTimeRange,
  };
};

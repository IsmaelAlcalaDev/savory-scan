
import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useDishes } from '@/hooks/useDishes';
import { useIPLocation } from '@/hooks/useIPLocation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import DishCard from './DishCard';
import DishesFiltersModal from './DishesFiltersModal';
import { DishesFavoritesProvider } from '@/contexts/DishesFavoritesContext';

interface DishesSectionProps {
  searchQuery: string;
  userLocation: { lat: number; lng: number } | null;
  onLoginRequired: () => void;
}

const TagButton = ({
  children,
  isSelected,
  onClick
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full !bg-transparent !shadow-none !backdrop-blur-none flex items-center whitespace-nowrap flex-shrink-0",
      isSelected 
        ? "!bg-primary text-primary-foreground hover:!bg-primary/90 border-primary" 
        : "!bg-transparent hover:!bg-muted/50 text-muted-foreground hover:text-foreground border-border"
    )}
  >
    <span className="flex items-center">{children}</span>
  </button>
);

const FilterTag = ({
  children,
  onRemove
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) => (
  <button
    onClick={onRemove}
    className="h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full bg-transparent text-primary border-primary hover:bg-primary/5 flex items-center whitespace-nowrap flex-shrink-0"
  >
    <span className="flex items-center">{children}</span>
    <X className="ml-1 h-3 w-3 flex-shrink-0" />
  </button>
);

export default function DishesSection({ searchQuery, userLocation, onLoginRequired }: DishesSectionProps) {
  // Estado de filtros (cargados desde BD via modal)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]); // mismos chips rápidos (sin lógica extra)

  const { location: ipLocation } = useIPLocation();

  const { dishes, loading, error } = useDishes({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisines.length ? selectedCuisines : undefined,
    categoryIds: selectedCategories.length ? selectedCategories : undefined,
    dietFilters: selectedDietTypes.length ? selectedDietTypes : undefined,
    priceRangeIds: selectedPriceRanges.length ? selectedPriceRanges : undefined,
    orderBy: 'popularity',
  });

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]);
  };

  const removeFilter = (type: string, value: any) => {
    switch (type) {
      case 'category':
        setSelectedCategories(prev => prev.filter(id => id !== value));
        break;
      case 'cuisine':
        setSelectedCuisines(prev => prev.filter(id => id !== value));
        break;
      case 'price':
        setSelectedPriceRanges(prev => prev.filter(id => id !== value));
        break;
      case 'diet':
        setSelectedDietTypes(prev => prev.filter(slug => slug !== value));
        break;
      case 'quick':
        setActiveFilters(prev => prev.filter(id => id !== value));
        break;
    }
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedCuisines([]);
    setSelectedDietTypes([]);
    setActiveFilters([]);
  };

  // Mostrar etiquetas activas con nombres — lo resolvemos con etiquetas "genéricas"
  // Para simplicidad, solo mostramos IDs seleccionados; el modal ya muestra los nombres al usuario
  const activeFiltersDisplay = useMemo(() => {
    const filters: { type: string; value: any; label: string }[] = [];
    activeFilters.forEach(id => filters.push({ type: 'quick', value: id, label: id }));
    selectedCategories.forEach(id => filters.push({ type: 'category', value: id, label: `Categoría #${id}` }));
    selectedCuisines.forEach(id => filters.push({ type: 'cuisine', value: id, label: `Cocina #${id}` }));
    selectedPriceRanges.forEach(id => filters.push({ type: 'price', value: id, label: `Precio #${id}` }));
    selectedDietTypes.forEach(slug => filters.push({ type: 'diet', value: slug, label: slug }));
    return filters;
  }, [activeFilters, selectedCategories, selectedCuisines, selectedPriceRanges, selectedDietTypes]);

  const getDynamicTitle = () => {
    if (userLocation) {
      return `${dishes.length} platos cerca de ti`;
    }
    if (ipLocation) {
      const locationName = ipLocation.city || 'tu ubicación';
      return `${dishes.length} platos en ${locationName}`;
    }
    return `${dishes.length} platos`;
  };

  const getLocationNote = () => {
    if (ipLocation && ipLocation.accuracy === 'ip') return 'ubicación aproximada';
    if (userLocation) return 'ordenados por distancia';
    return null;
  };

  return (
    <DishesFavoritesProvider>
      {/* Header resultados */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">{loading ? 'Cargando platos...' : getDynamicTitle()}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getLocationNote() && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{getLocationNote()}</span>
            )}
          </div>
          {error && <p className="text-sm text-destructive mt-1">Error: {error}</p>}
        </div>
      </div>

      {/* Barra filtros + chips rápidos (misma UI) */}
      <div className="flex items-center gap-4 mb-2 pt-1 pb-1">
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-14 pr-4">
            {['económico', 'top', 'rápidos'].map(id => (
              <TagButton
                key={id}
                isSelected={activeFilters.includes(id)}
                onClick={() => handleFilterToggle(id)}
              >
                {id}
              </TagButton>
            ))}
          </div>
          {/* Botón filtros fijo (izquierda) */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center z-20 bg-white pr-2">
            <DishesFiltersModal
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              selectedPriceRanges={selectedPriceRanges}
              onPriceRangeChange={setSelectedPriceRanges}
              selectedCuisines={selectedCuisines}
              onCuisineChange={setSelectedCuisines}
              selectedDietTypes={selectedDietTypes}
              onDietTypeChange={setSelectedDietTypes}
            />
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Etiquetas de filtros activos */}
      {activeFiltersDisplay.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-6">
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-1 pr-4">
                {activeFiltersDisplay.map((f, i) => (
                  <FilterTag key={`${f.type}-${f.value}-${i}`} onRemove={() => removeFilter(f.type, f.value)}>
                    {f.label}
                  </FilterTag>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Grid de platos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Error al cargar platos: {error}</p>
            <p className="text-sm text-muted-foreground mt-2">Revisa la consola para más detalles</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron platos</p>
            <p className="text-sm text-muted-foreground mt-2">Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          dishes.map(dish => (
            <DishCard
              key={dish.id}
              id={dish.id}
              name={dish.name}
              basePrice={dish.base_price}
              imageUrl={dish.image_url}
              restaurantName={dish.restaurant_name}
              cuisineTypes={dish.cuisine_types || []}
              favoritesCount={dish.favorites_count}
              onLoginRequired={onLoginRequired}
            />
          ))
        )}
      </div>
    </DishesFavoritesProvider>
  );
}

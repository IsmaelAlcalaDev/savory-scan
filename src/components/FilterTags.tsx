
import { X, ChevronDown, Filter, SortAsc, MapPin, DollarSign, Star, Store, Utensils, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedDistance?: number[];
  selectedPriceRanges?: string[];
  selectedRating?: number;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'openNow' | 'all', id?: number) => void;
}

export default function FilterTags({ 
  activeTab, 
  selectedCuisines, 
  selectedFoodTypes,
  selectedDistance = [],
  selectedPriceRanges = [],
  selectedRating,
  selectedEstablishmentTypes = [],
  selectedDietTypes = [],
  isOpenNow = false,
  onClearFilter 
}: FilterTagsProps) {
  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedDistance.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedRating || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    isOpenNow;

  return (
    <div className="w-full py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {/* Sección Ordenar */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <SortAsc className="h-3 w-3 mr-1" />
          Ordenar
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Sección Distancia */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <MapPin className="h-3 w-3 mr-1" />
          Distancia
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Sección Precio */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Precio
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Sección Rating */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <Star className="h-3 w-3 mr-1" />
          Valoración
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Sección Tipo de Comercio (solo para restaurantes) */}
        {activeTab === 'restaurants' && (
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
          >
            <Store className="h-3 w-3 mr-1" />
            Tipo
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        )}

        {/* Sección Dieta */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <Utensils className="h-3 w-3 mr-1" />
          Dieta
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Sección Horarios */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <Clock className="h-3 w-3 mr-1" />
          Horarios
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Separador */}
        <div className="h-8 w-px bg-gray-200 flex-shrink-0" />

        {/* Filtros Rápidos */}
        <Badge
          variant="outline"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-green-200 text-green-700 hover:bg-green-50 cursor-pointer"
          onClick={() => {/* TODO: Implementar mejor valorados */}}
        >
          Mejor valorados
        </Badge>

        <Badge
          variant="outline"
          className={`flex-shrink-0 h-8 px-3 text-xs cursor-pointer ${
            isOpenNow 
              ? 'bg-green-100 border-green-300 text-green-800' 
              : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
          }`}
          onClick={() => onClearFilter('openNow')}
        >
          Abierto ahora
          {isOpenNow && <X className="h-3 w-3 ml-1" />}
        </Badge>

        <Badge
          variant="outline"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer"
          onClick={() => {/* TODO: Implementar más cerca */}}
        >
          Más cerca
        </Badge>

        <Badge
          variant="outline"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-orange-200 text-orange-700 hover:bg-orange-50 cursor-pointer"
          onClick={() => {/* TODO: Implementar más económico */}}
        >
          Más económico
        </Badge>

        {/* Filtros Activos */}
        {selectedCuisines.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            {selectedCuisines.length} cocina{selectedCuisines.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('cuisine')}
            />
          </Badge>
        )}

        {selectedFoodTypes.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            {selectedFoodTypes.length} tipo{selectedFoodTypes.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('foodType')}
            />
          </Badge>
        )}

        {selectedDistance.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            Distancia
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('distance')}
            />
          </Badge>
        )}

        {selectedPriceRanges.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            {selectedPriceRanges.length} precio{selectedPriceRanges.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('price')}
            />
          </Badge>
        )}

        {selectedRating && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            {selectedRating}+ estrellas
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('rating')}
            />
          </Badge>
        )}

        {selectedEstablishmentTypes.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            {selectedEstablishmentTypes.length} tipo{selectedEstablishmentTypes.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('establishment')}
            />
          </Badge>
        )}

        {selectedDietTypes.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-3 text-xs bg-primary/10 text-primary border-primary/20"
          >
            {selectedDietTypes.length} dieta{selectedDietTypes.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('diet')}
            />
          </Badge>
        )}

        {/* Limpiar todos los filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onClearFilter('all')}
          >
            Limpiar todo
          </Button>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

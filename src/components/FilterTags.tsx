
import { X, ChevronDown, Filter, SortAsc } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  onClearFilter: (type: 'cuisine' | 'foodType' | 'sort' | 'quick', id?: number) => void;
}

export default function FilterTags({ 
  activeTab, 
  selectedCuisines, 
  selectedFoodTypes, 
  onClearFilter 
}: FilterTagsProps) {
  const hasActiveFilters = selectedCuisines.length > 0 || selectedFoodTypes.length > 0;

  return (
    <div className="w-full py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {/* Filtros Rápidos */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <Filter className="h-3 w-3 mr-1" />
          Más filtros
        </Button>

        {/* Ordenación */}
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 px-3 text-xs bg-white border-gray-200"
        >
          <SortAsc className="h-3 w-3 mr-1" />
          Ordenar
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {/* Filtros Rápidos específicos */}
        {activeTab === 'restaurants' && (
          <>
            <Badge
              variant="outline"
              className="flex-shrink-0 h-8 px-3 text-xs bg-white border-green-200 text-green-700 hover:bg-green-50 cursor-pointer"
            >
              Abierto ahora
            </Badge>
            <Badge
              variant="outline" 
              className="flex-shrink-0 h-8 px-3 text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer"
            >
              Delivery gratis
            </Badge>
            <Badge
              variant="outline"
              className="flex-shrink-0 h-8 px-3 text-xs bg-white border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer"
            >
              Mejor valorados
            </Badge>
          </>
        )}

        {activeTab === 'dishes' && (
          <>
            <Badge
              variant="outline"
              className="flex-shrink-0 h-8 px-3 text-xs bg-white border-green-200 text-green-700 hover:bg-green-50 cursor-pointer"
            >
              Vegetariano
            </Badge>
            <Badge
              variant="outline"
              className="flex-shrink-0 h-8 px-3 text-xs bg-white border-orange-200 text-orange-700 hover:bg-orange-50 cursor-pointer"
            >
              Sin gluten
            </Badge>
            <Badge
              variant="outline"
              className="flex-shrink-0 h-8 px-3 text-xs bg-white border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
            >
              Picante
            </Badge>
          </>
        )}

        {/* Etiquetas de filtros activos de cocina */}
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

        {/* Etiquetas de filtros activos de tipo de comida */}
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

        {/* Limpiar todos los filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              onClearFilter('cuisine');
              onClearFilter('foodType');
            }}
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

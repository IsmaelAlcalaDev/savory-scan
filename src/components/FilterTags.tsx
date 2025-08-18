
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SortTag from './SortTag';
import type { SortOption } from './SortTag';

interface FilterTag {
  id: string;
  label: string;
  onRemove: () => void;
}

interface FilterTagsProps {
  tags: FilterTag[];
  onClearAll?: () => void;
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (sortId: string) => void;
  showSort?: boolean;
}

export function ResetFiltersButton({ 
  hasActiveFilters, 
  onClearAll 
}: { 
  hasActiveFilters: boolean; 
  onClearAll: () => void; 
}) {
  if (!hasActiveFilters) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClearAll}
      className="text-sm text-gray-600 hover:text-gray-800 px-2"
    >
      Limpiar filtros
    </Button>
  );
}

export default function FilterTags({ 
  tags, 
  onClearAll,
  sortOptions = [],
  selectedSort = '',
  onSortChange = () => {},
  showSort = false
}: FilterTagsProps) {
  if (tags.length === 0 && !showSort) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      {/* Etiquetas de filtro existentes */}
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-sm rounded-full"
        >
          <span>{tag.label}</span>
          <button
            onClick={tag.onRemove}
            className="ml-1 hover:bg-gray-700 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Etiqueta de ordenación */}
      {showSort && sortOptions.length > 0 && (
        <SortTag
          options={sortOptions}
          selectedSort={selectedSort}
          onSortChange={onSortChange}
        />
      )}

      {/* Botón para limpiar todos los filtros */}
      {tags.length > 0 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-sm text-gray-600 hover:text-gray-800 px-2"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

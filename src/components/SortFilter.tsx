
import { useState } from 'react';
import { Check } from 'lucide-react';

interface SortOption {
  id: string;
  label: string;
  description?: string;
}

interface SortFilterProps {
  selectedSort?: string;
  onSortChange: (sortId: string) => void;
}

const sortOptions: SortOption[] = [
  {
    id: 'relevance',
    label: 'Relevancia',
    description: 'Más relevantes primero'
  },
  {
    id: 'rating',
    label: 'Mejor valorados',
    description: 'Calificación más alta primero'
  },
  {
    id: 'distance',
    label: 'Más cerca',
    description: 'Distancia más corta primero'
  },
  {
    id: 'price_low',
    label: 'Precio: menor a mayor',
    description: 'Opciones más económicas primero'
  },
  {
    id: 'price_high',
    label: 'Precio: mayor a menor',
    description: 'Opciones más caras primero'
  },
  {
    id: 'newest',
    label: 'Más recientes',
    description: 'Añadidos recientemente primero'
  },
  {
    id: 'popular',
    label: 'Más populares',
    description: 'Más visitados primero'
  }
];

export default function SortFilter({ selectedSort = 'relevance', onSortChange }: SortFilterProps) {
  const [localSort, setLocalSort] = useState(selectedSort);

  const handleSortSelect = (sortId: string) => {
    setLocalSort(sortId);
    onSortChange(sortId);
  };

  return (
    <div className="space-y-1">
      {sortOptions.map((option) => (
        <div
          key={option.id}
          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
            localSort === option.id
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => handleSortSelect(option.id)}
        >
          <div className="flex-1">
            <div className="font-medium text-gray-900">{option.label}</div>
            {option.description && (
              <div className="text-sm text-gray-500 mt-1">{option.description}</div>
            )}
          </div>
          {localSort === option.id && (
            <Check className="h-5 w-5 text-primary" />
          )}
        </div>
      ))}
    </div>
  );
}

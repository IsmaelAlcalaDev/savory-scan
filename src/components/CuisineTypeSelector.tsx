
import CuisineFilter from './CuisineFilter';

interface CuisineTypeSelectorProps {
  onChange: (cuisineTypes: number[]) => void;
}

export default function CuisineTypeSelector({ onChange }: CuisineTypeSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Tipo de cocina</h3>
      <CuisineFilter selectedCuisines={[]} onCuisineChange={onChange} />
    </div>
  );
}

export { CuisineTypeSelector };

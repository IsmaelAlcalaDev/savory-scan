
import DietFilter from './DietFilter';

interface DietTypeSelectorProps {
  onChange: (types: number[]) => void;
  onMinPercentagesChange: (percentages: { [key: string]: number }) => void;
}

export default function DietTypeSelector({ onChange, onMinPercentagesChange }: DietTypeSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Opciones dietéticas</h3>
      <DietFilter selectedDietTypes={[]} onDietTypeChange={onChange} />
    </div>
  );
}

export { DietTypeSelector };

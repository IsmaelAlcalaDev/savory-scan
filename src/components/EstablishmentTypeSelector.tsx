
import EstablishmentTypeFilter from './EstablishmentTypeFilter';

interface EstablishmentTypeSelectorProps {
  onChange: (types: number[]) => void;
}

export default function EstablishmentTypeSelector({ onChange }: EstablishmentTypeSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Tipo de establecimiento</h3>
      <EstablishmentTypeFilter selectedEstablishmentTypes={[]} onEstablishmentTypeChange={onChange} />
    </div>
  );
}

export { EstablishmentTypeSelector };

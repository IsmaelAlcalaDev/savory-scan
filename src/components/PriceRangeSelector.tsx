
import PriceFilter from './PriceFilter';

interface PriceRangeSelectorProps {
  onChange: (priceRanges: string[]) => void;
}

export default function PriceRangeSelector({ onChange }: PriceRangeSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Rango de precios</h3>
      <PriceFilter selectedPriceRanges={[]} onPriceRangeChange={onChange} />
    </div>
  );
}

export { PriceRangeSelector };

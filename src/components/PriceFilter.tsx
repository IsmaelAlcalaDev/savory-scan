
import { useState } from 'react';
import { ChevronDown, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceFilterProps {
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
}

export default function PriceFilter({ selectedPriceRanges, onPriceRangeChange }: PriceFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { priceRanges, loading, error } = usePriceRanges();

  const handlePriceToggle = (priceValue: string) => {
    const newSelected = selectedPriceRanges.includes(priceValue)
      ? selectedPriceRanges.filter(value => value !== priceValue)
      : [...selectedPriceRanges, priceValue];
    onPriceRangeChange(newSelected);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading price ranges:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Precio
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {priceRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`price-${range.id}`}
                    checked={selectedPriceRanges.includes(range.value)}
                    onCheckedChange={() => handlePriceToggle(range.value)}
                  />
                  <label 
                    htmlFor={`price-${range.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    {range.icon && <span>{range.icon}</span>}
                    {range.display_text}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

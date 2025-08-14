
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSortOptions } from '@/hooks/useSortOptions';
import { Skeleton } from '@/components/ui/skeleton';

interface SortFilterProps {
  selectedSort?: string;
  onSortChange: (sort: string) => void;
}

export default function SortFilter({ selectedSort, onSortChange }: SortFilterProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { sortOptions, loading, error } = useSortOptions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading sort options:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <span>📊</span>
                Ordenar
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <RadioGroup value={selectedSort} onValueChange={onSortChange}>
              <div className="space-y-3">
                {sortOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`sort-${option.id}`} />
                    <Label 
                      htmlFor={`sort-${option.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      {option.icon && <span>{option.icon}</span>}
                      {option.display_text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

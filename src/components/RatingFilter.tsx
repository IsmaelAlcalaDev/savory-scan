
import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { Skeleton } from '@/components/ui/skeleton';

interface RatingFilterProps {
  selectedRatings: number[];
  onRatingChange: (ratings: number[]) => void;
}

export default function RatingFilter({ selectedRatings, onRatingChange }: RatingFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { ratingOptions, loading, error } = useRatingOptions();

  const handleRatingToggle = (ratingId: number) => {
    const newSelected = selectedRatings.includes(ratingId)
      ? selectedRatings.filter(id => id !== ratingId)
      : [...selectedRatings, ratingId];
    onRatingChange(newSelected);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading rating options:', error);
    return null;
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Valoración
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {ratingOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`rating-${option.id}`}
                    checked={selectedRatings.includes(option.id)}
                    onCheckedChange={() => handleRatingToggle(option.id)}
                  />
                  <label 
                    htmlFor={`rating-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                  >
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    {option.display_text}
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

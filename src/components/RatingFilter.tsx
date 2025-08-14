
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { Skeleton } from '@/components/ui/skeleton';

interface RatingFilterProps {
  selectedRating?: number;
  onRatingChange: (rating: number | undefined) => void;
}

export default function RatingFilter({ selectedRating, onRatingChange }: RatingFilterProps) {
  const { ratingOptions, loading, error } = useRatingOptions();

  const handleRatingToggle = (ratingId: number) => {
    if (selectedRating === ratingId) {
      onRatingChange(undefined);
    } else {
      onRatingChange(ratingId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading rating options:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {ratingOptions.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`rating-${option.id}`}
            checked={selectedRating === option.id}
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
  );
}

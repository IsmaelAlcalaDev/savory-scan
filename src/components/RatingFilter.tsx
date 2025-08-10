
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface RatingOption {
  id: string;
  label: string;
  rating: number;
}

const ratingOptions: RatingOption[] = [
  { id: 'any', label: 'Cualquier valoración', rating: 0 },
  { id: '4plus', label: '4+ estrellas', rating: 4 },
  { id: '4.5plus', label: '4.5+ estrellas', rating: 4.5 },
];

interface RatingFilterProps {
  selectedRatings: string[];
  onRatingChange: (ratings: string[]) => void;
}

export default function RatingFilter({ selectedRatings, onRatingChange }: RatingFilterProps) {
  const handleRatingChange = (ratingId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedRatings, ratingId]
      : selectedRatings.filter(id => id !== ratingId);
    onRatingChange(newSelection);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: Math.floor(count) }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-accent text-accent" />
    ));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Valoración</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ratingOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={selectedRatings.includes(option.id)}
              onCheckedChange={(checked) => handleRatingChange(option.id, checked as boolean)}
            />
            <label
              htmlFor={option.id}
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              {option.rating > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(option.rating)}
                </div>
              )}
              {option.label}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

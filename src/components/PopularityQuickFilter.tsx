
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

interface PopularityQuickFilterProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function PopularityQuickFilter({ isActive, onToggle }: PopularityQuickFilterProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <TrendingUp className="h-4 w-4" />
      Más Popular
    </Button>
  );
}

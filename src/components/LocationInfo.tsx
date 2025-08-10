
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LocationInfoProps {
  location: {
    name: string;
    description?: string;
    type: string;
    parent?: string;
  };
  onClose: () => void;
}

export default function LocationInfo({ location, onClose }: LocationInfoProps) {
  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium">{location.name}</h4>
            </div>
            {location.parent && (
              <p className="text-sm text-muted-foreground mb-2">{location.parent}</p>
            )}
            {location.description && (
              <p className="text-sm">{location.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

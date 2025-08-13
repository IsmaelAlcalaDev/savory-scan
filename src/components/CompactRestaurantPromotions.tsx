
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Percent, ChevronRight } from 'lucide-react';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount_type: string;
  discount_value?: number;
  discount_label?: string;
  valid_from: string;
  valid_until: string;
  conditions?: string;
  promo_code?: string;
}

interface CompactRestaurantPromotionsProps {
  promotions: Promotion[];
}

export default function CompactRestaurantPromotions({ promotions }: CompactRestaurantPromotionsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!promotions || promotions.length === 0) return null;

  const promotionsToShow = showAll ? promotions : promotions.slice(0, 2);
  const hasMorePromotions = promotions.length > 2;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          Promociones y ofertas
        </h3>
        {hasMorePromotions && !showAll && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(true)}
            className="text-primary hover:text-primary/80 h-auto p-1"
          >
            Ver todas
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {promotionsToShow.map((promo) => (
          <div key={promo.id} className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-border/20">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{promo.title}</h4>
              {promo.discount_label && (
                <Badge variant="destructive" className="text-xs ml-2">
                  {promo.discount_label}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {promo.description}
            </p>
            
            {promo.promo_code && (
              <div className="bg-background/50 rounded-md p-2 mb-2">
                <p className="text-xs font-mono font-medium">
                  Código: <span className="bg-primary/20 px-2 py-1 rounded text-primary text-xs">{promo.promo_code}</span>
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Hasta: {new Date(promo.valid_until).toLocaleDateString()}</span>
              {promo.conditions && (
                <span className="text-xs">*Ver condiciones</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAll && hasMorePromotions && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full mt-2"
        >
          Ver menos
        </Button>
      )}
    </div>
  );
}

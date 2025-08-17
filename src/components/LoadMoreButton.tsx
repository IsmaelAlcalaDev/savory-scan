
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  className?: string;
}

export default function LoadMoreButton({ 
  onLoadMore, 
  loading, 
  hasMore, 
  className = "" 
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">No hay más resultados</p>
      </div>
    );
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <Button
        onClick={onLoadMore}
        disabled={loading}
        variant="outline"
        size="lg"
        className="min-w-[200px]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando más...
          </>
        ) : (
          'Cargar más restaurantes'
        )}
      </Button>
    </div>
  );
}

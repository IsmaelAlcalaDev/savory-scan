
import { useState, useMemo } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntelligentLocationSuggestions } from '@/hooks/useIntelligentLocationSuggestions';
import { useOptimizedLocationHistory } from '@/hooks/useOptimizedLocationHistory';

interface LocationQuickSearchProps {
  onLocationSelect: (location: any) => void;
}

export function LocationQuickSearch({ onLocationSelect }: LocationQuickSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { suggestions, loading } = useIntelligentLocationSuggestions(searchQuery);
  const { history, addToHistory, getTopLocations } = useOptimizedLocationHistory();
  
  // Limit suggestions and history for clean UI
  const limitedSuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);
  const topHistory = useMemo(() => getTopLocations(3), [getTopLocations]);

  const handleSuggestionSelect = (suggestion: any) => {
    addToHistory({
      name: suggestion.name,
      type: suggestion.type,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      parent: suggestion.parent
    });

    onLocationSelect({
      type: 'suggestion',
      data: {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        type: suggestion.type,
        parent: suggestion.parent,
        address: suggestion.name
      }
    });
  };

  const handleHistorySelect = (item: any) => {
    addToHistory({
      name: item.name,
      type: item.type,
      latitude: item.latitude,
      longitude: item.longitude,
      parent: item.parent
    });

    onLocationSelect({
      type: 'suggestion',
      data: {
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        type: item.type,
        parent: item.parent,
        address: item.name
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center border-2 border-border rounded-lg bg-background hover:border-primary/30 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
          <div className="flex-1 flex items-center gap-3 px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Escribe ciudad, barrio, código postal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground"
              maxLength={50}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-72">
        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="space-y-2 mb-4">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : limitedSuggestions.length > 0 ? (
              <div className="space-y-1">
                {limitedSuggestions.map((suggestion) => (
                  <Button
                    key={`${suggestion.type}-${suggestion.id}`}
                    variant="ghost"
                    className="w-full h-auto p-3 flex items-center gap-3 text-left hover:bg-muted rounded-lg transition-all duration-200"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground flex items-center gap-2">
                        {suggestion.name}
                        {suggestion.is_famous && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                            ⭐
                          </span>
                        )}
                      </div>
                      {suggestion.parent && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.parent}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-sm text-muted-foreground">
                  No se encontraron ubicaciones
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Section */}
        {topHistory.length > 0 && searchQuery.length < 2 && (
          <div className="space-y-2">
            <div className="px-1 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Recientes
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              {topHistory.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full h-auto p-3 flex items-center gap-3 text-left hover:bg-muted rounded-lg transition-all duration-200"
                  onClick={() => handleHistorySelect(item)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 flex-shrink-0">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground flex items-center gap-2">
                      {item.name}
                      {item.usage_count > 1 && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {item.usage_count}x
                        </span>
                      )}
                    </div>
                    {item.parent && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.parent}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {topHistory.length === 0 && searchQuery.length < 2 && (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-sm text-muted-foreground">
              Escribe para buscar ubicaciones
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

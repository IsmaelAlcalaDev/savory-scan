
import { useState } from 'react';
import { Search, MapPin, Heart, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import CuisineFilter from './CuisineFilter';
import DistanceFilter from './DistanceFilter';
import RatingFilter from './RatingFilter';
import RestaurantCard from './RestaurantCard';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceRange: string;
  isOpen: boolean;
  features: string[];
  isFavorite: boolean;
  image?: string;
}

const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Bar Manolo',
    slug: 'bar-manolo',
    cuisine: 'Española',
    rating: 4.3,
    reviewCount: 234,
    distance: '390.0km',
    priceRange: '€€€€',
    isOpen: true,
    features: ['Terraza/Exterior', 'WiFi', 'Pago'],
    isFavorite: true,
    image: '/placeholder.svg'
  },
  {
    id: 2,
    name: 'La Taberna del Puerto', 
    slug: 'la-taberna-del-puerto',
    cuisine: 'Española',
    rating: 4.5,
    reviewCount: 127,
    distance: '390.1km',
    priceRange: '€',
    isOpen: true,
    features: ['Terraza/Exterior', 'WiFi', 'Reservas'],
    isFavorite: false,
    image: '/placeholder.svg'
  },
  {
    id: 3,
    name: 'Pizzeria Bella Napoli',
    slug: 'pizzeria-bella-napoli', 
    cuisine: 'Italiana',
    rating: 4.2,
    reviewCount: 89,
    distance: '390.9km',
    priceRange: '€',
    isOpen: true,
    features: ['Terraza/Exterior', 'Para llevar', 'Delivery'],
    isFavorite: true,
    image: '/placeholder.svg'
  },
];

const filterOptions = [
  { id: 'nearby', label: 'Cerca de mí', active: true },
  { id: 'open', label: 'Abierto', active: false },
  { id: 'economic', label: 'Económico', active: false },
  { id: 'top', label: 'Top', active: false },
];

export default function FoodieSpotLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['nearby']);
  const [isVegMode, setIsVegMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">FoodieSpot</h1>
              <p className="text-xs text-muted-foreground">Food delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Tu ubicación actual</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar restaurantes ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Cuisine Filter */}
        <div className="px-4 pb-4">
          <CuisineFilter 
            selectedCuisines={selectedCuisines}
            onCuisineChange={setSelectedCuisines}
          />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Filters */}
        <aside className={cn(
          "w-80 border-r border-border bg-background transition-transform duration-300 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 space-y-4">
            <DistanceFilter 
              selectedDistances={selectedDistances}
              onDistanceChange={setSelectedDistances}
            />
            <RatingFilter 
              selectedRatings={selectedRatings}
              onRatingChange={setSelectedRatings}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Restaurantes cerca de ti</h2>
                <p className="text-sm text-muted-foreground">4 resultados</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Modo VEG</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVegMode(!isVegMode)}
                  className={cn(
                    "relative w-12 h-6 rounded-full p-0",
                    isVegMode ? "bg-green-500" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                    isVegMode ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </Button>
              </div>
            </div>

            {/* Filter Badges */}
            <div className="flex gap-2 mb-6">
              {filterOptions.map((filter) => (
                <Badge
                  key={filter.id}
                  variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterToggle(filter.id)}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge 
                        variant={restaurant.isOpen ? "default" : "secondary"}
                        className={restaurant.isOpen ? "bg-green-500" : ""}
                      >
                        {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4",
                          restaurant.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{restaurant.isFavorite ? '1' : '4'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-muted-foreground">{restaurant.cuisine}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-xs">★</span>
                        </div>
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                        <span className="text-sm text-muted-foreground">({restaurant.reviewCount})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{restaurant.distance}</span>
                      </div>
                      <span className="text-sm font-medium">{restaurant.priceRange}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {restaurant.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, MapPin, Compass, Search } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import RestaurantList from './RestaurantList';
import DishList from './DishList';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [open, setOpen] = useState(false)
  const { location, setLocation } = useLocation();
  const { restaurants, isLoading: isLoadingRestaurants, error: errorRestaurants } = useRestaurants();
  const { dishes, isLoading: isLoadingDishes, error: errorDishes } = useDishes();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLocationChange = (newLocation: any) => {
    setLocation(newLocation);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/restaurantes" className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Foodie<span className="text-primary">Spot</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {location ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{location.address || 'Ubicación no detectada'}</span>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                  <Compass className="h-4 w-4 mr-2" />
                  Seleccionar Ubicación
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Compass className="h-4 w-4 mr-2" />
                    Ubicación
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-white">
                  <SheetHeader>
                    <SheetTitle>Selecciona tu ubicación</SheetTitle>
                    <SheetDescription>
                      Elige la ubicación donde deseas explorar restaurantes y platos.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    {/* Aquí puedes integrar un componente de búsqueda de ubicación o un mapa */}
                    <p className="text-sm text-gray-500">
                      Implementa aquí la funcionalidad para que el usuario seleccione su ubicación.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <Compass className="h-4 w-4 mr-2" />
              Ubicación
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-white">
            <SheetHeader>
              <SheetTitle>Selecciona tu ubicación</SheetTitle>
              <SheetDescription>
                Elige la ubicación donde deseas explorar restaurantes y platos.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {/* Aquí puedes integrar un componente de búsqueda de ubicación o un mapa */}
              <p className="text-sm text-gray-500">
                Implementa aquí la funcionalidad para que el usuario seleccione su ubicación.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultvalue={initialTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes">Platos</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 bg-white/95 backdrop-blur-sm border-0 shadow-card text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
                maxLength={50}
              />
            </div>
            <TabsContent value="restaurants">
              <RestaurantList restaurants={restaurants} isLoading={isLoadingRestaurants} error={errorRestaurants} />
            </TabsContent>
            <TabsContent value="dishes">
              <DishList dishes={dishes} isLoading={isLoadingDishes} error={errorDishes} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Location Modal */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="bg-white">
          <SheetHeader>
            <SheetTitle>Selecciona tu ubicación</SheetTitle>
            <SheetDescription>
              Elige la ubicación donde deseas explorar restaurantes y platos.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {/* Aquí puedes integrar un componente de búsqueda de ubicación o un mapa */}
            <p className="text-sm text-gray-500">
              Implementa aquí la funcionalidad para que el usuario seleccione su ubicación.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around items-center h-16">
            <Button variant="ghost">
              <Link to="/restaurantes" className="flex flex-col items-center">
                <Utensils className="h-5 w-5" />
                <span className="text-xs">Restaurantes</span>
              </Link>
            </Button>
            <Button variant="ghost">
              <Link to="/platos" className="flex flex-col items-center">
                <Utensils className="h-5 w-5" />
                <span className="text-xs">Platos</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

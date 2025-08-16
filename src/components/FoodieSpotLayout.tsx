
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import RestaurantCard from '@/components/RestaurantCard';
import DishCard from '@/components/DishCard';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Restaurant } from '@/types/restaurant';

interface FoodieSpotLayoutProps {
  initialTab?: "restaurants" | "dishes";
}

export default function FoodieSpotLayout({ initialTab = "restaurants" }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">(initialTab);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [isHighRated, setIsHighRated] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState(false);
  const { toast } = useToast();

  const { cuisineTypes } = useCuisineTypes();
  const { establishmentTypes } = useEstablishmentTypes();
  const { dietTypes } = useDietTypes();

  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery,
    maxDistance,
    cuisineTypeIds: selectedCuisineTypes,
    priceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isBudgetFriendly
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery,
    maxDistance,
    priceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isBudgetFriendly
  });

  useEffect(() => {
    const initialQuery = searchParams.get('q') || '';
    setSearchQuery(initialQuery);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    setSearchParams(params);
  }, [searchQuery, setSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleCuisineType = (id: number) => {
    setSelectedCuisineTypes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleEstablishmentType = (id: number) => {
    setSelectedEstablishmentTypes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleDietType = (id: number) => {
    setSelectedDietTypes(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const togglePriceRange = (value: string) => {
    setPriceRanges(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setMaxDistance(undefined);
    setSelectedCuisineTypes([]);
    setSelectedEstablishmentTypes([]);
    setSelectedDietTypes([]);
    setPriceRanges([]);
    setIsHighRated(false);
    setIsOpenNow(false);
    setIsBudgetFriendly(false);
  };

  const getResultsText = (count: number) => {
    if (activeTab !== 'restaurants') {
      return `${count} platos encontrados`;
    }

    // If no establishment types are selected, default to "restaurantes"
    if (selectedEstablishmentTypes.length === 0) {
      return `${count} restaurantes`;
    }

    // If one establishment type is selected, use its name (plural)
    if (selectedEstablishmentTypes.length === 1) {
      const selectedType = establishmentTypes.find(type => type.id === selectedEstablishmentTypes[0]);
      if (selectedType) {
        // Add 's' for plural or use specific plural forms
        const pluralName = selectedType.name.toLowerCase().endsWith('s') 
          ? selectedType.name.toLowerCase() 
          : `${selectedType.name.toLowerCase()}s`;
        return `${count} ${pluralName}`;
      }
      return `${count} restaurantes`;
    }

    // If multiple types are selected, use generic "establecimientos"
    return `${count} establecimientos`;
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        <Input
          type="search"
          placeholder={`Buscar ${activeTab === 'restaurants' ? 'restaurantes' : 'platos'}...`}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-auto"
        />
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "restaurants" | "dishes")} className="w-full">
          <TabsList className="flex justify-center bg-secondary rounded-md">
            <TabsTrigger value="restaurants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Restaurantes</TabsTrigger>
            <TabsTrigger value="dishes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Platos</TabsTrigger>
          </TabsList>
          <TabsContent value="restaurants" className="outline-none">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restaurantsLoading ? (
                <div className="col-span-full text-center">Cargando restaurantes...</div>
              ) : restaurantsError ? (
                <div className="col-span-full text-center text-red-500">Error: {restaurantsError}</div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="col-span-full px-4 py-2 text-sm text-muted-foreground border-b">
                    {getResultsText(restaurants.length)}
                  </div>

                  {restaurants.map((restaurant: Restaurant) => (
                    <RestaurantCard key={restaurant.id} {...restaurant} />
                  ))}
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="dishes" className="outline-none">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dishesLoading ? (
                <div className="col-span-full text-center">Cargando platos...</div>
              ) : dishesError ? (
                <div className="col-span-full text-center text-red-500">Error: {dishesError}</div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="col-span-full px-4 py-2 text-sm text-muted-foreground border-b">
                    {getResultsText(dishes.length)}
                  </div>

                  {dishes.map((dish: any) => (
                    <DishCard 
                      key={dish.id} 
                      dish={dish} 
                      restaurantId={dish.restaurant_id}
                      expandedDishId={null}
                      onExpandedChange={() => {}}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="mt-4 w-full">
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[425px]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Aplicar filtros para refinar tu búsqueda.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Separator />
            <div>
              <Label htmlFor="distance">Distancia máxima (km)</Label>
              <Slider
                id="distance"
                defaultValue={[maxDistance || 50]}
                max={100}
                step={1}
                onValueChange={(value) => setMaxDistance(value[0])}
              />
              <p className="text-sm text-muted-foreground">
                {maxDistance || 50} km
              </p>
            </div>
            <Separator />
            <div>
              <Label>Tipos de cocina</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {cuisineTypes.map(type => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`cuisine-${type.id}`}
                      className="h-4 w-4 rounded"
                      checked={selectedCuisineTypes.includes(type.id)}
                      onChange={() => toggleCuisineType(type.id)}
                    />
                    <label
                      htmlFor={`cuisine-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <Separator />
            <div>
              <Label>Tipos de establecimiento</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {establishmentTypes.map(type => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`establishment-${type.id}`}
                      className="h-4 w-4 rounded"
                      checked={selectedEstablishmentTypes.includes(type.id)}
                      onChange={() => toggleEstablishmentType(type.id)}
                    />
                    <label
                      htmlFor={`establishment-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <Separator />
            <div>
              <Label>Dietas</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {dietTypes.map(type => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`diet-${type.id}`}
                      className="h-4 w-4 rounded"
                      checked={selectedDietTypes.includes(type.id)}
                      onChange={() => toggleDietType(type.id)}
                    />
                    <label
                      htmlFor={`diet-${type.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <Separator />
            <div>
              <Label>Rangos de precio</Label>
              <div className="flex flex-col space-y-2">
                {['€', '€€', '€€€', '€€€€'].map(price => (
                  <div key={price} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`price-${price}`}
                      className="h-4 w-4 rounded"
                      checked={priceRanges.includes(price)}
                      onChange={() => togglePriceRange(price)}
                    />
                    <label
                      htmlFor={`price-${price}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {price}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="highRated">Más de 4.5 estrellas</Label>
              <Switch id="highRated" checked={isHighRated} onCheckedChange={setIsHighRated} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="openNow">Abierto ahora</Label>
              <Switch id="openNow" checked={isOpenNow} onCheckedChange={setIsOpenNow} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="budgetFriendly">Económico</Label>
              <Switch id="budgetFriendly" checked={isBudgetFriendly} onCheckedChange={setIsBudgetFriendly} />
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Borrar filtros
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esto borrará todos los filtros aplicados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearFilters}>Borrar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGeolocated } from 'react-geolocated';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, MapPin, Utensils, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import RestaurantCard from '@/components/RestaurantCard';
import RestaurantGrid from '@/components/RestaurantGrid';
import Map from '@/components/Map';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useSortOptions } from '@/hooks/useSortOptions';
import SortRestaurants from '@/components/SortRestaurants';
import RestaurantSearchBar from '@/components/RestaurantSearchBar';
import { ModeToggle } from '@/components/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';
import { Icons } from './icons';
import DashUpdatesDishes from './DashUpdatesDishes';

interface FoodieSpotLayoutProps {
  initialTab: 'restaurants' | 'dishes' | 'map' | 'settings';
}

export default function FoodieSpotLayout({ initialTab }: FoodieSpotLayoutProps) {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Geolocation hook
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      watchPosition: false,
    });

  // Restaurants hook
  const { restaurants, loading, error } = useRestaurants({
    searchQuery: searchQuery,
    userLat: coords?.latitude,
    userLng: coords?.longitude,
    sortBy: sortBy,
  });

  // Sort options hook
  const { sortOptions, loading: sortOptionsLoading, error: sortOptionsError } = useSortOptions();

  // Update active tab based on search params
  useEffect(() => {
    const tab = searchParams.get('tab') as FoodieSpotLayoutProps['initialTab'] || initialTab;
    setActiveTab(tab);
  }, [searchParams, initialTab]);

  // Update search params when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Handle geolocation errors
  useEffect(() => {
    if (!isGeolocationAvailable) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta la geolocalización",
        variant: "destructive",
      });
    } else if (!isGeolocationEnabled) {
      toast({
        title: "Error",
        description: "La geolocalización no está activada. Por favor, actívala para una mejor experiencia.",
        variant: "destructive",
      });
    }
  }, [isGeolocationAvailable, isGeolocationEnabled, toast]);

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="container relative mx-auto flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-semibold text-lg">FoodieSpot</span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Avatar"} />
                      <AvatarFallback>
                        {session?.user?.name?.slice(0, 2).toUpperCase() || "FS"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full h-full block">
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/restaurants/new" className="w-full h-full block">
                      Añadir restaurante
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full h-full block">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="underline underline-offset-2">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        <Tabs defaultValue={initialTab} className="w-full space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="restaurants" className="relative flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Restaurantes
            </TabsTrigger>
            <TabsTrigger value="dishes" className="relative flex items-center justify-center gap-2">
              <Utensils className="h-4 w-4" />
              Platos
            </TabsTrigger>
            <TabsTrigger value="map" className="relative flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="settings" className="relative flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" />
              Ajustes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="mt-0">
            <div className="space-y-4">
              <RestaurantSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Restaurantes cerca de ti
                </h2>
                {sortOptionsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : sortOptionsError ? (
                  <p className="text-sm text-red-500">Error: {sortOptionsError}</p>
                ) : (
                  <SortRestaurants
                    sortOptions={sortOptions}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                  />
                )}
              </div>
              {loading ? (
                <RestaurantGrid isLoading={true} />
              ) : error ? (
                <div className="rounded-md border border-destructive p-4">
                  <p className="text-sm text-destructive">Error: {error}</p>
                </div>
              ) : restaurants?.length === 0 ? (
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm text-muted-foreground">No se encontraron restaurantes</p>
                </div>
              ) : (
                <RestaurantGrid restaurants={restaurants} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="dishes" className="mt-0">
            <DashUpdatesDishes />
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <Map restaurants={restaurants} userLocation={coords} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Ajustes</h2>
              <p className="text-sm text-muted-foreground">
                Aquí podrás configurar tu cuenta y preferencias.
              </p>
              <Button onClick={() => getPosition()}>
                Actualizar mi ubicación
              </Button>
              {coords && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tu ubicación actual:</p>
                  <p className="text-sm text-muted-foreground">
                    Latitud: {coords.latitude}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Longitud: {coords.longitude}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

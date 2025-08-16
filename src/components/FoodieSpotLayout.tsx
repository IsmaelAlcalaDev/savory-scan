
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MapPin, Utensils, Settings } from 'lucide-react';
import DashUpdatesDishes from './DashUpdatesDishes';

interface FoodieSpotLayoutProps {
  initialTab: 'restaurants' | 'dishes' | 'map' | 'settings';
}

export default function FoodieSpotLayout({ initialTab }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="container relative mx-auto flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">FoodieSpot</span>
          </div>
        </div>

        <Tabs value={activeTab} className="w-full space-y-4" onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
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
              <h2 className="text-lg font-semibold">
                Restaurantes cerca de ti
              </h2>
              <p className="text-muted-foreground">Esta funcionalidad estará disponible pronto.</p>
            </div>
          </TabsContent>

          <TabsContent value="dishes" className="mt-0">
            <DashUpdatesDishes />
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Mapa</h2>
              <p className="text-muted-foreground">Esta funcionalidad estará disponible pronto.</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Ajustes</h2>
              <p className="text-muted-foreground">
                Aquí podrás configurar tu cuenta y preferencias.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

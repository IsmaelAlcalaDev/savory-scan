
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Store, Edit, Eye, MapPin, Star } from 'lucide-react';

const mockRestaurants = [
  {
    id: 1,
    name: 'Casa Pepe',
    owner: 'Carlos Rodríguez',
    city: 'Madrid',
    status: 'active',
    verified: true,
    rating: 4.5,
    dishes: 24,
    plan: 'premium',
    revenue: 2340
  },
  {
    id: 2,
    name: 'La Taberna del Puerto',
    owner: 'Ana García',
    city: 'Valencia',
    status: 'active',
    verified: true,
    rating: 4.8,
    dishes: 18,
    plan: 'basic',
    revenue: 890
  },
  {
    id: 3,
    name: 'Restaurante El Jardín',
    owner: 'Miguel Torres',
    city: 'Barcelona',
    status: 'pending',
    verified: false,
    rating: 0,
    dishes: 0,
    plan: 'free',
    revenue: 0
  }
];

export function RestaurantManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Restaurantes</h2>
          <p className="text-gray-600">Administra todos los restaurantes de la plataforma</p>
        </div>
        <Button className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Añadir Restaurante
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar restaurantes por nombre, propietario, ciudad..." className="pl-10" />
            </div>
            <Button variant="outline">Filtrar por Ciudad</Button>
            <Button variant="outline">Filtrar por Plan</Button>
            <Button variant="outline">Filtrar por Estado</Button>
            <Button variant="outline">Exportar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-sm text-gray-600">Total Restaurantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2,634</div>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">189</div>
            <p className="text-sm text-gray-600">Verificados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">€89,340</div>
            <p className="text-sm text-gray-600">Ingresos Mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de restaurantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Restaurantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Platos</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        {restaurant.verified && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{restaurant.owner}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {restaurant.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      restaurant.status === 'active' ? 'outline' : 
                      restaurant.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }>
                      {restaurant.status === 'active' ? 'Activo' : 
                       restaurant.status === 'pending' ? 'Pendiente' : 
                       'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {restaurant.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {restaurant.rating}
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin rating</span>
                    )}
                  </TableCell>
                  <TableCell>{restaurant.dishes}</TableCell>
                  <TableCell>
                    <Badge variant={
                      restaurant.plan === 'premium' ? 'default' : 
                      restaurant.plan === 'basic' ? 'secondary' : 
                      'outline'
                    }>
                      {restaurant.plan === 'premium' ? 'Premium' : 
                       restaurant.plan === 'basic' ? 'Basic' : 
                       'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>€{restaurant.revenue}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar como Propietario
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Store className="mr-2 h-4 w-4" />
                          Gestionar Menú
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

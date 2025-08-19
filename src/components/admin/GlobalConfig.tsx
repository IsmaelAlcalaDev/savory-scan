
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Tag, MapPin, Utensils, Save } from 'lucide-react';

export function GlobalConfig() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración Global</h2>
          <p className="text-gray-600">Gestiona etiquetas, taxonomías y configuraciones del sistema</p>
        </div>
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      {/* Configuración de taxonomías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Tipos de Cocina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Nuevo tipo de cocina..." className="flex-1" />
                <Button size="sm">Añadir</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {['Mediterránea', 'Italiana', 'Japonesa', 'Mexicana', 'India', 'Francesa', 'China', 'Tailandesa'].map((cuisine, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{cuisine}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">245 rest.</Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">×</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ciudades Principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Nueva ciudad..." className="flex-1" />
                <Button size="sm">Añadir</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza'].map((city, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{city}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">1,247 rest.</Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">×</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Etiquetas personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gestión de Etiquetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Etiquetas de Ambiente</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['Romántico', 'Familiar', 'Casual', 'Elegante', 'Terraza', 'Vista Mar'].map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag} <span className="ml-1 cursor-pointer">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Nueva etiqueta..." className="flex-1" />
                  <Button size="sm">+</Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Etiquetas Dietéticas</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['Vegano', 'Vegetariano', 'Sin Gluten', 'Halal', 'Kosher', 'Bio'].map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                      {tag} <span className="ml-1 cursor-pointer">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Nueva etiqueta..." className="flex-1" />
                  <Button size="sm">+</Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Etiquetas de Servicio</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['Delivery', 'Takeaway', 'Reservas', 'WiFi', 'Parking', 'Mascotas'].map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      {tag} <span className="ml-1 cursor-pointer">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Nueva etiqueta..." className="flex-1" />
                  <Button size="sm">+</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de planes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Planes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Plan Gratuito</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Máx. platos:</span>
                  <Input type="number" value="10" className="w-16 h-8 text-xs" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fotos por plato:</span>
                  <Input type="number" value="1" className="w-16 h-8 text-xs" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Analytics básico:</span>
                  <input type="checkbox" checked />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-3">Plan Básico - €29/mes</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Máx. platos:</span>
                  <Input type="number" value="50" className="w-16 h-8 text-xs" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fotos por plato:</span>
                  <Input type="number" value="3" className="w-16 h-8 text-xs" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Analytics avanzado:</span>
                  <input type="checkbox" checked />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50">
              <h4 className="font-medium mb-3">Plan Premium - €79/mes</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Platos ilimitados:</span>
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fotos ilimitadas:</span>
                  <span className="text-xs text-green-600">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prioridad soporte:</span>
                  <input type="checkbox" checked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

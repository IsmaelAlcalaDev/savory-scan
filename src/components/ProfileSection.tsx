
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Edit2 } from 'lucide-react';

export default function ProfileSection() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg font-semibold">JD</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Juan Díaz</h3>
              <p className="text-muted-foreground mb-2">Miembro desde Enero 2024</p>
              <div className="flex gap-2">
                <Badge variant="secondary">Cliente Frecuente</Badge>
                <Badge variant="outline">15 pedidos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value="juan.diaz@email.com" readOnly />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+34 600 000 000" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input id="address" placeholder="Calle Principal 123, Madrid" />
            </div>
          </div>
          
          <Button className="w-full md:w-auto">Guardar Cambios</Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">€247</div>
              <div className="text-sm text-muted-foreground">Total gastado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Favoritos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Reseñas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

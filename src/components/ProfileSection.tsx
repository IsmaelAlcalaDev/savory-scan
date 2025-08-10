
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileSection() {
  // Check if VEG mode is active from body class
  const isVegMode = typeof document !== 'undefined' && document.body.classList.contains('veg-mode');

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className={cn(
        "transition-all duration-300",
        isVegMode ? "border-green-200" : "border-red-200"
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className={cn(
                  "text-lg font-semibold transition-colors duration-300",
                  isVegMode ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  JD
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="outline"
                className={cn(
                  "absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 transition-all duration-300",
                  isVegMode 
                    ? "border-green-300 hover:bg-green-50 hover:border-green-400" 
                    : "border-red-300 hover:bg-red-50 hover:border-red-400"
                )}
              >
                <Edit2 className={cn(
                  "h-3 w-3 transition-colors duration-300",
                  isVegMode ? "text-green-600" : "text-red-600"
                )} />
              </Button>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Juan Díaz</h3>
              <p className="text-muted-foreground mb-2">Miembro desde Enero 2024</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className={cn(
                  "transition-colors duration-300",
                  isVegMode 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                )}>
                  Cliente Frecuente
                </Badge>
                <Badge variant="outline" className={cn(
                  "transition-colors duration-300",
                  isVegMode 
                    ? "border-green-300 text-green-600" 
                    : "border-red-300 text-red-600"
                )}>
                  15 pedidos
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className={cn(
        "transition-all duration-300",
        isVegMode ? "border-green-200" : "border-red-200"
      )}>
        <CardHeader>
          <CardTitle className={cn(
            "text-lg transition-colors duration-300",
            isVegMode ? "text-green-700" : "text-red-700"
          )}>
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isVegMode ? "text-green-600" : "text-red-600"
                )} />
                <Input 
                  id="email" 
                  type="email" 
                  value="juan.diaz@email.com" 
                  readOnly 
                  className={cn(
                    "transition-colors duration-300",
                    isVegMode 
                      ? "focus:border-green-400 focus:ring-green-200" 
                      : "focus:border-red-400 focus:ring-red-200"
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex items-center gap-2">
                <Phone className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isVegMode ? "text-green-600" : "text-red-600"
                )} />
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+34 600 000 000"
                  className={cn(
                    "transition-colors duration-300",
                    isVegMode 
                      ? "focus:border-green-400 focus:ring-green-200" 
                      : "focus:border-red-400 focus:ring-red-200"
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <div className="flex items-center gap-2">
              <MapPin className={cn(
                "h-4 w-4 transition-colors duration-300",
                isVegMode ? "text-green-600" : "text-red-600"
              )} />
              <Input 
                id="address" 
                placeholder="Calle Principal 123, Madrid"
                className={cn(
                  "transition-colors duration-300",
                  isVegMode 
                    ? "focus:border-green-400 focus:ring-green-200" 
                    : "focus:border-red-400 focus:ring-red-200"
                )}
              />
            </div>
          </div>
          
          <Button className={cn(
            "w-full md:w-auto transition-all duration-300",
            isVegMode 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          )}>
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className={cn(
        "transition-all duration-300",
        isVegMode ? "border-green-200" : "border-red-200"
      )}>
        <CardHeader>
          <CardTitle className={cn(
            "text-lg transition-colors duration-300",
            isVegMode ? "text-green-700" : "text-red-700"
          )}>
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold transition-colors duration-300",
                isVegMode ? "text-green-600" : "text-red-600"
              )}>
                15
              </div>
              <div className="text-sm text-muted-foreground">Pedidos</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold transition-colors duration-300",
                isVegMode ? "text-green-600" : "text-red-600"
              )}>
                €247
              </div>
              <div className="text-sm text-muted-foreground">Total gastado</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold transition-colors duration-300",
                isVegMode ? "text-green-600" : "text-red-600"
              )}>
                8
              </div>
              <div className="text-sm text-muted-foreground">Favoritos</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold transition-colors duration-300",
                isVegMode ? "text-green-600" : "text-red-600"
              )}>
                3
              </div>
              <div className="text-sm text-muted-foreground">Reseñas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

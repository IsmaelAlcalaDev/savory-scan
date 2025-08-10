
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Edit2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function ProfileSection() {
  const { profile, loading, updating, updateProfile, getInitials, getMemberSince } = useUserProfile();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  // Check if VEG mode is active from body class
  const isVegMode = typeof document !== 'undefined' && document.body.classList.contains('veg-mode');

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    );
  }

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
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className={cn(
                  "text-lg font-semibold transition-colors duration-300",
                  isVegMode ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setEditMode(!editMode)}
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
              <h3 className="text-xl font-semibold mb-1">
                {profile.full_name || 'Usuario'}
              </h3>
              <p className="text-muted-foreground mb-2">
                Miembro desde {getMemberSince()}
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className={cn(
                  "transition-colors duration-300",
                  isVegMode 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                )}>
                  Usuario Registrado
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
                  value={profile.email || ''} 
                  readOnly 
                  className={cn(
                    "transition-colors duration-300 bg-muted",
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
                  value={editMode ? formData.phone : (profile.phone || '')}
                  onChange={(e) => editMode && setFormData({...formData, phone: e.target.value})}
                  readOnly={!editMode}
                  placeholder="+34 600 000 000"
                  className={cn(
                    "transition-colors duration-300",
                    !editMode && "bg-muted",
                    isVegMode 
                      ? "focus:border-green-400 focus:ring-green-200" 
                      : "focus:border-red-400 focus:ring-red-200"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input 
              id="full_name" 
              value={editMode ? formData.full_name : (profile.full_name || '')}
              onChange={(e) => editMode && setFormData({...formData, full_name: e.target.value})}
              readOnly={!editMode}
              placeholder="Tu nombre completo"
              className={cn(
                "transition-colors duration-300",
                !editMode && "bg-muted",
                isVegMode 
                  ? "focus:border-green-400 focus:ring-green-200" 
                  : "focus:border-red-400 focus:ring-red-200"
              )}
            />
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
                value={editMode ? formData.address : (profile.address || '')}
                onChange={(e) => editMode && setFormData({...formData, address: e.target.value})}
                readOnly={!editMode}
                placeholder="Tu dirección"
                className={cn(
                  "transition-colors duration-300",
                  !editMode && "bg-muted",
                  isVegMode 
                    ? "focus:border-green-400 focus:ring-green-200" 
                    : "focus:border-red-400 focus:ring-red-200"
                )}
              />
            </div>
          </div>
          
          {editMode ? (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={updating}
                className={cn(
                  "transition-all duration-300",
                  isVegMode 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={updating}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setEditMode(true)}
              className={cn(
                "w-full md:w-auto transition-all duration-300",
                isVegMode 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              Editar Perfil
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

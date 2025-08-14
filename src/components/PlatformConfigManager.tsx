
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformConfigs } from '@/hooks/usePlatformConfigs';
import PlatformLogoUploader from './PlatformLogoUploader';
import { toast } from 'sonner';
import { Save, Plus } from 'lucide-react';

interface PlatformConfig {
  id: number;
  platform_key: string;
  platform_name: string;
  icon_name: string;
  icon_color?: string;
  logo_url?: string;
  base_url?: string;
  url_pattern?: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

export default function PlatformConfigManager() {
  const { data: platforms } = usePlatformConfigs();
  const [editingPlatforms, setEditingPlatforms] = useState<Record<number, PlatformConfig>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (platforms) {
      const initialState: Record<number, PlatformConfig> = {};
      platforms.forEach(platform => {
        initialState[platform.id] = { ...platform };
      });
      setEditingPlatforms(initialState);
    }
  }, [platforms]);

  const handleInputChange = (platformId: number, field: keyof PlatformConfig, value: string) => {
    setEditingPlatforms(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [field]: value
      }
    }));
  };

  const handleLogoUploaded = (platformId: number, logoUrl: string) => {
    setEditingPlatforms(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        logo_url: logoUrl
      }
    }));
    
    // Auto-guardar cuando se sube un logo
    savePlatform(platformId, { ...editingPlatforms[platformId], logo_url: logoUrl });
  };

  const savePlatform = async (platformId: number, platformData?: PlatformConfig) => {
    try {
      setSaving(prev => ({ ...prev, [platformId]: true }));
      
      const dataToSave = platformData || editingPlatforms[platformId];
      
      const { error } = await supabase
        .from('platform_configs')
        .update({
          platform_name: dataToSave.platform_name,
          icon_color: dataToSave.icon_color,
          logo_url: dataToSave.logo_url,
          base_url: dataToSave.base_url,
          url_pattern: dataToSave.url_pattern
        })
        .eq('id', platformId);

      if (error) throw error;

      toast.success('Plataforma actualizada correctamente');
    } catch (error: any) {
      console.error('Error saving platform:', error);
      toast.error('Error al guardar la plataforma');
    } finally {
      setSaving(prev => ({ ...prev, [platformId]: false }));
    }
  };

  if (!platforms) {
    return <div>Cargando plataformas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuración de Plataformas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(platform => {
          const editingPlatform = editingPlatforms[platform.id];
          if (!editingPlatform) return null;

          return (
            <Card key={platform.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {platform.platform_name}
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {platform.category}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`name-${platform.id}`}>Nombre de la plataforma</Label>
                  <Input
                    id={`name-${platform.id}`}
                    value={editingPlatform.platform_name}
                    onChange={(e) => handleInputChange(platform.id, 'platform_name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`color-${platform.id}`}>Color del icono</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`color-${platform.id}`}
                      value={editingPlatform.icon_color || ''}
                      onChange={(e) => handleInputChange(platform.id, 'icon_color', e.target.value)}
                      placeholder="#FF0000"
                    />
                    {editingPlatform.icon_color && (
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: editingPlatform.icon_color }}
                      />
                    )}
                  </div>
                </div>

                <PlatformLogoUploader
                  platformKey={platform.platform_key}
                  platformName={platform.platform_name}
                  currentLogoUrl={editingPlatform.logo_url}
                  onLogoUploaded={(url) => handleLogoUploaded(platform.id, url)}
                />

                <div>
                  <Label htmlFor={`baseurl-${platform.id}`}>URL base</Label>
                  <Input
                    id={`baseurl-${platform.id}`}
                    value={editingPlatform.base_url || ''}
                    onChange={(e) => handleInputChange(platform.id, 'base_url', e.target.value)}
                    placeholder="https://www.glovo.com"
                  />
                </div>

                <div>
                  <Label htmlFor={`pattern-${platform.id}`}>Patrón de URL</Label>
                  <Input
                    id={`pattern-${platform.id}`}
                    value={editingPlatform.url_pattern || ''}
                    onChange={(e) => handleInputChange(platform.id, 'url_pattern', e.target.value)}
                    placeholder="/es/madrid/restaurant/{slug}"
                  />
                </div>

                <Button
                  onClick={() => savePlatform(platform.id)}
                  disabled={saving[platform.id]}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving[platform.id] ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

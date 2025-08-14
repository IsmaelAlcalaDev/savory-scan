
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformLogoUploaderProps {
  platformKey: string;
  platformName: string;
  currentLogoUrl?: string;
  onLogoUploaded: (url: string) => void;
}

export default function PlatformLogoUploader({
  platformKey,
  platformName,
  currentLogoUrl,
  onLogoUploaded
}: PlatformLogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen');
      }

      const file = event.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 2MB');
      }

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${platformKey}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from('platform-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Sobrescribir si ya existe
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('platform-logos')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onLogoUploaded(publicUrl);
      
      toast.success(`Logo de ${platformName} subido correctamente`);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor={`logo-${platformKey}`} className="text-sm font-medium">
            Logo de {platformName}
          </Label>
          <Input
            id={`logo-${platformKey}`}
            type="file"
            accept="image/*"
            onChange={uploadLogo}
            disabled={uploading}
            className="mt-1"
          />
        </div>
        
        {previewUrl && (
          <div className="w-16 h-16 border rounded-lg overflow-hidden bg-white p-2">
            <img
              src={previewUrl}
              alt={`Logo de ${platformName}`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-spin" />
          Subiendo logo...
        </div>
      )}
    </div>
  );
}

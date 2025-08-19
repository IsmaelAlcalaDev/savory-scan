
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Images, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedImage from './OptimizedImage';

interface GalleryImage {
  image_url: string;
  alt_text?: string;
  caption?: string;
}

interface RestaurantGalleryProps {
  gallery: GalleryImage[];
  restaurantName: string;
}

export default function RestaurantGallery({ gallery, restaurantName }: RestaurantGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!gallery || gallery.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % gallery.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? gallery.length - 1 : selectedImage - 1);
    }
  };

  return (
    <>
      <Card className="bg-gradient-card border-glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" />
            Galería ({gallery.length} fotos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <div
                key={index}
                className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <OptimizedImage
                  src={image.image_url}
                  alt={image.alt_text || `${restaurantName} - Imagen ${index + 1}`}
                  context="gallery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          {selectedImage !== null && (
            <div className="relative">
              <OptimizedImage
                src={gallery[selectedImage].image_url}
                alt={gallery[selectedImage].alt_text || `${restaurantName} - Imagen ${selectedImage + 1}`}
                context="gallery"
                priority={true}
                className="w-full h-auto max-h-[80vh] object-contain"
                sizes="90vw"
              />
              
              {gallery[selectedImage].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                  <p className="text-center">{gallery[selectedImage].caption}</p>
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="absolute top-4 right-4 text-white bg-black/60 px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {gallery.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

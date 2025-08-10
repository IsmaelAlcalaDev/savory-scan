
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter,
  Shield,
  FileText,
  HelpCircle,
  Users
} from 'lucide-react';

interface MenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuModal({ open, onOpenChange }: MenuModalProps) {
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            FoodieSpot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de contacto */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">info@foodiespot.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+34 900 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Madrid, España</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Enlaces legales */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Legal</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2"
                onClick={() => handleLinkClick('/privacy')}
              >
                <Shield className="h-4 w-4 mr-3" />
                <span className="text-sm">Política de Privacidad</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2"
                onClick={() => handleLinkClick('/terms')}
              >
                <FileText className="h-4 w-4 mr-3" />
                <span className="text-sm">Términos y Condiciones</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Soporte */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Soporte</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2"
                onClick={() => handleLinkClick('/help')}
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                <span className="text-sm">Centro de Ayuda</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto p-2"
                onClick={() => handleLinkClick('/about')}
              >
                <Users className="h-4 w-4 mr-3" />
                <span className="text-sm">Sobre Nosotros</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Redes sociales */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Síguenos</h3>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick('https://instagram.com')}
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick('https://facebook.com')}
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick('https://twitter.com')}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLinkClick('https://foodiespot.com')}
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 FoodieSpot. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

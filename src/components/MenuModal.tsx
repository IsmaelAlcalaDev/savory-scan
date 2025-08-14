
import React from 'react';
import {
  Dialog,
  DialogContent,
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
  Users,
  Languages
} from 'lucide-react';
import { useLanguages } from '@/hooks/useLanguages';

interface MenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuModal({ open, onOpenChange }: MenuModalProps) {
  const { data: languages = [], isLoading } = useLanguages();
  const [selectedLanguage, setSelectedLanguage] = React.useState<any>(null);

  // Set default language when data loads
  React.useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      const defaultLanguage = languages.find((lang: any) => lang.code === 'es') || languages[0];
      setSelectedLanguage(defaultLanguage);
    }
  }, [languages, selectedLanguage]);

  const handleLanguageChange = (language: any) => {
    setSelectedLanguage(language);
    console.log('Changing language to:', language.code);
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  const renderFlag = (language: any, size = 24) => {
    if (language.flag_url) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={language.flag_url}
            alt={`${language.name} flag`}
            className="w-full h-full object-cover"
            width={size}
            height={size}
          />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
        {language.code.toUpperCase()}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 overflow-hidden rounded-lg">
        <div className="overflow-y-auto max-h-[80vh] p-6 space-y-6 rounded-lg">
          {/* Selector de idioma */}
          <div>
            <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Idioma
            </h3>
            {!isLoading && languages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {languages.map((language: any) => (
                  <button
                    key={language.id}
                    onClick={() => handleLanguageChange(language)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      selectedLanguage?.id === language.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {renderFlag(language, 24)}
                    <span className="text-sm font-medium">{language.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

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

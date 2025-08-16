
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
import { useIsMobile } from '@/hooks/use-mobile';

interface MenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuModal({ open, onOpenChange }: MenuModalProps) {
  const { data: languages = [], isLoading } = useLanguages();
  const isMobile = useIsMobile();
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
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
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
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
        {language.code.toUpperCase()}
      </div>
    );
  };

  const MenuContent = (
    <div className="p-4 space-y-4 sm:space-y-6">
      {/* Selector de idioma - Mejorado para móviles */}
      <div>
        <h3 className="font-semibold mb-3 text-base sm:text-lg flex items-center gap-2">
          <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
          Idioma
        </h3>
        {!isLoading && languages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {languages.map((language: any) => (
              <button
                key={language.id}
                onClick={() => handleLanguageChange(language)}
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all text-left ${
                  selectedLanguage?.id === language.id
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {renderFlag(language, 24)}
                <span className="text-sm font-medium truncate">{language.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Información de contacto */}
      <div>
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Contacto</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm break-all">info@foodiespot.com</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">+34 900 123 456</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">Madrid, España</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Enlaces legales */}
      <div>
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Legal</h3>
        <div className="space-y-1 sm:space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left"
            onClick={() => handleLinkClick('/privacy')}
          >
            <Shield className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-sm">Política de Privacidad</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left"
            onClick={() => handleLinkClick('/terms')}
          >
            <FileText className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-sm">Términos y Condiciones</span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Soporte */}
      <div>
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Soporte</h3>
        <div className="space-y-1 sm:space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left"
            onClick={() => handleLinkClick('/help')}
          >
            <HelpCircle className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-sm">Centro de Ayuda</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left"
            onClick={() => handleLinkClick('/about')}
          >
            <Users className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="text-sm">Sobre Nosotros</span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Redes sociales */}
      <div>
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Síguenos</h3>
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
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
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        {MenuContent}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {MenuContent}
      </DialogContent>
    </Dialog>
  );
}

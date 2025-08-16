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
  Languages,
  Check
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

  const renderFlag = (language: any) => {
    if (language.flag_url) {
      return (
        <img
          src={language.flag_url}
          alt={`${language.name} flag`}
          className="w-4 h-4 rounded-sm object-cover flex-shrink-0"
        />
      );
    }
    return (
      <div className="w-4 h-4 rounded-sm bg-gray-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
        {language.code.toUpperCase()}
      </div>
    );
  };

  const MenuContent = (
    <div className="p-4 space-y-4 sm:space-y-6 h-full">
      {/* Selector de idioma - Estilo lista con texto */}
      <div>
        <h3 className="font-semibold mb-3 text-base sm:text-lg flex items-center gap-2">
          <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
          Idioma
        </h3>
        {!isLoading && languages.length > 0 && (
          <div className="space-y-1">
            {languages.map((language: any) => (
              <button
                key={language.id}
                onClick={() => handleLanguageChange(language)}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors text-left hover:bg-gray-50 ${
                  selectedLanguage?.id === language.id
                    ? 'text-primary bg-primary/5'
                    : 'text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  {renderFlag(language)}
                  <span className="text-sm">{language.name}</span>
                </div>
                {selectedLanguage?.id === language.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
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
      <SheetContent side="bottom" className="h-screen overflow-y-auto p-0">
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

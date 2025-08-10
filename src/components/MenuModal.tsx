
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Mail, Phone, MapPin, Shield, FileText, HelpCircle } from 'lucide-react';

interface MenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

const footerLinks = [
  {
    title: 'Empresa',
    links: [
      { name: 'Acerca de nosotros', href: '/about' },
      { name: 'Carreras', href: '/careers' },
      { name: 'Prensa', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ]
  },
  {
    title: 'Soporte',
    links: [
      { name: 'Centro de ayuda', href: '/help', icon: HelpCircle },
      { name: 'Contacto', href: '/contact', icon: Mail },
      { name: 'Términos de servicio', href: '/terms', icon: FileText },
      { name: 'Política de privacidad', href: '/privacy', icon: Shield },
    ]
  },
];

export default function MenuModal({ open, onOpenChange }: MenuModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Menú</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Language Selector */}
          <div>
            <h3 className="text-sm font-medium mb-3">Idioma</h3>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((language) => (
                <Button
                  key={language.code}
                  variant={selectedLanguage === language.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLanguage(language.code)}
                  className="justify-start gap-2"
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-xs">{language.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer Links */}
          <div className="space-y-4">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Button
                        key={link.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8"
                        onClick={() => {
                          // Handle navigation
                          window.open(link.href, '_blank');
                        }}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="text-sm">{link.name}</span>
                        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Contacto</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hola@foodiespot.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

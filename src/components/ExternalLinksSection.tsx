
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink,
  Star,
  FileText,
  Menu,
  AlertCircle,
  Wine,
  QrCode
} from 'lucide-react';

interface ExternalLinksSectionProps {
  website?: string;
  tripadvisor_url?: string;
  menuLinks?: any;
}

export default function ExternalLinksSection({ 
  website, 
  tripadvisor_url, 
  menuLinks 
}: ExternalLinksSectionProps) {
  return (
    <div className="space-y-6">
      {/* Sitio Web y TripAdvisor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Enlaces Principales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {website && (
            <Button
              variant="outline"
              className="p-4 h-auto justify-between hover:bg-blue-600 hover:text-white transition-all duration-200"
              asChild
            >
              <a href={website} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5" />
                  <span className="font-medium">Sitio Web</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          
          {tripadvisor_url && (
            <Button
              variant="outline"
              className="p-4 h-auto justify-between hover:bg-green-600 hover:text-white transition-all duration-200"
              asChild
            >
              <a href={tripadvisor_url} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">TripAdvisor</span>
                </div>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Enlaces de Menús */}
      {menuLinks && Object.keys(menuLinks).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Menús y Cartas</h3>
          <div className="space-y-3">
            {Object.entries(menuLinks).map(([key, url]) => {
              let icon = FileText;
              let name = key;
              
              switch (key) {
                case 'carta_digital':
                  icon = QrCode;
                  name = 'Carta Digital';
                  break;
                case 'pdf_menu':
                  icon = FileText;
                  name = 'Menú PDF';
                  break;
                case 'wine_list':
                  icon = Wine;
                  name = 'Carta de Vinos';
                  break;
                case 'allergens_info':
                  icon = AlertCircle;
                  name = 'Información de Alérgenos';
                  break;
                case 'omakase_menu':
                  icon = Menu;
                  name = 'Menú Omakase';
                  break;
                default:
                  name = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              }
              
              const Icon = icon;
              
              return (
                <Button
                  key={key}
                  variant="outline"
                  className="w-full p-4 h-auto justify-between hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  asChild
                >
                  <a href={url as string} target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{name}</span>
                    </div>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

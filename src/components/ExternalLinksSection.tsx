
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink,
  Star,
  FileText
} from 'lucide-react';

interface ExternalLinksSectionProps {
  website?: string;
}

export default function ExternalLinksSection({ website }: ExternalLinksSectionProps) {
  return (
    <div className="space-y-6">
      {/* Sitio Web */}
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
          
          <Button
            variant="outline"
            className="p-4 h-auto justify-between hover:bg-green-600 hover:text-white transition-all duration-200"
            asChild
          >
            <a href="#" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5" />
                <span className="font-medium">TripAdvisor</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Enlaces de Menús */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Menús y Cartas</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full p-4 h-auto justify-between hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            asChild
          >
            <a href="#" target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Carta Digital</span>
              </div>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

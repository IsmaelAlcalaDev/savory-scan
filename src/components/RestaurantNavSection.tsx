
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Utensils,
  Images,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface RestaurantNavSectionProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onViewMenu: () => void;
  hasPromotions: boolean;
}

export default function RestaurantNavSection({ 
  activeSection, 
  onSectionClick, 
  onViewMenu,
  hasPromotions 
}: RestaurantNavSectionProps) {
  const menuSections = [
    { id: 'fotos', label: 'Galería', icon: Images },
    { id: 'servicios', label: 'Servicios', icon: CheckCircle },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'reservas', label: 'Reservas', icon: Users },
    ...(hasPromotions ? [
      { id: 'promociones', label: 'Promociones', icon: TrendingUp }
    ] : []),
    { id: 'eventos', label: 'Eventos', icon: Users },
    { id: 'contacto', label: 'Contacto', icon: Phone }
  ];

  return (
    <div className="mb-12">
      {/* Main CTA */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          onClick={onViewMenu}
          size="lg"
          className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white border-0 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Utensils className="h-6 w-6 mr-3" />
          Ver Carta Completa
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
        <div className="flex flex-wrap gap-2">
          {menuSections.map((section) => (
            <Button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              variant={activeSection === section.id ? "default" : "ghost"}
              className={`flex-1 min-w-0 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md transform scale-105'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <section.icon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="truncate">{section.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

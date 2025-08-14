
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Utensils,
  Images,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  Phone
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
    ...(hasPromotions ? [
      { id: 'promociones', label: 'Promociones', icon: TrendingUp }
    ] : []),
    { id: 'eventos', label: 'Eventos', icon: Users },
    { id: 'contacto', label: 'Contacto', icon: Phone }
  ];

  return (
    <div className="mb-8 sm:mb-12">
      {/* Main CTA - Full Width on Mobile */}
      <div className="flex flex-col mb-6 sm:mb-8">
        <Button
          onClick={onViewMenu}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white border-0 px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Utensils className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
          Ver Carta Completa
        </Button>
      </div>

      {/* Navigation Tabs - Responsive Grid */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-1 sm:p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2">
          {menuSections.map((section) => (
            <Button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              variant={activeSection === section.id ? "default" : "ghost"}
              className={`min-w-0 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md transform scale-105'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <section.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-0 sm:mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate block sm:inline">{section.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

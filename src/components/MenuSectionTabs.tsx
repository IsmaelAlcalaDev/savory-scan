
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MenuSection } from '@/hooks/useRestaurantMenu';
import UnifiedFiltersModal from '@/components/UnifiedFiltersModal';

interface MenuSectionTabsProps {
  sections: MenuSection[];
  activeSection?: number;
  onSectionClick: (sectionId: number) => void;
  selectedAllergens: string[];
  selectedDietTypes: number[];
  onAllergenChange: (allergens: string[]) => void;
  onDietTypeChange: (types: number[]) => void;
}

export default function MenuSectionTabs({ 
  sections, 
  activeSection, 
  onSectionClick,
  selectedAllergens,
  selectedDietTypes,
  onAllergenChange,
  onDietTypeChange
}: MenuSectionTabsProps) {
  if (sections.length === 0) {
    return null;
  }

  const activeFiltersCount = selectedAllergens.length + selectedDietTypes.length;

  return (
    <div className="bg-background border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 px-4 py-3">
          {/* Filter Button */}
          <UnifiedFiltersModal
            selectedAllergens={selectedAllergens}
            selectedDietTypes={selectedDietTypes}
            onAllergenChange={onAllergenChange}
            onDietTypeChange={onDietTypeChange}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className={`flex-shrink-0 rounded-full text-sm px-4 py-2 h-8 border-0 ${
                  activeFiltersCount > 0
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700'
                } flex items-center gap-2`}
              >
                <Filter className="h-3 w-3" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs bg-white text-red-500">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            }
          />
          
          {/* Section Buttons */}
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onSectionClick(section.id)}
              className={`flex-shrink-0 rounded-full text-sm px-4 py-2 h-8 border-0 ${
                activeSection === section.id 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700'
              }`}
            >
              {section.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MenuSection } from '@/types/dish';
import UnifiedFiltersModal from '@/components/UnifiedFiltersModal';
import { useEffect, useRef } from 'react';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Enhanced auto-scroll to active section button when activeSection changes
  useEffect(() => {
    if (activeSection !== undefined && activeButtonRef.current && scrollAreaRef.current) {
      console.log('Enhanced auto-scrolling to active section button:', activeSection);
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const activeButton = activeButtonRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        
        // Calculate positions relative to the scroll container
        const buttonLeft = buttonRect.left - containerRect.left + scrollContainer.scrollLeft;
        const buttonRight = buttonLeft + buttonRect.width;
        const containerWidth = containerRect.width;
        const scrollLeft = scrollContainer.scrollLeft;
        
        // Enhanced margins for better UX
        const leftMargin = 60; // More space on the left
        const rightMargin = 60; // More space on the right
        
        // Check if button needs scrolling (more generous boundaries)
        const needsScrollLeft = buttonLeft < scrollLeft + leftMargin;
        const needsScrollRight = buttonRight > scrollLeft + containerWidth - rightMargin;
        
        if (needsScrollLeft || needsScrollRight) {
          let targetScrollLeft;
          
          if (needsScrollLeft) {
            // Scroll to show button with left margin, but also show some context
            targetScrollLeft = Math.max(0, buttonLeft - leftMargin);
            console.log('Scrolling left to show button with context');
          } else {
            // Scroll to show button with right margin, centering if possible
            const idealCenterPosition = buttonLeft - (containerWidth / 2) + (buttonRect.width / 2);
            targetScrollLeft = Math.max(0, Math.min(idealCenterPosition, buttonRight - containerWidth + rightMargin));
            console.log('Scrolling right to center button or show with margin');
          }
          
          console.log('Enhanced scroll - target position:', targetScrollLeft);
          scrollContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });
        } else {
          console.log('Button already visible with good margins, no scroll needed');
        }
      }
    }
  }, [activeSection]);

  if (sections.length === 0) {
    return null;
  }

  const activeFiltersCount = selectedAllergens.length + selectedDietTypes.length;

  console.log('MenuSectionTabs render - activeSection:', activeSection, 'sections:', sections.map(s => ({ id: s.id, name: s.name })));

  return (
    <div className="bg-background">
      <ScrollArea className="w-full whitespace-nowrap" ref={scrollAreaRef}>
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
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            console.log('Rendering section button:', section.id, section.name, 'isActive:', isActive);
            
            return (
              <Button
                key={section.id}
                ref={isActive ? activeButtonRef : null}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onSectionClick(section.id)}
                className={`flex-shrink-0 rounded-full text-sm px-4 py-2 h-8 border-0 transition-colors ${
                  isActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-red-500 hover:text-white text-gray-700'
                }`}
              >
                {section.name}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

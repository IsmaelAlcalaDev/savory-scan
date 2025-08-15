
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { MenuSection } from '@/hooks/useRestaurantMenu';

interface MenuSectionTabsProps {
  sections: MenuSection[];
  activeSection?: number;
  onSectionClick: (sectionId: number) => void;
}

export default function MenuSectionTabs({ sections, activeSection, onSectionClick }: MenuSectionTabsProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="bg-background border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 px-4 py-3">
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

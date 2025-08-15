
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
    <div className="bg-white">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-4">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onSectionClick(section.id)}
              className="flex-shrink-0 rounded-full text-sm px-4 py-2 h-8 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-0"
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

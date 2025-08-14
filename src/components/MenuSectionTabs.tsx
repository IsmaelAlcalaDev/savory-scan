
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="border-b bg-muted/30">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-4">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => onSectionClick(section.id)}
              className="flex-shrink-0 rounded-full"
            >
              {section.name}
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs"
              >
                {section.dishes.length}
              </Badge>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

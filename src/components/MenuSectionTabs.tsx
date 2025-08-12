
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MenuSection } from '@/hooks/useRestaurantMenu';

interface MenuSectionTabsProps {
  sections: MenuSection[];
  activeSection: number | null;
  onSectionChange: (sectionId: number | null) => void;
}

export default function MenuSectionTabs({
  sections,
  activeSection,
  onSectionChange,
}: MenuSectionTabsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={activeSection === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSectionChange(null)}
            className="flex-shrink-0"
          >
            Todos
            <Badge variant="secondary" className="ml-2">
              {sections.reduce((total, section) => total + section.dishes.length, 0)}
            </Badge>
          </Button>
          
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              className="flex-shrink-0"
            >
              {section.name}
              <Badge variant="secondary" className="ml-2">
                {section.dishes.length}
              </Badge>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


import { useState } from 'react';
import { Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCustomTags } from '@/hooks/useCustomTags';

interface CustomTagsFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function CustomTagsFilter({ selectedTags, onTagsChange }: CustomTagsFilterProps) {
  const [open, setOpen] = useState(false);
  const { tags, loading, getTagsWithCounts } = useCustomTags();
  const tagsWithCounts = getTagsWithCounts();

  const handleTagToggle = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    
    onTagsChange(newTags);
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (loading || tagsWithCounts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-dashed"
          >
            <Tag className="h-4 w-4" />
            Tags personalizados
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Tags personalizados</h4>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllTags}
                  className="h-auto p-1 text-xs"
                >
                  Limpiar
                </Button>
              )}
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {tagsWithCounts.map((item) => {
                const isSelected = selectedTags.includes(item.tag);
                return (
                  <div
                    key={item.tag}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-secondary/20 border-secondary hover:bg-secondary/30'
                    }`}
                    onClick={() => handleTagToggle(item.tag)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{item.tag}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              <span className="ml-1">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

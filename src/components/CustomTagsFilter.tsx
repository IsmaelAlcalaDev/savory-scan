
import { useCustomTags } from '@/hooks/useCustomTags';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomTagsFilterProps {
  selectedCustomTags: string[];
  onCustomTagsChange: (tags: string[]) => void;
}

export default function CustomTagsFilter({
  selectedCustomTags,
  onCustomTagsChange
}: CustomTagsFilterProps) {
  const { customTags, loading, error } = useCustomTags();

  const handleTagToggle = (tag: string, checked: boolean) => {
    if (checked) {
      onCustomTagsChange([...selectedCustomTags, tag]);
    } else {
      onCustomTagsChange(selectedCustomTags.filter(t => t !== tag));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cargando etiquetas...
        </p>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          Error al cargar etiquetas: {error}
        </p>
      </div>
    );
  }

  if (customTags.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No hay etiquetas disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {customTags.map(({ tag, count }) => (
          <div key={tag} className="flex items-center space-x-3">
            <Checkbox
              id={`custom-tag-${tag}`}
              checked={selectedCustomTags.includes(tag)}
              onCheckedChange={(checked) => handleTagToggle(tag, checked as boolean)}
              className="data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <Label 
              htmlFor={`custom-tag-${tag}`}
              className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
            >
              {tag}
              <span className="ml-2 text-xs text-muted-foreground">
                ({count})
              </span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

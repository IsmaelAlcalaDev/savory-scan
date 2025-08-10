
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  hideDropdownArrow?: boolean;
}

export default function LanguageSelector({ hideDropdownArrow = false }: LanguageSelectorProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className={cn(
        "flex items-center gap-1 text-sm font-medium mode-transition"
      )}
    >
      <span className="text-base">🇪🇸</span>
      {!hideDropdownArrow && (
        <span className="text-xs text-muted-foreground">▼</span>
      )}
    </Button>
  );
}

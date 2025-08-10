
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = React.useState(languages[0]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    // Aquí se implementaría la lógica para cambiar el idioma de la aplicación
    console.log('Changing language to:', language.code);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
            {selectedLanguage.flag}
          </div>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-40 z-[9999] bg-background border border-border"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-sm">
              {language.flag}
            </div>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

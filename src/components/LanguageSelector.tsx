
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguages } from '@/hooks/useLanguages';

interface Language {
  id: number;
  code: string;
  name: string;
  flag?: string | null;
  flag_url?: string | null;
  is_active: boolean;
}

export default function LanguageSelector() {
  const { data: languages = [], isLoading } = useLanguages();
  const [selectedLanguage, setSelectedLanguage] = React.useState<Language | null>(null);

  // Set default language when data loads
  React.useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      const defaultLanguage = languages.find(lang => lang.code === 'es') || languages[0];
      setSelectedLanguage(defaultLanguage);
    }
  }, [languages, selectedLanguage]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    console.log('Changing language to:', language.code);
  };

  if (isLoading || !selectedLanguage) {
    return null;
  }

  const renderFlag = (language: Language, size = 24) => {
    if (language.flag_url) {
      return (
        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={language.flag_url}
            alt={`${language.name} flag`}
            className="w-full h-full object-cover"
            width={size}
            height={size}
          />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
        {language.code.toUpperCase()}
      </div>
    );
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="p-0 border-0 bg-transparent hover:bg-transparent focus:bg-transparent flex items-center">
          {renderFlag(selectedLanguage, 24)}
        </button>
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
            key={language.id}
            onClick={() => handleLanguageChange(language)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {renderFlag(language, 20)}
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

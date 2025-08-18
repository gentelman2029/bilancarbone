import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAutoTranslation } from '@/services/translationService';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const { detectLanguage } = useAutoTranslation();
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const handleAutoDetect = async () => {
    setIsAutoDetecting(true);
    try {
      const detectedLang = await detectLanguage(document.body.textContent || '');
      if (detectedLang && detectedLang !== i18n.language) {
        changeLanguage(detectedLang);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    } finally {
      setIsAutoDetecting(false);
    }
  };

  useEffect(() => {
    // Set document direction based on language
    const isRTL = i18n.language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={handleAutoDetect}
          disabled={isAutoDetecting}
          className="cursor-pointer flex items-center gap-2"
        >
          <Languages className="h-4 w-4" />
          <span>Détection auto</span>
          <Badge variant="outline" className="ml-auto text-xs">
            AUTO
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
            {i18n.language === language.code && (
              <Badge variant="secondary" className="ml-auto text-xs">
                ACTUEL
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
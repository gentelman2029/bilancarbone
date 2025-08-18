import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, Loader2 } from 'lucide-react';
import { useAutoTranslation } from '@/services/translationService';
import { useToast } from '@/hooks/use-toast';

interface AutoTranslateButtonProps {
  content?: string;
  onTranslated?: (translatedContent: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const AutoTranslateButton = ({
  content,
  onTranslated,
  variant = 'outline',
  size = 'sm'
}: AutoTranslateButtonProps) => {
  const { i18n } = useTranslation();
  const { autoTranslate } = useAutoTranslation();
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!content || content.trim() === '') {
      toast({
        title: "Aucun contenu à traduire",
        description: "Veuillez fournir du contenu à traduire.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      const translatedContent = await autoTranslate(content, i18n.language);
      onTranslated?.(translatedContent);
      
      toast({
        title: "Traduction réussie",
        description: `Contenu traduit en ${i18n.language === 'fr' ? 'français' : 
          i18n.language === 'en' ? 'anglais' : 
          i18n.language === 'ar' ? 'arabe' : 'allemand'}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Erreur de traduction",
        description: "Impossible de traduire le contenu automatiquement.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAutoTranslate}
      disabled={isTranslating || !content}
      className="gap-2"
    >
      {isTranslating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Traduction...
        </>
      ) : (
        <>
          <Languages className="h-4 w-4" />
          Traduire auto
          {content && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {i18n.language.toUpperCase()}
            </Badge>
          )}
        </>
      )}
    </Button>
  );
};
import { useEffect } from 'react';
import { Globe } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export const GoogleTranslateWidget = () => {
  useEffect(() => {
    // Function to initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,en,ar,de,es,it,pt,ru,zh,ja',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google Translate script if not already loaded
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google?.translate) {
      // If script is already loaded, initialize directly
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup on unmount
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement) {
        translateElement.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <div 
        id="google_translate_element"
        className="google-translate-widget"
      />
    </div>
  );
};
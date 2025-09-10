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
    <div className="relative">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-border/50 bg-card/50 hover:bg-accent/30 transition-all duration-200 min-h-[32px]">
        <Globe className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
        <div 
          id="google_translate_element"
          className="google-translate-widget flex-1 min-w-0"
        />
      </div>
    </div>
  );
};
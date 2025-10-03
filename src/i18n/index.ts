import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  ar: { translation: ar },
  it: { translation: it },
  pt: { translation: pt },
  nl: { translation: nl },
  pl: { translation: pl },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  hi: { translation: en }, // Fallback to English for now
  tr: { translation: en },
  sv: { translation: en },
  no: { translation: en },
  da: { translation: en },
  fi: { translation: en },
  cs: { translation: en },
  el: { translation: en },
  he: { translation: en },
  th: { translation: en },
  vi: { translation: en },
  id: { translation: en },
  ms: { translation: en },
  ro: { translation: en },
  hu: { translation: en },
  uk: { translation: en },
  bg: { translation: en },
  hr: { translation: en },
  sr: { translation: en },
  sk: { translation: en },
  sl: { translation: en },
  lt: { translation: en },
  lv: { translation: en },
  et: { translation: en },
  fa: { translation: en },
  ur: { translation: en },
  bn: { translation: en },
  sw: { translation: en },
  af: { translation: en },
  ca: { translation: en },
  eu: { translation: en },
  gl: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
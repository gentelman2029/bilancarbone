export interface TranslationService {
  translateText(text: string, targetLanguage: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
  getSupportedLanguages(): string[];
}

// Simple translation service using browser's built-in capabilities
class AutoTranslationService implements TranslationService {
  private supportedLanguages = ['fr', 'en', 'ar', 'de'];
  private translationCache = new Map<string, string>();

  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  async detectLanguage(text: string): Promise<string> {
    // Use browser's language detection if available
    if ('navigator' in globalThis && navigator.language) {
      const detectedLang = navigator.language.split('-')[0];
      return this.supportedLanguages.includes(detectedLang) ? detectedLang : 'fr';
    }
    return 'fr'; // Default to French
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const cacheKey = `${text}-${targetLanguage}`;
    
    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    try {
      // Try to use browser's translation API if available
      if ('translation' in navigator && 'createTranslator' in (navigator as any).translation) {
        const translator = await (navigator as any).translation.createTranslator({
          sourceLanguage: 'auto',
          targetLanguage: targetLanguage
        });
        
        const result = await translator.translate(text);
        this.translationCache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.warn('Browser translation not available:', error);
    }

    // Fallback: return original text if no translation service is available
    return text;
  }

  // Auto-translate content based on current language
  async autoTranslate(content: string, currentLanguage: string): Promise<string> {
    if (!content || content.trim() === '') return content;
    
    try {
      const detectedLang = await this.detectLanguage(content);
      
      // If content is already in the target language, return as is
      if (detectedLang === currentLanguage) {
        return content;
      }
      
      return await this.translateText(content, currentLanguage);
    } catch (error) {
      console.error('Auto-translation failed:', error);
      return content; // Return original if translation fails
    }
  }

  // Clear translation cache
  clearCache(): void {
    this.translationCache.clear();
  }
}

export const translationService = new AutoTranslationService();

// Hook for using translation service in components
export const useAutoTranslation = () => {
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    return translationService.translateText(text, targetLang);
  };

  const autoTranslate = async (content: string, currentLang: string): Promise<string> => {
    return translationService.autoTranslate(content, currentLang);
  };

  const detectLanguage = async (text: string): Promise<string> => {
    return translationService.detectLanguage(text);
  };

  return {
    translateText,
    autoTranslate,
    detectLanguage,
    supportedLanguages: translationService.getSupportedLanguages(),
    clearCache: () => translationService.clearCache()
  };
};
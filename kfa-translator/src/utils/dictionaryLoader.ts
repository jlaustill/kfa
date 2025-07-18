import type { ITranslationResult } from "../types";
import { tokenizeEnglishText } from "./tokenizer";

export interface IDictionaryEntry {
  ipa: string;
  priority: number;
  region: string;
}

export class DictionaryLoader {
  private dictionary: Record<string, IDictionaryEntry[]> = {};
  private ipaToEnglish = new Map<string, string[]>();
  private isLoaded = false;

  async loadDictionary(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const response = await fetch('/data/ipadict.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      this.dictionary = jsonData;
      
      // Build reverse mapping (IPA -> English)
      for (const [word, pronunciations] of Object.entries(this.dictionary)) {
        for (const entry of pronunciations) {
          if (!this.ipaToEnglish.has(entry.ipa)) {
            this.ipaToEnglish.set(entry.ipa, []);
          }
          this.ipaToEnglish.get(entry.ipa)?.push(word);
        }
      }
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load dictionary:', error);
      throw error;
    }
  }

  translateEnglishToIpa(word: string): ITranslationResult {
    const cleanWord = word.toLowerCase().trim();
    const pronunciations = this.dictionary[cleanWord];
    
    if (pronunciations && pronunciations.length > 0) {
      // Use highest priority pronunciation (lowest priority number)
      const bestPronunciation = pronunciations.reduce((best, current) => 
        current.priority < best.priority ? current : best
      );
      return { success: true, result: bestPronunciation.ipa };
    }
    
    return { 
      success: false, 
      result: '',
      error: `Word "${word}" not found in dictionary`
    };
  }

  translateIpaToEnglish(ipa: string): ITranslationResult {
    const words = this.ipaToEnglish.get(ipa.trim());
    
    if (words && words.length > 0) {
      // Return the first/most common word
      return { success: true, result: words[0] };
    }
    
    return { 
      success: false, 
      result: '',
      error: `IPA "${ipa}" not found in dictionary`
    };
  }

  // For phrase translation with proper tokenization
  translateEnglishPhraseToIpa(phrase: string): ITranslationResult {
    const tokens = tokenizeEnglishText(phrase);
    const errors: string[] = [];

    const translatedTokens = tokens.map(token => {
      if (token.type === 'word') {
        const result = this.translateEnglishToIpa(token.value);
        if (result.success) {
          return { ...token, value: result.result };
        } else {
          errors.push(`Word "${token.originalCase || token.value}" not found in dictionary`);
          return { ...token, value: `[${token.originalCase || token.value}]` };
        }
      }
      return token;
    });

    const result = translatedTokens.map(token => token.value).join('');

    return {
      success: true, // Always successful if we can provide a result with brackets
      result: result,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  translateIpaPhraseToEnglish(phrase: string): ITranslationResult {
    const ipaWords = phrase.split(/\s+/);
    const englishWords: string[] = [];
    const errors: string[] = [];

    for (const ipaWord of ipaWords) {
      // Skip already-bracketed words (they're unknown from previous step)
      if (ipaWord.startsWith('[') && ipaWord.endsWith(']')) {
        englishWords.push(ipaWord); // Keep the bracketed word as-is
        continue;
      }
      
      const result = this.translateIpaToEnglish(ipaWord);
      if (result.success) {
        englishWords.push(result.result);
      } else {
        errors.push(result.error || `Unknown IPA: ${ipaWord}`);
        englishWords.push(`[${ipaWord}]`); // Mark unknown IPA
      }
    }

    return {
      success: true, // Always successful if we can provide a result with brackets
      result: englishWords.join(' '),
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }
}

export default DictionaryLoader;
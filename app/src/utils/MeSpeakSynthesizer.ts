/**
 * meSpeak.js integration for IPA to speech synthesis
 * Based on the phoneme synthesis approach from itinerarium.github.io/phoneme-synthesis/
 */

import KfaToIpaConverter from './KfaToIpaConverter';

// Import meSpeak with simple typing
interface MeSpeak {
  speak(text: string, options?: any, callback?: () => void): any;
  loadConfig?: (config: any) => void;
  loadVoice?: (voice: any) => void;
}

// Access meSpeak from window object
declare global {
  interface Window {
    meSpeak: MeSpeak;
  }
}

interface IMeSpeakOptions {
  amplitude?: number;
  pitch?: number;
  speed?: number;
  voice?: string;
  wordgap?: number;
  variant?: string;
}

class MeSpeakSynthesizer {
  private kfaConverter: KfaToIpaConverter;
  private isInitialized: boolean = false;

  // IPA to eSpeak phoneme mapping (based on the itinerarium tool)
  private readonly ipaToEspeak: Record<string, string> = {
    // Vowels
    'ə': '@',      // schwa
    'ɪ': 'I',      // short I
    'iː': 'i:',    // long E
    'ɜː': '3:',    // UR sound
    'æ': '{',      // short A
    'uː': 'u:',    // long U
    'e': 'E',      // short E
    'ɑː': 'A:',    // long A
    'ɔː': 'O:',    // long O
    'ʊ': 'U',      // short U
    'ʌ': 'V',      // schwa-like
    'ɒ': 'Q',      // short O (British)
    
    // Diphthongs
    'eɪ': 'eI',    // long A - day
    'aɪ': 'aI',    // long I - my
    'əʊ': '@U',    // long O - go
    'aʊ': 'aU',    // OW sound - now
    'ɪə': 'I@',    // EER sound - here
    'eə': 'e@',    // AIR sound - hair
    'ʊə': 'U@',    // UUR sound - sure
    'ɔɪ': 'OI',    // OY sound - boy
    
    // Consonants
    'n': 'n',      // N sound
    'r': 'r',      // R sound
    't': 't',      // T sound
    's': 's',      // S sound
    'd': 'd',      // D sound
    'l': 'l',      // L sound
    'k': 'k',      // K sound
    'ð': 'D',      // TH (this) - voiced
    'm': 'm',      // M sound
    'z': 'z',      // Z sound
    'p': 'p',      // P sound
    'v': 'v',      // V sound
    'w': 'w',      // W sound
    'b': 'b',      // B sound
    'f': 'f',      // F sound
    'h': 'h',      // H sound
    'ŋ': 'N',      // NG sound
    'ʃ': 'S',      // SH sound
    'j': 'j',      // Y sound
    'g': 'g',      // G sound
    'dʒ': 'dZ',    // J sound
    'tʃ': 'tS',    // CH sound
    'θ': 'T',      // TH (thin) - voiceless
    'ʒ': 'Z',      // ZH sound
  };

  constructor() {
    this.kfaConverter = new KfaToIpaConverter();
  }

  /**
   * Initialize meSpeak.js
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if meSpeak is available globally
      if (typeof window !== 'undefined' && window.meSpeak) {
        this.isInitialized = true;
        console.log('meSpeak.js initialized successfully');
      } else {
        throw new Error('meSpeak.js not found. Make sure it is loaded via script tag.');
      }
    } catch (error) {
      console.error('Failed to initialize meSpeak:', error);
      throw new Error('Failed to initialize speech synthesis');
    }
  }

  /**
   * Convert IPA to eSpeak phoneme format
   */
  private convertIpaToEspeak(ipaText: string): string {
    let result = '';
    let i = 0;

    while (i < ipaText.length) {
      const char = ipaText[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        result += ' ';
        i++;
        continue;
      }

      // Try longer IPA symbols first (2-3 characters)
      let matched = false;

      // Try 3-character IPA symbols
      if (i <= ipaText.length - 3) {
        const threeChar = ipaText.substring(i, i + 3);
        if (this.ipaToEspeak[threeChar]) {
          result += this.ipaToEspeak[threeChar];
          i += 3;
          matched = true;
        }
      }

      // Try 2-character IPA symbols
      if (!matched && i <= ipaText.length - 2) {
        const twoChar = ipaText.substring(i, i + 2);
        if (this.ipaToEspeak[twoChar]) {
          result += this.ipaToEspeak[twoChar];
          i += 2;
          matched = true;
        }
      }

      // Try single character
      if (!matched) {
        if (this.ipaToEspeak[char]) {
          result += this.ipaToEspeak[char];
        } else {
          // Unknown IPA symbol - pass through
          result += char;
        }
        i++;
      }
    }

    return result;
  }

  /**
   * Convert kfa text to eSpeak phonemes
   */
  convertKfaToEspeak(kfaText: string): string {
    const ipaText = this.kfaConverter.convert(kfaText);
    const espeakPhonemes = this.convertIpaToEspeak(ipaText);
    
    // Wrap in eSpeak phoneme brackets
    return `[[${espeakPhonemes}]]`;
  }

  /**
   * Speak kfa text using meSpeak
   */
  async speakKfa(kfaText: string, options: IMeSpeakOptions = {}): Promise<void> {
    await this.initialize();

    if (!this.isInitialized) {
      throw new Error('meSpeak not initialized');
    }

    const espeakPhonemes = this.convertKfaToEspeak(kfaText);
    
    console.log(`kfa: ${kfaText}`);
    console.log(`IPA: ${this.kfaConverter.convert(kfaText)}`);
    console.log(`eSpeak: ${espeakPhonemes}`);
    console.log(`Options:`, options);

    const speakOptions = {
      amplitude: options.amplitude ?? 100,
      pitch: options.pitch ?? 50,
      speed: options.speed ?? 175,
      voice: options.voice ?? 'en/en-us',
      wordgap: options.wordgap ?? 0,
      ...(options.variant && { variant: options.variant }),
    };
    
    console.log(`speakOptions:`, speakOptions);

    return new Promise((resolve, reject) => {
      try {
        window.meSpeak.speak(espeakPhonemes, speakOptions, () => {
          resolve();
        });
      } catch (error) {
        reject(new Error(`meSpeak synthesis failed: ${error}`));
      }
    });
  }

  /**
   * Generate WAV audio data for kfa text
   */
  generateKfaAudio(kfaText: string, options: IMeSpeakOptions = {}): ArrayBuffer | null {
    if (!this.isInitialized) {
      console.error('meSpeak not initialized');
      return null;
    }

    const espeakPhonemes = this.convertKfaToEspeak(kfaText);
    
    const speakOptions = {
      amplitude: options.amplitude ?? 100,
      pitch: options.pitch ?? 50,
      speed: options.speed ?? 175,
      voice: options.voice ?? 'en/en-us',
      wordgap: options.wordgap ?? 0,
      rawdata: 'ArrayBuffer',
      ...options,
    };

    try {
      return window.meSpeak.speak(espeakPhonemes, speakOptions);
    } catch (error) {
      console.error('meSpeak audio generation failed:', error);
      return null;
    }
  }

  /**
   * Check if meSpeak is available and initialized
   */
  isAvailable(): boolean {
    return this.isInitialized && typeof window !== 'undefined' && !!window.meSpeak;
  }

  /**
   * Get available voices
   */
  getVoices(): string[] {
    if (!this.isAvailable()) return [];
    
    // meSpeak typically has these voices available
    return [
      'en/en-us',
      'en/en-uk', 
      'en/en-au',
      'en/en-ca',
    ];
  }
}

export default MeSpeakSynthesizer;
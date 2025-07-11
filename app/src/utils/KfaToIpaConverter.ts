/**
 * kfa to IPA conversion class
 * Based on the complete kfa phoneme system from README.md
 */

class KfaToIpaConverter {
  // Core vowel mappings
  private readonly vowels: Record<string, string> = {
    // Single vowels (order matters for longer combinations first)
    'u': 'ə',     // schwa - but/hut/cut
    'i': 'ɪ',     // short I - bit/hit/kit  
    'y': 'iː',    // long E - beat/heat
    'E': 'ɜː',    // UR sound - bert/hurt/curt
    'a': 'æ',     // short A - bat/hat/cat
    'O': 'uː',    // long U - boot/hoot/coot
    'e': 'e',     // short E - bet/het
    'A': 'ɑː',    // long A - bart/heart/cart
    'o': 'ɔː',    // long O - bought/hot/caught (also ɒ for short O)
    'U': 'ʊ',     // short U - book/good/put
  };

  // Diphthong mappings (check these first before single vowels)
  private readonly diphthongs: Record<string, string> = {
    'ey': 'eɪ',   // long A - day/make/rain
    'ay': 'aɪ',   // long I - my/time/fly
    'uO': 'əʊ',   // long O - go/home/boat
    'au': 'aʊ',   // OW sound - now/house/cloud
    'iE': 'ɪə',   // EER sound - here/beer/deer
    'eE': 'eə',   // AIR sound - hair/care/bear
    'UE': 'ʊə',   // UUR sound - sure/tour/pure
    'oUy': 'ɔɪ',  // OY sound - boy/coin/voice
  };

  // Consonant mappings
  private readonly consonants: Record<string, string> = {
    'n': 'n',     // N sound
    'r': 'r',     // R sound  
    't': 't',     // T sound
    's': 's',     // S sound
    'd': 'd',     // D sound
    'l': 'l',     // L sound
    'k': 'k',     // K sound
    'T': 'ð',     // TH (this) - voiced
    'm': 'm',     // M sound
    'z': 'z',     // Z sound
    'p': 'p',     // P sound
    'v': 'v',     // V sound
    'w': 'w',     // W sound
    'b': 'b',     // B sound
    'f': 'f',     // F sound
    'h': 'h',     // H sound
    'G': 'ŋ',     // NG sound
    'S': 'ʃ',     // SH sound
    'j': 'j',     // Y sound
    'g': 'g',     // G sound
    'J': 'dʒ',    // J sound
    'c': 'tʃ',    // CH sound
    'Q': 'θ',     // TH (thin) - voiceless
    'Z': 'ʒ',     // ZH sound
  };

  /**
   * Tokenize kfa text into phoneme units (handling multi-character diphthongs)
   */
  private tokenize(kfaText: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    
    while (i < kfaText.length) {
      const char = kfaText[i];
      
      // Preserve whitespace as tokens
      if (/\s/.test(char)) {
        tokens.push(char);
        i++;
        continue;
      }
      
      // Check for longest diphthongs first (3 chars)
      if (i <= kfaText.length - 3) {
        const threeChar = kfaText.substring(i, i + 3);
        if (this.diphthongs[threeChar]) {
          tokens.push(threeChar);
          i += 3;
          continue;
        }
      }
      
      // Check for 2-character diphthongs
      if (i <= kfaText.length - 2) {
        const twoChar = kfaText.substring(i, i + 2);
        if (this.diphthongs[twoChar]) {
          tokens.push(twoChar);
          i += 2;
          continue;
        }
      }
      
      // Single character (vowel, consonant, or unknown)
      tokens.push(char);
      i++;
    }
    
    return tokens;
  }

  /**
   * Convert kfa text to IPA notation
   */
  convert(kfaText: string): string {
    if (!kfaText) return '';
    
    const tokens = this.tokenize(kfaText);
    
    return tokens.map(token => {
      // Check diphthongs first
      if (this.diphthongs[token]) {
        return this.diphthongs[token];
      }
      
      // Check vowels
      if (this.vowels[token]) {
        return this.vowels[token];
      }
      
      // Check consonants
      if (this.consonants[token]) {
        return this.consonants[token];
      }
      
      // Unknown token - pass through (whitespace, punctuation, etc.)
      return token;
    }).join('');
  }

  /**
   * Get all supported kfa phonemes
   */
  getSupportedPhonemes(): {
    vowels: string[];
    diphthongs: string[];
    consonants: string[];
  } {
    return {
      vowels: Object.keys(this.vowels),
      diphthongs: Object.keys(this.diphthongs),
      consonants: Object.keys(this.consonants),
    };
  }

  /**
   * Check if a kfa character/sequence is supported
   */
  isSupported(kfaSequence: string): boolean {
    return !!(
      this.vowels[kfaSequence] ||
      this.diphthongs[kfaSequence] ||
      this.consonants[kfaSequence]
    );
  }
}

export default KfaToIpaConverter;
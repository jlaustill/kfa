import KfaToIpaConverter from '../KfaToIpaConverter';

describe('KfaToIpaConverter', () => {
  let converter: KfaToIpaConverter;

  beforeEach(() => {
    converter = new KfaToIpaConverter();
  });

  describe('Basic vowel conversion', () => {
    test('converts single vowels correctly', () => {
      expect(converter.convert('u')).toBe('ə');  // schwa
      expect(converter.convert('i')).toBe('ɪ');  // short I
      expect(converter.convert('y')).toBe('iː'); // long E
      expect(converter.convert('E')).toBe('ɜː'); // UR sound
      expect(converter.convert('a')).toBe('æ');  // short A
      expect(converter.convert('O')).toBe('uː'); // long U
      expect(converter.convert('e')).toBe('e');  // short E
      expect(converter.convert('A')).toBe('ɑː'); // long A
      expect(converter.convert('o')).toBe('ɔː'); // long O
      expect(converter.convert('U')).toBe('ʊ');  // short U
    });
  });

  describe('Diphthong conversion', () => {
    test('converts 2-character diphthongs correctly', () => {
      expect(converter.convert('ey')).toBe('eɪ'); // long A - day
      expect(converter.convert('ay')).toBe('aɪ'); // long I - my
      expect(converter.convert('uO')).toBe('əʊ'); // long O - go
      expect(converter.convert('au')).toBe('aʊ'); // OW sound - now
      expect(converter.convert('iE')).toBe('ɪə'); // EER sound - here
      expect(converter.convert('eE')).toBe('eə'); // AIR sound - hair
      expect(converter.convert('UE')).toBe('ʊə'); // UUR sound - sure
    });

    test('converts 3-character diphthongs correctly', () => {
      expect(converter.convert('oUy')).toBe('ɔɪ'); // OY sound - boy
    });

    test('prioritizes longer diphthongs over shorter ones', () => {
      // 'oUy' should be treated as one unit, not 'o' + 'Uy'
      expect(converter.convert('oUy')).toBe('ɔɪ');
      expect(converter.convert('oUy')).not.toBe('ɔːʊə'); // wrong parsing
    });
  });

  describe('Consonant conversion', () => {
    test('converts basic consonants correctly', () => {
      expect(converter.convert('n')).toBe('n');
      expect(converter.convert('r')).toBe('r');
      expect(converter.convert('t')).toBe('t');
      expect(converter.convert('s')).toBe('s');
      expect(converter.convert('d')).toBe('d');
      expect(converter.convert('l')).toBe('l');
      expect(converter.convert('k')).toBe('k');
      expect(converter.convert('m')).toBe('m');
      expect(converter.convert('z')).toBe('z');
      expect(converter.convert('p')).toBe('p');
      expect(converter.convert('v')).toBe('v');
      expect(converter.convert('w')).toBe('w');
      expect(converter.convert('b')).toBe('b');
      expect(converter.convert('f')).toBe('f');
      expect(converter.convert('h')).toBe('h');
      expect(converter.convert('j')).toBe('j');
      expect(converter.convert('g')).toBe('g');
    });

    test('converts special consonants correctly', () => {
      expect(converter.convert('T')).toBe('ð');  // TH (this) - voiced
      expect(converter.convert('G')).toBe('ŋ');  // NG sound
      expect(converter.convert('S')).toBe('ʃ');  // SH sound
      expect(converter.convert('J')).toBe('dʒ'); // J sound
      expect(converter.convert('c')).toBe('tʃ'); // CH sound
      expect(converter.convert('Q')).toBe('θ');  // TH (thin) - voiceless
      expect(converter.convert('Z')).toBe('ʒ');  // ZH sound
    });
  });

  describe('Word conversion', () => {
    test('converts simple CVC words correctly', () => {
      expect(converter.convert('bit')).toBe('bɪt');
      expect(converter.convert('kat')).toBe('kæt'); // "cat" in kfa should be "kat"
      expect(converter.convert('hot')).toBe('hɔːt');
      expect(converter.convert('pUt')).toBe('pʊt'); // "put" should be "pUt" in kfa (uppercase U)
    });

    test('converts words with diphthongs correctly', () => {
      expect(converter.convert('sy')).toBe('siː');   // see
      expect(converter.convert('ky')).toBe('kiː');   // key
      expect(converter.convert('dey')).toBe('deɪ');  // day
      expect(converter.convert('may')).toBe('maɪ');  // my
      expect(converter.convert('haus')).toBe('haʊs'); // house
      expect(converter.convert('guO')).toBe('gəʊ');  // go
    });

    test('converts words with special consonants correctly', () => {
      expect(converter.convert('Tis')).toBe('ðɪs');  // this
      expect(converter.convert('SiGk')).toBe('ʃɪŋk'); // ???
      expect(converter.convert('ceyE')).toBe('tʃeɪɜː'); // chair-ish (E is ɜː not ə)
    });
  });

  describe('Whitespace and formatting', () => {
    test('preserves whitespace', () => {
      expect(converter.convert('bit hot')).toBe('bɪt hɔːt');
      expect(converter.convert('sy   ky')).toBe('siː   kiː');
    });

    test('handles empty and invalid input', () => {
      expect(converter.convert('')).toBe('');
      expect(converter.convert('   ')).toBe('   ');
    });

    test('passes through unknown characters', () => {
      expect(converter.convert('bit123')).toBe('bɪt123');
      expect(converter.convert('kat!')).toBe('kæt!'); // kfa uses 'k' not 'c' for cat sound
    });
  });

  describe('Helper methods', () => {
    test('getSupportedPhonemes returns all phoneme categories', () => {
      const phonemes = converter.getSupportedPhonemes();
      
      expect(phonemes.vowels).toContain('u');
      expect(phonemes.vowels).toContain('i');
      expect(phonemes.vowels).toContain('y');
      
      expect(phonemes.diphthongs).toContain('ey');
      expect(phonemes.diphthongs).toContain('oUy');
      
      expect(phonemes.consonants).toContain('t');
      expect(phonemes.consonants).toContain('T'); // special TH
    });

    test('isSupported correctly identifies supported phonemes', () => {
      expect(converter.isSupported('i')).toBe(true);
      expect(converter.isSupported('ey')).toBe(true);
      expect(converter.isSupported('T')).toBe(true);
      expect(converter.isSupported('xyz')).toBe(false);
      expect(converter.isSupported('123')).toBe(false);
    });
  });

  describe('Real-world examples from README', () => {
    test('converts Gettysburg Address examples', () => {
      expect(converter.convert('fOr')).toBe('fuːr'); // 'O' maps to uː, 'o' maps to ɔː
      expect(converter.convert('sevun')).toBe('sevən'); // "seven" → s-e-v-u-n where 'u' = ə 
      expect(converter.convert('yiErz')).toBe('iːɪərz'); // "years" includes the 'z' sound
      // Note: These might need refinement based on actual kfa → IPA mappings
    });

    test('converts homophone examples', () => {
      expect(converter.convert('wic')).toBe('wɪtʃ');   // which/witch
      expect(converter.convert('TeE')).toBe('ðeə');   // they're/their/there
      expect(converter.convert('yOr')).toBe('iːuːr'); // your/you're
      expect(converter.convert('hOz')).toBe('huːz');  // whose/who's
    });
  });
});
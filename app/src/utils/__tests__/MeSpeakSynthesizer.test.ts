import MeSpeakSynthesizer from '../MeSpeakSynthesizer';

// Mock meSpeak since it's not available in test environment
const mockMeSpeak = {
  speak: jest.fn(),
  loadConfig: jest.fn(),
  loadVoice: jest.fn(),
};

// Make meSpeak available globally for tests
(global as any).meSpeak = mockMeSpeak;

describe('MeSpeakSynthesizer', () => {
  let synthesizer: MeSpeakSynthesizer;

  beforeEach(() => {
    synthesizer = new MeSpeakSynthesizer();
    jest.clearAllMocks();
  });

  describe('IPA to eSpeak conversion', () => {
    test('converts basic IPA vowels to eSpeak phonemes', () => {
      const result = synthesizer.convertKfaToEspeak('bit'); // b-ɪ-t → b-I-t
      expect(result).toBe('[[bIt]]');
    });

    test('converts kfa diphthongs correctly', () => {
      const result = synthesizer.convertKfaToEspeak('ky'); // k-iː → k-i:
      expect(result).toBe('[[ki:]]');
    });

    test('converts complex kfa words', () => {
      const result = synthesizer.convertKfaToEspeak('haus'); // h-aʊ-s → h-aU-s
      expect(result).toBe('[[haUs]]');
    });

    test('handles special consonants', () => {
      const result = synthesizer.convertKfaToEspeak('Tis'); // ð-ɪ-s → D-I-s
      expect(result).toBe('[[DIs]]');
    });

    test('preserves whitespace between words', () => {
      const result = synthesizer.convertKfaToEspeak('bit ky'); 
      expect(result).toBe('[[bIt ki:]]');
    });
  });

  describe('Speech synthesis', () => {
    beforeEach(async () => {
      // Mock successful initialization
      await synthesizer.initialize();
    });

    test('calls meSpeak.speak with correct phonemes', async () => {
      mockMeSpeak.speak.mockImplementation((_text, _options, callback) => {
        callback && callback();
      });

      await synthesizer.speakKfa('bit');

      expect(mockMeSpeak.speak).toHaveBeenCalledWith(
        '[[bIt]]',
        expect.objectContaining({
          amplitude: 100,
          pitch: 50,
          speed: 175,
          voice: 'en/en-us',
          wordgap: 0,
        }),
        expect.any(Function)
      );
    });

    test('accepts custom speech options', async () => {
      mockMeSpeak.speak.mockImplementation((_text, _options, callback) => {
        callback && callback();
      });

      await synthesizer.speakKfa('ky', {
        amplitude: 80,
        pitch: 60,
        speed: 200,
        voice: 'en/en-uk'
      });

      expect(mockMeSpeak.speak).toHaveBeenCalledWith(
        '[[ki:]]',
        expect.objectContaining({
          amplitude: 80,
          pitch: 60,
          speed: 200,
          voice: 'en/en-uk',
        }),
        expect.any(Function)
      );
    });

    test('handles meSpeak errors gracefully', async () => {
      mockMeSpeak.speak.mockImplementation(() => {
        throw new Error('meSpeak error');
      });

      await expect(synthesizer.speakKfa('bit')).rejects.toThrow('meSpeak synthesis failed');
    });
  });

  describe('Audio generation', () => {
    beforeEach(async () => {
      await synthesizer.initialize();
    });

    test('generates audio data for kfa text', () => {
      const mockArrayBuffer = new ArrayBuffer(1024);
      mockMeSpeak.speak.mockReturnValue(mockArrayBuffer);

      const result = synthesizer.generateKfaAudio('ky');

      expect(mockMeSpeak.speak).toHaveBeenCalledWith(
        '[[ki:]]',
        expect.objectContaining({
          rawdata: 'ArrayBuffer',
        })
      );
      expect(result).toBe(mockArrayBuffer);
    });

    test('returns null when meSpeak fails', () => {
      mockMeSpeak.speak.mockImplementation(() => {
        throw new Error('Audio generation failed');
      });

      const result = synthesizer.generateKfaAudio('bit');
      expect(result).toBeNull();
    });
  });

  describe('Utility methods', () => {
    test('reports availability correctly', async () => {
      expect(synthesizer.isAvailable()).toBe(false);
      
      await synthesizer.initialize();
      expect(synthesizer.isAvailable()).toBe(true);
    });

    test('returns available voices', async () => {
      await synthesizer.initialize();
      const voices = synthesizer.getVoices();
      
      expect(voices).toContain('en/en-us');
      expect(voices).toContain('en/en-uk');
      expect(voices).toContain('en/en-au');
      expect(voices).toContain('en/en-ca');
    });

    test('returns empty voices array when not available', () => {
      const voices = synthesizer.getVoices();
      expect(voices).toEqual([]);
    });
  });

  describe('Real-world kfa examples', () => {
    test('converts Gettysburg Address examples correctly', () => {
      expect(synthesizer.convertKfaToEspeak('fOr')).toBe('[[fu:r]]'); // four
      expect(synthesizer.convertKfaToEspeak('sevun')).toBe('[[sEv@n]]'); // seven
      expect(synthesizer.convertKfaToEspeak('yiErz')).toBe('[[i:I@rz]]'); // years (no 'j' at start)
    });

    test('converts homophone examples correctly', () => {
      expect(synthesizer.convertKfaToEspeak('wic')).toBe('[[wItS]]'); // which/witch
      expect(synthesizer.convertKfaToEspeak('TeE')).toBe('[[De@]]'); // they're/their/there
    });

    test('handles complex diphthongs', () => {
      expect(synthesizer.convertKfaToEspeak('boUy')).toBe('[[bOI]]'); // boy
      expect(synthesizer.convertKfaToEspeak('haus')).toBe('[[haUs]]'); // house
      expect(synthesizer.convertKfaToEspeak('biE')).toBe('[[bI@]]'); // beer
    });
  });
});
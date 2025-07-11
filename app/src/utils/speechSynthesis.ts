/**
 * Web Speech API utilities for kfa text-to-speech synthesis
 * Provides browser compatibility checks and speech synthesis functionality
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export interface SpeechSynthesisSupport {
  isSupported: boolean;
  hasVoices: boolean;
  voices: SpeechSynthesisVoice[];
}

/**
 * Check browser support for Web Speech API
 */
export function checkSpeechSynthesisSupport(): SpeechSynthesisSupport {
  const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  
  if (!isSupported) {
    return {
      isSupported: false,
      hasVoices: false,
      voices: []
    };
  }

  const voices = window.speechSynthesis.getVoices();
  
  return {
    isSupported: true,
    hasVoices: voices.length > 0,
    voices
  };
}

/**
 * Get available voices, with preference for US English voices
 */
export function getPreferredVoices(): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  
  // Filter for English voices, prioritizing US English
  const englishVoices = voices.filter(voice => 
    voice.lang.startsWith('en-US') || 
    voice.lang.startsWith('en-')
  );

  // Sort US English voices first
  return englishVoices.sort((a, b) => {
    if (a.lang.startsWith('en-US') && !b.lang.startsWith('en-US')) return -1;
    if (!a.lang.startsWith('en-US') && b.lang.startsWith('en-US')) return 1;
    return 0;
  });
}

/**
 * Speak kfa text using Web Speech API
 */
export function speakKfaText(
  kfaText: string, 
  options: SpeechOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const support = checkSpeechSynthesisSupport();
    
    if (!support.isSupported) {
      reject(new Error('Web Speech API is not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(kfaText);
    
    // Set options with defaults optimized for kfa pronunciation
    utterance.rate = options.rate ?? 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Use provided voice or find best US English voice
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      const preferredVoices = getPreferredVoices();
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
    }

    utterance.onend = (): void => resolve();
    utterance.onerror = (event): void => reject(new Error(`Speech synthesis error: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech synthesis
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is currently speaking
 */
export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

export default {
  checkSpeechSynthesisSupport,
  getPreferredVoices,
  speakKfaText,
  stopSpeech,
  isSpeaking
};
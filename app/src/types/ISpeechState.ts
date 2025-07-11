/**
 * Type definition for speech synthesis state
 */
interface ISpeechState {
  isSupported: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export default ISpeechState;
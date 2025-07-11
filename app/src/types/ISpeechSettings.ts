/**
 * Type definition for speech synthesis settings
 */
interface ISpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  selectedVoice: SpeechSynthesisVoice | null;
}

export default ISpeechSettings;
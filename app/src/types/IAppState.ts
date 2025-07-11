/**
 * Type definition for main application state
 */
import type ISpeechState from "./ISpeechState";
import type ISpeechSettings from "./ISpeechSettings";

interface IAppState {
  kfaText: string;
  speechState: ISpeechState;
  speechSettings: ISpeechSettings;
  availableVoices: SpeechSynthesisVoice[];
}

export default IAppState;
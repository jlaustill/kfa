export interface IPhonemeMapping {
  ipa: string;
  kfa: string;
  description: string;
  examples: string[];
}

export interface ITranslationResult {
  success: boolean;
  result: string;
  error?: string;
}
/**
 * Type definition for kfa phoneme representation
 */
interface IKfaPhoneme {
  kfa: string;
  ipa: string;
  description: string;
  examples: string[];
}

export default IKfaPhoneme;
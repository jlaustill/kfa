#pragma once

#include <string>
#include <unordered_map>

/**
 * kfa to IPA phonetic converter
 * Converts kfa (QWERTY Phonetic Alphabet) text to International Phonetic Alphabet (IPA)
 * For use with high-quality TTS engines that support phonetic input
 */
class KfaConverter {
public:
    KfaConverter();
    
    // Convert kfa text to IPA representation
    std::string kfa_to_ipa(const std::string& kfa_text) const;
    
    // Convert kfa text to eSpeak phoneme format
    std::string kfa_to_espeak(const std::string& kfa_text) const;
    
    // Validate kfa text for proper phoneme usage
    bool validate_kfa_text(const std::string& kfa_text, std::string& error_message) const;

private:
    // kfa to IPA mapping tables
    std::unordered_map<std::string, std::string> m_kfa_to_ipa_map;
    std::unordered_map<std::string, std::string> m_ipa_to_espeak_map;
    
    // Initialize phoneme mappings
    void initialize_mappings();
    
    // Helper methods
    std::string process_diphthongs(const std::string& text) const;
    std::string process_consonants(const std::string& text) const;
    std::string process_vowels(const std::string& text) const;
};
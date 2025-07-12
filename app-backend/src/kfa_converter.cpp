#include "kfa_converter.h"
#include <algorithm>
#include <cctype>
#include <sstream>

KfaConverter::KfaConverter() {
    initialize_mappings();
}

void KfaConverter::initialize_mappings() {
    // Core vowels (from our frontend implementation)
    m_kfa_to_ipa_map = {
        // Single vowels
        {"u", "ʌ"},      // cup sound - cup, come, love
        {"i", "ɪ"},      // short I - bit, ship
        {"y", "iː"},     // long E - see, tree, key
        {"E", "ɜː"},     // UR sound - bird, word
        {"a", "æ"},      // short A - cat, bat
        {"O", "uː"},     // long U - moon, blue, food
        {"e", "e"},      // short E - bed, red
        {"A", "ɑː"},     // long A - car, father
        {"o", "ɔː"},     // long O - saw, caught
        {"U", "ʊ"},      // short U - book, good
        
        // Diphthongs
        {"ey", "eɪ"},    // long A - day, make
        {"ay", "aɪ"},    // long I - my, time
        {"uO", "əʊ"},    // long O - go, home
        {"au", "aʊ"},    // OW sound - now, house
        {"iE", "ɪə"},    // EER sound - here, beer
        {"eE", "eə"},    // AIR sound - hair, care
        {"UE", "ʊə"},    // UUR sound - sure, tour
        {"oUy", "ɔɪ"},   // OY sound - boy, coin
        
        // Consonants
        {"n", "n"},      {"r", "r"},      {"t", "t"},      {"s", "s"},
        {"d", "d"},      {"l", "l"},      {"k", "k"},      {"T", "ð"},
        {"m", "m"},      {"z", "z"},      {"p", "p"},      {"v", "v"},
        {"w", "w"},      {"b", "b"},      {"f", "f"},      {"h", "h"},
        {"G", "ŋ"},      {"S", "ʃ"},      {"j", "j"},      {"g", "g"},
        {"J", "dʒ"},     {"c", "tʃ"},     {"Q", "θ"},      {"Z", "ʒ"}
    };
    
    // IPA to eSpeak mapping (for engines that prefer eSpeak format)
    m_ipa_to_espeak_map = {
        // Vowels
        {"ə", "@"},      {"ɪ", "I"},      {"iː", "i:"},    {"ɜː", "3:"},
        {"æ", "{"},      {"uː", "u:"},    {"u", "u"},      {"e", "E"},      {"ɑː", "A:"},
        {"ɔː", "O:"},    {"ʊ", "U"},      {"ʌ", "V"},      {"ɒ", "Q"},
        
        // Diphthongs
        {"eɪ", "eI"},    {"aɪ", "aI"},    {"əʊ", "@U"},    {"aʊ", "aU"},
        {"ɪə", "I@"},    {"eə", "E@"},    {"ʊə", "U@"},    {"ɔɪ", "OI"},
        
        // Consonants
        {"ð", "D"},      {"ŋ", "N"},      {"ʃ", "S"},      {"dʒ", "dZ"},
        {"tʃ", "tS"},    {"θ", "T"},      {"ʒ", "Z"},      {"j", "j"}
    };
}

std::string KfaConverter::kfa_to_ipa(const std::string& kfa_text) const {
    if (kfa_text.empty()) return "";
    
    std::string result;
    std::string text = kfa_text;
    
    // Process multi-character phonemes first (diphthongs)
    text = process_diphthongs(text);
    
    // Process remaining single characters
    for (size_t i = 0; i < text.length(); ++i) {
        char c = text[i];
        
        // Handle spaces and punctuation
        if (std::isspace(c) || std::ispunct(c)) {
            result += c;
            continue;
        }
        
        // Look up single character
        std::string char_str(1, c);
        auto it = m_kfa_to_ipa_map.find(char_str);
        if (it != m_kfa_to_ipa_map.end()) {
            result += it->second;
        } else {
            // Unknown character - pass through
            result += c;
        }
    }
    
    return result;
}

std::string KfaConverter::kfa_to_espeak(const std::string& kfa_text) const {
    // First convert to IPA
    std::string ipa_text = kfa_to_ipa(kfa_text);
    
    // Then convert IPA to eSpeak format
    std::string result;
    for (size_t i = 0; i < ipa_text.length(); ) {
        bool found = false;
        
        // Try longer sequences first
        for (size_t len = 3; len >= 1; --len) {
            if (i + len <= ipa_text.length()) {
                std::string substr = ipa_text.substr(i, len);
                auto it = m_ipa_to_espeak_map.find(substr);
                if (it != m_ipa_to_espeak_map.end()) {
                    result += it->second;
                    i += len;
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            result += ipa_text[i];
            ++i;
        }
    }
    
    return result;
}

std::string KfaConverter::process_diphthongs(const std::string& text) const {
    std::string result = text;
    
    // Process 3-character diphthongs first
    for (const auto& [kfa, ipa] : m_kfa_to_ipa_map) {
        if (kfa.length() == 3) {
            size_t pos = 0;
            while ((pos = result.find(kfa, pos)) != std::string::npos) {
                result.replace(pos, kfa.length(), ipa);
                pos += ipa.length();
            }
        }
    }
    
    // Process 2-character diphthongs
    for (const auto& [kfa, ipa] : m_kfa_to_ipa_map) {
        if (kfa.length() == 2) {
            size_t pos = 0;
            while ((pos = result.find(kfa, pos)) != std::string::npos) {
                result.replace(pos, kfa.length(), ipa);
                pos += ipa.length();
            }
        }
    }
    
    return result;
}

bool KfaConverter::validate_kfa_text(const std::string& kfa_text, std::string& error_message) const {
    if (kfa_text.empty()) {
        error_message = "Empty input text";
        return false;
    }
    
    // Check for invalid characters
    for (char c : kfa_text) {
        if (std::isalnum(c) || std::isspace(c) || std::ispunct(c)) {
            continue; // Valid character
        } else {
            error_message = "Invalid character found: ";
            error_message += c;
            return false;
        }
    }
    
    error_message.clear();
    return true;
}
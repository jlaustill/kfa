#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include "kfa_converter.h"

void print_hex_bytes(const std::string& str) {
    std::cout << "Hex bytes: ";
    for (unsigned char c : str) {
        std::cout << std::hex << std::setw(2) << std::setfill('0') << (int)c << " ";
    }
    std::cout << std::dec << std::endl;
}

int main() {
    std::cout << "Debugging Unicode phoneme conversion..." << std::endl;
    
    KfaConverter converter;
    
    std::string kfa_input = "hElO";
    std::string ipa_output = converter.kfa_to_ipa(kfa_input);
    
    std::cout << "kfa: '" << kfa_input << "'" << std::endl;
    std::cout << "IPA: '" << ipa_output << "'" << std::endl;
    std::cout << "Length: " << ipa_output.length() << " bytes" << std::endl;
    
    print_hex_bytes(ipa_output);
    
    std::cout << "\nCharacter by character analysis:" << std::endl;
    for (size_t i = 0; i < ipa_output.length(); ++i) {
        unsigned char c = ipa_output[i];
        std::cout << "  [" << i << "] '" << ipa_output[i] << "' = 0x" 
                  << std::hex << (int)c << std::dec;
        if (c >= 32 && c < 127) {
            std::cout << " (printable ASCII)";
        } else if (c >= 128) {
            std::cout << " (UTF-8 multibyte)";
        }
        std::cout << std::endl;
    }
    
    std::cout << "\nLooking for specific phonemes:" << std::endl;
    
    // Check for ɜ (U+025C)
    std::string test_phoneme = "ɜ";
    std::cout << "Test phoneme 'ɜ': ";
    print_hex_bytes(test_phoneme);
    
    // Check for ː (U+02D0) 
    std::string test_length = "ː";
    std::cout << "Test length 'ː': ";
    print_hex_bytes(test_length);
    
    return 0;
}
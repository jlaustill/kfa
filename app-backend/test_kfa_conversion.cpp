#include <iostream>
#include <vector>
#include <string>
#include "kfa_converter.h"

int main() {
    std::cout << "Testing kfa converter..." << std::endl;
    
    KfaConverter converter;
    
    // Test with kfa examples (corrected according to README.md)
    std::vector<std::string> kfa_examples = {
        "hay",           // hi (/haɪ/)
        "JuO",           // Joe (/dʒəʊ/)  
        "jO",            // you (/juː/)
        "kum",           // come (/kʌm/)
        "hiE",           // here (/hɪə/)
        "hay JuO, kum hiE!" // correct: "Hi Joe, come here!"
    };
    
    for (const auto& kfa_text : kfa_examples) {
        std::cout << "\n--- Testing: '" << kfa_text << "' ---" << std::endl;
        
        try {
            std::string ipa = converter.kfa_to_ipa(kfa_text);
            // eSpeak conversion removed - using IPA only
            
            std::cout << "  kfa:    '" << kfa_text << "'" << std::endl;
            std::cout << "  IPA:    '" << ipa << "'" << std::endl;
            std::cout << "  Mode: IPA-only (eSpeak removed)" << std::endl;
            
        } catch (const std::exception& e) {
            std::cerr << "  Error: " << e.what() << std::endl;
        }
    }
    
    return 0;
}
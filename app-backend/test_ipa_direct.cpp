#include <iostream>
#include <vector>
#include <fstream>
#include "neural_synthesizer.h"

int main() {
    std::cout << "Testing DIRECT IPA phoneme synthesis (no kfa, no eSpeak)..." << std::endl;
    
    try {
        NeuralSynthesizer synthesizer;
        
        if (!synthesizer.initialize()) {
            std::cerr << "Failed to initialize" << std::endl;
            return 1;
        }
        
        // Demonstrative speech parameters
        NeuralSynthesizer::VoiceConfig config;
        config.model_path = "models/en_US-lessac-medium.onnx";
        config.sample_rate = 22050;
        config.length_scale = 2.5f;    // Much slower for clarity
        config.noise_scale = 0.3f;     // Clean speech
        config.noise_w = 0.4f;         // Clear articulation
        
        if (!synthesizer.load_voice(config)) {
            std::cerr << "Failed to load voice" << std::endl;
            return 1;
        }
        
        // Direct IPA for "Hi Joe, come here!"
        // /haɪ dʒuː kʌm hɪə/
        std::string ipa_phonemes = "haɪ dʒuː, kʌm hɪə!";
        
        std::cout << "\n🎙️  Generating direct IPA speech..." << std::endl;
        std::cout << "   IPA: '" << ipa_phonemes << "'" << std::endl;
        std::cout << "   English: 'Hi Joe, come here!'" << std::endl;
        
        auto audio_data = synthesizer.synthesize_phonetic(ipa_phonemes);
        
        if (audio_data.empty()) {
            std::cerr << "No audio data generated" << std::endl;
            return 1;
        }
        
        // Ensure output_waves directory exists and save file there
        system("mkdir -p output_waves");
        std::ofstream output("output_waves/direct_ipa_hi_joe.wav", std::ios::binary);
        output.write(reinterpret_cast<const char*>(audio_data.data()), audio_data.size());
        output.close();
        
        std::cout << "🎵 DIRECT IPA speech saved!" << std::endl;
        std::cout << "   File: output_waves/direct_ipa_hi_joe.wav" << std::endl;
        std::cout << "   Size: " << audio_data.size() << " bytes" << std::endl;
        std::cout << "   Mode: PURE IPA → ONNX (no kfa, no eSpeak)" << std::endl;
        
        return 0;
        
    } catch (const std::exception& e) {
        std::cerr << "Exception: " << e.what() << std::endl;
        return 1;
    }
}
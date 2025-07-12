#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <cstdint>
#include "neural_synthesizer.h"

/**
 * Speech synthesis interface for converting text to audio
 * Supports multiple TTS engines with unified API
 */
class SpeechSynthesizer {
public:
    struct SynthesisOptions {
        std::string voice;
        float speed;
        float pitch;
        float volume;
        std::string format;
        
        // Default constructor
        SynthesisOptions() : voice("en_US-lessac-medium"), speed(1.0f), pitch(1.0f), volume(1.0f), format("wav") {}
    };

    SpeechSynthesizer();
    ~SpeechSynthesizer();

    // Initialize the TTS engine
    bool initialize();
    
    // Synthesize text to audio data
    std::vector<uint8_t> synthesize_text(const std::string& text, const SynthesisOptions& options = {});
    
    // Synthesize phonetic input (IPA format only)
    std::vector<uint8_t> synthesize_phonetic(const std::string& phonemes, const SynthesisOptions& options = {});
    
    // Get list of available voices
    std::vector<std::string> get_available_voices() const;
    
    // Check if engine is ready
    bool is_ready() const;

private:
    bool m_initialized;
    std::map<std::string, std::string> m_voice_models;
    std::unique_ptr<NeuralSynthesizer> m_neural_synth;
    
    // Voice model management
    void load_available_voices();
    void load_voice_if_needed(const std::string& voice_name);
    std::string get_voice_model_path(const std::string& voice_name) const;
};
#include "speech_synthesizer.h"
#include "neural_synthesizer.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdlib>
#include <memory>
#include <array>
#include <stdexcept>
#include <unistd.h>

SpeechSynthesizer::SpeechSynthesizer() : m_initialized(false), m_neural_synth(std::make_unique<NeuralSynthesizer>()) {
    load_available_voices();
}

SpeechSynthesizer::~SpeechSynthesizer() {
}

bool SpeechSynthesizer::initialize() {
    std::cout << "Initializing Speech Synthesizer..." << std::endl;
    
    // Initialize neural synthesizer
    if (!m_neural_synth->initialize()) {
        std::cerr << "Failed to initialize neural synthesizer" << std::endl;
        return false;
    }
    
    // Load default voice
    NeuralSynthesizer::VoiceConfig default_config;
    default_config.model_path = "models/en_US-lessac-medium.onnx";
    default_config.sample_rate = 22050;
    
    if (!m_neural_synth->load_voice(default_config)) {
        std::cout << "Warning: Could not load default voice model. Neural synthesis will use mock mode." << std::endl;
    }
    
    m_initialized = true;
    std::cout << "Speech Synthesizer initialized successfully" << std::endl;
    return true;
}

std::vector<uint8_t> SpeechSynthesizer::synthesize_text(const std::string& text, const SynthesisOptions& options) {
    if (!m_initialized) {
        throw std::runtime_error("Speech synthesizer not initialized");
    }
    
    // Load voice if different from current
    if (!options.voice.empty()) {
        load_voice_if_needed(options.voice);
    }
    
    return m_neural_synth->synthesize_text(text);
}

std::vector<uint8_t> SpeechSynthesizer::synthesize_phonetic(const std::string& phonemes, const SynthesisOptions& options) {
    if (!m_initialized) {
        throw std::runtime_error("Speech synthesizer not initialized");
    }
    
    // Load voice if different from current
    if (!options.voice.empty()) {
        load_voice_if_needed(options.voice);
    }
    
    return m_neural_synth->synthesize_phonetic(phonemes);
}

void SpeechSynthesizer::load_voice_if_needed(const std::string& voice_name) {
    std::string model_path = get_voice_model_path(voice_name);
    if (model_path.empty()) {
        std::cout << "Warning: Voice model not found for: " << voice_name << std::endl;
        return;
    }
    
    NeuralSynthesizer::VoiceConfig config;
    config.model_path = model_path;
    config.sample_rate = 22050;
    
    if (!m_neural_synth->load_voice(config)) {
        std::cout << "Warning: Failed to load voice: " << voice_name << std::endl;
    }
}

std::vector<std::string> SpeechSynthesizer::get_available_voices() const {
    std::vector<std::string> voices;
    for (const auto& [voice_name, model_path] : m_voice_models) {
        voices.push_back(voice_name);
    }
    
    // If no models loaded, return default options
    if (voices.empty()) {
        voices = {
            "en_US-lessac-medium",
            "en_US-ryan-medium",
            "en_US-amy-medium"
        };
    }
    
    return voices;
}

bool SpeechSynthesizer::is_ready() const {
    return m_initialized;
}

void SpeechSynthesizer::load_available_voices() {
    // For now, use default voice names
    // In a full implementation, we'd scan for downloaded Piper models
    m_voice_models = {
        {"en_US-lessac-medium", "models/en_US-lessac-medium.onnx"},
        {"en_US-ryan-medium", "models/en_US-ryan-medium.onnx"},
        {"en_US-amy-medium", "models/en_US-amy-medium.onnx"}
    };
}

std::string SpeechSynthesizer::get_voice_model_path(const std::string& voice_name) const {
    auto it = m_voice_models.find(voice_name);
    if (it != m_voice_models.end()) {
        return it->second;
    }
    return ""; // Return empty if not found
}
#include "speech_synthesizer.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdlib>
#include <memory>
#include <array>
#include <stdexcept>
#include <unistd.h>

SpeechSynthesizer::SpeechSynthesizer() : m_initialized(false) {
    load_available_voices();
}

SpeechSynthesizer::~SpeechSynthesizer() {
}

bool SpeechSynthesizer::initialize() {
    std::cout << "Initializing Speech Synthesizer..." << std::endl;
    
    // Check if Piper TTS is available
    std::string command = "python3 -c \"import piper; print('Piper TTS available')\" 2>/dev/null";
    
    std::array<char, 128> buffer;
    std::string result;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(command.c_str(), "r"), pclose);
    
    if (!pipe) {
        std::cerr << "Failed to check Piper TTS availability" << std::endl;
        return false;
    }
    
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result += buffer.data();
    }
    
    if (result.find("Piper TTS available") != std::string::npos) {
        std::cout << "Piper TTS is available" << std::endl;
        m_initialized = true;
        return true;
    } else {
        std::cout << "Piper TTS not found. Please install with: pip install piper-tts" << std::endl;
        return false;
    }
}

std::vector<uint8_t> SpeechSynthesizer::synthesize_text(const std::string& text, const SynthesisOptions& options) {
    if (!m_initialized) {
        throw std::runtime_error("Speech synthesizer not initialized");
    }
    
    return run_piper_synthesis(text, options, false);
}

std::vector<uint8_t> SpeechSynthesizer::synthesize_phonetic(const std::string& phonemes, const SynthesisOptions& options) {
    if (!m_initialized) {
        throw std::runtime_error("Speech synthesizer not initialized");
    }
    
    // Piper supports phoneme injection with [[phonemes]] syntax
    std::string phonetic_text = "[[" + phonemes + "]]";
    return run_piper_synthesis(phonetic_text, options, true);
}

std::vector<uint8_t> SpeechSynthesizer::run_piper_synthesis(const std::string& input, const SynthesisOptions& options, bool /* is_phonetic */) {
    // Create temporary files for input and output
    std::string temp_input = "/tmp/kfa_tts_input.txt";
    std::string temp_output = "/tmp/kfa_tts_output.wav";
    
    // Write input text to temporary file
    std::ofstream input_file(temp_input);
    if (!input_file) {
        throw std::runtime_error("Failed to create temporary input file");
    }
    input_file << input;
    input_file.close();
    
    // Build Piper command
    std::ostringstream command;
    command << "python3 -m piper";
    
    // Add voice model (simplified for now - we'll need to download models)
    command << " --model " << options.voice;
    
    // Add output file
    command << " --output-file " << temp_output;
    
    // Add input file
    command << " --input-file " << temp_input;
    
    // Execute Piper TTS
    std::cout << "Running TTS: " << command.str() << std::endl;
    int result = system(command.str().c_str());
    
    if (result != 0) {
        throw std::runtime_error("Piper TTS synthesis failed with code: " + std::to_string(result));
    }
    
    // Read output WAV file
    std::ifstream output_file(temp_output, std::ios::binary);
    if (!output_file) {
        throw std::runtime_error("Failed to read TTS output file");
    }
    
    // Get file size
    output_file.seekg(0, std::ios::end);
    size_t file_size = output_file.tellg();
    output_file.seekg(0, std::ios::beg);
    
    // Read file data
    std::vector<uint8_t> audio_data(file_size);
    output_file.read(reinterpret_cast<char*>(audio_data.data()), file_size);
    output_file.close();
    
    // Clean up temporary files
    unlink(temp_input.c_str());
    unlink(temp_output.c_str());
    
    std::cout << "Generated " << audio_data.size() << " bytes of audio data" << std::endl;
    return audio_data;
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
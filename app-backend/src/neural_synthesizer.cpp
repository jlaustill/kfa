#include "neural_synthesizer.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <cstring>
#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <map>
#include <regex>

NeuralSynthesizer::NeuralSynthesizer() 
    : m_initialized(false) {
}

NeuralSynthesizer::~NeuralSynthesizer() {
    // ONNX Runtime cleanup is handled by smart pointers
}

bool NeuralSynthesizer::initialize() {
    std::cout << "Initializing Neural Synthesizer (mock mode for debugging)..." << std::endl;
    
    // Temporarily disable ONNX Runtime to debug memory issues
    m_initialized = true;
    std::cout << "Neural Synthesizer initialized successfully (mock mode)" << std::endl;
    return true;
}

bool NeuralSynthesizer::load_voice(const VoiceConfig& config) {
    if (!m_initialized) {
        std::cerr << "Neural synthesizer not initialized" << std::endl;
        return false;
    }
    
    std::cout << "Loading voice model: " << config.model_path << std::endl;
    
    VoiceConfig voice_config = config;
    
    // Simplified config loading
    std::cout << "Loading voice config for: " << config.model_path << std::endl;
    
    // Check if model file exists
    std::ifstream model_file(config.model_path);
    if (!model_file.good()) {
        std::cout << "Voice model file not found: " << config.model_path << " (fallback to mock)" << std::endl;
        m_current_voice = voice_config;
        return true; // Allow mock mode
    }
    
    // Temporarily skip ONNX model loading
    m_current_voice = voice_config;
    std::cout << "Voice config loaded (mock mode)" << std::endl;
    return true;
}

std::vector<uint8_t> NeuralSynthesizer::synthesize_text(const std::string& text) {
    if (!is_ready()) {
        std::cerr << "Neural synthesizer not ready" << std::endl;
        return {};
    }
    
    std::cout << "Synthesizing text: " << text << std::endl;
    
    // Convert text to audio data
    std::vector<float> audio_data = text_to_audio_data(text);
    
    // Convert to WAV format
    return audio_data_to_wav(audio_data, m_current_voice.sample_rate);
}

std::vector<uint8_t> NeuralSynthesizer::synthesize_phonetic(const std::string& phonemes) {
    if (!is_ready()) {
        std::cerr << "Neural synthesizer not ready" << std::endl;
        return {};
    }
    
    std::cout << "Synthesizing phonemes: " << phonemes << std::endl;
    
    // For phonetic input, we can process it similarly to text
    // In a real implementation, this would bypass text-to-phoneme conversion
    std::vector<float> audio_data = text_to_audio_data(phonemes);
    
    return audio_data_to_wav(audio_data, m_current_voice.sample_rate);
}

bool NeuralSynthesizer::is_ready() const {
    return m_initialized;
}

std::vector<std::string> NeuralSynthesizer::get_available_voices() const {
    // Return available voice models
    // TODO: Scan models directory for actual ONNX files
    return {
        "en_US-lessac-medium.onnx",
        "en_US-ryan-medium.onnx",
        "en_US-amy-medium.onnx"
    };
}

std::vector<float> NeuralSynthesizer::text_to_audio_data(const std::string& input) {
    std::cout << "Processing input: " << input << std::endl;
    
    // For now, just use mock implementation to avoid memory issues
    // TODO: Fix ONNX inference memory management
    const int duration_seconds = std::max(1, static_cast<int>(input.length()) / 10);
    const int sample_count = duration_seconds * m_current_voice.sample_rate;
    const float frequency = 200.0f + (input.length() * 50.0f); // Vary frequency based on input
    
    std::vector<float> audio_data(sample_count);
    
    for (int i = 0; i < sample_count; ++i) {
        float t = static_cast<float>(i) / m_current_voice.sample_rate;
        audio_data[i] = 0.2f * std::sin(2.0f * M_PI * frequency * t);
    }
    
    std::cout << "Generated " << audio_data.size() << " audio samples (safe mock)" << std::endl;
    return audio_data;
}

std::vector<uint8_t> NeuralSynthesizer::audio_data_to_wav(const std::vector<float>& audio_data, int sample_rate) {
    if (audio_data.empty()) {
        return {};
    }
    
    // WAV file structure
    const int channels = 1;
    const int bits_per_sample = 16;
    const int byte_rate = sample_rate * channels * bits_per_sample / 8;
    const int block_align = channels * bits_per_sample / 8;
    const int data_size = audio_data.size() * sizeof(int16_t);
    const int file_size = 36 + data_size;
    
    std::vector<uint8_t> wav_data;
    wav_data.reserve(44 + data_size);
    
    // WAV header
    const char* riff = "RIFF";
    wav_data.insert(wav_data.end(), riff, riff + 4);
    
    // File size
    for (int i = 0; i < 4; ++i) {
        wav_data.push_back((file_size >> (i * 8)) & 0xFF);
    }
    
    const char* wave = "WAVE";
    wav_data.insert(wav_data.end(), wave, wave + 4);
    
    const char* fmt = "fmt ";
    wav_data.insert(wav_data.end(), fmt, fmt + 4);
    
    // Format chunk size
    int fmt_size = 16;
    for (int i = 0; i < 4; ++i) {
        wav_data.push_back((fmt_size >> (i * 8)) & 0xFF);
    }
    
    // Audio format (PCM)
    wav_data.push_back(1);
    wav_data.push_back(0);
    
    // Number of channels
    for (int i = 0; i < 2; ++i) {
        wav_data.push_back((channels >> (i * 8)) & 0xFF);
    }
    
    // Sample rate
    for (int i = 0; i < 4; ++i) {
        wav_data.push_back((sample_rate >> (i * 8)) & 0xFF);
    }
    
    // Byte rate
    for (int i = 0; i < 4; ++i) {
        wav_data.push_back((byte_rate >> (i * 8)) & 0xFF);
    }
    
    // Block align
    for (int i = 0; i < 2; ++i) {
        wav_data.push_back((block_align >> (i * 8)) & 0xFF);
    }
    
    // Bits per sample
    for (int i = 0; i < 2; ++i) {
        wav_data.push_back((bits_per_sample >> (i * 8)) & 0xFF);
    }
    
    const char* data = "data";
    wav_data.insert(wav_data.end(), data, data + 4);
    
    // Data size
    for (int i = 0; i < 4; ++i) {
        wav_data.push_back((data_size >> (i * 8)) & 0xFF);
    }
    
    // Convert float audio data to 16-bit PCM
    for (float sample : audio_data) {
        // Clamp to [-1.0, 1.0] and convert to 16-bit signed integer
        float clamped = std::max(-1.0f, std::min(1.0f, sample));
        int16_t pcm_sample = static_cast<int16_t>(clamped * 32767.0f);
        
        wav_data.push_back(pcm_sample & 0xFF);
        wav_data.push_back((pcm_sample >> 8) & 0xFF);
    }
    
    std::cout << "Generated WAV file: " << wav_data.size() << " bytes" << std::endl;
    return wav_data;
}

std::vector<int64_t> NeuralSynthesizer::text_to_phoneme_ids(const std::string& text) {
    // Mock implementation - converts text to phoneme IDs
    // TODO: Implement actual phonemization when we integrate full Piper
    
    std::vector<int64_t> phoneme_ids;
    for (char c : text) {
        if (std::isalnum(c)) {
            phoneme_ids.push_back(static_cast<int64_t>(c));
        }
    }
    
    return phoneme_ids;
}

std::vector<int64_t> NeuralSynthesizer::phonemes_to_ids(const std::string& phonemes) {
    // Simple character-to-ID mapping for testing
    std::vector<int64_t> ids;
    ids.push_back(1); // Start token
    
    for (char c : phonemes) {
        if (std::isalnum(c)) {
            ids.push_back(static_cast<int64_t>(c));
        } else {
            ids.push_back(3); // Space
        }
    }
    
    ids.push_back(2); // End token
    return ids;
}

std::vector<float> NeuralSynthesizer::run_onnx_inference(const std::vector<int64_t>& phoneme_ids) {
    if (!m_ort_session) {
        throw std::runtime_error("ONNX session not initialized");
    }
    
    try {
        // Get input/output info
        Ort::AllocatorWithDefaultOptions allocator;
        size_t num_input_nodes = m_ort_session->GetInputCount();
        size_t num_output_nodes = m_ort_session->GetOutputCount();
        
        std::cout << "ONNX Model has " << num_input_nodes << " inputs and " << num_output_nodes << " outputs" << std::endl;
        
        // Print all input names for debugging
        for (size_t i = 0; i < num_input_nodes; i++) {
            std::string input_name(m_ort_session->GetInputNameAllocated(i, allocator).get());
            std::cout << "Input " << i << ": " << input_name << std::endl;
        }
        
        // Get input names - Piper typically has: input, input_lengths, scales
        std::vector<std::string> input_names_str;
        std::vector<const char*> input_names;
        for (size_t i = 0; i < num_input_nodes; i++) {
            input_names_str.push_back(m_ort_session->GetInputNameAllocated(i, allocator).get());
            input_names.push_back(input_names_str.back().c_str());
        }
        
        // Create input tensors
        std::vector<Ort::Value> input_tensors;
        
        // 1. Phoneme IDs tensor (input) - make a copy to avoid memory issues
        std::vector<int64_t> phoneme_ids_copy = phoneme_ids;
        std::vector<int64_t> input_shape = {1, static_cast<int64_t>(phoneme_ids_copy.size())};
        input_tensors.push_back(Ort::Value::CreateTensor<int64_t>(
            *m_memory_info, 
            phoneme_ids_copy.data(), 
            phoneme_ids_copy.size(),
            input_shape.data(), 
            input_shape.size()
        ));
        
        // 2. Input lengths tensor (input_lengths)
        if (num_input_nodes > 1) {
            std::vector<int64_t> lengths = {static_cast<int64_t>(phoneme_ids.size())};
            std::vector<int64_t> lengths_shape = {1};
            input_tensors.push_back(Ort::Value::CreateTensor<int64_t>(
                *m_memory_info,
                lengths.data(),
                lengths.size(),
                lengths_shape.data(),
                lengths_shape.size()
            ));
        }
        
        // 3. Scales tensor (noise_scale, length_scale, noise_w)
        if (num_input_nodes > 2) {
            std::vector<float> scales = {m_current_voice.noise_scale, m_current_voice.length_scale, m_current_voice.noise_w};
            std::vector<int64_t> scales_shape = {3};
            input_tensors.push_back(Ort::Value::CreateTensor<float>(
                *m_memory_info,
                scales.data(),
                scales.size(),
                scales_shape.data(),
                scales_shape.size()
            ));
        }
        
        // Get output names
        std::vector<std::string> output_names_str;
        std::vector<const char*> output_names;
        for (size_t i = 0; i < num_output_nodes; i++) {
            output_names_str.push_back(m_ort_session->GetOutputNameAllocated(i, allocator).get());
            output_names.push_back(output_names_str.back().c_str());
        }
        
        // Run inference
        auto output_tensors = m_ort_session->Run(
            Ort::RunOptions{nullptr}, 
            input_names.data(), 
            input_tensors.data(), 
            input_tensors.size(), 
            output_names.data(), 
            output_names.size()
        );
        
        // Extract audio data from output tensor
        if (output_tensors.empty()) {
            throw std::runtime_error("No output from ONNX inference");
        }
        
        float* float_array = output_tensors[0].GetTensorMutableData<float>();
        auto type_info = output_tensors[0].GetTensorTypeAndShapeInfo();
        size_t element_count = type_info.GetElementCount();
        
        std::vector<float> audio_data(float_array, float_array + element_count);
        
        std::cout << "Generated " << audio_data.size() << " audio samples via ONNX" << std::endl;
        return audio_data;
        
    } catch (const std::exception& e) {
        std::cerr << "ONNX inference failed: " << e.what() << std::endl;
        // Fallback to mock generation
        const int sample_count = phoneme_ids.size() * 1000; // 1000 samples per phoneme
        std::vector<float> audio_data(sample_count);
        for (size_t i = 0; i < audio_data.size(); ++i) {
            audio_data[i] = 0.1f * std::sin(2.0f * M_PI * 440.0f * i / m_current_voice.sample_rate);
        }
        std::cout << "Generated " << audio_data.size() << " audio samples (fallback)" << std::endl;
        return audio_data;
    }
}
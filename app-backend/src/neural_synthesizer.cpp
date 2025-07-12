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
    std::cout << "Initializing Neural Synthesizer with ONNX Runtime..." << std::endl;
    
    try {
        // Create environment - no smart pointers, just stack objects
        m_ort_env = std::make_unique<Ort::Env>(ORT_LOGGING_LEVEL_WARNING, "NeuralSynthesizer");
        
        // Create memory info
        m_memory_info = std::make_unique<Ort::MemoryInfo>(
            Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault)
        );
        
        m_initialized = true;
        std::cout << "Neural Synthesizer initialized successfully" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Failed to initialize ONNX Runtime: " << e.what() << std::endl;
        m_initialized = false;
        return false;
    }
}

bool NeuralSynthesizer::load_voice(const VoiceConfig& config) {
    if (!m_initialized) {
        std::cerr << "Neural synthesizer not initialized" << std::endl;
        return false;
    }
    
    std::cout << "Loading voice model: " << config.model_path << std::endl;
    
    VoiceConfig voice_config = config;
    
    // Load JSON config file for phoneme mappings
    std::string json_config_path = config.model_path + ".json";
    std::cout << "Loading voice config from: " << json_config_path << std::endl;
    
    if (!load_voice_config_json(json_config_path, voice_config)) {
        throw std::runtime_error("Failed to load voice config JSON: " + json_config_path);
    }
    
    // Always use user-provided parameters for speech control
    voice_config.length_scale = config.length_scale;
    voice_config.noise_scale = config.noise_scale;
    voice_config.noise_w = config.noise_w;
    
    std::cout << "🎛️  Final speech parameters:" << std::endl;
    std::cout << "   Length scale: " << voice_config.length_scale << std::endl;
    std::cout << "   Noise scale: " << voice_config.noise_scale << std::endl;
    std::cout << "   Noise W: " << voice_config.noise_w << std::endl;
    
    // Check if model file exists
    std::ifstream model_file(config.model_path);
    if (!model_file.good()) {
        throw std::runtime_error("Voice model file not found: " + config.model_path);
    }
    
    try {
        // Create session options
        Ort::SessionOptions session_options;
        session_options.SetIntraOpNumThreads(1);
        session_options.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_BASIC);
        
        // File existence already checked above
        
        // Load the ONNX model carefully
        std::cout << "Loading ONNX model: " << config.model_path << std::endl;
        m_ort_session = std::make_unique<Ort::Session>(*m_ort_env, config.model_path.c_str(), session_options);
        
        m_current_voice = voice_config;
        std::cout << "Voice model loaded successfully!" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "ONNX model loading failed: " << e.what() << std::endl;
        throw std::runtime_error("Failed to load ONNX model: " + std::string(e.what()));
    }
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
    
    std::cout << "Synthesizing IPA phonemes directly: " << phonemes << std::endl;
    
    // Process IPA phonemes directly, bypassing kfa conversion
    std::vector<float> audio_data = ipa_to_audio_data(phonemes);
    
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
    std::cout << "Processing kfa input: " << input << std::endl;
    
    // ONNX inference ONLY - no fallbacks
    if (!m_initialized) {
        throw std::runtime_error("Neural synthesizer not initialized");
    }
    
    if (!m_ort_session) {
        throw std::runtime_error("ONNX session not loaded - cannot synthesize without neural model");
    }
    
    // Convert kfa → IPA phonemes (Piper uses IPA directly, not eSpeak format)
    std::cout << "🔄 Converting kfa to IPA phonemes..." << std::endl;
    std::string ipa_phonemes = m_kfa_converter.kfa_to_ipa(input);
    std::cout << "  kfa: '" << input << "'" << std::endl;
    std::cout << "  IPA: '" << ipa_phonemes << "'" << std::endl;
    
    if (ipa_phonemes.empty()) {
        throw std::runtime_error("Failed to convert kfa '" + input + "' to IPA phonemes");
    }
    
    std::cout << "Attempting ONNX inference..." << std::endl;
    
    // Convert IPA phonemes to phoneme IDs
    std::vector<int64_t> phoneme_ids = phonemes_to_ids(ipa_phonemes);
    
    if (phoneme_ids.empty()) {
        throw std::runtime_error("Failed to convert IPA phonemes '" + ipa_phonemes + "' to phoneme IDs");
    }
    
    std::cout << "Converted '" << input << "' → '" << ipa_phonemes << "' → " << phoneme_ids.size() << " phoneme IDs" << std::endl;
    
    return run_onnx_inference(phoneme_ids);
}

std::vector<float> NeuralSynthesizer::ipa_to_audio_data(const std::string& ipa_phonemes) {
    std::cout << "Processing IPA input directly: " << ipa_phonemes << std::endl;
    
    // ONNX inference ONLY - no fallbacks
    if (!m_initialized) {
        throw std::runtime_error("Neural synthesizer not initialized");
    }
    
    if (!m_ort_session) {
        throw std::runtime_error("ONNX session not loaded - cannot synthesize without neural model");
    }
    
    // Process IPA phonemes directly - no kfa conversion
    std::cout << "🔄 Processing IPA phonemes directly..." << std::endl;
    std::cout << "  Input IPA: '" << ipa_phonemes << "'" << std::endl;
    
    if (ipa_phonemes.empty()) {
        throw std::runtime_error("Empty IPA phonemes input");
    }
    
    std::cout << "Attempting ONNX inference with IPA..." << std::endl;
    
    // Convert IPA phonemes directly to phoneme IDs
    std::vector<int64_t> phoneme_ids = phonemes_to_ids(ipa_phonemes);
    
    if (phoneme_ids.empty()) {
        throw std::runtime_error("Failed to convert IPA phonemes '" + ipa_phonemes + "' to phoneme IDs");
    }
    
    std::cout << "Converted IPA '" << ipa_phonemes << "' → " << phoneme_ids.size() << " phoneme IDs" << std::endl;
    
    return run_onnx_inference(phoneme_ids);
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
    std::vector<int64_t> ids;
    
    // Add start token
    auto start_it = m_current_voice.phoneme_id_map.find("^");
    if (start_it != m_current_voice.phoneme_id_map.end()) {
        ids.push_back(start_it->second);
    } else {
        ids.push_back(1); // Fallback start token
    }
    
    std::cout << "🔤 Converting phonemes '" << phonemes << "' to IDs..." << std::endl;
    
    // Convert each phoneme - need to handle UTF-8 Unicode characters properly
    size_t i = 0;
    while (i < phonemes.length()) {
        // Extract the next UTF-8 character
        std::string utf8_char;
        size_t char_bytes = 1;
        
        unsigned char first_byte = phonemes[i];
        if (first_byte < 0x80) {
            // ASCII character (1 byte)
            char_bytes = 1;
        } else if ((first_byte & 0xE0) == 0xC0) {
            // 2-byte UTF-8 character
            char_bytes = 2;
        } else if ((first_byte & 0xF0) == 0xE0) {
            // 3-byte UTF-8 character
            char_bytes = 3;
        } else if ((first_byte & 0xF8) == 0xF0) {
            // 4-byte UTF-8 character
            char_bytes = 4;
        }
        
        // Make sure we don't go past the end of the string
        if (i + char_bytes > phonemes.length()) {
            char_bytes = phonemes.length() - i;
        }
        
        utf8_char = phonemes.substr(i, char_bytes);
        
        // Look up this UTF-8 character in the phoneme map
        auto it = m_current_voice.phoneme_id_map.find(utf8_char);
        if (it != m_current_voice.phoneme_id_map.end()) {
            ids.push_back(it->second);
            std::cout << "  '" << utf8_char << "' -> " << it->second << std::endl;
            i += char_bytes;
        } else {
            // Try space for unknown character
            auto space_it = m_current_voice.phoneme_id_map.find(" ");
            if (space_it != m_current_voice.phoneme_id_map.end()) {
                ids.push_back(space_it->second);
                std::cout << "  '" << utf8_char << "' (unknown) -> space (" << space_it->second << ")" << std::endl;
            } else {
                ids.push_back(3); // Fallback space
                std::cout << "  '" << utf8_char << "' (unknown) -> fallback space (3)" << std::endl;
            }
            i += char_bytes;
        }
    }
    
    // Add end token
    auto end_it = m_current_voice.phoneme_id_map.find("$");
    if (end_it != m_current_voice.phoneme_id_map.end()) {
        ids.push_back(end_it->second);
    } else {
        ids.push_back(2); // Fallback end token
    }
    
    std::cout << "  Final phoneme IDs: ";
    for (size_t i = 0; i < ids.size(); ++i) {
        std::cout << ids[i] << " ";
    }
    std::cout << std::endl;
    
    return ids;
}

std::vector<float> NeuralSynthesizer::run_onnx_inference(const std::vector<int64_t>& phoneme_ids) {
    if (!m_ort_session) {
        throw std::runtime_error("ONNX session not initialized");
    }
    
    std::cout << "Starting ONNX inference with " << phoneme_ids.size() << " phoneme IDs" << std::endl;
    std::cout << "Phoneme IDs: ";
    for (size_t i = 0; i < phoneme_ids.size(); ++i) {
        std::cout << phoneme_ids[i] << " ";
    }
    std::cout << std::endl;
    
    try {
        // Get basic model info
        Ort::AllocatorWithDefaultOptions allocator;
        size_t num_input_nodes = m_ort_session->GetInputCount();
        
        std::cout << "Model has " << num_input_nodes << " inputs" << std::endl;
        
        // Piper models need 3 inputs: input, input_lengths, scales
        if (num_input_nodes != 3) {
            throw std::runtime_error("Expected 3 inputs for Piper model, got " + std::to_string(num_input_nodes));
        }
        
        // Get all input/output names - use auto to keep allocator strings alive
        auto input0_name = m_ort_session->GetInputNameAllocated(0, allocator);
        auto input1_name = m_ort_session->GetInputNameAllocated(1, allocator);
        auto input2_name = m_ort_session->GetInputNameAllocated(2, allocator);
        auto output_name = m_ort_session->GetOutputNameAllocated(0, allocator);
        
        std::cout << "Input 0: " << input0_name.get() << std::endl;
        std::cout << "Input 1: " << input1_name.get() << std::endl;
        std::cout << "Input 2: " << input2_name.get() << std::endl;
        std::cout << "Output: " << output_name.get() << std::endl;
        
        // Create input names array
        std::vector<const char*> input_names = {
            input0_name.get(),
            input1_name.get(),
            input2_name.get()
        };
        
        // Create all 3 input tensors
        std::vector<Ort::Value> input_tensors;
        
        // 1. Phoneme IDs (input)
        std::vector<int64_t> phoneme_data = phoneme_ids; // Make copy
        std::vector<int64_t> phoneme_shape = {1, static_cast<int64_t>(phoneme_data.size())};
        input_tensors.push_back(Ort::Value::CreateTensor<int64_t>(
            *m_memory_info,
            phoneme_data.data(),
            phoneme_data.size(),
            phoneme_shape.data(),
            phoneme_shape.size()
        ));
        
        // 2. Input lengths (input_lengths) 
        std::vector<int64_t> lengths_data = {static_cast<int64_t>(phoneme_data.size())};
        std::vector<int64_t> lengths_shape = {1};
        input_tensors.push_back(Ort::Value::CreateTensor<int64_t>(
            *m_memory_info,
            lengths_data.data(),
            lengths_data.size(),
            lengths_shape.data(),
            lengths_shape.size()
        ));
        
        // 3. Scales (scales) - noise_scale, length_scale, noise_w
        std::cout << "🎛️  ONNX Inference using scales:" << std::endl;
        std::cout << "   noise_scale: " << m_current_voice.noise_scale << std::endl;
        std::cout << "   length_scale: " << m_current_voice.length_scale << std::endl;
        std::cout << "   noise_w: " << m_current_voice.noise_w << std::endl;
        
        std::vector<float> scales_data = {
            m_current_voice.noise_scale,
            m_current_voice.length_scale, 
            m_current_voice.noise_w
        };
        std::vector<int64_t> scales_shape = {3};
        input_tensors.push_back(Ort::Value::CreateTensor<float>(
            *m_memory_info,
            scales_data.data(),
            scales_data.size(),
            scales_shape.data(),
            scales_shape.size()
        ));
        
        std::cout << "Created all 3 input tensors:" << std::endl;
        std::cout << "  phonemes: [" << phoneme_shape[0] << ", " << phoneme_shape[1] << "]" << std::endl;
        std::cout << "  lengths: [" << lengths_shape[0] << "]" << std::endl;
        std::cout << "  scales: [" << scales_shape[0] << "]" << std::endl;
        
        // Run inference with all inputs
        std::vector<const char*> output_names = {output_name.get()};
        
        auto output_tensors = m_ort_session->Run(
            Ort::RunOptions{nullptr},
            input_names.data(),
            input_tensors.data(),
            input_tensors.size(),
            output_names.data(),
            1
        );
        
        if (output_tensors.empty()) {
            throw std::runtime_error("No output from inference");
        }
        
        // Extract the audio
        float* output_data = output_tensors[0].GetTensorMutableData<float>();
        auto shape_info = output_tensors[0].GetTensorTypeAndShapeInfo();
        size_t output_size = shape_info.GetElementCount();
        
        std::cout << "📊 Extracting audio data from tensor..." << std::endl;
        std::cout << "  Output size: " << output_size << " elements" << std::endl;
        std::cout.flush();
        
        std::vector<float> audio_data(output_data, output_data + output_size);
        std::cout << "📊 Audio data extracted successfully!" << std::endl;
        std::cout.flush();
        
        // Debug: analyze raw ONNX output
        if (!audio_data.empty()) {
            auto minmax = std::minmax_element(audio_data.begin(), audio_data.end());
            float min_val = *minmax.first;
            float max_val = *minmax.second;
            float peak = std::max(std::abs(min_val), std::abs(max_val));
            
            std::cout << "🔍 Raw ONNX output analysis:" << std::endl;
            std::cout << "  Range: [" << min_val << ", " << max_val << "]" << std::endl;
            std::cout << "  Peak: " << peak << std::endl;
            
            // Show first few samples
            std::cout << "  First 5 samples: ";
            for (size_t i = 0; i < std::min(size_t(5), audio_data.size()); ++i) {
                std::cout << audio_data[i] << " ";
            }
            std::cout << std::endl;
            std::cout.flush(); // Force output
        }
        
        std::cout << "✅ ONNX inference successful! Generated " << audio_data.size() << " audio samples" << std::endl;
        return audio_data;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ ONNX inference failed: " << e.what() << std::endl;
        throw; // Re-throw to be handled by caller
    }
}

bool NeuralSynthesizer::load_voice_config_json(const std::string& config_path, VoiceConfig& config) {
    std::cout << "📋 Loading JSON config: " << config_path << std::endl;
    
    std::ifstream file(config_path);
    if (!file.is_open()) {
        std::cerr << "❌ Cannot open config file: " << config_path << std::endl;
        return false;
    }
    
    // Read entire file
    std::string json_content((std::istreambuf_iterator<char>(file)),
                             std::istreambuf_iterator<char>());
    file.close();
    
    try {
        // Simple JSON parsing for the specific fields we need
        // Look for "sample_rate": value
        std::regex sample_rate_regex(R"("sample_rate"\s*:\s*(\d+))");
        std::smatch match;
        if (std::regex_search(json_content, match, sample_rate_regex)) {
            config.sample_rate = std::stoi(match[1].str());
            std::cout << "  Sample rate: " << config.sample_rate << std::endl;
        }
        
        // Look for inference parameters
        std::regex noise_scale_regex(R"("noise_scale"\s*:\s*([\d.]+))");
        if (std::regex_search(json_content, match, noise_scale_regex)) {
            config.noise_scale = std::stof(match[1].str());
            std::cout << "  Noise scale: " << config.noise_scale << std::endl;
        }
        
        std::regex length_scale_regex(R"("length_scale"\s*:\s*([\d.]+))");
        if (std::regex_search(json_content, match, length_scale_regex)) {
            config.length_scale = std::stof(match[1].str());
            std::cout << "  Length scale: " << config.length_scale << std::endl;
        }
        
        std::regex noise_w_regex(R"("noise_w"\s*:\s*([\d.]+))");
        if (std::regex_search(json_content, match, noise_w_regex)) {
            config.noise_w = std::stof(match[1].str());
            std::cout << "  Noise W: " << config.noise_w << std::endl;
        }
        
        // Parse phoneme_id_map
        std::regex phoneme_map_regex(R"("phoneme_id_map"\s*:\s*\{([^}]+)\})");
        if (std::regex_search(json_content, match, phoneme_map_regex)) {
            std::string phoneme_map_content = match[1].str();
            
            // Parse each phoneme mapping: "symbol": [id]
            std::regex phoneme_entry_regex("\"([^\"]+)\"\\s*:\\s*\\[\\s*(\\d+)\\s*\\]");
            std::sregex_iterator iter(phoneme_map_content.begin(), phoneme_map_content.end(), phoneme_entry_regex);
            std::sregex_iterator end;
            
            config.phoneme_id_map.clear();
            int phoneme_count = 0;
            for (; iter != end; ++iter) {
                std::string phoneme = iter->str(1);
                int id = std::stoi(iter->str(2));
                config.phoneme_id_map[phoneme] = id;
                phoneme_count++;
            }
            
            std::cout << "  Loaded " << phoneme_count << " phoneme mappings" << std::endl;
        }
        
        std::cout << "✅ JSON config loaded successfully" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Error parsing JSON config: " << e.what() << std::endl;
        return false;
    }
}
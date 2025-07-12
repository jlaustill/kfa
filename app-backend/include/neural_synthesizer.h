#pragma once

#include <string>
#include <vector>
#include <memory>
#include <cstdint>
#include <map>
#include "onnxruntime_cxx_api.h"
#include "kfa_converter.h"

/**
 * Neural Speech Synthesizer using ONNX Runtime
 * Provides high-quality neural text-to-speech synthesis
 */
class NeuralSynthesizer {
public:
    struct VoiceConfig {
        std::string model_path;
        std::string config_path;
        int sample_rate = 22050;
        int speaker_id = 0;
        float noise_scale = 0.667f;
        float length_scale = 1.0f;
        float noise_w = 0.8f;
        std::map<std::string, int> phoneme_id_map;
    };

    NeuralSynthesizer();
    ~NeuralSynthesizer();

    // Initialize the neural TTS engine
    bool initialize();
    
    // Load a voice model
    bool load_voice(const VoiceConfig& config);
    
    // Synthesize text to WAV audio
    std::vector<uint8_t> synthesize_text(const std::string& text);
    
    // Synthesize phonetic input (IPA format)
    std::vector<uint8_t> synthesize_phonetic(const std::string& phonemes);
    
    // Check if synthesizer is ready
    bool is_ready() const;
    
    // Get available voices
    std::vector<std::string> get_available_voices() const;

private:
    bool m_initialized;
    VoiceConfig m_current_voice;
    KfaConverter m_kfa_converter;
    
    // ONNX Runtime components
    std::unique_ptr<Ort::Env> m_ort_env;
    std::unique_ptr<Ort::Session> m_ort_session;
    std::unique_ptr<Ort::MemoryInfo> m_memory_info;
    
    // Internal helper methods
    std::vector<float> text_to_audio_data(const std::string& input);
    std::vector<float> ipa_to_audio_data(const std::string& ipa_phonemes);
    std::vector<uint8_t> audio_data_to_wav(const std::vector<float>& audio_data, int sample_rate);
    std::vector<int64_t> text_to_phoneme_ids(const std::string& text);
    std::vector<int64_t> phonemes_to_ids(const std::string& phonemes);
    bool load_voice_config_json(const std::string& config_path, VoiceConfig& config);
    
    // ONNX inference
    std::vector<float> run_onnx_inference(const std::vector<int64_t>& phoneme_ids);
};
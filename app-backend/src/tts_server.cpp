#include "tts_server.h"
#include "speech_synthesizer.h"
#include "kfa_converter.h"
#include <iostream>
#include <sstream>
#include <thread>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include <fstream>
#include <ctime>

TTSServer::TTSServer(int port) : m_port(port), m_running(false) {
    std::cout << "TTS Server initialized on port " << port << std::endl;
}

TTSServer::~TTSServer() {
    stop();
}

void TTSServer::start() {
    m_running = true;
    
    // Create socket
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        throw std::runtime_error("Failed to create socket");
    }
    
    // Enable address reuse
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt))) {
        close(server_fd);
        throw std::runtime_error("Failed to set socket options");
    }
    
    // Bind socket
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(m_port);
    
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        close(server_fd);
        throw std::runtime_error("Failed to bind socket to port " + std::to_string(m_port));
    }
    
    // Listen for connections
    if (listen(server_fd, 10) < 0) {
        close(server_fd);
        throw std::runtime_error("Failed to listen on socket");
    }
    
    std::cout << "Server listening on port " << m_port << std::endl;
    
    // Main server loop
    while (m_running) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        
        int client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd < 0) {
            if (m_running) {
                std::cerr << "Failed to accept client connection" << std::endl;
            }
            continue;
        }
        
        // Handle client in a separate thread
        std::thread client_thread([this, client_fd]() {
            handle_client(client_fd);
        });
        client_thread.detach();
    }
    
    close(server_fd);
}

void TTSServer::stop() {
    m_running = false;
}

void TTSServer::handle_client(int client_fd) {
    char buffer[4096];
    ssize_t bytes_read = read(client_fd, buffer, sizeof(buffer) - 1);
    
    if (bytes_read <= 0) {
        close(client_fd);
        return;
    }
    
    buffer[bytes_read] = '\0';
    std::string request(buffer);
    
    // Parse HTTP request
    std::istringstream request_stream(request);
    std::string method, path, version;
    request_stream >> method >> path >> version;
    
    std::string response;
    std::string content_type = "application/json";
    
    try {
        if (method == "GET" && path == "/api/health") {
            handle_health_request(response);
        } else if (method == "GET" && path == "/api/voices") {
            handle_voices_request(response);
        } else if (method == "POST" && path == "/api/speak") {
            // Extract JSON body from request
            size_t body_start = request.find("\r\n\r\n");
            if (body_start != std::string::npos) {
                std::string body = request.substr(body_start + 4);
                handle_speak_request(body, response);
                content_type = "audio/wav";
            } else {
                response = R"({"error": "Missing request body"})";
            }
        } else {
            response = R"({"error": "Not found"})";
        }
    } catch (const std::exception& e) {
        response = R"({"error": ")" + std::string(e.what()) + R"("})";
    }
    
    // Send HTTP response
    std::ostringstream http_response;
    http_response << "HTTP/1.1 200 OK\r\n";
    http_response << "Content-Type: " << content_type << "\r\n";
    http_response << "Content-Length: " << response.length() << "\r\n";
    http_response << "Access-Control-Allow-Origin: *\r\n";
    http_response << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
    http_response << "Access-Control-Allow-Headers: Content-Type\r\n";
    http_response << "\r\n";
    http_response << response;
    
    std::string full_response = http_response.str();
    write(client_fd, full_response.c_str(), full_response.length());
    
    close(client_fd);
}

void TTSServer::handle_speak_request(const std::string& request_body, std::string& response) {
    static SpeechSynthesizer synthesizer;
    static bool synthesizer_initialized = false;
    
    // Initialize synthesizer once
    if (!synthesizer_initialized) {
        if (!synthesizer.initialize()) {
            response = R"({"error": "Failed to initialize speech synthesizer"})";
            return;
        }
        synthesizer_initialized = true;
    }
    
    // Parse JSON (simplified - in production use a proper JSON library)
    std::string text;
    size_t text_start = request_body.find("\"text\"");
    if (text_start != std::string::npos) {
        size_t colon_pos = request_body.find(":", text_start);
        size_t quote_start = request_body.find("\"", colon_pos);
        size_t quote_end = request_body.find("\"", quote_start + 1);
        if (quote_start != std::string::npos && quote_end != std::string::npos) {
            text = request_body.substr(quote_start + 1, quote_end - quote_start - 1);
        }
    }
    
    if (text.empty()) {
        response = R"({"error": "No text provided"})";
        return;
    }
    
    try {
        // Convert kfa to IPA phonemes for neural synthesis
        KfaConverter converter;
        std::string ipa_text = converter.kfa_to_ipa(text);
        
        std::cout << "Input kfa: " << text << " -> IPA: " << ipa_text << std::endl;
        
        // Synthesize using neural TTS
        SpeechSynthesizer::SynthesisOptions options;
        std::vector<uint8_t> audio_data = synthesizer.synthesize_phonetic(ipa_text, options);
        
        if (audio_data.empty()) {
            response = R"({"error": "Failed to generate audio"})";
            return;
        }
        
        // Convert binary audio data to string for HTTP response
        response.assign(audio_data.begin(), audio_data.end());
        
        std::cout << "Synthesized " << text << " to " << audio_data.size() << " bytes of WAV audio" << std::endl;
        
    } catch (const std::exception& e) {
        response = R"({"error": "Synthesis failed: )" + std::string(e.what()) + R"("})";
    }
}

void TTSServer::handle_voices_request(std::string& response) {
    response = R"({
        "voices": [
            {
                "name": "en_US-lessac-medium",
                "language": "en-US",
                "quality": "medium",
                "description": "Clear American English female voice"
            },
            {
                "name": "en_US-ryan-medium", 
                "language": "en-US",
                "quality": "medium",
                "description": "Natural American English male voice"
            }
        ],
        "status": "available"
    })";
}

void TTSServer::handle_health_request(std::string& response) {
    response = R"({
        "status": "healthy",
        "version": "1.0.0",
        "service": "kfa-tts-server",
        "timestamp": ")" + std::to_string(time(nullptr)) + R"("
    })";
}
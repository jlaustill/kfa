#pragma once

#include <string>
#include <memory>

/**
 * TTS Server for kfa phonetic text-to-speech synthesis
 * Provides REST API endpoints for converting kfa text to high-quality audio
 */
class TTSServer {
public:
    TTSServer(int port = 8080);
    ~TTSServer();

    // Start the HTTP server
    void start();
    
    // Stop the server gracefully
    void stop();

private:
    int m_port;
    bool m_running;
    
    // HTTP endpoint handlers
    void handle_speak_request(const std::string& request_body, std::string& response);
    void handle_voices_request(std::string& response);
    void handle_health_request(std::string& response);
    
    // Client connection handler
    void handle_client(int client_fd);
};
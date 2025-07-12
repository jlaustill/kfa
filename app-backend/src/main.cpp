#include "tts_server.h"
#include <iostream>
#include <csignal>
#include <memory>

std::unique_ptr<TTSServer> g_server;

void signal_handler(int signal) {
    std::cout << "\nReceived signal " << signal << ", shutting down gracefully..." << std::endl;
    if (g_server) {
        g_server->stop();
    }
    exit(0);
}

int main(int argc, char* argv[]) {
    std::cout << "kfa TTS Server v1.0.0" << std::endl;
    std::cout << "High-performance neural text-to-speech with phonetic precision" << std::endl;
    std::cout << "=========================================================" << std::endl;
    
    // Parse command line arguments
    int port = 8080;
    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
            if (port < 1024 || port > 65535) {
                std::cerr << "Error: Port must be between 1024 and 65535" << std::endl;
                return 1;
            }
        } catch (const std::exception& e) {
            std::cerr << "Error: Invalid port number: " << argv[1] << std::endl;
            return 1;
        }
    }
    
    // Setup signal handlers for graceful shutdown
    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);
    
    try {
        // Create and start the TTS server
        g_server = std::make_unique<TTSServer>(port);
        
        std::cout << "Starting kfa TTS server on port " << port << "..." << std::endl;
        std::cout << "API endpoints:" << std::endl;
        std::cout << "  POST /api/speak    - Synthesize kfa text to speech" << std::endl;
        std::cout << "  GET  /api/voices   - List available voices" << std::endl;
        std::cout << "  GET  /api/health   - Server health check" << std::endl;
        std::cout << std::endl;
        std::cout << "Press Ctrl+C to stop the server" << std::endl;
        
        g_server->start();
        
    } catch (const std::exception& e) {
        std::cerr << "Error starting server: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
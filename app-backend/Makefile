# Makefile for kfa TTS Server
# High-performance C++ TTS server with Piper neural synthesis

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O3 -pthread
INCLUDES = -Iinclude
TARGET = kfa-tts-server
SRCDIR = src
OBJDIR = obj
SOURCES = $(wildcard $(SRCDIR)/*.cpp)
OBJECTS = $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

# Default target
all: $(TARGET)

# Create object directory
$(OBJDIR):
	mkdir -p $(OBJDIR)

# Build object files
$(OBJDIR)/%.o: $(SRCDIR)/%.cpp | $(OBJDIR)
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Build main executable
$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) $(OBJECTS) -o $(TARGET)
	@echo "Build complete: $(TARGET)"

# Clean build artifacts
clean:
	rm -rf $(OBJDIR) $(TARGET)
	@echo "Clean complete"

# Install dependencies (Ubuntu/Debian)
install-deps:
	@echo "Installing build dependencies..."
	sudo apt-get update
	sudo apt-get install -y build-essential cmake git
	@echo "Installing Python dependencies..."
	pip3 install piper-tts
	@echo "Dependencies installed"

# Download voice models
download-voices:
	@echo "Downloading Piper TTS voice models..."
	mkdir -p models
	python3 -m piper.download_voices en_US-lessac-medium
	python3 -m piper.download_voices en_US-ryan-medium
	@echo "Voice models downloaded"

# Run the server
run: $(TARGET)
	./$(TARGET) 8080

# Debug build
debug: CXXFLAGS += -g -DDEBUG
debug: $(TARGET)

# Test the API endpoints
test:
	@echo "Testing server endpoints..."
	@echo "1. Health check:"
	curl -s http://localhost:8080/api/health | python3 -m json.tool
	@echo "\n2. Available voices:"
	curl -s http://localhost:8080/api/voices | python3 -m json.tool
	@echo "\n3. TTS synthesis:"
	curl -s -X POST -H "Content-Type: application/json" \
		-d '{"text": "bit Sip Jym", "voice": "en_US-lessac-medium"}' \
		http://localhost:8080/api/speak | python3 -m json.tool

# Docker build
docker-build:
	docker build -t kfa-tts-server .

# Docker run
docker-run:
	docker run -p 8080:8080 kfa-tts-server

# Help
help:
	@echo "Available targets:"
	@echo "  all           - Build the server (default)"
	@echo "  clean         - Remove build artifacts"
	@echo "  install-deps  - Install system and Python dependencies"
	@echo "  download-voices - Download Piper TTS voice models"
	@echo "  run           - Build and run the server on port 8080"
	@echo "  debug         - Build with debug symbols"
	@echo "  test          - Test API endpoints (requires running server)"
	@echo "  docker-build  - Build Docker image"
	@echo "  docker-run    - Run in Docker container"
	@echo "  help          - Show this help message"

.PHONY: all clean install-deps download-voices run debug test docker-build docker-run help
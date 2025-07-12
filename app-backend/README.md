# kfa TTS Server

High-performance C++ text-to-speech server with neural synthesis for the kfa (QWERTY Phonetic Alphabet) system.

## Features

- **Neural Quality Speech**: Powered by Piper TTS for human-like voice synthesis
- **Phonetic Precision**: Direct support for kfa → IPA → neural speech pipeline
- **High Performance**: Sub-100ms response times with C++ implementation
- **REST API**: Simple HTTP endpoints for integration
- **Docker Ready**: Containerized deployment for Digital Ocean

## Quick Start

### Prerequisites

- Ubuntu/Debian Linux (tested on Ubuntu 22.04+)
- C++ compiler with C++17 support
- Python 3.8+ with pip
- CMake (optional)

### Installation

1. **Install dependencies:**
```bash
make install-deps
```

2. **Download voice models:**
```bash
make download-voices
```

3. **Build and run:**
```bash
make run
```

The server will start on `http://localhost:8080`

## API Endpoints

### `GET /api/health`
Server health check
```bash
curl http://localhost:8080/api/health
```

### `GET /api/voices`
List available neural voices
```bash
curl http://localhost:8080/api/voices
```

### `POST /api/speak`
Convert kfa text to speech
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"text": "bit Sip Jym kat", "voice": "en_US-lessac-medium"}' \
  http://localhost:8080/api/speak
```

**Request body:**
```json
{
  "text": "for skOr and sevun yiErz uguO",
  "voice": "en_US-lessac-medium",
  "speed": 1.0,
  "pitch": 1.0,
  "format": "wav"
}
```

## kfa Phonetic System

The server converts kfa text through this pipeline:
1. **kfa input**: `"for skOr and sevun yiErz uguO"`
2. **IPA conversion**: `"fɔːr skɔːr ænd sevən jɪərz əgəʊ"`
3. **Neural synthesis**: High-quality WAV audio output

### Supported kfa Phonemes

**Core Vowels (10):** u, i, y, E, a, O, e, A, o, U  
**Diphthongs (10):** ey, ay, uO, au, iE, eE, UE, oUy  
**Consonants (24):** All English consonants including T(ð), Q(θ), S(ʃ), Z(ʒ), G(ŋ), J(dʒ), c(tʃ)

## Development

### Build Options

```bash
# Debug build
make debug

# Clean build
make clean

# Test API endpoints
make test
```

### Project Structure

```
app-backend/
├── src/
│   ├── main.cpp              # Server entry point
│   ├── tts_server.cpp         # HTTP server implementation
│   ├── speech_synthesizer.cpp # Piper TTS integration
│   └── kfa_converter.cpp      # kfa → IPA conversion
├── include/
│   ├── tts_server.h
│   ├── speech_synthesizer.h
│   └── kfa_converter.h
├── models/                    # Voice model files
├── CMakeLists.txt            # CMake build config
├── Makefile                  # Make build config
└── README.md
```

## Docker Deployment

### Build Docker image:
```bash
make docker-build
```

### Run in container:
```bash
make docker-run
```

## Digital Ocean Deployment

1. **Create droplet** (Ubuntu 22.04, 2GB RAM minimum)
2. **Clone repository:**
```bash
git clone https://github.com/your-username/kfa.git
cd kfa/app-backend
```

3. **Install and run:**
```bash
make install-deps
make download-voices
make run
```

4. **Setup firewall:**
```bash
sudo ufw allow 8080
```

## Performance

- **Response Time**: < 100ms for typical kfa phrases
- **Memory Usage**: ~200MB with voice models loaded
- **Throughput**: 10+ concurrent requests
- **Audio Quality**: 22kHz WAV, neural synthesis quality

## Voice Models

Available voices:
- `en_US-lessac-medium` - Clear American English female
- `en_US-ryan-medium` - Natural American English male  
- `en_US-amy-medium` - Expressive American English female

Add more voices by downloading from [Piper Voice Collection](https://huggingface.co/rhasspy/piper-voices).

## Troubleshooting

### Common Issues

**"Piper TTS not found"**
```bash
pip3 install piper-tts
```

**"Port already in use"**
```bash
sudo lsof -i :8080
kill -9 <PID>
```

**"Voice model not found"**
```bash
make download-voices
```

### Debug Mode

Run with debug output:
```bash
make debug
./kfa-tts-server 8080
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/enhancement`
3. Commit changes: `git commit -m "Add enhancement"`
4. Push to branch: `git push origin feature/enhancement`
5. Submit pull request

## License

GPL-3.0 License - see LICENSE file for details.

## Related Projects

- [kfa Web App](../app/) - React frontend for kfa TTS
- [Piper TTS](https://github.com/rhasspy/piper) - Neural text-to-speech engine
- [kfa Phonetic System](../README.md) - Complete kfa documentation
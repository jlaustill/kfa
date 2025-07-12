# Multi-stage Docker build for kfa TTS Server
# Stage 1: Build environment
FROM ubuntu:22.04 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Piper TTS
RUN pip3 install piper-tts

# Set working directory
WORKDIR /app

# Copy source code
COPY src/ src/
COPY include/ include/
COPY Makefile .
COPY CMakeLists.txt .

# Build the application
RUN make clean && make

# Download voice models
RUN mkdir -p models && \
    python3 -m piper.download_voices en_US-lessac-medium && \
    python3 -m piper.download_voices en_US-ryan-medium

# Stage 2: Runtime environment
FROM ubuntu:22.04 AS runtime

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Piper TTS
RUN pip3 install piper-tts

# Create app user
RUN useradd -m -u 1000 kfa && \
    mkdir -p /app && \
    chown -R kfa:kfa /app

# Set working directory
WORKDIR /app

# Copy built application and models
COPY --from=builder /app/kfa-tts-server .
COPY --from=builder /app/models/ models/
COPY --from=builder /root/.local/share/piper-voices/ /home/kfa/.local/share/piper-voices/

# Fix permissions
RUN chown -R kfa:kfa /app && \
    chown -R kfa:kfa /home/kfa

# Switch to app user
USER kfa

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Run the server
CMD ["./kfa-tts-server", "8080"]
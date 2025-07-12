cmake_minimum_required(VERSION 3.20)
project(kfa-tts-server VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(PkgConfig REQUIRED)

# Check for Crow framework (lightweight C++ web framework)
find_path(CROW_INCLUDE_DIR 
    NAMES crow.h crow/crow.h
    PATHS /usr/include /usr/local/include
    PATH_SUFFIXES crow
)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/third_party/onnxruntime/include)

# Source files
set(SOURCES
    src/main.cpp
    src/tts_server.cpp
    src/speech_synthesizer.cpp
    src/neural_synthesizer.cpp
    src/kfa_converter.cpp
)

# Create executable
add_executable(kfa-tts-server ${SOURCES})

# Compiler flags
target_compile_options(kfa-tts-server PRIVATE 
    -Wall 
    -Wextra 
    -O3
    -pthread
)

# ONNX Runtime library
set(ONNXRUNTIME_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/third_party/onnxruntime)
find_library(ONNXRUNTIME_LIB onnxruntime HINTS ${ONNXRUNTIME_ROOT_PATH}/lib)

# Link libraries
target_link_libraries(kfa-tts-server 
    pthread
    ${ONNXRUNTIME_LIB}
)

# Install targets
install(TARGETS kfa-tts-server 
    RUNTIME DESTINATION bin
)

# Copy voice models directory (will be populated later)
install(DIRECTORY models/ 
    DESTINATION share/kfa-tts-server/models
    OPTIONAL
)
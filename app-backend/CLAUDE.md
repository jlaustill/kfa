# KFA TTS Server - Development Notes

## WAV File Management

**IMPORTANT**: All generated WAV files must be saved to the `output_waves/` folder.

**Before generating new WAV files**: Always clean/delete existing files in `output_waves/` to avoid confusion and ensure clean test results.

```bash
# Clean output folder before generating new files
rm -f output_waves/*.wav
```

## Architecture Notes

- This is a pure C++ + ONNX Runtime + Piper TTS implementation
- **NO eSpeak dependencies** - completely removed from codebase
- Direct IPA phoneme input to neural synthesis
- Uses Piper neural models (.onnx) for high-quality speech synthesis

## Speech Parameters

For demonstrative/testing speech:
- `length_scale: 2.5` (much slower)
- `noise_scale: 0.3` (cleaner)
- `noise_w: 0.4` (clearer articulation)
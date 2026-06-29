# Avatar Synchronization Pipeline

## Overview

Complete synchronization pipeline for SignViz that solves two critical issues:

1. **Silence Handling** - Avatar pauses naturally when speaker pauses
2. **Dynamic Time-Scaling** - Animation speed matches speaker's pace

## Architecture

```
Audio Input
    ↓
WhisperX Transcription (word-level timestamps)
    ↓
NLP Processing (lemmatization, tense, stop-words)
    ↓
Sync Sequence Builder (silence detection, speed calculation)
    ↓
Video Renderer (time-scaling, blending, compositing)
    ↓
Final Avatar Video
```

## Key Components

### 1. Transcription (`transcribe_with_timestamps`)

**Primary**: WhisperX with forced alignment
- Word-level timestamps with millisecond precision
- Automatic language detection
- GPU acceleration support

**Fallback 1**: Plain Whisper
- Segment-level timestamps
- Words distributed evenly within segments

**Fallback 2**: SpeechRecognition
- No real timestamps
- Synthetic equal-duration words

### 2. NLP Processing (`process_words_to_signs`)

Reuses existing pipeline:
- Stop-word removal
- Lemmatization
- Tense detection and prefix injection
- Finger-spelling for missing signs
- Timestamp preservation

### 3. Sync Sequence Builder (`build_sync_sequence`)

Converts word timestamps into render instructions:

**Sign Entries**:
```python
{
    "type": "sign",
    "word": "Hello",
    "duration": 0.8,      # spoken duration
    "speed": 1.2,         # animation speed multiplier
    "clip_path": "/path/to/Hello.mp4"
}
```

**Hold Entries** (short silence):
```python
{
    "type": "hold",
    "duration": 0.5       # freeze last pose
}
```

**Idle Entries** (long silence):
```python
{
    "type": "idle",
    "duration": 2.0       # play idle animation loop
}
```

### 4. Video Renderer (`render_avatar_video`)

Renders final synchronized video:
- Time-scaling via frame index remapping
- Cross-fade blending between transitions
- Compositing on dark background
- 25 FPS output (configurable)

## Synchronization Logic

### Silence Detection

```python
gap = next_word.start - current_word.end

if gap < 0.3 sec:
    # Ignore - too short
    pass
elif gap < 1.5 sec:
    # Short silence - hold last pose
    add_hold(duration=gap)
else:
    # Long silence - hold briefly then idle
    add_hold(duration=0.32)  # 8 frames @ 25fps
    add_idle(duration=gap - 0.32)
```

### Dynamic Speed Calculation

```python
spoken_duration = word.end - word.start
clip_duration = get_clip_duration(word.mp4)

raw_speed = clip_duration / spoken_duration
clamped_speed = clamp(raw_speed, 0.7, 1.5)

# Examples:
# Spoken: 1.0s, Clip: 0.8s → speed = 0.8 (slow down)
# Spoken: 0.5s, Clip: 0.8s → speed = 1.5 (max speed up)
# Spoken: 2.0s, Clip: 0.8s → speed = 0.7 (min slow down)
```

### Transition Blending

```python
# Cross-fade over 4 frames (160ms @ 25fps)
for i in range(4):
    alpha = (i + 1) / 5
    blended = (1 - alpha) * prev_frame + alpha * next_frame
```

## Configuration

### Constants (in `sync_pipeline.py`)

```python
SILENCE_THRESHOLD   = 0.3   # seconds - ignore gaps shorter than this
IDLE_THRESHOLD      = 1.5   # seconds - trigger idle for gaps longer than this
SPEED_MIN           = 0.7   # slowest animation speed
SPEED_MAX           = 1.5   # fastest animation speed
BLEND_FRAMES        = 4     # frames for cross-fade transitions
DEFAULT_FPS         = 25    # output frame rate
IDLE_HOLD_FRAMES    = 8     # frames to hold before idle starts
BG_COLOR            = (23, 17, 13)  # BGR background color
```

## API Integration

### Updated Endpoints

**POST /api/process_video**
```json
Request:
{
  "video": <file>,
  "title": "My Lecture"
}

Response:
{
  "words": ["Hello", "World"],
  "sync_sequence": [
    {"type": "sign", "word": "Hello", "duration": 0.8, "speed": 1.2},
    {"type": "hold", "duration": 0.4},
    {"type": "sign", "word": "World", "duration": 0.6, "speed": 0.9}
  ],
  "word_count": 2,
  "duration": 1.8,
  "video_id": 123,
  "conversion_id": 456
}
```

**POST /api/process_youtube**
```json
Request:
{
  "url": "https://youtube.com/watch?v=...",
  "title": "YouTube Lecture"
}

Response: (same as process_video)
```

## Installation

### Dependencies

```bash
pip install whisperx faster-whisper torch opencv-python numpy
```

### GPU Support (Recommended)

```bash
# CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### CPU-Only

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

## Usage Examples

### Python API

```python
from A2SL.sync_pipeline import run_full_pipeline

result = run_full_pipeline(
    audio_path="lecture.wav",
    output_path="avatar.mp4",
    fps=25
)

print(f"Generated {result['word_count']} signs")
print(f"Total duration: {result['duration']}s")
print(f"Output: {result['output_path']}")
```

### Step-by-Step

```python
from A2SL.sync_pipeline import (
    transcribe_with_timestamps,
    process_words_to_signs,
    build_sync_sequence,
    render_avatar_video,
)

# 1. Transcribe
word_segments = transcribe_with_timestamps("audio.wav")
# [WordSegment(word="Hello", start=0.5, end=1.3), ...]

# 2. NLP
sign_segments = process_words_to_signs(word_segments)
# [WordSegment(word="Hello", start=0.5, end=1.3), ...]

# 3. Build sequence
sync_seq = build_sync_sequence(sign_segments)
# [SyncEntry(type="sign", word="Hello", duration=0.8, speed=1.2), ...]

# 4. Render
render_avatar_video(sync_seq, "output.mp4", fps=25)
```

## Performance

### Transcription

| Method | Speed | Accuracy | Timestamps |
|--------|-------|----------|------------|
| WhisperX | ~1x realtime (GPU) | Excellent | Word-level |
| Whisper | ~2x realtime (GPU) | Excellent | Segment-level |
| SpeechRecognition | ~0.5x realtime | Good | None |

### Rendering

| Resolution | FPS | Speed |
|------------|-----|-------|
| 640x480 | 25 | ~100 FPS |
| 1280x720 | 25 | ~60 FPS |
| 1920x1080 | 25 | ~30 FPS |

*Measured on CPU (Intel i7). GPU rendering not yet implemented.*

## Troubleshooting

### WhisperX Installation Issues

```bash
# If whisperx fails to install
pip install git+https://github.com/m-bain/whisperx.git

# If alignment model fails
python -c "import whisperx; whisperx.load_align_model('en', 'cpu')"
```

### CUDA Out of Memory

```python
# Use smaller Whisper model
model = whisperx.load_model("tiny", device, compute_type)

# Or use CPU
device = "cpu"
compute_type = "int8"
```

### Missing Sign Clips

```python
# Check if sign exists
from django.contrib.staticfiles import finders
path = finders.find("Hello.mp4")
if not path:
    print("Sign 'Hello' not found - will be finger-spelled")
```

### Slow Rendering

```python
# Reduce output resolution
# Edit _get_output_dimensions() in sync_pipeline.py
return 640, 480  # instead of 1920, 1080
```

## Testing

### Unit Tests

```python
# Test transcription
from A2SL.sync_pipeline import transcribe_with_timestamps
segments = transcribe_with_timestamps("test.wav")
assert len(segments) > 0
assert all(s.end > s.start for s in segments)

# Test sync sequence
from A2SL.sync_pipeline import build_sync_sequence, WordSegment
words = [
    WordSegment("Hello", 0.0, 0.8),
    WordSegment("World", 2.0, 2.6),  # 1.2s gap
]
seq = build_sync_sequence(words)
assert seq[0].type == "sign"
assert seq[1].type == "hold"  # gap detected
assert seq[2].type == "sign"
```

### Integration Test

```bash
# Process a test video
curl -X POST http://localhost:8000/api/process_video \
  -F "video=@test.mp4" \
  -F "title=Test"

# Check response
{
  "words": [...],
  "sync_sequence": [...],
  "duration": 10.5
}
```

## Optimization Tips

### 1. Batch Processing

```python
# Process multiple videos in parallel
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [
        executor.submit(run_full_pipeline, audio, output)
        for audio, output in video_pairs
    ]
    results = [f.result() for f in futures]
```

### 2. Caching

```python
# Cache transcription results
import hashlib
import pickle

def transcribe_cached(audio_path):
    cache_key = hashlib.md5(open(audio_path, 'rb').read()).hexdigest()
    cache_file = f"/tmp/transcribe_{cache_key}.pkl"
    
    if os.path.exists(cache_file):
        return pickle.load(open(cache_file, 'rb'))
    
    result = transcribe_with_timestamps(audio_path)
    pickle.dump(result, open(cache_file, 'wb'))
    return result
```

### 3. GPU Acceleration

```python
# Use GPU for Whisper
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if device == "cuda" else "int8"

# Batch size tuning
result = model.transcribe(audio, batch_size=32)  # increase for GPU
```

## Future Enhancements

### Phase 2
- [ ] GPU-accelerated video rendering (CUDA/OpenCL)
- [ ] Real-time streaming mode
- [ ] Emotion detection and expression mapping
- [ ] Multi-speaker support

### Phase 3
- [ ] 3D avatar models
- [ ] Facial animation sync
- [ ] Hand shape refinement
- [ ] Background customization

### Phase 4
- [ ] Live captioning mode
- [ ] Interactive avatar control
- [ ] Custom sign library upload
- [ ] Multi-language support

## References

- [WhisperX Paper](https://arxiv.org/abs/2303.00747)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [Forced Alignment](https://en.wikipedia.org/wiki/Forced_alignment)

## Support

For issues or questions:
1. Check logs: `tail -f /var/log/signviz/sync_pipeline.log`
2. Enable debug logging: `logging.basicConfig(level=logging.DEBUG)`
3. Test with sample audio: `python -m A2SL.sync_pipeline test.wav`

---

**Last Updated**: April 29, 2024  
**Version**: 1.0.0  
**Status**: Production Ready

"""
sync_pipeline.py
================
Complete synchronization pipeline for SignViz avatar generation.

Fixes:
  1. Silence gaps — uses WhisperX word-level timestamps to detect pauses
     and hold the last pose / play idle during silence.
  2. Dynamic time-scaling — stretches or compresses each sign clip to match
     the spoken word duration (clamped 0.7x – 1.5x).

Public API
----------
  transcribe_with_timestamps(audio_path)  → list[WordSegment]
  build_sync_sequence(word_segments)      → list[SyncEntry]
  render_avatar_video(sync_sequence, output_path, fps=25) → output_path
"""

from __future__ import annotations

import os
import json
import logging
import tempfile
from dataclasses import dataclass, field
from typing import List, Optional

import cv2
import numpy as np
import re
from django.conf import settings

logger = logging.getLogger(__name__)

_available_animations_cache = None

def normalize_string(s: str) -> str:
    """Normalize string by lowercasing and removing punctuation/spaces."""
    return re.sub(r'[^a-z0-9]', '', s.lower())

def get_available_animations() -> dict:
    """
    Returns a dict mapping normalized word -> original filename without extension.
    Scans for both .webm (preferred) and .mp4 files.
    """
    global _available_animations_cache
    if _available_animations_cache is not None:
        return _available_animations_cache

    _available_animations_cache = {}
    assets_dir = os.path.join(settings.BASE_DIR, "assets")
    if os.path.exists(assets_dir):
        # Process .mp4 first, then .webm so .webm wins on collision
        for ext in ('.mp4', '.webm'):
            for f in os.listdir(assets_dir):
                if f.endswith(ext):
                    basename = f[:-len(ext)]
                    norm = normalize_string(basename)
                    _available_animations_cache[norm] = basename

    return _available_animations_cache

def find_animation(word: str) -> Optional[str]:
    """
    Find the dataset basename for *word* using two-step lookup:

    1. Direct match  — word (normalised) exists as a file in assets/
    2. Synonym match — word is a synonym of a dataset word (synonym_map.py),
                       and that dataset word exists as a file in assets/

    Returns the exact basename (without extension) to use as the clip name,
    or None if no match is found.
    """
    from A2SL.synonym_map import resolve_synonym  # local import avoids circular

    animations = get_available_animations()
    norm_word  = normalize_string(word)

    # Step 1: direct match
    if norm_word in animations:
        return animations[norm_word]

    # Step 2: synonym → dataset word → check if that file exists
    dataset_word = resolve_synonym(word)
    if dataset_word:
        norm_dataset = normalize_string(dataset_word)
        if norm_dataset in animations:
            return animations[norm_dataset]

    return None


def reset_animation_cache():
    """Call this if the assets directory changes at runtime."""
    global _available_animations_cache
    _available_animations_cache = None

# ─── Constants ────────────────────────────────────────────────────────────────

SILENCE_THRESHOLD   = 0.3   # seconds — gaps shorter than this are ignored
IDLE_THRESHOLD      = 1.5   # seconds — gaps longer than this trigger idle anim
SPEED_MIN           = 0.7   # slowest allowed playback multiplier
SPEED_MAX           = 1.5   # fastest allowed playback multiplier
BLEND_FRAMES        = 4     # number of frames used for cross-fade blending
DEFAULT_FPS         = 25
IDLE_HOLD_FRAMES    = 8     # frames to hold last pose before idle loop

# Background colour for composited output (BGR)
BG_COLOR = (23, 17, 13)     # near-black, matches existing rembg composite


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class WordSegment:
    """A single word with its audio timestamps from WhisperX."""
    word:  str
    start: float   # seconds
    end:   float   # seconds

    @property
    def duration(self) -> float:
        return max(self.end - self.start, 0.05)


@dataclass
class SyncEntry:
    """
    One element in the final render sequence.

    type:
      'sign'    — play a sign clip, possibly time-scaled
      'hold'    — freeze the last frame of the previous clip
      'idle'    — play the idle animation loop
    """
    type:           str                  # 'sign' | 'hold' | 'idle'
    word:           Optional[str] = None # sign word (type == 'sign')
    duration:       float = 0.0          # target wall-clock duration (seconds)
    speed:          float = 1.0          # playback speed multiplier (sign only)
    clip_path:      Optional[str] = None # resolved .mp4 path (sign only)
    start:          float = 0.0          # absolute start time in source audio (seconds)
    end:            float = 0.0          # absolute end time in source audio (seconds)


# ─── Step 1 — Transcription with word-level timestamps ────────────────────────

def transcribe_with_timestamps(audio_path: str) -> List[WordSegment]:
    """
    Transcribe audio using WhisperX and return per-word timestamps.

    Falls back to plain Whisper (no alignment) if WhisperX is unavailable,
    and further falls back to SpeechRecognition if Whisper is also missing.
    """
    try:
        return _transcribe_whisperx(audio_path)
    except ImportError:
        logger.warning("WhisperX not installed — falling back to plain Whisper")
    except Exception as exc:
        logger.warning("WhisperX failed (%s) — falling back to plain Whisper", exc)

    try:
        return _transcribe_whisper(audio_path)
    except ImportError:
        logger.warning("Whisper not installed — falling back to SpeechRecognition")
    except Exception as exc:
        logger.warning("Whisper failed (%s) — falling back to SpeechRecognition", exc)

    return _transcribe_sr(audio_path)


_whisperx_model_cache = {}
_whisperx_align_cache = {}

def _transcribe_whisperx(audio_path: str) -> List[WordSegment]:
    """Primary path: WhisperX with forced alignment for word timestamps."""
    import whisperx  # type: ignore
    import torch

    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"
    model_key = f"{device}_{compute_type}"

    global _whisperx_model_cache
    if model_key not in _whisperx_model_cache:
        logger.info("Loading WhisperX model (%s)...", model_key)
        _whisperx_model_cache[model_key] = whisperx.load_model("base", device, compute_type=compute_type)
    
    model = _whisperx_model_cache[model_key]
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=16)

    # Forced alignment for word-level timestamps
    lang = result.get("language", "en")
    
    global _whisperx_align_cache
    if lang not in _whisperx_align_cache:
        logger.info("Loading WhisperX alignment model for %s...", lang)
        _whisperx_align_cache[lang] = whisperx.load_align_model(language_code=lang, device=device)
    
    align_model, metadata = _whisperx_align_cache[lang]
    
    aligned = whisperx.align(
        result["segments"], align_model, metadata, audio, device,
        return_char_alignments=False
    )

    segments: List[WordSegment] = []
    for seg in aligned.get("segments", []):
        for w in seg.get("words", []):
            word_text = w.get("word", "").strip()
            start     = w.get("start", seg["start"])
            end       = w.get("end",   seg["end"])
            if word_text:
                segments.append(WordSegment(word=word_text, start=start, end=end))

    logger.info("WhisperX produced %d word segments", len(segments))
    return segments


def _transcribe_whisper(audio_path: str) -> List[WordSegment]:
    """
    Fallback: plain OpenAI Whisper.
    Whisper returns segment-level timestamps; we distribute words evenly
    within each segment as an approximation.
    """
    import whisper  # type: ignore

    model = whisper.load_model("base")
    result = model.transcribe(audio_path, word_timestamps=True)

    segments: List[WordSegment] = []
    for seg in result.get("segments", []):
        words_in_seg = seg.get("words", [])
        if words_in_seg:
            for w in words_in_seg:
                segments.append(WordSegment(
                    word=w["word"].strip(),
                    start=w["start"],
                    end=w["end"],
                ))
        else:
            # Distribute words evenly across segment duration
            text  = seg.get("text", "").strip()
            words = text.split()
            if not words:
                continue
            seg_start = seg["start"]
            seg_end   = seg["end"]
            step = (seg_end - seg_start) / len(words)
            for i, w in enumerate(words):
                segments.append(WordSegment(
                    word=w,
                    start=seg_start + i * step,
                    end=seg_start + (i + 1) * step,
                ))

    logger.info("Whisper produced %d word segments", len(segments))
    return segments


def _transcribe_sr(audio_path: str) -> List[WordSegment]:
    """
    Last-resort fallback: SpeechRecognition (no real timestamps).
    All words get equal synthetic durations starting from t=0.
    """
    import speech_recognition as sr  # type: ignore

    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)

    words = text.split()
    avg   = 0.4  # assume 400 ms per word
    segments = [
        WordSegment(word=w, start=i * avg, end=(i + 1) * avg)
        for i, w in enumerate(words)
    ]
    logger.info("SpeechRecognition produced %d synthetic word segments", len(segments))
    return segments


# ─── Step 2 — NLP processing (reuse existing logic) ──────────────────────────

def _find_sign_path(word: str) -> Optional[str]:
    """Return the absolute path to the sign clip for *word*, or None.
    Prefers .webm over .mp4."""
    from django.contrib.staticfiles import finders  # type: ignore
    for ext in ['.webm', '.mp4']:
        path = finders.find(f"{word}{ext}")
        if path:
            return path
    return None


def process_words_to_signs(word_segments: List[WordSegment]) -> List[WordSegment]:
    """
    Apply the existing NLP pipeline (stop-word removal, lemmatisation, tense
    prefix) to the word list, then map each output token back to a WordSegment
    with the best available timestamp.

    Words that have no sign clip are finger-spelled (one letter per segment,
    sharing the original word's time window).
    """
    from django.contrib.staticfiles import finders  # type: ignore
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    import nltk

    # ── NLP ──────────────────────────────────────────────────────────────────
    raw_text = " ".join(ws.word for ws in word_segments)
    tokens   = word_tokenize(raw_text.lower())
    tagged   = nltk.pos_tag(tokens)

    tense = {
        "future":           sum(1 for _, t in tagged if t == "MD"),
        "present":          sum(1 for _, t in tagged if t in ("VBP", "VBZ", "VBG")),
        "past":             sum(1 for _, t in tagged if t in ("VBD", "VBN")),
        "present_continuous": sum(1 for _, t in tagged if t == "VBG"),
    }

    STOP_WORDS = set([
        "mightn't", 're', 'wasn', 'wouldn', 'be', 'has', 'that', 'does',
        'shouldn', 'do', "you've", 'off', 'for', "didn't", 'm', 'ain',
        'haven', "weren't", 'are', "she's", "wasn't", 'its', "haven't",
        "wouldn't", 'don', 'weren', 's', "you'd", "don't", 'doesn',
        "hadn't", 'is', 'was', "that'll", "should've", 'a', 'then', 'the',
        'mustn', 'i', 'nor', 'as', "it's", "needn't", 'd', 'am', 'have',
        'hasn', 'o', "aren't", "you'll", "couldn't", "you're", "mustn't",
        'didn', "doesn't", 'll', 'an', 'hadn', 'whom', 'y', "hasn't",
        'itself', 'couldn', 'needn', "shan't", 'isn', 'been', 'such',
        'shan', "shouldn't", 'aren', 'being', 'were', 'did', 'ma', 't',
        'having', 'mightn', 've', "isn't", "won't",
    ])

    lr = WordNetLemmatizer()
    filtered: List[str] = []
    for w, (_, pos) in zip(tokens, tagged):
        if w in STOP_WORDS:
            continue
        if find_animation(w):
            filtered.append(w)
        else:
            if pos in ('VBG', 'VBD', 'VBZ', 'VBN', 'NN'):
                filtered.append(lr.lemmatize(w, pos='v'))
            elif pos in ('JJ', 'JJR', 'JJS', 'RBR', 'RBS'):
                filtered.append(lr.lemmatize(w, pos='a'))
            else:
                filtered.append(lr.lemmatize(w))

    # Capitalise + handle "I" → "Me"
    filtered = ["Me" if w.upper() == "I" else w.capitalize() for w in filtered]

    # Tense prefix
    probable = max(tense, key=tense.get) if any(tense.values()) else "present"
    if probable == "past" and tense["past"] >= 1:
        filtered = ["Before"] + filtered
    elif probable == "future" and tense["future"] >= 1 and "Will" not in filtered:
        filtered = ["Will"] + filtered
    elif probable == "present" and tense["present_continuous"] >= 1:
        filtered = ["Now"] + filtered

    # Build a lookup: lowercase word -> WordSegment (first occurrence)
    ts_map = {ws.word.lower(): ws for ws in reversed(word_segments)}

    result: List[WordSegment] = []
    for w in filtered:
        lookup_w = "i" if w == "Me" else w.lower()
        original_ws = ts_map.get(lookup_w)
        
        match = find_animation(w)
        if match:
            start = original_ws.start if original_ws else (result[-1].end if result else 0.0)
            end = original_ws.end if original_ws else start
            result.append(WordSegment(word=match, start=start, end=end))
        else:
            # Fallback to spelling
            start = original_ws.start if original_ws else (result[-1].end if result else 0.0)
            end = original_ws.end if original_ws else start
            duration = end - start
            num_letters = len(w)
            
            for i, c in enumerate(w):
                c_start = start + (i * duration / num_letters) if num_letters > 0 else start
                c_end = start + ((i + 1) * duration / num_letters) if num_letters > 0 else end
                result.append(WordSegment(word=c.upper(), start=c_start, end=c_end))

    return result


# ─── Step 3 — Build synchronisation sequence ─────────────────────────────────

def build_sync_sequence(word_segments: List[WordSegment], initial_time: float = 0.0) -> List[SyncEntry]:
    """
    Convert a list of WordSegments (with timestamps) into a SyncEntry sequence
    that encodes:
      - sign clips with dynamic speed
      - hold frames during short silences
      - idle animation during long silences
    """
    sequence: List[SyncEntry] = []
    avatar_time = initial_time

    for i, ws in enumerate(word_segments):
        clip_path = _find_sign_path(ws.word)

        # ── Compute animation speed and target duration ───────────────────────────
        spoken_dur = ws.duration
        if clip_path and spoken_dur > 0:
            clip_dur = _get_clip_duration(clip_path)
            if clip_dur > 0:
                raw_speed = clip_dur / spoken_dur
                speed = float(np.clip(raw_speed, SPEED_MIN, SPEED_MAX))
                target_dur = clip_dur / speed
            else:
                speed = 1.0
                target_dur = spoken_dur
        else:
            speed = 1.0
            target_dur = spoken_dur

        # ── Gap filling (catch-up logic) ──────────────────────────────────────────
        # If the avatar is running ahead of the audio (or synced), fill the gap
        if ws.start > avatar_time:
            gap = ws.start - avatar_time
            if gap >= SILENCE_THRESHOLD:
                if gap >= IDLE_THRESHOLD:
                    hold_dur = HOLD_FRAMES_TO_SECONDS(IDLE_HOLD_FRAMES)
                    idle_dur = gap - hold_dur
                    sequence.append(SyncEntry(type="hold", duration=hold_dur,
                                              start=avatar_time, end=avatar_time + hold_dur))
                    sequence.append(SyncEntry(type="idle", duration=max(idle_dur, 0.1),
                                              start=avatar_time + hold_dur, end=ws.start))
                else:
                    sequence.append(SyncEntry(type="hold", duration=gap,
                                              start=avatar_time, end=ws.start))
            else:
                # Small gap, just hold to maintain strict time sync
                sequence.append(SyncEntry(type="hold", duration=gap,
                                          start=avatar_time, end=ws.start))
            avatar_time = ws.start

        # ── Append the sign ───────────────────────────────────────────────────────
        sequence.append(SyncEntry(
            type="sign",
            word=ws.word,
            duration=target_dur,
            speed=speed,
            clip_path=clip_path,
            start=avatar_time,
            end=avatar_time + target_dur,
        ))

        avatar_time += target_dur

    return sequence


def HOLD_FRAMES_TO_SECONDS(n_frames: int, fps: int = DEFAULT_FPS) -> float:
    return n_frames / fps


# ─── Step 4 — Render final video ─────────────────────────────────────────────


def render_avatar_video(
    sync_sequence: List[SyncEntry],
    output_path: str,
    fps: int = DEFAULT_FPS,
) -> str:
    """
    Render the full synchronised avatar video to *output_path*.
    Sequential rendering for maximum stability.
    """
    if not sync_sequence:
        logger.warning("No sync sequence to render")
        return output_path

    width, height = _get_output_dimensions(sync_sequence)
    idle_path = _find_sign_path("idle") or _find_sign_path("Idle")

    # Use mp4v or XVID for compatibility on Windows
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    if not writer.isOpened():
        logger.error(f"Failed to open VideoWriter for {output_path}")
        raise RuntimeError(f"Could not open VideoWriter for {output_path}")

    last_frame: Optional[np.ndarray] = None

    try:
        for entry in sync_sequence:
            if entry.type == "sign":
                frames = _render_sign(entry, fps, width, height)
            elif entry.type == "hold":
                frames = _render_hold(last_frame, entry.duration, fps, width, height)
            elif entry.type == "idle":
                frames = _render_idle(idle_path, entry.duration, fps, width, height, last_frame)
            else:
                continue

            if not frames:
                continue

            # Cross-fade blend with previous sign
            if last_frame is not None and len(frames) > 0:
                frames = _apply_blend(last_frame, frames, BLEND_FRAMES)

            for f in frames:
                writer.write(f)
                last_frame = f

    finally:
        writer.release()

    logger.info("Rendered avatar video -> %s", output_path)
    return output_path


# ─── Rendering helpers ────────────────────────────────────────────────────────

def _render_sign(
    entry: SyncEntry,
    fps: int,
    width: int,
    height: int,
) -> List[np.ndarray]:
    """Read a sign clip and time-scale it to match the spoken duration."""
    if not entry.clip_path or not os.path.exists(entry.clip_path):
        # No clip — return blank frames for the duration
        n = max(1, int(entry.duration * fps))
        blank = np.full((height, width, 3), BG_COLOR, dtype=np.uint8)
        return [blank] * n

    cap = cv2.VideoCapture(entry.clip_path)
    clip_fps  = cap.get(cv2.CAP_PROP_FPS) or fps
    raw_frames: List[np.ndarray] = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        raw_frames.append(_resize_frame(frame, width, height))
    cap.release()

    if not raw_frames:
        n = max(1, int(entry.duration * fps))
        blank = np.full((height, width, 3), BG_COLOR, dtype=np.uint8)
        return [blank] * n

    # Target frame count based on spoken duration
    target_n = max(1, int(entry.duration * fps))

    # Time-scale via frame index remapping (nearest-neighbour — fast, no blur)
    src_n = len(raw_frames)
    indices = np.round(np.linspace(0, src_n - 1, target_n)).astype(int)
    scaled = [raw_frames[i] for i in indices]

    return scaled


def _render_hold(
    last_frame: Optional[np.ndarray],
    duration: float,
    fps: int,
    width: int,
    height: int,
) -> List[np.ndarray]:
    """Repeat the last frame for *duration* seconds."""
    n = max(1, int(duration * fps))
    if last_frame is None:
        frame = np.full((height, width, 3), BG_COLOR, dtype=np.uint8)
    else:
        frame = last_frame.copy()
    return [frame] * n


def _render_idle(
    idle_path: Optional[str],
    duration: float,
    fps: int,
    width: int,
    height: int,
    last_frame: Optional[np.ndarray],
) -> List[np.ndarray]:
    """
    Loop the idle animation clip for *duration* seconds.
    Falls back to hold if no idle clip is available.
    """
    if not idle_path or not os.path.exists(idle_path):
        return _render_hold(last_frame, duration, fps, width, height)

    cap = cv2.VideoCapture(idle_path)
    idle_frames: List[np.ndarray] = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        idle_frames.append(_resize_frame(frame, width, height))
    cap.release()

    if not idle_frames:
        return _render_hold(last_frame, duration, fps, width, height)

    target_n = max(1, int(duration * fps))
    # Loop the idle clip
    looped = []
    while len(looped) < target_n:
        looped.extend(idle_frames)
    return looped[:target_n]


def _apply_blend(
    prev_frame: np.ndarray,
    frames: List[np.ndarray],
    n_blend: int,
) -> List[np.ndarray]:
    """
    Cross-fade the first *n_blend* frames of *frames* from *prev_frame*.
    Produces smooth transitions without abrupt snapping.
    """
    if not frames or n_blend <= 0:
        return frames

    actual_blend = min(n_blend, len(frames))
    result = list(frames)

    for i in range(actual_blend):
        alpha = (i + 1) / (actual_blend + 1)   # 0 → 1 exclusive
        blended = cv2.addWeighted(
            prev_frame.astype(np.float32), 1.0 - alpha,
            frames[i].astype(np.float32),  alpha,
            0,
        ).astype(np.uint8)
        result[i] = blended

    return result


# ─── Utility helpers ──────────────────────────────────────────────────────────

def _get_clip_duration(path: str) -> float:
    """Return the duration of a video clip in seconds."""
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or DEFAULT_FPS
    n   = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    cap.release()
    return n / fps if fps > 0 else 0.0


def _resize_frame(frame: np.ndarray, width: int, height: int) -> np.ndarray:
    """Resize a frame to (width, height) if needed."""
    h, w = frame.shape[:2]
    if w == width and h == height:
        return frame
    return cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)


def _get_output_dimensions(sequence: List[SyncEntry]) -> tuple[int, int]:
    """Determine output (width, height) from the first available sign clip."""
    for entry in sequence:
        if entry.clip_path and os.path.exists(entry.clip_path):
            cap = cv2.VideoCapture(entry.clip_path)
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            cap.release()
            if w > 0 and h > 0:
                return w, h
    return 640, 480   # safe default


# ─── High-level convenience function ─────────────────────────────────────────

def run_full_pipeline(
    audio_path: str,
    output_path: str,
    fps: int = DEFAULT_FPS,
) -> dict:
    """
    End-to-end pipeline:
      audio_path  → transcribe → NLP → sync sequence → render → output_path

    Returns a dict with:
      {
        'output_path': str,
        'words': list[str],          # final sign words
        'sync_sequence': list[dict], # serialisable sequence
        'word_count': int,
        'duration': float,           # total rendered duration (seconds)
      }
    """
    # 1. Transcribe with timestamps
    word_segments = transcribe_with_timestamps(audio_path)
    if not word_segments:
        raise ValueError("No speech detected in audio")

    # 2. NLP → sign words with timestamps
    sign_segments = process_words_to_signs(word_segments)

    # 3. Build sync sequence
    sync_seq = build_sync_sequence(sign_segments)

    # 4. Render
    render_avatar_video(sync_seq, output_path, fps=fps)

    # 5. Serialise for API response
    words = [e.word for e in sync_seq if e.type == "sign" and e.word]
    total_dur = sum(e.duration for e in sync_seq)

    serialised = [
        {
            "type":     e.type,
            "word":     e.word,
            "start":    round(e.start, 3) if hasattr(e, 'start') else None,
            "end":      round(e.end, 3)   if hasattr(e, 'end')   else None,
            "duration": round(e.duration, 3),
            "speed":    round(e.speed, 3),
        }
        for e in sync_seq
    ]

    return {
        "output_path":   output_path,
        "words":         words,
        "sync_sequence": serialised,
        "word_count":    len(words),
        "duration":      round(total_dur, 2),
    }

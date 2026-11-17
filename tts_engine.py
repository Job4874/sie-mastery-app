"""
GPU TTS engine for SIE Mastery.

Default: Kokoro-82M (light, fast on any RTX, ~0.3GB VRAM)
Optional: XTTS v2 (voice cloning, TTS_ENGINE=xtts, voices/reference.wav)

Every clip is cached on disk as tts_cache/<sha256(text|voice|engine)>.wav
so the same line is synthesized exactly once.
"""
import hashlib, os, threading
from pathlib import Path

CACHE = Path(__file__).parent / "tts_cache"
CACHE.mkdir(exist_ok=True)
ENGINE = os.environ.get("TTS_ENGINE", "kokoro").lower()
_lock = threading.Lock()
_pipeline = None
_xtts = None

def cache_key(text: str, voice: str) -> str:
    return hashlib.sha256(f"{ENGINE}|{voice}|{text}".encode()).hexdigest()[:32]

def cache_path(text: str, voice: str) -> Path:
    return CACHE / f"{cache_key(text, voice)}.wav"

def gpu_info():
    try:
        import torch
        if torch.cuda.is_available():
            return {"cuda": True, "device": torch.cuda.get_device_name(0),
                    "vram_gb": round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1)}
    except Exception as e:
        return {"cuda": False, "error": str(e)}
    return {"cuda": False}

def _load_kokoro():
    global _pipeline
    if _pipeline is None:
        from kokoro import KPipeline
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _pipeline = KPipeline(lang_code="a", device=device)
    return _pipeline

def _load_xtts():
    global _xtts
    if _xtts is None:
        from TTS.api import TTS
        import torch
        _xtts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(
            "cuda" if torch.cuda.is_available() else "cpu")
    return _xtts

def synthesize(text: str, voice: str = "af_heart") -> Path:
    """Return cached wav path, generating it on GPU only if missing."""
    out = cache_path(text, voice)
    if out.exists() and out.stat().st_size > 1000:
        return out
    with _lock:
        if out.exists() and out.stat().st_size > 1000:
            return out
        if ENGINE == "xtts":
            ref = Path(__file__).parent / "voices" / "reference.wav"
            if not ref.exists():
                raise RuntimeError("XTTS needs voices/reference.wav (6+ sec voice sample)")
            _load_xtts().tts_to_file(text=text, speaker_wav=str(ref),
                                     language="en", file_path=str(out))
        else:
            import soundfile as sf
            pipe = _load_kokoro()
            chunks = [audio for _, _, audio in pipe(text, voice=voice, speed=1.0)]
            if not chunks:
                raise RuntimeError("Kokoro produced no audio")
            import numpy as np
            sf.write(str(out), np.concatenate(chunks), 24000)
    return out

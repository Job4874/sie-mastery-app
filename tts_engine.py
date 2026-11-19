"""
GPU TTS engine for SIE Mastery.

Kokoro-82M on CUDA (CPU fallback), voice af_heart by default.

Every clip is cached on disk as tts_cache/<sha256(text|voice|engine)>.wav
so the same line is synthesized exactly once.
"""
import hashlib, threading
from pathlib import Path

CACHE = Path(__file__).parent / "tts_cache"
CACHE.mkdir(exist_ok=True)
ENGINE = "kokoro"
_lock = threading.Lock()
_pipeline = None

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

def synthesize(text: str, voice: str = "af_heart") -> Path:
    """Return cached wav path, generating it on GPU only if missing."""
    out = cache_path(text, voice)
    if out.exists() and out.stat().st_size > 1000:
        return out
    with _lock:
        if out.exists() and out.stat().st_size > 1000:
            return out
        import soundfile as sf
        pipe = _load_kokoro()
        chunks = [audio for _, _, audio in pipe(text, voice=voice, speed=1.0)]
        if not chunks:
            raise RuntimeError("Kokoro produced no audio")
        import numpy as np
        sf.write(str(out), np.concatenate(chunks), 24000)
    return out

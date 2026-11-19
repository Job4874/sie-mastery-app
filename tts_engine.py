"""TTS engine for SIE Mastery.

Default: kokoro-onnx (int8, ~92 MB, CPU-friendly, no torch needed).
Optional: Kokoro via torch, or XTTS v2 (TTS_ENGINE=xtts).

Every clip is cached on disk as tts_cache/<sha256(backend|voice|text)>.wav so the
same line is synthesized exactly once. Writes are atomic: a crash cannot leave a
partial WAV that the server would happily serve.
"""
import hashlib
import os
import re
import threading
from pathlib import Path

from security import valid_text, valid_voice

ROOT = Path(__file__).parent
CACHE = ROOT / "tts_cache"
CACHE.mkdir(parents=True, exist_ok=True)
MODELS = ROOT / "models"
ENGINE = os.environ.get("TTS_ENGINE", "auto").lower()
CACHE_MAX = max(20, int(os.environ.get("TTS_CACHE_MAX", "400")))
_lock = threading.Lock()
_pipeline = None
_onnx = None
_xtts = None


def _onnx_files():
    """Return (model, voices) when the small ONNX voice pack is present."""
    env_model = os.environ.get("KOKORO_MODEL")
    candidates = [Path(env_model)] if env_model else []
    candidates += [MODELS / "kokoro-v1.0.onnx", MODELS / "kokoro-v1.0.int8.onnx"]
    model = next((p for p in candidates
                  if p.is_file() and p.stat().st_size > 1_000_000), None)
    voices = Path(os.environ.get("KOKORO_VOICES", MODELS / "voices-v1.0.bin"))
    if model and voices.is_file() and voices.stat().st_size > 100_000:
        return model, voices
    return None


def backend():
    if ENGINE == "xtts":
        return "xtts"
    if ENGINE in ("onnx", "kokoro-onnx"):
        return "onnx"
    if ENGINE in ("kokoro", "torch"):
        return "kokoro"
    if _onnx_files():
        return "onnx"
    try:
        import kokoro  # noqa: F401
        return "kokoro"
    except Exception:
        return "onnx"


def engine_name():
    kind = backend()
    if kind == "onnx":
        files = _onnx_files()
        return "kokoro-onnx:" + (files[0].name if files else "missing-model")
    return kind


def engine_ready() -> bool:
    """Return True when the active TTS backend has its model or runtime ready."""
    kind = backend()
    if kind == "onnx":
        return _onnx_files() is not None
    import importlib.util
    if kind == "xtts":
        return (ROOT / "voices" / "reference.wav").is_file() and importlib.util.find_spec("TTS") is not None
    if kind == "kokoro":
        return importlib.util.find_spec("kokoro") is not None
    return False


def cache_key(text: str, voice: str) -> str:
    return hashlib.sha256(f"{engine_name()}|{voice}|{text}".encode("utf-8")).hexdigest()[:32]


def cache_path(text: str, voice: str) -> Path:
    return CACHE / f"{cache_key(text, voice)}.wav"


def gpu_info():
    try:
        import torch
        if torch.cuda.is_available():
            return {"cuda": True, "device": torch.cuda.get_device_name(0),
                    "vram_gb": round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1)}
    except Exception:
        pass
    return {"cuda": False}


def _load_onnx(files):
    global _onnx
    if _onnx is None:
        from kokoro_onnx import Kokoro
        _onnx = Kokoro(str(files[0]), str(files[1]))
    return _onnx


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


def _prune_cache():
    try:
        files = sorted(CACHE.glob("*.wav"), key=lambda p: p.stat().st_mtime)
        for old in files[:-CACHE_MAX]:
            old.unlink(missing_ok=True)
    except OSError:
        pass


def _split(text, limit=600):
    parts = re.split(r"(?<=[.!?])\s+", text)
    buf = ""
    for part in parts:
        if not part:
            continue
        if buf and len(buf) + len(part) + 1 > limit:
            yield buf
            buf = part
        else:
            buf = f"{buf} {part}".strip()
    if buf:
        yield buf


def _write_onnx(text, voice, tmp, files):
    import numpy as np
    import soundfile as sf
    kokoro = _load_onnx(files)
    pieces, rate = [], 24000
    for chunk in _split(text):
        audio, rate = kokoro.create(chunk, voice=voice, speed=1.0, lang="en-us")
        pieces.append(np.asarray(audio, dtype=np.float32))
        pieces.append(np.zeros(int(rate * 0.12), dtype=np.float32))
    sf.write(str(tmp), np.concatenate(pieces[:-1]), rate,
             format="WAV", subtype="PCM_16")


def synthesize(text: str, voice: str = "af_heart") -> Path:
    """Return a cached WAV path, generating it atomically only if missing."""
    clean = valid_text(text)
    if clean is None or not valid_voice(voice):
        raise ValueError("invalid TTS request")
    text = clean
    kind = backend()
    onnx = _onnx_files() if kind == "onnx" else None
    if kind == "onnx" and onnx is None:
        raise RuntimeError("kokoro-onnx model missing in models/")
    out = cache_path(text, voice)
    if out.is_file() and out.stat().st_size > 1000:
        return out
    tmp = out.with_name(out.stem + ".tmp.wav")
    with _lock:
        if out.is_file() and out.stat().st_size > 1000:
            return out
        try:
            if kind == "onnx":
                _write_onnx(text, voice, tmp, onnx)
            elif kind == "xtts":
                ref = ROOT / "voices" / "reference.wav"
                if not ref.is_file():
                    raise RuntimeError("XTTS needs voices/reference.wav")
                _load_xtts().tts_to_file(text=text, speaker_wav=str(ref),
                                         language="en", file_path=str(tmp))
            else:
                import numpy as np
                import soundfile as sf
                chunks = [a for _, _, a in _load_kokoro()(text, voice=voice, speed=1.0)]
                if not chunks:
                    raise RuntimeError("Kokoro produced no audio")
                sf.write(str(tmp), np.concatenate(chunks), 24000,
                         format="WAV", subtype="PCM_16")
            if not tmp.is_file() or tmp.stat().st_size <= 1000:
                raise RuntimeError("TTS produced no usable audio")
            os.replace(tmp, out)
        finally:
            tmp.unlink(missing_ok=True)
    _prune_cache()
    return out

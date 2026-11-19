"""Security primitives shared by the SIE Mastery localhost server.

No third-party dependencies. Everything here is deliberately small and testable.
"""
import math
import re
import threading
import time
from collections import defaultdict
from pathlib import Path

MAX_BODY = 64 * 1024
MAX_TEXT = 1200
CLIP_ID_RE = re.compile(r"^[a-f0-9]{32}$")
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u200b-\u200d\ufeff]")

# Kokoro voices that are safe to expose through /api/tts.
VOICES = frozenset({"af_heart", "af_bella", "am_michael", "bf_emma"})


class RateLimiter:
    """Thread-safe sliding-window limiter with periodic stale-key pruning."""

    def __init__(self, limit=30, window=60.0):
        self.limit = limit
        self.window = window
        self._hits = defaultdict(list)
        self._lock = threading.Lock()
        self._last_prune = 0.0

    def allow(self, key):
        now = time.monotonic()
        cutoff = now - self.window
        with self._lock:
            if now - self._last_prune > self.window:
                for k in list(self._hits):
                    self._hits[k] = [t for t in self._hits[k] if t > cutoff]
                    if not self._hits[k]:
                        del self._hits[k]
                self._last_prune = now
            hits = [t for t in self._hits[key] if t > cutoff]
            if len(hits) >= self.limit:
                retry = max(1, math.ceil(self.window - (now - hits[0])))
                self._hits[key] = hits
                return False, retry
            hits.append(now)
            self._hits[key] = hits
            return True, 0


def valid_text(text):
    """Return normalized TTS text, or None when the payload is not usable.

    Punctuation is intentionally allowed. This value is JSON-encoded in transport,
    hashed into a cache filename, and read by a speech model; it is never HTML.
    """
    if not isinstance(text, str):
        return None
    text = text.strip()
    if not text:
        return None
    if CONTROL_RE.search(text):
        return None
    text = " ".join(text.split())[:MAX_TEXT].strip()
    return text or None


def valid_voice(voice):
    return isinstance(voice, str) and voice in VOICES


def clip_path(cache_dir: Path, clip_id: str):
    """Resolve a 32-hex clip id inside cache_dir, rejecting anything else."""
    if not CLIP_ID_RE.fullmatch(clip_id or ""):
        return None
    root = cache_dir.resolve()
    path = (root / f"{clip_id}.wav").resolve()
    try:
        path.relative_to(root)
    except ValueError:
        return None
    return path

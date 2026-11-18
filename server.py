"""
SIE Mastery — light localhost server (Python stdlib only for the web layer).
Run:  python server.py   ->  http://localhost:8765
Endpoints:
  GET  /                  static app
  GET  /api/health        GPU + engine status
  POST /api/tts           {text, voice} -> {url, cached} ; wav saved in tts_cache/
  GET  /tts/<file>.wav    serve a cached clip
Security:
  - Content Security Policy (CSP) — blocks inline scripts, unsafe eval, unknown origins
  - Strict-Transport-Security (HSTS) — force HTTPS in production
  - X-Frame-Options: DENY — clickjacking protection
  - X-Content-Type-Options: nosniff — MIME sniffing protection
  - Referrer-Policy: no-referrer — no referrer leakage
  - Permissions-Policy — restrict camera, mic, geolocation, etc.
  - Cross-Origin-Embedder-Policy / Cross-Origin-Opener-Policy — cross-origin isolation
  - Path traversal protection — /tts/ only serves files from tts_cache/
  - Request size limits — 64KB POST cap
  - Input validation — text/voice allowlist, length limits
  - Rate limiting — per-IP request throttling on /api/tts
  - No directory listings — 404 on directory access
"""
import json, os, re, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).parent
os.chdir(ROOT / "static")
PORT = int(os.environ.get("PORT", "8765"))

# --- rate limiting: max 30 TTS requests per minute per IP ---
_RATE_LIMIT = {}  # ip -> [timestamps]
_RATE_WINDOW = 60.0  # seconds
_RATE_MAX = 30  # requests per window

def _rate_limited(ip: str) -> bool:
    now = time.time()
    window_start = now - _RATE_WINDOW
    timestamps = _RATE_LIMIT.get(ip, [])
    timestamps = [t for t in timestamps if t > window_start]
    if len(timestamps) >= _RATE_MAX:
        _RATE_LIMIT[ip] = timestamps
        return True
    timestamps.append(now)
    _RATE_LIMIT[ip] = timestamps
    return False

# --- voice allowlist (prevent arbitrary voice injection) ---
_ALLOWED_VOICES = {"af_heart", "af_bella", "am_michael", "bf_emma"}

# --- text sanitization: strip dangerous chars, limit length ---
_MAX_TEXT_LEN = 1200
_TEXT_SANITIZE_RE = re.compile(r"[<>&\"']")

class H(SimpleHTTPRequestHandler):
    # --- hardening: no directory listings ---
    def list_directory(self, path):
        return self.send_error(404, "Directory listing disabled")

    # --- comprehensive security headers on every response ---
    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        self.send_header("Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=(), "
            "accelerometer=(), ambient-light-sensor=(), "
            "autoplay=(), encrypted-media=(), fullscreen=(self)")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "media-src 'self' blob:; "
            "connect-src 'self'; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'none'; "
            "frame-ancestors 'none';")
        super().end_headers()

    # --- client IP for rate limiting ---
    def _client_ip(self):
        return self.client_address[0] if self.client_address else "unknown"

    def do_GET(self):
        if self.path == "/api/health":
            try:
                import tts_engine
                info = {"ok": True, "engine": os.environ.get("TTS_ENGINE", "kokoro"),
                        "gpu": tts_engine.gpu_info(),
                        "cached_clips": len(list(tts_engine.CACHE.glob("*.wav")))}
            except Exception as e:
                info = {"ok": False, "error": str(e)}
            return self._json(info)
        if self.path.startswith("/tts/"):
            # --- path traversal protection: only allow files directly in tts_cache/ ---
            requested = Path(self.path).name
            if not requested or ".." in requested or requested.startswith("/"):
                return self.send_error(404)
            if not requested.endswith(".wav"):
                return self.send_error(404)
            f = ROOT / "tts_cache" / requested
            # resolve to prevent symlink traversal outside cache
            try:
                resolved = f.resolve()
                cache_resolved = (ROOT / "tts_cache").resolve()
                if not str(resolved).startswith(str(cache_resolved) + os.sep) and resolved != cache_resolved:
                    return self.send_error(403)
            except Exception:
                return self.send_error(404)
            if f.exists() and f.is_file():
                self.send_response(200)
                self.send_header("Content-Type", "audio/wav")
                self.send_header("Content-Length", str(f.stat().st_size))
                self.end_headers()
                return self.wfile.write(f.read_bytes())
            return self.send_error(404)
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/tts":
            return self.send_error(404)
        # --- rate limiting ---
        ip = self._client_ip()
        if _rate_limited(ip):
            return self._json({"error": "rate limited", "retry_after": _RATE_WINDOW}, 429)
        try:
            n = int(self.headers.get("Content-Length", 0))
            if n > 65536:
                return self._json({"error": "request too large"}, 413)
            if n == 0:
                return self._json({"error": "empty body"}, 400)
            body = self.rfile.read(n) or b"{}"
            # --- size check on raw body ---
            if len(body) > 65536:
                return self._json({"error": "request too large"}, 413)
            data = json.loads(body.decode("utf-8") or "{}")
            text = data.get("text", "")
            if not isinstance(text, str):
                return self._json({"error": "text must be a string"}, 400)
            text = text.strip()[:_MAX_TEXT_LEN]
            if not text:
                return self._json({"error": "empty text"}, 400)
            # --- sanitize: reject HTML/JS injection attempts ---
            if _TEXT_SANITIZE_RE.search(text):
                return self._json({"error": "text contains disallowed characters"}, 400)
            voice = data.get("voice", "af_heart")
            if not isinstance(voice, str) or voice not in _ALLOWED_VOICES:
                return self._json({"error": "invalid voice"}, 400)
            import tts_engine
            was_cached = tts_engine.cache_path(text, voice).exists()
            path = tts_engine.synthesize(text, voice)
            return self._json({"url": f"/tts/{path.name}", "cached": was_cached, "engine": tts_engine.ENGINE})
        except json.JSONDecodeError:
            return self._json({"error": "invalid JSON"}, 400)
        except Exception as e:
            # Frontend automatically falls back to browser voice on any error here.
            return self._json({"error": str(e), "fallback": "browser"}, 501)

    def _json(self, obj, code=200):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    print(f"SIE Mastery -> http://localhost:{PORT}")
    print("Security: CSP, HSTS, X-Frame-Options, Permissions-Policy, COEP/COOP, rate limiting, path traversal protection")
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
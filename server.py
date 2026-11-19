"""
SIE Mastery - localhost server (Python stdlib only for the web layer).

GET  /                 static app
GET  /api/health       GPU + engine status
POST /api/tts          {"text","voice"} -> {"url","cached","engine"}
GET  /tts/<32hex>.wav  immutable cached clip

Security baseline: loopback bind, Host allowlist, same-origin mutation checks,
JSON-only POSTs, 64KB body cap, TTS voice allowlist, rate limiting, exact clip-id
routing, no directory listings, no inline-error leakage, and atomic cache writes.
"""
import json
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from security import MAX_BODY, RateLimiter, clip_path, valid_text, valid_voice

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
TTS_DIR = ROOT / "tts_cache"

PORT = int(os.environ.get("PORT", "8765"))
BIND = "127.0.0.1"
HOSTS = {f"127.0.0.1:{PORT}", f"localhost:{PORT}", "127.0.0.1", "localhost"}
ORIGINS = {f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}"}
LIMITER = RateLimiter(limit=30, window=60.0)
CLIP_RE = re.compile(r"^/tts/([a-f0-9]{32})\.wav$")
RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$", re.IGNORECASE)


def _parse_byte_range(range_hdr: str, total: int):
    """Parse a single RFC 9110 byte range against total size, or return None."""
    match = RANGE_RE.fullmatch(range_hdr)
    if not match:
        return None
    start_s, end_s = match.groups()
    if not start_s and not end_s:
        return None
    if not start_s:
        suffix = int(end_s)
        if suffix <= 0 or total <= 0:
            return None
        return max(0, total - suffix), total - 1
    start = int(start_s)
    end = total - 1 if not end_s else min(int(end_s), total - 1)
    if start >= total or start > end:
        return None
    return start, end


AUDIO_TYPES = {".wav": "audio/wav", ".mp3": "audio/mpeg"}


def _resolve_audio_file(req_path: str):
    """Resolve /audio/<path>.(wav|mp3) safely inside STATIC / 'audio', or return (None, None)."""
    rel = req_path[len("/audio/"):]
    if not rel or "\x00" in rel or "\\" in rel or rel.startswith("/"):
        return None, None
    audio_root = (STATIC / "audio").resolve()
    try:
        target = (audio_root / rel).resolve()
        target.relative_to(audio_root)
    except (ValueError, OSError):
        return None, None
    ctype = AUDIO_TYPES.get(target.suffix.lower())
    if target == audio_root or not ctype:
        return None, None
    return target, ctype


class Handler(SimpleHTTPRequestHandler):
    server_version = "SIE-Mastery"
    sys_version = ""
    protocol_version = "HTTP/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC), **kwargs)

    def translate_path(self, path):
        candidate = super().translate_path(path)
        static_root = STATIC.resolve()
        try:
            resolved = Path(candidate).resolve()
            resolved.relative_to(static_root)
        except (ValueError, OSError):
            return str(static_root / "__nonexistent_blocked_path__")
        return str(resolved)

    def list_directory(self, path):
        return self.send_error(404, "Directory listing disabled")

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=(), usb=(), "
            "magnetometer=(), gyroscope=(), accelerometer=(), autoplay=(self), "
            "fullscreen=(self)")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        self.send_header("X-Permitted-Cross-Domain-Policies", "none")
        self.send_header("Content-Security-Policy",
            "default-src 'self'; script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
            "media-src 'self' blob:; connect-src 'self'; font-src 'self'; "
            "object-src 'none'; base-uri 'self'; form-action 'none'; "
            "frame-ancestors 'none';")
        if os.environ.get("SIE_HTTPS") == "1":
            self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        super().end_headers()

    def _host_ok(self):
        hosts = self.headers.get_all("Host") or []
        if len(hosts) != 1:
            return False
        host = hosts[0].strip().lower()
        return bool(host) and host in HOSTS

    def _origin_ok(self):
        origin = (self.headers.get("Origin") or "").strip().lower()
        if origin and origin not in ORIGINS:
            return False
        site = (self.headers.get("Sec-Fetch-Site") or "").strip().lower()
        return site not in {"cross-site", "same-site"}

    def _write_body(self, data: bytes):
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _json(self, obj, code=200, extra=None, send_body=True):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if send_body:
            self._write_body(data)

    def _health_payload(self):
        try:
            import tts_engine
            gpu = tts_engine.gpu_info()
            return {"ok": True, "engine": tts_engine.engine_name(),
                    "ready": tts_engine.engine_ready(),
                    "gpu": gpu, "cached_clips": len(list(TTS_DIR.glob("*.wav")))}
        except Exception as exc:
            print(f"health error: {exc}", file=sys.stderr)
            return {"ok": False, "error": "health unavailable"}

    def _serve_audio_file(self, target: Path, content_type: str, cache_control: str, send_body: bool = True):
        """Serve a WAV or MP3 audio file with full RFC 9110 single-byte-range support."""
        total = target.stat().st_size
        range_hdr = (self.headers.get("Range") or "").strip()
        if not range_hdr:
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(total))
            self.send_header("Cache-Control", cache_control)
            self.end_headers()
            if send_body:
                self._write_body(target.read_bytes())
            return

        bounds = _parse_byte_range(range_hdr, total)
        if bounds is None:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{total}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        start, end = bounds
        self.send_response(206)
        self.send_header("Content-Type", content_type)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{total}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Cache-Control", cache_control)
        self.end_headers()
        if send_body:
            with target.open("rb") as fh:
                fh.seek(start)
                chunk = fh.read(end - start + 1)
            self._write_body(chunk)

    def do_HEAD(self):
        if not self._host_ok():
            return self.send_error(421, "Misdirected request")
        req_path = unquote(urlsplit(self.path).path)
        if "\\" in self.path or "\\" in req_path:
            return self.send_error(404)
        if req_path == "/api/health":
            return self._json(self._health_payload(), send_body=False)
        match = CLIP_RE.fullmatch(req_path)
        if match:
            target = clip_path(TTS_DIR, match.group(1))
            if target and target.is_file():
                return self._serve_audio_file(target, "audio/wav", "public, max-age=31536000, immutable", send_body=False)
            return self.send_error(404)
        if req_path.startswith("/tts/"):
            return self.send_error(404)
        if req_path.startswith("/audio/") and req_path.lower().endswith((".wav", ".mp3")):
            target, ctype = _resolve_audio_file(req_path)
            if target and target.is_file():
                return self._serve_audio_file(target, ctype, "public, max-age=3600", send_body=False)
            return self.send_error(404)
        translated = Path(self.translate_path(req_path))
        if translated.is_dir() and translated != STATIC.resolve():
            return self.send_error(404)
        return super().do_HEAD()

    def do_GET(self):
        if not self._host_ok():
            return self.send_error(421, "Misdirected request")
        req_path = unquote(urlsplit(self.path).path)
        if "\\" in self.path or "\\" in req_path:
            return self.send_error(404)
        if req_path == "/api/health":
            return self._json(self._health_payload())
        match = CLIP_RE.fullmatch(req_path)
        if match:
            target = clip_path(TTS_DIR, match.group(1))
            if target and target.is_file():
                return self._serve_audio_file(target, "audio/wav", "public, max-age=31536000, immutable")
            return self.send_error(404)
        if req_path.startswith("/tts/"):
            return self.send_error(404)
        if req_path.startswith("/audio/") and req_path.lower().endswith((".wav", ".mp3")):
            target, ctype = _resolve_audio_file(req_path)
            if target and target.is_file():
                return self._serve_audio_file(target, ctype, "public, max-age=3600")
            return self.send_error(404)
        translated = Path(self.translate_path(req_path))
        if translated.is_dir() and translated != STATIC.resolve():
            return self.send_error(404)
        return super().do_GET()

    def do_POST(self):
        if not self._host_ok():
            return self.send_error(421, "Misdirected request")
        if self.path != "/api/tts":
            return self.send_error(404)
        if not self._origin_ok():
            return self._json({"error": "origin not allowed"}, 403)
        ctype = (self.headers.get("Content-Type") or "").split(";", 1)[0].strip().lower()
        if ctype != "application/json":
            return self._json({"error": "content-type must be application/json"}, 415)
        allowed, retry = LIMITER.allow(self.client_address[0])
        if not allowed:
            return self._json({"error": "rate limited", "retry_after": retry}, 429,
                              {"Retry-After": str(retry)})
        try:
            raw_len = self.headers.get("Content-Length")
            if raw_len is None:
                return self._json({"error": "content-length required"}, 411)
            n = int(raw_len)
            if n <= 0:
                return self._json({"error": "empty body"}, 400)
            if n > MAX_BODY:
                return self._json({"error": "request too large"}, 413)
            body = self.rfile.read(n)
            data = json.loads(body.decode("utf-8"))
            if not isinstance(data, dict):
                return self._json({"error": "JSON object required"}, 400)
            text = valid_text(data.get("text"))
            if text is None:
                return self._json({"error": "invalid text"}, 400)
            voice = data.get("voice", "af_heart")
            if not valid_voice(voice):
                return self._json({"error": "invalid voice"}, 400)
            import tts_engine
            was_cached = tts_engine.cache_path(text, voice).is_file()
            path = tts_engine.synthesize(text, voice)
            return self._json({"url": f"/tts/{path.name}", "cached": was_cached,
                               "engine": tts_engine.engine_name()})
        except json.JSONDecodeError:
            return self._json({"error": "invalid JSON"}, 400)
        except ValueError:
            return self._json({"error": "invalid request"}, 400)
        except Exception as exc:
            print(f"tts error: {exc}", file=sys.stderr)
            return self._json({"error": "tts unavailable", "fallback": "browser"}, 503)

    def _method_not_allowed(self):
        if not self._host_ok():
            return self.send_error(421, "Misdirected request")
        self.send_response(405)
        self.send_header("Allow", "GET, HEAD, POST")
        self.send_header("Content-Length", "0")
        self.end_headers()

    do_OPTIONS = _method_not_allowed
    do_PUT = _method_not_allowed
    do_DELETE = _method_not_allowed
    do_PATCH = _method_not_allowed
    do_TRACE = _method_not_allowed

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print(f"SIE Mastery -> http://localhost:{PORT}")
    print("Security: loopback bind, Host/Origin checks, JSON-only POST, 64KB cap, "
          "rate limit, exact clip routing, atomic cache")
    ThreadingHTTPServer.allow_reuse_address = True
    ThreadingHTTPServer((BIND, PORT), Handler).serve_forever()

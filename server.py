"""
SIE Mastery — light localhost server (Python stdlib only for the web layer).
Run:  python server.py   ->  http://localhost:8765
Endpoints:
  GET  /                  static app
  GET  /api/health        GPU + engine status
  POST /api/tts           {text, voice} -> {url, cached} ; wav saved in tts_cache/
  GET  /tts/<file>.wav    serve a cached clip
"""
import json, os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).parent
os.chdir(ROOT / "static")
PORT = int(os.environ.get("PORT", "8765"))

class H(SimpleHTTPRequestHandler):
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
            f = ROOT / "tts_cache" / Path(self.path).name
            if f.exists():
                self.send_response(200); self.send_header("Content-Type", "audio/wav")
                self.send_header("Content-Length", str(f.stat().st_size)); self.end_headers()
                return self.wfile.write(f.read_bytes())
            return self.send_error(404)
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/tts":
            return self.send_error(404)
        try:
            n = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(n) or b"{}")
            text = (body.get("text") or "").strip()[:1200]
            voice = body.get("voice") or "af_heart"
            if not text:
                return self._json({"error": "empty text"}, 400)
            import tts_engine
            was_cached = tts_engine.cache_path(text, voice).exists()
            path = tts_engine.synthesize(text, voice)
            return self._json({"url": f"/tts/{path.name}", "cached": was_cached, "engine": tts_engine.ENGINE})
        except Exception as e:
            # Frontend automatically falls back to browser voice on any error here.
            return self._json({"error": str(e), "fallback": "browser"}, 501)

    def _json(self, obj, code=200):
        data = json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data))); self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    print(f"SIE Mastery -> http://localhost:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()

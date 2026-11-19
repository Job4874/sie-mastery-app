"""Unit tests for security.py and a live server security probe (stdlib only).

Run:  python -m unittest discover -s tests -p "test_*.py" -v
"""
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import unittest.mock
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import security  # noqa: E402


class TextValidationTests(unittest.TestCase):
    def test_allows_normal_finance_punctuation(self):
        samples = [
            "The customer's account is frozen",
            "Reg T & margin rules",
            "Price < 5% then > 10%",
            'He said "buy"',
            "Spouse's IRA, PAC's schedule; 50% / 25%.",
        ]
        for sample in samples:
            with self.subTest(sample=sample):
                self.assertEqual(security.valid_text(sample), sample)

    def test_rejects_empty_and_non_strings(self):
        for value in [None, "", "   ", 5, [], {}]:
            with self.subTest(value=value):
                self.assertIsNone(security.valid_text(value))

    def test_rejects_control_characters(self):
        for value in ["a\x00b", "a\x1fb", "a\u200bb", "a\ufeffb"]:
            with self.subTest(value=value):
                self.assertIsNone(security.valid_text(value))

    def test_collapses_whitespace_and_caps_length(self):
        self.assertEqual(security.valid_text("  a\n\t b  "), "a b")
        self.assertEqual(len(security.valid_text("x" * 5000)), security.MAX_TEXT)


class VoiceAndClipTests(unittest.TestCase):
    def test_voice_allowlist(self):
        for voice in ["af_heart", "af_bella", "am_michael", "bf_emma"]:
            self.assertTrue(security.valid_voice(voice))
        for voice in ["am_fenrir", "", None, 1, "../x"]:
            self.assertFalse(security.valid_voice(voice))

    def test_clip_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            good = security.clip_path(base, "a" * 32)
            self.assertEqual(good, (base.resolve() / ("a" * 32 + ".wav")).resolve())
            for bad in ["", "..", "../" + "a" * 32, "a" * 31, "A" * 32,
                        "a" * 32 + ".wav", "a" * 32 + "/../../x"]:
                with self.subTest(bad=bad):
                    self.assertIsNone(security.clip_path(base, bad))


class RateLimiterTests(unittest.TestCase):
    def test_limit_and_retry(self):
        limiter = security.RateLimiter(limit=3, window=60)
        self.assertEqual(limiter.allow("1.2.3.4"), (True, 0))
        self.assertEqual(limiter.allow("1.2.3.4"), (True, 0))
        self.assertEqual(limiter.allow("1.2.3.4"), (True, 0))
        allowed, retry = limiter.allow("1.2.3.4")
        self.assertFalse(allowed)
        self.assertGreaterEqual(retry, 1)
        self.assertTrue(limiter.allow("5.6.7.8")[0])

    def test_retry_after_uses_oldest_hit(self):
        with unittest.mock.patch(
            "security.time.monotonic", side_effect=[100.0, 150.0, 155.0, 156.0]
        ):
            limiter = security.RateLimiter(limit=3, window=60)
            self.assertEqual(limiter.allow("1.2.3.4"), (True, 0))
            self.assertEqual(limiter.allow("1.2.3.4"), (True, 0))
            self.assertEqual(limiter.allow("1.2.3.4"), (True, 0))
            self.assertEqual(limiter.allow("1.2.3.4"), (False, 4))


class ServerImportTests(unittest.TestCase):
    def test_import_server_preserves_cwd(self):
        res = subprocess.run(
            [sys.executable, "-c", "import os, server; print(os.getcwd())"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        self.assertEqual(res.stdout.strip(), str(ROOT))


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


class ServerProbeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = free_port()
        env = dict(os.environ, PORT=str(cls.port))
        cls.proc = subprocess.Popen(
            [sys.executable, "server.py"], cwd=ROOT, env=env,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        cls.base = f"http://127.0.0.1:{cls.port}"
        deadline = time.time() + 15
        while time.time() < deadline:
            try:
                with socket.create_connection(("127.0.0.1", cls.port), 0.3):
                    return
            except OSError:
                time.sleep(0.1)
        raise RuntimeError("server did not start")

    @classmethod
    def tearDownClass(cls):
        cls.proc.terminate()
        try:
            cls.proc.wait(5)
        except subprocess.TimeoutExpired:
            cls.proc.kill()

    def request_with_headers(self, path, method="GET", body=None, headers=None):
        req = urllib.request.Request(self.base + path, data=body, method=method,
                                     headers=headers or {})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status, resp.headers, resp.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.headers, exc.read()

    def request(self, path, method="GET", body=None, headers=None):
        status, _, body = self.request_with_headers(path, method=method, body=body, headers=headers)
        return status, body

    def test_app_and_health(self):
        status, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn(b"SIE", body)
        status, body = self.request("/api/health")
        self.assertEqual(status, 200)
        self.assertIn("ok", json.loads(body))

    def test_health_ready_flag(self):
        status, body = self.request("/api/health")
        self.assertEqual(status, 200)
        payload = json.loads(body)
        self.assertIn("ready", payload)
        self.assertIsInstance(payload["ready"], bool)

    def test_wav_range_requests(self):
        welcome_bytes = (ROOT / "static" / "audio" / "welcome.wav").read_bytes()
        total = len(welcome_bytes)

        status, hdrs, body = self.request_with_headers("/audio/welcome.wav")
        self.assertEqual(status, 200)
        self.assertEqual(hdrs.get("Accept-Ranges"), "bytes")
        self.assertEqual(body, welcome_bytes)

        status, hdrs, body = self.request_with_headers(
            "/audio/welcome.wav", headers={"Range": "bytes=0-99"}
        )
        self.assertEqual(status, 206)
        self.assertEqual(hdrs.get("Accept-Ranges"), "bytes")
        self.assertTrue((hdrs.get("Content-Range") or "").startswith("bytes 0-99/"))
        self.assertEqual(hdrs.get("Content-Range"), f"bytes 0-99/{total}")
        self.assertEqual(body, welcome_bytes[:100])

        status, hdrs, body = self.request_with_headers(
            "/audio/welcome.wav", headers={"Range": "bytes=-50"}
        )
        self.assertEqual(status, 206)
        self.assertEqual(hdrs.get("Content-Range"), f"bytes {total - 50}-{total - 1}/{total}")
        self.assertEqual(body, welcome_bytes[-50:])

        for bad_range in ["bytes=999999999-", "bytes=-", "bytes=-0", "bytes=50-10", "items=0-5"]:
            with self.subTest(bad_range=bad_range):
                status, hdrs, _ = self.request_with_headers(
                    "/audio/welcome.wav", headers={"Range": bad_range}
                )
                self.assertEqual(status, 416)
                self.assertEqual(hdrs.get("Content-Range"), f"bytes */{total}")

    def test_rate_limit(self):
        body = json.dumps({"text": "rate limit check", "voice": "af_heart"}).encode()
        headers = {"Content-Type": "application/json"}
        codes = [self.request("/api/tts", "POST", body, headers)[0] for _ in range(35)]
        self.assertIn(429, codes, "limiter never engaged: " + repr(codes))

    def test_traversal_blocked(self):
        for path in ["/../server.py", "/%2e%2e/server.py", "/static/../server.py",
                     "/tts/../server.py", "/tts/" + "a" * 32 + "/../../server.py",
                     "/audio/../tts_cache/missing.wav", "/audio/%2e%2e/tts_cache/missing.wav",
                     "/audio/missing.wav"]:
            with self.subTest(path=path):
                status, _ = self.request(path)
                self.assertIn(status, (404, 400, 421))

    def test_host_allowlist(self):
        status, _ = self.request("/", headers={"Host": "evil.example"})
        self.assertEqual(status, 421)
        status, _ = self.request("/api/tts", "POST", b"{}", {
            "Content-Type": "application/json", "Host": "evil.example"})
        self.assertEqual(status, 421)

    def test_post_requires_json_and_same_origin(self):
        url = "/api/tts"
        body = json.dumps({"text": "The customer's order", "voice": "af_heart"}).encode()
        status, _ = self.request(url, "POST", body, {"Content-Type": "text/plain"})
        self.assertEqual(status, 415)
        status, _ = self.request(url, "POST", body, {
            "Content-Type": "application/json", "Origin": "https://evil.example"})
        self.assertEqual(status, 403)
        status, _ = self.request(url, "POST", body, {
            "Content-Type": "application/json", "Sec-Fetch-Site": "cross-site"})
        self.assertEqual(status, 403)

    def test_post_validation(self):
        def post(payload, headers=None):
            body = json.dumps(payload).encode()
            hdrs = {"Content-Type": "application/json"}
            hdrs.update(headers or {})
            return self.request("/api/tts", "POST", body, hdrs)

        status, _ = post({"text": "x" * (security.MAX_BODY + 1), "voice": "af_heart"})
        self.assertEqual(status, 413)
        status, body = post({"text": "hello", "voice": "am_fenrir"})
        self.assertEqual(status, 400)
        self.assertIn(b"voice", body)
        status, body = post({"text": "\x00bad", "voice": "af_heart"})
        self.assertEqual(status, 400)
        self.assertIn(b"text", body)
        status, body = post({})
        self.assertEqual(status, 400)
        self.assertNotIn(b"Traceback", body)
        self.assertNotIn(b"ModuleNotFound", body)


if __name__ == "__main__":
    unittest.main(verbosity=2)

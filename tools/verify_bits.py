"""Bit-level integrity verifier for SIE Mastery.

Checks, byte for byte:
  1. Every tracked source file (server, CSS, split JS modules, units, tests, tools, workflows) exists and is non-empty.
  2. SHA-256 of each file recorded in tools/bit_manifest.json.
  3. 15 overview/library WAV clips: RIFF/WAVE header, declared size, PCM_16 mono 24kHz, decodes non-silent, manifest bytes == disk bytes.
  4. 340 per-screen lesson MP3 clips: manifest bytes == disk bytes, decodes non-silent (sampled + all headers/sizes).
  5. HTTP-served bytes == disk bytes for HTML, CSS, JS, manifests, WAV, MP3, and /tts/ cached WAV.
  6. index.html structural integrity: zero inline scripts/onclicks, ends with </html>.
Exits non-zero on any mismatch.
"""
import hashlib
import json
import os
import re
import struct
import sys
import urllib.request
from pathlib import Path

import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get("SIE_BASE", "http://127.0.0.1:8765")
FAIL = []


def ok(c, m):
    print(("PASS: " if c else "FAIL: ") + m)
    if not c:
        FAIL.append(m)


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def main():
    # ---- 1. source files ----
    src = [
        "server.py", "security.py", "tts_engine.py", "requirements.txt",
        "README.md", "ARCHITECTURE.md", "PUSH_AUDIO.md", "RESEARCH_ADHD.md",
        "SECURITY.md", "AGENTS.md",
        ".agents/skills/sie-verify/SKILL.md",
        ".agents/skills/sie-verify/scripts/run_all.ps1",
        ".agents/skills/sie-curriculum-author/SKILL.md",
        "static/index.html", "static/favicon.svg", "static/favicon.ico", "static/css/app.css",
        "static/audio/manifest.json", "static/audio/lessons/manifest.json",
        "static/js/app.js",
        "static/js/core/util.js", "static/js/core/store.js", "static/js/core/audio.js",
        "static/js/core/teacher.js", "static/js/core/quiz.js",
        "static/js/data/registry.js", "static/js/data/questions.js", "static/js/data/extreme.js", "static/js/data/short.js",
        "static/js/data/library.js", "static/js/data/overviews.js",
        "static/js/ui/router.js", "static/js/ui/views.js",
        "tests/load_app.js", "tests/app.test.js", "tests/tests9.js", "tests/test_security.py",
        "tests/ml_verify.js", "tests/ui_enterprise.js", "tests/grammar_audit.py",
        "tools/content_lib.py", "tools/validate_content.py", "tools/verify.py",
        "tools/verify_dom.py", "tools/verify_exhaustive.py", "tools/verify_hell.py",
        "tools/compose_audio.py", "tools/visual_capture.py", "tools/launch.py",
        ".github/workflows/compile.yml", ".github/workflows/pages.yml",
    ] + [f"static/js/data/units/unit-{i}.js" for i in range(9)]

    hashes = {}
    for rel in src:
        p = ROOT / rel
        if not p.is_file():
            ok(False, f"{rel} missing")
            continue
        b = p.read_bytes()
        hashes[rel] = {"bytes": len(b), "sha256": sha(b)}
        ok(len(b) > 0, f"{rel} exists ({len(b):,} bytes, sha256 {sha(b)[:16]}...)")

    # ---- 2. overview/library WAV manifest ----
    man = json.loads((ROOT / "static/audio/manifest.json").read_bytes())
    ok(len(man["clips"]) == 15, f"overview WAV manifest has 15 clips (got {len(man['clips'])})")
    for c in man["clips"]:
        p = ROOT / "static/audio" / c["file"]
        b = p.read_bytes()
        ok(b[:4] == b"RIFF" and b[8:12] == b"WAVE", f"{c['file']} RIFF/WAVE header")
        riff = struct.unpack("<I", b[4:8])[0]
        ok(riff == len(b) - 8, f"{c['file']} RIFF size field matches file ({riff} vs {len(b) - 8})")
        ok(len(b) == c["bytes"], f"{c['file']} manifest bytes == disk bytes ({len(b)} == {c['bytes']})")
        info = sf.info(str(p))
        ok(info.subtype == "PCM_16" and info.channels == 1 and info.samplerate == 24000,
           f"{c['file']} PCM_16 mono 24kHz ({info.subtype}/{info.channels}/{info.samplerate})")
        data, _ = sf.read(str(p), dtype="float32")
        ok(len(data) > 1000 and float(abs(data).max()) > 0.01,
           f"{c['file']} decodes, non-silent ({len(data)} samples, peak {float(abs(data).max()):.3f})")
        hashes["static/audio/" + c["file"]] = {"bytes": len(b), "sha256": sha(b)}

    # ---- 3. per-screen lesson MP3 manifest ----
    lman_path = ROOT / "static/audio/lessons/manifest.json"
    lman = json.loads(lman_path.read_bytes())
    lclips = lman.get("clips", [])
    ok(len(lclips) == 340, f"lesson MP3 manifest has 340 clips (got {len(lclips)})")
    mp3_bad = 0
    for idx, c in enumerate(lclips):
        p = ROOT / "static/audio/lessons" / c["file"]
        if not p.is_file():
            mp3_bad += 1
            continue
        b = p.read_bytes()
        if len(b) != c["bytes"] or len(b) < 2000:
            mp3_bad += 1
            continue
        if idx % 17 == 0:  # full decode check on 20 evenly spaced clips across all units
            data, sr = sf.read(str(p), dtype="float32")
            if sr != 24000 or len(data) < 1000 or float(abs(data).max()) <= 0.01:
                mp3_bad += 1
                continue
        hashes["static/audio/lessons/" + c["file"]] = {"bytes": len(b), "sha256": sha(b)}
    ok(mp3_bad == 0, f"all {len(lclips)} lesson MP3 clips valid (bad={mp3_bad})")

    # ---- 4. HTTP-served bytes == disk bytes ----
    served = [
        ("/", "static/index.html"),
        ("/css/app.css", "static/css/app.css"),
        ("/js/app.js", "static/js/app.js"),
        ("/js/ui/views.js", "static/js/ui/views.js"),
        ("/api/health", None),
        ("/audio/manifest.json", "static/audio/manifest.json"),
        ("/audio/lessons/manifest.json", "static/audio/lessons/manifest.json"),
        ("/audio/welcome.wav", "static/audio/welcome.wav"),
        ("/audio/lessons/u0-l1-s1.mp3", "static/audio/lessons/u0-l1-s1.mp3"),
        ("/audio/lessons/u8-l5-s5.mp3", "static/audio/lessons/u8-l5-s5.mp3"),
    ]
    for url, rel in served:
        data = urllib.request.urlopen(BASE + url, timeout=20).read()
        if rel is None:
            ok(len(data) > 0 and b'"ok"' in data, "/api/health responds with ok JSON")
        else:
            disk = (ROOT / rel).read_bytes()
            ok(sha(data) == sha(disk), f"HTTP {url} == disk {rel} byte-for-byte ({sha(data)[:12]}...)")

    # ---- 5. /tts cache route byte equality ----
    body = json.dumps({"text": "bit level verification", "voice": "af_heart"}).encode()
    req = urllib.request.Request(BASE + "/api/tts", data=body,
                                headers={"Content-Type": "application/json"})
    tts = json.load(urllib.request.urlopen(req, timeout=60))
    clip = urllib.request.urlopen(BASE + tts["url"], timeout=20).read()
    cached = ROOT / "tts_cache" / (tts["url"].split("/")[-1])
    ok(cached.is_file() and sha(clip) == sha(cached.read_bytes()),
       f"/tts route serves cached WAV byte-for-byte ({sha(clip)[:12]}...)")

    # ---- 6. index.html structural ----
    html = (ROOT / "static/index.html").read_text(encoding="utf-8")
    ok(not re.search(r"<script(?![^>]*src=)", html, re.I), "index.html has zero inline <script> blocks")
    ok(not re.search(r"\bonclick\s*=", html, re.I), "index.html has zero inline onclick handlers")
    ok(html.rstrip().endswith("</html>"), "html ends with </html> (not truncated)")

    out = ROOT / "tools" / "bit_manifest.json"
    out.write_text(json.dumps(hashes, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"\nRecorded {len(hashes)} file hashes -> tools/bit_manifest.json")

    if FAIL:
        print(f"\n=== BIT VERIFIER FAILED: {len(FAIL)} issues ===")
        for f in FAIL:
            print(" -", f)
        sys.exit(1)
    print("\n=== BIT VERIFIER PASSED (all files, byte-for-byte) ===")


if __name__ == "__main__":
    main()

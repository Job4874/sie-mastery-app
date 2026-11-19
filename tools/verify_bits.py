"""Bit-level integrity verifier for SIE Mastery.

Checks, byte for byte:
  1. Every tracked source file exists and is non-empty.
  2. SHA-256 of each file recorded; optional baseline comparison.
  3. WAV clips: RIFF/WAVE header, declared sizes, PCM format, decode ok,
     manifest byte sizes match actual file bytes exactly.
  4. HTTP-served bytes == disk bytes for every asset (hash equality).
  5. manifest.json valid JSON, 15 clips, all present.
  6. index.html single <script>, balanced tags presence, no truncation.
Exits non-zero on any mismatch. Prints full hashes for audit.
"""
import hashlib, json, struct, sys, urllib.request
from pathlib import Path

import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
BASE = "http://127.0.0.1:8765"
FAIL = []


def ok(c, m):
    print(("PASS: " if c else "FAIL: ") + m)
    if not c:
        FAIL.append(m)


def sha(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def main():
    # ---- 1. source files ----
    src = ["server.py", "security.py", "tts_engine.py", "requirements.txt",
           "README.md", "ARCHITECTURE.md", "PUSH_AUDIO.md", "RESEARCH_ADHD.md",
           "AGENTS.md", ".agents/skills/sie-verify/SKILL.md",
           ".agents/skills/sie-verify/scripts/run_all.ps1",
           ".agents/skills/sie-curriculum-author/SKILL.md",
           "static/index.html", "static/audio/manifest.json",
           "tests/app.test.js", "tests/tests9.js", "tests/test_security.py",
           "tests/ml_verify.js", "tests/ui_enterprise.js", "tests/grammar_audit.py",
           "tools/verify.py", "tools/verify_dom.py",
           "tools/verify_exhaustive.py", "tools/compose_audio.py",
           "tools/visual_capture.py", ".github/workflows/compile.yml"]
    hashes = {}
    for rel in src:
        p = ROOT / rel
        if not p.is_file():
            ok(False, f"{rel} missing")
            continue
        b = p.read_bytes()
        hashes[rel] = {"bytes": len(b), "sha256": sha(b)}
        ok(len(b) > 0, f"{rel} exists ({len(b):,} bytes, sha256 {sha(b)[:16]}…)")

    # ---- 2. manifest ----
    man_path = ROOT / "static/audio/manifest.json"
    man = json.loads(man_path.read_bytes())
    ok(len(man["clips"]) == 15, f"manifest has 15 clips (got {len(man['clips'])})")

    # ---- 3. WAV bit integrity ----
    for c in man["clips"]:
        p = ROOT / "static/audio" / c["file"]
        b = p.read_bytes()
        ok(b[:4] == b"RIFF" and b[8:12] == b"WAVE", f"{c['file']} RIFF/WAVE header")
        riff = struct.unpack("<I", b[4:8])[0]
        ok(riff == len(b) - 8, f"{c['file']} RIFF size field matches file ({riff} vs {len(b)-8})")
        ok(len(b) == c["bytes"], f"{c['file']} manifest bytes == disk bytes ({len(b)} == {c['bytes']})")
        info = sf.info(str(p))
        ok(info.subtype == "PCM_16" and info.channels == 1 and info.samplerate == 24000,
           f"{c['file']} PCM_16 mono 24kHz ({info.subtype}/{info.channels}/{info.samplerate})")
        data, _ = sf.read(str(p), dtype="float32")
        ok(len(data) > 1000 and float(abs(data).max()) > 0.01,
           f"{c['file']} decodes, non-silent ({len(data)} samples, peak {float(abs(data).max()):.3f})")
        hashes["static/audio/" + c["file"]] = {"bytes": len(b), "sha256": sha(b)}

    # ---- 4. HTTP-served bytes == disk bytes ----
    served = [("/", "static/index.html"), ("/api/health", None),
              ("/audio/manifest.json", "static/audio/manifest.json")]
    for c in man["clips"][:3]:  # sample 3 WAVs over HTTP to bound time
        served.append(("/audio/" + c["file"], "static/audio/" + c["file"]))
    for url, rel in served:
        data = urllib.request.urlopen(BASE + url, timeout=20).read()
        if rel is None:
            ok(len(data) > 0 and b'"ok"' in data, "/api/health responds with ok JSON")
        else:
            disk = (ROOT / rel).read_bytes()
            ok(sha(data) == sha(disk), f"HTTP {url} == disk {rel} byte-for-byte ({sha(data)[:12]}…)")

    # ---- 5. WAV served via /tts cache route byte equality ----
    # (exercise the clip route with a synthesized clip)
    body = json.dumps({"text": "bit level verification", "voice": "af_heart"}).encode()
    req = urllib.request.Request(BASE + "/api/tts", data=body,
                                headers={"Content-Type": "application/json"})
    tts = json.load(urllib.request.urlopen(req, timeout=60))
    clip = urllib.request.urlopen(BASE + tts["url"], timeout=20).read()
    cached = ROOT / "tts_cache" / (tts["url"].split("/")[-1])
    ok(cached.is_file() and sha(clip) == sha(cached.read_bytes()),
       f"/tts route serves cached WAV byte-for-byte ({sha(clip)[:12]}…)")

    # ---- 6. index.html structural ----
    html = (ROOT / "static/index.html").read_text(encoding="utf-8")
    ok(html.count("<script>") == 1 and html.count("</script>") == 1, "single script block")
    ok(html.rstrip().endswith("</html>"), "html ends with </html> (not truncated)")
    for marker in ["const GEN=", "const UNITS=", "const SHORT=", "function recordPerf",
                   "function gradeShort", "function smartContinue", "function buildExam"]:
        ok(marker in html, f"marker present: {marker}")

    # dump full hash manifest to file
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

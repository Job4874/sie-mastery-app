"""Verify the SIE Mastery build: files, single-script structure, audio truth, and markers.

This is the cheap integrity gate. It does NOT prove the app renders or that a question
is correct; tests/tests9.js covers the static DOM/CSS contract and tests/bank.js runs
the real question bank. Run all three:

    python tools/verify.py
    node tests/tests9.js
    node tests/bank.js
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors = []

# 1. Required files
for f in [
    "server.py", "tts_engine.py", "static/index.html", "README.md",
    "ARCHITECTURE.md", "LICENSE", "static/audio/manifest.json",
    "tests/tests9.js", "tests/bank.js",
]:
    if not (ROOT / f).exists():
        errors.append(f"missing {f}")

html = (ROOT / "static/index.html").read_text(encoding="utf-8")

# 2. Structure / feature markers
for marker in [
    "const GEN=", "const LESSONS=", "const UNITS=", "const SHORT=",
    "function showView(", "function smartContinue(", "function gradeShort(",
    "function startGapClose(", "function answerShort(", "AudioMan",
    "audio/welcome.wav", "recordPerf", "diagnose", "adaptiveSet",
]:
    if marker not in html:
        errors.append(f"index.html missing marker: {marker}")

# 3. Exactly one script block, no separate pre-paint theme script
script_opens = re.findall(r"<script(?:\s[^>]*)?>", html, re.I)
if len(script_opens) != 1:
    errors.append(f"expected exactly 1 <script> block, found {len(script_opens)}")

# 4. No emoji (institutional copy only)
def is_emoji(ch):
    cp = ord(ch)
    return (0x1F000 <= cp <= 0x1FAFF) or (0x2600 <= cp <= 0x27BF) or cp in (
        0x2B50, 0x2B06, 0x2B07, 0x2B05, 0x2764, 0x2705, 0x274C, 0x203C,
        0x2049, 0x2122, 0x2139, 0x3030, 0x303D, 0x3297, 0x3299, 0xFE0F, 0x20E3,
    )
emoji = sorted({ch for ch in html if is_emoji(ch)})
if emoji:
    errors.append("emoji found in index.html: " + ", ".join(
        ch.encode("unicode_escape").decode() for ch in emoji))

# 5. Audio manifest is the source of truth
man_path = ROOT / "static/audio/manifest.json"
man = json.loads(man_path.read_text(encoding="utf-8"))
clips = man.get("clips", [])
if not clips:
    errors.append("manifest has no clips")
if man.get("format") != "wav":
    errors.append("manifest format must be wav")
if man.get("engine") != "kokoro-82m":
    errors.append("manifest engine must be kokoro-82m")

audio_dir = ROOT / "static/audio"
manifest_files = {c["file"]: c for c in clips}
disk = {p.name for p in audio_dir.iterdir() if p.is_file() and p.suffix.lower() in (".wav", ".mp3")}

refs = sorted(set(re.findall(r"audio/([A-Za-z0-9_.-]+\.(?:wav|mp3))", html)))
for f in refs:
    p = audio_dir / f
    if not p.exists():
        errors.append(f"referenced audio missing: {f}")
    elif f not in manifest_files:
        errors.append(f"referenced audio not in manifest: {f}")
    else:
        if p.stat().st_size != manifest_files[f]["bytes"]:
            errors.append(f"audio size mismatch: {f}")

for f, c in manifest_files.items():
    p = audio_dir / f
    if not p.exists():
        errors.append(f"manifest clip missing: {f}")
    elif p.stat().st_size != c["bytes"]:
        errors.append(f"manifest size mismatch: {f}")

orphans = sorted(disk - set(manifest_files))
if orphans:
    errors.append("orphan audio files: " + ", ".join(orphans))

# No stale MP3 references anywhere the user reads
for f in ["static/index.html", "README.md", "ARCHITECTURE.md"]:
    text = (ROOT / f).read_text(encoding="utf-8")
    if re.search(r"\.mp3\b", text, re.I):
        errors.append(f"stale .mp3 reference in {f}")

# 6. Report
total_mb = sum(p.stat().st_size for p in audio_dir.glob("*.wav")) / (1024 * 1024)
print(f"verify: {len(clips)} audio clips in manifest, {len(refs)} referenced, "
      f"{len(disk)} binaries, {total_mb:.1f} MB, html {len(html)} bytes")
if errors:
    print("FAILED:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("verify: OK")

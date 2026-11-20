"""Verify the SIE Mastery build: split source files, strict-JSON lessons, and audio manifests.
Run: python tools/verify.py  (also runs in GitHub Actions on every push)"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import content_lib  # noqa: E402

errors = []

for f in ["server.py", "security.py", "tts_engine.py", "static/index.html",
          "static/css/app.css", "static/favicon.svg", "README.md", "SECURITY.md"]:
    if not (ROOT / f).is_file():
        errors.append(f"missing {f}")

html = (ROOT / "static/index.html").read_text(encoding="utf-8")
if re.search(r"<script(?![^>]*src=)", html, re.I):
    errors.append("index.html contains an inline <script> block")
if re.search(r"\bonclick\s*=", html, re.I):
    errors.append("index.html contains an inline onclick handler")

scripts = re.findall(r'<script\b[^>]*src="([^"]+)"[^>]*></script>', html)
if len(scripts) < 20:
    errors.append(f"expected >=20 split script tags in index.html, found {len(scripts)}")
combined_js = []
for rel in scripts:
    p = ROOT / "static" / rel
    if not p.is_file():
        errors.append(f"missing script referenced by index.html: static/{rel}")
    else:
        combined_js.append(p.read_text(encoding="utf-8"))
all_js = "\n".join(combined_js)

for marker in ["const GEN=", "const EXTREME_GEN=", "const LESSONS=", "const UNIT_OVERVIEWS=", "const SHORT=",
               "function startQuiz", "function recordPerf", "function diagnose",
               "function adaptiveSet", "const AudioMan=", "function gradeShort",
               "function answerShort", "const Router=", "function runSelfCheck"]:
    if marker not in all_js:
        errors.append(f"app JS missing marker: {marker}")

# Validate all 9 unit files (units 0..8)
units = content_lib.load_units()
if [u["id"] for u in units] != list(range(9)):
    errors.append(f"expected unit ids 0..8, got {[u['id'] for u in units]}")
for unit in units:
    for err in content_lib.validate_unit(unit):
        errors.append(f"content: {err}")
expected_lesson_clips = sum(1 for u in units for _ in content_lib.screen_scripts(u))

# Check overview/library WAV manifest
man = json.loads((ROOT / "static/audio/manifest.json").read_text(encoding="utf-8"))
for clip in man["clips"]:
    p = ROOT / "static/audio" / clip["file"]
    if not p.exists():
        print(f"warning: audio not in this checkout yet: {clip['file']} "
              f"(binaries are pushed with git from a local clone — see PUSH_AUDIO.md)")
    elif p.stat().st_size != clip["bytes"]:
        errors.append(f"audio size mismatch: {clip['file']}")

# Check per-screen lesson MP3 manifest if present
lman_path = ROOT / "static/audio/lessons/manifest.json"
lesson_clips_count = 0
if lman_path.is_file():
    lman = json.loads(lman_path.read_text(encoding="utf-8"))
    lesson_clips_count = len(lman.get("clips", []))
    if lesson_clips_count != expected_lesson_clips:
        errors.append(f"lesson audio manifest count {lesson_clips_count} != expected {expected_lesson_clips}")
    for clip in lman.get("clips", []):
        p = ROOT / "static/audio/lessons" / clip["file"]
        if not p.is_file():
            errors.append(f"missing lesson audio clip: {clip['file']}")
        elif p.stat().st_size != clip["bytes"]:
            errors.append(f"lesson audio size mismatch: {clip['file']}")
else:
    print(f"warning: static/audio/lessons/manifest.json not yet built ({expected_lesson_clips} clips expected)")

print(f"verify: {len(scripts)} JS modules, {len(units)} units, "
      f"{len(man['clips'])} overview WAVs, {lesson_clips_count}/{expected_lesson_clips} lesson MP3s")
if errors:
    print("FAILED:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("verify: OK")

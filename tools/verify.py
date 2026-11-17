"""Verify the SIE Mastery build: files, audio manifest, and question-bank integrity.
Run: python tools/verify.py  (also runs in GitHub Actions on every push)"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors = []

for f in ["server.py", "tts_engine.py", "static/index.html", "README.md"]:
    if not (ROOT / f).exists():
        errors.append(f"missing {f}")

html = (ROOT / "static/index.html").read_text(encoding="utf-8")
for marker in ["const GEN=", "const LESSONS=", "startQuiz", "playLesson", "audio/welcome.wav", "const UNITS=", "recordPerf", "diagnose", "adaptiveSet", "GEN.push(", "AudioMan", "const SHORT=", "gradeShort", "startGapClose", "smartContinue", "answerShort"]:
    if marker not in html:
        errors.append(f"index.html missing marker: {marker}")

man = json.loads((ROOT / "static/audio/manifest.json").read_text())
for clip in man["clips"]:
    p = ROOT / "static/audio" / clip["file"]
    if not p.exists():
        print(f"warning: audio not in this checkout yet: {clip['file']} "
              f"(binaries are pushed with git from a local clone — see PUSH_AUDIO.md)")
    elif p.stat().st_size != clip["bytes"]:
        errors.append(f"audio size mismatch: {clip['file']}")

print(f"verify: {len(man['clips'])} audio clips in manifest, html {len(html)} bytes")
if errors:
    print("FAILED:"); [print(" -", e) for e in errors]; sys.exit(1)
print("verify: OK")

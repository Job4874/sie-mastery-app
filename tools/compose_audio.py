"""Compose the saved voice clips for SIE Mastery.

Torch-free: uses kokoro-onnx (int8 model, ~92 MB) with the af_heart voice.
Reads the lesson text straight out of static/index.html so clips cannot drift
from the curriculum, writes 24 kHz mono WAVs into static/audio/, and refreshes
manifest.json with exact byte sizes.

Download the model files once (or let this script tell you):
  models/kokoro-v1.0.int8.onnx
  models/voices-v1.0.bin
From https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0

Usage:
  python tools/compose_audio.py --list
  python tools/compose_audio.py --force
  python tools/compose_audio.py --only lesson-3-debt --force
  python tools/compose_audio.py --manifest-only
  python tools/compose_audio.py --voice af_bella --force
"""
import argparse
import html
import json
import os
import re
import sys
from datetime import date
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "static" / "index.html"
OUT = ROOT / "static" / "audio"
MODELS = ROOT / "models"
SAMPLE_RATE = 24000

WELCOME = (
    "Welcome to SIE Mastery. This is your voice tutor. We start with the basics: "
    "how an order becomes a trade, how trades settle, and what margin really means. "
    "Then we build to the full SIE exam, eight units, adaptive drills, and a teacher "
    "that learns from every answer. Take your time. Accuracy first, speed second. "
    "Let's begin."
)

UNIT_RE = re.compile(
    r'\{n:"((?:[^"\\]|\\.)*)",audio:"audio/([^"]+)",lesson:`(.*?)`\}', re.S)
LESSON_RE = re.compile(
    r'\{t:"((?:[^"\\]|\\.)*)",a:"audio/([^"]+)",'
    r's:"(?:[^"\\]|\\.)*",b:`(.*?)`\}', re.S)
TAG_RE = re.compile(r"<[/!]?[a-zA-Z][^>]*>")


def to_speech(raw: str) -> str:
    text = TAG_RE.sub(" ", raw)
    text = html.unescape(text)
    text = text.replace(" \u2022 ", ". ").replace(" \u2014 ", ", ").replace(" = ", ": ")
    return re.sub(r"\s+", " ", text).strip()


def load_script():
    html_text = HTML.read_text(encoding="utf-8")
    found = UNIT_RE.findall(html_text)
    if len(found) != 8:
        sys.exit(f"expected 8 units in {HTML.name}, found {len(found)}")
    clips = [("welcome", "Welcome \u2014 SIE Mastery intro", WELCOME)]
    for title, filename, lesson in found:
        stem = filename[:-4] if filename.endswith(".wav") else filename
        clips.append((stem, title.replace("\\", ""), to_speech(lesson)))
    lessons = LESSON_RE.findall(html_text)
    if not lessons:
        print("warning: no beyond-exam LESSONS clips found")
    for title, filename, body in lessons:
        stem = filename[:-4] if filename.endswith(".wav") else filename
        clips.append((stem, title.replace("\\", ""), to_speech(body)))
    return clips


def write_manifest(clips, voice=None, engine=None):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "manifest.json"
    prev = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}
    by_file = {c["file"]: c for c in prev.get("clips", [])}
    entries = []
    for stem, title, _ in clips:
        target = OUT / f"{stem}.wav"
        if not target.is_file():
            print(f"warning: missing {target.name}, not in manifest", flush=True)
            continue
        info = sf.info(str(target))
        entry = by_file.get(target.name, {"file": target.name})
        entry.update({"file": target.name, "title": title,
                      "bytes": target.stat().st_size,
                      "duration_s": round(info.duration, 1)})
        entries.append(entry)
    prev.update({
        "voice": voice or prev.get("voice", "af_heart (Kokoro ONNX)"),
        "generated": date.today().isoformat(),
        "format": "wav",
        "engine": engine or prev.get("engine", "kokoro-82m-onnx"),
        "sample_rate": SAMPLE_RATE,
        "clips": entries,
    })
    path.write_text(json.dumps(prev, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8")
    print(f"manifest updated: {len(entries)} clips", flush=True)


def pick_model(model_arg: str | None) -> tuple[Path, Path]:
    names = [model_arg] if model_arg else ["kokoro-v1.0.int8.onnx", "kokoro-v1.0.onnx"]
    model = next((MODELS / n for n in names if (MODELS / n).is_file()), None)
    voices = MODELS / "voices-v1.0.bin"
    if model is None or not voices.is_file():
        sys.exit(
            "missing model files. Download once into models/:\n"
            "  curl -L -o models/kokoro-v1.0.int8.onnx "
            "https://github.com/thewh1teagle/kokoro-onnx/releases/download/"
            "model-files-v1.0/kokoro-v1.0.int8.onnx\n"
            "  curl -L -o models/voices-v1.0.bin "
            "https://github.com/thewh1teagle/kokoro-onnx/releases/download/"
            "model-files-v1.0/voices-v1.0.bin")
    return model, voices


def chunks(text: str, limit: int = 420):
    """Split on sentence boundaries so Kokoro keeps natural prosody."""
    parts = re.split(r"(?<=[.!?])\s+", text)
    buf = ""
    for part in parts:
        if not part:
            continue
        if buf and len(buf) + len(part) + 1 > limit:
            yield buf
            buf = part
        else:
            buf = f"{buf} {part}".strip()
    if buf:
        yield buf


def compose(kokoro, text: str, voice: str, speed: float) -> tuple[np.ndarray, int]:
    pieces, rate = [], SAMPLE_RATE
    for chunk in chunks(text):
        samples, rate = kokoro.create(chunk, voice=voice, speed=speed, lang="en-us")
        pieces.append(np.asarray(samples, dtype=np.float32))
        pieces.append(np.zeros(int(rate * 0.12), dtype=np.float32))
    if not pieces:
        raise RuntimeError("no speech produced")
    audio = np.concatenate(pieces[:-1])
    return np.clip(audio, -1.0, 1.0), rate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=os.environ.get("KOKORO_VOICE", "af_heart"))
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", help="compose one clip stem (e.g. lesson-3-debt)")
    ap.add_argument("--force", action="store_true", help="overwrite existing WAVs")
    ap.add_argument("--list", action="store_true", help="list clip stems and exit")
    ap.add_argument("--manifest-only", action="store_true",
                    help="refresh manifest from existing WAVs, no synthesis")
    ap.add_argument("--model", help="model filename inside models/")
    args = ap.parse_args()

    clips = load_script()
    if args.list:
        for stem, title, text in clips:
            print(f"{stem:26} {len(text):6} chars  {title}")
        return
    if args.manifest_only:
        write_manifest(clips)
        return

    todo = [c for c in clips if not args.only or c[0] == args.only]
    if not todo:
        sys.exit(f"no clip named {args.only!r}; use --list")

    model, voices = pick_model(args.model)
    from kokoro_onnx import Kokoro
    print(f"model {model.name} | voice {args.voice} | clips {len(todo)}", flush=True)
    kokoro = Kokoro(str(model), str(voices))

    OUT.mkdir(parents=True, exist_ok=True)

    for stem, title, text in todo:
        target = OUT / f"{stem}.wav"
        if target.is_file() and not args.force:
            print(f"skip {target.name} (exists; use --force)", flush=True)
            continue
        print(f"compose {target.name}: {len(text)} chars ...", flush=True)
        audio, rate = compose(kokoro, text, args.voice, args.speed)
        tmp = target.with_name(target.name + ".tmp")
        if rate != SAMPLE_RATE:
            print(f"warning: model returned {rate} Hz, manifest says {SAMPLE_RATE}")
        sf.write(str(tmp), audio, rate, format="WAV", subtype="PCM_16")
        os.replace(tmp, target)
        seconds = round(len(audio) / rate, 1)
        print(f"  ok {target.stat().st_size:,} bytes / {seconds}s", flush=True)

    if not args.only:
        write_manifest(clips, f"{args.voice} (Kokoro ONNX)",
                       f"kokoro-82m-onnx ({model.name})")


if __name__ == "__main__":
    main()

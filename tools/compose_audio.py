"""Compose the saved voice clips for SIE Mastery.

Torch-free: uses kokoro-onnx (kokoro-v1.0.onnx or int8) with the af_heart voice.
Reads curriculum text straight out of static/js/data/ so clips cannot drift:
  - Default mode: 15 overview & library WAV clips in static/audio/ + manifest.json
    (reads js/data/overviews.js and js/data/library.js).
  - --lessons mode: per-screen MP3 clips in static/audio/lessons/ + manifest.json
    (reads js/data/units/unit-*.js via tools/content_lib.py).

Usage:
  python tools/compose_audio.py --list
  python tools/compose_audio.py --lessons --workers 6
  python tools/compose_audio.py --lessons --only u0-l1-s1 --force
  python tools/compose_audio.py --only lesson-3-debt --force
  python tools/compose_audio.py --manifest-only
  python tools/compose_audio.py --lessons --manifest-only
"""
import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import date
import html
import json
import os
from pathlib import Path
import re
import sys

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import content_lib  # noqa: E402

OVERVIEWS_JS = ROOT / "static" / "js" / "data" / "overviews.js"
LIBRARY_JS = ROOT / "static" / "js" / "data" / "library.js"
OUT = ROOT / "static" / "audio"
LESSONS_OUT = OUT / "lessons"
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

_WORKER_KOKORO = None


def to_speech(raw: str) -> str:
    text = TAG_RE.sub(" ", raw)
    text = html.unescape(text)
    text = text.replace(" \u2022 ", ". ").replace(" \u2014 ", ", ").replace(" = ", ": ")
    return re.sub(r"\s+", " ", text).strip()


def load_overview_scripts():
    overviews_text = OVERVIEWS_JS.read_text(encoding="utf-8")
    library_text = LIBRARY_JS.read_text(encoding="utf-8")
    found = UNIT_RE.findall(overviews_text)
    if len(found) != 8:
        sys.exit(f"expected 8 unit overviews in {OVERVIEWS_JS.name}, found {len(found)}")
    clips = [("welcome", "Welcome \u2014 SIE Mastery intro", WELCOME)]
    for title, filename, lesson in found:
        stem = filename[:-4] if filename.endswith(".wav") else filename
        clips.append((stem, title.replace("\\", ""), to_speech(lesson)))
    lessons = LESSON_RE.findall(library_text)
    if not lessons:
        print("warning: no library LESSONS clips found")
    for title, filename, body in lessons:
        stem = filename[:-4] if filename.endswith(".wav") else filename
        clips.append((stem, title.replace("\\", ""), to_speech(body)))
    return clips


def load_lesson_scripts():
    units = content_lib.load_units()
    clips = []
    for unit in units:
        for stem, title, speech in content_lib.screen_scripts(unit):
            clips.append((stem, title, speech))
    return clips


def write_manifest(clips, out_dir: Path, ext: str, voice=None, engine=None):
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "manifest.json"
    prev = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}
    by_file = {c["file"]: c for c in prev.get("clips", [])}
    entries = []
    for stem, title, _ in clips:
        target = out_dir / f"{stem}.{ext}"
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
        "format": ext,
        "engine": engine or prev.get("engine", "kokoro-82m-onnx"),
        "sample_rate": SAMPLE_RATE,
        "clips": entries,
    })
    path.write_text(json.dumps(prev, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8")
    print(f"manifest updated ({path.relative_to(ROOT)}): {len(entries)} clips", flush=True)


def pick_model(model_arg: str | None) -> tuple[Path, Path]:
    names = [model_arg] if model_arg else ["kokoro-v1.0.onnx", "kokoro-v1.0.int8.onnx"]
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


def write_audio(target: Path, audio: np.ndarray, rate: int, ext: str):
    tmp = target.with_name(target.name + ".tmp")
    if ext == "mp3":
        sf.write(str(tmp), audio, rate, format="MP3", subtype="MPEG_LAYER_III")
    else:
        sf.write(str(tmp), audio, rate, format="WAV", subtype="PCM_16")
    os.replace(tmp, target)


def _init_worker(model_path: str, voices_path: str, threads: int):
    global _WORKER_KOKORO
    os.environ["OMP_NUM_THREADS"] = str(threads)
    from kokoro_onnx import Kokoro
    if hasattr(Kokoro, "from_session"):
        import onnxruntime as ort
        so = ort.SessionOptions()
        so.intra_op_num_threads = threads
        so.inter_op_num_threads = 1
        sess = ort.InferenceSession(model_path, sess_options=so, providers=["CPUExecutionProvider"])
        _WORKER_KOKORO = Kokoro.from_session(sess, voices_path)
    else:
        _WORKER_KOKORO = Kokoro(model_path, voices_path)


def _synth_one(job):
    stem, text, out_dir_s, ext, voice, speed = job
    target = Path(out_dir_s) / f"{stem}.{ext}"
    audio, rate = compose(_WORKER_KOKORO, text, voice, speed)
    write_audio(target, audio, rate, ext)
    return stem, target.stat().st_size, round(len(audio) / rate, 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lessons", action="store_true",
                    help="compose per-screen MP3 clips into static/audio/lessons/")
    ap.add_argument("--voice", default=os.environ.get("KOKORO_VOICE", "af_heart"))
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", help="compose one clip stem (e.g. lesson-3-debt or u0-l1-s1)")
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    ap.add_argument("--list", action="store_true", help="list clip stems and exit")
    ap.add_argument("--manifest-only", action="store_true",
                    help="refresh manifest from existing files, no synthesis")
    ap.add_argument("--model", help="model filename inside models/")
    ap.add_argument("--workers", type=int, default=1, help="parallel worker processes")
    args = ap.parse_args()

    clips = load_lesson_scripts() if args.lessons else load_overview_scripts()
    out_dir = LESSONS_OUT if args.lessons else OUT
    ext = "mp3" if args.lessons else "wav"

    if args.list:
        for stem, title, text in clips:
            print(f"{stem:26} {len(text):6} chars  {title}")
        print(f"total: {len(clips)} clips, {sum(len(t) for _, _, t in clips):,} chars")
        return
    if args.manifest_only:
        write_manifest(clips, out_dir, ext)
        return

    todo = [c for c in clips if not args.only or c[0] == args.only]
    if not todo:
        sys.exit(f"no clip named {args.only!r}; use --list")

    out_dir.mkdir(parents=True, exist_ok=True)
    pending = [c for c in todo if args.force or not (out_dir / f"{c[0]}.{ext}").is_file()]
    if not pending:
        print(f"all {len(todo)} {ext} clips already exist (use --force to overwrite)", flush=True)
        if not args.only:
            write_manifest(clips, out_dir, ext)
        return

    model, voices = pick_model(args.model)
    workers = max(1, min(args.workers, len(pending)))
    print(f"model {model.name} | voice {args.voice} | pending {len(pending)}/{len(todo)} ({ext}) | workers {workers}",
          flush=True)

    if workers > 1:
        threads = max(1, (os.cpu_count() or 4) // workers)
        jobs = [(stem, text, str(out_dir), ext, args.voice, args.speed) for stem, _, text in pending]
        done = 0
        with ProcessPoolExecutor(
            max_workers=workers, initializer=_init_worker,
            initargs=(str(model), str(voices), threads),
        ) as ex:
            futs = [ex.submit(_synth_one, job) for job in jobs]
            for fut in as_completed(futs):
                stem, size, seconds = fut.result()
                done += 1
                if done % 20 == 0 or done == len(pending):
                    print(f"  [{done}/{len(pending)}] {stem}.{ext}: {size:,} B / {seconds}s", flush=True)
    else:
        from kokoro_onnx import Kokoro
        kokoro = Kokoro(str(model), str(voices))
        for i, (stem, _, text) in enumerate(pending, 1):
            target = out_dir / f"{stem}.{ext}"
            print(f"compose [{i}/{len(pending)}] {target.name}: {len(text)} chars ...", flush=True)
            audio, rate = compose(kokoro, text, args.voice, args.speed)
            if rate != SAMPLE_RATE:
                print(f"warning: model returned {rate} Hz, manifest says {SAMPLE_RATE}")
            write_audio(target, audio, rate, ext)
            seconds = round(len(audio) / rate, 1)
            print(f"  ok {target.stat().st_size:,} bytes / {seconds}s", flush=True)

    if not args.only:
        write_manifest(clips, out_dir, ext, f"{args.voice} (Kokoro ONNX)",
                       f"kokoro-82m-onnx ({model.name})")


if __name__ == "__main__":
    main()

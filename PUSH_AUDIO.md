# Regenerating and pushing the audio files

`static/audio/` contains two sets of pre-generated Kokoro voice clips so both localhost and public GitHub Pages learners get natural narration with zero runtime synthesis delay:

1. **15 overview, library, and welcome WAV clips** (`static/audio/*.wav`), listed with exact byte sizes in `static/audio/manifest.json` (24 kHz mono PCM_16).
2. **340 per-screen lesson MP3 clips** (`static/audio/lessons/*.mp3`), listed with exact byte sizes in `static/audio/lessons/manifest.json` (one clip per screen across all 42 lessons / 266 screens in Units 0–8, plus check feedback clips).

The app plays these saved clips first, then uses localhost `POST /api/tts` (Kokoro GPU -> Kokoro ONNX CPU) for dynamic re-rolled questions, and falls back to browser `speechSynthesis` offline or on static hosting.

## Regenerate clips with the torch-free composer

```powershell
pip install -r requirements.txt

# one-time voice download (~119 MB, git-ignored)
curl -L -o models/kokoro-v1.0.int8.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
curl -L -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

# Re-compose all 340 per-screen lesson MP3 clips from static/js/data/units/unit-0..8.js
python tools/compose_audio.py --lessons --workers 6

# Or re-compose a single lesson screen clip and refresh the manifest
python tools/compose_audio.py --lessons --only u0-l1-s1 --force
python tools/compose_audio.py --lessons --manifest-only

# Re-compose the 15 overview / library / welcome WAV clips from overviews.js & library.js
python tools/compose_audio.py --list
python tools/compose_audio.py --force
```

The composer reads lesson screens straight out of `static/js/data/units/unit-0.js`..`unit-8.js` (and overviews/library text from `static/js/data/overviews.js` and `static/js/data/library.js`), so audio never drifts from screen text. Use `--only lesson-3-debt --force` to rebuild a single overview WAV.

## Push updated clips

Git tracks the binaries natively. From a normal clone on your PC:

```powershell
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
python tools/compose_audio.py --lessons --workers 6
python tools/compose_audio.py --force
git add static/audio tools/bit_manifest.json
git commit -m "Regenerate Kokoro lesson and overview voice clips"
git push
```

`tools/verify.py`, `tools/verify_bits.py`, and the GitHub Actions `compile-check` workflow confirm that every clip in both `static/audio/manifest.json` and `static/audio/lessons/manifest.json` exists and matches its recorded byte size. Dynamic clips generated on localhost via `/api/tts` land in `tts_cache/` (git-ignored by default).

# Pushing the audio files to GitHub

The 7 pre-generated voice clips in `static/audio/` (welcome + 6 lessons, ~1.9 MB total)
are **binary MP3 files**. Muse's GitHub connector pushes text snapshots only, so the
code, manifest, and workflow were pushed through the connector, and the MP3s travel
by ordinary git — which handles binaries natively.

From a normal clone on your PC:

```powershell
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
# copy the static/audio/*.mp3 files into static/audio/ (they're in the Muse workspace copy)
git add static/audio
git commit -m "Add pre-generated lesson voice clips"
git push
```

`static/audio/manifest.json` (already in the repo) lists every clip with its exact
byte size, and `tools/verify.py` / the GitHub Actions compile-check confirm each
clip present in a clone matches the manifest. New clips generated later by the
RTX Kokoro server land in `tts_cache/` and can be pushed the same way.

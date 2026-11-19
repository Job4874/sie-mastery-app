# SIE Mastery — Localhost App

**Goal:** Not just pass the FINRA SIE — master financial regulation.

The app now starts at zero: a five-card **Zero → First Trade** primer, a 10-question
placement check, then an adaptive 8-unit curriculum that ends in Final Review and
Master mode. Experienced users can skip the primer and go straight to trap drilling.

## v4 — Security, correctness and zero-to-master onboarding (Nov 19, 2026)

- **Start from zero:** primer covers accounts, order types, T+1 settlement, cash vs.
  margin, Reg T/FINRA, risk, and the exam map. A 3-question check plus a 10-question
  placement check seed the ML teacher; the Home coach then shows the current stage and
  an exam-readiness score.
- **Spaced review:** missed questions carry timestamps and a cleared-count; the Missed
  Bank serves least-cleared/oldest items first, and short-response misses now clear
  after two full-credit replays like multiple-choice misses.
- **Server hardening:** loopback-only bind; Host allowlist (DNS-rebinding defense);
  Origin and `Sec-Fetch-Site` checks on mutations; JSON-only POST (forces a CORS
  preflight cross-site); 64 KB body cap; thread-safe 30/min rate limiter with pruning;
  exact 32-hex clip routing; no directory listings; generic error bodies; atomic
  `.tmp` → `os.replace` cache writes; CSP/COOP/COEP/CORP/nosniff/frame-deny headers.
- **Correctness fixes:** Reg T swapped-regulator sentences now fail role binding;
  practice exams dedupe stems and keep the 12/33/23/7 section mix; all generators use
  valid SIE sections 1–4; every topic has unit and difficulty mappings; short-response
  misses retain `unit`/`diff`; partial scores render as decimals, not `7.5 / 10`.
- **Content:** **83 multiple-choice generators** (numbers/names re-rolled per run) +
  **12 short-response prompts**, each generator mapped to one of 8 units.
- **Tests in the repo:** `tests/app.test.js` (question shape, section mix, exam
  uniqueness, grader traps), `tests/test_security.py` (unit + live server probes), and
  `tests/tests9.js` (theme/CSS audit).

## v3 — UI/Architecture pass, Short Responses, Gap-Closing Loop (Nov 16, 2026)

- **Architecture:** five clean layers documented in `ARCHITECTURE.md` (UI views /
  AudioManager / quiz engine / ML teacher / on-device storage). No build step.
- **AudioManager:** saved lesson clips are preloaded; dynamic speech goes through a
  single-voice queue — GPU Kokoro via `/api/tts` with disk cache, browser voice as
  fallback — so nothing talks over itself.
- **Short-response questions (Very Hard / Master):** 12 prompts where you must
  *produce* the rule. Rubric grading checks concept groups, numeric answers with
  tolerance, and bound pairs (e.g. 50% must bind to the Federal Reserve and 25% to
  FINRA *in the same sentence*, with the role word attached — swapping regulators
  scores zero).
- **Gap-closing loop:** a miss on a weak concept opens a tracked gap → Gap Closer:
  micro-lesson → worked example → 3 fresh questions on that concept; 2-of-3 closes it.
- **Engagement UX:** coach card with a smart **Continue where I left off** button,
  daily-goal ring, 8-node path map, badge toasts.

## v2 — ML Teacher, 8-Unit Curriculum, 4 Levels

- **ML Teacher (in-app, no server needed):** every answer is timed and scored.
  - *Bayesian Knowledge Tracing* per unit estimates the probability you know the
    concept (guess 25% / slip 10% model).
  - *Elo-style ability rating* updates from question difficulty vs. result.
  - *Diagnosis engine* reads accuracy + speed: repeated slow misses = **TRUE GAP**;
    fast misses = trap-prone guessing; slow corrects = knowledge without speed.
  - *Adaptive selection* weights your weakest units and the difficulty where predicted
    success is ~70%.
- **Curriculum:** 8 units — (1) Regulators & Capital Markets, (2) Equity Securities,
  (3) Debt & Bond Traps, (4) Pooled Funds, Options & Packaged Products, (5) Risk,
  (6) Trading, Settlement & Corporate Actions, (7) Customer Accounts & Compliance,
  (8) Prohibited Activities & Regulatory Framework. Each unit: lesson → mini quiz,
  80% to clear. Clear all 8 → Final Exam Review unlocks.
- **4 levels:** Easy (×1 XP) · Hard (×1.5) · Very Hard (×2) · Master (×3 XP,
  trap-only, 60-second clock). Badges: Perfect Run, Speed Demon, Trap Slayer,
  Unit Cleared.

## Modes

- **Trap Drill** — one question at a time, no reveal until you answer; weighted to
  your misses.
- **Sprint Quiz** — 10 dynamic questions, randomized every run.
- **Practice Exam** — 75 questions, 105 minutes, 70% to pass, weighted like the real
  exam: Sec 1 16% · Sec 2 44% · Sec 3 31% · Sec 4 9%. Duplicate stems are filtered.
- **Missed Bank** — misses are saved locally and resurface least-cleared first.
- **Curriculum** — 8 units with lessons, mini quizzes, and a Final Review.

## Voice / TTS (GPU or small ONNX model)

Two layers, so it works everywhere:

1. **Instant (no install):** browser voice (`speechSynthesis`) reads questions,
   explanations, and lessons.
2. **Local voice (localhost only):** `server.py` exposes `POST /api/tts`.
   - Default: **kokoro-onnx int8** — the af_heart female voice in a ~92 MB
     model, no torch, runs on CPU (or any RTX).
   - Optional GPU path: `TTS_ENGINE=kokoro` with `torch` + `kokoro` installed.
   - Optional voice cloning: `TTS_ENGINE=xtts` plus `voices/reference.wav`.
   - Every clip is cached at `tts_cache/<sha256(backend|voice|text)>.wav`;
     identical text+voice is synthesized once. Cache writes are atomic.

### Run it

```powershell
cd sie-mastery-app
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
# open http://localhost:8765
```

No pip install? Open `static/index.html` directly — everything except local
TTS works, and voice falls back to the browser.

Check voice status in the app header, or `GET http://localhost:8765/api/health`.

## Pre-generated voice clips

`static/audio/` contains the welcome clip and 8 unit-lesson clips, listed with exact
byte sizes in `static/audio/manifest.json` - **15 clips, ~54 MB of WAV**. The Listen
buttons play these saved files before any live TTS.

Rebuild them from the curriculum text at any time:

```powershell
# one-time voice download (~119 MB, into models/)
curl -L -o models/kokoro-v1.0.int8.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
curl -L -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

python tools/compose_audio.py --list          # clip stems + char counts
python tools/compose_audio.py --force         # recompose all 15 clips + manifest
python tools/compose_audio.py --only lesson-3-debt --force
```

The composer reads lesson text directly from `static/index.html`, so clips cannot
drift from the curriculum. Model files are local-only and git-ignored; the WAVs and
manifest are committed like any other asset.

## Verification

All of these run locally and in CI (`.github/workflows/compile.yml`):

```powershell
python -m py_compile server.py security.py tts_engine.py tools/verify.py tests/test_security.py
python tools/verify.py                 # manifest + build integrity
python -m unittest tests.test_security -v
node tests/app.test.js                 # 83 generators, exam mix, grader traps
node tests/tests9.js                   # theme/CSS audit
```

## Layout

```
server.py          # stdlib web server + /api/tts (no heavy web framework)
security.py        # validation, clip routing, thread-safe rate limiter
tts_engine.py      # Kokoro (default) / XTTS (optional) on CUDA, atomic file cache
requirements.txt
static/index.html  # the entire app: quiz engine, exam, lessons, voice UI
static/audio/      # saved lesson clips + manifest
tts_cache/         # generated TTS .wav files (grows as you study)
voices/            # optional XTTS reference voice sample
data/              # notes / future question packs
```

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Abdulwahab Tibin.

# SIE Mastery — Localhost App

**Goal:** Not just pass the FINRA SIE — master financial regulation.
Built for an experienced trader: no intro fluff. Only trap areas, numbers,
timelines, exceptions, and the *why* behind each rule.

## v3 — UI/Architecture pass, Short Responses, Gap-Closing Loop (Nov 16, 2026)
- **Architecture:** five clean layers documented in `ARCHITECTURE.md` (UI views / AudioManager / quiz engine / ML teacher / on-device storage). No build step.
- **AudioManager:** saved lesson clips are **preloaded**; dynamic speech (questions, explanations, feedback, the Teacher Report) goes through a **single-voice queue** — GPU Kokoro via `/api/tts` with disk cache, browser voice as fallback — so nothing ever talks over itself. Every screen's core text is speakable, including a "Hear my report" button.
- **Short-response questions (Very Hard / Master):** 12 prompts where you must *produce* the rule. Rubric grading checks required concept groups, numeric answers with tolerance, and **bound pairs** (e.g. 50% must bind to the Federal Reserve and 25% to FINRA *in the same sentence* — swapping the regulators scores zero, exactly the trap being tested). 17/17 grading tests pass, including the swapped-regulator trap and a bare-number answer scoring zero concepts.
- **Gap-closing loop:** a miss on a weak concept opens a tracked gap → **Gap Closer** session: micro-lesson → worked example with the trap sprung → 3 fresh questions on that exact concept (numbers re-rolled), 2-of-3 closes it. Open gaps boost that concept's weight in future quizzes (spaced recheck). In-quiz: two misses in a row on one unit triggers a coach intervention — an easier confidence rep, then back up.
- **Engagement UX:** coach card on Home with a smart **Continue where I left off** button (routes to your open gap, next unit, or Final Review), daily-goal ring (10 answers/day), visual 8-node path map, badge toasts, animated cards.
- Verified: full script boots clean in a DOM harness, coach card renders, 35 MC generators × 200 runs = 7,000 questions 0 defects (v2 suite), short-answer grading 17/17, teacher diagnosis simulation all paths correct.

**Production QA pass (Nov 16, 2026):** full end-to-end harness drives the real app — 36/36 checks green across 3 consecutive runs (every view, all 8 unit lessons/quizzes, Trap/Sprint/Missed Bank, 75-question exam with exact 12/33/23/7 FINRA domain mix, Final Review gating, gap open→close, all 4 levels, short-response injection, audio queue on GPU path + browser fallback + voice toggle). 17,500 generated questions swept with 0 defects; short-answer self-grading 12/12 model answers full credit, 12/12 empty answers zero. Static integrity: 22/22 button handlers defined, 27/27 element IDs present, zero external dependencies. QA caught and fixed 4 real defects: Final Review gate bypass, Trap Drill trap-seeding loss, "undefined" unit names in coach/report speech (wrong property key), and short-response questions being truncated out of Master trap drills.

## v2 — ML Teacher, 8-Unit Curriculum, 4 Levels (Nov 16, 2026)
- **ML Teacher (in-app, no server needed):** every answer is timed and scored per concept.
  - *Bayesian Knowledge Tracing* per unit estimates the probability you actually know the concept (guess 25% / slip 10% model).
  - *Elo-style ability rating* updates from question difficulty vs your result.
  - *Diagnosis engine* reads accuracy + speed together: repeated slow misses = **TRUE GAP** (lesson assigned, Easy→Hard ladder); fast misses = **trap-prone guessing**; slow corrects = **knowledge without speed** (timed drills); high mastery = maintenance only.
  - *Adaptive selection:* quizzes are weighted toward your weakest units and the difficulty where your predicted success is ~70%.
  - Teacher Report screen shows mastery %, accuracy, avg seconds, fast-wrong and slow-right counts, diagnosis, and a one-click prescription per unit.
- **Curriculum:** 8 units — (1) Regulators & Capital Markets, (2) Equity Securities, (3) Debt & Bond Traps, (4) Pooled Funds, Options & Packaged Products, (5) Risk, (6) Trading, Settlement & Corporate Actions, (7) Customer Accounts & Compliance, (8) Prohibited Activities & Regulatory Framework. Each unit: detailed lesson (with saved voice clip) → 5-question mini quiz, 80% to clear. Clear all 8 → **Final Exam Review** (25 adaptive questions) unlocks.
- **4 levels:** 🟢 Easy (×1 XP) · 🟠 Hard (×1.5) · 🔴 Very Hard (×2) · 👑 Master (×3 XP, trap questions only, 60-second per-question clock). Badges: Perfect Run, Speed Demon, Trap Slayer, Unit Cleared.
- Question bank grew to **35 dynamic generators** (7,000-question smoke test, 0 defects; teacher-engine simulation verified all diagnosis paths).

## Modes
- **Trap Drill** — 1 question at a time, no reveal until you answer (your preferred drill style). Targets your known weak spots first: SIPC separate capacity, CMO contraction/extension, freeriding.
- **Sprint Quiz** — 10 dynamic questions, randomized numbers/names every run. Same concept, never the same question twice.
- **Practice Exam** — Full SIE simulation: 75 questions, 105 minutes, 70% to pass, weighted like the real exam:
  - Sec 1 Capital Markets 16% · Sec 2 Products & Risks 44% · Sec 3 Trading / Accounts / Prohibited Activities 31% · Sec 4 Regulatory Framework 9%
- **Learn (Mastery Path)** — Short lessons on the rule logic, not memorization: why SIPC is per-capacity, why PAC/support tranches behave opposite, Reg T / Reg SHO / wash sale timelines as a numbers vault.
- **Missed Bank** — Every miss is saved (localStorage) and resurfaces via spaced repetition until you get it right twice in a row.

## Voice / GPU TTS (your RTX)
Two layers, so it works everywhere:

1. **Instant (no install):** Browser voice (`speechSynthesis`) reads questions, explanations, and lessons.
2. **GPU overlay (localhost only):** `server.py` exposes `POST /api/tts`.
   - Default engine: **Kokoro-82M** — tiny (~0.3 GB VRAM), fast on any GeForce RTX, natural voices, Apache-2.0. Best light choice.
   - Optional engine: **XTTS v2** — voice cloning from a 6-second sample, heavier (~4-6 GB VRAM). Set `TTS_ENGINE=xtts` and put a sample at `voices/reference.wav`.
   - **Every generated clip is saved** to `tts_cache/<sha256(text+voice+engine)>.wav` inside this codebase. Same text+voice is never generated twice — it plays from cache instantly.

### Run it (on your RTX PC)
```powershell
cd sie-mastery-app
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
# open http://localhost:8765
```
No GPU / no pip install? Just open `static/index.html` directly — everything except GPU TTS works, voice falls back to the browser voice.

Check GPU status in the app header, or: `GET http://localhost:8765/api/health`

## Pre-generated voice clips (already in this codebase)
Generated with Muse's own voice on Nov 16, 2026 and saved in `static/audio/` — the app's
**Listen** buttons play these files first, before any live TTS:
`welcome.mp3` + lesson clips for all 8 curriculum units plus the Numbers Vault reference
(SIPC, CMO, freeriding, equity, options/pooled, risk, master frame, prohibited activities)
— 10 clips, ~2.85 MB, listed with exact byte sizes in `static/audio/manifest.json`.
Note: the MP3 binaries are pushed to GitHub by ordinary git from a local clone (see
`PUSH_AUDIO.md`); the connector snapshot carries all code + the manifest.

## Compile / verification (all passing, Nov 16, 2026)
- `python -m py_compile server.py tts_engine.py tools/verify.py` — OK
- App JavaScript extracted and `node --check` — OK (compile caught and fixed 3 real bugs:
  a stray brace, a missing brace, and a 3-choice CMO question; SIPC duplicate-answer and
  2-choice Treasury questions were also fixed)
- Smoke test: 20 question generators × 200 runs = **4,000 generated questions, 0 defects**
  (every question has exactly 4 unique choices and a valid answer)
- Server test: `/`, all audio clips, manifest, and `/api/health` return 200
- GitHub Actions (`.github/workflows/compile.yml`) re-runs all of this on every push

## Layout
```
server.py          # stdlib web server + /api/tts (no heavy web framework)
tts_engine.py      # Kokoro (default) / XTTS (optional) on CUDA, file cache
requirements.txt
static/index.html  # the entire app: quiz engine, exam, lessons, voice UI
tts_cache/         # saved TTS .wav files live here (grows as you study)
voices/            # optional XTTS reference voice sample
data/              # notes / future question packs
```

## Your weak-spot seeding
First Trap Drill sessions are weighted to: SIPC separate capacity, CMO PAC/support + contraction vs extension, freeriding in cash accounts. As you clear them twice, weighting normalizes.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Abdulwahab Tibin.

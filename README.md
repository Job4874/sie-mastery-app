# SIE Mastery

**Goal:** Not just pass the FINRA SIE — actually understand financial regulation, one step at a time.

SIE Mastery is a free, open-source (MIT) learning site built with calm typography, short voiced lessons, adaptive practice, and full 75-question exam simulation. It works equally well on **GitHub Pages** (static, with all 340 pre-recorded Kokoro lesson voice clips shipped), on **localhost** (`python server.py`, adding local Kokoro GPU/ONNX synthesis for live re-rolled questions), or offline by double-clicking `static/index.html`.

## Quick start — pick your OS

**Zero install needed to study.** Open `static/index.html` in any modern browser (double-click it) or deploy `static/` to GitHub Pages. Every lesson screen plays its pre-recorded Kokoro MP3 voice clip; dynamic re-rolled questions fall back cleanly to your browser's built-in voice. All progress stays on-device in `localStorage`.

**Recommended (adds local GPU/CPU live voice + hardened server):** Python 3.10+ only, no Node/build step.

**Windows (PowerShell):**
```powershell
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
py -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
# open http://127.0.0.1:8765
```

**macOS (Terminal):**
```bash
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
# open http://127.0.0.1:8765
```

**Linux (bash):**
```bash
git clone https://github.com/Job4874/sie-mastery-app.git
cd sie-mastery-app
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
# open http://127.0.0.1:8765
```

If `pip install` fails on the voice packages, the app still runs — skip that step and use the shipped lesson clips plus browser voice fallback.

**Research:** see `RESEARCH_ADHD.md` for the ML/learning-science basis of the teacher model, retrieval design, and audio choices.

## v5 — Real learning site, step-through lesson player & GitHub Pages (Nov 19, 2026)

- **Learning-first layout & real URLs:** Top navigation (**Learn · Practice · Exam · Progress** + **Focus** / **Dark** / **Settings**) with linkable hash routes (`#/learn`, `#/learn/unit/3/lesson/2/4`, `#/practice`, `#/exam`, `#/progress`, `#/library`, `#/settings`) and a working browser Back button.
- **Step-through lesson player:** Start Here plus 8 SIE units split into **42 short lessons** (**266 one-idea screens**: concept → worked example → inline check yourself → recap) with a segmented progress bar, answer-to-continue check gates, and a **Listen** button on every screen backed by **340 pre-composed Kokoro MP3 clips**.
- **Calm study design & Focus mode:** Warm light theme by default (WCAG AAA body text, dark theme toggle `T`), 17px/1.6 system UI typography, generous spacing, single calm teal accent, no ALL-CAPS tags, and **Focus mode (`F`)** hiding secondary chrome, enlarging type, and disabling motion.
- **Zero-build split architecture & strict CSP:** Split into clean static files (`static/index.html`, `static/css/app.css`, `static/js/core/*`, `static/js/data/*`, `static/js/ui/*`, `static/js/app.js`) with zero inline `<script>` blocks and zero inline `onclick` handlers, enabling strict `script-src 'self'` CSP in `server.py`.
- **Public hosting + localhost parity:** `.github/workflows/pages.yml` deploys `static/` to GitHub Pages. All 340 lesson clips and 15 overview/library clips play everywhere; dynamic speech uses local Kokoro (GPU → ONNX CPU) when running `server.py` and falls back silently to browser `speechSynthesis` on static hosting.

## Core Curriculum, ML Teacher & Security Highlights

- **5 difficulty levels across Lessons, Practice, and Exams:** Choose **Easy**, **Standard**, **Hard**, **Very Hard** (90-minute exam + short responses), or **Extremely Hard** (`extreme.js`: 75-minute 1-min/Q exam, 45s drill clock, extreme lesson trap checks, and all 33 normally easy exam topics upgraded into multi-step FINRA trap scenarios so zero softballs appear).
- **Content (2026 audited):** **42 step-through lessons (266 screens)** + **89 dynamic MC generators** + **33 Extremely Hard trap upgrades** (`16 / 33 / 32 / 8` across Sections 1–4, zero repeats in 75-Q exams) + **12 rubric-graded short-response prompts** (clause-scoped regulator/role bindings and negation guards) + **6 "Why the rules exist" library deep dives**.
  - Updated for 2026 rules: FINRA Rule 3220 `$300`/person/year gift cap effective March 30, 2026 (Notice 26-05), SECURE 2.0 ABLE disability onset **age 46**, PDT `$25,000` transition note, Rule 144 `1%` per 3 months limit, SEC Rule 15l-1 Reg BI vs. FINRA Rule 2111 suitability, Rule 5220 backing away, Rule 3270 OBA, Rule 3280 selling away, Rule 2150(c) sharing, Social Security/IRA earned income, Roth vs. Traditional IRA taxation, and ERISA qualified plans.
- **ML Teacher (on-device):** Bayesian Knowledge Tracing per unit, Elo ability rating, speed/accuracy diagnosis (*True gap*, *Fast and trap-prone*, *Knows it, too slow*, *Solid*), adaptive weighting, Missed Bank spaced review, and a 3-question **Gap Closer** loop.
- **Troubleshooting & shortcuts:** Settings includes an in-browser **Run self-check** button verifying all 89 generators, 12 short rubrics, 266 lesson screens, 75-Q exam weights, Reg T swap traps, and `localStorage`. Keyboard: `F` focus mode, `T` dark theme, `1–4` / `A–D` answer, `Enter` / `→` next, `←` back.
- **Security ([SECURITY.md](SECURITY.md)):** Loopback-only bind, strict `script-src 'self'` CSP, single-header `Host` allowlist, Origin/`Sec-Fetch-Site` JSON-only POST checks, 64 KB body cap, thread-safe 30/min rate limiter, SSN PII rejection & client-side `[REDACTED-SSN]` scrubbing, symlink-contained `translate_path`, and RFC 9110 `Range` streaming for `.wav` and `.mp3`.

## Voice / Audio Clips

All curriculum audio is composed directly from `static/js/data/` so voice never drifts from text:

```powershell
# Re-compose all 340 per-screen lesson MP3 clips in parallel (needs models/kokoro-v1.0.onnx + voices-v1.0.bin)
python tools/compose_audio.py --lessons --workers 6

# Re-compose a single lesson screen clip
python tools/compose_audio.py --lessons --only u0-l1-s1 --force

# Re-compose the 15 overview / library / welcome WAV clips
python tools/compose_audio.py --force
```

## Verification

All checks run locally and in CI (`.github/workflows/compile.yml`):

```powershell
python tools/validate_content.py       # strict-JSON schema check on all 9 unit files
python tools/verify.py                 # split files + manifests + content integrity
python -m unittest tests.test_security -v
node tests/app.test.js                 # 89 generators, 42 lessons, router, 2026 rules, audio races
node tests/tests9.js                   # dual-theme WCAG contrast, zero color leaks, zero inline JS
node tests/ml_verify.js                # BKT + Elo + adaptive selection math
node tests/ui_enterprise.js            # calm study UI discipline
python tests/grammar_audit.py          # docs + codespell across all static JS/CSS/HTML/docs
powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1
```

## Layout

```
server.py                      # stdlib localhost server + /api/tts + WAV/MP3 Range streaming
security.py                    # validation, SSN PII checks, clip routing, rate limiter
tts_engine.py                  # Kokoro GPU / ONNX CPU / optional XTTS, atomic cache
SECURITY.md                    # localhost threat model & disclosure policy
ARCHITECTURE.md                # split-file architecture & runtime layers
static/
  index.html                   # zero-inline-script app shell
  css/app.css                  # light/dark tokens + calm study UI + Focus mode
  js/core/                     # util, store, audio, teacher, quiz
  js/data/                     # registry, units/unit-0..8, questions, short, library, overviews
  js/ui/                       # hash router + views
  js/app.js                    # boot, data-action delegation, keyboard shortcuts
  audio/                       # 15 overview/library WAVs + 340 lessons/*.mp3 Kokoro clips
tests/                         # load_app, app, tests9, test_security, ml_verify, ui_enterprise, grammar_audit
tools/                         # content_lib, validate_content, compose_audio, verify_dom/exhaustive/hell/bits
.github/workflows/             # compile.yml (CI) + pages.yml (GitHub Pages deploy)
```

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Abdulwahab Tibin.

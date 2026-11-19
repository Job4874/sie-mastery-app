# SIE Mastery

A single-file, offline-first study app for FINRA's **Securities Industry Essentials (SIE)** exam. It pairs a dynamic question bank with a teacher-style diagnosis loop, saved voice lessons, and a quiet institutional interface.

**Not affiliated with FINRA.** This is an educational study aid, not an official exam product. Always check the current FINRA content outline before you build a study plan.

## Run it

### Fast path: open the file

Clone or download the repository, then open:

```
static/index.html
```

in Edge, Chrome, or Safari. The lessons, quizzes, practice exam, and saved audio clips work directly from disk. Dynamic "speak" buttons fall back to the browser's speech voice when the local server is not running.

### Full path: local server and GPU voice

The server uses only the Python standard library for the app itself. GPU speech is optional.

```powershell
cd sie-mastery-app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

Then open `http://localhost:8765`.

Kokoro-82M runs on CUDA when PyTorch and the Kokoro package are installed, and falls back to CPU synthesis when they are not. Without any of those dependencies, the server still serves the app and the voice falls back to the browser. The app header shows whether the voice path is GPU or browser.

## What is in it

- **Curriculum mapped to the four FINRA SIE sections**
  - Section 1: Knowledge of Capital Markets, 16% (12 items)
  - Section 2: Understanding Products and Their Risks, 44% (33 items)
  - Section 3: Understanding Trading, Customer Accounts and Prohibited Activities, 31% (23 items)
  - Section 4: Overview of the Regulatory Framework, 9% (7 items)
- **8 units**, each with a detailed lesson, a saved voice clip, and a 5-question mini quiz. An 80% mini-quiz score clears the unit.
- **89 dynamic multiple-choice generators.** Numbers, prices, names, and scenarios are re-rolled per run, so the bank is not a fixed answer key.
- **12 short-response prompts** for Very Hard and Master levels, graded by a rubric that checks required concept groups, bound number/regulator pairs, and numeric tolerances.
- **Practice exam:** 75 questions, 105 minutes, 70% to pass, with the scored-item mix of 12 / 33 / 23 / 7. The live exam also contains 5 unscored pretest items; this simulation uses only the 75 scored-style items.
- **Teacher loop:** Bayesian knowledge tracing per unit, an Elo-style ability estimate, accuracy-plus-speed diagnosis, adaptive question selection, a Gap Closer re-drill, a Missed Bank, daily goal, and badges.
- **Dual theme:** dark and light, persisted in `localStorage` under `tibin_sie_theme`, with the `T` key as a shortcut.
- **15 saved WAV clips** (about 50 MB): 8 unit lessons, 6 Mastery Path lessons, and a welcome clip, generated with Kokoro-82M voice `af_heart`. Every clip is listed with its byte size in `static/audio/manifest.json`.

## Audio

Two paths, one voice at a time:

1. **Saved clips** play from `static/audio/` for the welcome, unit lessons, and Mastery Path. These work with no server and no network.
2. **Dynamic text** (questions, explanations, reports) goes to `POST /api/tts` when `server.py` is running. Kokoro synthesizes the line once and caches it in `tts_cache/<sha256>.wav`; repeated lines play from disk. If the server or GPU is unavailable, the app uses a female English browser voice and says so in the header.

The audio is intentionally saved as WAV so it plays everywhere without an external decoder. The tradeoff is repository size: the 15 clips total about 50 MB.

## Verification

Run these from the repository root:

```powershell
python tools/verify.py
node tests/tests9.js
node tests/bank.js
```

What each check covers:

- **`tests/tests9.js`** — 109 static checks of the single-file contract: token blocks, WCAG contrast in both themes, no raw color leaks, semantic regions, ARIA state, unique IDs, theme persistence, and the one-script-block rule.
- **`tests/bank.js`** — 60 checks against the real question bank: every generator is rolled 150 times and checked for four unique choices, a valid answer, no `NaN`/`undefined`, a valid section, and a unit/difficulty mapping; it also checks section pool sizes, unit pool sizes, `buildExam(75)` length and unique topics, the exact 12/33/23/7 exam mix over repeated runs, the 8 unit lessons, the 6 Mastery Path lessons, audio references, and the short-response rubric (including the swapped Reg T trap).
- **`tools/verify.py`** — build integrity: required files, exactly one `<script>` block, no emoji, no stale MP3 references, every referenced clip exists in the manifest with a matching byte size, and no orphan audio files.

The repository also includes `tools/audit_audio.py`, `tools/audit_markup.py`, and `tools/inspect_app.py` for focused audits. GitHub Actions is configured in `.github/workflows/compile.yml` to run the Python compile, JavaScript syntax check, verifier, and both Node test suites on push.

Last local verification before this documentation pass: `tests9` 109 passed, `bank` 60 passed, `verify` OK. The app was also checked in a real Chromium browser against `localhost:8765`: all six views (Home, Mastery Path, Units, Report, Quiz, Result), all 8 unit lessons and mini quizzes, Trap/Sprint/Exam sessions, the Missed Bank, the Gap Closer, both themes, and saved WAV playback.

## Known limitations

- The practice exam is a simulation. It does not include the live exam's 5 unscored pretest items, and it is not a source of real exam questions.
- Progress is stored in `localStorage` for one browser profile. There is no account, cloud sync, or telemetry.
- The local server adds security headers (CSP, frame denial, COOP/COEP/CORP, rate limiting, Host/Origin checks). Opening `static/index.html` directly gives you the same app but not those HTTP headers.
- GPU speech needs Python 3, PyTorch, Kokoro, and a working CUDA setup. The saved clips and browser voice remain available without them.
- Browser voice quality depends on the operating system and installed voices.
- The content is written for exam preparation and should be checked against the current FINRA outline: <https://www.finra.org/sites/default/files/2025-10/SIE_Content_Outline.pdf>.

## Layout

```
server.py                 # stdlib HTTP server, /api/health, /api/tts, security headers
tts_engine.py             # Kokoro-82M synthesis + content-hash disk cache
requirements.txt          # optional GPU TTS dependencies
static/index.html         # the entire app: markup, CSS, router, quiz engine, teacher, audio
static/audio/             # 15 saved WAV clips + manifest
tts_cache/                # generated TTS clips (git-ignored)
tests/tests9.js           # static DOM/CSS/theme audit
tests/bank.js             # question bank, curriculum, exam, and audio audit
tools/verify.py           # build integrity gate
tools/audit_audio.py      # manifest/reference/orphan audit
tools/audit_markup.py     # emoji, CSS class, ID, and handler audit
tools/inspect_app.py      # script extraction and structural counts
```

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Abdulwahab Tibin.

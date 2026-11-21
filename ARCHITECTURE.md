# SIE Mastery — Architecture (v6)

Zero-build, split-file web app that runs identically on localhost (`python server.py`), offline `file://` (double-click `static/index.html`), static hosting (GitHub Pages / Netlify / Cloudflare Pages), and self-hosted HTTPS servers (`HOSTING.md`). No npm, no bundler, no framework, no server-side learner state.

```
static/
  index.html                  App shell: top nav, <main id="app">, footer, toast (0 inline scripts/handlers)
  favicon.svg / favicon.ico   Vector + multi-size Windows icon
  css/app.css                 Calm editorial W3C-COGA UI: warm light + dark token blocks, Focus mode CSS
  js/
    core/util.js              Shared helpers (R, pick, shuffle, esc, $, plainText, redactSSN)
    core/store.js             Self-healing localStorage state (BKT, FSRS, ADHD patterns), prefs, JSON backup
    core/audio.js             AudioMan: genuine voice allocation, pause/resume, time telemetry, AbortController
    core/teacher.js           BKT + Elo + FSRS-DSR + ADHD error-pattern classifier + 12 Confusion Pairs + Accelerated Path
    core/quiz.js              Quiz/exam engine, FSRS due review, A/B contrast drill, qualifier highlights, Impulse Brake
    data/registry.js          SIE.registerUnit() + deterministic per-screen audio paths
    data/units/unit-0..8.js   42 step-through lessons / 266 screens (strict JSON inside registerUnit)
    data/questions.js         89 dynamic MC generators + topic/unit/difficulty maps + 5 difficulty levels
    data/extreme.js           33 Extremely Hard multi-step trap upgrades for normally easy exam topics
    data/short.js             12 short-response rubrics with clause-scoped regulator/role bindings
    data/library.js           6 "Why the rules exist" deep dives
    data/overviews.js         8 full-unit audio overviews
    ui/router.js              Hash router (#/learn, #/learn/unit/:u/lesson/:l/:s, #/practice, #/exam, ...)
    ui/views.js               Views: Learn + Accelerated Path, Unit, Lesson Audio Deck, Practice + Pairs, Progress + ADHD/FSRS, Settings
    app.js                    Boot, data-action click/change delegation, JSON export/import, keyboard shortcuts
  audio/
    *.wav + manifest.json     15 saved overview/library/welcome clips (24 kHz mono PCM_16)
    lessons/*.mp3 + manifest  340 per-screen Kokoro MP3 voice clips (165.3 min total verified audio)
```

## Runtime Layers

1. **Views & Router (`js/ui/router.js`, `js/ui/views.js`, `js/app.js`)**: Real hash routes with working browser Back/Forward history (`#/learn`, `#/learn/unit/3/lesson/2/4`, `#/practice`, `#/exam`, `#/progress`, `#/library`, `#/settings`). All controls route through `data-action` delegation so `server.py` enforces strict `script-src 'self'` CSP with zero `'unsafe-inline'`.
2. **Audio Manager (`js/core/audio.js`)**: Supports genuine multi-voice allocation. With default `af_heart`, every lesson screen plays its pre-composed Kokoro MP3 directly (`audio/lessons/u{U}-l{L}-s{S}.mp3`) across localhost, GitHub Pages, and `file://`. When a localhost learner selects **Bella (`af_bella`)**, **Michael (`am_michael`)**, or **Emma (`bf_emma`)**, `AudioMan.clip()` genuinely routes through `POST /api/tts` to synthesize live Kokoro audio in that chosen voice (with automatic seamless fallback to the static clip on error). Includes `togglePause()`, elapsed/duration telemetry, monotonic `gen` cancellation, and `AbortController`.
3. **Recursive ADHD ML Teacher (`js/core/teacher.js`)**:
   - **Corbett-Anderson BKT** per unit (`slip=0.10`, `guess=0.25`, `learn=0.12`)
   - **Elo ability rating** (`theta` in `600..1600`)
   - **FSRS-DSR spaced repetition** per topic (`D` in `[1,10]`, stability `S` in days, exact $R(S,S)=0.90$, lapse contraction, desirable-difficulty growth)
   - **ADHD Error-Pattern Classifier** (`impulsiveMiss`, `qualifierTrap`, `postErrorCascade`, `conceptGap`, `speedBottleneck`) + **12 FINRA Confusion Pairs** + **Accelerated 3-Step ADHD Path**
4. **Quiz Engine (`js/core/quiz.js`, `js/data/questions.js`, `js/data/extreme.js`, `js/data/short.js`)**: 89 dynamic MC generators (`16 / 33 / 32 / 8` across Sections 1–4), 33 Extremely Hard trap upgrades, 12 clause-bound short-response rubrics, FSRS Due Review (`mode="due"`), strictly alternating `A-B-A-B-A-B` Contrast Drills (`mode="contrast"`), XSS-safe negative-qualifier highlighting (`<mark class="qual">`), and post-fast-miss Impulse Brake cues.
5. **Storage (`js/core/store.js`)**: Strictly on-device `localStorage` with self-healing sanitizers (`cleanMissedMap`, `cleanLessonProgress`, `cleanFsrsMap`, `cleanPatterns`) and local JSON backup export/import (`exportProgressJson` / `importProgressJson`).

## Server, Audio Verification & CI

- **Localhost & Self-Hosted Server (`server.py`, `security.py`, `tts_engine.py`, `HOSTING.md`)**: Stdlib-only HTTP server defaulting strictly to loopback `127.0.0.1` (with explicit opt-in `SIE_BIND`, `SIE_ALLOWED_HOSTS`, `SIE_ALLOWED_ORIGINS`, `SIE_HTTPS` for reverse-proxy self-hosting), strict `script-src 'self'` CSP, single-header `Host` allowlist, same-origin JSON-only `POST /api/tts`, SSN PII rejection, symlink-contained `translate_path`, and RFC 9110 `Range` (`206` / `416`) streaming.
- **Audio Composition & Full 355-Clip Audit (`tools/compose_audio.py`, `tools/audit_audio.py`)**: Reads strict-JSON lesson files directly (`unit-0.js`..`unit-8.js`) and acoustically verifies every single MP3 and WAV clip (`24 kHz` mono, consistent loudness, speech pacing, zero corruption).
- **CI & Verification (`run_all.ps1`, `.github/workflows/compile.yml`, `.github/workflows/pages.yml`)**: Full 14-suite automated pipeline covering schema validation, unit/contrast/ML/FSRS/UI/grammar/security tests, 355-clip acoustic audit, Playwright DOM/exhaustive/chaos/asymmetric browser + hardware verification, and idempotent SHA-256 `bit_manifest.json` verification.

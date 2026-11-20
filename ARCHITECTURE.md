# SIE Mastery — Architecture

Zero-build, split-file web app that runs identically on localhost (`python server.py`), static hosting (GitHub Pages), and `file://` (double-click `static/index.html`). No npm, no bundler, no framework, no server-side state.

```
static/
  index.html                  App shell: top nav, <main id="app">, footer, toast (0 inline scripts/handlers)
  favicon.svg                 App icon
  css/app.css                 Calm study design: warm light default + dark theme tokens, Focus mode CSS
  js/
    core/util.js              Shared helpers (R, pick, shuffle, esc, $, plainText, redactSSN)
    core/store.js             Self-healing localStorage state + theme/focus/voice preferences
    core/audio.js             AudioMan: saved clip -> localhost /api/tts (GPU -> ONNX) -> browser voice
    core/teacher.js           BKT mastery, Elo ability, speed/accuracy diagnosis, adaptive sets, gaps
    core/quiz.js              Quiz & exam engine, timers, rubric grading, live self-check
    data/registry.js          SIE.registerUnit() + deterministic per-screen audio paths
    data/units/unit-0..8.js   42 step-through lessons / 266 screens (strict JSON inside registerUnit)
    data/questions.js         89 dynamic MC generators + topic/unit/difficulty maps + 5 difficulty levels
    data/extreme.js           33 Extremely Hard multi-step trap upgrades for normally easy exam topics
    data/short.js             12 short-response rubrics with clause-scoped regulator/role bindings
    data/library.js           6 "Why the rules exist" deep dives
    data/overviews.js         8 full-unit audio overviews
    ui/router.js              Hash router (#/learn, #/learn/unit/:u/lesson/:l/:s, #/practice, #/exam, ...)
    ui/views.js               Page views: Learn, Unit, Lesson Player, Practice, Exam, Progress, Library, Settings
    app.js                    Boot, data-action click/change delegation, keyboard shortcuts
  audio/
    *.wav + manifest.json     15 saved overview/library/welcome clips (24 kHz mono PCM_16)
    lessons/*.mp3 + manifest  340 per-screen Kokoro MP3 voice clips (works on GitHub Pages & file://)
```

## Runtime Layers

1. **Views & Router (`js/ui/router.js`, `js/ui/views.js`, `js/app.js`)**: Real hash routes with working browser Back/Forward history (`#/learn`, `#/learn/unit/3/lesson/2/4`, `#/practice`, `#/exam`, `#/progress`, `#/library`, `#/settings`). All buttons use `data-action` delegation so `server.py` enforces strict `script-src 'self'` without `'unsafe-inline'`.
2. **Audio Manager (`js/core/audio.js`)**: Every lesson screen plays its pre-composed Kokoro MP3 clip directly (`audio/lessons/u{U}-l{L}-s{S}.mp3`) so both localhost and public GitHub Pages learners get natural Kokoro narration. Dynamic speech (re-rolled quiz questions, explanations, progress report) uses `POST /api/tts` on localhost (Kokoro GPU -> Kokoro ONNX CPU, disk-cached) and automatically falls back to browser `speechSynthesis` when offline or on static hosting. Monotonic `gen` counter + `AbortController` prevent stale async responses from hijacking active clips.
3. **Quiz Engine (`js/core/quiz.js`, `js/data/questions.js`, `js/data/short.js`)**: 89 dynamic MC generators (`16 / 33 / 32 / 8` across Sections 1–4) + 12 rubric-graded short-response prompts with clause-scoped regulator/role bindings, negation guards, and client-side SSN redaction.
4. **ML Teacher (`js/core/teacher.js`)**: Bayesian Knowledge Tracing per unit (guess 25%, slip 10%, learn 12%) + Elo ability rating + accuracy/speed diagnosis (true gap / fast trap-prone / slow correct / solid) + adaptive weighting + 3-question Gap Closer loop.
5. **Storage (`js/core/store.js`)**: On-device `localStorage` only, with `cleanMissedMap`, `cleanLessonProgress`, and `loadStore` sanitizing corrupt payloads automatically.

## Server, Audio Composition & CI

- **Localhost Server (`server.py`, `security.py`, `tts_engine.py`)**: Stdlib-only HTTP server bound to `127.0.0.1`, strict `script-src 'self'` CSP, single-header `Host` allowlist, same-origin JSON-only `POST /api/tts`, SSN PII rejection, symlink-contained `translate_path`, and RFC 9110 `Range` (`206` / `416`) streaming for `.wav` and `.mp3`.
- **Audio Composition (`tools/content_lib.py`, `tools/compose_audio.py`)**: Reads strict-JSON lesson files directly (`unit-0.js`..`unit-8.js`) so audio clips cannot drift from screen text.
- **CI & Hosting**: `.github/workflows/compile.yml` runs Python compile, lesson schema validation, `node --check` on every JS file, `verify.py`, security probes, unit/contrast/ML/UI/grammar tests; `.github/workflows/pages.yml` deploys `static/` to GitHub Pages.

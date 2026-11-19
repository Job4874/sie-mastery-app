# SIE Mastery — Architecture

One local app, no build step, no framework, no external runtime dependency for the
core experience. The whole client is a single `static/index.html` with one `<script>`
block. The optional Python server adds GPU speech and HTTP hardening.

```
+---------------------------------------------------------------+
| UI (static/index.html)                                        |
| Home + coach  |  Mastery Path  |  Units  |  Teacher Report    |
| Quiz          |  Result        |  Gap Closer                  |
| One router: showView(id) controls all six top-level views.    |
+---------------------------------------------------------------+
| STATE                                                         |
| localStorage key "sie": XP, streak, per-section stats,         |
| teacher state, missed bank, open/closed gaps, cleared units,   |
| daily goal, badges. Theme key: "tibin_sie_theme".              |
+---------------------------------------------------------------+
| QUESTION / CURRICULUM ENGINE                                  |
| 89 dynamic MC generators + 12 short-response prompts.         |
| 8 units, each a lesson + 5-question mini quiz (80% clears).   |
| Practice exam: 75 items, 12/33/23/7 section mix, 70% pass.     |
| Every MC topic maps to a section (1-4), unit (1-8), and        |
| difficulty (1-3). Section tags follow the FINRA 2025 outline.  |
+---------------------------------------------------------------+
| TEACHER                                                       |
| Per answer: correctness + milliseconds + difficulty.           |
| -> Bayesian knowledge tracing per unit                        |
| -> Elo-style ability estimate                                 |
| -> Diagnosis: true gap / trap-prone / knows-it-slow / solid   |
| -> Adaptive selection targeting roughly 70% predicted success |
| -> Gap loop: miss -> micro-lesson -> 3 fresh questions ->      |
|    2 of 3 closes the gap -> spaced recheck                    |
+---------------------------------------------------------------+
| AUDIO                                                         |
| Saved WAV clips for fixed text (welcome, 8 unit lessons,      |
| 6 Mastery Path lessons). Dynamic text goes to POST /api/tts   |
| when the server is running: Kokoro-82M on CUDA, cached by     |
| content hash. Browser female English voice is the fallback.    |
| One clip at a time; a generation token prevents an in-flight   |
| fetch from speaking after navigation.                         |
+---------------------------------------------------------------+
| SERVER (optional, Python stdlib)                               |
| Static files + GET /api/health + POST /api/tts.               |
| Security headers: CSP, X-Frame-Options DENY, nosniff, HSTS,    |
| Referrer-Policy, Permissions-Policy, COOP, COEP, CORP.         |
| Input limits: 64 KB body, 1200-char text, voice allowlist,     |
| 30 requests/minute/IP, Host and Origin checks.                |
| tts_engine.py: Kokoro-82M, CUDA if available, CPU otherwise;   |
| every clip cached in tts_cache/<sha256>.wav.                   |
+---------------------------------------------------------------+
```

## Why one file

The app must open by double-clicking `static/index.html`, including on a machine with no
Python, no package install, and no network. That rules out a build step, a bundler, and
external scripts. The cost is that the markup, CSS, and JavaScript live together; the
benefit is a single artifact that can be copied, audited, and run anywhere.

## View routing

All six top-level views are fixed containers (`home`, `lessons`, `units`, `report`,
`quiz`, `result`). `showView(id)` hides every other view, stops audio, and scrolls to
the top. Every entry point (`showUnits`, `showUnitLesson`, `showReport`, `showLessons`,
`backHome`, `beginQuiz`, `startUnitQuiz`, `startGapClose`, `finish`, `quitQuiz`) goes
through it. This exists because the earlier version rendered a unit lesson while the
units container was still hidden; the "Continue where I left off" and "Lesson first"
paths looked dead even though the HTML had been written.

## Question and curriculum model

- `GEN` is an array of generator functions. Each returns a fresh question with a
  section, topic, stem, four choices, indexed answer, explanation, and rule.
- `UNIT_BY_TOPIC` and `DIFF_BY_TOPIC` map every topic to a curriculum unit and
  difficulty. `prepare()` attaches those to each generated question.
- `UNITS` defines the 8 lessons and their saved clips. `LESSONS` defines the 6
  Mastery Path items. `SHORT` defines the 12 constructed-response prompts.
- `buildExam(75)` draws unique topics by section weight (12/33/23/7), then fills any
  remainder from unused topics. It never cycles the same topic to fill a section.

## Teacher model

The teacher is deliberately local and inspectable. It does not call a model API. Each
answer updates:

- a per-unit Beta-style knowledge estimate with guess/slip assumptions;
- an Elo ability rating against the question difficulty;
- accuracy and average time, including fast-wrong and slow-right counts;
- the missed bank and any open gap for the topic.

The diagnosis combines accuracy and speed: repeated slow misses become a true gap,
fast misses become trap-prone guessing, and slow correct answers become knowledge
without speed. The Report screen exposes the numbers and a prescription per unit.

## Audio model

Fixed text is pre-generated, not synthesized on page load. The 15 WAV clips in
`static/audio/` are listed in `manifest.json` with exact byte sizes. `AudioMan.clip()`
plays one, and falls back to browser speech if the file cannot be decoded. Dynamic
text is queued through `AudioMan.enq()`; the queue fetches `/api/tts` and waits for
the current clip to end. A generation counter is bumped on every navigation, so a
slow response cannot start speaking after the user has moved to another screen.

The app no longer preloads all 15 clips on page load. That would move roughly 50 MB
before the user asks for audio; instead each clip is fetched when its Listen button is
pressed.

## Verification

- `tests/tests9.js` is a static DOM/CSS audit: tokens, contrast, raw colors, semantic
  attributes, ARIA, unique IDs, theme behavior, and the one-script rule.
- `tests/bank.js` executes the real generators and checks question shape, section and
  unit mapping, pool sizes for the 75-question exam, lesson/audio references, and the
  short-response rubric.
- `tools/verify.py` checks the build contract: required files, one script block, no
  emoji, no stale MP3 references, and exact audio manifest/reference/file parity.
- `tools/audit_audio.py`, `tools/audit_markup.py`, and `tools/inspect_app.py` are
  focused audits used during development.
- `.github/workflows/compile.yml` runs the Python compile, JavaScript syntax check,
  verifier, and both Node suites on push.

These are structural and content checks. They are not a substitute for a browser
render test, which is why the release pass also drives every view and quiz in a real
Chromium browser.

## Design rules

1. **Dynamic or it does not count.** Question numbers and scenarios are generated,
   never stored, so memorizing one run cannot game the teacher.
2. **The teacher owns the sequence.** The user picks a level; the teacher picks what
   to work on from measured accuracy, speed, and difficulty.
3. **A gap is closed by performance.** Re-drill the same concept with new numbers and
   require 2 of 3 correct, then recheck it later.
4. **Audio is a layer, not a gate.** Every core lesson has a saved clip, and the app
   remains fully usable with sound off.
5. **No fake claims.** Tests and documentation describe what is actually in the
   repository. The official exam facts come from FINRA's published outline.

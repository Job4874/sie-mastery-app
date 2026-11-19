# SIE Mastery — Architecture

One light localhost app, five clean layers. No build step, no framework, no server-side state.

```
┌─────────────────────────────────────────────────────────────┐
│ UI VIEWS (static/index.html)                                │
│ Zero→First Trade Primer • Home+Coach • Path Map • Lesson •  │
│ Quiz • Gap Session • Teacher Report • Exam • Results        │
├─────────────────────────────────────────────────────────────┤
│ AUDIO MANAGER                                               │
│ Saved clips (static/audio/*.wav, preloaded) for fixed text  │
│ + live TTS queue for dynamic text:                          │
│   localhost → POST /api/tts (Kokoro ONNX/GPU, disk-cached)   │
│   fallback  → browser speechSynthesis (circuit-broken after │
│   two TTS failures so a dead server is not hammered)        │
│ One voice at a time, queue never overlaps, stop on navigate │
├─────────────────────────────────────────────────────────────┤
│ QUIZ ENGINE                                                 │
│ 83 MC generators (numbers re-rolled per run) + 12 short-    │
│ response prompts (Very Hard / Master) with rubric grading:  │
│ concept groups + numeric tolerance + regulator-role binding │
├─────────────────────────────────────────────────────────────┤
│ ML TEACHER                                                  │
│ Per answer: correctness + milliseconds + difficulty         │
│ → BKT mastery per unit (guess/slip model)                   │
│ → Elo ability rating                                        │
│ → Diagnosis: TRUE GAP / trap-prone / knows-it-slow / solid  │
│ → Adaptive selection (~70% predicted-success targeting)     │
│ → GAP LOOP: gap detected → micro-lesson → worked example →  │
│   ascending re-drill (same concept, new numbers) → 2-of-3   │
│   closes the gap → spaced recheck in later quizzes          │
├─────────────────────────────────────────────────────────────┤
│ STORAGE (localStorage, on-device only)                      │
│ XP, streak, per-section stats, teacher state (mastery,      │
│ theta, badges, open/closed gaps, units cleared, daily goal) │
└─────────────────────────────────────────────────────────────┘
Server (server.py, stdlib only): static files + /api/health + /api/tts.
Security (security.py + server.py): loopback bind, Host allowlist, Origin and
Sec-Fetch-Site checks, JSON-only POST, 64 KB cap, thread-safe rate limit,
exact clip routing, atomic cache writes, generic error responses.
TTS engine (tts_engine.py): kokoro-onnx int8 (af_heart) by default, torch
Kokoro or XTTS v2 optional; every synthesized clip cached in tts_cache/ by
content hash. tools/compose_audio.py rebuilds static/audio/*.wav from the
curriculum text in index.html and refreshes manifest byte sizes.
CI (.github/workflows/compile.yml): py_compile + node --check + verify.py +
tests/test_security.py + tests/app.test.js + tests/tests9.js on every push.
```

## Design rules
1. **Dynamic or it doesn't count** — question numbers/names are generated, never stored, so memorizing answers can't game the teacher's data.
2. **The teacher owns the sequence** — the user picks a level; the teacher picks what to work on, from measured gaps, not vibes.
3. **A gap isn't closed by exposure** — only by performance: re-drill the same concept with new numbers until 2 of 3 are right, then re-verify it later (spaced recheck via adaptive weighting).
4. **Audio is a layer, not a feature** — every screen's core text can be spoken; fixed text ships as saved clips, dynamic text goes through the TTS queue.
5. **Short answers at high levels** — multiple choice can be gamed by recognition; at Very Hard and Master, the user must produce the rule (rubric-graded), which is what exposes a true gap.

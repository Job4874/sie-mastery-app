# SIE Mastery Workspace Rules

These rules apply across `sie-mastery-app` (canonical branch: `main`). Keep changes minimal, verifiable, and faithful to the zero-build split-file architecture.

## Architecture Invariants

- **Zero-build split frontend**: Keep `static/index.html` as a clean app shell (`0` inline `<script>` blocks, `0` inline `onclick` handlers) loading `static/css/app.css` and classic deferred scripts under `static/js/{core,data,ui}/` plus `static/js/app.js`, so the app runs identically on `python server.py`, GitHub Pages (`.github/workflows/pages.yml`), and `file://` without npm or bundlers.
- **Learning-first UX & calm visual hierarchy**: Keep warm light theme (`data-theme="light"`) as default with dark theme toggle (`T`), Focus mode (`F`), readable `17px/1.6` system UI type, single calm accent color, sentence case chrome (no CSS ALL-CAPS transforms), real hash URLs (`#/learn`, `#/learn/unit/:u/lesson/:l/:s`, `#/practice`, `#/exam`, `#/progress`, `#/library`, `#/settings`), and **Settings** as the home for voice/engine/self-check controls.
- **Strict CSP & event delegation**: Route UI interactions through `data-action` attributes in `static/js/app.js` so `server.py` enforces strict `script-src 'self'` without `'unsafe-inline'`.
- **Stdlib-only web layer**: Keep `server.py` and `security.py` strictly on the Python standard library. Do not reintroduce module-level `os.chdir(STATIC)`; preserve `Handler(..., directory=str(STATIC))`.
- **No external JS/CSS**: All styling uses local CSS variables in `static/css/app.css`, and all learner state stays on-device in `localStorage`.

## FINRA & SEC Domain Accuracy

- **Valid SIE sections (`1..4`) & 5 difficulty tiers**: Every entry in `GEN` (`static/js/data/questions.js`) must return `sec` in `{1, 2, 3, 4}`. `buildExam(75)` must always yield `75` unique question stems weighted `12 / 33 / 23 / 7` (`16% / 44% / 31% / 9%`) across all 5 difficulty tiers (`easy`, `standard`, `hard`, `veryhard`, `extreme`). Every `topic` string in `GEN` and `SHORT` must exist in both `UNIT_BY_TOPIC` and `DIFF_BY_TOPIC`. Every `diff: 1` topic must have a hardened trap upgrade in `EXTREME_GEN` (`static/js/data/extreme.js`) so Extremely Hard mode ships zero softball questions.
- **Step-through curriculum schema**: Keep Units 0–8 in `static/js/data/units/unit-0.js`..`unit-8.js` as strict JSON inside `SIE.registerUnit({...});`, validated by `python tools/validate_content.py`.
- **Reg BI vs. suitability**: Cite **SEC Rule 15l-1** under the Exchange Act for Regulation Best Interest, and **FINRA Rule 2111** for non-Reg BI suitability. Never cite FINRA Rule 2210 (Communications with the Public) for Reg BI.
- **Gifts vs. business entertainment**: Cite **FINRA Rule 3220** (`$300` per person per year gift limit effective March 30, 2026 under FINRA Notice 26-05) and note that ordinary, reasonable business entertainment attended by the representative is not subject to the gift limit. Never cite FINRA Rule 3230 (Telemarketing) for gifts.
- **Cash account violations**: Distinguish **freeriding** (Regulation T, 12 CFR 220.8(c) — a single violation triggers a `90`-calendar-day settled-funds restriction unless paid in full by settlement) from **good-faith violations** (three GFVs within `12` months trigger the `90`-day restriction).
- **Short-response bindings**: Rubric `bind` rules in `static/js/data/short.js` (such as Reg T `50%` / Federal Reserve / `initial` vs. `25%` / FINRA / `maintenance`) must bind numbers, regulators, and role words within the same clause with negation guards so swapped or negated pairs score `wrong`.
- **Focus mode & state resilience**: Preserve `data-adhd="focus"` (`tibin_sie_adhd`), voice rate persistence, `nextQ()` `!answered` guard, mobile double-click bleed-through guard, `cleanMissedMap()` / `cleanLessonProgress()` `localStorage` sanitization, `esc()` HTML escaping on dynamic feedback, and `runSelfCheck()`.

## Audio & Streaming Invariants

- **Fallback chain (keep in code)**: Saved Kokoro clips (`static/audio/lessons/*.mp3`, `static/audio/*.wav`) -> localhost `POST /api/tts` (Kokoro GPU -> ONNX CPU) -> browser `speechSynthesis`, skipping `/api/health` probes automatically on non-localhost hosts (GitHub Pages / `file://`).
- **`AudioMan` cancellation**: Preserve the monotonic `gen` counter, `AbortController` cancellation on in-flight `/api/tts` fetches, and `audio.onended`/`audio.onerror` clearing inside `AudioMan.stop()` so stale async requests cannot hijack active clips.
- **Readiness reporting**: `tts_engine.engine_ready()` must accurately report whether local model files exist; `/api/health` exposes `"ready"` and Settings/footer reflect voice availability cleanly.
- **Saved audio sync**: Whenever text inside `static/js/data/units/unit-*.js` changes, regenerate the modified per-screen MP3 via `python tools/compose_audio.py --lessons --only <stem> --force` and refresh `static/audio/lessons/manifest.json`. Whenever overview/library text changes, regenerate the WAV via `python tools/compose_audio.py --only <stem> --force` and refresh `static/audio/manifest.json`.

## Security & HTTP Invariants

- Preserve loopback `127.0.0.1` binding (never expose open ports), strict single-header `Host` allowlist (`len(hosts) == 1`, `421` otherwise), `ORIGINS` and `Sec-Fetch-Site` mutation checks (`403`), JSON-only `POST /api/tts` (`415`), `64 KB` body cap (`413`), SSN PII rejection (`security.valid_text` / `redact_pii`) plus client-side `[REDACTED-SSN]` scrubbing in `answerShort()`, and exact `32`-hex clip routing (see `SECURITY.md`).
- Keep `Handler.translate_path` symlink containment inside `STATIC`, `do_HEAD`, explicit `405` (`Allow: GET, HEAD, POST`), backslash blocking, normalized path checks without directory `301` redirects, and `RateLimiter` `Retry-After` computed with `math.ceil(self.window - (now - hits[0]))` against the oldest active hit.
- Keep atomic `.tmp` to `os.replace` cache writes in `tts_engine.py` and RFC 9110 case-insensitive single-byte `Range` (`206` / `416`) streaming in `server.py` for `/tts/<id>.wav`, `/audio/<name>.wav`, and `/audio/lessons/<name>.mp3`.

## Verification Gate

- Before committing any change, run the full 12-suite verification pipeline via the `sie-verify` skill (`powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1`) and ensure `codespell`, Playwright DOM/exhaustive/chaos checks (`tools/verify_hell.py`, `0` console errors), idempotent `413`-hash `tools/bit_manifest.json` verification, and clean port teardown (`PORT 8765` closed) all pass.

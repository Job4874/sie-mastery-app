# SIE Mastery Workspace Rules

These rules apply across `sie-mastery-app`. Keep changes minimal, verifiable, and faithful to the zero-build architecture.

## Architecture Invariants

- **Zero-build frontend**: Keep all application markup, styles, and JavaScript inside `static/index.html` without introducing npm dependencies, bundlers, or external CDN assets.
- **Stdlib-only web layer**: Keep `server.py` and `security.py` strictly on the Python standard library. Do not reintroduce module-level `os.chdir(STATIC)`; preserve `Handler(..., directory=str(STATIC))`.
- **No external JS/CSS**: All styling uses local CSS variables in `static/index.html` (`:root[data-theme="dark"]` and `:root[data-theme="light"]`), and all runtime state stays on-device in `localStorage`.

## FINRA & SEC Domain Accuracy

- **Valid SIE sections (`1..4`)**: Every entry in `GEN` must return `sec` in `{1, 2, 3, 4}`. `buildExam(75)` must always yield `75` unique question stems weighted `12 / 33 / 23 / 7` (`16% / 44% / 31% / 9%`). Every `topic` string in `GEN` and `SHORT` must exist in both `UNIT_BY_TOPIC` and `DIFF_BY_TOPIC`.
- **Reg BI vs. suitability**: Cite **SEC Rule 15l-1** under the Exchange Act for Regulation Best Interest, and **FINRA Rule 2111** for non-Reg BI suitability. Never cite FINRA Rule 2210 (Communications with the Public) for Reg BI.
- **Gifts vs. business entertainment**: Cite **FINRA Rule 3220** (`$300` per person per year gift limit effective March 30, 2026 under FINRA Notice 26-05) and note that ordinary, reasonable business entertainment attended by the representative is not subject to the gift limit. Never cite FINRA Rule 3230 (Telemarketing) for gifts.
- **Cash account violations**: Distinguish **freeriding** (Regulation T, 12 CFR 220.8(c) — a single violation triggers a `90`-calendar-day settled-funds restriction unless paid in full by settlement) from **good-faith violations** (three GFVs within `12` months trigger the `90`-day restriction).
- **Short-response bindings**: Rubric `bind` rules (such as Reg T `50%` / Federal Reserve / `initial` vs. `25%` / FINRA / `maintenance`) must bind numbers, regulators, and role words within the same clause (`/\.!?;]+|\b(?:and|while|whereas|but)\b/`) with negation guards so swapped or negated pairs score `wrong`.
- **ADHD Focus & state resilience**: Preserve `#adhdToggle` (`data-adhd="focus"` / `tibin_sie_adhd`), `renderLessonBody()` micro-chunking across both `#units` and `#lessons`, `#voiceRate` playback persistence, `nextQ()` `!answered` guard, `cleanMissedMap()` `localStorage` sanitization, `esc()` HTML escaping on dynamic feedback, and `runSelfCheck()`.

## Audio & Streaming Invariants

- **`AudioMan` cancellation**: Preserve the monotonic `gen` counter, `AbortController` cancellation on in-flight `/api/tts` fetches, and `audio.onended`/`audio.onerror` clearing inside `AudioMan.stop()` so stale async requests cannot hijack saved clips.
- **Readiness reporting**: `tts_engine.engine_ready()` must accurately report whether local model files exist; `/api/health` exposes `"ready"`, and `#gpuPill` in `static/index.html` falls back to `"Voice: browser (local TTS unavailable)"` whenever `ready === false` or `"missing"` appears in `engine`.
- **Saved audio sync**: Whenever text inside `UNITS` or `LESSONS` changes, regenerate the corresponding WAV via `python tools/compose_audio.py --only <stem> --force` and refresh `static/audio/manifest.json` via `python tools/compose_audio.py --manifest-only`.

## Security & HTTP Invariants

- Preserve loopback `127.0.0.1` binding, strict single-header `Host` allowlist (`len(hosts) == 1`, `421` otherwise), `ORIGINS` and `Sec-Fetch-Site` mutation checks (`403`), JSON-only `POST /api/tts` (`415`), `64 KB` body cap (`413`), SSN PII rejection (`security.valid_text` / `redact_pii`) plus client-side `[REDACTED-SSN]` scrubbing in `answerShort()`, and exact `32`-hex clip routing (see `SECURITY.md`).
- Keep `Handler.translate_path` symlink containment inside `STATIC`, `do_HEAD`, explicit `405` (`Allow: GET, HEAD, POST`), backslash blocking, normalized path checks without directory `301` redirects, and `RateLimiter` `Retry-After` computed with `math.ceil(self.window - (now - hits[0]))` against the oldest active hit.
- Keep atomic `.tmp` to `os.replace` cache writes in `tts_engine.py` and RFC 9110 case-insensitive single-byte `Range` (`206` / `416`) streaming in `server.py` for `/tts/<id>.wav` and `/audio/<name>.wav`.

## Verification Gate

- Before committing any change, run the full 12-suite verification pipeline via the `sie-verify` skill (`powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1`) and ensure `codespell`, Playwright DOM/exhaustive/chaos checks (`tools/verify_hell.py`, `0` console errors), and idempotent 43-hash `tools/bit_manifest.json` verification all pass.

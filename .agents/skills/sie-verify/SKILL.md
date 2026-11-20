---
name: sie-verify
description: >-
  Runs the complete 13-suite SIE Mastery verification pipeline (Python compile,
  JS syntax, strict-JSON lesson schema, unit/ML/UI/theme tests, security probes,
  grammar/codespell audit, headless/headed Playwright DOM/mobile/chaos/asymmetric
  browser+hardware checks, and idempotent 416-hash SHA-256 bit-manifest validation).
  Use this skill when verifying, auditing, or preparing commits in sie-mastery-app.
---

# SIE Mastery Verification Pipeline

Run the automated 13-suite pipeline before committing changes or pushing to GitHub.

## Steps

1. Execute the bundled helper script from the repository root:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1
   ```
   Script location: [run_all.ps1](./scripts/run_all.ps1)

2. Confirm all 13 checks pass cleanly:
   - **Static & Unit (Suites 1–8)**: `py_compile`, `tools/validate_content.py` (strict-JSON schema on `unit-0.js`..`unit-8.js`), `node --check` on every split file under `static/js/**/*.js`, `tests/app.test.js`, `tests/tests9.js`, `tests/ml_verify.js`, `tests/ui_enterprise.js`, `tools/verify.py`, `tests/grammar_audit.py` (including `codespell`), and `unittest` (`tests/test_security.py`).
   - **Live Localhost Server (Suites 9–13)**: The script launches `python server.py` on `127.0.0.1:8765` (or an ephemeral free loopback port via `PORT` / `SIE_BASE` if `8765` is busy), waits for `/api/health`, runs `tools/verify_dom.py`, `tools/verify_exhaustive.py`, `tools/verify_hell.py`, and `tools/verify_asymmetric.py` (real `<audio>` decode, uncached Kokoro ONNX hardware synthesis + PCM RMS energy, visual RGB pixel-diff & DOM `elementFromPoint` hit-testing, positive/negative BKT/Elo/Reg T grading asymmetry, Easy vs. Extremely Hard asymmetry, and live HTTP security rejections `421`/`403`/`415`/`400`/`206`), then runs `tools/verify_bits.py` twice to verify the `416`-hash `tools/bit_manifest.json` is byte-identical across runs and stops the server cleanly in `finally`.
   - For a full **headed Chromium + Windows Desktop/Start shortcut cold-boot** hardware run: `python tools/verify_asymmetric.py --headed`.

3. If any tracked source file or audio asset changed, verify `git diff -- tools/bit_manifest.json` reflects only expected updates and commit `tools/bit_manifest.json` alongside your changes.

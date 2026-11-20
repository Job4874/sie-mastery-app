---
name: sie-verify
description: >-
  Runs the complete 12-suite SIE Mastery verification pipeline (Python compile,
  JS syntax, strict-JSON lesson schema, unit/ML/UI/theme tests, security probes,
  grammar/codespell audit, headless Playwright DOM/mobile/chaos checks, and
  idempotent 415-hash SHA-256 bit-manifest validation). Use this skill when
  verifying, auditing, or preparing commits in sie-mastery-app.
---

# SIE Mastery Verification Pipeline

Run the automated 12-suite pipeline before committing changes or pushing to GitHub.

## Steps

1. Execute the bundled helper script from the repository root:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .agents/skills/sie-verify/scripts/run_all.ps1
   ```
   Script location: [run_all.ps1](./scripts/run_all.ps1)

2. Confirm all 12 checks pass cleanly:
   - **Static & Unit (Suites 1–8)**: `py_compile`, `tools/validate_content.py` (strict-JSON schema on `unit-0.js`..`unit-8.js`), `node --check` on every split file under `static/js/**/*.js`, `tests/app.test.js`, `tests/tests9.js`, `tests/ml_verify.js`, `tests/ui_enterprise.js`, `tools/verify.py`, `tests/grammar_audit.py` (including `codespell`), and `unittest` (`tests/test_security.py`).
   - **Live Localhost Server (Suites 9–12)**: The script launches `python server.py` on `127.0.0.1:8765` (or an ephemeral free loopback port via `PORT` / `SIE_BASE` if `8765` is busy), waits for `/api/health`, runs `tools/verify_dom.py`, `tools/verify_exhaustive.py`, and `tools/verify_hell.py` (`0` console/page/HTTP errors across desktop and mobile, covering hash routing, step-through lesson player MP3s, 5 difficulty tiers including Extremely Hard 75:00 exam and bonus trap checks, Focus mode, chaos rage-clicks, and corrupted storage recovery), and runs `tools/verify_bits.py` twice to verify the `415`-hash `tools/bit_manifest.json` (tracked source + `15` overview WAVs + `340` per-screen lesson MP3s) is byte-identical across runs, then stops the server cleanly in `finally`.

3. If any tracked source file or audio asset changed, verify `git diff -- tools/bit_manifest.json` reflects only expected updates and commit `tools/bit_manifest.json` alongside your changes.
